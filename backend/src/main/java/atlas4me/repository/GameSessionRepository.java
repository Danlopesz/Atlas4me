package atlas4me.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import atlas4me.entity.User;
import atlas4me.entity.GameSession;
import atlas4me.entity.GameStatus; // Importante: Importar o Enum!

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
    // Lista histórico ordenado
    List<GameSession> findByUserOrderByStartedAtDesc(User user);
       
    // Busca uma sessão específica pelo Status (ex: IN_PROGRESS)
    Optional<GameSession> findByUserAndStatus(User user, GameStatus status);
    
    // Verifica se existe (retorna true/false)
    boolean existsByUserAndStatus(User user, GameStatus status);
    
    // --- QUERIES ATUALIZADAS (Adeus 'won' e 'completed') ---
    
    @Query("SELECT gs FROM GameSession gs WHERE gs.user = :user ORDER BY gs.score DESC")
    List<GameSession> findTopScoresByUser(User user);
    
    // Agora contamos vitórias olhando o Status 'HUMAN_WON'
    @Query("SELECT COUNT(gs) FROM GameSession gs WHERE gs.user = :user AND gs.status = 'HUMAN_WON'")
    long countWonGamesByUser(User user);

    
}