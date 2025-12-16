package atlas4me.service;

import atlas4me.config.JwtTokenProvider;
import atlas4me.dto.request.RegisterRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.entity.User;
import atlas4me.exception.DuplicateEmailException;
import atlas4me.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Verifica se o email já existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email já cadastrado: " + request.getEmail());
        }
        
        // Cria novo usuário
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setGender(User.Gender.valueOf(request.getGender()));
        user.setRole(User.Role.USER);
        user.setActive(true);
        user.setTotalScore(0);
        user.setGamesPlayed(0);
        
        // Salva no banco
        user = userRepository.save(user);
        
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
