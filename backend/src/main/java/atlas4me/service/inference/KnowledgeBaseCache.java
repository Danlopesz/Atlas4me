package atlas4me.service.inference;

import atlas4me.entity.CountryFeature;
import atlas4me.repository.CountryFeatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import java.util.*;

/**
 * Carrega a tabela country_features (País × Pergunta → Booleano) inteira
 * em memória uma única vez na inicialização da aplicação.
 *
 * Expõe índices invertidos otimizados para o InferenceEngine e mapas
 * de prioridade de categoria para desempate inteligente.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KnowledgeBaseCache {

    private final CountryFeatureRepository countryFeatureRepository;

    // Índice invertido por pergunta → Set de países que respondem SIM
    private final Map<Long, Set<Long>> questionToTrueCountries = new HashMap<>();

    // Índice invertido por pergunta → Set de países que respondem NÃO
    private final Map<Long, Set<Long>> questionToFalseCountries = new HashMap<>();

    // Mapa completo: país → pergunta → booleano (compatível com GameService
    // existente)
    private final Map<Long, Map<Long, Boolean>> countryQuestionMatrix = new HashMap<>();

    // Mapa de prioridade das perguntas baseado na categoria (usado para desempate)
    private final Map<Long, Integer> questionPriorities = new HashMap<>();

    // Conjunto de todas as perguntas indexadas
    private final Set<Long> allQuestionIds = new HashSet<>();

    // Índice otimizado para a UI
    private final Map<Long, List<String>> questionToTrueIsoCodes = new HashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void initCache() {
        log.info("Iniciando carregamento da Base de Conhecimento em memória...");
        List<CountryFeature> allFeatures = countryFeatureRepository.findAll();

        for (CountryFeature feature : allFeatures) {
            Long questionId = feature.getQuestion().getId();
            Long countryId = feature.getCountry().getId();
            boolean isTrue = feature.getIsTrue();
            String category = feature.getQuestion().getCategory();
            String isoCode = feature.getCountry().getIsoCode();

            allQuestionIds.add(questionId);

            // Calcula e armazena a prioridade da pergunta (putIfAbsent evita recálculo)
            questionPriorities.putIfAbsent(questionId, calculateCategoryPriority(category));

            // Índice invertido (usado pelo InferenceEngine)
            if (isTrue) {
                questionToTrueCountries
                        .computeIfAbsent(questionId, k -> new HashSet<>())
                        .add(countryId);

                // Popula o índice de ISO codes para o frontend
                questionToTrueIsoCodes
                        .computeIfAbsent(questionId, k -> new ArrayList<>())
                        .add(isoCode);
            } else {
                questionToFalseCountries
                        .computeIfAbsent(questionId, k -> new HashSet<>())
                        .add(countryId);
            }

            // Matriz completa (usado pelo GameService para filtrar e auditar)
            countryQuestionMatrix
                    .computeIfAbsent(countryId, k -> new HashMap<>())
                    .put(questionId, isTrue);
        }

        log.info("Cérebro carregado! {} perguntas, {} features indexadas na RAM.",
                allQuestionIds.size(), allFeatures.size());
    }

    /**
     * Define o peso numérico da categoria (maior = mais prioritário).
     * Utiliza switch expression do Java 21.
     */
    private int calculateCategoryPriority(String category) {
        if (category == null)
            return 0;

        return switch (category.toUpperCase()) {
            case "GEOGRAFIA" -> 90;
            case "DEMOGRAFIA" -> 80;
            case "POLITICA", "POLÍTICA" -> 70;
            case "ECONOMIA" -> 60;
            case "LINGUAGEM" -> 50;
            case "RELIGIAO", "RELIGIÃO" -> 40;
            case "CULTURA" -> 30;
            case "HISTORIA", "HISTÓRIA" -> 20;
            case "BANDEIRA" -> 10;
            default -> 0;
        };
    }

    // --- API de Cache para a UI ---

    /**
     * Retorna a lista de ISO Codes dos países que respondem SIM à pergunta em tempo
     * O(1).
     */
    public List<String> getIsoCodesForTrueAnswers(Long questionId) {
        return questionToTrueIsoCodes.getOrDefault(questionId, Collections.emptyList());
    }

    // --- API para o InferenceEngine ---

    /** IDs dos países que respondem SIM à pergunta. */
    public Set<Long> getTrueCountries(Long questionId) {
        return questionToTrueCountries.getOrDefault(questionId, Collections.emptySet());
    }

    /** IDs dos países que respondem NÃO à pergunta. */
    public Set<Long> getFalseCountries(Long questionId) {
        return questionToFalseCountries.getOrDefault(questionId, Collections.emptySet());
    }

    /** Retorna a prioridade da pergunta baseada em sua categoria. */
    public int getQuestionPriority(Long questionId) {
        return questionPriorities.getOrDefault(questionId, 0);
    }

    /** Conjunto imutável com todos os IDs de perguntas indexados. */
    public Set<Long> getAllQuestionIds() {
        return Collections.unmodifiableSet(allQuestionIds);
    }

    // --- API para o GameService (compatibilidade com lógica existente) ---

    /**
     * Resposta booleana de um país para uma pergunta específica.
     * Retorna false se a combinação não estiver no banco.
     */
    public boolean getAnswer(Long countryId, Long questionId) {
        return countryQuestionMatrix
                .getOrDefault(countryId, Collections.emptyMap())
                .getOrDefault(questionId, false);
    }

    /**
     * Mapa completo country → question → boolean.
     * Exposto para o GameService manter compatibilidade com getRemainingCountries.
     */
    public Map<Long, Map<Long, Boolean>> getCountryQuestionMatrix() {
        return Collections.unmodifiableMap(countryQuestionMatrix);
    }
}
