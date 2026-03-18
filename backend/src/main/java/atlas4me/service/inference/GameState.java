package atlas4me.service.inference;

import java.util.Set;

/**
 * Representa o estado imutável da rodada atual.
 */
public record GameState(
        Set<Long> currentCandidates,
        Set<Long> askedQuestions
) {
    // Records no Java 21 já geram automaticamente construtores, getters, equals, hashCode e toString.
}
