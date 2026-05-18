package atlas4me.service.inference;

import java.util.HashSet;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Motor de inferência puro (stateless): seleciona a próxima pergunta
 * com maior Ganho de Informação baseado na Entropia de Shannon.
 *
 * Não acessa banco de dados — opera exclusivamente sobre o {@link KnowledgeBaseCache}.
 * Todos os métodos são funções puras: dado o mesmo {@link GameState}, sempre retornam
 * o mesmo resultado (sem efeitos colaterais).
 *
 * Fórmula:
 * H(S) = log₂(|S|) (entropia uniforme)
 * IG(Q) = H(S) − [p(sim)·H(S_sim) + p(não)·H(S_não)]
 * Melhor pergunta = argmax IG(Q), desempate por prioridade de categoria
 */
@Service
@RequiredArgsConstructor
public class InferenceEngine {

    private final KnowledgeBaseCache cache;

    /**
     * Seleciona a próxima pergunta com maior Ganho de Informação.
     * Em empate de IG, vence a categoria prioritária (GEOGRAFIA > BANDEIRA).
     * Em empate total, sorteia aleatoriamente para variar as partidas.
     *
     * @param state estado imutável da rodada (candidatos + perguntas já feitas).
     * @return ID da melhor pergunta, ou {@code null} se candidatos ≤ 1
     *         ou todas as perguntas já foram realizadas.
     */
    public Long selectBestQuestion(GameState state) {
        Set<Long> candidates = state.currentCandidates();
        int total = candidates.size();

        if (total <= 1) {
            return null; // Condição de parada: pronto para palpite. 
        }

        Long bestQuestionId = null;
        double maxIG = -1.0;
        int bestPriority = -1;
        double currentEntropy = shannonEntropy(total);

        for (Long questionId : cache.getAllQuestionIds()) {
            // Ignora perguntas já feitas nesta sessão
            if (state.askedQuestions().contains(questionId)) {
                continue;
            }

            // Obrigatório criar cópia — retainAll modifica a coleção in-place
            Set<Long> yesGroup = new HashSet<>(candidates);
            yesGroup.retainAll(cache.getTrueCountries(questionId));

            int countYes = yesGroup.size();
            int countNo = total - countYes;

            // Pergunta inútil: não divide o grupo → IG = 0, pula
            if (countYes == 0 || countNo == 0) {
                continue;
            }

            // Entropia esperada após a resposta (média ponderada)
            double expectedEntropy = ((double) countYes / total) * shannonEntropy(countYes)
                    + ((double) countNo / total) * shannonEntropy(countNo);

            double ig = currentEntropy - expectedEntropy;
            int priority = getCategoryPriority(questionId);

            // Elege por maior IG; em empate matemático, vence a categoria prioritária
            if (ig > maxIG || (ig == maxIG && priority > bestPriority)) {
                maxIG = ig;
                bestPriority = priority;
                bestQuestionId = questionId;
            } else if (ig == maxIG && priority == bestPriority) {
                if (Math.random() > 0.5) {
                    bestQuestionId = questionId;
                }
            }
        }

        return bestQuestionId;
    }

    /**
     * Filtra os IDs de países candidatos compatíveis com uma resposta recebida.
     *
     * @param candidates conjunto atual de candidatos.
     * @param questionId ID da pergunta respondida.
     * @param answer     resposta do usuário ({@code true} = SIM, {@code false} = NÃO).
     * @return novo conjunto — subconjunto de {@code candidates} compatível com a resposta.
     */
    public Set<Long> filterCandidates(Set<Long> candidates, Long questionId, boolean answer) {
        Set<Long> compatible = answer
                ? cache.getTrueCountries(questionId)
                : cache.getFalseCountries(questionId);

        Set<Long> result = new HashSet<>(candidates);
        result.retainAll(compatible);
        return result;
    }

    /**
     * Retorna a entropia de Shannon do conjunto de candidatos atual.
     * H(n) = log₂(n) para distribuição uniforme.
     * Utilizado para logging e análise empírica das rodadas.
     *
     * @param candidates conjunto de IDs dos candidatos atuais.
     * @return entropia em bits.
     */
    public double getCurrentEntropy(Set<Long> candidates) {
        return shannonEntropy(candidates.size());
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    /**
     * Entropia de Shannon para distribuição uniforme de {@code n} elementos.
     * H(n) = log₂(n). H(0) = H(1) = 0.
     *
     * @param n número de elementos.
     * @return entropia em bits.
     */
    private double shannonEntropy(int n) {
        if (n <= 1) return 0.0;
        return Math.log(n) / Math.log(2);
    }

    /**
     * Retorna a prioridade de desempate da pergunta baseada em sua categoria.
     * Consulta o valor pré-calculado no cache — sem acesso ao banco de dados.
     * Ordem: GEOGRAFIA (90) > DEMOGRAFIA (80) > POLÍTICA (70) > ... > BANDEIRA (10)
     *
     * @param questionId ID da pergunta.
     * @return valor numérico de prioridade (maior = mais prioritário).
     */
    private int getCategoryPriority(Long questionId) {
        return cache.getQuestionPriority(questionId);
    }
}