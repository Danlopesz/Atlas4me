package atlas4me.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameAnswerRequest {
    private Long gameId;
    private Long questionId;
    private Boolean answer;
}