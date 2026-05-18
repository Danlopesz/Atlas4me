package atlas4me.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade que representa uma pergunta de inferência utilizada pelo robô para identificar países.
 * Mapeada para a tabela {@code questions}.
 */
@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "question_pt", nullable = false, length = 500)
    private String questionPt;

    @Column(name = "question_en", nullable = false, length = 500)
    private String questionEn;

    @Column(name = "feature_Key", nullable = false, length = 50)
    private String featureKey;

    /**
     * Justificativa do Ganho de Informação (IG) calculado na última rodada de inferência.
     * Campo transiente — não persiste no banco; utilizado para logging e análise de desempenho do motor.
     */
    @Transient
    private String informationGainJustification;
}