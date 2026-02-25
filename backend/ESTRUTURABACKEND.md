# 📁 Estrutura do Projeto Atlas4Me — Backend

> Organização atualizada do backend Spring Boot (Fevereiro 2026), refletindo a estrutura real de pacotes e arquivos.

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
│
├── 📁 dto/                             # Data Transfer Objects
│   ├── 📁 request/
│   │   ├── GameAnswerRequest.java     # { gameId, questionId, answer }
│   │   ├── GameIdRequest.java         # { gameId }  — usado em deny/confirm
│   │   ├── LoginRequest.java          # { email, password }
│   │   ├── RegisterRequest.java       # { firstName, lastName, email, password }
│   │   └── RevealRequest.java         # { gameId, countryId }
│   └── 📁 response/
│       ├── AuthResponse.java          # { token, userId, firstName, ... }
│       ├── CountryResponse.java       # { id, name, isoCode, imageUrl }
│       ├── ErrorResponse.java         # { status, message, timestamp }
│       ├── GameResponse.java          # Resposta principal do jogo
│       ├── LocationResponse.java      # { latitude, longitude } — coordenadas do país
│       ├── QuestionResponse.java      # { id, text, category, helperImageUrl }
│       └── ValidationErrorResponse.java  # Erros de Bean Validation
│
├── 📁 entity/                          # Entidades JPA (Domínio)
│   ├── Country.java                   # País do jogo
│   ├── CountryFeature.java            # Matriz de conhecimento (País × Pergunta)
│   ├── GameAttempt.java               # Log de cada resposta do jogador
│   ├── GameSession.java               # Sessão/partida individual
│   ├── GameStatus.java                # Enum de status do jogo
│   ├── Question.java                  # Pergunta do jogo
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
    ├── GameService.java               # Algoritmo do jogo + ciclo de vida da partida
    ├── LoginService.java              # Autenticação e geração de JWT
    └── RegisterService.java           # Cadastro de novo usuário
```

---

## 📁 Recursos (src/main/resources/)

```
resources/
├── application.properties             # Configurações da aplicação
└── db/migration/                      # Migrations Flyway (versionadas)
    ├── V1__create_table.sql           # Criação de todas as tabelas
    ├── V2__insert_initial_data.sql    # Dados iniciais (países + perguntas)
    ├── V3__Add_Lat_Lon_To_Countries.sql    # Latitude/longitude nos países
    └── V4__Add_IsoCode_To_CountryFeatures.sql  # isoCode nas features
```

---

## �️ Organização por Camadas

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
| `GameController` | `/api/games` | start, answer, history, deny, confirm, reveal |
| `CountryController` | `/api/countries` | listar todos |

### Camada de Serviço (`service/`)
| Serviço | Responsabilidade Principal |
|---|---|
| `LoginService` | Autentica credenciais via `AuthenticationManager`, gera JWT |
| `RegisterService` | Cria usuário novo com senha BCrypt |
| `GameService` | Orquestra todo o ciclo de vida do jogo (start → answer → guess → reveal) |
| `CountryService` | Busca e filtra países do banco |
| `CustomUserDetailsService` | Integra `UserRepository` com Spring Security |

### Camada de Dados (`repository/` + `entity/`)

**Entidades:**

| Entidade | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Jogador; implementa `UserDetails` |
| `Country` | `countries` | País com nome, ISO code, bandeira, lat/lon |
| `Question` | `questions` | Pergunta com texto, categoria e imagem auxiliar |
| `CountryFeature` | `country_features` | Relação País × Pergunta × resposta booleana |
| `GameSession` | `game_sessions` | Partida do início ao fim |
| `GameAttempt` | `game_attempts` | Log de cada resposta do jogador |
| `GameStatus` | (enum) | `IN_PROGRESS`, `ROBOT_WON`, `HUMAN_WON`, `GAVE_UP`, `WAITING_FOR_REVEAL`, `FINISHED_REVEALED`, `GUESSING` |

**Join Tables:**

| Tabela | Propósito |
|---|---|
| `game_session_rejected` | Países que o robô já chutou e errou na sessão atual |

---

## 🔄 Fluxo de Requisição

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
Controller               ← recebe DTO de Request, delega ao Service
    │
    ▼
Service                  ← executa regras de negócio, chama Repositories
    │
    ▼
Repository               ← acessa banco via Spring Data JPA
    │
    ▼
Database (MySQL)
    │
    ▼
DTO de Response          ← montado pelo Service
    │
    ▼
HTTP Response (JSON)
```

---

## 📦 Endpoints da API

### Autenticação (`/api/auth`) — Público

| Método | Rota | Request | Response |
|---|---|---|---|
| `POST` | `/api/auth/register` | `RegisterRequest` | `AuthResponse` |
| `POST` | `/api/auth/login` | `LoginRequest` | `AuthResponse` |

### Jogo (`/api/games`) — Autenticado ou Visitante

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/games/start` | Iniciar nova partida |
| `POST` | `/api/games/answer` | Responder pergunta do robô |
| `GET` | `/api/games/history` | Histórico de partidas (requer login) |
| `POST` | `/api/games/deny` | Negar palpite do robô |
| `POST` | `/api/games/confirm` | Confirmar palpite do robô |
| `POST` | `/api/games/reveal` | Revelar país pensado (após desistência) |

### Países (`/api/countries`) — Público

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/countries` | Listar todos os países |

---

## 🎨 Padrões Arquiteturais

### 1. Layered Architecture
Separação clara entre Presentation → Application → Domain → Infrastructure. Nenhuma camada "pula" outra.

### 2. DTO Pattern
Entities JPA nunca saem diretamente na resposta HTTP. Conversão sempre via DTOs (`*Request` / `*Response`).

### 3. Repository Pattern
Toda consulta ao banco passa por interfaces que estendem `JpaRepository`. Nenhum SQL manual nos serviços.

### 4. Global Exception Handler
`GlobalExceptionHandler` com `@RestControllerAdvice` centraliza todos os erros e formata respostas padronizadas.

### 5. Stateless JWT
Backend é 100% stateless — sem sessão HTTP. Autenticação via token JWT em cada request.

---

## 📝 Convenções de Nomenclatura

| Sufixo | Tipo | Exemplo |
|---|---|---|
| `*Controller` | REST Controller | `GameController` |
| `*Service` | Serviço de negócio | `GameService` |
| `*Repository` | Interface JPA | `UserRepository` |
| `*Request` | DTO de entrada | `LoginRequest` |
| `*Response` | DTO de saída | `AuthResponse` |
| `*Exception` | Exceção customizada | `BusinessException` |

---

## � Comandos Rápidos

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

*Última atualização: Fevereiro 2026*
