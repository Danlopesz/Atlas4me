package atlas4me.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.request.GuessFeedbackRequest;
import atlas4me.dto.request.RevealRequest;
import atlas4me.dto.response.GameResponse;
import atlas4me.service.GameService;

/**
 * Endpoints do ciclo de vida de uma sessão de jogo (inferência de países).
 * Usuários não autenticados participam como "guest" com funcionalidades limitadas.
 */
@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    // -------------------------------------------------------------------------
    // Endpoints principais
    // -------------------------------------------------------------------------

    /**
     * Inicia uma nova sessão de jogo, descartando qualquer sessão ativa anterior.
     *
     * @param continent      continente para filtrar países (padrão: SOUTH_AMERICA).
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com a primeira pergunta e o estado inicial.
     */
    @PostMapping("/start")
    public ResponseEntity<GameResponse> startGame(
            @RequestParam(required = false, defaultValue = "SOUTH_AMERICA") String continent,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.startNewGame(resolveUserEmail(authentication), continent));
    }

    /**
     * Retorna o histórico de partidas encerradas do usuário autenticado.
     *
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return lista de {@link GameResponse} com o resumo de cada partida anterior,
     *         ou lista vazia para usuários não autenticados.
     */
    @GetMapping("/history")
    public ResponseEntity<List<GameResponse>> getGameHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(gameService.getUserGameHistory(authentication.getName()));
    }

    /**
     * Revela o país real pensado pelo usuário após o robô esgotar os candidatos.
     *
     * @param request        body com ID do jogo e ID do país revelado.
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com status REPORT e as discrepâncias de inferência.
     */
    @PostMapping("/reveal")
    public ResponseEntity<GameResponse> revealAnswer(
            @RequestBody RevealRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.revealAnswer(
                resolveUserEmail(authentication),
                request.getCountryId(),
                request.getGameId()));
    }

    /**
     * Processa a resposta do usuário à pergunta atual.
     * Retorna {@link GameResponse} com os ISO Codes dos países candidatos restantes.
     *
     * @param request        body com ID do jogo, ID da pergunta e valor booleano.
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com próxima pergunta ou palpite final do robô.
     */
    @PostMapping("/answer")
    public ResponseEntity<GameResponse> answerQuestion(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.submitAnswer(resolveUserEmail(authentication), request));
    }

    /**
     * Recebe o feedback do usuário sobre o palpite do robô.
     * {@code correct: true} → robô acertou (ROBOT_WON).
     * {@code correct: false} → robô errou, retoma a inferência com o próximo candidato.
     *
     * @param request        body com ID do jogo e flag de acerto.
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com o resultado ou a próxima pergunta.
     */
    @PostMapping("/guess-feedback")
    public ResponseEntity<GameResponse> provideGuessFeedback(
            @RequestBody GuessFeedbackRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.processGuessFeedback(resolveUserEmail(authentication), request));
    }

    // -------------------------------------------------------------------------
    // Endpoints legados — compatibilidade com frontend anterior
    // -------------------------------------------------------------------------

    /**
     * Nega o palpite do robô. Equivale a {@code POST /guess-feedback} com {@code correct: false}.
     *
     * @param request        body com ID do jogo.
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com a próxima pergunta ou estado de derrota do robô.
     * @deprecated Utilize {@code POST /guess-feedback} com body {@code {"correct": false}}.
     */
    @Deprecated
    @PostMapping("/deny")
    public ResponseEntity<GameResponse> denyGuess(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.processGuessFeedback(
                resolveUserEmail(authentication),
                new GuessFeedbackRequest(request.getGameId(), false)));
    }

    /**
     * Confirma o palpite do robô. Equivale a {@code POST /guess-feedback} com {@code correct: true}.
     *
     * @param request        body com ID do jogo.
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link GameResponse} com status ROBOT_WON.
     * @deprecated Utilize {@code POST /guess-feedback} com body {@code {"correct": true}}.
     */
    @Deprecated
    @PostMapping("/confirm")
    public ResponseEntity<GameResponse> confirmGuess(
            @RequestBody GameAnswerRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(gameService.processGuessFeedback(
                resolveUserEmail(authentication),
                new GuessFeedbackRequest(request.getGameId(), true)));
    }

    // -------------------------------------------------------------------------
    // Tratamento de erros
    // -------------------------------------------------------------------------

    /**
     * Trata conflitos de Optimistic Locking causados por cliques duplos ou requisições simultâneas.
     *
     * @return HTTP 409 com mensagem explicativa.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleOptimisticLockingFailure() {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Ação rejeitada: o estado do jogo foi modificado por outra requisição simultânea.");
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private String resolveUserEmail(Authentication authentication) {
        return (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : "guest";
    }
}