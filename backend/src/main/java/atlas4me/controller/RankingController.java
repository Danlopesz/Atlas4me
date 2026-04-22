package atlas4me.controller;

import atlas4me.dto.response.RankingResponse;
import atlas4me.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller público do ranking global.
 * Anônimos veem o top 10 sem currentUserEntry.
 * Autenticados veem top 10 + sua posição individual.
 */
@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    /**
     * GET /api/ranking — Ranking global de países descobertos.
     * Público: não requer autenticação.
     * Se autenticado, inclui a posição do usuário no ranking.
     */
    @GetMapping
    public ResponseEntity<RankingResponse> getRanking(Authentication authentication) {
        String userEmail = null;
        if (authentication != null && authentication.isAuthenticated()) {
            userEmail = authentication.getName();
        }

        RankingResponse ranking = rankingService.getRanking(userEmail);
        return ResponseEntity.ok(ranking);
    }
}
