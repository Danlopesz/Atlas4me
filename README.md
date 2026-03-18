# 🌍 Atlas4Me — Jogo Interativo de Dedução Geográfica

> Um jogo de adivinhação de países da América do Sul sustentado por um **motor de inferência baseado em Entropia de Shannon**. O sistema identifica o país pensado pelo usuário através de perguntas binárias selecionadas dinamicamente por ganho de informação.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é um jogo interativo de dedução geográfica focado nos **13 países da América do Sul**. O jogador pensa em um país e o sistema tenta identificá-lo através de perguntas de resposta binária (SIM/NÃO).

Internamente, o Atlas4Me não adivinha por força bruta — ele opera como um **sistema de inferência determinístico**: cada pergunta é selecionada com base no cálculo de **Entropia de Shannon**, priorizando a pergunta que maximiza o ganho de informação e divide o espaço de hipóteses da forma mais eficiente possível.

> A experiência do usuário é a de um jogo estilo Akinator. O mecanismo por trás é inspirado em **árvores de decisão** e **teoria da informação**.

---

## 🧠 Como Funciona o Sistema

### Visão do Usuário

1. **Pense** em um dos 13 países da América do Sul — sem revelar!
2. **Sistema faz perguntas** com respostas SIM ou NÃO ("Fala Espanhol?", "Tem litoral?")
3. **Responda** honestamente sobre o país que está pensando
4. **Observe** os candidatos sendo eliminados progressivamente
5. **Confirme ou negue** quando o sistema propõe um palpite
6. Se o sistema desistir, **revele** o país — e veja se você o enganou

### Motor de Inferência (por dentro)

```
Estado inicial: conjunto de 13 países candidatos + 16 perguntas

Para cada rodada:
  1. Calcular Entropia de Shannon do conjunto atual de candidatos
  2. Para cada pergunta disponível:
       - Calcular ganho de informação (IG = H(antes) − H(depois|resposta))
  3. Selecionar a pergunta com maior IG
  4. Receber resposta binária do usuário
  5. Filtrar candidatos incompatíveis com a resposta
  6. Se |candidatos| ≤ 1 → passar para fase de palpite (GUESSING)
  7. Repetir até identificação ou desistência
```

A tabela `country_features` (País × Pergunta → Booleano) é a **base de conhecimento** do sistema. O `GameService` é o **motor de inferência** que opera sobre ela.

### Sistema de Pontuação

| Evento | Pontuação |
|---|---|
| Início da partida | 100 pts |
| Cada palpite errado do sistema | −10 pts |
| Sistema adivinhou (`ROBOT_WON`) | Score acumulado conforme erros |
| Jogador venceu (`HUMAN_WON`) | 100 pts |

---

## ✨ Funcionalidades

| Feature | Status |
|---|---|
| Motor de inferência por Entropia de Shannon | ✅ |
| Seleção dinâmica de perguntas por ganho de informação | ✅ |
| 13 países da América do Sul | ✅ |
| 16 perguntas estratégicas (geo, cultura, bandeira, economia) | ✅ |
| Autenticação JWT (Login / Cadastro) | ✅ |
| Modo Visitante (jogar sem conta) | ✅ |
| Perfil do jogador com histórico de partidas | ✅ |
| Tema espacial com estrelas animadas e componentes 3D | ✅ |
| Design responsivo (desktop e mobile) | ✅ |
| Deploy Railway (backend) + Vercel (frontend) | ✅ |

---

## 🏗️ Estrutura do Repositório

```
Atlas4Me/
├── backend/              # API REST — Java 21 + Spring Boot 3.2
│   ├── config/           # JWT + Security + Swagger
│   ├── controller/       # AuthController, GameController, CountryController
│   ├── service/
│   │   ├── GameService.java          # Orquestra o ciclo da sessão
│   │   ├── LoginService.java
│   │   ├── RegisterService.java
│   │   ├── CountryService.java
│   │   ├── CustomUserDetailsService.java
│   │   └── inference/                # Submódulo do Motor de Inferência
│   │       ├── GameState.java        # Record imutável (candidatos + perguntas feitas)
│   │       ├── InferenceEngine.java  # Motor stateless: Shannon + filtro de candidatos
│   │       └── KnowledgeBaseCache.java  # Cache em memória da base de conhecimento
│   ├── entity/           # User, Country, GameSession (Optimistic Lock), GameAttempt, Question...
│   ├── repository/       # Spring Data JPA
│   ├── dto/
│   │   ├── request/      # GameAnswerRequest, GuessFeedbackRequest, RevealRequest...
│   │   └── response/     # GameResponse, QuestionResponse, AuthResponse...
│   └── exception/        # GlobalExceptionHandler
│
├── frontend/             # SPA — React 19 + Vite 7
│   ├── pages/            # Home, Login, Cadastro, ComoJogar, Jogar, Perfil
│   ├── components/       # Navbar, GameGlobe, Planet3D, SouthAmericaHologram
│   ├── services/         # api.js (Axios + interceptors JWT)
│   └── assets/           # CSS (glassmorphism, Stars, tema espacial)
│
└── docker-compose.yml    # MySQL + Backend + Frontend
```

### Tecnologias

**Backend:** Java 21 · Spring Boot 3.2 · Spring Security · JWT · Spring Data JPA · Hibernate · MySQL 8.0 · Flyway · Lombok · Springdoc OpenAPI · Maven

**Frontend:** React 19 · Vite 7 · React Router DOM 7 · Axios · CSS3 Puro

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

### 2️⃣ Suba o Banco de Dados

```bash
# Inicia apenas o MySQL (porta 3307)
docker-compose up atlas_db -d
```

Ou suba tudo com Docker:

```bash
docker-compose up --build
```

### 3️⃣ Execute o Backend

```bash
cd backend
mvn spring-boot:run

# Backend disponível em: http://localhost:5202
```

**Verificar:**
```bash
curl http://localhost:5202/api/countries
# Deve retornar JSON com os 13 países
```

**Credenciais do banco local:**
- Host: `localhost:3307` · Database: `atlas4me`
- Username: `atlas_user` · Password: `atlas_password`

### 4️⃣ Execute o Frontend

```bash
# Em outro terminal
cd frontend
npm install
npm run dev

# Frontend disponível em: http://localhost:5173
```

### 5️⃣ Acesse a Aplicação

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
POST /api/games/answer          →  Enviar resposta binária
POST /api/games/guess-feedback  →  Feedback unificado sobre palpite { gameId, correct }
POST /api/games/deny            →  Negar palpite (compat. legado → guess-feedback false)
POST /api/games/confirm         →  Confirmar palpite (compat. legado → guess-feedback true)
POST /api/games/reveal          →  Revelar país pensado (quando sistema desiste)
GET  /api/games/history         →  Histórico de partidas
```

### Países (Público)
```
GET  /api/countries      →  Listar todos os países (base de conhecimento)
```

---

## 📊 Modelo de Dados (Visão Geral)

| Tabela | Função |
|---|---|
| `users` | Jogadores cadastrados |
| `countries` | 13 países da América do Sul (com lat/lon) |
| `questions` | 16 atributos (perguntas) utilizados na inferência |
| `country_features` | Base de conhecimento: País × Pergunta × Resposta |
| `game_sessions` | Sessões de inferência individuais |
| `game_attempts` | Log de cada resposta durante a sessão |
| `game_session_rejected` | Países descartados após palpite negado |

> Detalhes completos do modelo e diagrama ER em [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 🔐 Segurança

- **Autenticação:** JWT (HS256, expiração 24h)
- **Senhas:** Criptografadas com BCrypt
- **CORS:** Configurado para frontend local e produção
- **Stateless:** Backend sem sessão HTTP — escala horizontalmente

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

### Deploy Completo

- **Backend:** Railway (via Dockerfile em `./backend`)
- **Frontend:** Vercel (via `vercel.json` na raiz)

---

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Arquitetura detalhada, motor de inferência, modelo de dados, decisões técnicas |
| [**backend/README.md**](backend/README.md) | API REST, endpoints, motor de inferência, configurações |
| [**backend/ESTRUTURA.md**](backend/ESTRUTURA.md) | Estrutura de pacotes e arquivos do backend |
| [**frontend/README.md**](frontend/README.md) | Páginas, componentes, estilos e fluxo de navegação |

---

## 🌱 Roadmap

### Versão Atual ✅

- [x] Motor de inferência por Entropia de Shannon
- [x] Autenticação JWT + modo visitante
- [x] 13 países, 16 perguntas (atributos)
- [x] Ciclo completo: start → answer → deny/confirm → reveal
- [x] Perfil com histórico de partidas
- [x] Tema espacial com estrelas + componentes 3D
- [x] Deploy Railway + Vercel

### Próximas Versões 🔄

- [ ] Migrar frontend para **TypeScript**
- [ ] **Ranking global** de jogadores
- [ ] Substituir `alert()` por **toast notifications**
- [ ] Testes unitários (Vitest + JUnit)
- [ ] **PWA** (Progressive Web App)
- [ ] Novos conjuntos de países (Europa, Ásia, África)
- [ ] Visualização do processo de eliminação em tempo real

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
