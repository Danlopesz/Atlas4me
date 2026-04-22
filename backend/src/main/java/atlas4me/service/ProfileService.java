package atlas4me.service;

import atlas4me.dto.response.ProfileStatsResponse;
import atlas4me.entity.GameSession;
import atlas4me.entity.User;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.GameSessionRepository;
import atlas4me.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável por montar as estatísticas do perfil do usuário.
 * <p>
 * Todas as métricas são derivadas de partidas legítimas (status IN
 * ROBOT_WON, HUMAN_WON, FINISHED_REVEALED) — sessões ABANDONED nunca contam.
 * <p>
 * Nota sobre targetCountry: no schema atual, targetCountry é uma relação
 * ManyToOne para a entidade Country. Isso permite navegar diretamente para
 * namePt e isoCode via JPQL, sem necessidade de join manual.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;

    /**
     * Monta o ProfileStatsDTO completo para o usuário autenticado.
     *
     * @param userEmail email do usuário (vindo do token JWT)
     * @return ProfileStatsDTO com países descobertos, ISO codes, métricas e ranking
     */
    @Transactional(readOnly = true)
    public ProfileStatsResponse getProfileStats(String userEmail) {
        User user = userRepository.findByEmailAndActiveTrue(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userEmail));

        // Países únicos descobertos — nomes em PT, ordenados alfabeticamente
        List<String> discoveredCountries = gameSessionRepository.findDiscoveredCountryNamesByUser(user);

        // ISO codes dos mesmos países — para colorir o globo do perfil
        List<String> discoveredIsoCodes = gameSessionRepository.findDiscoveredIsoCodesByUser(user);

        // Contagens
        Long totalDiscovered = gameSessionRepository.countDiscoveredCountriesByUser(user);
        Long totalGames = gameSessionRepository.countLegitGamesByUser(user);
        Long totalWins = gameSessionRepository.countLegitWinsByUser(user);
        Long totalDefeats = gameSessionRepository.countDefeatsByUser(user);

        // Último país descoberto — busca a partida legítima mais recente (LIMIT 1)
        String lastDiscoveredCountry = null;
        java.time.LocalDateTime lastPlayedAt = null;

        List<GameSession> lastGame = gameSessionRepository.findLastLegitGameByUser(user, PageRequest.of(0, 1));
        if (!lastGame.isEmpty()) {
            GameSession last = lastGame.get(0);
            if (last.getTargetCountry() != null) {
                lastDiscoveredCountry = last.getTargetCountry().getNamePt();
            }
            lastPlayedAt = last.getFinishedAt();
        }

        // Display name: firstName se existir, senão parte do email antes do @
        String displayName = (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? user.getFirstName()
                : user.getEmail().split("@")[0];

        log.info("Profile stats para {}: {} países descobertos, {} partidas legítimas",
                displayName, totalDiscovered, totalGames);

        return ProfileStatsResponse.builder()
                .userId(user.getId())
                .displayName(displayName)
                .discoveredCountries(discoveredCountries)
                .discoveredIsoCodes(discoveredIsoCodes)
                .totalDiscovered(totalDiscovered)
                .totalGames(totalGames)
                .totalWins(totalWins)
                .totalDefeats(totalDefeats)
                .lastDiscoveredCountry(lastDiscoveredCountry)
                .lastPlayedAt(lastPlayedAt)
                .build();
    }
}
