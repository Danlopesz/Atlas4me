package atlas4me.controller;

import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.request.GuessFeedbackRequest;
import atlas4me.dto.request.RevealRequest;
import atlas4me.dto.response.GameResponse;
import atlas4me.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    // -------------------------------------------------------------------------
    // Endpoints legados (mantidos para compatibilidade com frontend atual)
    // -------------------------------------------------------------------------

    @PostMapping("/start")
    public ResponseEntity<GameResponse> startGame(
            @RequestParam(required = false, defaultValue = "SOUTH_AMERICA") String continent,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.startNewGame(resolveEmail(authentication), continent));
    }

    @GetMapping("/history")
    public ResponseEntity<List<GameResponse>> getGameHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(gameService.getUserGameHistory(authentication.getName()));
    }

    @PostMapping("/reveal")
    public ResponseEntity<GameResponse> revealAnswer(
            @RequestBody RevealRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.revealAnswer(
                        resolveEmail(authentication),
                        request.getCountryId(),
                        request.getGameId()));
    }

    // -------------------------------------------------------------------------
    // Endpoints novos (GameResponse com ISO Codes)
    // -------------------------------------------------------------------------

    /**
     * Processa a resposta do usuário à pergunta atual.answerQuestion
     * Retorna GameResponse com ISO Codes dos candidatos restantes.
     */
    @PostMapping("/answer")
    public ResponseEntity<GameResponse> answerQuestion(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.submitAnswer(resolveEmail(authentication), request));
    }

    /**
     * Feedback unificado sobre o palpite do robô.
     * Substitui os endpoints /deny e /confirm.
     *
     * Body: { "gameId": 42, "correct": true }   → Robô acertou → ROBOT_WON
     * Body: { "gameId": 42, "correct": false }  → Robô errou  → próximo candidato
     */
    @PostMapping("/guess-feedback")
    public ResponseEntity<GameResponse> provideGuessFeedback(
            @RequestBody GuessFeedbackRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.processGuessFeedback(resolveEmail(authentication), request));
    }

    // -------------------------------------------------------------------------
    // Compatibilidade: /deny e /confirm ainda funcionam via guess-feedback
    // -------------------------------------------------------------------------

    @PostMapping("/deny")
    public ResponseEntity<GameResponse> denyGuess(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.processGuessFeedback(
                        resolveEmail(authentication),
                        new GuessFeedbackRequest(request.getGameId(), false)));
    }

    @PostMapping("/confirm")
    public ResponseEntity<GameResponse> confirmGuess(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                gameService.processGuessFeedback(
                        resolveEmail(authentication),
                        new GuessFeedbackRequest(request.getGameId(), true)));
    }

    // -------------------------------------------------------------------------
    // Tratamento de Optimistic Locking (clique duplo / requests simultâneos)
    // -------------------------------------------------------------------------

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleOptimisticLockingFailure() {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Ação rejeitada: o estado do jogo foi modificado por outra requisição simultânea.");
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private String resolveEmail(Authentication authentication) {
        return (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : "guest";
    }
}
