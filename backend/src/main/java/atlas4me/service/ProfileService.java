package atlas4me.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import atlas4me.dto.response.ProfileStatsResponse;
import atlas4me.entity.GameSession;
import atlas4me.entity.User;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.GameSessionRepository;
import atlas4me.repository.UserRepository;

/**
 * Serviço responsável por montar as estatísticas do perfil do usuário.
 *
 * Todas as métricas são derivadas de partidas legítimas (status ROBOT_WON,
 * HUMAN_WON, FINISHED_REVEALED) — sessões ABANDONED nunca contam.
 *
 * Nota: targetCountry é uma relação ManyToOne para Country, permitindo
 * navegar para namePt e isoCode via JPQL sem join manual.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;

    /**
     * Monta as estatísticas completas do perfil do usuário autenticado.
     *
     * @param userEmail e-mail do usuário (extraído do token JWT).
     * @return {@link ProfileStatsResponse} com países descobertos, ISO codes e métricas de partidas.
     * @throws ResourceNotFoundException se o usuário não for encontrado ou estiver inativo.
     */
    @Transactional(readOnly = true)
    public ProfileStatsResponse getProfileStats(String userEmail) {
        User user = userRepository.findByEmailAndActiveTrue(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userEmail));

        List<String> discoveredCountries = gameSessionRepository.findDiscoveredCountryNamesByUser(user);
        List<String> discoveredIsoCodes = gameSessionRepository.findDiscoveredIsoCodesByUser(user);
        Long totalDiscovered = gameSessionRepository.countDiscoveredCountriesByUser(user);
        Long totalGames = gameSessionRepository.countLegitGamesByUser(user);
        Long totalWins = gameSessionRepository.countLegitWinsByUser(user);
        Long totalDefeats = gameSessionRepository.countDefeatsByUser(user);

        Optional<GameSession> lastGameOpt = gameSessionRepository
                .findLastLegitGameByUser(user, PageRequest.of(0, 1))
                .stream()
                .findFirst();

        String lastDiscoveredCountry = lastGameOpt
                .filter(g -> g.getTargetCountry() != null)
                .map(g -> g.getTargetCountry().getNamePt())
                .orElse(null);
        LocalDateTime lastPlayedAt = lastGameOpt
                .map(GameSession::getFinishedAt)
                .orElse(null);

        String displayName = resolveDisplayName(user);

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

    private String resolveDisplayName(User user) {
        return (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? user.getFirstName()
                : user.getEmail().split("@")[0];
    }
}