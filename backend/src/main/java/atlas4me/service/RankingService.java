package atlas4me.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import atlas4me.dto.response.RankingEntryResponse;
import atlas4me.dto.response.RankingResponse;
import atlas4me.entity.User;
import atlas4me.repository.GameSessionRepository;
import atlas4me.repository.UserRepository;

/**
 * Serviço responsável por montar o ranking global de descobertas.
 *
 * Critérios de ordenação:
 * 1. Número de países únicos descobertos (DESC)
 * 2. Data da última descoberta (ASC — quem descobriu antes fica à frente no empate)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RankingService {

    private static final int TOP_LIMIT = 10;
    private static final int FETCH_LIMIT = 100;

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;

    /**
     * Monta o ranking global com top 10 e, se autenticado, a posição individual do usuário.
     *
     * @param userEmail e-mail do usuário autenticado, ou {@code null} para anônimos.
     * @return {@link RankingResponse} com top 10, posição individual e total de jogadores ativos.
     */
    @Transactional(readOnly = true)
    public RankingResponse getRanking(String userEmail) {
        List<RankingEntryResponse> allEntries = loadRankedEntries();

        List<RankingEntryResponse> topPlayers = allEntries.size() > TOP_LIMIT
                ? allEntries.subList(0, TOP_LIMIT)
                : allEntries;

        Long totalActivePlayers = gameSessionRepository.countActivePlayers();

        RankingEntryResponse currentUserEntry = isAuthenticatedUser(userEmail)
                ? findCurrentUserEntry(userEmail, allEntries)
                : null;

        log.info("Ranking gerado: {} entradas carregadas, {} jogadores ativos, top {} de {}",
                allEntries.size(), totalActivePlayers, TOP_LIMIT, topPlayers.size());

        return RankingResponse.builder()
                .topPlayers(topPlayers)
                .currentUserEntry(currentUserEntry)
                .totalActivePlayers(totalActivePlayers)
                .build();
    }

    /**
     * Busca os primeiros {@code FETCH_LIMIT} do ranking e converte para DTOs com rank sequencial.
     *
     * @return lista de {@link RankingEntryResponse} ordenada por posição.
     */
    private List<RankingEntryResponse> loadRankedEntries() {
        List<Object[]> queryResults = gameSessionRepository.findRankingData(PageRequest.of(0, FETCH_LIMIT));
        List<RankingEntryResponse> entries = new ArrayList<>();
        for (int i = 0; i < queryResults.size(); i++) {
            entries.add(mapToEntry(queryResults.get(i), i + 1));
        }
        return entries;
    }

    /**
     * Procura o usuário nos primeiros {@code FETCH_LIMIT} do ranking.
     * Se não encontrado, busca contagem individual e retorna entrada sem rank definido.
     *
     * @param userEmail  e-mail do usuário a localizar.
     * @param allEntries lista dos primeiros {@code FETCH_LIMIT} entradas do ranking.
     * @return {@link RankingEntryResponse} do usuário, ou {@code null} se inativo.
     */
    private RankingEntryResponse findCurrentUserEntry(String userEmail, List<RankingEntryResponse> allEntries) {
        Optional<User> userOpt = userRepository.findByEmailAndActiveTrue(userEmail);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();

        for (RankingEntryResponse entry : allEntries) {
            if (entry.userId().equals(user.getId())) {
                return entry;
            }
        }

        Long discoveredCount = gameSessionRepository.countDiscoveredCountriesByUser(user);
        if (discoveredCount == null || discoveredCount == 0) {
            return RankingEntryResponse.builder()
                    .rank(null)
                    .userId(user.getId())
                    .displayName(resolveDisplayName(user))
                    .discoveredCountries(0L)
                    .lastDiscoveryFormatted(null)
                    .build();
        }

        // Usuário tem partidas legítimas mas está fora do top FETCH_LIMIT
        LocalDateTime lastDiscovery = gameSessionRepository.findLastDiscoveryDate(user);
        return RankingEntryResponse.builder()
                .rank(null)
                .userId(user.getId())
                .displayName(resolveDisplayName(user))
                .discoveredCountries(discoveredCount)
                .lastDiscoveryFormatted(formatRelativeDate(lastDiscovery))
                .build();
    }

    /**
     * Mapeia uma linha de resultado da query JPQL para um {@link RankingEntryResponse}.
     * Estrutura da linha: { userId (Long), firstName (String), email (String),
     * discoveredCount (Long), lastDiscovery (LocalDateTime) }
     *
     * @param rankingRow linha de resultado da query de ranking.
     * @param rank       posição sequencial no ranking (1-based).
     * @return {@link RankingEntryResponse} montado com rank, nome de exibição e descobertas.
     */
    private RankingEntryResponse mapToEntry(Object[] rankingRow, int rank) {
        Long userId = (Long) rankingRow[0];
        String firstName = (String) rankingRow[1];
        String email = (String) rankingRow[2];
        Long discoveredCount = (Long) rankingRow[3];
        LocalDateTime lastDiscovery = (LocalDateTime) rankingRow[4];

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
     *
     * @param dateTime data/hora a ser formatada; aceita {@code null}.
     * @return string relativa como "há 2 dias", "ontem", "agora mesmo",
     *         ou {@code null} se a data for nula.
     */
    private String formatRelativeDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }

        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1)  return "agora mesmo";
        if (minutes < 60) return "há " + minutes + " min";
        if (hours < 24)   return "há " + hours + (hours == 1 ? " hora" : " horas");
        if (days == 0)    return "hoje";
        if (days == 1)    return "ontem";
        if (days < 7)     return "há " + days + " dias";
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

    private boolean isAuthenticatedUser(String userEmail) {
        return userEmail != null && !userEmail.equals("guest") && !userEmail.equals("anonymousUser");
    }
}