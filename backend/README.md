# 🌍 Atlas4Me Backend - API REST

> Backend Java Spring Boot para o jogo de adivinhação de países Atlas4Me (estilo Akinator geográfico). Sistema completo de autenticação JWT, gamificação com pontuação e algoritmo inteligente de filtragem progressiva baseado em características geográficas e culturais dos países da América do Sul.

## 🚀 Stack Tecnológica

- **Java 21** - Linguagem principal
- **Spring Boot 3.2.0** - Framework web e injeção de dependências
- **Spring Security** - Autenticação e autorização
- **JWT (JSON Web Token)** - Tokens stateless para autenticação
- **Spring Data JPA** - Abstração de persistência (ORM)
- **Hibernate** - Implementação JPA
- **MySQL** - Banco relacional (produção)
- **Flyway** - Versionamento de migrations
- **Lombok** - Redução de boilerplate
- **Maven** - Gerenciamento de dependências

## 📋 Índice

- [Conceito do Jogo](#-conceito-do-jogo)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Modelo de Dados - Entidades Explicadas](#-modelo-de-dados---entidades-explicadas)
- [Relacionamentos Entre Entidades](#-relacionamentos-entre-entidades)
- [Fluxo de Funcionamento](#-fluxo-de-funcionamento)
- [API Endpoints](#-api-endpoints)
- [Segurança JWT](#-segurança-jwt)
- [Análise de Redundâncias](#-análise-de-redundâncias)
- [Como Executar](#-como-executar)
- [Configurações](#-configurações)

---

## � Conceito do Jogo

### O que é o Atlas4Me?

O **Atlas4Me** é um jogo educativo estilo **Akinator**, mas focado em geografia. O sistema "pensa" em um país da América do Sul e o jogador tenta descobrir qual é fazendo perguntas estratégicas.

### Como Funciona?

1. **Sistema escolhe um país secreto** (ex: Brasil)
2. **Jogador faz perguntas** baseadas em características:
   - "O país fala Espanhol?" → NÃO
   - "Tem saída para o mar?" → SIM
   - "A Cordilheira dos Andes passa por ele?" → NÃO
3. **Sistema filtra candidatos** que não correspondem às respostas
4. **Jogador continua** até restar poucos países e tenta adivinhar
5. **Sistema valida** e mostra o resultado com pontuação

### Sistema de Pontuação

- **Pontuação inicial:** 100 pontos
- **Penalidade por erro:** -10 pontos (mínimo 0)
- **Objetivo:** Descobrir o país com o máximo de pontos possível
- **Ranking:** Pontuação total acumulada de todos os jogos

## 🏗️ Arquitetura do Sistema

### Visão Geral

O sistema segue uma arquitetura **em camadas** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                   Port 5173 (Vite Dev)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST + JWT
                     ↓
┌─────────────────────────────────────────────────────────────┐
│             BACKEND (Spring Boot - Port 5202)               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  PRESENTATION LAYER                                   │ │
│  │  • AuthController (login, register)                   │ │
│  │  • GameController (start, answer, history)            │ │
│  │  • CountryController (list countries)                 │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │  APPLICATION LAYER (Business Logic)                  │  │
│  │  • LoginService                                      │  │
│  │  • RegisterService                                   │  │
│  │  • GameService (algoritmo de filtragem)             │  │
│  │  • CountryService                                    │  │
│  └──────────────────────┬────────────────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │  DOMAIN LAYER (Entities)                             │  │
│  │  • User • Country • Question • CountryFeature        │  │
│  │  • GameSession • GameAttempt • Enums                 │  │
│  └──────────────────────┬────────────────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │  INFRASTRUCTURE LAYER                                │  │
│  │  • Repositories (Spring Data JPA)                    │  │
│  │  • Security (JWT Filter, SecurityConfig)             │  │
│  │  • Exception Handlers                                │  │
│  └──────────────────────┬────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │ JDBC
                          ↓
            ┌─────────────────────────────┐
            │   DATABASE (MySQL)       │
            │   • Flyway Migrations       │
            └─────────────────────────────┘
```

### Princípios Arquiteturais

- ✅ **Separation of Concerns** - Cada camada tem responsabilidade única
- ✅ **Dependency Inversion** - Camadas superiores não conhecem detalhes de implementação
- ✅ **Single Responsibility** - Classes com propósito único e bem definido
- ✅ **Open/Closed** - Extensível sem modificar código existente

---

## 📊 Modelo de Dados - Entidades Explicadas

### Diagrama ER (Entity-Relationship)

```
                    ┌─────────────────┐
                    │      User       │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ firstName       │
                    │ lastName        │
                    │ email (UNIQUE)  │
                    │ password        │
                    │ totalScore      │
                    │ gamesPlayed     │
                    │ role (ENUM)     │
                    │ active          │
                    │ createdAt       │
                    │ updatedAt       │
                    └────────┬────────┘
                             │ 1
                             │
                             │ N
                    ┌────────▼────────┐
                    │  GameSession    │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ user_id (FK)    │────┐
                    │ target_country ─┼────┼─────────────┐
                    │ status (ENUM)   │    │             │
                    │ score           │    │             │
                    │ attempts        │    │             │
                    │ startedAt       │    │             │
                    │ finishedAt      │    │             │
                    └────────┬────────┘    │             │
                             │ 1           │             │
                             │             │             │
                             │ N           │             │
                    ┌────────▼────────┐    │             │
                    │  GameAttempt    │    │             │
                    ├─────────────────┤    │             │
                    │ id (PK)         │    │             │
                    │ session_id (FK) │    │             │
                    │ question_id (FK)├────┼──────┐      │
                    │ userAnswer      │    │      │      │
                    │ isCorrect       │    │      │      │
                    │ attemptedAt     │    │      │      │
                    └─────────────────┘    │      │      │
                                           │      │      │
  ┌───────────────────────────────────────┘      │      │
  │                                               │      │
  │  ┌────────────────────┐                      │      │
  │  │     Country        │                      │      │
  │  ├────────────────────┤                      │      │
  │  │ id (PK)            │                      │      │
  │  │ name (UNIQUE)      │                      │      │
  │  │ isoCode            │◄─────────────────────┘      │
  │  │ imageUrl           │                             │
  │  └──────┬─────────────┘                             │
  │         │ 1                                         │
  │         │                                           │
  │         │ N                  ┌──────────────────────┘
  │  ┌──────▼─────────┐          │
  │  │CountryFeature  │          │
  │  ├────────────────┤          │
  │  │ id (PK)        │          │
  │  │ country_id(FK) │          │
  │  │ question_id(FK)│◄─────────┤
  │  │ isTrue         │          │
  │  └────────────────┘          │
  │                              │
  │  ┌───────────────┐           │
  └─►│   Question    │           │
     ├───────────────┤           │
     │ id (PK)       │◄──────────┘
     │ text          │
     │ category      │
     │ helperImageUrl│
     └───────────────┘
```

### 🔵 **1. User** - Entidade de Autenticação e Perfil

**Função:** Representa um jogador do sistema com suas credenciais e estatísticas.

**Campos:**
- `id` - Identificador único auto-incrementado
- `firstName` / `lastName` - Nome completo do usuário
- `email` - Email único para login (também username)
- `password` - Senha criptografada com BCrypt
- `totalScore` - Pontuação acumulada de TODOS os jogos (para ranking)
- `gamesPlayed` - Total de partidas jogadas (para estatísticas)
- `role` - Papel do usuário no sistema (USER ou ADMIN)
- `active` - Flag para soft delete (desativar sem apagar)
- `createdAt` / `updatedAt` - Auditoria temporal

**Necessidade:**
- ✅ **Autenticação:** Implementa `UserDetails` do Spring Security para login JWT
- ✅ **Gamificação:** Armazena pontuação e ranking global
- ✅ **Auditoria:** Rastreamento de quando usuário foi criado
- ✅ **Relacionamentos:** Agregador de todas as sessões de jogo do usuário

**Implementação Especial:**
```java
@Override
public String getUsername() {
    return email; // Spring Security usa email como username
}

@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
}
```

**Enum Role:**
```java
public enum Role {
    USER,   // Jogador comum
    ADMIN   // Administrador (pode gerenciar perguntas/países)
}
```

---

### 🟢 **2. Country** - Entidade de País

**Função:** Representa um país do jogo com suas informações básicas.

**Campos:**
- `id` - Identificador único
- `name` - Nome do país (único, ex: "Brasil", "Argentina")
- `isoCode` - Código ISO 3166-1 alpha-2 (ex: "BR", "AR")
- `imageUrl` - Caminho para imagem da bandeira

**Necessidade:**
- ✅ **Banco de Países:** Entidade simples e limpa com dados básicos
- ✅ **Internacionalização:** ISO code para futuras traduções
- ✅ **Visual:** Imageação para exibir bandeiras no frontend
- ✅ **Separação de Concerns:** Características ficam em `CountryFeature` (normalização)

**Por que não tem campos booleanos aqui?**
> Inicialmente o modelo tinha 20+ campos booleanos (`hasBeach`, `speaksSpanish`, etc). 
> Foi refatorado para uma tabela separada (`CountryFeature`) seguindo o princípio **Open/Closed**:
> - Adicionar nova característica = novo registro, não nova coluna
> - Facilita consultas dinâmicas
> - Melhor escalabilidade

---

### 🟡 **3. Question** - Entidade de Pergunta

**Função:** Representa uma pergunta que pode ser feita sobre um país.

**Campos:**
- `id` - Identificador único
- `text` - Texto da pergunta (ex: "A língua principal falada neste país é o Espanhol?")
- `category` - Categoria da pergunta (GEOGRAFIA, CULTURA, BANDEIRA, ECONOMIA, POPULACAO)
- `helperImageUrl` - URL de imagem auxiliar (ex: mapa mostrando Cordilheira dos Andes)

**Necessidade:**
- ✅ **Flexibilidade:** Perguntas configuráveis sem código hardcoded
- ✅ **Categorização:** Agrupa perguntas por tipo para UI e análise
- ✅ **Experiência do Usuário:** Imagens auxiliares ajudam jogadores
- ✅ **Extensibilidade:** Fácil adicionar novas perguntas via SQL

**Exemplo de Perguntas:**
```sql
INSERT INTO questions (text, category, helper_image_url) VALUES
('A língua principal falada neste país é o Espanhol?', 'CULTURA', '/images/maps/idiomas.png'),
('A Cordilheira dos Andes passa por este país?', 'GEOGRAFIA', '/images/maps/andes.png'),
('A bandeira deste país possui a cor Verde?', 'BANDEIRA', NULL);
```

---

### 🟣 **4. CountryFeature** - Tabela de Associação (Join Table Inteligente)

**Função:** Armazena a resposta (SIM/NÃO) de cada país para cada pergunta. É o "cérebro" do sistema.

**Campos:**
- `id` - Identificador único
- `country_id` - FK para Country
- `question_id` - FK para Question
- `isTrue` - Resposta booleana (true = SIM, false = NÃO)

**Necessidade:**
- ✅ **Algoritmo de Filtragem:** Base de dados para eliminar países progressivamente
- ✅ **Normalização:** Evita campos booleanos infinitos em Country
- ✅ **Escalabilidade:** Adicionar característica = INSERT, não ALTER TABLE
- ✅ **Manutenibilidade:** Fácil corrigir dados sem mexer no schema

**Como Funciona:**
```sql
-- Brasil fala Espanhol? NÃO
INSERT INTO country_features (country_id, question_id, is_true) 
VALUES (1, 1, false);

-- Argentina fala Espanhol? SIM
INSERT INTO country_features (country_id, question_id, is_true) 
VALUES (2, 1, true);
```

**Algoritmo de Filtragem:**
```java
// Busca países onde country_features.is_true = userAnswer
List<Country> remainingCountries = countryRepository
    .findCountriesByFeature(questionId, userAnswer);
```

---

### 🔴 **5. GameSession** - Entidade Agregadora de Partida

**Função:** Representa UMA partida do jogo, do início ao fim.

**Campos:**
- `id` - Identificador único da sessão
- `user_id` - FK para User (quem está jogando)
- `target_country_id` - FK para Country (país secreto sorteado)
- `status` - Estado do jogo (IN_PROGRESS, ROBOT_WON, HUMAN_WON, etc)
- `score` - Pontuação atual da partida (inicia em 100)
- `attempts` - Quantidade de tentativas realizadas
- `startedAt` - Timestamp de início
- `finishedAt` - Timestamp de conclusão (NULL se em andamento)
- `gameAttempts` - Lista de tentativas (OneToMany)
- `rejectedCountries` - Países que o robô chutou e errou (ManyToMany)

**Necessidade:**
- ✅ **Isolamento de Partida:** Cada jogo é independente
- ✅ **Estado Transacional:** Controla ciclo de vida do jogo
- ✅ **Histórico:** Permite revisitar partidas antigas
- ✅ **Regras de Negócio:** Um usuário só pode ter 1 sessão IN_PROGRESS por vez

**Enum GameStatus:**
```java
public enum GameStatus {
    IN_PROGRESS,        // Jogo ativo
    ROBOT_WON,          // Robô acertou o país
    HUMAN_WON,          // Humano ganhou (robô desistiu/errou)
    GAVE_UP,            // Usuário desistiu
    WAITING_FOR_REVEAL, // Aguardando usuário revelar país
    FINISHED_REVEALED,  // Finalizado com revelação
    GUESSING            // Robô está tentando adivinhar
}
```

**Métodos Importantes:**
```java
public Boolean getWon() {
    return this.status == GameStatus.HUMAN_WON;
}

public void finish(GameStatus finalStatus) {
    this.status = finalStatus;
    this.finishedAt = LocalDateTime.now();
}
```

---

### 🟠 **6. GameAttempt** - Entidade de Tentativa/Log

**Função:** Registra CADA resposta do usuário durante o jogo (log de auditoria).

**Campos:**
- `id` - Identificador único
- `session_id` - FK para GameSession
- `question_id` - FK para Question (qual pergunta foi respondida)
- `userAnswer` - Resposta do usuário (true = SIM, false = NÃO)
- `isCorrect` - Se a resposta ajudou a encontrar o país ou atrapalhou
- `attemptedAt` - Timestamp da resposta

**Necessidade:**
- ✅ **Histórico Completo:** Permite replay da partida
- ✅ **Algoritmo de Filtragem:** Base para calcular países restantes
- ✅ **Feedback Educativo:** Mostra onde usuário errou ao final
- ✅ **Análise de Estratégias:** Identifica perguntas mais eficientes

**Como `isCorrect` é usado:**

Cenário: Usuário pensou no **Brasil**
- Pergunta: "Fala Espanhol?" 
- Usuário responde: **SIM** (errado!)
- Sistema registra: `isCorrect = FALSE`

Ao final, quando robô não acerta:
```
Backend compara:
  - GameAttempt.userAnswer = TRUE
  - CountryFeature(Brasil, "Fala Espanhol") = FALSE
  - Divergência! Mostra feedback: "❌ Você errou: disse SIM mas Brasil não fala Espanhol"
```

---

## 🔗 Relacionamentos Entre Entidades

### User ↔ GameSession (1:N)
```java
// Um usuário pode ter MUITAS sessões de jogo
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
private List<GameSession> gameSessions;
```
- **Cascade ALL:** Deletar User deleta todas suas sessões
- **Orphan Removal:** Remover sessão da lista deleta do banco

### GameSession ↔ Country (N:1)
```java
// Cada sessão tem UM país alvo
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "target_country_id", nullable = false)
private Country targetCountry;
```
- **Lazy Load:** Não carrega Country automaticamente (performance)

### GameSession ↔ GameAttempt (1:N)
```java
// Uma sessão tem MUITAS tentativas
@OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
private List<GameAttempt> gameAttempts;
```
- **Ordenação:** Busca sempre ordenada por `attemptedAt`

### GameSession ↔ Country (N:N) - Rejeitados
```java
// Muitas sessões podem rejeitar muitos países
@ManyToMany
@JoinTable(
    name = "game_session_rejected",
    joinColumns = @JoinColumn(name = "session_id"),
    inverseJoinColumns = @JoinColumn(name = "country_id")
)
private Set<Country> rejectedCountries;
```
- **Uso:** Quando robô chuta "Brasil" e erra, adiciona Brasil aqui para não chutar de novo

### Country ↔ CountryFeature (1:N)
```java
// Um país tem MUITAS características
@OneToMany(mappedBy = "country")
private List<CountryFeature> features;
```

### Question ↔ CountryFeature (1:N)
```java
// Uma pergunta tem MUITAS respostas (uma por país)
@OneToMany(mappedBy = "question")
private List<CountryFeature> features;
```

### GameAttempt ↔ Question (N:1)
```java
// Cada tentativa é sobre UMA pergunta específica
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "question_id", nullable = false)
private Question question;
```

---

## 🏗️ Design Patterns e Boas Práticas

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

## ⚠️ Análise de Redundâncias

### Redundâncias Identificadas e Justificativas

#### 1. **Campo `won` em GameSession** ✅ REMOVIDO
```java
// ❌ ANTES (Redundante)
private Boolean completed;
private Boolean won;

// ✅ AGORA (Otimizado com Enum)
private GameStatus status; // IN_PROGRESS, ROBOT_WON, HUMAN_WON
```

**Por que era redundante:**
- `won = true` e `completed = true` → Pode ser `GameStatus.HUMAN_WON`
- `won = false` e `completed = true` → Pode ser `GameStatus.ROBOT_WON`
- `completed = false` → Pode ser `GameStatus.IN_PROGRESS`

**Solução aplicada:**
```java
public Boolean getWon() {
    return this.status == GameStatus.HUMAN_WON; // Método derivado, não campo
}
```

#### 2. **totalScore vs score** ✅ NÃO É REDUNDÂNCIA

**Aparenta redundância mas são propósitos diferentes:**
- `User.totalScore` - Pontuação ACUMULADA de TODAS as partidas (ranking global)
- `GameSession.score` - Pontuação da partida ATUAL (100 - penalidades)

**Exemplo:**
```
Usuário joga 3 vezes:
  Partida 1: score final = 70 pontos
  Partida 2: score final = 90 pontos
  Partida 3: score final = 50 pontos
  
User.totalScore = 210 (soma de todas)
GameSession[3].score = 50 (última partida)
```

#### 3. **gamesPlayed vs COUNT(game_sessions)** ⚡ REDUNDÂNCIA JUSTIFICADA

**Aparenta redundância:**
```sql
-- Poderia calcular assim:
SELECT COUNT(*) FROM game_sessions WHERE user_id = 1 AND status != 'IN_PROGRESS';
```

**Por que mantemos o campo:**
- ✅ **Performance:** Evita COUNT() em queries frequentes (ranking)
- ✅ **Desnormalização Intencional:** Trade-off de espaço por velocidade
- ✅ **Cached Value Pattern:** Valor calculado armazenado para leitura rápida

**Uso:**
```java
// Leaderboard rápido sem JOIN pesado
SELECT firstName, totalScore, gamesPlayed 
FROM users 
ORDER BY totalScore DESC 
LIMIT 10; // Sem COUNT(), extremamente rápido
```

#### 4. **GameAttempt.isCorrect** ✅ NÃO É REDUNDÂNCIA

**Aparenta redundância:**
> "Não posso calcular comparando `userAnswer` com `CountryFeature.isTrue`?"

**Por que precisa estar armazenado:**
- ✅ **Histórico Imutável:** Se admin corrigir CountryFeature depois, histórico não muda
- ✅ **Performance:** Evita JOIN triplo em queries de feedback
- ✅ **Auditoria:** Registra o que era "correto" NO MOMENTO da resposta

**Exemplo de problema sem o campo:**
```
1. Usuário responde: "Brasil fala Espanhol? SIM" (errado)
2. Sistema marca isCorrect = FALSE
3. Admin descobre erro no banco: Brasil.speaksSpanish estava TRUE (bug!)
4. Admin corrige: UPDATE country_features SET is_true = FALSE
5. Histórico do jogo permanece correto (isCorrect = FALSE estava certo)
```

Se fosse calculado dinamicamente, o histórico mudaria retroativamente!

#### 5. **finishedAt vs LocalDateTime.now()** ✅ NÃO É REDUNDÂNCIA

**Por que armazenar se posso pegar o timestamp do último GameAttempt?**
```sql
-- Poderia fazer:
SELECT MAX(attempted_at) FROM game_attempts WHERE session_id = 1;
```

**Justificativas:**
- ✅ **Semântica:** Jogo pode terminar SEM tentativas (desistência imediata)
- ✅ **Performance:** Evita MAX() e subconsulta em listagens
- ✅ **Integridade:** Campo explícito é mais claro que derivação

### Redundâncias que DEVERIAM Existir mas Faltam

#### ❌ **Falta: Índice em email**
```sql
-- DEVERIA TER:
CREATE INDEX idx_users_email ON users(email);
```
Email é usado em TODAS as autenticações mas não tem índice explícito (apenas UNIQUE constraint).

#### ❌ **Falta: Índice composto em CountryFeature**
```sql
-- DEVERIA TER:
CREATE INDEX idx_country_feature_lookup 
ON country_features(country_id, question_id, is_true);
```
A query de filtragem usa esses 3 campos sempre juntos.

#### ❌ **Falta: Cache de países ativos**
```java
// DEVERIA TER:
@Cacheable("activeCountries")
public List<Country> findAllActive() {
    return countryRepository.findByActiveTrue();
}
```
Lista de países muda raramente mas é consultada em TODA partida.

### Conclusão sobre Redundâncias

| Campo/Conceito | Redundante? | Justificativa |
|---|---|---|
| `GameStatus` enum | ✅ Otimização | Substituiu 2 campos booleanos |
| `totalScore` | ❌ Necessário | Agregação != Score de partida |
| `gamesPlayed` | ⚡ Cache | Performance > Espaço |
| `isCorrect` | ❌ Necessário | Auditoria histórica imutável |
| `finishedAt` | ❌ Necessário | Semântica + Performance |

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

---

## ⚙️ Configuração

### application.properties

```properties
# ============================================
# SERVIDOR
# ============================================
server.port=5202
server.servlet.context-path=/

# ============================================
# BANCO DE DADOS H2 (Desenvolvimento)
# ============================================
spring.datasource.url=jdbc:h2:mem:atlas4me;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# ============================================
# FLYWAY (Migrations)
# ============================================
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# ============================================
# JPA/HIBERNATE
# ============================================
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=none  # Flyway gerencia o schema
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false  # Evita lazy loading em views

# ============================================
# H2 CONSOLE (Somente Desenvolvimento)
# ============================================
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=false

# ============================================
# SEGURANÇA JWT
# ============================================
jwt.secret=SuaChaveSecretaSuperSeguraComMinimoTrintaEDoisCaracteres123456789
jwt.expiration=86400000  # 24 horas em milissegundos

# ============================================
# CORS (Permitir Frontend)
# ============================================
cors.allowed-origins=http://localhost:5173,http://localhost:3000,http://localhost:4173

# ============================================
# LOGGING
# ============================================
logging.level.root=INFO
logging.level.atlas4me=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# ============================================
# PRODUÇÃO: MySQL (Descomentar quando for usar)
# ============================================
# spring.datasource.url=jdbc:mysql://localhost:3306/atlas4me?useSSL=false&serverTimezone=UTC
# spring.datasource.username=root
# spring.datasource.password=sua-senha
# spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
# spring.h2.console.enabled=false
```

---

## 🚀 Como Executar

### Pré-requisitos

- **Java 21** (ou superior)
- **Maven 3.8+**
- **Git**

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/atlas4me-react.git
cd atlas4me-react/backend

# 2. Compile o projeto (baixa dependências e roda testes)
mvn clean install

# 3. Execute a aplicação
mvn spring-boot:run
```

### Acessar

- **API REST:** http://localhost:5202
- **H2 Console:** http://localhost:5202/h2-console
  - **JDBC URL:** `jdbc:h2:mem:atlas4me`
  - **Username:** `sa`
  - **Password:** (deixar em branco)

### Verificar se está rodando

```bash
# Teste de health check
curl http://localhost:5202/api/countries

# Deve retornar JSON com lista de países
```

---

## 📝 Migrations Flyway

### Como funciona?

O Flyway executa scripts SQL em ordem **automática** ao iniciar a aplicação:

```
src/main/resources/db/migration/
├── V1__create_table.sql         # Cria estrutura do banco
├── V2__insert_initial_data.sql  # Popula países e perguntas
└── V3__add_question_id_to_game_attempts.sql  # Adiciona FK
```

### Criar nova migration

```bash
# Formato: V{número}__{descrição}.sql
# Exemplos:
V4__add_user_avatar_field.sql
V5__create_leaderboard_view.sql
```

**Regras:**
- ✅ Numeração sequencial (V1, V2, V3...)
- ✅ Dois underscores entre número e descrição
- ✅ Nomes descritivos em snake_case
- ❌ NUNCA modificar migrations já executadas

### Reverter migration

```bash
# Flyway não suporta rollback automático
# Criar nova migration para reverter:
V6__rollback_user_avatar_field.sql

# Conteúdo:
ALTER TABLE users DROP COLUMN avatar_url;
```

---

## 🐛 Troubleshooting

### Erro: "Table already exists"

**Causa:** Flyway tentou recriar tabelas existentes

**Solução:**
```bash
# 1. Limpar banco H2 (em memória, só reiniciar)
# 2. Para MySQL, dropar o banco:
mysql -u root -p
DROP DATABASE atlas4me;
CREATE DATABASE atlas4me;

# 3. Ou limpar histórico Flyway:
DELETE FROM flyway_schema_history;
```

### Erro: "JWT Secret too short"

**Causa:** Chave JWT deve ter mínimo 256 bits (32 caracteres)

**Solução:**
```properties
# Gerar chave segura:
jwt.secret=SuaChaveSecretaSuperSeguraComMinimoTrintaEDoisCaracteres123456789
```

### Erro: CORS Policy

**Causa:** Frontend em porta diferente não está autorizada

**Solução:**
```properties
# Adicionar porta do frontend:
cors.allowed-origins=http://localhost:5173
```

```java
// Ou em CorsConfig.java:
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "http://localhost:3000"
));
```

### Erro: "User not found" após login

**Causa:** Email case-sensitive ou usuário não criado

**Solução:**
```sql
-- Verificar no H2 Console:
SELECT * FROM users WHERE email = 'seu@email.com';

-- Se vazio, criar manualmente:
INSERT INTO users (first_name, last_name, email, password, role, active, total_score, games_played, created_at, updated_at)
VALUES ('Teste', 'Usuario', 'teste@email.com', '$2a$10$...hash-bcrypt...', 'USER', true, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

## 📦 Build para Produção

### Gerar JAR executável

```bash
# Build sem testes (mais rápido)
mvn clean package -DskipTests

# Build com testes
mvn clean package

# JAR gerado em:
# target/atlas4me-backend-1.0.0.jar
```

### Executar JAR

```bash
# Rodar com configurações padrão
java -jar target/atlas4me-backend-1.0.0.jar

# Sobrescrever propriedades
java -jar target/atlas4me-backend-1.0.0.jar \
  --server.port=8080 \
  --spring.datasource.url=jdbc:mysql://prod-db:3306/atlas4me

# Usar perfil de produção
java -jar target/atlas4me-backend-1.0.0.jar \
  --spring.profiles.active=prod
```

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/atlas4me-backend-1.0.0.jar app.jar
EXPOSE 5202
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
# Build da imagem
docker build -t atlas4me-backend:1.0 .

# Executar container
docker run -p 5202:5202 atlas4me-backend:1.0
```

---

## 🧪 Testes

### Executar testes

```bash
# Todos os testes
mvn test

# Classe específica
mvn test -Dtest=UserServiceTest

# Método específico
mvn test -Dtest=UserServiceTest#testCreateUser
```

### Coverage Report

```bash
# Gerar relatório de cobertura
mvn jacoco:report

# Abrir em:
# target/site/jacoco/index.html
```

---

## 📊 Monitoramento e Métricas

### Spring Boot Actuator (Adicionar)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
# application.properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

**Endpoints disponíveis:**
- `/actuator/health` - Status da aplicação
- `/actuator/info` - Informações da build
- `/actuator/metrics` - Métricas JVM e HTTP

---

## 🔒 Segurança em Produção

### Checklist

- [ ] Trocar JWT secret para valor aleatório de 512 bits
- [ ] Configurar HTTPS (TLS/SSL)
- [ ] Desabilitar H2 Console (`spring.h2.console.enabled=false`)
- [ ] Ocultar stacktraces (`server.error.include-stacktrace=never`)
- [ ] Configurar rate limiting (Spring Cloud Gateway)
- [ ] Habilitar CSRF se usar cookies
- [ ] Adicionar helmet headers (Content-Security-Policy, etc)
- [ ] Configurar logging para monitoramento
- [ ] Usar secrets manager (AWS Secrets Manager, Vault)
- [ ] Configurar backup automático do banco

### Configuração HTTPS

```properties
# application-prod.properties
server.port=8443
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=senha-forte
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=atlas4me
```

---

## 📚 Documentação Adicional

### Swagger/OpenAPI

Acessar: http://localhost:5202/swagger-ui.html

**Funcionalidades:**
- Testar todos os endpoints
- Ver schemas de request/response
- Autenticar com JWT
- Exportar spec OpenAPI

### Arquitetura de Pacotes

```
atlas4me/
├── config/          # Configurações (Security, CORS, JWT)
├── controller/      # REST Controllers (endpoints)
├── dto/             # Data Transfer Objects
│   ├── request/     # DTOs de entrada
│   └── response/    # DTOs de saída
├── entity/          # Entidades JPA (modelo de domínio)
├── exception/       # Exceções customizadas + handlers
├── repository/      # Interfaces Spring Data JPA
└── service/         # Lógica de negócio
```

---

## 🤝 Contribuindo

### Workflow

1. Fork o projeto
2. Clone seu fork: `git clone https://github.com/seu-usuario/atlas4me-react.git`
3. Crie uma branch: `git checkout -b feature/MinhaFeature`
4. Faça suas mudanças
5. Rode os testes: `mvn test`
6. Commit: `git commit -m 'feat: Adiciona MinhaFeature'`
7. Push: `git push origin feature/MinhaFeature`
8. Abra um Pull Request

### Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Adiciona endpoint de ranking global
fix: Corrige cálculo de pontuação
docs: Atualiza README com instruções Docker
refactor: Simplifica lógica de filtragem de países
test: Adiciona testes para GameService
chore: Atualiza dependências do Spring Boot
```

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autores

- **Seu Nome** - Desenvolvimento Backend

---

## 📞 Suporte

- **Issues:** https://github.com/seu-usuario/atlas4me-react/issues
- **Email:** suporte@atlas4me.com
- **Discussões:** https://github.com/seu-usuario/atlas4me-react/discussions

---

**Desenvolvido com ☕ e Java 21**

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
