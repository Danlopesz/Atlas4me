package atlas4me.service.inference;

import java.util.Set;

/**
 * Estado imutável de uma rodada de inferência.
 *
 * @param currentCandidates conjunto de IDs dos países ainda candidatos na sessão atual.
 * @param askedQuestions    conjunto de IDs das perguntas já realizadas nesta sessão.
 */
public record GameState(
        Set<Long> currentCandidates,
        Set<Long> askedQuestions
) {}