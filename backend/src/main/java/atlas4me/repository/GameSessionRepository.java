package atlas4me.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import atlas4me.entity.User;
import atlas4me.entity.GameSession;
import atlas4me.entity.GameStatus; // Importante: Importar o Enum!

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

       // Lista histórico ordenado — exclui sessões ABANDONED
       @Query("SELECT gs FROM GameSession gs WHERE gs.user = :user " +
                     "AND gs.status <> 'ABANDONED' ORDER BY gs.startedAt DESC")
       List<GameSession> findHistoryByUser(@Param("user") User user);

       // Busca uma sessão específica pelo Status (ex: IN_PROGRESS)
       Optional<GameSession> findByUserAndStatus(User user, GameStatus status);

       // Verifica se existe (retorna true/false)
       boolean existsByUserAndStatus(User user, GameStatus status);

       // --- QUERIES ATUALIZADAS (Adeus 'won' e 'completed') ---

       @Query("SELECT gs FROM GameSession gs WHERE gs.user = :user " +
                     "AND gs.status <> 'ABANDONED' ORDER BY gs.score DESC")
       List<GameSession> findTopScoresByUser(User user);

       // Agora contamos vitórias olhando o Status 'HUMAN_WON'
       @Query("SELECT COUNT(gs) FROM GameSession gs WHERE gs.user = :user AND gs.status = 'HUMAN_WON'")
       long countWonGamesByUser(User user);

       // =========================================================================
       // ONDA 2 — Queries de países descobertos e ranking
       // =========================================================================

       /**
        * Nomes (em PT) dos países únicos jogados pelo usuário em partidas legítimas.
        * Usado para montar a lista de descobertas no perfil.
        */
       @Query("SELECT DISTINCT gs.targetCountry.namePt FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL " +
                     "ORDER BY gs.targetCountry.namePt ASC")
       List<String> findDiscoveredCountryNamesByUser(@Param("user") User user);

       /**
        * ISO codes dos países únicos jogados pelo usuário (para colorir o globo do
        * perfil).
        */
       @Query("SELECT DISTINCT gs.targetCountry.isoCode FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       List<String> findDiscoveredIsoCodesByUser(@Param("user") User user);

       /**
        * Contagem de países únicos por usuário (para ranking).
        */
       @Query("SELECT COUNT(DISTINCT gs.targetCountry) FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       Long countDiscoveredCountriesByUser(@Param("user") User user);

       /**
        * Data da última descoberta (para desempate no ranking).
        */
       @Query("SELECT MAX(gs.finishedAt) FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       LocalDateTime findLastDiscoveryDate(@Param("user") User user);

       /**
        * Contagem de partidas legítimas totais por usuário.
        */
       @Query("SELECT COUNT(gs) FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       Long countLegitGamesByUser(@Param("user") User user);

       /**
        * Contagem de derrotas (ROBOT_WON) por usuário.
        */
       @Query("SELECT COUNT(gs) FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status = 'ROBOT_WON' " +
                     "AND gs.targetCountry IS NOT NULL")
       Long countDefeatsByUser(@Param("user") User user);

       /**
        * Contagem de vitórias legítimas (HUMAN_WON + FINISHED_REVEALED) por usuário.
        */
       @Query("SELECT COUNT(gs) FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       Long countLegitWinsByUser(@Param("user") User user);

       /**
        * A partida legítima mais recente do usuário (para "último país descoberto").
        */
       @Query("SELECT gs FROM GameSession gs " +
                     "WHERE gs.user = :user " +
                     "AND gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL " +
                     "ORDER BY gs.finishedAt DESC")
       List<GameSession> findLastLegitGameByUser(@Param("user") User user, Pageable pageable);

       /**
        * Ranking global: usuários ordenados por países únicos descobertos (DESC),
        * desempate por data da última descoberta (ASC = quem descobriu antes fica à
        * frente).
        * Retorna Object[] = { userId, firstName, email, discoveredCount, lastDiscovery
        * }.
        */
       @Query("SELECT gs.user.id, gs.user.firstName, gs.user.email, " +
                     "COUNT(DISTINCT gs.targetCountry) as discoveredCount, " +
                     "MAX(gs.finishedAt) as lastDiscovery " +
                     "FROM GameSession gs " +
                     "WHERE gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL " +
                     "GROUP BY gs.user.id, gs.user.firstName, gs.user.email " +
                     "ORDER BY discoveredCount DESC, lastDiscovery ASC")
       List<Object[]> findRankingData(Pageable pageable);

       /**
        * Total de jogadores ativos (com ao menos 1 país descoberto).
        * Usado como contexto no ranking ("X jogadores no total").
        */
       @Query("SELECT COUNT(DISTINCT gs.user) FROM GameSession gs " +
                     "WHERE gs.status IN ('ROBOT_WON', 'HUMAN_WON', 'FINISHED_REVEALED') " +
                     "AND gs.targetCountry IS NOT NULL")
       Long countActivePlayers();

}