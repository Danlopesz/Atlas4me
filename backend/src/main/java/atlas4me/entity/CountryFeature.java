package atlas4me.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

/**
 * Entidade que representa uma feature booleana de um país para uma pergunta específica.
 * Modela a tabela {@code country_features}: cada linha indica se um país responde
 * SIM ({@code true}) ou NÃO ({@code false}) a uma determinada pergunta de inferência.
 */
@Entity
@Table(name = "country_features")
@Data
public class CountryFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "country_id", nullable = false)
    @JsonIgnore
    private Country country;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @Column(name = "is_true", nullable = false)
    private Boolean isTrue;
}