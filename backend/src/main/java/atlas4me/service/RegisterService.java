package atlas4me.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import atlas4me.config.JwtTokenProvider;
import atlas4me.dto.request.RegisterRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.entity.User;
import atlas4me.exception.DuplicateEmailException;
import atlas4me.repository.UserRepository;

/**
 * Serviço responsável pelo cadastro de novos usuários e emissão do token JWT inicial.
 */
@Service
@RequiredArgsConstructor
public class RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Registra um novo usuário na plataforma e retorna um token JWT.
     *
     * @param request dados de cadastro do novo usuário.
     * @return {@link AuthResponse} com token JWT e dados do usuário criado.
     * @throws DuplicateEmailException se o e-mail informado já estiver cadastrado.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email já cadastrado: " + request.getEmail());
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setActive(true);
        user.setTotalScore(0);
        user.setGamesPlayed(0);

        user = userRepository.save(user);
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