package atlas4me.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO unificado de resposta do jogo.
 * Serve tanto para o loop em tempo real quanto para o Histórico de partidas.
 */
@Builder
public record GameResponse(
        Long gameId,
        String status,
        Integer score,
        Integer attempts,          // Usado no Histórico
        Boolean won,               // Usado no Histórico
        LocalDateTime startedAt,   // Usado no Histórico
        LocalDateTime finishedAt,  // Usado no Histórico
        String targetCountry,      // Nome do país (palpite do robô ou revelação final)

        // --- ADIÇÕES PARA A UI 3D (GameGlobe) ---
        List<String> remainingCountries, // ISO Codes dos países que ainda são candidatos

        QuestionResponse nextQuestion,
        String feedback,
        String questionText
) {}