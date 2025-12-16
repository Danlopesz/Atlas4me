package atlas4me.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResponse {
    
    private Long gameId;
    private String targetCountry;
    private Integer score;
    private Integer attempts;
    private Boolean won;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String status; // "IN_PROGRESS", "ROBOT_WON", "HUMAN_WON"
    private QuestionResponse nextQuestion;
}
