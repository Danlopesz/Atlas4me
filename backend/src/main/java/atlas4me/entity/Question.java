package atlas4me.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data // Se estiver usando Lombok. Se não, gere os Getters/Setters manualmente.
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category", nullable = false)
    private String category; // Ex: LOCALIZACAO, GEOGRAFIA

    @Column(name = "question_pt", nullable = false, length = 500)
    private String questionPt;

    @Column(name = "question_en", nullable = false, length = 500)
    private String questionEn;

    @Column(name = "featureKey", nullable = false, length = 50)
    private String featureKey;

    @Transient
    private String igJustification;
}