package atlas4me.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "game_attempts")
@Data
public class GameAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private GameSession gameSession;

    // Trocamos String por Objeto Question para saber o ID da pergunta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "user_answer", nullable = false)
    private Boolean userAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;
    
    @PrePersist
    protected void onCreate() {
        attemptedAt = LocalDateTime.now();
    }
}