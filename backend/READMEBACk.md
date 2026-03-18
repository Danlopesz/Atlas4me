# 🌍 Atlas4Me Backend — API REST & Motor de Inferência

> Backend Java Spring Boot do Atlas4Me. Responsável pela API REST, autenticação JWT e pelo **motor de inferência** que seleciona perguntas dinamicamente usando **Entropia de Shannon** para identificar o país pensado pelo usuário.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-10.x-red.svg)](https://flywaydb.org/)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Arquitetura em Camadas](#-arquitetura-em-camadas)
3. [Motor de Inferência (GameService)](#-motor-de-inferência-gameservice)
4. [Endpoints da API](#-endpoints-da-api)
5. [Fluxo da Sessão de Inferência](#-fluxo-da-sessão-de-inferência)
6. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
7. [Modo Visitante](#-modo-visitante)
8. [Configurações e Variáveis de Ambiente](#-configurações-e-variáveis-de-ambiente)
9. [Como Executar](#-como-executar)
10. [Flyway Migrations](#-flyway-migrations)
11. [Troubleshooting](#-troubleshooting)

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
| Flyway | 10.x | Migrations versionadas |
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
│  │  GameService  ← orquestra o ciclo da sessão            │  │
│  │  CustomUserDetailsService                             │  │
│  │  ─── inference/ (submódulo stateless) ──────────────  │  │
│  │  InferenceEngine (motor Shannon) • KnowledgeBaseCache │  │
│  │  GameState (record imutável)                          │  │
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
                          │ JDBC / Flyway
                          ▼
            ┌─────────────────────────────┐
            │   DATABASE (MySQL 8.0)      │
            │   Base de conhecimento:     │
            │   country_features          │
            └─────────────────────────────┘
```

---

## 🧠 Motor de Inferência

O `GameService` orquestra o ciclo da sessão, delegando a inteligência ao submódulo `service/inference/`.

### Submódulo `inference/`

| Classe | Tipo | Responsabilidade |
|---|---|---|
| `KnowledgeBaseCache` | `@Component` | Carrega a tabela `country_features` inteira em memória via `@PostConstruct`. Expõe índices invertidos (`getTrueCountries`, `getFalseCountries`), mapa de prioridades de categoria e a matriz completa `país → pergunta → boolean`. Sem acesso ao banco durante o jogo. |
| `InferenceEngine` | `@Service` | Motor **stateless**: `selectBestQuestion(GameState)` escolhe a pergunta com maior Ganho de Informação (IG = H − entropia ponderada esperada); `filterCandidates(candidates, questionId, answer)` retorna o subconjunto compatível. Nunca acessa o banco — opera apenas sobre o `KnowledgeBaseCache`. |
| `GameState` | `record` (Java 21) | Value object imutável com `currentCandidates: Set<Long>` e `askedQuestions: Set<Long>`. Entrada do `InferenceEngine`. |

### Como funciona

```
1. GameService cria um GameState com os candidatos atuais e perguntas já feitas
2. InferenceEngine.selectBestQuestion(state) calcula a entropia de Shannon para
   cada pergunta disponível e elege a de maior IG:
     IG(Q) = H(S) − [p(sim)·H(S_sim) + p(não)·H(S_não)]
3. Usuário responde SIM ou NÃO
4. InferenceEngine.filterCandidates(candidates, questionId, answer) retorna
   novo conjunto compatível com a resposta
5. Se |candidatos| ≤ 1 → passa para fase GUESSING
```

### Base de Conhecimento

A tabela `country_features` é a matriz `País × Pergunta → Resposta booleana` que alimenta o motor:

```
Brasil    + "Fala Espanhol?"   = FALSE
Argentina + "Fala Espanhol?"   = TRUE
Brasil    + "Tem litoral?"     = TRUE
Bolívia   + "Tem litoral?"     = FALSE
```

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
| `POST` | `/api/games/guess-feedback` | **Novo** — feedback unificado `{ gameId, correct }` |
| `POST` | `/api/games/deny` | Negar palpite _(compat. legado → guess-feedback false)_ |
| `POST` | `/api/games/confirm` | Confirmar palpite _(compat. legado → guess-feedback true)_ |
| `GET` | `/api/games/history` | Histórico (vazio para visitante) |
| `POST` | `/api/games/reveal` | Revelar o país pensado |

```json
// POST /api/games/guess-feedback — GuessFeedbackRequest
{ "gameId": 42, "correct": true }
// correct = true  → ROBOT_WON
// correct = false → tenta próximo candidato ou WAITING_FOR_REVEAL

// POST /api/games/answer — GameAnswerRequest
{ "gameId": 42, "questionId": 3, "answer": true }

// GameResponse (exemplo)
{
  "gameId": 42,
  "score": 90,
  "attempts": 2,
  "status": "IN_PROGRESS",
  "remainingCountries": ["BR", "GY", "SR"],
  "nextQuestion": { "id": 5, "text": "O país tem saída para o mar?", "category": "GEOGRAFIA" },
  "completed": false
}
```

> **Optimistic Locking:** Requests simultâneas sobre a mesma sessão retornam `409 Conflict` (tratado em `GameController` via `@ExceptionHandler(ObjectOptimisticLockingFailureException.class)`).

### Países — Público

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/countries` | `List<CountryResponse>` (base de conhecimento) |

---

## 🎮 Fluxo da Sessão de Inferência

```
1. POST /api/games/start
   ├─ Sistema sorteia país alvo (oculto do usuário)
   ├─ Cria GameSession (status=IN_PROGRESS, score=100)
   └─ InferenceEngine seleciona 1ª pergunta por maior Ganho de Informação

2. POST /api/games/answer  [loop até candidatos ≤ 1]
   ├─ Salva resposta em GameAttempt
   ├─ InferenceEngine.filterCandidates() elimina incompatíveis
   ├─ InferenceEngine.selectBestQuestion() recalcula melhor pergunta
   └─ Retorna países restantes (ISO codes) + próxima pergunta

3. Fase GUESSING (status=GUESSING)
   ├─ Sistema propõe: "Você pensou no Brasil?"
   ├─ POST /api/games/guess-feedback { correct: false } → sistema erra, tenta próximo
   └─ POST /api/games/guess-feedback { correct: true }  → ROBOT_WON, sessão encerra

4. Fase REVEAL (status=WAITING_FOR_REVEAL)
   ├─ Sistema desistiu após esgotar candidatos
   ├─ POST /api/games/reveal → { countryId: X }
   └─ Sistema valida, calcula Feedback → HUMAN_WON ou FINISHED_REVEALED
```

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
PUBLIC: POST /api/games/start, answer, deny, confirm, reveal
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

### Banco de Dados Local

```
Host:     localhost
Port:     3307
Database: atlas4me
User:     atlas_user
Password: atlas_password
```

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
```

### Docker Completo

```bash
# Sobe banco + backend + frontend
docker-compose up --build
```

---

## 🗄️ Flyway Migrations

| Migration | Descrição |
|---|---|
| `V1__create_table.sql` | Criação de todas as 7 tabelas |
| `V2__insert_initial_data.sql` | 13 países + 16 perguntas + gabarito `country_features` |
| `V3__Add_Lat_Lon_To_Countries.sql` | Colunas `latitude` e `longitude` nos países |
| `V4__Add_IsoCode_To_CountryFeatures.sql` | `iso_code` redundante nas features |

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

---

*Última atualização: Março 2026*
