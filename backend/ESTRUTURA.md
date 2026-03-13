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
│       ├── LocationResponse.java      # { latitude, longitude }
│       ├── QuestionResponse.java      # { id, text, category, helperImageUrl }
│       └── ValidationErrorResponse.java  # Erros de Bean Validation
│
├── 📁 entity/                          # Entidades JPA (Domínio)
│   ├── Country.java                   # País do jogo
│   ├── CountryFeature.java            # Base de conhecimento (País × Pergunta → Bool)
│   ├── GameAttempt.java               # Log de cada resposta do usuário
│   ├── GameSession.java               # Sessão de inferência individual
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
    ├── GameService.java               # MOTOR DE INFERÊNCIA: entropia + ciclo da sessão
    ├── LoginService.java              # Autenticação e geração de JWT
    └── RegisterService.java           # Cadastro de novo usuário
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
| `GameController` | `/api/games` | start, answer, history, deny, confirm, reveal |
| `CountryController` | `/api/countries` | listar todos |

### Camada de Serviço (`service/`)
| Serviço | Responsabilidade Principal |
|---|---|
| `GameService` | **Motor de inferência**: seleciona perguntas por entropia, filtra candidatos, gerencia o ciclo completo da sessão |
| `LoginService` | Autentica credenciais via `AuthenticationManager`, gera JWT |
| `RegisterService` | Cria usuário novo com senha BCrypt |
| `CountryService` | Busca e filtra países do banco |
| `CustomUserDetailsService` | Integra `UserRepository` com Spring Security |

### Camada de Dados (`repository/` + `entity/`)

**Entidades:**

| Entidade | Tabela | Descrição |
|---|---|---|
| `User` | `users` | Jogador; implementa `UserDetails` |
| `Country` | `countries` | País com nome, ISO code, bandeira, lat/lon |
| `Question` | `questions` | Atributo com texto, categoria e imagem auxiliar |
| `CountryFeature` | `country_features` | Base de conhecimento: País × Pergunta × Resposta booleana |
| `GameSession` | `game_sessions` | Sessão de inferência do início ao fim |
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
Controller               ← recebe DTO de Request, delega ao Service
    │
    ▼
GameService              ← MOTOR DE INFERÊNCIA: filtra candidatos, calcula entropia
    │
    ▼
Repository               ← acessa banco via Spring Data JPA
    │
    ▼
Database (MySQL) — country_features (base de conhecimento)
    │
    ▼
DTO de Response          ← montado pelo Service
    │
    ▼
HTTP Response (JSON)
```

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
