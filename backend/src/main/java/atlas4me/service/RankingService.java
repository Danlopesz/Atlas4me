package atlas4me.service;

import atlas4me.dto.response.RankingEntryResponse;
import atlas4me.dto.response.RankingResponse;
import atlas4me.entity.User;
import atlas4me.repository.GameSessionRepository;
import atlas4me.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Serviço responsável por montar o ranking global de descobertas.
 * <p>
 * Ranking é ordenado por:
 * 1. Número de países únicos descobertos (DESC)
 * 2. Data da última descoberta (ASC — quem descobriu antes fica à frente no
 * empate)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RankingService {

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;

    private static final int TOP_LIMIT = 10;
    private static final int FETCH_LIMIT = 100;

    /**
     * Monta o RankingResponse completo.
     *
     * @param userEmail email do usuário autenticado (null se anônimo)
     * @return RankingResponse com top 10, posição do usuário e total de jogadores
     */
    @Transactional(readOnly = true)
    public RankingResponse getRanking(String userEmail) {

        // 1. Busca os primeiros 100 do ranking
        List<Object[]> rawData = gameSessionRepository.findRankingData(PageRequest.of(0, FETCH_LIMIT));

        // 2. Mapeia para DTOs com rank sequencial
        List<RankingEntryResponse> allEntries = new ArrayList<>();
        for (int i = 0; i < rawData.size(); i++) {
            Object[] row = rawData.get(i);
            allEntries.add(mapToEntry(row, i + 1));
        }

        // 3. Top 10
        List<RankingEntryResponse> topPlayers = allEntries.size() > TOP_LIMIT
                ? allEntries.subList(0, TOP_LIMIT)
                : allEntries;

        // 4. Total de jogadores ativos
        Long totalActivePlayers = gameSessionRepository.countActivePlayers();

        // 5. Posição do usuário autenticado
        RankingEntryResponse currentUserEntry = null;
        if (userEmail != null && !userEmail.equals("guest") && !userEmail.equals("anonymousUser")) {
            currentUserEntry = findCurrentUserEntry(userEmail, allEntries);
        }

        log.info("Ranking gerado: {} entradas carregadas, {} jogadores ativos, top 10 de {}",
                allEntries.size(), totalActivePlayers, topPlayers.size());

        return RankingResponse.builder()
                .topPlayers(topPlayers)
                .currentUserEntry(currentUserEntry)
                .totalActivePlayers(totalActivePlayers)
                .build();
    }

    /**
     * Procura o usuário autenticado na lista dos 100 primeiros.
     * Se não encontrado (rank > 100 ou sem partidas): busca contagem individual.
     */
    private RankingEntryResponse findCurrentUserEntry(String userEmail, List<RankingEntryResponse> allEntries) {
        Optional<User> userOpt = userRepository.findByEmailAndActiveTrue(userEmail);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        // Procura nos 100 primeiros
        for (RankingEntryResponse entry : allEntries) {
            if (entry.userId().equals(user.getId())) {
                return entry;
            }
        }

        // Não está nos 100 primeiros: busca dados individuais
        Long discoveredCount = gameSessionRepository.countDiscoveredCountriesByUser(user);
        if (discoveredCount == null || discoveredCount == 0) {
            // Usuário nunca jogou uma partida legítima
            String displayName = resolveDisplayName(user);
            return RankingEntryResponse.builder()
                    .rank(null)
                    .userId(user.getId())
                    .displayName(displayName)
                    .discoveredCountries(0L)
                    .lastDiscoveryFormatted(null)
                    .build();
        }

        // Tem partidas mas está fora do top 100
        LocalDateTime lastDiscovery = gameSessionRepository.findLastDiscoveryDate(user);
        String displayName = resolveDisplayName(user);

        return RankingEntryResponse.builder()
                .rank(null) // rank desconhecido (fora do top 100)
                .userId(user.getId())
                .displayName(displayName)
                .discoveredCountries(discoveredCount)
                .lastDiscoveryFormatted(formatRelativeDate(lastDiscovery))
                .build();
    }

    /**
     * Mapeia um Object[] da query de ranking para RankingEntryDTO.
     * Object[] = { userId (Long), firstName (String), email (String),
     * discoveredCount (Long), lastDiscovery (LocalDateTime) }
     */
    private RankingEntryResponse mapToEntry(Object[] row, int rank) {
        Long userId = (Long) row[0];
        String firstName = (String) row[1];
        String email = (String) row[2];
        Long discoveredCount = (Long) row[3];
        LocalDateTime lastDiscovery = row[4] != null ? (LocalDateTime) row[4] : null;

        String displayName = (firstName != null && !firstName.isBlank())
                ? firstName
                : email.split("@")[0];

        return RankingEntryResponse.builder()
                .rank(rank)
                .userId(userId)
                .displayName(displayName)
                .discoveredCountries(discoveredCount)
                .lastDiscoveryFormatted(formatRelativeDate(lastDiscovery))
                .build();
    }

    /**
     * Formata uma data em formato relativo legível em português.
     */
    private String formatRelativeDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }

        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1)
            return "agora mesmo";
        if (minutes < 60)
            return "há " + minutes + " min";
        if (hours < 24)
            return "há " + hours + (hours == 1 ? " hora" : " horas");
        if (days == 0)
            return "hoje";
        if (days == 1)
            return "ontem";
        if (days < 7)
            return "há " + days + " dias";
        if (days < 30) {
            long weeks = days / 7;
            return "há " + weeks + (weeks == 1 ? " semana" : " semanas");
        }
        if (days < 365) {
            long months = days / 30;
            return "há " + months + (months == 1 ? " mês" : " meses");
        }
        long years = days / 365;
        return "há " + years + (years == 1 ? " ano" : " anos");
    }

    private String resolveDisplayName(User user) {
        return (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? user.getFirstName()
                : user.getEmail().split("@")[0];
    }
}
