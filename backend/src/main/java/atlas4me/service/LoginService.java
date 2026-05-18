package atlas4me.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import atlas4me.config.JwtTokenProvider;
import atlas4me.dto.request.LoginRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.entity.User;

/**
 * Serviço responsável pela autenticação de usuários e emissão de tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Autentica o usuário com e-mail e senha e retorna um token JWT.
     *
     * @param request credenciais de acesso do usuário.
     * @return {@link AuthResponse} com token JWT e dados do usuário autenticado.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = (User) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .totalScore(user.getTotalScore())
                .gamesPlayed(user.getGamesPlayed())
                .build();
    }
}