# 🏗️ ARCHITECTURE — Atlas4Me

> Guia técnico detalhado de arquitetura, decisões de design e funcionamento interno do projeto Atlas4Me — jogo educativo de adivinhação de países da América do Sul, estilo Akinator.

---

## 📑 Índice

1. [Visão Geral do Sistema](#-visão-geral-do-sistema)
2. [Stack Completo](#-stack-completo)
3. [Arquitetura Full Stack](#-arquitetura-full-stack)
4. [Modelo de Dados Detalhado](#-modelo-de-dados-detalhado)
5. [Fluxo Completo do Jogo](#-fluxo-completo-do-jogo)
6. [Algoritmo de Filtragem Progressiva](#-algoritmo-de-filtragem-progressiva)
7. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
8. [Modo Visitante](#-modo-visitante)
9. [Componentes Visuais Especiais](#-componentes-visuais-especiais)
10. [Análise de Decisões Técnicas](#-análise-de-decisões-técnicas)
11. [Infraestrutura e Deploy](#-infraestrutura-e-deploy)

---

## 🎯 Visão Geral do Sistema

### Problema Resolvido

Ensinar geografia de forma **gamificada** e **interativa**. O Atlas4Me transforma o aprendizado sobre os 13 países da América do Sul em uma experiência divertida — similar ao Akinator, mas com foco educativo.

### Funcionamento Básico

```
1. JOGADOR  →  pensa em um país da América do Sul (não revela)
2. SISTEMA  →  faz perguntas ("Fala Espanhol?", "Tem litoral?")
3. JOGADOR  →  responde SIM ou NÃO honestamente
4. SISTEMA  →  elimina países que não encaixam nas respostas
5. SISTEMA  →  propõe um palpite quando poucos países restam
6. JOGADOR  →  confirma ou nega; ao final revela o país
7. SISTEMA  →  calcula pontuação e registra no histórico
```

### Diferenciais

- ✅ Algoritmo de eliminação progressiva (similar ao Akinator)
- ✅ Suporte a **Visitantes** — joga sem criar conta
- ✅ **Perfil** com histórico e estatísticas de partidas
- ✅ Base de conhecimento normalizada (País × Pergunta × Resposta)
- ✅ Feedback educativo ao final de cada partida
- ✅ Tema visual imersivo com estrelas animadas e componentes 3D
- ✅ Deploy via Railway (backend) + Vercel (frontend)

---

## 💻 Stack Completo

### Backend

| Tecnologia | Versão | Função |
|---|---|---|
| Java | 21 | Linguagem principal |
| Spring Boot | 3.2.x | Framework web e IoC |
| Spring Security | 6.x | Autenticação e autorização |
| JWT (JJWT) | — | Tokens stateless HS256 |
| Spring Data JPA + Hibernate | — | ORM e acesso a dados |
| MySQL | 8.0 | Banco relacional |
| Flyway | 10.x | Migrations versionadas (4 versões) |
| Springdoc OpenAPI | — | Swagger UI (habilitável por env var) |
| Lombok | — | Redução de boilerplate |
| Maven | 3.8+ | Build e dependências |

### Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 7.x | Build tool + HMR |
| React Router DOM | 7.x | SPA routing |
| Axios | 1.x | HTTP client + interceptors |
| CSS3 Puro | — | Estilização (glassmorphism + animações) |

### Infraestrutura

| Serviço | Ambiente | Tecnologia |
|---|---|---|
| Database | Local | Docker (MySQL 8.0 na porta 3307) |
| Backend | Local | `mvn spring-boot:run` (porta 5202) |
| Frontend | Local | `npm run dev` (porta 5173) |
| Database | Produção | Railway MySQL |
| Backend | Produção | Railway (container Docker) |
| Frontend | Produção | Vercel |

---

## 🏗️ Arquitetura Full Stack

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 19 + Vite 7 + React Router 7 + Axios                 │
│  Port: 5173 (dev)  |  Vercel (prod)                         │
│                                                              │
│  Páginas: Home • Login • Cadastro • ComoJogar • Jogar • Perfil │
│  Components: Navbar • GameGlobe • Planet3D • SouthAmericaHologram │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP REST / JSON
                     │ Authorization: Bearer <JWT>
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                        BACKEND                               │
│  Spring Boot 3.2  |  Port: 5202  |  Railway (prod)          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  CONFIG LAYER                                           │ │
│  │  JwtAuthenticationFilter • JwtTokenProvider            │ │
│  │  SecurityConfig (CORS + Auth rules) • SwaggerConfig    │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │  PRESENTATION LAYER (Controllers)                       │ │
│  │  AuthController  →  /api/auth/*                        │ │
│  │  GameController  →  /api/games/*                       │ │
│  │  CountryController → /api/countries                    │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │  APPLICATION LAYER (Services)                           │ │
│  │  LoginService • RegisterService                        │ │
│  │  GameService (algoritmo + ciclo de vida)               │ │
│  │  CountryService • CustomUserDetailsService             │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │  DOMAIN LAYER (Entities + Enums)                        │ │
│  │  User • Country • Question • CountryFeature             │ │
│  │  GameSession • GameAttempt • GameStatus                 │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │  INFRASTRUCTURE (Repositories + Exception Handlers)     │ │
│  │  *Repository (JpaRepository) • GlobalExceptionHandler   │ │
│  └──────────────────────┬──────────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────────┘
                          │ JDBC + Flyway Migrations
                          ▼
          ┌───────────────────────────────────────┐
          │          DATABASE (MySQL 8.0)          │
          │  6 tabelas + 1 join table              │
          │  4 migrations Flyway versionadas       │
          └───────────────────────────────────────┘
```

---

## 📊 Modelo de Dados Detalhado

### Diagrama Completo

```
┌────────────────────────┐
│         User           │
├────────────────────────┤
│ PK: id                 │
│ UK: email              │
│     firstName          │
│     lastName           │
│     password (BCrypt)  │
│     totalScore         │◄─── Cache acumulado (performance no ranking)
│     gamesPlayed        │◄─── Cache contagem (performance)
│     role (USER|ADMIN)  │
│     active             │◄─── Soft delete
│     createdAt          │
│     updatedAt          │
└───────────┬────────────┘
            │ 1
            │ N (um user tem muitas sessões; NULL = visitante)
┌───────────▼────────────┐
│      GameSession        │
├────────────────────────┤
│ PK: id                 │
│ FK: user_id  (NULL OK) │◄─── NULL para visitante
│ FK: target_country_id  │◄─── País que o SISTEMA sorteia (oculto)
│     status (enum)      │◄─── IN_PROGRESS | GUESSING | WAITING_FOR_REVEAL
│                        │      | ROBOT_WON | HUMAN_WON | GAVE_UP | FINISHED_REVEALED
│     score              │◄─── Inicia em 100, -10 por erro do robô
│     attempts           │◄─── Contador de perguntas respondidas
│     started_at         │
│     finished_at        │◄─── NULL enquanto em andamento
└─────────┬──────────────┘
          │ 1
          │ N
┌─────────▼──────────────┐
│      GameAttempt        │
├────────────────────────┤
│ PK: id                 │
│ FK: session_id         │
│ FK: question_id        │◄─── Qual pergunta foi feita
│     user_answer (BOOL) │◄─── SIM (true) ou NÃO (false)
│     is_correct  (BOOL) │◄─── Preenchido no reveal — se a resposta estava certa
│     attempted_at       │
└────────────────────────┘

┌────────────────────────┐          ┌─────────────────────────┐
│        Country          │  1    N  │      CountryFeature      │  N   1  ┌────────────────────────┐
├────────────────────────┤──────────├─────────────────────────┤─────────►│        Question         │
│ PK: id                 │          │ PK: id                   │          ├────────────────────────┤
│ UK: name               │          │ FK: country_id           │          │ PK: id                 │
│     iso_code           │          │ FK: question_id          │          │     text               │
│     image_url          │          │     is_true (BOOL)       │◄─ gabarito    category        │
│     latitude           │          │     iso_code             │          │     helper_image_url   │
│     longitude          │          └─────────────────────────┘          └────────────────────────┘
└────────────────────────┘

game_session_rejected (N:N join table)
  session_id (FK) | country_id (FK) ← países que o robô chutou e errou na sessão
```

### Explicação das Entidades

#### `User`
Autenticação + estatísticas globais. Implementa `UserDetails` do Spring Security usando `email` como username. `totalScore` e `gamesPlayed` são campos de cache (evitam JOINs pesados no ranking).

#### `GameSession`
Controla UMA partida do início ao fim. `user_id` pode ser `NULL` (visitante). `target_country_id` é o país que o sistema sorteia internamente — invisível para o jogador.

#### `GameAttempt`
Log imutável de cada resposta do jogador. `is_correct` é calculado apenas no `reveal` — quando o jogador finalmente diz qual país pensou, permite verificar se todas as respostas estavam corretas.

#### `Country`
Dados básicos do país. Características ficam na `CountryFeature` (normalização — princípio Open/Closed: adicionar feature = INSERT, não ALTER TABLE).

#### `Question`
Perguntas configuráveis sem mudança de código. Categorias: `GEOGRAFIA`, `CULTURA`, `BANDEIRA`, `ECONOMIA`, `POPULACAO`.

#### `CountryFeature`
**O "cérebro" do sistema.** Matriz `País × Pergunta → Resposta booleana`. Exemplo:
```
Brasil   + "Fala Espanhol?" = FALSE
Argentina + "Fala Espanhol?" = TRUE
Brasil   + "Tem litoral?"   = TRUE
Bolívia  + "Tem litoral?"   = FALSE
```

---

## 🎮 Fluxo Completo do Jogo

### Fase 1 — Iniciar Partida

```
POST /api/games/start
Header: Authorization: Bearer <token>  (ou sem header se visitante)

GameService.startNewGame():
  1. Verifica se usuário já tem sessão IN_PROGRESS → BusinessException se sim
  2. Sorteia país alvo aleatoriamente (oculto)
  3. Cria GameSession (score=100, attempts=0, status=IN_PROGRESS)
  4. Retorna GameResponse com todos os 13 países + primeira pergunta

Response:
{
  "gameId": 42,
  "score": 100,
  "attempts": 0,
  "status": "IN_PROGRESS",
  "remainingCountries": ["Brasil", "Argentina", ...],  // 13 países
  "nextQuestion": { "id": 1, "text": "A língua principal é o Espanhol?", ... },
  "completed": false
}
```

### Fase 2 — Loop de Perguntas

```
POST /api/games/answer
Body: { "gameId": 42, "questionId": 1, "answer": false }

GameService.submitAnswer():
  1. Busca GameSession ativa do usuário
  2. Registra GameAttempt (session=42, question=1, userAnswer=false, isCorrect=null)
  3. Incrementa attempts
  4. Aplica algoritmo de filtragem (veja seção abaixo)
  5. Se remainingCountries.size() <= 1 → muda status para GUESSING
  6. Retorna países restantes + próxima pergunta

Response:
{
  "gameId": 42,
  "score": 100,
  "attempts": 1,
  "status": "IN_PROGRESS",
  "remainingCountries": ["Brasil", "Guiana", "Suriname", "Guiana Francesa"],
  "nextQuestion": { "id": 3, "text": "O país tem saída para o mar?" },
  "completed": false
}
```

### Fase 3 — Robô Tenta Adivinhar (GUESSING)

```
Sistema propõe: "Você pensou no Brasil?"

Se jogador niega:
  POST /api/games/deny   →  { gameId: 42 }
  GameService.denyRobotGuess():
    - Adiciona país tentado em game_session_rejected
    - Tenta próximo candidato
    - Se esgotou candidatos → status = WAITING_FOR_REVEAL

Se jogador confirma:
  POST /api/games/confirm   →  { gameId: 42 }
  GameService.confirmRobotGuess():
    - status = ROBOT_WON
    - Atualiza totalScore e gamesPlayed do usuário
    - Retorna GameResponse com completed=true
```

### Fase 4 — Reveal (WAITING_FOR_REVEAL)

```
Robô desistiu — pede ao jogador que revele o país

POST /api/games/reveal
Body: { "gameId": 42, "countryId": 1 }   // countryId = Brasil

GameService.revealAnswer():
  1. Atualiza target_country_id na sessão (se era NULL)
  2. Para cada GameAttempt da sessão:
     - Compara userAnswer com CountryFeature(countryId, questionId).isTrue
     - Preenche isCorrect
  3. Se sistema acertaria com o país revelado → ROBOT_WON
  4. Caso contrário → HUMAN_WON
  5. Atualiza totalScore e gamesPlayed
  6. status = FINISHED_REVEALED

Response:
{
  "completed": true,
  "status": "HUMAN_WON",
  "score": 100,
  "targetCountry": { "id": 12, "name": "Suriname", ... },
  "feedback": [
    { "question": "Fala Espanhol?", "yourAnswer": false, "correct": true },
    ...
  ]
}
```

---

## 🧠 Algoritmo de Filtragem Progressiva

### Pseudocódigo

```python
def get_remaining_countries(session_id):
    # Busca todas tentativas da sessão
    attempts = SELECT * FROM game_attempts
               WHERE session_id = session_id
               ORDER BY attempted_at ASC

    # Começa com todos os países
    candidates = SELECT * FROM countries

    # Aplica cada filtro sequencialmente
    for attempt in attempts:
        # Filtra países onde a feature corresponde à resposta do jogador
        candidates = [
            c for c in candidates
            if CountryFeature(c.id, attempt.question_id).is_true == attempt.user_answer
        ]

    return candidates
```

### Exemplo Prático — Jogador Pensa em Brasil

```
Estado inicial: 13 países

Pergunta 1: "A língua principal é o Espanhol?" → NÃO (false)
  Filtro: country_features.question_id=1 AND is_true=FALSE
  Restam: Brasil, Guiana, Suriname, Guiana Francesa  (4 países)

Pergunta 2: "O país tem saída para o mar?" → SIM (true)
  Filtro: question_id=3 AND is_true=TRUE  ∩  candidatos anteriores
  Restam: Brasil, Guiana, Suriname, Guiana Francesa  (todos têm litoral)

Pergunta 3: "O país usa o Euro como moeda?" → NÃO (false)
  Filtro: question_id=7 AND is_true=FALSE
  Restam: Brasil, Guiana, Suriname  (3 países — excluiu G. Francesa)

Pergunta 4: "A língua principal é o Inglês?" → NÃO (false)
  Filtro: question_id=15 AND is_true=FALSE
  Restam: Brasil, Suriname  (2 países — excluiu Guiana)

Pergunta 5: "A língua principal é o Holandês?" → NÃO (false)
  Filtro: question_id=16 AND is_true=FALSE
  Restam: Brasil  (1 país!)  →  status = GUESSING

Robô propõe: "Você pensou no Brasil?" → Jogador confirma → ROBOT_WON 🎉
```

### Implementação SQL Real

```sql
SELECT DISTINCT c.*
FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = :questionId
  AND cf.is_true = :userAnswer
  AND c.id IN (:currentCandidateIds)
```

---

## 🔐 Sistema de Autenticação JWT

### Fluxo Completo

```
1. REGISTRO
   POST /api/auth/register
   ├─ Email duplicado? → DuplicateEmailException (409)
   ├─ Senha criptografada com BCrypt
   ├─ User salvo com role=USER
   └─ JWT gerado e retornado

2. LOGIN
   POST /api/auth/login
   ├─ AuthenticationManager valida credenciais
   ├─ JwtTokenProvider.generateToken(email)
   └─ AuthResponse { token, userId, firstName, ... }

3. REQUEST AUTENTICADA
   Frontend adiciona: Authorization: Bearer <token>
   ├─ JwtAuthenticationFilter intercepta
   ├─ Extrai email do payload JWT
   ├─ CustomUserDetailsService.loadUserByUsername(email)
   ├─ Injeta Authentication no SecurityContextHolder
   └─ Controller acessa via authentication.getName()

4. TOKEN EXPIRADO (24h)
   ├─ Backend retorna 401
   ├─ Interceptor Axios detecta 401
   ├─ localStorage.clear()
   └─ Redireciona para /login
```

### Estrutura do JWT

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{ "sub": "user@email.com", "iat": 1740000000, "exp": 1740086400 }
```

### Rotas Públicas vs Protegidas

```
PÚBLICO:   POST /api/auth/**
PÚBLICO:   GET  /api/countries
PÚBLICO:   POST /api/games/start, answer, deny, confirm, reveal
PROTEGIDO: GET  /api/games/history  (vazio para visitante)
PROTEGIDO: qualquer outra rota
```

---

## 👥 Modo Visitante

Todos os endpoints de jogo aceitam requests sem autenticação JWT.

```java
// Padrão em todos os controllers de jogo
String userEmail = (authentication != null && authentication.isAuthenticated())
    ? authentication.getName()
    : "guest";
```

Comportamento para visitante:
- `GameSession.user_id = NULL`
- Jogo funciona normalmente
- Histórico retorna lista vazia (`GET /api/games/history`)
- Pontuação NÃO é persistida no perfil

---

## 🎨 Componentes Visuais Especiais

O frontend possui componentes CSS art / SVG art criados para o tema espacial:

| Componente | Tipo | Descrição |
|---|---|---|
| `Stars.css` (3 layers) | CSS puro | Estrelas animadas em 3 planos de profundidade, presentes em todas as páginas via `App.jsx` |
| `SouthAmericaHologram.jsx` | SVG + CSS | Mapa holográfico interativo da América do Sul com efeito de brilho neon |
| `Planet3D.jsx` | CSS 3D transforms | Planeta decorativo com gradientes e sombras 3D, animação de rotação |
| `GameGlobe.jsx` | CSS + SVG | Globo interativo exibido durante o jogo |

---

## 🔍 Análise de Decisões Técnicas

### 1. ✅ `CountryFeature` — Normalização vs Simplicidade

**Alternativa rejeitada:** 20+ campos booleanos em `Country` (`hasBeach`, `speaksSpanish`, etc.)

**Problema:** Adicionar nova pergunta exigiria `ALTER TABLE country ADD COLUMN`.

**Decisão:** Tabela separada `country_features (country_id, question_id, is_true)`.
- Adicionar pergunta = `INSERT INTO questions` + `INSERT INTO country_features × 13`
- Nenhuma alteração de schema (princípio Open/Closed)

---

### 2. ✅ `GameStatus` enum — Múltiplos estados

**Alternativa rejeitada:** Campos `completed (boolean)` + `won (boolean)`.

**Problema:** 2 booleanos = 4 combinações, mas 3+ estados reais. Possível estado inválido (`completed=false, won=true`).

**Decisão:** Enum com 7 estados claros e extensíveis.

---

### 3. ✅ `user_id NULL` para visitante

**Alternativa rejeitada:** Criar um User "guest" compartilhado.

**Problema:** Múltiplos visitantes simultâneos com sessões conflitantes.

**Decisão:** `user_id` nullable. Visitante tem sessão isolada sem vínculo a usuário.

---

### 4. ✅ `totalScore` e `gamesPlayed` como cache

**Aparente redundância:** poderiam ser calculados com `SUM(score)` e `COUNT(*)` sobre `game_sessions`.

**Motivo para manter:**
- Queries de ranking executam em milliseconds sem JOIN pesado
- Cached Value Pattern — troca 4 bytes de espaço por 50ms de tempo

---

### 5. ✅ `GameAttempt.is_correct` calculado no reveal

**Por que não calcular na hora da resposta?**
O sistema não conhece o país do jogador durante o jogo (é o ponto central do Akinator). O `is_correct` só pode ser calculado quando o jogador revela o país ao final — comparando each `userAnswer` com o `CountryFeature` do país revelado.

---

### 6. ✅ Stateless Backend (JWT sem sessão HTTP)

Sem `HttpSession`, sem estado no servidor. Escala horizontalmente sem sticky sessions. Token carrega identidade completa.

---

## 🚀 Infraestrutura e Deploy

### Docker Compose (Desenvolvimento Local)

```yaml
services:
  atlas_db:       # MySQL 8.0, porta 3307
  atlas_backend:  # Spring Boot, porta 5202
  atlas_frontend: # React/Vite, porta 5173
```

```bash
# Tudo de uma vez
docker-compose up --build

# Só o banco (backend e frontend rodados localmente)
docker-compose up atlas_db -d
```

### Produção

| Serviço | Plataforma | Configuração |
|---|---|---|
| Banco | Railway | Variáveis: `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` |
| Backend | Railway | Container Docker; variáveis JWT_SECRET, CORS_ORIGINS |
| Frontend | Vercel | `vercel.json` com rewrite para SPA |

### Variáveis de Ambiente Críticas (Produção)

```bash
JWT_SECRET=<chave-base64-256bit-segura>
CORS_ORIGINS=https://www.atlas4me.com,https://atlas4me.com
SWAGGER_ENABLED=false
LOG_LEVEL=INFO
```

---

## 📈 Flyway Migrations

| Versão | Arquivo | Conteúdo |
|---|---|---|
| V1 | `create_table.sql` | Criação de todas as 7 tabelas |
| V2 | `insert_initial_data.sql` | 13 países + 16 perguntas + gabarito completo |
| V3 | `Add_Lat_Lon_To_Countries.sql` | Colunas `latitude` e `longitude` |
| V4 | `Add_IsoCode_To_CountryFeatures.sql` | `iso_code` redundante nas features |

---

*Última atualização: Fevereiro 2026*
