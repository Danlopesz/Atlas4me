package atlas4me.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_attempts")
@Data
public class GameAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession gameSession;

    // --- MUDANÇA AQUI: Trocamos String por Objeto Question ---
    // Antes: private String questionText;
    // Agora: Relacionamento real para sabermos o ID da pergunta
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "user_answer", nullable = false)
    private Boolean userAnswer;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;
    
    @PrePersist
    protected void onCreate() {
        attemptedAt = LocalDateTime.now();
    }
}