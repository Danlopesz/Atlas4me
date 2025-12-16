package atlas4me.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameAnswerRequest {
      
   private Long questionId; // <--- NOVO: O ID da pergunta que está sendo respondida
    private Boolean answer;  // Sim/Não
    // private String question; // Pode remover se quiser, vamos usar o ID
}
