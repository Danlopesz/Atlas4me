package atlas4me.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    
    private Long id;
    private String text;
    private String category;
    private String helperImageUrl;
    private List<LocationResponse> mapLocations;
   
}