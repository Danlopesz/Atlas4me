package atlas4me.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "country_features")
@Data
public class CountryFeature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "is_true", nullable = false)
    private Boolean isTrue; // A resposta (Sim/Não) para esse par
}