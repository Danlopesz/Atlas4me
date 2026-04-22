package atlas4me.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO com as estatísticas do perfil do usuário.
 * Inclui países descobertos, ISO codes (para o globo), e métricas de jogo.
 */
@Builder
public record ProfileStatsResponse(
                Long userId,
                String displayName, // firstName se existir, senão parte do email antes do @
                List<String> discoveredCountries, // nomes dos países (PT) — ordenados alfabeticamente
                List<String> discoveredIsoCodes, // ISO codes para colorir o globo do perfil
                Long totalDiscovered, // total de países únicos
                Long totalGames, // partidas legítimas totais
                Long totalWins, // HUMAN_WON + FINISHED_REVEALED
                Long totalDefeats, // ROBOT_WON
                String lastDiscoveredCountry, // nome (PT) do país da partida mais recente
                LocalDateTime lastPlayedAt // finishedAt da partida mais recente
) {
}
