package atlas4me.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse{
    
    private Long id;
    private String text;           // O texto da pergunta ("Fica na Europa?")
    private String category;       // "GEOGRAFIA", "CULTURA"
    private String helperImageUrl; // A URL do mapa visual (Crucial para sua UX!)
}