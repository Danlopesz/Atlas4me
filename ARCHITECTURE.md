# 📖 ARCHITECTURE - Atlas4Me

> Guia detalhado de arquitetura, funcionamento e decisões técnicas do projeto Atlas4Me - Um jogo educativo de adivinhação de países estilo Akinator.

---

## 📑 Índice

1. [Visão Geral do Sistema](#-visão-geral-do-sistema)
2. [Arquitetura Completa](#-arquitetura-completa)
3. [Modelo de Dados Detalhado](#-modelo-de-dados-detalhado)
4. [Fluxo Completo do Jogo](#-fluxo-completo-do-jogo)
5. [Algoritmo de Filtragem](#-algoritmo-de-filtragem)
6. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
7. [Análise de Redundâncias](#-análise-de-redundâncias)
8. [Decisões Técnicas](#-decisões-técnicas)
9. [Melhorias Futuras](#-melhorias-futuras)

---

## 🎯 Visão Geral do Sistema

### O Problema que Resolve

Educação geográfica de forma **gamificada** e **interativa**, transformando o aprendizado sobre países da América do Sul em uma experiência divertida similar ao famoso jogo Akinator.

### Funcionamento Básico

```
1. JOGADOR pensa em um país da América do Sul (sem revelar ao sistema)
2. SISTEMA faz perguntas sobre características do país
   • "O país fala Espanhol?" → Jogador responde SIM ou NÃO
   • "O país tem litoral?" → Jogador responde SIM ou NÃO
3. Sistema ELIMINA países que não correspondem às respostas
4. Sistema continua perguntando até restar poucos países
5. Sistema TENTA ADIVINHAR: "Você pensou no Brasil?"
6. Jogador confirma ou nega, sistema calcula pontuação
```

### Diferencial

- ✅ Algoritmo inteligente de eliminação progressiva
- ✅ Sistema que "aprende" e adivinha como o Akinator
- ✅ Base de conhecimento extensível (16 perguntas × 13 países)
- ✅ Feedback educativo ao final (mostra as características do país)
- ✅ Ranking global de jogadores vs sistema
- ✅ Jogador pode vencer o sistema escolhendo países difíceis

---

## 🏗️ Arquitetura Completa

### Stack Full Stack

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 19 + Vite + React Router + Axios                     │
│  Port: 5173 (dev) | Deployment: Vercel/Netlify              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTP REST API
                     │ JWT Bearer Token
                     │ JSON Payloads
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                        BACKEND                               │
│  Spring Boot 3.2 + Spring Security + JWT                    │
│  Port: 5202 | Deployment: AWS/Railway/Render                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controller Layer                                      │ │
│  │  • AuthController   • GameController                   │ │
│  │  • CountryController                                   │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │  Service Layer (Business Logic)                        │ │
│  │  • LoginService         • RegisterService              │ │
│  │  • GameService          • CountryService               │ │
│  │  • CustomUserDetailsService                            │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │  Repository Layer (Data Access)                        │ │
│  │  Spring Data JPA Repositories                          │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │  Security Layer                                        │ │
│  │  • JwtAuthenticationFilter                             │ │
│  │  • JwtTokenProvider                                    │ │
│  │  • SecurityConfig                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ JDBC
                     │ Flyway Migrations
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                     MySQL (prod)                             │
│  • Flyway versionamento automático                           │
│  • 6 tabelas principais + 1 join table                       │
└──────────────────────────────────────────────────────────────┘
```

### Comunicação Entre Camadas

```
Frontend → Backend:
  POST /api/auth/login
  Body: { "email": "user@email.com", "password": "123456" }
  ↓
  AuthController.login(LoginRequest)
  ↓
  LoginService.authenticate(email, password)
  ↓
  UserRepository.findByEmail(email)
  ↓
  Database SELECT
  ↓
  JwtTokenProvider.generateToken(user)
  ↓
  Response: { "token": "eyJhbG...", "userId": 1, ... }
  ↓
Frontend armazena token e usa em requests subsequentes
```

---

## 📊 Modelo de Dados Detalhado

### Diagrama Completo com Cardinalidades

```
                         ┌─────────────────────┐
                         │       User          │
                         │  (Jogador/Admin)    │
                         ├─────────────────────┤
                         │ PK: id              │
                         │ UK: email           │
                         │     firstName       │
                         │     lastName        │
                         │     password (hash) │
                         │     totalScore      │◄─── Soma de todos os jogos
                         │     gamesPlayed     │◄─── COUNT(sessions finalizadas)
                         │     role (enum)     │◄─── USER | ADMIN
                         │     active          │◄─── Soft delete
                         │     createdAt       │
                         │     updatedAt       │
                         └──────────┬──────────┘
                                    │ 1
                                    │
                                    │ N (um usuário tem muitas sessões)
                         ┌──────────▼──────────┐
                         │   GameSession       │
                         │  (Partida única)    │
                         ├─────────────────────┤
                         │ PK: id              │
                         │ FK: user_id         │
                         │ FK: target_country  │◄─── País secreto sorteado
                         │     status (enum)   │◄─── IN_PROGRESS|ROBOT_WON|HUMAN_WON...
                         │     score           │◄─── 100 - (erros × 10)
                         │     attempts        │◄─── Contador de tentativas
                         │     startedAt       │
                         │     finishedAt      │◄─── NULL se em andamento
                         └──────────┬──────────┘
                                    │ 1
                                    │
                                    │ N (uma sessão tem muitas tentativas)
                         ┌──────────▼──────────┐
                         │   GameAttempt       │
                         │  (Log de resposta)  │
                         ├─────────────────────┤
                         │ PK: id              │
                         │ FK: session_id      │
                         │ FK: question_id     │◄─── Qual pergunta foi feita
                         │     userAnswer      │◄─── TRUE (SIM) | FALSE (NÃO)
                         │     isCorrect       │◄─── Se ajudou ou atrapalhou
                         │     attemptedAt     │
                         └─────────────────────┘


     ┌──────────────────────┐
     │      Country         │
     │  (País do jogo)      │
     ├──────────────────────┤
     │ PK: id               │
     │ UK: name             │◄─── "Brasil", "Argentina"...
     │     isoCode          │◄─── "BR", "AR"
     │     imageUrl         │◄─── Path para bandeira
     └──────┬───────────────┘
            │ 1
            │
            │ N (um país tem muitas características)
     ┌──────▼───────────────┐         ┌──────────────────────┐
     │  CountryFeature      │         │     Question         │
     │ (Gabarito do país)   │ N     1 │ (Pergunta do jogo)   │
     ├──────────────────────┤─────────├──────────────────────┤
     │ PK: id               │         │ PK: id               │
     │ FK: country_id       │         │     text             │◄─── "Fala Espanhol?"
     │ FK: question_id      │◄────────┤     category         │◄─── GEOGRAFIA|CULTURA...
     │     isTrue           │         │     helperImageUrl   │◄─── Imagem auxiliar
     └──────────────────────┘         └──────────────────────┘
            ▲                                  ▲
            │                                  │
            │ Exemplo de dados:                │
            │ ┌────────────┬────────────┬──────┴───┐
            │ │ country_id │ question_id│  isTrue  │
            │ ├────────────┼────────────┼──────────┤
            │ │ 1 (Brasil) │ 1 (Espanhol)│  FALSE  │◄─── Brasil NÃO fala Espanhol
            │ │ 2 (Argent.)│ 1 (Espanhol)│  TRUE   │◄─── Argentina SIM fala Espanhol
            │ └────────────┴────────────┴──────────┘
            │
     ┌──────▼───────────────────┐
     │ game_session_rejected    │
     │ (Países já chutados)     │
     ├──────────────────────────┤
     │ PK: (session_id, country_id) │◄─── Chave composta
     │ FK: session_id           │
     │ FK: country_id           │
     └──────────────────────────┘
            ▲
            │ Uso: Evita que robô chute "Brasil" múltiplas vezes
```

### Explicação das Entidades

#### **User** - Jogador do Sistema
- **Propósito:** Autenticação + Estatísticas globais
- **Implementa:** `UserDetails` (Spring Security)
- **Relacionamentos:** 
  - 1:N com GameSession (histórico de partidas)
- **Validações:**
  - Email único
  - Senha criptografada com BCrypt
  - Role validada pelo enum

#### **GameSession** - Partida Individual
- **Propósito:** Controlar estado de UMA partida do início ao fim
- **Ciclo de Vida:**
  ```
  1. Criação: status = IN_PROGRESS, score = 100
     → JOGADOR pensa mentalmente em um país (não revela)
  2. Jogando: SISTEMA faz perguntas, JOGADOR responde, attempts aumenta
  3. SISTEMA tenta adivinhar: se errar, score diminui e tenta de novo
  4. Finalização: 
     → ROBOT_WON: Sistema adivinhou corretamente
     → HUMAN_WON: Jogador venceu (sistema errou muito/desistiu)
  ```
- **Regra de Negócio:** Um usuário só pode ter 1 sessão IN_PROGRESS por vez
- **Relacionamentos:**
  - N:1 com User (muitas sessões por usuário)
  - N:1 com Country (país que o JOGADOR pensou - armazenado para validação)
  - 1:N com GameAttempt (log de perguntas do SISTEMA e respostas do JOGADOR)
  - N:N com Country (rejected - países que o SISTEMA já tentou adivinhar e errou)

#### **GameAttempt** - Log de Resposta
- **Propósito:** Registrar CADA resposta do JOGADOR às perguntas do SISTEMA
- **Uso:**
  1. **Algoritmo de Filtragem:** Base para calcular países restantes
  2. **Feedback Educativo:** Mostrar características do país que o jogador pensou
  3. **Auditoria:** Histórico imutável da partida
- **Campos Importantes:**
  - `isCorrect`: Se a resposta do jogador correspondeu à característica real do país que ele pensou (calculado no final quando revelado)

#### **Country** - Entidade de País
- **Propósito:** Dados básicos do país
- **Por que é simples?**
  - Características ficam em `CountryFeature` (normalização)
  - Facilita adicionar países sem ALTER TABLE
- **Relacionamentos:**
  - 1:N com CountryFeature (características)

#### **Question** - Pergunta do Jogo
- **Propósito:** Perguntas configuráveis sobre países
- **Extensibilidade:** Adicionar pergunta = INSERT, não código
- **Categorias:**
  - GEOGRAFIA (litoral, Andes, linha do Equador)
  - CULTURA (idioma, futebol)
  - BANDEIRA (cores, símbolos)
  - ECONOMIA (moeda)
  - POPULACAO (quantidade de habitantes)

#### **CountryFeature** - Gabarito do Jogo
- **Propósito:** Matriz de conhecimento (País × Pergunta × Resposta)
- **Estrutura:**
  ```
  Brasil + "Fala Espanhol?" = FALSE
  Argentina + "Fala Espanhol?" = TRUE
  Brasil + "Tem litoral?" = TRUE
  Bolívia + "Tem litoral?" = FALSE
  ```
- **Uso no Algoritmo:**
  ```sql
  -- Usuário respondeu SIM para "Fala Espanhol?"
  SELECT DISTINCT c.* 
  FROM countries c
  JOIN country_features cf ON c.id = cf.country_id
  WHERE cf.question_id = 1 -- ID da pergunta
    AND cf.is_true = TRUE   -- Resposta do usuário
  ```

#### **game_session_rejected** - Join Table
- **Propósito:** Rastrear países que robô já tentou e errou
- **Uso:**
  ```
  1. Robô chuta "Brasil"
  2. Usuário diz "NÃO"
  3. INSERT INTO game_session_rejected (session_id=1, country_id=1)
  4. Próximo chute do robô: WHERE id NOT IN (SELECT country_id FROM rejected WHERE session_id=1)
  ```

---

## 🎮 Fluxo Completo do Jogo

### Fase 1: Iniciar Partida

```
FRONTEND                          BACKEND                         DATABASE
   │                                 │                                │
   │ POST /api/game/start            │                                │
   │ Header: Bearer <token>          │                                │
   ├────────────────────────────────►│                                │
   │                                 │ JwtAuthenticationFilter        │
   │                                 │ valida token e extrai email    │
   │                                 │                                │
   │                                 │ GameService.startNewGame()     │
   │                                 ├───────────────────────────────►│
   │                                 │ SELECT * FROM users            │
   │                                 │ WHERE email = 'user@email.com' │
   │                                 │◄───────────────────────────────┤
   │                                 │ User encontrado                │
   │                                 │                                │
   │                                 │ Verifica se tem jogo ativo:    │
   │                                 ├───────────────────────────────►│
   │                                 │ SELECT * FROM game_sessions    │
   │                                 │ WHERE user_id = 1              │
   │                                 │   AND status = 'IN_PROGRESS'   │
   │                                 │◄───────────────────────────────┤
   │                                 │ Empty (OK para criar novo)     │
   │                                 │                                │
   │                                 │ Cria GameSession:              │
   │                                 │ (target_country = NULL por ora)│
   │                                 │ JOGADOR vai pensar em um país  │
   │                                 ├───────────────────────────────►│
   │                                 │ INSERT INTO game_sessions      │
   │                                 │ (user_id, target_country_id,   │
   │                                 │  status, score, attempts, ...)  │
   │                                 │ VALUES (1, NULL, 'IN_PROGRESS',│
   │                                 │         100, 0, NOW())         │
   │                                 │◄───────────────────────────────┤
   │                                 │ GameSession criado (id=42)     │
   │                                 │                                │
   │ ◄───────────────────────────────┤                                │
   │ Response 200 OK:                │                                │
   │ {                               │                                │
   │   "gameId": 42,                 │                                │
   │   "score": 100,                 │                                │
   │   "attempts": 0,                │                                │
   │   "remainingCountries": [       │                                │
   │     "Brasil", "Argentina", ...  │ 13 países da América do Sul    │
   │   ],                            │                                │
   │   "message": "Pense em um país  │                                │
   │               da América do Sul"│                                │
   │   "completed": false            │                                │
   │ }                               │                                │
   │                                 │                                │
   │ 🧠 JOGADOR PENSA: "Brasil"      │                                │
   │    (Não revela ao sistema!)     │                                │
```

### Fase 2: Sistema Faz Pergunta e Jogador Responde (Loop Principal)

```
FRONTEND                          BACKEND                         DATABASE
   │                                 │                                │
   │ SISTEMA FAZ PERGUNTA:           │                                │
   │ "O país que você pensou         │                                │
   │  fala Espanhol?"                │                                │
   │                                 │                                │
   │ JOGADOR PENSA: "Pensei no       │                                │
   │ Brasil... Brasil não fala       │                                │
   │ Espanhol, fala Português"       │                                │
   │                                 │                                │
   │ JOGADOR RESPONDE: NÃO (false)   │                                │
   │                                 │                                │
   │ POST /api/game/answer           │                                │
   │ Body: {                         │                                │
   │   "gameId": 42,                 │                                │
   │   "questionId": 1,              │                                │
   │   "answer": false               │                                │
   │ }                               │                                │
   ├────────────────────────────────►│                                │
   │                                 │ GameService.submitAnswer()     │
   │                                 │                                │
   │                                 │ 1. Busca GameSession:          │
   │                                 ├───────────────────────────────►│
   │                                 │ SELECT * FROM game_sessions    │
   │                                 │ WHERE id = 42 AND user_id = 1  │
   │                                 │◄───────────────────────────────┤
   │                                 │ Session found                  │
   │                                 │                                │
   │                                 │ 2. Busca pergunta:             │
   │                                 ├───────────────────────────────►│
   │                                 │ SELECT * FROM questions        │
   │                                 │ WHERE id = 1                   │
   │                                 │◄───────────────────────────────┤
   │                                 │ Question: "Fala Espanhol?"     │
   │                                 │                                │
   │                                 │ 3. Registra resposta:          │
   │                                 │ (isCorrect será validado só    │
   │                                 │  no final quando jogador       │
   │                                 │  revelar qual país pensou)     │
   │                                 │                                │
   │                                 │ 4. Registra tentativa:         │
   │                                 ├───────────────────────────────►│
   │                                 │ INSERT INTO game_attempts      │
   │                                 │ (session_id, question_id,      │
   │                                 │  user_answer, is_correct, ...) │
   │                                 │ VALUES (42, 1, FALSE, NULL,...)│
   │                                 │◄───────────────────────────────┤
   │                                 │                                │
   │                                 │ 5. Atualiza sessão:            │
   │                                 │ attempts = 0 + 1 = 1           │
   │                                 ├───────────────────────────────►│
   │                                 │ UPDATE game_sessions           │
   │                                 │ SET attempts = 1               │
   │                                 │ WHERE id = 42                  │
   │                                 │◄───────────────────────────────┤
   │                                 │                                │
   │                                 │ 6. ALGORITMO DE FILTRAGEM:     │
   │                                 │ "Quais países NÃO falam        │
   │                                 │  Espanhol?" (resposta=FALSE)   │
   │                                 ├───────────────────────────────►│
   │                                 │ SELECT c.*                     │
   │                                 │ FROM countries c               │
   │                                 │ JOIN country_features cf       │
   │                                 │   ON c.id = cf.country_id      │
   │                                 │ WHERE cf.question_id = 1       │
   │                                 │   AND cf.is_true = FALSE       │
   │                                 │◄───────────────────────────────┤
   │                                 │ Result: [Brasil, Guiana,       │
   │                                 │          Suriname, G.Francesa] │
   │                                 │                                │
   │                                 │ ✅ Sistema eliminou 9 países!  │
   │                                 │ Candidatos: 13 → 4             │
   │                                 │                                │
   │ ◄───────────────────────────────┤                                │
   │ Response 200 OK:                │                                │
   │ {                               │                                │
   │   "gameId": 42,                 │                                │
   │   "score": 100,                 │                                │
   │   "attempts": 1,                │                                │
   │   "remainingCountries": [       │                                │
   │     "Brasil",                   │                                │
   │     "Guiana",                   │                                │
   │     "Suriname",                 │                                │
   │     "Guiana Francesa"           │                                │
   │   ],                            │ Filtrado de 13 para 4!         │
   │   "completed": false            │                                │
   │ }                               │                                │
```

### Fase 3: Segunda Pergunta (Filtragem Progressiva)

```
SISTEMA PERGUNTA: "O país que você pensou tem saída para o mar?"
JOGADOR PENSA: "Brasil tem sim, litoral enorme!"
JOGADOR RESPONDE: SIM (true)

Backend aplica DOIS filtros (intersecção):
  1. question_id=1 (Espanhol) AND is_true=FALSE  → [Brasil, Guiana, Suriname, G.Francesa]
  2. question_id=3 (Litoral) AND is_true=TRUE    → [Brasil, Guiana, Suriname, G.Francesa]

Intersecção: [Brasil, Guiana, Suriname, G.Francesa] (4 países)
✅ Todos os 4 restantes têm litoral, pergunta não eliminou ninguém mas validou!
```

### Fase 4: Finalização do Jogo

**Cenário A: Sistema Acerta (Sistema Vence)**
```
Resta apenas 1 país na lista após várias perguntas
Sistema: "Você pensou no Brasil?"
Jogador: "SIM!" ✅

UPDATE game_sessions
SET status = 'ROBOT_WON',
    finished_at = NOW()
WHERE id = 42;

UPDATE users
SET total_score = total_score + 70,  -- 100 - 30 (sistema errou 3 vezes antes)
    games_played = games_played + 1
WHERE id = 1;

Response:
{
  "completed": true,
  "won": false,  // Jogador perdeu, sistema venceu
  "targetCountry": { "id": 1, "name": "Brasil", "imageUrl": "..." },
  "score": 70,
  "feedback": "Eu venci! Você pensou no Brasil. Acertei em 4 tentativas."
}
```

**Cenário B: Sistema Desiste (Jogador Vence)**
```
Sistema errou 10 vezes tentando adivinhar
Sistema: "Desisto! Qual país você pensou?"
Jogador revela: "Suriname"

UPDATE game_sessions
SET status = 'HUMAN_WON',
    finished_at = NOW()
WHERE id = 42;

UPDATE users
SET total_score = total_score + 100,  -- Jogador venceu o sistema!
    games_played = games_played + 1
WHERE id = 1;

Response:
{
  "completed": true,
  "won": true,  // Jogador venceu!
  "targetCountry": { "id": 12, "name": "Suriname", "imageUrl": "..." },
  "score": 100,
  "feedback": "Você venceu! Eu não consegui adivinhar que era Suriname."
}
```

---

## 🧠 Algoritmo de Filtragem

### Pseudocódigo

```python
def filter_countries(session_id):
    # 1. Buscar todas as tentativas CORRETAS da sessão
    attempts = SELECT * FROM game_attempts 
               WHERE session_id = session_id 
                 AND is_correct = TRUE
               ORDER BY attempted_at ASC
    
    # 2. Começar com todos os países ativos
    remaining = SELECT * FROM countries WHERE active = TRUE
    
    # 3. Para cada tentativa, aplicar filtro
    for attempt in attempts:
        question_id = attempt.question_id
        user_answer = attempt.user_answer  # TRUE ou FALSE
        
        # Filtrar países que correspondem à resposta
        remaining = SELECT c.* FROM countries c
                    JOIN country_features cf ON c.id = cf.country_id
                    WHERE cf.question_id = question_id
                      AND cf.is_true = user_answer
                      AND c.id IN (remaining_ids)
    
    # 4. Retornar lista final
    return remaining
```

### Exemplo Prático

**Estado Inicial:**
```
Países: [Brasil, Argentina, Chile, Paraguai, Bolívia, 
         Peru, Equador, Colômbia, Venezuela, Uruguai,
         Guiana, Suriname, Guiana Francesa]
Total: 13 países
```

**Tentativa 1:** "Fala Espanhol?" → NÃO
```sql
SELECT c.name FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = 1  -- "Fala Espanhol?"
  AND cf.is_true = FALSE  -- Resposta: NÃO
```
**Resultado:** [Brasil, Guiana, Suriname, Guiana Francesa] (4 países)

**Tentativa 2:** "Tem litoral?" → SIM
```sql
SELECT c.name FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = 3  -- "Tem litoral?"
  AND cf.is_true = TRUE   -- Resposta: SIM
  AND c.id IN (1, 11, 12, 13)  -- IDs do filtro anterior
```
**Resultado:** [Brasil, Guiana, Suriname, Guiana Francesa] (todos têm litoral)

**Tentativa 3:** "Usa Euro como moeda?" → NÃO
```sql
SELECT c.name FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = 7  -- "Usa Euro?"
  AND cf.is_true = FALSE  -- Resposta: NÃO
  AND c.id IN (1, 11, 12, 13)
```
**Resultado:** [Brasil, Guiana, Suriname] (3 países - excluiu Guiana Francesa)

**Tentativa 4:** "Fala Inglês?" → NÃO
```sql
SELECT c.name FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = 15  -- "Fala Inglês?"
  AND cf.is_true = FALSE   -- Resposta: NÃO
  AND c.id IN (1, 11, 12)
```
**Resultado:** [Brasil, Suriname] (2 países - excluiu Guiana)

**Tentativa 5:** "Fala Holandês?" → NÃO
```sql
SELECT c.name FROM countries c
JOIN country_features cf ON c.id = cf.country_id
WHERE cf.question_id = 16  -- "Fala Holandês?"
  AND cf.is_true = FALSE   -- Resposta: NÃO
  AND c.id IN (1, 12)
```
**Resultado:** [Brasil] (1 país restante!)

**Sistema:** "É o Brasil?" → Usuário: "SIM!" → 🎉 VITÓRIA!

---

## 🔐 Sistema de Autenticação JWT

### Fluxo Completo

```
1. REGISTRO
   ├─ POST /api/auth/register
   ├─ Backend cria User com senha BCrypt
   ├─ Gera JWT token
   └─ Retorna token + dados do usuário

2. LOGIN
   ├─ POST /api/auth/login
   ├─ AuthenticationManager valida credenciais
   ├─ UserDetailsService carrega User
   ├─ Gera JWT token assinado
   └─ Retorna token

3. ARMAZENAMENTO (Frontend)
   └─ localStorage.setItem('token', token)

4. REQUISIÇÕES AUTENTICADAS
   ├─ Axios Interceptor adiciona: Authorization: Bearer <token>
   ├─ JwtAuthenticationFilter extrai e valida token
   ├─ Se válido: Injeta User no SecurityContext
   └─ Controller acessa via @AuthenticationPrincipal

5. LOGOUT
   └─ localStorage.clear() + Redirect para /login
```

### Estrutura do Token JWT

```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user@email.com",
  "iat": 1702920000,
  "exp": 1703006400
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

### Validações de Segurança

1. **Assinatura:** Verifica se token não foi modificado
2. **Expiração:** Valida se ainda está dentro do prazo (24h)
3. **Subject:** Carrega usuário pelo email no payload
4. **Active:** Verifica se usuário não foi desativado

---

## ⚠️ Análise de Redundâncias

### 1. ✅ Removida: `completed` e `won` substituídos por `status`

**Antes:**
```java
private Boolean completed;
private Boolean won;
```

**Problema:**
- 2 campos para representar 3+ estados possíveis
- Possibilidade de estados inválidos (`completed=false, won=true`)

**Solução:**
```java
public enum GameStatus {
    IN_PROGRESS, ROBOT_WON, HUMAN_WON, GAVE_UP, WAITING_FOR_REVEAL
}
private GameStatus status;
```

**Benefícios:**
- Estado único e claro
- Extensível (novos status sem alterar schema)
- Type-safe

---

### 2. ✅ Justificada: `totalScore` vs `GameSession.score`

**Não é redundância:**
- `User.totalScore` = Soma acumulada de TODOS os jogos (ranking global)
- `GameSession.score` = Pontuação da partida individual

**Exemplo:**
```
Partida 1: 90 pontos
Partida 2: 70 pontos
Partida 3: 100 pontos

User.totalScore = 260
GameSession[1].score = 90
GameSession[2].score = 70
GameSession[3].score = 100
```

---

### 3. ⚡ Cache Justificado: `gamesPlayed`

**Aparenta redundância:**
```sql
-- Poderia calcular:
SELECT COUNT(*) FROM game_sessions 
WHERE user_id = 1 AND status != 'IN_PROGRESS'
```

**Por que mantemos:**
- ✅ Performance: Leaderboard sem JOIN pesado
- ✅ Cached Value Pattern
- ✅ Queries de ranking muito mais rápidas

**Trade-off:** Espaço (4 bytes) × Tempo (50ms por COUNT)

---

### 4. ✅ Necessária: `GameAttempt.isCorrect`

**Não é redundância:**

**Poderia calcular:**
```sql
SELECT cf.is_true = ga.user_answer AS is_correct
FROM game_attempts ga
JOIN country_features cf ON ...
```

**Por que armazena:**
- ✅ Histórico Imutável: Se admin corrigir `CountryFeature`, histórico não muda
- ✅ Performance: Feedback sem JOIN triplo
- ✅ Auditoria: Registra "verdade" no momento da resposta

**Exemplo de problema:**
```
1. Usuário responde errado
2. isCorrect = FALSE gravado
3. Admin descobre bug nos dados: Brasil.speaksSpanish = TRUE (erro!)
4. Admin corrige: UPDATE country_features SET is_true = FALSE
5. Histórico permanece correto (isCorrect=FALSE estava certo)
```

---

### 5. ✅ Necessária: `finishedAt`

**Não é redundância:**

**Alternativa:** Pegar timestamp do último `GameAttempt`
```sql
SELECT MAX(attempted_at) FROM game_attempts WHERE session_id = 1
```

**Por que tem campo dedicado:**
- ✅ Semântica: Jogo pode terminar SEM tentativas (desistência imediata)
- ✅ Performance: Evita MAX() em listagens
- ✅ Integridade: Campo explícito é mais claro

---

### Redundâncias que FALTAM (Otimizações Futuras)

#### ❌ Falta: Índices otimizados

```sql
-- DEVERIA TER:
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_game_sessions_user_status ON game_sessions(user_id, status);
CREATE INDEX idx_game_attempts_session ON game_attempts(session_id);
CREATE INDEX idx_country_features_lookup ON country_features(country_id, question_id, is_true);
```

#### ❌ Falta: Cache de consultas frequentes

```java
@Cacheable("activeCountries")
public List<Country> findAllActive() { ... }

@Cacheable("questions")
public List<Question> findAllQuestions() { ... }
```

---

## 🎯 Decisões Técnicas

### Por que Spring Boot?

- ✅ Ecossistema maduro e completo
- ✅ Spring Security integrado (JWT out-of-the-box)
- ✅ Spring Data JPA (reduz 80% do código JDBC)
- ✅ Embedded server (fácil deploy)
- ✅ Vasta documentação e comunidade

### Por que React?

- ✅ Component-based (reutilização)
- ✅ Virtual DOM (performance)
- ✅ Ecossistema rico (React Router, etc)
- ✅ Fácil integração com APIs REST
- ✅ Developer experience (Hot Reload)

### Por que JWT em vez de sessões?

- ✅ Stateless (backend não guarda estado)
- ✅ Escalável horizontalmente (múltiplos servidores)
- ✅ Mobile-friendly (sem cookies)
- ✅ Descentralizado (token auto-contido)

### Por que MySQL desde o desenvolvimento?

- ✅ Mesmo banco em dev e produção (paridade)
- ✅ Flyway migrations testadas no ambiente real
- ✅ DBeaver para visualização e queries
- ✅ Banco persistente (dados não se perdem ao reiniciar)
- ✅ Performance real desde o início

### Por que Flyway?

- ✅ Versionamento de database
- ✅ Migrations rastreáveis (Git)
- ✅ Rollback controlado
- ✅ Reproduzível em qualquer ambiente

### Por que Lombok?

- ✅ Reduz boilerplate em 70%
- ✅ Getters/Setters automáticos
- ✅ Builders fluentes
- ✅ Código mais legível

### Por que não TypeScript no Frontend?

- ⚠️ Decisão de trade-off:
  - ✅ Desenvolvimento mais rápido (MVP)
  - ✅ Menos configuração inicial
  - ❌ Menos type safety
  - ❌ Mais difícil refatoração

**Recomendação:** Migrar para TS em produção

---

## 🚀 Melhorias Futuras

### Backend

- [ ] **Cache Redis** para países e perguntas
- [ ] **WebSocket** para jogos multiplayer
- [ ] **GraphQL** para queries flexíveis
- [ ] **Testes** unitários e integração (JUnit, Mockito)
- [ ] **API Rate Limiting** (Spring Cloud Gateway)
- [ ] **Swagger 3.0** com autenticação JWT
- [ ] **Observabilidade** (Prometheus + Grafana)
- [ ] **Docker Compose** para desenvolvimento
- [ ] **CI/CD** (GitHub Actions)
- [ ] **Soft Delete** em todas as entidades

### Frontend

- [ ] **TypeScript** (type safety)
- [ ] **React Query** (cache de API calls)
- [ ] **Context API** (estado global)
- [ ] **Toast Notifications** (substituir `alert()`)
- [ ] **Loading States** (skeleton screens)
- [ ] **Error Boundaries** (fallback UI)
- [ ] **PWA** (offline support)
- [ ] **Dark Mode**
- [ ] **i18n** (internacionalização)
- [ ] **E2E Tests** (Playwright)

### Features de Negócio

- [ ] **Ranking Global** com paginação
- [ ] **Histórico Detalhado** de partidas
- [ ] **Conquistas/Badges** (gamificação)
- [ ] **Modo Competitivo** (versus online)
- [ ] **Dicas do Sistema** (custoam pontos)
- [ ] **Criação de Perguntas** por admins
- [ ] **Novos Continentes** (Europa, Ásia, África)
- [ ] **Análise de Estratégias** (melhores perguntas)
- [ ] **Sistema de Amizades**
- [ ] **Chat em Tempo Real**

---

## 📚 Glossário Técnico

- **JWT:** JSON Web Token - Token assinado com informações do usuário
- **BCrypt:** Algoritmo de hash para senhas com salt automático
- **ORM:** Object-Relational Mapping - Mapeamento objeto-relacional
- **DTO:** Data Transfer Object - Objeto para transferir dados entre camadas
- **Lazy Loading:** Carregamento sob demanda de relacionamentos
- **Flyway:** Ferramenta de versionamento de banco de dados
- **Lombok:** Biblioteca para reduzir boilerplate em Java
- **CORS:** Cross-Origin Resource Sharing - Controle de acesso entre origens
- **SPA:** Single Page Application - Aplicação de página única
- **HMR:** Hot Module Replacement - Atualização de código sem refresh

---

## 📞 Suporte e Contribuições

- **Issues:** [GitHub Issues](https://github.com/seu-usuario/atlas4me-react/issues)
- **Pull Requests:** Sempre bem-vindos!
- **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/atlas4me-react/discussions)

---

**Desenvolvido por DanLopes.Croix para educação geográfica**

*Última atualização: Dezembro 2025*
