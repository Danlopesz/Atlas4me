package atlas4me.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import atlas4me.dto.response.ProfileStatsResponse;
import atlas4me.service.ProfileService;

/**
 * Endpoints de perfil do usuário autenticado.
 * Todos os endpoints requerem autenticação JWT válida.
 */
@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Retorna as estatísticas completas do perfil do usuário autenticado.
     * Inclui países descobertos, ISO codes para o globo e contagens de partidas.
     *
     * @param authentication contexto de segurança injetado pelo Spring Security.
     * @return {@link ProfileStatsResponse} com todas as métricas do perfil,
     *         ou HTTP 401 se o usuário não estiver autenticado.
     */
    @GetMapping("/stats")
    public ResponseEntity<ProfileStatsResponse> getProfileStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ProfileStatsResponse stats = profileService.getProfileStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }
}