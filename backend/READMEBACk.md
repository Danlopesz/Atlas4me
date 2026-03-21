# 🌍 Atlas4Me Backend — API REST & Motor de Inferência

> Backend Java Spring Boot do Atlas4Me. Responsável pela API REST, autenticação JWT e pelo **motor de inferência** que seleciona perguntas dinamicamente usando **Entropia de Shannon** para identificar — dentre **36 países do mundo inteiro** — o país pensado pelo usuário. Opera **100% em memória RAM** via `KnowledgeBaseCache`, sem queries SQL durante o jogo.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-V4-red.svg)](https://flywaydb.org/)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Arquitetura em Camadas](#-arquitetura-em-camadas)
3. [Motor de Inferência](#-motor-de-inferência)
4. [Fluxo do GameService](#-fluxo-do-gameservice)
5. [Endpoints da API](#-endpoints-da-api)
6. [Arquitetura Stateless](#-arquitetura-stateless)
7. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
8. [Modo Visitante](#-modo-visitante)
9. [Configurações e Variáveis de Ambiente](#-configurações-e-variáveis-de-ambiente)
10. [Como Executar](#-como-executar)
11. [Flyway Migrations](#-flyway-migrations)
12. [Troubleshooting](#-troubleshooting)

---

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.2.x | Framework web e IoC |
| Spring Security | 6.x | Autenticação e autorização |
| JWT (JJWT) | — | Tokens stateless HS256 |
| Spring Data JPA | — | ORM / abstração de persistência |
| Hibernate | — | Implementação JPA |
| MySQL | 8.0 | Banco relacional |
| Flyway | 10.x | Migrations versionadas (V1–V4) |
| Lombok | — | Redução de boilerplate |
| Springdoc OpenAPI | — | Documentação Swagger |
| Maven | 3.8+ | Gerenciamento de dependências |

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                   Port 5173 (Vite Dev)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST + JWT Bearer
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKEND (Spring Boot — Port 5202)                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CONFIG LAYER                                         │  │
│  │  JwtAuthenticationFilter • JwtTokenProvider          │  │
│  │  SecurityConfig • SwaggerConfig                      │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │  PRESENTATION LAYER (Controllers)                     │  │
│  │  AuthController • GameController • CountryController  │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │  APPLICATION LAYER (Services)                         │  │
│  │  LoginService • RegisterService • CountryService      │  │
│  │  GameService  ← orquestra o ciclo da sessão           │  │
│  │  CustomUserDetailsService                             │  │
│  │  ─── inference/ (submódulo stateless) ─────────────── │  │
│  │  KnowledgeBaseCache • InferenceEngine • GameState    │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │  DOMAIN LAYER (Entities + Enums)                      │  │
│  │  User • Country • Question • CountryFeature           │  │
│  │  GameSession (@Version) • GameAttempt • GameStatus    │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │  INFRASTRUCTURE LAYER (Repositories + Exceptions)     │  │
│  │  *Repository (JpaRepository) • GlobalExceptionHandler │  │
│  └──────────────────────┬────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │ JDBC / Flyway (V1–V4)
                          ▼
            ┌─────────────────────────────┐
            │   DATABASE (MySQL 8.0)      │
            │   36 países · 60 perguntas  │
            │   country_features (~2160)  │
            └─────────────────────────────┘
```

---

## 🧠 Motor de Inferência

O motor vive no pacote `service/inference/` e é composto por três classes com responsabilidade única.

### Submódulo `inference/`

| Classe | Tipo | Responsabilidade |
|---|---|---|
| `KnowledgeBaseCache` | `@Component` | Carrega toda a tabela `country_features` em memória via `@PostConstruct`. Expõe índices invertidos (`getTrueCountries`, `getFalseCountries`), mapa de prioridades de categoria e a matriz completa `país → pergunta → boolean`. **Sem acesso ao banco durante o jogo.** |
| `InferenceEngine` | `@Service` | Motor **stateless** e puro. `selectBestQuestion(GameState)` escolhe a pergunta com maior Ganho de Informação; `filterCandidates(candidates, questionId, answer)` retorna o subconjunto compatível. Nunca acessa o banco. |
| `GameState` | `record` (Java 21) | Value object imutável com `currentCandidates: Set<Long>` e `askedQuestions: Set<Long>`. Entrada do `InferenceEngine`. |

### Como o `KnowledgeBaseCache` carrega a matriz

No `@PostConstruct` (executado uma vez na startup), o cache lê toda a tabela `country_features` do banco e constrói **três estruturas otimizadas em RAM**:

```
country_features (banco)                   RAM após @PostConstruct
─────────────────────────                  ─────────────────────────────────────────
country_id | question_id | is_true ──────► questionToTrueCountries:  Map<Long, Set<Long>>
                                           questionToFalseCountries: Map<Long, Set<Long>>
                                           countryQuestionMatrix:    Map<Long, Map<Long, Boolean>>
                                           questionPriorities:       Map<Long, Integer>
```

**Índices invertidos** — permitem filtrar por pergunta em O(n) sem iterar todos os países:
```
questionToTrueCountries.get(questionId)  → Set de IDs de países que responderiam SIM
questionToFalseCountries.get(questionId) → Set de IDs de países que responderiam NÃO
```

### Fórmula de Entropia

```
H(S) = log₂(|S|)                             // entropia do conjunto atual
IG(Q) = H(S) − [p(sim)·H(S_sim) + p(não)·H(S_não)]   // ganho de informação
```

O motor seleciona a pergunta com **maior IG** a cada rodada. Desempate por prioridade de categoria (`GEOGRAFIA=50 > CULTURA=40 > BANDEIRA=30 > POPULACAO=20 > ECONOMIA=10`). Se ainda houver empate, sorteio aleatório para variar as partidas.

### Enum `GameStatus`

```java
public enum GameStatus {
    IN_PROGRESS,        // Motor ativo — fazendo perguntas
    GUESSING,           // Candidatos ≤ 1 — sistema propõe palpite
    WAITING_FOR_REVEAL, // Sistema desistiu — aguardando reveal do usuário
    ROBOT_WON,          // Sistema identificou corretamente
    HUMAN_WON,          // Usuário enganou o sistema
    GAVE_UP,            // Usuário desistiu
    FINISHED_REVEALED   // Sessão encerrada após revelação
}
```

> Para detalhes completos do algoritmo (fórmulas, pseudocódigo, exemplo step-by-step), consulte [ARCHITECTURE.md](../ARCHITECTURE.md#-motor-de-inferência-entropia-de-shannon).

---

## 🔄 Fluxo do GameService

O `GameService` é o **orquestrador** da sessão — ele coordena persistência e inferência, delegando toda a inteligência ao motor.

### `startNewGame()`

```
1. Verifica sessão IN_PROGRESS existente → encerra a anterior (ROBOT_WON)
2. Cria GameSession (score=100, attempts=0, status=IN_PROGRESS)
3. selectNextQuestion(session, todos os países):
   ├─ extrai candidateIds e askedIds
   ├─ new GameState(candidateIds, askedIds)
   ├─ inferenceEngine.selectBestQuestion(state) → Long bestId
   └─ monta QuestionResponse com validIsoCodes
4. Retorna GameResponse
```

### `submitAnswer()` — Loop Principal

```
POST /api/games/answer  { gameId, questionId, answer }

1. processAttempt()    → persiste GameAttempt no banco

2. getRemainingCountries():  ← FILTRAGEM 100% EM RAM
   ├─ candidateIds = knowledgeBaseCache.getCountryQuestionMatrix().keySet()
   ├─ for each attempt in session:
   │      compatible = answer ? getTrueCountries(qId) : getFalseCountries(qId)
   │      candidateIds.retainAll(compatible)         ← O(n) por resposta
   ├─ candidateIds.removeAll(rejectedIds)             ← palpites negados
   └─ countryRepository.findAllById(candidateIds)     ← 1 query SQL (final)

3. if empty:       status=HUMAN_WON  (contradição — usuário mentiu)
   if size == 1:   status=GUESSING   (convergiu!)
   else:           score -= 2; selectNextQuestion() com validIsoCodes
```

### `processGuessFeedback()` — Palpite

```
POST /api/games/guess-feedback  { gameId, correct }

Se correct=true:
  → ROBOT_WON, score += 20 (bônus de acerto)

Se correct=false:
  → addRejectedCountry(targetCountry); score -= 10
  → getRemainingCountries() (sem o rejeitado)
  → Se vazio:  WAITING_FOR_REVEAL (robô desistiu)
  → Se não:    IN_PROGRESS + próxima pergunta
```

### `revealAnswer()` — Reveal

```
POST /api/games/reveal  { gameId, countryId }

Para cada GameAttempt da sessão:
  → busca CountryFeature(realCountry, question)
  → attempt.isCorrect = (userAnswer == realFact)
  → coleta inconsistências encontradas

status = FINISHED_REVEALED
Retorna feedback com lista de respostas inconsistentes
```

---

## 📡 Endpoints da API

### Autenticação — Público

| Método | Rota | Body | Resposta |
|---|---|---|---|
| `POST` | `/api/auth/register` | `RegisterRequest` | `AuthResponse` |
| `POST` | `/api/auth/login` | `LoginRequest` | `AuthResponse` |

```json
// LoginRequest
{ "email": "user@email.com", "password": "senhaSegura" }

// AuthResponse
{
  "token": "eyJhbGc...",
  "userId": 1,
  "firstName": "Daniel",
  "email": "user@email.com",
  "totalScore": 250
}
```

### Jogo — Autenticado ou Visitante

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/games/start` | Iniciar nova sessão de inferência |
| `POST` | `/api/games/answer` | Enviar resposta binária (SIM/NÃO) |
| `POST` | `/api/games/guess-feedback` | Feedback unificado sobre palpite `{ gameId, correct }` |
| `POST` | `/api/games/deny` | Negar palpite _(compat. legado → guess-feedback false)_ |
| `POST` | `/api/games/confirm` | Confirmar palpite _(compat. legado → guess-feedback true)_ |
| `GET` | `/api/games/history` | Histórico (vazio para visitante) — **requer token** |
| `POST` | `/api/games/reveal` | Revelar o país pensado |

```json
// POST /api/games/answer — GameAnswerRequest
{ "gameId": 42, "questionId": 3, "answer": true }

// GameResponse (resposta do /answer)
{
  "gameId": 42,
  "score": 96,
  "attempts": 2,
  "status": "IN_PROGRESS",
  "remainingCountries": ["BR", "AR", "CL", "CO"],
  "nextQuestion": {
    "id": 7,
    "text": "O país tem saída para o Oceano Atlântico?",
    "category": "GEOGRAFIA",
    "helperImageUrl": null,
    "validIsoCodes": ["BR", "AR"]
  },
  "feedback": "Hmm... Próxima pergunta!",
  "completed": false
}
```

> **`validIsoCodes`** — campo novo em `nextQuestion`: lista de ISO codes dos países candidatos que responderiam **SIM** à próxima pergunta. Consumido pelo `GameGlobe` no frontend para atualizar os marcadores no globo 3D em tempo real.

```json
// POST /api/games/guess-feedback — GuessFeedbackRequest
{ "gameId": 42, "correct": true }
// correct=true  → ROBOT_WON
// correct=false → sistema erra, tenta próximo candidato ou WAITING_FOR_REVEAL
```

### Países — Público

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/countries` | `List<CountryResponse>` (36 países) |

> **Optimistic Locking:** Requests simultâneas sobre a mesma sessão retornam `409 Conflict` (tratado em `GameController` via `@ExceptionHandler(ObjectOptimisticLockingFailureException.class)`).

---

## 🔒 Arquitetura Stateless

O backend é **100% stateless** — nenhum estado é mantido no servidor entre requests. Todo o contexto é reconstituído a partir do banco a cada chamada.

### O que torna possível a statelessness:

1. **JWT** — autenticação sem sessão HTTP (`HttpSession` nunca é criado)
2. **`KnowledgeBaseCache` em RAM** — substituição dos dados estáticos que antes seriam buscados repetidamente
3. **`GameSession` no banco** — persiste o estado mutável (score, attempts, status, rejected countries)
4. **`GameAttempt` como log** — o histórico de respostas permite reconstruir o `GameState` a qualquer momento

### Benefícios:
- Escala horizontalmente sem sticky sessions
- Cada request pode ser atendida por qualquer instância
- Deploy simples em Railway sem necessidade de session affinity

---

## 🔐 Sistema de Autenticação JWT

```
1. POST /api/auth/login
   ↓
2. LoginService valida credenciais via AuthenticationManager
   ↓
3. JwtTokenProvider.generateToken(email)  → JWT (HS256, 24h)
   ↓
4. AuthResponse  { token, userId, firstName, ... }
   ↓
5. Frontend armazena token no localStorage
   ↓
6. Próximas requests: Authorization: Bearer <token>
   ↓
7. JwtAuthenticationFilter extrai email do payload
   ↓
8. CustomUserDetailsService carrega User do banco
   ↓
9. SecurityContextHolder.setAuthentication(...)
   ↓
10. Controller acessa usuário via authentication.getName()
```

### Rotas públicas vs protegidas

```
PUBLIC: POST /api/auth/**
PUBLIC: GET  /api/countries
PUBLIC: POST /api/games/start, answer, deny, confirm, guess-feedback, reveal
SECURED: GET /api/games/history
SECURED: qualquer outra rota
```

---

## 👥 Modo Visitante

Endpoints de jogo aceitam requests **sem token JWT**. Quando não há autenticação, o backend usa o identificador `"guest"` e não persiste histórico nem pontuação no perfil.

```java
// GameController — padrão para todas as rotas de jogo
String userEmail = (authentication != null && authentication.isAuthenticated())
    ? authentication.getName()
    : "guest";
```

---

## ⚙️ Configurações e Variáveis de Ambiente

O `application.properties` usa `${VAR:default}` para suportar Railway (produção) e ambiente local.

| Variável de Ambiente | Default local | Descrição |
|---|---|---|
| `PORT` | `5202` | Porta do servidor |
| `MYSQLHOST` | `localhost` | Host do MySQL |
| `MYSQLPORT` | `3307` | Porta do MySQL |
| `MYSQLDATABASE` | `atlas4me` | Nome do banco |
| `MYSQLUSER` | `atlas_user` | Usuário do banco |
| `MYSQLPASSWORD` | `atlas_password` | Senha do banco |
| `JWT_SECRET` | (chave padrão) | Segredo para assinar JWT — **trocar em produção!** |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Origens permitidas |
| `SWAGGER_ENABLED` | `false` | Ativa Swagger UI |
| `SHOW_SQL` | `false` | Loga SQL no console |
| `LOG_LEVEL` | `INFO` | Nível de log |

---

## 🚀 Como Executar

### Pré-requisitos

- Java 21+
- Maven 3.8+ (ou use o wrapper `./mvnw`)
- MySQL rodando na porta 3307 (ou via Docker Compose)

### Passos

```bash
# 1. Suba o banco de dados via Docker
docker-compose up atlas_db -d

# 2. Execute o backend
cd backend
mvn spring-boot:run

# Backend disponível em: http://localhost:5202

# 3. Verificar saúde
curl http://localhost:5202/api/countries
# Deve retornar JSON com os 36 países
```

### Docker Completo

```bash
# Sobe banco + backend + frontend
docker-compose up --build
```

---

## 🗄️ Flyway Migrations

| Migration | Arquivo | Conteúdo |
|---|---|---|
| V1 | `V1__create_table.sql` | Criação de todas as 7 tabelas (com campo `continent`) |
| V2 | `V2__insert_initial_data.sql` | Dados iniciais do projeto |
| V3 | `V3__insert_world_countries.sql` | **36 países** de múltiplos continentes + lat/lon |
| V4 | `V4__insert_more_questions.sql` | **60 perguntas** estratégicas + gabarito completo em `country_features` |

---

## 🐛 Troubleshooting

### Erro ao conectar ao banco
```
Verifique se o container atlas_db está rodando:
  docker ps
  docker-compose up atlas_db -d
```

### Erro 401 Unauthorized
```
Token JWT expirado (validade 24h) ou inválido.
Faça login novamente: POST /api/auth/login
```

### Erro 409 Conflict ao iniciar sessão
```
Usuário já tem uma sessão IN_PROGRESS ativa.
Só é permitida 1 sessão simultânea por usuário logado.
```

### Flyway baseline error
```
Banco já existe com tabelas mas sem histórico Flyway.
Solução: spring.flyway.baseline-on-migrate=true (já configurado)
```

### `KnowledgeBaseCache` com 0 perguntas ao subir
```
Verifique se as migrations V3 e V4 foram aplicadas corretamente:
  SELECT COUNT(*) FROM country_features;  -- deve retornar ~2160
  SELECT COUNT(*) FROM questions;         -- deve retornar 60
  SELECT COUNT(*) FROM countries;         -- deve retornar 36
```

---

*Última atualização: Março 2026*
