package atlas4me.controller;

import atlas4me.dto.response.ProfileStatsResponse;
import atlas4me.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller para estatísticas do perfil do usuário.
 * Todos os endpoints requerem autenticação JWT.
 */
@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Retorna as estatísticas completas do perfil do usuário autenticado.
     * Inclui: países descobertos, ISO codes (para o globo), contagens de partidas,
     * etc.
     *
     * @param authentication JWT Authentication injetado automaticamente pelo Spring
     *                       Security
     * @return ProfileStatsDTO com todas as métricas do perfil
     */
    @GetMapping("/stats")
    public ResponseEntity<ProfileStatsResponse> getProfileStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String userEmail = authentication.getName();
        ProfileStatsResponse stats = profileService.getProfileStats(userEmail);
        return ResponseEntity.ok(stats);
    }
}
