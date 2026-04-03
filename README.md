# 🌍 Atlas4Me — Jogo Interativo de Dedução Geográfica

> Um jogo de adivinhação de países do **mundo inteiro (atualmente apenas 36 países)** sustentado por um **motor de inferência baseado em Entropia de Shannon**. O sistema identifica o país pensado pelo usuário através de perguntas binárias selecionadas dinamicamente por ganho de informação — e exibe os candidatos restantes em tempo real num **globo 3D interativo**.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-V4-red.svg)](https://flywaydb.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é um jogo interativo de dedução geográfica com escopo de 36 países: o jogador pensa em qualquer um dos **paises: {1.Brasil, 2.Argentina, 3.Uruguai, 4.Paraguai, 5.Bolívia, 6.Chile, 7.Peru, 8.Equador, 9.Colômbia, 10.Venezuela, 11.Guiana, 12.Suriname, 13.Guiana Francesa, 14.Estados Unidos, 15.Canadá, 16.México, 17.Alemanha, 18.França, 19.Espanha, 20.Suíça, 21.Itália, 22.Reino Unido, 23.Rússia, 24.China, 25.Índia, 26.Japão, 27.Coreia do Sul, 28.Tailândia, 29.Indonésia, 30.Nova Zelândia, 31.Egito, 32.África do Sul, 33.Turquia, 34.Austrália, 35.Nigéria, 36.Arabia Saudita}** e o sistema tenta identificá-lo através de perguntas de resposta binária (SIM/NÃO).

Internamente, o Atlas4Me não adivinha por força bruta — ele opera como um **sistema de inferência determinístico**: cada pergunta é selecionada com base na **Entropia de Shannon**, priorizando a pergunta que maximiza o ganho de informação e divide o espaço de hipóteses da forma mais eficiente possível.

A grande vitrine do projeto é o componente **`GameGlobe`** — um globo 3D interativo (`react-globe.gl`) que, a cada resposta do usuário, atualiza seus marcadores mostrando em tempo real **apenas os países que ainda são candidatos possíveis**.

> A experiência do usuário é a de um jogo estilo Akinator de Geografia. O mecanismo por trás é inspirado em **árvores de decisão** e **teoria da informação**.

---

## 🧠 Como Funciona o Sistema

### Visão do Usuário

1. **Pense** em qualquer um dos 36 países — sem revelar!
2. **Sistema faz perguntas** com respostas SIM ou NÃO ("Fala Espanhol?", "É um país insular?")
3. **Observe o globo 3D** — os marcadores se atualizam a cada resposta, mostrando os candidatos restantes
4. **Confirme ou negue** quando o sistema propõe um palpite
5. Se o sistema desistir, **revele** o país — e veja se você o enganou

### Motor de Inferência (por dentro)

```
Estado inicial: conjunto de 36 países candidatos + 60 perguntas

Para cada rodada:
  1. Calcular Entropia de Shannon do conjunto atual de candidatos:
       H(S) = log₂(|S|)
  2. Para cada pergunta disponível:
       S_sim = candidatos que responderiam SIM (índice invertido em RAM)
       IG(Q) = H(S) − [p(sim)·H(S_sim) + p(não)·H(S_não)]
  3. Selecionar a pergunta com maior IG (desempate por categoria)
  4. Backend retorna: pergunta + validIsoCodes (ISOs dos candidatos restantes)
  5. Globo 3D atualiza marcadores com os validIsoCodes
  6. Receber resposta binária do usuário
  7. filterCandidates(): interseção de HashSets em O(n) — 100% em RAM
  8. Se |candidatos| ≤ 1 → status = GUESSING
  9. Repetir até identificação ou desistência
```

A tabela `country_features` (País × Pergunta → Booleano) é a **base de conhecimento** do sistema, carregada na startup pelo `KnowledgeBaseCache` e operada sem nenhuma query SQL durante o jogo.

### Sistema de Pontuação

| Evento | Pontuação |
|---|---|
| Início da partida | 100 pts |
| Cada pergunta respondida | −2 pts |
| Cada palpite errado do sistema | −10 pts |
| Sistema adivinhou (`ROBOT_WON`) | +20 pts (bônus) |
| Jogador venceu (`HUMAN_WON`) | Score acumulado conforme respostas |

---

## ✨ Funcionalidades

| Feature | Status |
|---|---|
| Motor de inferência por Entropia de Shannon | ✅ |
| Seleção dinâmica de perguntas por ganho de informação (IG) | ✅ |
| **36 países do mundo inteiro** (múltiplos continentes) | ✅ |
| **60 perguntas** estratégicas (Geografia, História, Cultura, Bandeiras, Economia) | ✅ |
| **Globo 3D interativo** (`react-globe.gl`) com candidatos em tempo real | ✅ |
| `validIsoCodes` retornado pelo backend por pergunta | ✅ |
| Autenticação JWT (Login / Cadastro) | ✅ |
| Modo Visitante (jogar sem conta) | ✅ |
| Perfil do jogador com histórico de partidas | ✅ |
| Tema espacial com estrelas animadas | ✅ |
| Design responsivo (desktop e mobile) | ✅ |
| Backend stateless — escala horizontalmente | ✅ |
| Flyway Migrations versionadas (V1–V4) | ✅ |

---

## 🏗️ Estrutura do Repositório

```
Atlas4Me/
├── backend/                      # API REST — Java 21 + Spring Boot 3.2
│   ├── src/main/java/atlas4me/
│   │   ├── config/               # JWT + Security + Swagger
│   │   ├── controller/           # AuthController, GameController, CountryController
│   │   ├── service/
│   │   │   ├── GameService.java              # Orquestra o ciclo da sessão
│   │   │   ├── LoginService.java
│   │   │   ├── RegisterService.java
│   │   │   ├── CountryService.java
│   │   │   ├── CustomUserDetailsService.java
│   │   │   └── inference/                    # Motor de Inferência
│   │   │       ├── GameState.java            # Record imutável (candidatos + perguntas feitas)
│   │   │       ├── InferenceEngine.java      # Motor stateless: Shannon + filtro de candidatos
│   │   │       └── KnowledgeBaseCache.java   # Cache RAM da base de conhecimento
│   │   ├── entity/               # User, Country, GameSession (@Version), GameAttempt, Question...
│   │   ├── repository/           # Spring Data JPA
│   │   ├── dto/
│   │   │   ├── request/          # GameAnswerRequest, GuessFeedbackRequest, RevealRequest...
│   │   │   └── response/         # GameResponse, QuestionResponse (com validIsoCodes), AuthResponse...
│   │   └── exception/            # GlobalExceptionHandler
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/
│           ├── V1__create_table.sql              # 7 tabelas
│           ├── V2__insert_initial_data.sql       # Dados iniciais
│           ├── V3__insert_world_countries.sql    # 36 países do mundo
│           └── V4__insert_more_questions.sql     # Base de 60 perguntas
│
├── frontend/                     # SPA — React 19 + TypeScript + R3F
│   ├── src/
│   │   ├── pages/                # home/, jogar/, auth/ (.tsx)
│   │   ├── components/           # Navbar.tsx, globe/ (Modular 3D)
│   │   ├── services/             # api.ts (Axios + TypeScript)
│   │   ├── utils/                # constants.ts, geoMath.ts
│   │   ├── types/                # Definições de tipos globais
│   │   └── styles/               # index.css, Stars.css, GlobalLayout.css
│   └── Dockerfile
│
└── docker-compose.yml            # MySQL + Backend + Frontend
```

### 💻 Stack Tecnológica

**Backend:** Java 21 · Spring Boot 3.2 · Spring Security · JWT (HS256) · Spring Data JPA · Hibernate · MySQL 8.0 · Flyway · Lombok · Springdoc OpenAPI · Maven

**Frontend:** React 19 · Vite 7 · React Router DOM 7 · Axios · `react-globe.gl` · CSS3 Puro

---

## 🚀 Como Executar

### Pré-requisitos

- **Java 21+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker + Docker Compose** (para banco de dados local)
- **Maven 3.8+** (incluído no wrapper `./mvnw`)

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/Danlopesz/Atlas4me-React.git
cd Atlas4me-React
```

### 2️⃣ Opção A — Docker Compose Completo (recomendado)

```bash
# Sobe banco + backend + frontend de uma vez
docker-compose up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5202 |
| MySQL | localhost:3307 |

### 2️⃣ Opção B — Execução Local (desenvolvimento)

```bash
# Sobe apenas o banco de dados
docker-compose up atlas_db -d
```

```bash
# Terminal 1 — Backend
cd backend
mvn spring-boot:run
# Disponível em: http://localhost:5202
```

```bash
# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# Disponível em: http://localhost:5173
```

**Credenciais do banco local:**
- Host: `localhost:3307` · Database: `atlas4me`
- Username: `atlas_user` · Password: `atlas_password`

### 3️⃣ Acesse a Aplicação

Abra: **http://localhost:5173**

---

## 📡 API Endpoints

### Autenticação (Público)
```
POST /api/auth/register  →  Cadastro de usuário
POST /api/auth/login     →  Login + geração de JWT
```

### Jogo (Público — suporta visitante)
```
POST /api/games/start           →  Iniciar nova sessão de inferência
POST /api/games/answer          →  Enviar resposta binária (SIM/NÃO)
POST /api/games/guess-feedback  →  Feedback unificado sobre palpite { gameId, correct }
POST /api/games/deny            →  Negar palpite (compat. legado → guess-feedback false)
POST /api/games/confirm         →  Confirmar palpite (compat. legado → guess-feedback true)
POST /api/games/reveal          →  Revelar país pensado (quando sistema desiste)
GET  /api/games/history         →  Histórico de partidas (requer autenticação)
```

### Países (Público)
```
GET  /api/countries      →  Listar todos os 36 países (base de conhecimento)
```

> A resposta de `/api/games/answer` inclui o campo `nextQuestion.validIsoCodes` — array de ISO codes dos países que ainda são candidatos válidos, consumido pelo `GameGlobe` para atualizar os marcadores no globo 3D.

---

## 📊 Modelo de Dados (Visão Geral)

| Tabela | Função | Registros |
|---|---|---|
| `users` | Jogadores cadastrados | — |
| `countries` | Base de países (com lat/lon e continent) | **36** |
| `questions` | Atributos usados na inferência | **60** |
| `country_features` | Base de conhecimento: País × Pergunta × Resposta | 36 × 60 |
| `game_sessions` | Sessões de inferência individuais (@Version) | — |
| `game_attempts` | Log de cada resposta durante a sessão | — |
| `game_session_rejected` | Países descartados após palpite negado | — |

> Detalhes completos do modelo ER e diagrama em [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🔐 Segurança

- **Autenticação:** JWT (HS256, expiração 24h)
- **Senhas:** Criptografadas com BCrypt
- **CORS:** Configurado para frontend local e produção
- **Stateless:** Backend sem sessão HTTP — escala horizontalmente
- **Optimistic Locking:** `GameSession` usa `@Version` (JPA) — requests simultâneas na mesma sessão retornam `409 Conflict`

---

## 📦 Build para Produção

### Backend (JAR)

```bash
cd backend
mvn clean package -DskipTests
java -jar target/atlas4me-backend-*.jar
```

### Frontend (dist/)

```bash
cd frontend
npm run build
npm run preview   # Testar localmente → http://localhost:4173
```

### Deploy

- **Backend:** Railway (via Dockerfile em `./backend`)
- **Frontend:** Vercel (via `vercel.json` na raiz)

---

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Arquitetura detalhada, motor de inferência, modelo de dados, decisões técnicas |
| [**backend/READMEBACk.md**](backend/READMEBACk.md) | Guia do desenvolvedor Java: fluxo GameService, endpoints, inferência, configuração |
| [**backend/ESTRUTURA.md**](backend/ESTRUTURA.md) | Estrutura de pacotes e arquivos do backend |
| [**frontend/READMEFront.md**](frontend/READMEFront.md) | Guia do desenvolvedor React: páginas, GameGlobe, estado do jogo, comunicação com API |

---

## 🌱 Roadmap

### Versão Atual ✅

- [x] Motor de inferência por Entropia de Shannon (100% determinístico em RAM)
- [x] 36 países do mundo inteiro, 60 perguntas estratégicas
- [x] **Frontend 100% TypeScript** (Tipagem Estrita)
- [x] **Globo 3D High-End** com React Three Fiber e texturas 4K
- [x] `validIsoCodes` retornado pelo backend a cada pergunta
- [x] Autenticação JWT + modo visitante
- [x] Flyway Migrations V1–V4
- [x] Ciclo completo: start → answer → deny/confirm → reveal
- [x] Perfil com histórico de partidas
- [x] Deploy Railway + Vercel

### Próximas Versões 🔄

- [ ] **Ranking global** de jogadores
- [ ] Substituir `alert()` por **toast notifications**
- [ ] Testes unitários (Vitest + JUnit)
- [ ] **PWA** (Progressive Web App)
- [ ] Animação de eliminação de candidatos com Shaders customizados

---

## 🐛 Problemas Conhecidos

- [ ] Menu mobile: sem hambúrguer (layout simplificado)
- [ ] Histórico de datas na página Perfil exibe "Recente" (sem timestamp formatado)
- [ ] Sem suporte a múltiplas sessões simultâneas por usuário logado

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Daniel Lopes** — Desenvolvimento Full Stack

---

*Última atualização: Março 2026*
