# 📁 Estrutura do Projeto Atlas4Me — Backend

> Organização do backend Spring Boot (Março 2026), refletindo a estrutura real de pacotes e arquivos após a expansão para **36 países globais** e **60 perguntas**.

---

## 📂 Árvore de Diretórios

```
backend/src/main/java/atlas4me/
│
├── Atlas4meApplication.java            # Classe principal (entry-point Spring Boot)
│
├── 📁 config/                          # Configurações transversais
│   ├── JwtAuthenticationFilter.java   # Filtro JWT (intercepta todas as requests)
│   ├── JwtTokenProvider.java          # Geração e validação de tokens JWT
│   ├── SecurityConfig.java            # Regras de autorização + CORS
│   └── SwaggerConfig.java             # Configuração do Springdoc/OpenAPI
│
├── 📁 controller/                      # Camada de Apresentação (API REST)
│   ├── AuthController.java            # POST /api/auth/register e /api/auth/login
│   ├── CountryController.java         # GET /api/countries
│   └── GameController.java            # Endpoints do jogo (/api/games/*)
│                                      # start · answer · guess-feedback · deny · confirm · reveal · history
│
├── 📁 dto/                             # Data Transfer Objects
│   ├── 📁 request/
│   │   ├── GameAnswerRequest.java     # { gameId, questionId, answer }
│   │   ├── GameIdRequest.java         # { gameId }  — helper genérico
│   │   ├── GuessFeedbackRequest.java  # { gameId, correct } — unifica /deny e /confirm
│   │   ├── LoginRequest.java          # { email, password }
│   │   ├── RegisterRequest.java       # { firstName, lastName, email, password }
│   │   └── RevealRequest.java         # { gameId, countryId }
│   └── 📁 response/
│       ├── AuthResponse.java          # { token, userId, firstName, email, totalScore }
│       ├── CountryResponse.java       # { id, name, isoCode, imageUrl }
│       ├── ErrorResponse.java         # { status, message, timestamp }
│       ├── GameResponse.java          # Resposta unificada do jogo
│       ├── LocationResponse.java      # { latitude, longitude }
│       ├── QuestionResponse.java      # { id, text, category, helperImageUrl, validIsoCodes }
│       └── ValidationErrorResponse.java  # Erros de Bean Validation
│
├── 📁 entity/                          # Entidades JPA (Domínio)
│   ├── Country.java                   # País (name, isoCode, lat, lon, continent)
│   ├── CountryFeature.java            # Base de conhecimento (País × Pergunta → Bool)
│   ├── GameAttempt.java               # Log de cada resposta do usuário
│   ├── GameSession.java               # Sessão de inferência com @Version (Optimistic Lock)
│   ├── GameStatus.java                # Enum de status da sessão
│   ├── Question.java                  # Atributo/pergunta do jogo
│   └── User.java                      # Jogador (implementa UserDetails)
│
├── 📁 exception/                       # Tratamento centralizado de erros
│   ├── BusinessException.java         # Regra de negócio violada
│   ├── DuplicateEmailException.java   # Email já cadastrado
│   ├── GlobalExceptionHandler.java    # @RestControllerAdvice
│   └── ResourceNotFoundException.java # Entidade não encontrada (404)
│
├── 📁 repository/                      # Repositórios Spring Data JPA
│   ├── CountryFeatureRepository.java
│   ├── CountryRepository.java         # + findRandomCountry()
│   ├── GameAttemptRepository.java
│   ├── GameSessionRepository.java     # + findByUserAndStatus()
│   ├── QuestionRepository.java
│   └── UserRepository.java            # + findByEmailAndActiveTrue()
│
└── 📁 service/                         # Camada de Aplicação (Lógica de Negócio)
    ├── CountryService.java            # Consulta e listagem de países
    ├── CustomUserDetailsService.java  # Integração Spring Security ↔ UserRepository
    ├── GameService.java               # Orquestra o ciclo da sessão; usa InferenceEngine + Cache
    ├── LoginService.java              # Autenticação e geração de JWT
    ├── RegisterService.java           # Cadastro de novo usuário
    └── 📁 inference/                  # Submódulo do Motor de Inferência
        ├── GameState.java             # Record imutável (currentCandidates, askedQuestions)
        ├── InferenceEngine.java       # Motor stateless: selectBestQuestion + filterCandidates
        └── KnowledgeBaseCache.java    # Cache em memória da tabela country_features
```

---

## 📁 Recursos (src/main/resources/)

```
resources/
├── application.properties             # Configurações da aplicação (${VAR:default})
└── db/migration/                      # Migrations Flyway (versionadas)
    ├── V1__create_table.sql           # Criação das 7 tabelas (com campo continent)
    ├── V2__insert_initial_data.sql    # Dados iniciais
    ├── V3__insert_world_countries.sql # 36 países do mundo + lat/lon
    └── V4__insert_more_questions.sql  # 60 perguntas + gabarito country_features completo
```

---

## 🏛️ Organização por Camadas

### Camada de Configuração (`config/`)
| Arquivo | Responsabilidade |
|---|---|
| `SecurityConfig` | Define quais rotas são públicas ou protegidas, configura CORS |
| `JwtTokenProvider` | Gera, assina e valida tokens JWT (HS256, 24h) |
| `JwtAuthenticationFilter` | Intercepta requests, extrai token do header, injeta no `SecurityContext` |
| `SwaggerConfig` | Configura SpringDoc / OpenAPI (habilitado por env var `SWAGGER_ENABLED`) |

### Camada de Apresentação (`controller/`)
| Controller | Base Path | Operações |
|---|---|---|
| `AuthController` | `/api/auth` | register, login |
| `GameController` | `/api/games` | start, answer, guess-feedback, deny *(compat)*, confirm *(compat)*, reveal, history |
| `CountryController` | `/api/countries` | listar todos (36 países) |

> **Nota `GameController`:** O endpoint `POST /api/games/guess-feedback` unifica `/deny` e `/confirm` com o campo `correct: boolean`. Os endpoints `/deny` e `/confirm` ainda existem como _wrappers_ para retrocompatibilidade. Um `@ExceptionHandler` de `ObjectOptimisticLockingFailureException` retorna `409 Conflict` ao detectar requests simultâneas sobre a mesma sessão.

### Camada de Serviço (`service/`)
| Serviço | Responsabilidade Principal |
|---|---|
| `GameService` | Orquestra o ciclo completo da sessão: inicia, processa respostas via `InferenceEngine`, gerencia palpites e revela resultado |
| `LoginService` | Autentica credenciais via `AuthenticationManager`, gera JWT |
| `RegisterService` | Cria usuário novo com senha BCrypt |
| `CountryService` | Busca e filtra países do banco |
| `CustomUserDetailsService` | Integra `UserRepository` com Spring Security |

### Submódulo de Inferência (`service/inference/`)
| Classe | Tipo | Responsabilidade |
|---|---|---|
| `KnowledgeBaseCache` | `@Component` | Carrega a tabela `country_features` inteira em memória na inicialização (`@PostConstruct`). Expõe índices invertidos (`getTrueCountries`, `getFalseCountries`), mapa de prioridades de categoria e a matriz completa `país → pergunta → boolean`. |
| `InferenceEngine` | `@Service` | Motor **stateless** e puro. `selectBestQuestion(GameState)` retorna ID da pergunta com maior Ganho de Informação (IG = H − entropia esperada); `filterCandidates(candidates, questionId, answer)` retorna novo subconjunto compatível via `HashSet.retainAll`. Nunca acessa o banco. |
| `GameState` | `record` (Java 21) | Value object imutável com `currentCandidates: Set<Long>` e `askedQuestions: Set<Long>`. Passado como entrada ao `InferenceEngine`. |

### DTOs notáveis

**`QuestionResponse`** — contém o novo campo `validIsoCodes`:
```json
{
  "id": 7,
  "text": "O país tem saída para o Oceano Atlântico?",
  "category": "GEOGRAFIA",
  "helperImageUrl": null,
  "validIsoCodes": ["BR", "AR", "NG", "ZA"]
}
```
Este array é calculado pelo `GameService` (não pelo `InferenceEngine`) e representa os países candidatos restantes que responderiam **SIM** à pergunta. O `GameGlobe` no frontend usa este dado para atualizar os marcadores do globo 3D.

### Camada de Dados (`repository/` + `entity/`)

**Entidades:**

| Entidade | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Jogador; implementa `UserDetails` |
| `Country` | `countries` | País com name, ISO code, bandeira, lat/lon, **continent** |
| `Question` | `questions` | Atributo com texto, categoria e imagem auxiliar |
| `CountryFeature` | `country_features` | Base de conhecimento: País × Pergunta × Resposta booleana |
| `GameSession` | `game_sessions` | Sessão de inferência; campo `@Version` para Optimistic Locking |
| `GameAttempt` | `game_attempts` | Log de cada resposta do usuário |
| `GameStatus` | (enum) | `IN_PROGRESS`, `GUESSING`, `WAITING_FOR_REVEAL`, `ROBOT_WON`, `HUMAN_WON`, `GAVE_UP`, `FINISHED_REVEALED` |

**Join Tables:**

| Tabela | Propósito |
|---|---|
| `game_session_rejected` | Países que o sistema já propôs e foram negados na sessão atual |

---

## 🔄 Fluxo de uma Requisição de Jogo

```
HTTP Request (POST /api/games/answer)
    │
    ▼
JwtAuthenticationFilter  ← extrai/valida token JWT (ou passa como guest)
    │
    ▼
SecurityConfig           ← rota pública → sem bloqueio
    │
    ▼
GameController           ← recebe GameAnswerRequest, delega ao GameService
    │
    ▼
GameService              ← orquestra:
    │
    ├──► processAttempt()          → salva GameAttempt (MySQL)
    │
    ├──► getRemainingCountries()   ← FILTRAGEM 100% EM RAM
    │         ├─ candidateIds = cache.getCountryQuestionMatrix().keySet()
    │         ├─ for each attempt: retainAll(índice invertido)
    │         ├─ removeAll(rejectedIds)
    │         └─ countryRepository.findAllById(ids)  ← 1 única query SQL
    │
    ├──► selectNextQuestion()
    │         ├─ new GameState(candidateIds, askedIds)
    │         ├─ inferenceEngine.selectBestQuestion(state)   ← IG puro
    │         │       └─ KnowledgeBaseCache  (sem SQL)
    │         └─ calcula validIsoCodes dos candidatos SIM
    │
    └──► buildGameResponse()       → monta GameResponse (DTO)
    │
    ▼
HTTP Response (JSON com nextQuestion.validIsoCodes)
    │
    ▼
Frontend: GameGlobe atualiza marcadores do globo 3D
```

---

## 🎨 Padrões Arquiteturais

### 1. Layered Architecture
Separação clara entre Presentation → Application → Domain → Infrastructure. Nenhuma camada "pula" outra.

### 2. DTO Pattern
Entities JPA nunca saem diretamente na resposta HTTP. `*Request` / `*Response` sempre. DTOs de request recentes usam **Java Records** (`GuessFeedbackRequest`, `GameState`).

### 3. Repository Pattern
Toda consulta ao banco passa por interfaces `JpaRepository`. Nenhum SQL manual nos serviços.

### 4. In-Memory Cache (`KnowledgeBaseCache`)
A `country_features` inteira é carregada via `@PostConstruct` em estruturas de dados otimizadas (índices invertidos). O `InferenceEngine` opera 100% em memória — **zero SQL** a cada pergunta.

### 5. Optimistic Locking
`GameSession` usa `@Version` (JPA). Requests simultâneas sobre a mesma sessão lançam `ObjectOptimisticLockingFailureException`, tratada pelo `GameController` com `409 Conflict`.

### 6. Global Exception Handler
`GlobalExceptionHandler` com `@RestControllerAdvice` centraliza todos os erros e formata respostas padronizadas.

### 7. Stateless JWT
Backend 100% stateless — sem `HttpSession`. Autenticação via token JWT em cada request.

---

## 📝 Convenções de Nomenclatura

| Sufixo | Tipo | Exemplo |
|---|---|---|
| `*Controller` | REST Controller | `GameController` |
| `*Service` | Serviço de negócio | `GameService`, `InferenceEngine` |
| `*Repository` | Interface JPA | `UserRepository` |
| `*Request` | DTO de entrada | `LoginRequest`, `GuessFeedbackRequest` |
| `*Response` | DTO de saída | `AuthResponse`, `GameResponse`, `QuestionResponse` |
| `*Cache` | Cache em memória | `KnowledgeBaseCache` |
| `*Exception` | Exceção customizada | `BusinessException` |

---

## 🛠️ Comandos Rápidos

```bash
# Compilar e verificar
mvn clean compile

# Executar localmente
mvn spring-boot:run

# Executar testes (InferenceEngineTest)
mvn test

# Executar teste específico
mvn "-Dtest=InferenceEngineTest" test "-Dmaven.resources.skip=true" --no-transfer-progress

# Gerar JAR de produção
mvn clean package -DskipTests
```

---

*Última atualização: Março 2026*
