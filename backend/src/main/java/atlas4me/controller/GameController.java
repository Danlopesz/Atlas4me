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
        String userEmail = authentication.getName();
        GameResponse response = gameService.startNewGame(userEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/answer")
    public ResponseEntity<GameResponse> submitAnswer(
            @Valid @RequestBody GameAnswerRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        GameResponse response = gameService.submitAnswer(userEmail, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<GameResponse>> getGameHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        List<GameResponse> history = gameService.getUserGameHistory(userEmail);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/deny")
    public ResponseEntity<GameResponse> denyGuess(@AuthenticationPrincipal User user) {
        // Chama o serviço para registrar que o robô errou o chute
        GameResponse response = gameService.denyRobotGuess(user.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reveal")
    public ResponseEntity<GameResponse> revealAnswer(
            @RequestBody RevealRequest request, 
            @AuthenticationPrincipal User user
    ) {
        // AQUI usamos o countryId que vem do DTO
        GameResponse response = gameService.revealAnswer(user.getEmail(), request.getCountryId());
        
        return ResponseEntity.ok(response);
    }
}
