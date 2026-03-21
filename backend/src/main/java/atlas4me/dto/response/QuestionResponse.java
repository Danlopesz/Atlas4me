package atlas4me.dto.response;

import java.util.List;

public record QuestionResponse(
        Long id,
        String text,
        String category,
        String helperImageUrl,

        List<String> validIsoCodes
) {}