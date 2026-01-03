package atlas4me.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "game_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    @JoinTable(name = "game_session_rejected", joinColumns = @JoinColumn(name = "session_id"), inverseJoinColumns = @JoinColumn(name = "country_id"))
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

    // Removido o campo 'won' do banco de dados, pois o status já diz quem ganhou.
    // Mas mantemos o getWon() abaixo para o Java não reclamar.
    // Retorna true se o HUMANO ganhou
    public Boolean getWon() {
        return this.status == GameStatus.HUMAN_WON;
    }

    // Retorna true se o jogo foi finalizado (qualquer status diferente de
    // IN_PROGRESS)
    public Boolean isFinished() {
        return this.status != GameStatus.IN_PROGRESS;
    }

    // Método helper para finalizar o jogo
    public void finish(GameStatus finalStatus) {
        if (finalStatus == GameStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Cannot finish game with IN_PROGRESS status");
        }
        this.status = finalStatus;
        this.finishedAt = LocalDateTime.now();
    }

    // Helper para adicionar fácil
    public void addRejectedCountry(Country country) {
        this.rejectedCountries.add(country);
    }
}