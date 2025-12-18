
package atlas4me.controller;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import atlas4me.dto.request.LoginRequest;
import atlas4me.dto.request.RegisterRequest;
import atlas4me.dto.response.AuthResponse;
import atlas4me.service.LoginService;
import atlas4me.service.RegisterService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final RegisterService registerService;
    private final LoginService loginService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = registerService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = loginService.login(request);
        return ResponseEntity.ok(response);
    }
}
