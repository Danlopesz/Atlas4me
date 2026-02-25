# 🌍 Atlas4Me Backend — API REST

> Backend Java Spring Boot do jogo de adivinhação de países Atlas4Me. Sistema completo com autenticação JWT, algoritmo de filtragem progressiva, suporte a visitantes e deploy via Railway/Docker.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-10.x-red.svg)](https://flywaydb.org/)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Conceito do Jogo](#-conceito-do-jogo)
3. [Arquitetura em Camadas](#-arquitetura-em-camadas)
4. [Modelo de Dados](#-modelo-de-dados)
5. [Endpoints da API](#-endpoints-da-api)
6. [Fluxo Completo do Jogo](#-fluxo-completo-do-jogo)
7. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
8. [Modo Visitante](#-modo-visitante)
9. [Configurações e Variáveis de Ambiente](#-configurações-e-variáveis-de-ambiente)
10. [Como Executar](#-como-executar)
11. [Flyway Migrations](#-flyway-migrations)

---

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.2.x | Framework web e IoC |
| Spring Security | 6.x | Autenticação e autorização |
| JWT (JJWT) | — | Tokens stateless |
| Spring Data JPA | — | ORM / abstração de persistência |
| Hibernate | — | Implementação JPA |
| MySQL | 8.0 | Banco relacional (prod e local) |
| Flyway | 10.x | Migrations versionadas |
| Lombok | — | Redução de boilerplate |
| Springdoc OpenAPI | — | Documentação Swagger |
| Maven | 3.8+ | Gerenciamento de dependências |

---

## 🎮 Conceito do Jogo

### O que é o Atlas4Me?

O **Atlas4Me** é um jogo educativo estilo **Akinator**, focado em **geografia da América do Sul**. O jogador **pensa** em um dos 13 países e o sistema tenta **adivinhar** fazendo perguntas estratégicas.

### Fluxo Simplificado

```
1. Jogador pensa em um país (ex: Brasil) — NÃO revela!
2. Sistema pergunta: "A língua principal é o Espanhol?"
3. Jogador responde: NÃO
4. Sistema elimina países que falam Espanhol → restam 4
5. Sistema continua até restar 1 candidato
6. Sistema tenta: "Você pensou no Brasil?" → Jogador confirma ou nega
7. Ao final, jogador revela o país → sistema calcula pontuação
```

### Sistema de Pontuação

| Evento | Efeito |
|---|---|
| Pontuação inicial | 100 pontos |
| Cada erro do sistema (palpite negado) | −10 pontos |
| Sistema adivinhou (`ROBOT_WON`) | Jogador perde pontos conforme erros |
| Jogador venceu (`HUMAN_WON`) | 100 pontos garantidos |

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
│  │  LoginService • RegisterService                       │  │
│  │  GameService  • CountryService                        │  │
│  │  CustomUserDetailsService                             │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │  DOMAIN LAYER (Entities + Enums)                      │  │
│  │  User • Country • Question • CountryFeature           │  │
│  │  GameSession • GameAttempt • GameStatus               │  │
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
            │   Port: 3307 (local)        │
            │   Host: Railway (prod)      │
            └─────────────────────────────┘
```

---

## 📊 Modelo de Dados

### Diagrama ER

```
┌──────────────────┐        ┌──────────────────────┐
│      User        │ 1    N │     GameSession       │
│──────────────────│────────│──────────────────────│
│ id (PK)          │        │ id (PK)               │
│ email (UNIQUE)   │        │ user_id (FK) ← NULL   │ ← visitante
│ firstName        │        │ target_country_id (FK)│
│ lastName         │        │ status (ENUM)         │
│ password (BCrypt)│        │ score                 │
│ totalScore       │        │ attempts              │
│ gamesPlayed      │        │ started_at            │
│ role (USER|ADMIN)│        │ finished_at           │
│ active           │        └──────────┬───────────┘
│ createdAt        │                   │ 1
│ updatedAt        │                   │
└──────────────────┘                   │ N
                            ┌──────────▼───────────┐
                            │     GameAttempt      │
                            │──────────────────────│
                            │ id (PK)              │
                            │ session_id (FK)      │
                            │ question_id (FK)     │
                            │ user_answer (BOOL)   │
                            │ is_correct (BOOL)    │
                            │ attempted_at         │
                            └──────────────────────┘

┌──────────────────┐        ┌──────────────────────┐
│     Country      │ 1    N │   CountryFeature      │
│──────────────────│────────│──────────────────────│
│ id (PK)          │        │ id (PK)               │
│ name (UNIQUE)    │        │ country_id (FK)       │
│ iso_code         │        │ question_id (FK)      │
│ image_url        │        │ is_true (BOOL)        │ ← gabarito
│ latitude         │        └──────────────────────┘
│ longitude        │
└──────────────────┘        ┌──────────────────────┐
                            │      Question        │
                            │──────────────────────│
                            │ id (PK)               │
                            │ text                  │
                            │ category              │
                            │ helper_image_url      │
                            └──────────────────────┘

game_session_rejected (join table N:N)
 session_id (FK) | country_id (FK)  ← países que o robô chutou e errou
```

### Enum `GameStatus`

```java
public enum GameStatus {
    IN_PROGRESS,        // Jogo ativo — fazendo perguntas
    GUESSING,           // Robô está tentando adivinhar o país
    WAITING_FOR_REVEAL, // Robô desistiu — aguardando reveal do jogador
    ROBOT_WON,          // Robô adivinhou corretamente
    HUMAN_WON,          // Jogador venceu — robô errou/desistiu
    GAVE_UP,            // Jogador desistiu
    FINISHED_REVEALED   // Jogo encerrado após revelação
}
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
| `POST` | `/api/games/start` | Iniciar nova partida |
| `POST` | `/api/games/answer` | Responder pergunta |
| `GET` | `/api/games/history` | Histórico (vazio para visitante) |
| `POST` | `/api/games/deny` | Negar palpite do robô |
| `POST` | `/api/games/confirm` | Confirmar palpite do robô |
| `POST` | `/api/games/reveal` | Revelar o país pensado |

```json
// POST /api/games/answer — GameAnswerRequest
{ "gameId": 42, "questionId": 3, "answer": true }

// GameResponse (exemplo)
{
  "gameId": 42,
  "score": 90,
  "attempts": 2,
  "status": "IN_PROGRESS",
  "remainingCountries": ["Brasil", "Guiana", "Suriname"],
  "nextQuestion": { "id": 5, "text": "O país tem saída para o mar?", "category": "GEOGRAFIA" },
  "completed": false
}
```

### Países — Público

| Método | Rota | Resposta |
|---|---|---|
| `GET` | `/api/countries` | `List<CountryResponse>` |

---

## 🎮 Fluxo Completo do Jogo

```
1. POST /api/games/start
   ├─ Sistema sorteia país alvo (oculto do jogador)
   ├─ Cria GameSession (status=IN_PROGRESS, score=100)
   └─ Retorna lista de todos os países + primeira pergunta

2. POST /api/games/answer  [loop]
   ├─ Salva resposta em GameAttempt
   ├─ Aplica algoritmo de filtragem progressiva
   ├─ remainingCountries.size() <= 1 → passa para fase GUESSING
   └─ Retorna países restantes + próxima pergunta

3. Fase GUESSING (status=GUESSING)
   ├─ Sistema propõe: "Você pensou no Brasil?"
   ├─ POST /api/games/deny → robô errou, tenta próximo
   └─ POST /api/games/confirm → ROBOT_WON, jogo encerra

4. Fase REVEAL (status=WAITING_FOR_REVEAL)
   ├─ Robô desistiu após erros demais
   ├─ POST /api/games/reveal  →  { countryId: X }
   └─ Sistema valida, calcula pontuação → HUMAN_WON ou FINISHED_REVEALED
```

### Algoritmo de Filtragem (dentro de `GameService`)

```
Para cada GameAttempt da sessão:
  → Filtra countries onde country_features.is_true = userAnswer
  → Intersecta com candidatos anteriores

Brasil, Argentina, Chile... (13 países)
  ↓ "Fala Espanhol?" = NÃO
Brasil, Guiana, Suriname, Guiana Francesa (4 países)
  ↓ "Usa Euro?" = NÃO
Brasil, Guiana, Suriname (3 países)
  ↓ "Fala Inglês?" = NÃO
Brasil, Suriname (2 países)
  ↓ "Fala Holandês?" = NÃO
Brasil ← 1 candidato → GUESSING!
```

---

## 🔐 Sistema de Autenticação JWT

### Fluxo

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

### Payload do JWT

```json
{
  "sub": "user@email.com",
  "iat": 1740000000,
  "exp": 1740086400
}
```

### Configuração de Segurança (rotas públicas)

```
PUBLIC: POST /api/auth/**
PUBLIC: GET  /api/countries
PUBLIC: POST /api/games/start    (visitante)
PUBLIC: POST /api/games/answer   (visitante)
PUBLIC: POST /api/games/deny     (visitante)
PUBLIC: POST /api/games/confirm  (visitante)
PUBLIC: POST /api/games/reveal   (visitante)
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

O arquivo `application.properties` usa `${VAR:default}` para suportar deploy em produção (Railway) e ambiente local.

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

### Banco de Dados Local (Docker Compose)

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
| `V1__create_table.sql` | Criação de todas as tabelas (users, countries, questions, country_features, game_sessions, game_attempts, game_session_rejected) |
| `V2__insert_initial_data.sql` | Inserção dos 13 países da América do Sul + 16 perguntas + gabarito country_features |
| `V3__Add_Lat_Lon_To_Countries.sql` | Adiciona colunas `latitude` e `longitude` à tabela countries |
| `V4__Add_IsoCode_To_CountryFeatures.sql` | Adiciona iso_code redundante em country_features (otimização de consulta) |

---

## 🐛 Troubleshooting Comum

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

### Erro 409 Conflict ao iniciar jogo
```
Usuário já tem uma sessão IN_PROGRESS ativa.
Só é permitida 1 partida simultânea por usuário logado.
```

### Flyway baseline error
```
Banco já existe com tabelas mas sem histórico Flyway.
Solução: spring.flyway.baseline-on-migrate=true (já configurado)
```

---

*Última atualização: Fevereiro 2026*
