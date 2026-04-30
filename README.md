# 🌍 Atlas4Me — Jogo Interativo de Dedução Geográfica

> Um jogo de adivinhação de países do **mundo inteiro (197 países)** sustentado por um **motor de inferência baseado em Entropia de Shannon**. O sistema identifica o país pensado pelo usuário através de perguntas binárias selecionadas dinamicamente por ganho de informação — e exibe os candidatos restantes em tempo real num **globo 3D interativo**.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Flyway](https://img.shields.io/badge/Flyway-V2-red.svg)](https://flywaydb.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é um jogo interativo de dedução geográfica com cobertura mundial completa — **197 países** distribuídos por todos os continentes. O jogador pensa em qualquer país do mundo e o sistema tenta identificá-lo através de perguntas de resposta binária (SIM/NÃO).

Internamente, o Atlas4Me não adivinha por força bruta — ele opera como um **sistema de inferência determinístico**: cada pergunta é selecionada com base na **Entropia de Shannon**, priorizando a pergunta que maximiza o ganho de informação e divide o espaço de hipóteses da forma mais eficiente possível.

A grande vitrine do projeto é o componente **`GameGlobe3D`** — um globo 3D interativo construído com **React Three Fiber** e **Three.js**, que atualiza seus marcadores em tempo real mostrando apenas os países candidatos restantes a cada resposta.

> A experiência do usuário é a de um jogo estilo Akinator de Geografia. O mecanismo por trás é inspirado em **árvores de decisão** e **teoria da informação**.

> 📄 **Trabalho de Conclusão de Curso** — PUC Minas · Sistemas de Informação · 2026/1
---

## 🧠 Como Funciona o Sistema

### Visão do Usuário

1. **Pense** em qualquer um dos 197 países — sem revelar!
2. **Sistema faz perguntas** com respostas SIM ou NÃO ("Fica na África?", "É uma ilha?", "Tem mais de 50 milhões de habitantes?")
3. **Observe o globo 3D** — os marcadores se atualizam a cada resposta, mostrando os candidatos restantes
4. **Confirme ou negue** quando o sistema propõe um palpite
5. Se o sistema desistir, **revele** o país — e veja se você o enganou

### Motor de Inferência (por dentro)

```
Estado inicial: conjunto de 197 países candidatos + 85 perguntas

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
| **197 países do mundo inteiro** (todos os continentes) | ✅ |
| **85 perguntas** estratégicas (Geografia, História, Cultura, Bandeiras, Economia, Religião, Linguagem, Política, Demografia) | ✅ |
| **Globo 3D High-End** (React Three Fiber + Three.js) com candidatos em tempo real | ✅ |
| `validIsoCodes` retornado pelo backend por pergunta | ✅ |
| Autenticação JWT (Login / Cadastro) | ✅ |
| Modo Visitante (jogar sem conta) | ✅ |
| Perguntas bilíngues (PT / EN) | ✅ |
| Perfil do jogador com histórico de partidas | ✅ |
| Tema espacial com estrelas animadas | ✅ |
| Design responsivo (desktop e mobile) | ✅ |
| Backend stateless — escala horizontalmente | ✅ |
| Flyway Migrations versionadas (V1–V2) | ✅ |

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
│           ├── V1__create_schema.sql         # 7 tabelas (inclui subcontinent, capital, feature_key)
│           └── V2__insert_initial_data.sql   # 197 países + 85 perguntas + country_features completo
│
├── frontend/                     # SPA — React 19 + TypeScript + React Three Fiber
│   ├── src/
│   │   ├── pages/                # home/, jogar/, auth/ (.tsx)
│   │   ├── components/
│   │   │   ├── globe/            # GameGlobe3D (Modular R3F)
│   │   │   │   ├── Earth.tsx         # Esfera principal com texturas 4K
│   │   │   │   ├── Atmosphere.tsx    # Shader de atmosfera
│   │   │   │   ├── CountriesLayer.tsx
│   │   │   │   ├── CountryLabels.tsx # Rótulos HTML (CSS2D) com oclusão
│   │   │   │   ├── GlobeCamera.tsx   # Câmera com interpolação Quaternion (slerp)
│   │   │   │   ├── GlobeControls.tsx
│   │   │   │   ├── GlobeLoader.tsx
│   │   │   │   ├── Stars.tsx
│   │   │   │   └── index.ts
│   │   │   └── navbar/           # Navbar.tsx
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

**Frontend:** React 19 · TypeScript 6 · Vite 7 · React Three Fiber 9 · Three.js r182 · React Router DOM 7 · Axios · CSS3 Puro

---

## 🚀 Como Executar

### Pré-requisitos

- **Java 21+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker + Docker Compose** (para banco de dados local)
- **Maven 3.8+** (incluído no wrapper `./mvnw`)

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/Danlopesz/Atlas4me.git
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
# Disponível em: http://localhost:8080
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
GET  /api/countries      →  Listar todos os 197 países (base de conhecimento)
```

> A resposta de `/api/games/answer` inclui o campo `nextQuestion.validIsoCodes` — array de ISO codes dos países que ainda são candidatos válidos, consumido pelo `GameGlobe3D` para atualizar os marcadores no globo em tempo real.

---

## 📊 Modelo de Dados (Visão Geral)

| Tabela | Função | Registros |
|---|---|---|
| `users` | Jogadores cadastrados | — |
| `countries` | Base de países (name_en, name_pt, continent, subcontinent, capital, lat/lon) | **197** |
| `questions` | Atributos usados na inferência (feature_key, question_pt, question_en, category) | **85** |
| `country_features` | Base de conhecimento: País × Pergunta × Resposta | 197 × 85 |
| `game_sessions` | Sessões de inferência individuais (@Version) | — |
| `game_attempts` | Log de cada resposta durante a sessão | — |
| `game_session_rejected` | Países descartados após palpite negado | — |

### Categorias de Perguntas

| Categoria | Exemplos |
|---|---|
| GEOGRAFIA | Continente, hemisfério, litoral, fronteiras, área |
| DEMOGRAFIA | Population over 200M, densidade, população abaixo de 1M |
| ECONOMIA | PIB top 10, produtor de petróleo, renda alta, moeda |
| POLITICA | G7, G20, BRICS, UE, OCDE, monarquia, armas nucleares |
| LINGUAGEM | Inglês, Árabe, Francês, Espanhol, Português, alfabeto não-Latino |
| RELIGIÃO | Islã, Cristianismo, Budismo, Hinduísmo |
| HISTORIA | Império Britânico, colonização ibérica, ex-União Soviética, Copa do Mundo |
| BANDEIRA | Cores, estrelas, emblema, tricolor |
| CULTURA | Trânsito pela esquerda |

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

### Variáveis de Ambiente (Produção)

```bash
JWT_SECRET=<chave-base64-256bit-segura>
CORS_ORIGINS=https://www.atlas4me.com,https://atlas4me.com
SWAGGER_ENABLED=false
LOG_LEVEL=INFO
```

---

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Arquitetura detalhada, motor de inferência, modelo de dados, decisões técnicas |

---

## 🌱 Roadmap

### Versão Atual ✅

- [x] Motor de inferência por Entropia de Shannon (100% determinístico em RAM)
- [x] **197 países do mundo inteiro**, 85 perguntas estratégicas em PT e EN
- [x] **Frontend 100% TypeScript 6** (Tipagem Estrita)
- [x] **Globo 3D High-End** com React Three Fiber, shaders customizados e texturas 4K
- [x] `validIsoCodes` retornado pelo backend a cada pergunta
- [x] Autenticação JWT + modo visitante
- [x] Flyway Migrations V1–V2
- [x] Ciclo completo: start → answer → deny/confirm → reveal
- [x] Perfil com histórico de partidas
- [x] Deploy Railway + Vercel
- [x] Testes unitários do motor de inferência (JUnit 5 + Mockito)

### Próximas Versões 🔄

- [ ] **Ranking global** de jogadores
- [ ] Substituir `alert()` por **toast notifications**
- [ ] Testes de integração (Vitest)
- [ ] **PWA** (Progressive Web App)
- [ ] Animação de eliminação de candidatos com Shaders customizados

---

## 🐛 Problemas Conhecidos

- [ ] Menu mobile: sem hambúrguer (layout simplificado)
- [ ] Histórico de datas na página Perfil exibe "Recente" (sem timestamp formatado)
- [ ] Sem suporte a múltiplas sessões simultâneas por usuário logado

---

## 🧪 Testes

```bash
# Rodar testes unitários do motor de inferência (Java 21 requerido)
cd backend
mvn "-Dtest=InferenceEngineTest" test "-Dmaven.resources.skip=true" --no-transfer-progress
```

Os testes cobrem: condição de parada, seleção por IG máximo, desempate por categoria, perguntas já respondidas, perguntas com IG zero e filtragem de candidatos.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Daniel Lopes** — Desenvolvimento Full Stack
---

*Última atualização: Abril 2026*
