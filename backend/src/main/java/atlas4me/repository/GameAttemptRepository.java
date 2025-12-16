package atlas4me.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import atlas4me.entity.GameAttempt;
import atlas4me.entity.GameSession;

import java.util.List;

@Repository
public interface GameAttemptRepository extends JpaRepository<GameAttempt, Long> {
    
    List<GameAttempt> findByGameSessionOrderByAttemptedAtAsc(GameSession gameSession);
    
    long countByGameSession(GameSession gameSession);
}
