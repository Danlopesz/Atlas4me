package atlas4me.dto.request;

/**
 * Request unificada para feedback de palpite do robô.
 * Substitui os endpoints separados /deny e /confirm.
 *
 * correct = true  → Robô acertou → ROBOT_WON
 * correct = false → Robô errou  → tenta próximo candidato ou WAITING_FOR_REVEAL
 */
public record GuessFeedbackRequest(
        Long gameId,
        boolean correct
) {}
