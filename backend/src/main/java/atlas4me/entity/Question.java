package atlas4me.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String text; // Ex: "O país fica no litoral?"

    @Column(nullable = false)
    private String category; // Ex: "GEOGRAFIA", "CULTURA"

    // Aquele campo novo para a imagem de ajuda (mapa)
    @Column(name = "helper_image_url")
    private String helperImageUrl; 
}