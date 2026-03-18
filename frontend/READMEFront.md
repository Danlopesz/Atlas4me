# 🌍 Atlas4Me Frontend — Interface Web

> SPA React com tema espacial que expõe a experiência do jogo de dedução geográfica ao usuário. Interface para o motor de inferência: exibe o estado do mapa holográfico via `GameGlobe`, a pergunta selecionada por entropia e o resultado de cada rodada.

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-7.x-red.svg)](https://reactrouter.com/)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Páginas e Componentes](#-páginas-e-componentes)
4. [Fluxo de Navegação](#-fluxo-de-navegação)
5. [Sistema de Autenticação](#-sistema-de-autenticação)
6. [Design e Estilos](#-design-e-estilos)
7. [Comunicação com Backend](#-comunicação-com-backend)
8. [Como Executar](#-como-executar)
9. [Build para Produção](#-build-para-produção)

---

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 7.x | Build tool + Dev Server (HMR) |
| React Router DOM | 7.x | Roteamento client-side (SPA) |
| Axios | 1.x | Cliente HTTP + interceptors |
| CSS3 Puro | — | Estilização (sem frameworks) |
| ESLint | 9 | Linting de qualidade |

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/
│   └── vite.svg                    # Favicon
├── src/
│   ├── assets/                     # CSS e estilos
│   │   ├── index.css              # Reset global + variáveis CSS + glassmorphism
│   │   ├── Stars.css              # Animação de estrelas (tema espacial)
│   │   ├── Navbar.css             # Barra de navegação
│   │   ├── Home.css               # Landing page
│   │   ├── Auth.css               # Login e Cadastro
│   │   └── Jogar.css              # Tela de jogo (layout dividido + animações)
│   │
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── Navbar.jsx             # Menu superior com autenticação reativa
│   │   ├── GameGlobe.jsx          # Mapa interativo com marcadores (prop: markers)
│   │   ├── Planet3D.jsx           # Planeta 3D animado (decorativo)
│   │   └── SouthAmericaHologram.jsx  # Mapa holográfico da América do Sul
│   │
│   ├── pages/                      # Páginas / Rotas
│   │   ├── Home.jsx               # Landing page ( / )
│   │   ├── Login.jsx              # Autenticação ( /login )
│   │   ├── Cadastro.jsx           # Registro ( /cadastro )
│   │   ├── ComoJogar.jsx          # Tutorial ( /como-jogar )
│   │   ├── Jogar.jsx              # Tela do jogo ( /jogar e /game ) ← componente principal
│   │   └── Perfil.jsx             # Perfil + histórico ( /perfil )
│   │
│   ├── services/
│   │   └── api.js                 # Instância Axios + interceptors JWT
│   │
│   ├── App.jsx                    # Roteador principal + fundo de estrelas
│   └── main.jsx                   # Entry point (ReactDOM.createRoot)
│
├── index.html                     # HTML raiz da SPA
├── vite.config.js                 # Configuração Vite
├── eslint.config.js               # Regras ESLint
├── package.json                   # Dependências e scripts
└── Dockerfile                     # Container para deploy
```

---

## 🎨 Páginas e Componentes

### 🏠 **Home.jsx** — Landing Page (`/`)

Página inicial com apresentação do jogo.

- Acesso público (sem autenticação)
- Hero section com slogan e botões CTA
- Elementos visuais com tema espacial
- Links para `/jogar` e `/como-jogar`

---

### 🔐 **Login.jsx** — Autenticação (`/login`)

Formulário de login com integração JWT.

**Fluxo:**
1. Usuário preenche email e senha
2. `POST /api/auth/login`
3. Dados salvos no `localStorage` (token, userId, firstName, email, totalScore)
4. Redirecionamento para `/jogar`

**Dados armazenados no localStorage após login:**
```js
localStorage.setItem('token', response.data.token);
localStorage.setItem('userId', response.data.userId);
localStorage.setItem('firstName', response.data.firstName);
localStorage.setItem('email', response.data.email);
localStorage.setItem('totalScore', response.data.totalScore);
```

---

### 📝 **Cadastro.jsx** — Registro (`/cadastro`)

Formulário de criação de conta com campos: `firstName`, `lastName`, `email`, `password`.

- `POST /api/auth/register`
- Sucesso → redireciona para `/login`
- Erro → exibe mensagem do backend (ex: "Email já cadastrado")

---

### ❓ **ComoJogar.jsx** — Tutorial (`/como-jogar`)

Página estática com regras, pontuação e explicação do mecanismo de dedução. Sem chamadas à API.

---

### 🎮 **Jogar.jsx** — Tela do Jogo (`/jogar` e `/game`)

Componente central da aplicação. Gerencia todo o ciclo de vida da sessão de inferência com layout dividido em dois painéis: **painel de perguntas** (esquerda) e **mapa holográfico** (direita).

**Estados React principais:**
```js
const [gameId, setGameId]                     // ID da sessão
const [gameStatus, setGameStatus]              // Estado visual (ver tabela abaixo)
const [question, setQuestion]                  // { id, questionId, text }
const [targetCountry, setTargetCountry]        // País que o robô está prestes a chutar
const [message, setMessage]                    // Mensagem exibida ao usuário
const [mapLocations, setMapLocations]          // [{isoCode, lat, lon}] → passado ao GameGlobe
const [countries, setCountries]                // Lista de países para seleção (reveal)
const [selectedCountryId, setSelectedCountryId]  // ID do país selecionado no reveal
```

**Máquina de estados (`gameStatus`):**

| Estado | Descrição | UI exibida |
|---|---|---|
| `LOBBY` | Tela inicial antes de começar | Botão "INICIAR" |
| `LOADING` | Aguardando resposta do `POST /start` | Spinner + mensagem |
| `PLAYING` | Motor fazendo perguntas | Pergunta + botões SIM/NÃO |
| `GUESSING` | Candidatos ≤ 1 — robô propõe um país | Nome do país + botões OBVIO/ERROU |
| `WAITING_FOR_REVEAL` | Sistema desistiu — usuário vai revelar | Dropdown de países + botão ENVIAR RELATÓRIO |
| `FINISHED_ROBOT` | `ROBOT_WON` — robô acertou | Mensagem de vitória do Atlas + JOGAR NOVAMENTE |
| `REPORT` | `HUMAN_WON` — relatório final gerado | Feedback completo + JOGAR NOVAMENTE |

**Handlers principais:**

| Handler | Endpoint | Descrição |
|---|---|---|
| `handleStartGame` | `POST /api/games/start` | Inicia sessão; chama `processResponse` |
| `handleAnswer(bool)` | `POST /api/games/answer` | Envia SIM/NÃO; atualiza `mapLocations` |
| `handleConfirmWin` | `POST /api/games/confirm` | Confirma palpite correto → `ROBOT_WON` |
| `handleDenyWin` | `POST /api/games/deny` | Nega palpite → sistema tenta próximo |
| `handleReveal` | `POST /api/games/reveal` | Revela país → `HUMAN_WON` / `REPORT` |
| `handlePlayAgain` | — | Reseta todos os estados, volta a `LOBBY` |

**`processResponse(data)` — função central de estado:**

Toda resposta do backend passa por `processResponse`, que mapeia o campo `data.status` para o `gameStatus` correto:

```js
const processResponse = (data) => {
    if (data.status === 'GUESSING')             → setGameStatus('GUESSING')
    else if (data.nextQuestion)                 → setGameStatus('PLAYING')
                                                  setMapLocations(data.nextQuestion.mapLocations)
    else if (data.status === 'WAITING_FOR_REVEAL'
          || data.status === 'HUMAN_WON')       → setGameStatus('WAITING_FOR_REVEAL')
    else if (data.status === 'ROBOT_WON')       → setGameStatus('FINISHED_ROBOT')
    else if (data.status === 'REPORT')          → setGameStatus('REPORT')
};
```

**`mapLocations` — marcadores no mapa:**

Quando o backend retorna `nextQuestion.mapLocations`, o frontend atualiza `mapLocations` com uma lista de objetos `{ isoCode, lat, lon }` que são passados como prop `markers` ao `GameGlobe`:

```jsx
<GameGlobe markers={mapLocations} />
```

Esse dado representa os países candidatos restantes e é atualizado a cada rodada conforme o motor de inferência elimina candidatos.

**Suporta visitante:** Rota acessível sem token JWT.

---

### 👤 **Perfil.jsx** — Perfil e Histórico (`/perfil`)

Página do usuário logado com estatísticas e histórico de sessões.

**Dados exibidos:**
- Nome do usuário
- Total de partidas
- Vitórias (status ≠ `ROBOT_WON`)
- Derrotas (status `ROBOT_WON`)
- Tabela: Data | Resultado | País Alvo | Pontos

**Chamada API:**
```js
GET /api/games/history  →  List<GameResponse>
```

---

### 🧭 **Navbar.jsx** — Navegação Global

Presente em todas as páginas. Reage dinamicamente ao estado de autenticação.

**Logado:** exibe saudação com nome, links para Jogar e Perfil, botão Sair  
**Visitante:** exibe botões Entrar e Cadastrar

**Logout:**
```js
const logout = () => {
    localStorage.clear();
    navigate('/');
};
```

---

### 🌐 Componentes Visuais Especiais

| Componente | Prop(s) | Descrição |
|---|---|---|
| `GameGlobe.jsx` | `markers: [{isoCode, lat, lon}]` | Mapa interativo que plota os países candidatos restantes com marcadores georreferenciados |
| `Planet3D.jsx` | — | Planeta decorativo 3D com animação CSS |
| `SouthAmericaHologram.jsx` | — | Mapa holográfico da América do Sul com CSS/SVG |

---

## 🔄 Fluxo de Navegação

```
/  (Home)
│
├── /login
│   └── → /jogar  (após sucesso)
│
├── /cadastro
│   └── → /login  (após sucesso)
│
├── /como-jogar
│
├── /jogar  ✅ público (visitante ou logado)
│   └── /game  (alias)
│
└── /perfil  🔒 (requer token — redireciona para /login se ausente)
```

---

## 🔐 Sistema de Autenticação

### `services/api.js` — Configuração Axios

```js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5202',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request — adiciona JWT automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de response — redireciona em 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

### Proteção de Rota (Perfil)

```js
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
}, []);
```

---

## 🎨 Design e Estilos

### Tema Espacial

O `App.jsx` renderiza globalmente três camadas de estrelas animadas via CSS:

```jsx
<div className="stars"></div>
<div className="stars2"></div>
<div className="stars3"></div>
```

Definidas em `Stars.css` — estrelas de diferentes tamanhos e velocidades de animação, criando profundidade de campo em todas as páginas.

### Sistema de Cores (CSS Custom Properties)

```css
:root {
    --neon-cyan: #00f3ff;
    --neon-purple: #b94fff;
    --dark-bg: #0a0a1a;
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
}
```

### Glassmorphism (`.glass-card`)

```css
.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### Layout Dividido (`Jogar.jsx`)

A tela de jogo usa um layout de **dois painéis** lado a lado:
- `.question-zone` (esquerda) — painel de controle com perguntas e botões
- `.map-zone` (direita) — `<GameGlobe markers={mapLocations} />` (máx. 700×800px)

### Responsividade

Layouts aplicam `flexbox` com `flex-wrap` e `@media (max-width: 768px)` para adaptar ao mobile.

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ (recomendado: 20 LTS)
- npm 9+

### Passos

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev

# Acesse: http://localhost:5173
```

> O backend deve estar rodando em `http://localhost:5202`

### Variáveis de Ambiente (opcional)

```bash
# .env.local
VITE_API_URL=http://localhost:5202
```

---

## 📦 Build para Produção

```bash
# Build otimizado (output: dist/)
npm run build

# Testar build localmente
npm run preview
# → http://localhost:4173
```

### Deploy — Vercel

O arquivo `vercel.json` está na raiz do repositório e configura redirecionamento SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 🐛 Troubleshooting Comum

### CORS Error

```
Access blocked by CORS policy: http://localhost:5202
```

Verifique `SecurityConfig.java` — adicione a origem `http://localhost:5173` à lista de `allowedOrigins`.

### 401 após login

```js
// Verifique se o token está sendo enviado:
console.log(localStorage.getItem('token'));
// E se o interceptor está ativo — verifique os headers da request no DevTools → Network
```

### Refresh em rota diferente de `/` dá 404

Configure seu servidor para redirecionar tudo ao `index.html` (comportamento de SPA). O `vercel.json` já faz isso para deploy na Vercel.

---

## 📝 Melhorias Futuras

- [ ] Migrar para **TypeScript**
- [ ] Implementar **Context API** ou **Zustand** para estado global
- [ ] Substituir `alert()` por **Toast notifications**
- [ ] Testes unitários com **Vitest + Testing Library**
- [ ] **PWA** (Progressive Web App)
- [ ] Visualização em tempo real do processo de eliminação de candidatos
- [ ] Página de **Ranking** global de jogadores
- [ ] Migrar `handleConfirmWin` e `handleDenyWin` para o endpoint unificado `/guess-feedback`

---

*Última atualização: Março 2026*
