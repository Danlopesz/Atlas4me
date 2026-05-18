package atlas4me.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import atlas4me.dto.request.LoginRequest;
import atlas4me.dto.request.RegisterRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.service.LoginService;
import atlas4me.service.RegisterService;

/**
 * Endpoints públicos de autenticação — registro e login de usuários.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterService registerService;
    private final LoginService loginService;

    /**
     * Registra um novo usuário na plataforma.
     *
     * @param request dados de cadastro validados.
     * @return {@link AuthResponse} com token JWT e informações do usuário criado.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(registerService.register(request));
    }

    /**
     * Autentica um usuário existente e retorna um token JWT.
     *
     * @param request credenciais de acesso validadas.
     * @return {@link AuthResponse} com token JWT e informações do usuário autenticado.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(loginService.login(request));
    }
}