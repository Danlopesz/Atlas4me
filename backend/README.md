# 🌍 Atlas4Me Backend - API REST

> Backend Java Spring Boot para o jogo de adivinhação de países Atlas4Me - Um sistema completo de autenticação, gamificação e algoritmo de filtragem dinâmica de países baseado em características geográficas e culturais.

## 🚀 Tecnologias

- Java 17
- Spring Boot 3.2.0
- Spring Security com JWT
- Spring Data JPA
- H2 Database (desenvolvimento)
- Maven
- Lombok

## 📋 Índice

- [Visão Geral Técnica](#-visão-geral-técnica)
- [Arquitetura e Design Patterns](#-arquitetura-e-design-patterns)
- [Fluxo de Funcionamento](#-fluxo-de-funcionamento)
- [Modelo de Dados](#-modelo-de-dados)
- [Tecnologias](#-tecnologias)
- [API Endpoints](#-api-endpoints)
- [Segurança](#-segurança)
- [Como Executar](#-como-executar)

---

## 🎯 Visão Geral Técnica

### Conceito do Sistema

O **Atlas4Me** é uma aplicação gamificada de adivinhação de países que utiliza um algoritmo de filtragem progressiva baseado em características geográficas e culturais. O jogador faz perguntas sobre atributos do país (ex: "Tem praia?", "Fala espanhol?") e o sistema elimina países que não correspondem às respostas, similar ao jogo "Akinator", mas focado em geografia.

### Arquitetura Geral

O sistema foi construído seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, com separação clara de responsabilidades em camadas:

```
Presentation Layer (Controllers)
        ↓
Application Layer (Services - Business Logic)
        ↓
Domain Layer (Entities - Business Models)
        ↓
Infrastructure Layer (Repositories, Security, Exception Handling)
```

---

## 🏗️ Arquitetura e Design Patterns

### 1. **Feature-Sliced Design**

O projeto utiliza uma arquitetura híbrida que combina organização por camadas técnicas com agrupamento por features de negócio:

```
atlas4me/
├── entity/                    # Domain Layer - Modelos de domínio JPA
├── features/                  # Application Layer - Lógica de negócio por feature
│   ├── auth/                  # Feature: Autenticação
│   └── game/                  # Feature: Jogo
├── controller/                # Presentation Layer - REST Controllers
├── infra/                     # Infrastructure Layer - Repositórios e config
├── security/                  # Cross-cutting concern - Segurança JWT
└── shared/                    # Shared Kernel - Exceções e utilitários
```

**Vantagens desta abordagem:**
- **Coesão alta**: Código relacionado fica próximo
- **Baixo acoplamento**: Features independentes
- **Escalabilidade**: Fácil adicionar novas features
- **Manutenibilidade**: Mudanças isoladas por contexto

### 2. **Design Patterns Implementados**

#### **Repository Pattern**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```
- **Objetivo**: Abstração da camada de persistência
- **Benefício**: Facilita testes e troca de banco de dados

#### **Service Layer Pattern**
```java
@Service
@RequiredArgsConstructor
public class GameService {
    private final GameSessionRepository gameSessionRepository;
    private final CountryRepository countryRepository;
    // Lógica de negócio isolada
}
```
- **Objetivo**: Encapsular lógica de negócio
- **Benefício**: Separação entre controle (controller) e processamento (service)

#### **DTO (Data Transfer Object) Pattern**
```java
@Data
@Builder
public class AuthResponse {
    private String token;
    private Long userId;
    // Apenas dados necessários para o cliente
}
```
- **Objetivo**: Controlar quais dados são expostos na API
- **Benefício**: Segurança e performance (não expõe entidades diretamente)

#### **Global Exception Handler Pattern**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        // Tratamento centralizado
    }
}
```
- **Objetivo**: Tratamento centralizado de exceções
- **Benefício**: Respostas consistentes e código limpo nos controllers

#### **Builder Pattern (Lombok)**
```java
@Builder
public class GameResponse {
    // Construção fluente de objetos complexos
}
```
- **Objetivo**: Facilitar criação de objetos imutáveis
- **Benefício**: Código mais legível e manutenível

---

## ⚙️ Fluxo de Funcionamento

### **Fluxo de Autenticação (JWT)**

```
1. Cliente envia credenciais
   ↓
2. AuthController.login() recebe request
   ↓
3. LoginService processa:
   - AuthenticationManager valida credenciais
   - Busca User no banco via UserRepository
   - JwtTokenProvider gera token JWT assinado
   ↓
4. Retorna AuthResponse com token
   ↓
5. Cliente armazena token e envia em requisições futuras
   ↓
6. JwtAuthenticationFilter intercepta requisições:
   - Extrai token do header Authorization
   - Valida assinatura e expiração
   - Carrega UserDetails via CustomUserDetailsService
   - Injeta Authentication no SecurityContext
   ↓
7. Controller acessa usuário autenticado via @AuthenticationPrincipal
```

**Código do filtro JWT:**
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                                HttpServletResponse response, 
                                FilterChain filterChain) {
    String token = extractTokenFromRequest(request);
    
    if (token != null && jwtTokenProvider.validateToken(token)) {
        String username = jwtTokenProvider.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(userDetails, null, 
                                                    userDetails.getAuthorities());
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    
    filterChain.doFilter(request, response);
}
```

### **Fluxo do Jogo**

#### **1. Iniciar Novo Jogo**

```
Cliente: POST /api/game/start
   ↓
GameController.startNewGame(Authentication auth)
   ↓
GameService.startNewGame(userEmail):
   1. Busca User no banco
   2. Verifica se já tem jogo ativo (BusinessException se sim)
   3. CountryService.getRandomCountry() seleciona país aleatório
   4. Cria GameSession:
      - targetCountry = país sorteado
      - score = 100 (inicial)
      - attempts = 0
      - completed = false
   5. Salva GameSession no banco
   6. Busca todos países ativos (lista inicial)
   ↓
Retorna GameResponse:
   - gameId
   - score: 100
   - remainingCountries: ["Brasil", "Argentina", ...] (25 países)
   - targetCountry: null (oculto do jogador)
```

#### **2. Submeter Resposta**

```
Cliente: POST /api/game/answer
Body: { "countryId": 1, "question": "has_beach", "answer": true }
   ↓
GameController.submitAnswer()
   ↓
GameService.submitAnswer():
   
   1. VALIDAÇÃO
      - Busca User
      - Busca GameSession ativa
      - Valida que jogo não está completo
   
   2. PROCESSAMENTO DA RESPOSTA
      - Busca Country tentado
      - Busca targetCountry da sessão
      - targetCountry.hasCharacteristic("has_beach", true)
        → Usa reflexão para acessar campo hasBeach
        → Compara com resposta esperada
      - isCorrect = (valor real == valor respondido)
   
   3. REGISTRO DA TENTATIVA
      - Cria GameAttempt:
          * gameSession
          * guessedCountry
          * question: "has_beach"
          * answer: true
          * correct: isCorrect
      - Salva no banco
   
   4. ATUALIZAÇÃO DA SESSÃO
      - Incrementa attempts
      - Se errado: score -= 10 (mínimo 0)
   
   5. ALGORITMO DE FILTRAGEM
      - Busca TODAS tentativas corretas da sessão
      - Para cada tentativa correta:
          * Filtra países que têm aquela característica
      - remainingCountries = países que passaram todos os filtros
   
   6. VERIFICAÇÃO DE FIM DE JOGO
      
      a) VITÓRIA: guessedCountry.id == targetCountry.id
         - gameSession.finish(true)
         - user.gamesPlayed++
         - user.totalScore += gameSession.score
         - feedback: "Parabéns! Você acertou..."
         
      b) DERROTA: remainingCountries.size() <= 1
         - gameSession.finish(false)
         - user.gamesPlayed++
         - feedback: "Você perdeu! O país era..."
         
      c) CONTINUA:
         - feedback: "Resposta correta!" ou "Incorreta! -10 pontos"
   
   7. PERSISTÊNCIA
      - Salva gameSession atualizada
      - Salva user (se jogo terminou)
   ↓
Retorna GameResponse:
   - attempts: 3
   - score: 80
   - remainingCountries: ["Brasil", "Uruguai"] (países filtrados)
   - completed: false/true
   - won: false/true
   - targetCountry: null ou "Brasil" (se terminou)
```

**Algoritmo de Filtragem (Detalhado):**

```java
// Busca todas tentativas corretas
List<GameAttempt> allAttempts = gameAttemptRepository
    .findByGameSessionOrderByAttemptedAtAsc(gameSession);

// Começa com todos países ativos
List<Country> remainingCountries = countryRepository.findByActiveTrue();

// Para cada tentativa CORRETA, filtra
for (GameAttempt attempt : allAttempts) {
    if (attempt.getCorrect()) {
        String question = attempt.getQuestion();    // Ex: "has_beach"
        Boolean answer = attempt.getAnswer();       // Ex: true
        
        remainingCountries = remainingCountries.stream()
            .filter(country -> country.hasCharacteristic(question, answer))
            .collect(Collectors.toList());
    }
}

// hasCharacteristic() usa reflexão:
public boolean hasCharacteristic(String characteristic, Boolean expectedValue) {
    String fieldName = toFieldName(characteristic); // "has_beach" → "hasBeach"
    Field field = this.getClass().getDeclaredField(fieldName);
    field.setAccessible(true);
    Boolean value = (Boolean) field.get(this);
    return value.equals(expectedValue);
}
```

**Exemplo Prático:**

```
Jogo começou: 25 países
País alvo: Brasil (hasBeach=true, speaksPortuguese=true, inSouthAmerica=true)

Tentativa 1: "has_beach" = true → CORRETA
   Filtro: países com hasBeach=true
   Restam: 18 países

Tentativa 2: "speaks_spanish" = false → CORRETA
   Filtro: países com hasBeach=true AND speaksSpanish=false
   Restam: 5 países (Brasil, Uruguai, França, Itália, Grécia)

Tentativa 3: "in_europe" = false → CORRETA
   Filtro: hasBeach=true AND speaksSpanish=false AND inEurope=false
   Restam: 2 países (Brasil, Uruguai)

Tentativa 4: Chute "Brasil" → VITÓRIA!
   Score final: 70 pontos (100 - 30 por erros anteriores)
```

### **Fluxo de Histórico**

```
Cliente: GET /api/game/history
   ↓
GameController.getHistory()
   ↓
GameService.getUserGameHistory():
   1. Busca User
   2. gameSessionRepository.findByUserOrderByStartedAtDesc(user)
   3. Converte cada GameSession para GameHistoryDTO:
      - gameId
      - targetCountry.name (revelado)
      - score final
      - attempts
      - won
      - startedAt / finishedAt
   ↓
Retorna List<GameHistoryDTO> ordenado por data (mais recente primeiro)
```

---

## 📊 Modelo de Dados

### **Entidades e Relacionamentos**

```sql
┌─────────────────┐         ┌──────────────────┐
│      User       │         │     Country      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ firstName       │         │ name             │
│ lastName        │         │ code             │
│ email (UNIQUE)  │         │ hasBeach         │
│ password (hash) │         │ isTropical       │
│ gender (ENUM)   │         │ hasDesert        │
│ role (ENUM)     │         │ hasMountains     │
│ totalScore      │         │ isIsland         │
│ gamesPlayed     │         │ speaksSpanish    │
│ active          │         │ speaksEnglish    │
│ createdAt       │         │ ... (20+ attrs)  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ 1:N                   N:1 │
         │                           │
         └──────────┐     ┌──────────┘
                    │     │
            ┌───────▼─────▼────────┐
            │    GameSession       │
            ├──────────────────────┤
            │ id (PK)              │
            │ user_id (FK)         │
            │ target_country_id(FK)│
            │ score                │
            │ attempts             │
            │ completed            │
            │ won                  │
            │ startedAt            │
            │ finishedAt           │
            └───────────┬──────────┘
                        │
                        │ 1:N
                        │
            ┌───────────▼──────────┐
            │    GameAttempt       │
            ├──────────────────────┤
            │ id (PK)              │
            │ game_session_id (FK) │
            │ guessed_country_id(FK)│
            │ question             │
            │ answer (BOOLEAN)     │
            │ correct (BOOLEAN)    │
            │ attemptedAt          │
            └──────────────────────┘
```

### **Detalhamento das Entidades**

#### **User - Agregado Raiz do Contexto de Autenticação**

## 🏗️ Estrutura do Projeto

```
backend/
├── src/main/java/altas4me/
│   ├── controller/          # Controllers REST
│   │   ├── AuthController.java
│   │   ├── GameController.java
│   │   └── CountryController.java
│   ├── entity/              # Entidades JPA
│   │   ├── User.java
│   │   ├── Country.java
│   │   ├── GameSession.java
│   │   └── GameAttempt.java
│   ├── features/            # Lógica de negócio
│   │   ├── auth/
│   │   │   ├── RegisterService.java
│   │   │   └── LoginService.java
│   │   └── game/
│   │       ├── GameService.java
│   │       ├── CountryService.java
│   │       └── GameAlgorithmService.java
│   ├── infra/               # Infraestrutura
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── CountryRepository.java
│   │   │   ├── GameSessionRepository.java
│   │   │   └── GameAttemptRepository.java
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       ├── ErrorResponse.java
│   │       └── ValidationErrorResponse.java
│   ├── security/            # Segurança JWT
│   │   ├── SecurityConfig.java
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── shared/              # DTOs e utilitários
│       ├── dto/
│       │   ├── RegisterRequest.java
│       │   ├── LoginRequest.java
│       │   ├── AuthResponse.java
│       │   ├── GameAnswerRequest.java
│       │   ├── GameResponse.java
│       │   ├── CountryDTO.java
│       │   └── GameHistoryDTO.java
│       ├── exception/
│       │   ├── ResourceNotFoundException.java
│       │   ├── BusinessException.java
│       │   └── DuplicateEmailException.java
│       └── Utils.java
└── src/main/resources/
    ├── application.properties
    └── data.sql
```

## 🔌 API Endpoints

### Autenticação

#### Cadastro
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "gender": "MALE"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "joao@email.com",
  "firstName": "João",
  "lastName": "Silva",
  "totalScore": 0,
  "gamesPlayed": 0
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "joao@email.com",
  "firstName": "João",
  "lastName": "Silva",
  "totalScore": 150,
  "gamesPlayed": 3
}
```

### Jogo

#### Iniciar Novo Jogo
```http
POST /api/game/start
Authorization: Bearer {token}

Response: 200 OK
{
  "gameId": 1,
  "targetCountry": null,
  "attempts": 0,
  "score": 100,
  "completed": false,
  "won": false,
  "remainingCountries": ["Brasil", "Argentina", "Chile", ...],
  "feedback": "Jogo iniciado! Faça perguntas para descobrir o país."
}
```

#### Responder Pergunta
```http
POST /api/game/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "countryId": 1,
  "question": "has_beach",
  "answer": true
}

Response: 200 OK
{
  "gameId": 1,
  "targetCountry": null,
  "attempts": 1,
  "score": 100,
  "completed": false,
  "won": false,
  "remainingCountries": ["Brasil", "Argentina", "Chile"],
  "feedback": "Resposta correta!"
}
```

#### Histórico de Jogos
```http
GET /api/game/history
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "gameId": 1,
    "targetCountry": "Brasil",
    "score": 80,
    "attempts": 5,
    "won": true,
    "startedAt": "2025-12-13T10:00:00",
    "finishedAt": "2025-12-13T10:05:00"
  }
]
```

### Países

#### Listar Países
```http
GET /api/countries

Response: 200 OK
[
  {
    "id": 1,
    "name": "Brasil",
    "code": "BR"
  },
  {
    "id": 2,
    "name": "Argentina",
    "code": "AR"
  }
]
```

- **Responsabilidades**: 
  - Autenticação (implementa `UserDetails`)
  - Armazenamento de estatísticas (score, games played)
  - Agregação de GameSessions

- **Relacionamentos**:
  - `@OneToMany` com GameSession (cascade ALL)
  
- **Validações**:
  - Email único e formato válido
  - Senha criptografada com BCrypt
  
- **Auditoria**: `createdAt`, `updatedAt` com `@PrePersist` e `@PreUpdate`

#### **Country - Value Object Rico**

- **Responsabilidades**:
  - Armazenar 20+ características booleanas
  - Método `hasCharacteristic()` para validação dinâmica via reflexão
  
- **Características**:
  ```java
  hasBeach, isTropical, hasDesert, hasMountains, isIsland, isLandlocked,
  speaksSpanish, speaksEnglish, speaksPortuguese, speaksFrench,
  inEurope, inAsia, inAfrica, inNorthAmerica, inSouthAmerica, inOceania,
  hasMonarchy, isRepublic, populationOver100M, populationUnder10M
  ```

- **Método Chave**:
  ```java
  public boolean hasCharacteristic(String characteristic, Boolean expectedValue) {
      // Converte "has_beach" → "hasBeach"
      // Usa reflexão para acessar campo
      // Compara com valor esperado
  }
  ```

#### **GameSession - Agregado Raiz do Contexto de Jogo**

- **Responsabilidades**:
  - Controlar estado de uma partida
  - Calcular pontuação
  - Gerenciar ciclo de vida (start → attempts → finish)
  
- **Estados**:
  - `completed=false, won=false`: Em andamento
  - `completed=true, won=true`: Vitória
  - `completed=true, won=false`: Derrota
  
- **Regras de Negócio**:
  - Score inicial: 100 pontos
  - Penalidade: -10 por erro
  - Score mínimo: 0
  - Um usuário só pode ter 1 jogo ativo por vez
  
- **Método de Conclusão**:
  ```java
  public void finish(boolean won) {
      this.completed = true;
      this.won = won;
      this.finishedAt = LocalDateTime.now();
  }
  ```

#### **GameAttempt - Entidade de Auditoria**

- **Responsabilidades**:
  - Registrar histórico de cada tentativa
  - Permitir análise de estratégias
  - Base para algoritmo de filtragem
  
- **Campos Importantes**:
  - `question`: Nome do campo (ex: "has_beach")
  - `answer`: Valor respondido (true/false)
  - `correct`: Se a resposta estava correta
  - `guessedCountry`: País que o jogador tentou

---

## 🔐 Segurança

### **Camada de Segurança JWT**

#### **1. JwtTokenProvider**

```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long expiration;
    
    // Gera token assinado com HS256
    public String generateToken(UserDetails userDetails) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }
    
    // Valida assinatura e expiração
    public boolean validateToken(String token) {
        try {
            parser().verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
```

**Características:**
- Algoritmo: HMAC-SHA256 (HS256)
- Payload: `{ sub: "user@email.com", iat: 1234567890, exp: 1234654290 }`
- Secret: 256 bits em Base64
- Expiração: 24 horas (configurável)

#### **2. JwtAuthenticationFilter**

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // 1. Extrai token do header "Authorization: Bearer <token>"
        String token = extractToken(request);
        
        // 2. Valida token
        if (token != null && jwtTokenProvider.validateToken(token)) {
            
            // 3. Extrai username (email) do token
            String username = jwtTokenProvider.extractUsername(token);
            
            // 4. Carrega UserDetails do banco
            UserDetails userDetails = customUserDetailsService
                .loadUserByUsername(username);
            
            // 5. Cria objeto de autenticação
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, 
                    null, 
                    userDetails.getAuthorities()
                );
            
            // 6. Injeta no SecurityContext
            SecurityContextHolder.getContext()
                .setAuthentication(authentication);
        }
        
        // 7. Continua cadeia de filtros
        filterChain.doFilter(request, response);
    }
}
```

**Fluxo de Filtro:**
```
Request → JwtAuthenticationFilter → SecurityFilterChain → Controller
              ↓
         Valida Token
              ↓
         Injeta Authentication
              ↓
         SecurityContext disponível em @AuthenticationPrincipal
```

#### **3. SecurityConfig**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .csrf(csrf -> csrf.disable())  // API REST sem CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(STATELESS))  // JWT é stateless
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/countries").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, 
                            UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // BCrypt com salt automático
    }
}
```

**Configurações de Segurança:**
- **CSRF**: Desabilitado (API REST não precisa)
- **CORS**: Configurado para aceitar localhost:5173 e :3000
- **Sessão**: STATELESS (não cria sessão HTTP)
- **Endpoints Públicos**: `/api/auth/*`, `/api/countries`
- **Endpoints Protegidos**: Todos os demais requerem JWT

#### **4. CustomUserDetailsService**

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }
}
```

**Integração com Spring Security:**
- User implementa `UserDetails`
- Spring Security usa para autenticação
- Carrega usuário do banco automaticamente

---

## 🧪 Validações e Tratamento de Erros

### **Bean Validation (Jakarta Validation)**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 50, message = "Nome deve ter entre 2 e 50 caracteres")
    private String firstName;
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String password;
    
    @NotNull(message = "Gênero é obrigatório")
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Gênero inválido")
    private String gender;
}
```

**Validação Automática:**
```java
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    // @Valid aciona validação antes de entrar no método
    // Se falhar, lança MethodArgumentNotValidException
}
```

### **Global Exception Handler**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // 404 - Recurso não encontrado
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(404)
                        .error("Not Found")
                        .message(ex.getMessage())
                        .build());
    }
    
    // 409 - Email duplicado
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(409)
                        .error("Conflict")
                        .message(ex.getMessage())
                        .build());
    }
    
    // 400 - Validação falhou
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        return ResponseEntity.badRequest()
                .body(ValidationErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(400)
                        .error("Validation Failed")
                        .errors(errors)
                        .build());
    }
    
    // 401 - Credenciais inválidas
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder()
                        .timestamp(LocalDateTime.now())
                        .status(401)
                        .error("Unauthorized")
                        .message("Email ou senha inválidos")
                        .build());
    }
}
```

**Respostas de Erro Padronizadas:**

```json
// Erro 404
{
  "timestamp": "2025-12-14T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Usuário não encontrado"
}

// Erro de Validação 400
{
  "timestamp": "2025-12-14T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "errors": {
    "email": "Email inválido",
    "password": "Senha deve ter no mínimo 6 caracteres"
  }
}
```

---

## 📡 Integração com Frontend

### **CORS Configuration**

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
        "http://localhost:5173",  // Vite
        "http://localhost:3000"   // Create React App
    ));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### **Exemplo de Integração React**

```javascript
// 1. Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5202/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// 2. Requisição autenticada
const startGame = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5202/api/game/start', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## 🗄️ Persistência e Banco de Dados

### **H2 Database (Desenvolvimento)**

```properties
spring.datasource.url=jdbc:h2:mem:atlas4me;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

**Características:**
- In-memory: dados perdidos ao reiniciar
- Console web para debugging
- DDL automático via Hibernate
- População via `data.sql`

### **data.sql - População Inicial**

```sql
INSERT INTO countries (name, code, has_beach, is_tropical, speaks_portuguese, 
                      in_south_america, active) 
VALUES ('Brasil', 'BR', true, true, true, true, true);

INSERT INTO countries (name, code, has_beach, speaks_spanish, 
                      in_south_america, active) 
VALUES ('Argentina', 'AR', true, true, true, true);
-- ... 23 países adicionais
```

**25 Países Incluídos:**
Brasil, Argentina, Chile, EUA, Canadá, México, França, Alemanha, Itália, 
Espanha, Reino Unido, Portugal, Rússia, China, Japão, Índia, Austrália, 
Egito, África do Sul, Nigéria, Marrocos, Turquia, Grécia, Suécia, Noruega

### **JPA/Hibernate Configuration**

```properties
spring.jpa.hibernate.ddl-auto=create-drop  # Recria schema a cada start
spring.jpa.show-sql=true                   # Log de queries SQL
spring.jpa.properties.hibernate.format_sql=true  # SQL formatado
spring.jpa.defer-datasource-initialization=true  # data.sql após DDL
```

**Estratégias de ID:**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;  // Auto-increment nativo do banco
```

### **Relacionamentos JPA**

```java
// User → GameSession (1:N, Bidirecional)
@Entity
public class User {
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameSession> gameSessions;
}

@Entity
public class GameSession {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

// GameSession → GameAttempt (1:N, Bidirecional)
@Entity
public class GameSession {
    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameAttempt> gameAttempts;
}

// GameSession → Country (N:1, Unidirecional)
@Entity
public class GameSession {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_country_id", nullable = false)
    private Country targetCountry;
}
```

**Lazy Loading:**
- Relacionamentos `@ManyToOne` e `@OneToMany` com `FetchType.LAZY`
- Evita N+1 queries
- Dados carregados sob demanda

---

## 🚀 Performance e Otimizações

### **1. Queries Otimizadas**

```java
@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    
    // Query nativa para pegar país aleatório (1 query ao invés de 2)
    @Query(value = "SELECT * FROM countries WHERE active = true ORDER BY RAND() LIMIT 1", 
           nativeQuery = true)
    Optional<Country> findRandomActiveCountry();
    
    // Apenas países ativos
    List<Country> findByActiveTrue();
}

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    
    // Query indexed por user_id e completed
    Optional<GameSession> findByUserAndCompletedFalse(User user);
    
    // Ordenação no banco, não em memória
    List<GameSession> findByUserOrderByStartedAtDesc(User user);
    
    // Agregação no banco
    @Query("SELECT COUNT(gs) FROM GameSession gs WHERE gs.user = :user AND gs.won = true")
    long countWonGamesByUser(@Param("user") User user);
}
```

### **2. Transações**

```java
@Service
@RequiredArgsConstructor
public class GameService {
    
    @Transactional  // Garante atomicidade
    public GameResponse startNewGame(String userEmail) {
        // Todas operações em uma única transação
        // Rollback automático em caso de exceção
    }
    
    @Transactional
    public GameResponse submitAnswer(String userEmail, GameAnswerRequest request) {
        // Múltiplas entidades atualizadas atomicamente
    }
}
```

### **3. Connection Pool**

Spring Boot configura Hikari CP automaticamente:
- Pool mínimo: 10 conexões
- Pool máximo: dependente do ambiente
- Timeout: 30s

---

## 📚 Swagger/OpenAPI

### **Configuração**

```java
@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Atlas4Me API")
                        .version("1.0.0")
                        .description("API para jogo de adivinhação de países"))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"));
    }
}
```

### **Acessar Swagger UI**

- **URL**: http://localhost:5202/swagger-ui.html
- **OpenAPI JSON**: http://localhost:5202/api-docs

**Autenticação no Swagger:**
1. Use `/api/auth/login` para obter token
2. Clique em "Authorize"
3. Cole o token (sem "Bearer ")
4. Teste endpoints protegidos

---

## ⚙️ Configuração

### application.properties

```properties
# Servidor
server.port=8080

# Banco de Dados H2 (Desenvolvimento)
spring.datasource.url=jdbc:h2:mem:atlas4me
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT
jwt.secret={sua-chave-secreta-base64}
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

## 🚀 Como Executar

1. **Clone o repositório**
```bash
git clone {seu-repositorio}
cd backend
```

2. **Compile o projeto**
```bash
mvn clean install
```

3. **Execute a aplicação**
```bash
mvn spring-boot:run
```

4. **Acesse**
- API: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console

## 🗄️ Banco de Dados

O projeto usa H2 Database em memória para desenvolvimento. Os dados são populados automaticamente com 25 países ao iniciar a aplicação.

### Acessar H2 Console
- URL: http://localhost:8080/h2-console
- JDBC URL: jdbc:h2:mem:atlas4me
- Username: sa
- Password: (vazio)

## 🔒 Segurança

- **JWT (JSON Web Token)** para autenticação
- **BCrypt** para hash de senhas
- **Spring Security** para autorização
- Token expira em 24 horas
- CORS configurado para frontend local

## 📝 Validações

- Email único e válido
- Senha mínima de 6 caracteres
- Campos obrigatórios validados
- Tratamento de erros centralizado

## 🧪 Testando a API

### Com cURL

```bash
# Cadastro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "gender": "MALE"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'

# Iniciar Jogo
curl -X POST http://localhost:8080/api/game/start \
  -H "Authorization: Bearer {seu-token}"

# Listar Países
curl http://localhost:8080/api/countries
```

## 📦 Build para Produção

```bash
mvn clean package -DskipTests
java -jar target/atlas4me-backend-1.0.0.jar
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Seu Nome - Desenvolvimento Backend

## 📞 Suporte

Para suporte, envie um email para support@atlas4me.com
