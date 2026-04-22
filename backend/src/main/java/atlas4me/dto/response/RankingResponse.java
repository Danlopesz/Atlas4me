package atlas4me.dto.response;

import lombok.Builder;
import java.util.List;

/**
 * DTO de resposta do endpoint de ranking global.
 * Contém o top 10, a posição do usuário autenticado e o total de jogadores
 * ativos.
 */
@Builder
public record RankingResponse(
                List<RankingEntryResponse> topPlayers, // top 10 jogadores
                RankingEntryResponse currentUserEntry, // null se anônimo ou sem partidas
                Long totalActivePlayers // usuários com ao menos 1 país descoberto
) {
}
