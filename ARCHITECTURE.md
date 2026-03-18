# 🏗️ ARCHITECTURE — Atlas4Me

> Guia técnico detalhado da arquitetura, motor de inferência, modelo de dados e decisões de design do Atlas4Me — jogo interativo de dedução geográfica sustentado por um sistema de inferência baseado em Entropia de Shannon.

---

## 📑 Índice

1. [Visão Geral do Sistema](#-visão-geral-do-sistema)
2. [Stack Completo](#-stack-completo)
3. [Arquitetura Full Stack](#-arquitetura-full-stack)
4. [Pacote `service.inference`](#-pacote-serviceinference)
5. [Modelo de Dados Detalhado](#-modelo-de-dados-detalhado)
6. [Motor de Inferência: Entropia de Shannon](#-motor-de-inferência-entropia-de-shannon)
7. [Fluxo Completo da Sessão de Inferência](#-fluxo-completo-da-sessão-de-inferência)
8. [Sistema de Autenticação JWT](#-sistema-de-autenticação-jwt)
9. [Modo Visitante](#-modo-visitante)
10. [Componentes Visuais Especiais](#-componentes-visuais-especiais)
11. [Análise de Decisões Técnicas](#-análise-de-decisões-técnicas)
12. [Infraestrutura e Deploy](#-infraestrutura-e-deploy)

---

## 🎯 Visão Geral do Sistema

### Duas Dimensões do Atlas4Me

**Dimensão de Produto (experiência do usuário):**
O Atlas4Me é um jogo interativo de adivinhação de países. O usuário pensa em um dos 13 países da América do Sul e o sistema tenta identificá-lo através de perguntas binárias (SIM/NÃO). A experiência é similar a sistemas como o Akinator, mas com foco em geografia.

**Dimensão Técnica (mecanismo interno):**
O sistema opera como um **motor de inferência determinístico** baseado em **Teoria da Informação**. A cada rodada, o sistema calcula o **Ganho de Informação** de cada pergunta disponível usando a **Entropia de Shannon** e seleciona a pergunta que mais divide o espaço de hipóteses — reduzindo o conjunto de candidatos de forma ótima.

### Funcionamento Resumido

```
1. USUÁRIO   →  pensa em um país (não revela)
2. SISTEMA   →  KnowledgeBaseCache carrega matriz país×pergunta da RAM
3. SISTEMA   →  InferenceEngine calcula entropia e seleciona pergunta com maior IG
4. USUÁRIO   →  responde SIM ou NÃO
5. SISTEMA   →  InferenceEngine.filterCandidates() — interseção de HashSets em O(n)
6. SISTEMA   →  repete até |candidatos| ≤ 1 → status = GUESSING
7. USUÁRIO   →  confirma ou nega; ao final revela o país
8. SISTEMA   →  GameService calcula pontuação e registra no histórico
```

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
| JUnit 5 + Mockito | — | Testes unitários do motor de inferência |
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
│  │  LoginService • RegisterService • CountryService        │ │
│  │  GameService ← ORQUESTRADOR (ciclo da sessão)           │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │  service.inference  ← MOTOR DE INFERÊNCIA       │   │ │
│  │  │  KnowledgeBaseCache (RAM: país×pergunta)        │   │ │
│  │  │  InferenceEngine    (stateless: IG + filtro)    │   │ │
│  │  │  GameState          (record imutável)           │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
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
                          │ @PostConstruct → carrega RAM na startup
                          ▼
          ┌───────────────────────────────────────┐
          │         DATABASE (MySQL 8.0)           │
          │  Base de conhecimento: country_features │
          │  6 tabelas + 1 join table              │
          │  4 migrations Flyway versionadas       │
          └───────────────────────────────────────┘
```

---

## 🧩 Pacote `service.inference`

O ponto central da refatoração. A lógica do motor foi extraída do `GameService` para um pacote dedicado com três componentes, cada um com responsabilidade única.

```
atlas4me.service.inference/
├── GameState.java          ← Record imutável (estado da rodada)
├── KnowledgeBaseCache.java ← Cache em RAM da base de conhecimento
└── InferenceEngine.java    ← Motor stateless (funções puras)
```

### `GameState` — Record Imutável

```java
public record GameState(
        Set<Long> currentCandidates,  // IDs dos países ainda possíveis
        Set<Long> askedQuestions      // IDs das perguntas já respondidas
) {}
```

**Por que record?** Records no Java 21 garantem **imutabilidade por contrato de linguagem** — não há setters, os campos são finais. Isso torna `GameState` uma estrutura segura para passar entre threads e ideal para funções puras no `InferenceEngine`.

---

### `KnowledgeBaseCache` — Cache em RAM

Carregado uma única vez no `@PostConstruct`, transforma a tabela `country_features` do banco em **três estruturas de acesso rápido**:

```
country_features (banco)                  KnowledgeBaseCache (RAM)
────────────────────────    @PostConstruct   ────────────────────────────────────
country_id | question_id | is_true  ──────►  questionToTrueCountries:  Map<Long, Set<Long>>
                                             questionToFalseCountries: Map<Long, Set<Long>>
                                             countryQuestionMatrix:    Map<Long, Map<Long, Boolean>>
                                             questionPriorities:       Map<Long, Integer>
```

**Índices invertidos** — chave do design:

```
questionToTrueCountries.get(1L)  → {2L, 5L, 8L}   // países que falam Espanhol
questionToFalseCountries.get(1L) → {1L, 3L, ...}   // países que não falam Espanhol
```

Isso permite que o `InferenceEngine` faça **interseção de conjuntos** (`HashSet.retainAll`) em vez de consultas individuais ao mapa por país — a operação mais frequente de toda a aplicação.

**Prioridade de categoria** (pré-calculada no `@PostConstruct`):

```java
private int calculateCategoryPriority(String category) {
    return switch (category.toUpperCase()) {
        case "GEOGRAFIA" -> 50;
        case "CULTURA"   -> 40;
        case "BANDEIRA"  -> 30;
        case "POPULACAO" -> 20;
        case "ECONOMIA"  -> 10;
        default          -> 0;
    };
}
```

Usado como desempate quando duas perguntas têm idêntico Ganho de Informação — o motor prefere perguntas mais amplas (cultura/geografia) antes das específicas (economia).

---

### `InferenceEngine` — Motor Stateless

100% puro: sem estado, sem `@Autowired` além do cache. Dado o mesmo `GameState`, sempre retorna o mesmo resultado.

**`selectBestQuestion(GameState state)`** — núcleo do motor:

```
Para cada pergunta ainda não feita:
  1. Cria cópia do Set de candidatos
  2. retainAll(cache.getTrueCountries(questionId))  → O(n) interseção
  3. Calcula IG = H(state) − [p(sim)·H(sim) + p(não)·H(não)]
  4. Se IG > maxIG: novo melhor candidato
  5. Empate em IG: vence a categoria de maior prioridade
Retorna null se candidatos ≤ 1 (condição de parada)
```

**`filterCandidates(candidates, questionId, answer)`** — eliminação por resposta:

```java
// Resposta = SIM: intersecta com países que responderiam SIM
// Resposta = NÃO: intersecta com países que responderiam NÃO
Set<Long> result = new HashSet<>(candidates);
result.retainAll(answer ? cache.getTrueCountries(q) : cache.getFalseCountries(q));
return result;
```

**Por que operar em `Set<Long>` e não em `List<Country>`?**

| Operação | List\<Country\> (antes) | Set\<Long\> (depois) |
|---|---|---|
| Filtrar 1 resposta | O(n × m) lookups em mapa | O(n) retainAll de HashSet |
| Filtrar k respostas | O(k × n × m) | O(k × n) |
| Com 195 países | cresce linearmente | mantém milissegundos |
| Conversão | a cada iteração | uma vez, no passo 5 |

---

### Como `GameService` orquestra o motor

```
GameService.submitAnswer()
    │
    ├─ 1. processAttempt()           → persiste GameAttempt (banco)
    │
    ├─ 2. getRemainingCountries()    → filtragem em RAM:
    │      ├─ busca List<Country> do banco (1 query)
    │      ├─ extrai Set<Long> de IDs
    │      ├─ for attempt: inferenceEngine.filterCandidates(ids, qId, ans)
    │      ├─ remove rejectedIds
    │      └─ reconverte Set<Long> → List<Country> (1 passagem final)
    │
    ├─ 3. selectNextQuestion()       → constrói GameState + delega ao motor:
    │      ├─ new GameState(candidateIds, askedIds)
    │      ├─ inferenceEngine.selectBestQuestion(state)  → Long bestId
    │      └─ monta QuestionResponse com mapLocations
    │
    └─ 4. buildGameResponse()        → monta DTO de resposta
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
│     score              │◄─── Inicia em 100, -2 por pergunta, -10 por palpite errado
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
│ FK: question_id        │◄─── Qual atributo foi consultado
│     user_answer (BOOL) │◄─── SIM (true) ou NÃO (false)
│     is_correct  (BOOL) │◄─── Preenchido no reveal
│     attempted_at       │
└────────────────────────┘

┌────────────────────────┐          ┌─────────────────────────┐
│        Country          │  1    N  │      CountryFeature      │  N   1  ┌────────────────────────┐
├────────────────────────┤──────────├─────────────────────────┤─────────►│        Question         │
│ PK: id                 │          │ PK: id                   │          ├────────────────────────┤
│ UK: name               │          │ FK: country_id           │          │ PK: id                 │
│     iso_code           │          │ FK: question_id          │          │     text               │
│     image_url          │          │     is_true (BOOL)       │◄─ gabarito│    category            │
│     latitude           │          │     iso_code             │          │     helper_image_url   │
│     longitude          │          └─────────────────────────┘          └────────────────────────┘
└────────────────────────┘

game_session_rejected (N:N join table)
  session_id (FK) | country_id (FK) ← países descartados após palpite negado
```

### Explicação das Entidades

#### `CountryFeature` — A Base de Conhecimento
**O núcleo do sistema.** Matriz `País × Pergunta → Resposta booleana`. Esta é a base de conhecimento sobre a qual o motor de inferência opera. O `KnowledgeBaseCache` transforma essa tabela em índices invertidos na RAM na startup.

```
Brasil    + "Fala Espanhol?" = FALSE
Argentina + "Fala Espanhol?" = TRUE
Brasil    + "Tem litoral?"   = TRUE
Bolívia   + "Tem litoral?"   = FALSE
```

#### `GameSession`
Controla UMA sessão de inferência do início ao fim. `user_id` pode ser `NULL` (visitante). `target_country_id` é o país que o sistema sorteia internamente — invisível ao usuário durante o jogo.

#### `GameAttempt`
Log imutável de cada resposta do usuário. `is_correct` é calculado apenas no `reveal` — quando o usuário finalmente diz qual país pensou, permitindo verificar se todas as respostas foram consistentes.

#### `User`
Autenticação + estatísticas globais. Implementa `UserDetails` do Spring Security usando `email` como username. `totalScore` e `gamesPlayed` são campos de cache (evitam JOINs pesados no ranking).

#### `Question`
Atributos configuráveis sem mudança de código. Categorias com peso de prioridade: `GEOGRAFIA(50)`, `CULTURA(40)`, `BANDEIRA(30)`, `POPULACAO(20)`, `ECONOMIA(10)`.

---

## 🧠 Motor de Inferência: Entropia de Shannon

### Fundamento Teórico

O sistema utiliza a **Entropia de Shannon** para mensurar a incerteza sobre qual país o usuário está pensando. O objetivo é sempre selecionar a pergunta que maximiza a **redução de entropia** (máximo Ganho de Informação).

**Fórmula da Entropia (distribuição uniforme):**
```
H(S) = log₂(|S|)

Onde:
  S = conjunto atual de países candidatos
  Assume-se distribuição uniforme: p(i) = 1/|S| para todo país i
```

**Ganho de Informação de uma pergunta Q:**
```
IG(S, Q) = H(S) − [ P(sim) × H(S_sim) + P(não) × H(S_não) ]

Onde:
  S_sim = candidatos que responderiam SIM à pergunta Q
  S_não = candidatos que responderiam NÃO à pergunta Q
  P(sim) = |S_sim| / |S|
  P(não) = |S_não| / |S|
```

> A pergunta com maior `IG` divide o conjunto de candidatos de forma mais equilibrada (idealmente 50/50), convergindo para a identificação do país com o menor número possível de perguntas.

**Desempate por prioridade de categoria:**
```
Se IG(Q1) == IG(Q2):
  vence a pergunta com maior peso de categoria
  (GEOGRAFIA > CULTURA > BANDEIRA > POPULACAO > ECONOMIA)
```

### Implementação Java — `InferenceEngine`

```java
public Long selectBestQuestion(GameState state) {
    double currentEntropy = Math.log(candidates.size()) / Math.log(2);

    for (Long questionId : cache.getAllQuestionIds()) {
        if (state.askedQuestions().contains(questionId)) continue;

        // Interseção de HashSets — O(n), sem query ao banco
        Set<Long> yesGroup = new HashSet<>(candidates);
        yesGroup.retainAll(cache.getTrueCountries(questionId));

        int countYes = yesGroup.size();
        int countNo  = total - countYes;
        if (countYes == 0 || countNo == 0) continue; // IG = 0, pula

        double expectedEntropy =
            (countYes / total) * log2(countYes) +
            (countNo  / total) * log2(countNo);

        double ig       = currentEntropy - expectedEntropy;
        int    priority = cache.getQuestionPriority(questionId);

        if (ig > maxIG || (ig == maxIG && priority > bestPriority)) {
            maxIG = ig; bestPriority = priority; bestQuestionId = questionId;
        }
    }
    return bestQuestionId; // null se candidatos ≤ 1
}
```

### Filtragem dos Candidatos — `filterCandidates`

```java
public Set<Long> filterCandidates(Set<Long> candidates, Long questionId, boolean answer) {
    Set<Long> compatible = answer
            ? cache.getTrueCountries(questionId)   // SIM → índice de países true
            : cache.getFalseCountries(questionId); // NÃO → índice de países false

    Set<Long> result = new HashSet<>(candidates);
    result.retainAll(compatible); // interseção em O(n)
    return result;
}
```

### Exemplo Prático — Usuário Pensa em Brasil

```
Estado inicial: 13 países (H = log₂(13) ≈ 3.7 bits)

Pergunta 1 (maior IG): "A língua principal é o Espanhol?" → NÃO (false)
  filterCandidates(): retainAll(getFalseCountries(q1))
  Restam: Brasil, Guiana, Suriname, Guiana Francesa  (4 países, H ≈ 2.0 bits)

Pergunta 2: "O país usa o Euro como moeda?" → NÃO (false)
  Restam: Brasil, Guiana, Suriname  (3 países)

Pergunta 3: "A língua principal é o Inglês?" → NÃO (false)
  Restam: Brasil, Suriname  (2 países)

Pergunta 4: "A língua principal é o Holandês?" → NÃO (false)
  filterCandidates(): retainAll({Suriname}) → {} intersecado com {Brasil, Suriname}\{Suriname}
  Restam: Brasil  (1 país! H = 0 bits) → status = GUESSING

Sistema propõe: "Você pensou no Brasil?" → Usuário confirma → ROBOT_WON 🎉
```

---

## 🎮 Fluxo Completo da Sessão de Inferência

### Fase 1 — Iniciar Sessão

```
POST /api/games/start
Header: Authorization: Bearer <token>  (ou sem header se visitante)

GameService.startNewGame():
  1. Verifica sessão IN_PROGRESS existente → encerra a anterior
  2. Cria GameSession (score=100, attempts=0, status=IN_PROGRESS)
  3. selectNextQuestion():
     ├─ getRemainingCountries() → todos os 13 (sem tentativas ainda)
     ├─ new GameState(allIds, emptySet)
     └─ inferenceEngine.selectBestQuestion(state) → 1ª pergunta por IG máximo
  4. Retorna GameResponse com todos 13 países + primeira pergunta
```

### Fase 2 — Loop de Inferência

```
POST /api/games/answer
Body: { "gameId": 42, "questionId": 1, "answer": false }

GameService.submitAnswer():
  1. processAttempt()    → salva GameAttempt no banco
  2. getRemainingCountries():
     ├─ busca List<Country> do banco (1 query)
     ├─ extrai Set<Long> de IDs
     ├─ for each attempt: filterCandidates(ids, qId, ans)  ← RAM pura
     └─ reconverte IDs restantes → List<Country>
  3. if empty           → HUMAN_WON (contradição nas respostas)
     if size == 1       → GUESSING (convergiu!)
     else               → selectNextQuestion() + updateScore(-2)
```

### Fase 3 — Palpite (GUESSING)

```
Sistema propõe: "Você pensou no Brasil?"

Se usuário nega:
  POST /api/games/deny   →  { gameId: 42 }
  - Adiciona país em game_session_rejected
  - getRemainingCountries() sem o país rejeitado
  - Se esgotou candidatos → WAITING_FOR_REVEAL
  - Se ainda há candidatos → IN_PROGRESS + próxima pergunta

Se usuário confirma:
  POST /api/games/confirm   →  { gameId: 42 }
  - status = ROBOT_WON, score += 20
```

### Fase 4 — Reveal (WAITING_FOR_REVEAL)

```
POST /api/games/reveal
Body: { "gameId": 42, "countryId": 1 }

GameService.revealAnswer():
  Para cada GameAttempt:
    - Compara userAnswer com CountryFeature(country, question).isTrue
    - Preenche attempt.isCorrect
  - status = FINISHED_REVEALED
  - Retorna feedback com inconsistências encontradas
```

---

## 🔐 Sistema de Autenticação JWT

### Fluxo Completo

```
1. REGISTRO
   POST /api/auth/register
   ├─ Email duplicado? → DuplicateEmailException (409)
   ├─ Senha criptografada com BCrypt
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
PROTEGIDO: GET  /api/games/history
```

---

## 👥 Modo Visitante

Todos os endpoints de jogo aceitam requests sem autenticação JWT.

```java
String userEmail = (authentication != null && authentication.isAuthenticated())
    ? authentication.getName()
    : "guest";
```

Comportamento para visitante:
- `GameSession.user_id = NULL`
- Motor de inferência funciona normalmente
- Histórico retorna lista vazia (`GET /api/games/history`)
- Pontuação **não** é persistida no perfil

---

## 🎨 Componentes Visuais Especiais

| Componente | Tipo | Descrição |
|---|---|---|
| `Stars.css` (3 layers) | CSS puro | Estrelas animadas em 3 planos de profundidade, presentes em todas as páginas via `App.jsx` |
| `SouthAmericaHologram.jsx` | SVG + CSS | Mapa holográfico interativo da América do Sul com efeito de brilho neon |
| `Planet3D.jsx` | CSS 3D transforms | Planeta decorativo com gradientes e sombras 3D, animação de rotação |
| `GameGlobe.jsx` | CSS + SVG | Globo interativo exibido durante o jogo |

---

## 🔍 Análise de Decisões Técnicas

### 1. ✅ Pacote `service.inference` separado do `GameService`

**Antes:** `GameService` tinha 512 linhas com `@PostConstruct`, cache `HashMap`, cálculo de entropia e filtragem misturados à lógica de ciclo de vida da sessão.

**Depois:**
- `KnowledgeBaseCache` — responsabilidade única: cache em RAM
- `InferenceEngine` — responsabilidade única: matemática pura (testável sem Spring)
- `GameService` — responsabilidade única: orquestrador de persistência e sessão

**Benefício:** `InferenceEngine` pode ser testado com JUnit 5 + Mockito **sem subir Spring**, banco ou Flyway.

---

### 2. ✅ `Set<Long>` em vez de `List<Country>` na filtragem

**Antes:** Cada iteração de filtro percorria a lista e fazia lookup no `HashMap` por país.

**Depois:** Extrai IDs uma vez, itera com `HashSet.retainAll` (O(n)) para cada resposta, reconverte no final.

**Benefício:** Escalável para 195 países sem degradação de performance.

---

### 3. ✅ Índices invertidos no `KnowledgeBaseCache`

**Antes:** Cache `Map<countryId, Map<questionId, Boolean>>` — para filtrar por pergunta, era necessário iterar todos os países.

**Depois:** `Map<questionId, Set<countryId>>` separado para SIM e NÃO — acesso direto em O(1).

---

### 4. ✅ `putIfAbsent` no `@PostConstruct`

```java
questionPriorities.putIfAbsent(questionId, calculateCategoryPriority(category));
```

A mesma pergunta aparece N vezes em `country_features` (uma por país). O `putIfAbsent` garante que a prioridade é calculada **uma única vez** por `questionId`, evitando recálculos redundantes.

---

### 5. ✅ `CountryFeature` — Base de Conhecimento Normalizada

**Alternativa rejeitada:** 20+ campos booleanos em `Country` (`hasBeach`, `speaksSpanish`, etc.)

**Decisão:** Tabela separada `country_features (country_id, question_id, is_true)`.
- Adicionar atributo = `INSERT INTO questions` + `INSERT INTO country_features × 13`
- Nenhuma alteração de schema (princípio Open/Closed)

---

### 6. ✅ `GameStatus` enum — Múltiplos Estados

**Alternativa rejeitada:** Campos `completed (boolean)` + `won (boolean)`.

**Decisão:** Enum com 7 estados claros: `IN_PROGRESS`, `GUESSING`, `WAITING_FOR_REVEAL`, `ROBOT_WON`, `HUMAN_WON`, `GAVE_UP`, `FINISHED_REVEALED`.

---

### 7. ✅ Stateless Backend (JWT sem sessão HTTP)

Sem `HttpSession`, sem estado no servidor. Escala horizontalmente sem sticky sessions.

---

## 🧪 Testes Unitários

### `InferenceEngineTest`

Suite de 5 testes unitários cobrindo o motor de inferência com Mockito:

| Teste | O que prova |
|---|---|
| `shouldReturnNullWhenCandidatesAreOneOrZero` | Condição de parada correta (≤1 candidato) |
| `shouldSelectQuestionWithHighestInformationGainAndTieBreak` | IG máximo + desempate por categoria |
| `shouldIgnoreAskedQuestionsAndSelectNextBest` | Pergunta já feita é ignorada |
| `shouldIgnoreZeroGainQuestions` | Perguntas que não dividem o grupo são puladas |
| `shouldFilterCandidatesCorrectly` | `filterCandidates` retorna interseção correta |

```bash
# Rodar com Java 21 (requerido pelo Lombok)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
mvn "-Dtest=InferenceEngineTest" test "-Dmaven.resources.skip=true" --no-transfer-progress
```

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
| Backend | Railway | Container Docker; variáveis `JWT_SECRET`, `CORS_ORIGINS` |
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
| V1 | `V1__create_table.sql` | Criação de todas as 7 tabelas |
| V2 | `V2__insert_initial_data.sql` | 13 países + 16 perguntas + gabarito completo (`country_features`) |

---

*Última atualização: Março 2026*
