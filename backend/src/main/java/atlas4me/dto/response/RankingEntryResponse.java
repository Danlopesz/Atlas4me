package atlas4me.dto.response;

import lombok.Builder;

/**
 * DTO que representa uma entrada no ranking global.
 * Cada entry = um usuário com suas estatísticas de descoberta.
 */
@Builder
public record RankingEntryResponse(
                Integer rank,
                Long userId,
                String displayName,
                Long discoveredCountries,
                String lastDiscoveryFormatted // ex: "há 2 dias", "hoje", "há 1 mês"
) {
}
