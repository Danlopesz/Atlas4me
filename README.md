# 🌍 Atlas4Me — Jogo Educativo de Geografia

> Descubra países da América do Sul através de perguntas estratégicas! Um jogo estilo Akinator focado em geografia, construído com React 19 e Spring Boot 3.2.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é uma aplicação web educativa que gamifica o aprendizado de geografia da **América do Sul**, inspirada no famoso Akinator. O jogador **pensa em um país** e o sistema tenta adivinhar através de perguntas inteligentes sobre características geográficas, culturais, econômicas e visuais.

### 🎯 Como Funciona

1. **Jogador pensa** em um dos 13 países da América do Sul — sem revelar!
2. **Sistema faz perguntas** com respostas SIM ou NÃO ("Fala Espanhol?", "Tem litoral?")
3. **Jogador responde** honestamente sobre o país que está pensando
4. **Sistema elimina** progressivamente os países que não correspondem às respostas
5. **Sistema tenta adivinhar** quando restam poucos candidatos
6. **Jogador confirma ou nega** — caso o robô desista, o jogador revela o país
7. **Sistema calcula pontuação** e registra no histórico de partidas

### ✨ Funcionalidades

| Feature | Status |
|---|---|
| Autenticação JWT (Login / Cadastro) | ✅ |
| Modo Visitante (jogan sem conta) | ✅ |
| Algoritmo inteligente de filtragem progressiva | ✅ |
| 13 países da América do Sul | ✅ |
| 16 perguntas estratégicas (geo, cultura, bandeira, economia) | ✅ |
| Sistema de pontuação (100 pts, −10 por erro do robô) | ✅ |
| Perfil do jogador com histórico de partidas | ✅ |
| Tema espacial com estrelas animadas e componentes 3D | ✅ |
| Design responsivo (desktop e mobile) | ✅ |
| Deploy Railway (backend) + Vercel (frontend) | ✅ |

---

## 🏗️ Arquitetura

```
Atlas4Me/
├── backend/         # API REST — Java 21 + Spring Boot 3.2
│   ├── config/      # JWT + Security + Swagger
│   ├── controller/  # AuthController, GameController, CountryController
│   ├── service/     # Lógica de negócio + algoritmo do jogo
│   ├── entity/      # User, Country, GameSession, GameAttempt, Question...
│   ├── repository/  # Spring Data JPA
│   ├── dto/         # Request/Response DTOs
│   └── exception/   # GlobalExceptionHandler
│
├── frontend/        # SPA — React 19 + Vite 7
│   ├── pages/       # Home, Login, Cadastro, ComoJogar, Jogar, Perfil
│   ├── components/  # Navbar, GameGlobe, Planet3D, SouthAmericaHologram
│   ├── services/    # api.js (Axios + interceptors JWT)
│   └── assets/      # CSS (glassmorphism, Stars, tema espacial)
│
└── docker-compose.yml  # MySQL + Backend + Frontend
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

## 📱 Como Jogar

1. **Cadastre-se**, faça **Login** ou jogue como **Visitante**
2. Clique em **"Jogar"**
3. **PENSE em um país** da América do Sul — **NÃO REVELE!**
4. O sistema faz perguntas — responda **SIM** ou **NÃO** honestamente
5. Observe os países candidatos serem eliminados
6. Quando o robô tiver um palpite, **confirme** ou **negue**
7. Se o robô desistir, **revele** o país que pensou
8. Veja sua pontuação e histórico no **Perfil** 🏆

### Sistema de Pontuação

| Evento | Pontuação |
|---|---|
| Início da partida | 100 pts |
| Cada erro do robô (palpite negado) | −10 pts |
| Robô adivinhou (`ROBOT_WON`) | Score acumulado conforme erros |
| Jogador venceu (`HUMAN_WON`) | 100 pts |

---

## 📊 Banco de Dados

### Schema (6 tabelas + 1 join table)

| Tabela | Função |
|---|---|
| `users` | Jogadores cadastrados |
| `countries` | 13 países da América do Sul (com lat/lon) |
| `questions` | 16 perguntas do jogo |
| `country_features` | Gabarito: País × Pergunta × Resposta |
| `game_sessions` | Partidas individuais |
| `game_attempts` | Log de cada resposta do jogador |
| `game_session_rejected` | Países que o robô tentou e errou |

### Migrations Flyway

| Versão | Descrição |
|---|---|
| V1 | Criação de todas as tabelas |
| V2 | Dados iniciais (países + perguntas + gabarito) |
| V3 | Latitude e longitude nos países |
| V4 | ISO code nas country_features |

---

## 📡 API Endpoints

### Autenticação (Público)
```
POST /api/auth/register  →  Cadastro de usuário
POST /api/auth/login     →  Login + geração de JWT
```

### Jogo (Público — suporta visitante)
```
POST /api/games/start    →  Iniciar nova partida
POST /api/games/answer   →  Responder pergunta
POST /api/games/deny     →  Negar palpite do robô
POST /api/games/confirm  →  Confirmar palpite do robô
POST /api/games/reveal   →  Revelar país pensado
GET  /api/games/history  →  Histórico de partidas
```

### Países (Público)
```
GET  /api/countries      →  Listar todos os países
```

---

## 🔐 Segurança

- **Autenticação:** JWT (HS256, expiração 24h)
- **Senhas:** Criptografadas com BCrypt
- **CORS:** Configurado para frontend local e produção
- **SQL Injection:** Protegido via JPA/Hibernate
- **Stateless:** Backend sem sessão HTTP — escala horizontalmente
- **Swagger:** Desabilitado em produção por padrão

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
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Arquitetura detalhada, modelo de dados, fluxos e decisões técnicas |
| [**backend/README.md**](backend/README.md) | API REST, endpoints, autenticação JWT, configurações |
| [**backend/ESTRUTURA.md**](backend/ESTRUTURA.md) | Estrutura de pacotes e arquivos do backend |
| [**frontend/README.md**](frontend/README.md) | Páginas, componentes, estilos e fluxo de navegação |

---

## 🌱 Roadmap

### Versão Atual ✅

- [x] Autenticação JWT + modo visitante
- [x] Algoritmo de filtragem progressiva (Akinator)
- [x] 13 países, 16 perguntas
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
- [ ] Novos continentes (Europa, Ásia, África)

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

*Última atualização: Fevereiro 2026*
