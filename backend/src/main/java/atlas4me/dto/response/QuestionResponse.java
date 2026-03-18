package atlas4me.dto.response;

import java.util.List;

public record QuestionResponse(
        Long id,
        String text,
        String category,
        String helperImageUrl,
        
        // --- ADIÇÃO PARA A UI 3D ---
        List<String> mapHints // ISO Codes dos países que respondem SIM para esta pergunta
) {}