package atlas4me.service;
import atlas4me.config.JwtTokenProvider;
import atlas4me.dto.request.LoginRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class LoginService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse login(LoginRequest request) {
        // Autentica o usuário
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        // Obtém o usuário do contexto de autenticação (já carregado pelo CustomUserDetailsService)
        User user = (User) authentication.getPrincipal();
        
        // Gera token JWT
        String token = jwtTokenProvider.generateToken(user);
        
        // Retorna resposta
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
