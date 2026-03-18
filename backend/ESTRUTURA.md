# 📁 Estrutura do Projeto Atlas4Me — Backend

> Organização do backend Spring Boot (Março 2026), refletindo a estrutura real de pacotes e arquivos.

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
│   │   ├── GuessFeedbackRequest.java  # { gameId, correct } — substitui /deny e /confirm
│   │   ├── LoginRequest.java          # { email, password }
│   │   ├── RegisterRequest.java       # { firstName, lastName, email, password }
│   │   └── RevealRequest.java         # { gameId, countryId }
│   └── 📁 response/
│       ├── AuthResponse.java          # { token, userId, firstName, email, totalScore }
│       ├── CountryResponse.java       # { id, name, isoCode, imageUrl }
│       ├── ErrorResponse.java         # { status, message, timestamp }
│       ├── GameResponse.java          # Resposta unificada do jogo (com ISO codes dos candidatos)
│       ├── LocationResponse.java      # { latitude, longitude }
│       ├── QuestionResponse.java      # { id, text, category, helperImageUrl, mapHints }
│       └── ValidationErrorResponse.java  # Erros de Bean Validation
│
├── 📁 entity/                          # Entidades JPA (Domínio)
│   ├── Country.java                   # País do jogo
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
│   ├── CountryRepository.java
│   ├── GameAttemptRepository.java
│   ├── GameSessionRepository.java
│   ├── QuestionRepository.java
│   └── UserRepository.java
│
└── 📁 service/                         # Camada de Aplicação (Lógica de Negócio)
    ├── CountryService.java            # Consulta e listagem de países
    ├── CustomUserDetailsService.java  # Integração Spring Security ↔ UserRepository
    ├── GameService.java               # Orquestra o ciclo da sessão; usa InferenceEngine + KnowledgeBaseCache
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
├── application.properties             # Configurações da aplicação
└── db/migration/                      # Migrations Flyway (versionadas)
    ├── V1__create_table.sql           # Criação de todas as 7 tabelas
    ├── V2__insert_initial_data.sql    # 13 países + 16 perguntas + gabarito
    ├── V3__Add_Lat_Lon_To_Countries.sql          # latitude e longitude
    └── V4__Add_IsoCode_To_CountryFeatures.sql    # iso_code nas features
```

---

## 🏛️ Organização por Camadas

### Camada de Configuração (`config/`)
| Arquivo | Responsabilidade |
|---|---|
| `SecurityConfig` | Define quais rotas são públicas ou protegidas, configura CORS |
| `JwtTokenProvider` | Gera, assina e valida tokens JWT (HS256) |
| `JwtAuthenticationFilter` | Intercepta requests, extrai token do header, injeta no `SecurityContext` |
| `SwaggerConfig` | Configura SpringDoc / OpenAPI (habilitado por env var `SWAGGER_ENABLED`) |

### Camada de Apresentação (`controller/`)
| Controller | Base Path | Operações |
|---|---|---|
| `AuthController` | `/api/auth` | register, login |
| `GameController` | `/api/games` | start, answer, guess-feedback, deny *(compat)*, confirm *(compat)*, reveal, history |
| `CountryController` | `/api/countries` | listar todos |

> **Nota `GameController`:** O endpoint `POST /api/games/guess-feedback` unifica `/deny` e `/confirm` com o campo `correct: boolean`. Os endpoints `/deny` e `/confirm` ainda existem como _wrappers_ para retrocompatibilidade com o frontend atual. Um `@ExceptionHandler` de `ObjectOptimisticLockingFailureException` retorna `409 Conflict` ao detectar requests simultâneas sobre a mesma sessão.

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
| `KnowledgeBaseCache` | `@Component` | Carrega toda a tabela `country_features` em memória na inicialização (`@PostConstruct`). Expõe índices invertidos (`getTrueCountries`, `getFalseCountries`), mapa de prioridades de categoria e a matriz completa `país → pergunta → boolean`. |
| `InferenceEngine` | `@Service` | Motor **stateless** e puro. `selectBestQuestion(GameState)` escolhe a pergunta com maior Ganho de Informação (IG = H − entropia esperada); `filterCandidates(candidates, questionId, answer)` retorna novo subconjunto compatível. Nunca acessa o banco — opera só sobre o `KnowledgeBaseCache`. |
| `GameState` | `record` (Java 21) | Value object imutável que encapsula `currentCandidates: Set<Long>` e `askedQuestions: Set<Long>`. Passado como entrada ao `InferenceEngine`. |

### Camada de Dados (`repository/` + `entity/`)

**Entidades:**

| Entidade | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Jogador; implementa `UserDetails` |
| `Country` | `countries` | País com nome, ISO code, bandeira, lat/lon |
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

## 🔄 Fluxo de uma Requisição

```
HTTP Request
    │
    ▼
JwtAuthenticationFilter  ← extrai/valida token JWT
    │
    ▼
SecurityConfig           ← verifica se rota exige autenticação
    │
    ▼
GameController           ← recebe DTO de Request, delega ao GameService
    │
    ▼
GameService              ← orquestra: cria GameState, chama InferenceEngine
    │
    ├──► InferenceEngine.selectBestQuestion(GameState)
    │         └─ KnowledgeBaseCache  ← índices em memória (sem SQL)
    │
    ├──► InferenceEngine.filterCandidates(...)
    │         └─ KnowledgeBaseCache
    │
    └──► Repository  ← persiste GameSession / GameAttempt (MySQL)
    │
    ▼
DTO de Response (GameResponse)
    │
    ▼
HTTP Response (JSON)
```

---

## 🎨 Padrões Arquiteturais

### 1. Layered Architecture
Separação clara entre Presentation → Application → Domain → Infrastructure. Nenhuma camada "pula" outra.

### 2. DTO Pattern
Entities JPA nunca saem diretamente na resposta HTTP. Conversão sempre via DTOs (`*Request` / `*Response`). DTOs de request recentes usam **Java Records** (`GuessFeedbackRequest`, `GameState`).

### 3. Repository Pattern
Toda consulta ao banco passa por interfaces que estendem `JpaRepository`. Nenhum SQL manual nos serviços.

### 4. In-Memory Cache (KnowledgeBaseCache)
A `country_features` inteira é carregada via `@PostConstruct` em estruturas de dados otimizadas (índices invertidos + matriz completa). O `InferenceEngine` opera 100% em memória — sem SQL a cada pergunta.

### 5. Optimistic Locking
`GameSession` usa `@Version` (JPA). Requests simultâneas sobre a mesma sessão lançam `ObjectOptimisticLockingFailureException`, tratada pelo `GameController` com resposta `409 Conflict`.

### 6. Global Exception Handler
`GlobalExceptionHandler` com `@RestControllerAdvice` centraliza todos os erros e formata respostas padronizadas.

### 7. Stateless JWT
Backend é 100% stateless — sem sessão HTTP. Autenticação via token JWT em cada request.

---

## 📝 Convenções de Nomenclatura

| Sufixo | Tipo | Exemplo |
|---|---|---|
| `*Controller` | REST Controller | `GameController` |
| `*Service` | Serviço de negócio | `GameService`, `InferenceEngine` |
| `*Repository` | Interface JPA | `UserRepository` |
| `*Request` | DTO de entrada | `LoginRequest`, `GuessFeedbackRequest` |
| `*Response` | DTO de saída | `AuthResponse`, `GameResponse` |
| `*Cache` | Cache em memória | `KnowledgeBaseCache` |
| `*Exception` | Exceção customizada | `BusinessException` |

---

## 🛠️ Comandos Rápidos

```bash
# Compilar e verificar
mvn clean compile

# Executar localmente
mvn spring-boot:run

# Executar testes
mvn test

# Gerar JAR de produção
mvn clean package -DskipTests
```

---

*Última atualização: Março 2026*
