package atlas4me.service.inference;

import java.util.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import atlas4me.entity.CountryFeature;
import atlas4me.repository.CountryFeatureRepository;

/**
 * Carrega a tabela {@code country_features} (País × Pergunta → Booleano) inteira
 * em memória uma única vez na inicialização da aplicação.
 *
 * Expõe índices invertidos otimizados para o {@link InferenceEngine} e mapas
 * de prioridade de categoria para desempate inteligente.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KnowledgeBaseCache {

    private final CountryFeatureRepository countryFeatureRepository;

    // Índice invertido por pergunta → países que respondem SIM
    private final Map<Long, Set<Long>> questionToTrueCountries = new HashMap<>();

    // Índice invertido por pergunta → países que respondem NÃO
    private final Map<Long, Set<Long>> questionToFalseCountries = new HashMap<>();

    // Matriz completa: país → pergunta → booleano
    private final Map<Long, Map<Long, Boolean>> countryQuestionMatrix = new HashMap<>();

    // Prioridade numérica de cada pergunta, pré-calculada na carga (evita recálculo por partida)
    private final Map<Long, Integer> questionPriorities = new HashMap<>();

    // Conjunto de todas as perguntas indexadas
    private final Set<Long> allQuestionIds = new HashSet<>();

    // Índice de ISO codes por pergunta → países que respondem SIM (utilizado pelo frontend)
    private final Map<Long, List<String>> questionToTrueIsoCodes = new HashMap<>();

    /**
     * Carrega todas as features do banco em memória ao iniciar a aplicação.
     * Constrói os índices invertidos e a matriz completa em uma única passagem sobre os dados.
     */
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
            // putIfAbsent evita recalcular a prioridade para a mesma pergunta em múltiplas features
            questionPriorities.putIfAbsent(questionId, calculateCategoryPriority(category));

            if (isTrue) {
                questionToTrueCountries.computeIfAbsent(questionId, k -> new HashSet<>()).add(countryId);
                questionToTrueIsoCodes.computeIfAbsent(questionId, k -> new ArrayList<>()).add(isoCode);
            } else {
                questionToFalseCountries.computeIfAbsent(questionId, k -> new HashSet<>()).add(countryId);
            }

            countryQuestionMatrix.computeIfAbsent(countryId, k -> new HashMap<>()).put(questionId, isTrue);
        }

        log.info("Cérebro carregado! {} perguntas, {} features indexadas na RAM.",
                allQuestionIds.size(), allFeatures.size());
    }

    /**
     * Define o peso numérico da categoria para desempate de perguntas com IG igual.
     * Maior valor = maior prioridade na seleção.
     *
     * @param category nome da categoria em português (case-insensitive).
     * @return valor numérico de prioridade; 0 para categorias desconhecidas.
     */
    private int calculateCategoryPriority(String category) {
        if (category == null) return 0;

        return switch (category.toUpperCase()) {
            case "GEOGRAFIA"            -> 90;
            case "DEMOGRAFIA"           -> 80;
            case "POLITICA", "POLÍTICA" -> 70;
            case "ECONOMIA"             -> 60;
            case "LINGUAGEM"            -> 50;
            case "RELIGIAO", "RELIGIÃO" -> 40;
            case "CULTURA"              -> 30;
            case "HISTORIA", "HISTÓRIA" -> 20;
            case "BANDEIRA"             -> 10;
            default                     -> 0;
        };
    }

    // -------------------------------------------------------------------------
    // API pública
    // -------------------------------------------------------------------------

    /**
     * IDs dos países que respondem SIM à pergunta, em O(1).
     *
     * @param questionId ID da pergunta.
     * @return conjunto de IDs; conjunto vazio se a pergunta não estiver indexada.
     */
    public Set<Long> getTrueCountries(Long questionId) {
        return questionToTrueCountries.getOrDefault(questionId, Collections.emptySet());
    }

    /**
     * IDs dos países que respondem NÃO à pergunta, em O(1).
     *
     * @param questionId ID da pergunta.
     * @return conjunto de IDs; conjunto vazio se a pergunta não estiver indexada.
     */
    public Set<Long> getFalseCountries(Long questionId) {
        return questionToFalseCountries.getOrDefault(questionId, Collections.emptySet());
    }

    /**
     * Prioridade de desempate da pergunta baseada em sua categoria.
     *
     * @param questionId ID da pergunta.
     * @return valor numérico de prioridade; 0 se não indexada.
     */
    public int getQuestionPriority(Long questionId) {
        return questionPriorities.getOrDefault(questionId, 0);
    }

    /**
     * Conjunto imutável com todos os IDs de perguntas indexados no cache.
     *
     * @return conjunto somente-leitura de IDs de perguntas.
     */
    public Set<Long> getAllQuestionIds() {
        return Collections.unmodifiableSet(allQuestionIds);
    }

    /**
     * ISO Codes dos países que respondem SIM à pergunta, em O(1).
     * Utilizado pelo frontend para colorir o globo interativo.
     *
     * @param questionId ID da pergunta.
     * @return lista de ISO codes; lista vazia se a pergunta não estiver indexada.
     */
    public List<String> getIsoCodesForTrueAnswers(Long questionId) {
        return questionToTrueIsoCodes.getOrDefault(questionId, Collections.emptyList());
    }

    /**
     * Resposta booleana de um país para uma pergunta específica.
     *
     * @param countryId  ID do país.
     * @param questionId ID da pergunta.
     * @return {@code true} se o país responde SIM; {@code false} se NÃO
     *         ou se a combinação não estiver indexada.
     */
    public boolean getAnswer(Long countryId, Long questionId) {
        return countryQuestionMatrix
                .getOrDefault(countryId, Collections.emptyMap())
                .getOrDefault(questionId, false);
    }

    /**
     * Mapa completo country → question → boolean.
     * Exposto para o {@link atlas4me.service.GameService} manter compatibilidade
     * com {@code getRemainingCountries}.
     *
     * @return mapa somente-leitura da matriz de features.
     */
    public Map<Long, Map<Long, Boolean>> getCountryQuestionMatrix() {
        return Collections.unmodifiableMap(countryQuestionMatrix);
    }
}