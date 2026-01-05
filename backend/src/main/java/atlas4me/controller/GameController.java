package atlas4me.controller;

import org.springframework.http.ResponseEntity;
import atlas4me.dto.response.GameResponse;
import atlas4me.entity.User;
import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.request.RevealRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import atlas4me.service.GameService;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping("/start")
    public ResponseEntity<GameResponse> startGame(Authentication authentication) {
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                           ? authentication.getName() 
                           : "guest"; //visitante jogar sem login
        GameResponse response = gameService.startNewGame(userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/answer")
    public ResponseEntity<GameResponse> submitAnswer(
            @Valid @RequestBody GameAnswerRequest request,
            Authentication authentication) {
            
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                           ? authentication.getName() 
                           : "guest";

        GameResponse response = gameService.submitAnswer(userEmail, request);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/history")
  public ResponseEntity<List<GameResponse>> getGameHistory(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(List.of()); // Visitante não tem histórico
        }
        String userEmail = authentication.getName();
        return ResponseEntity.ok(gameService.getUserGameHistory(userEmail));
    }

    @PostMapping("/deny")
    public ResponseEntity<GameResponse> denyGuess(
            @RequestBody GameAnswerRequest request, // <--- Agora recebemos o JSON com o gameId
            Authentication authentication) {
        
        // Verifica se é visitante ou usuário logado
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                           ? authentication.getName() 
                           : "guest";

        // Passa o ID do jogo para o serviço
        GameResponse response = gameService.denyRobotGuess(userEmail, request.getGameId());
        return ResponseEntity.ok(response);
    }

   @PostMapping("/confirm")
    public ResponseEntity<GameResponse> confirmGuess(
            @RequestBody GameAnswerRequest request, // <--- Precisamos do gameId aqui também
            Authentication authentication) {
        
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                           ? authentication.getName() 
                           : "guest";

        return ResponseEntity.ok(gameService.confirmRobotGuess(userEmail, request.getGameId()));
    }

    @PostMapping("/reveal")
    public ResponseEntity<GameResponse> revealAnswer(
            @RequestBody RevealRequest request, // <--- O RevealRequest precisa ter o gameId agora
            Authentication authentication) {
        
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                           ? authentication.getName() 
                           : "guest";

        // Passamos também o ID do jogo para o serviço saber qual jogo atualizar
        GameResponse response = gameService.revealAnswer(userEmail, request.getCountryId(), request.getGameId());

        return ResponseEntity.ok(response);
    }
}
