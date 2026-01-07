package atlas4me.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @JsonIgnore
    private Country country;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @Column(name = "is_true", nullable = false)
    private Boolean isTrue; // A resposta (Sim/Não) para esse par
}