package atlas4me.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import atlas4me.repository.UserRepository;

/**
 * Implementação de {@link UserDetailsService} que carrega usuários ativos pelo e-mail.
 * Integrado automaticamente ao pipeline de autenticação do Spring Security.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Carrega um usuário ativo pelo e-mail (utilizado internamente pelo Spring Security).
     *
     * @param email endereço de e-mail utilizado como identificador de usuário.
     * @return {@link UserDetails} do usuário encontrado.
     * @throws UsernameNotFoundException se nenhum usuário ativo for encontrado para o e-mail.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
    }
}