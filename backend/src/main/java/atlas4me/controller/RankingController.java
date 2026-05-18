package atlas4me.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import atlas4me.dto.response.RankingResponse;
import atlas4me.service.RankingService;

/**
 * Endpoint público do ranking global de países descobertos.
 * Anônimos recebem o top 10 sem posição individual.
 * Autenticados recebem o top 10 acrescido de sua posição no ranking.
 */
@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    /**
     * Retorna o ranking global de países descobertos pelos jogadores.
     *
     * @param authentication contexto de segurança injetado pelo Spring Security;
     *                       pode ser {@code null} para requisições anônimas.
     * @return {@link RankingResponse} com o top 10 e, se autenticado,
     *         a posição individual do usuário.
     */
    @GetMapping
    public ResponseEntity<RankingResponse> getRanking(Authentication authentication) {
        String userEmail = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;

        return ResponseEntity.ok(rankingService.getRanking(userEmail));
    }
}