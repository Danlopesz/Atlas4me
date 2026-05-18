package atlas4me.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade que representa uma sessão de jogo completa — do início até o encerramento.
 * Mapeada para a tabela {@code game_sessions}.
 *
 * Utiliza Optimistic Locking via {@code @Version} para rejeitar requisições
 * simultâneas que tentem modificar a mesma sessão, evitando condições de corrida
 * causadas por cliques duplos ou abas duplicadas.
 */
@Entity
@Table(name = "game_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Controle de Concorrência Otimista (Optimistic Locking).
     * Se dois requests tentarem modificar a mesma sessão simultaneamente,
     * o segundo lançará {@code ObjectOptimisticLockingFailureException} → HTTP 409.
     */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_country_id", nullable = false)
    private Country targetCountry;

    @Column(nullable = false)
    private Integer score = 0;

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameAttempt> gameAttempts = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "game_session_rejected",
        joinColumns = @JoinColumn(name = "session_id"),
        inverseJoinColumns = @JoinColumn(name = "country_id")
    )
    private Set<Country> rejectedCountries = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) {
            status = GameStatus.IN_PROGRESS;
        }
    }

    /**
     * Indica se o humano ganhou esta sessão.
     * Mantido para compatibilidade com {@link atlas4me.dto.response.GameResponse}.
     *
     * @return {@code true} se o status for {@link GameStatus#HUMAN_WON}.
     */
    public Boolean getWon() {
        return this.status == GameStatus.HUMAN_WON;
    }

    /**
     * Indica se a sessão foi encerrada (qualquer status diferente de {@link GameStatus#IN_PROGRESS}).
     *
     * @return {@code true} se o jogo não estiver mais em andamento.
     */
    public Boolean isFinished() {
        return this.status != GameStatus.IN_PROGRESS;
    }

    /**
     * Encerra a sessão com o status informado e registra o timestamp de finalização.
     *
     * @param finalStatus status de encerramento; não pode ser {@link GameStatus#IN_PROGRESS}.
     * @throws IllegalArgumentException se {@code finalStatus} for {@link GameStatus#IN_PROGRESS}.
     */
    public void finish(GameStatus finalStatus) {
        if (finalStatus == GameStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Cannot finish game with IN_PROGRESS status");
        }
        this.status = finalStatus;
        this.finishedAt = LocalDateTime.now();
    }

    /**
     * Adiciona um país à lista de candidatos descartados por palpite incorreto.
     *
     * @param country país a ser descartado do conjunto de candidatos.
     */
    public void addRejectedCountry(Country country) {
        this.rejectedCountries.add(country);
    }
}