# 🌍 Atlas4Me Frontend — Interface Web

> SPA React moderna com tema espacial, autenticação JWT, jogo interativo de adivinhação geográfica e página de perfil com histórico de partidas.

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
│   │   └── Jogar.css              # Tela de jogo
│   │
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── Navbar.jsx             # Menu superior com autenticação reativa
│   │   ├── GameGlobe.jsx          # Globo 3D interativo (tela do jogo)
│   │   ├── Planet3D.jsx           # Planeta 3D animado (decorativo)
│   │   └── SouthAmericaHologram.jsx  # Mapa holográfico da América do Sul
│   │
│   ├── pages/                      # Páginas / Rotas
│   │   ├── Home.jsx               # Landing page ( / )
│   │   ├── Login.jsx              # Autenticação ( /login )
│   │   ├── Cadastro.jsx           # Registro ( /cadastro )
│   │   ├── ComoJogar.jsx          # Tutorial ( /como-jogar )
│   │   ├── Jogar.jsx              # Tela do jogo ( /jogar e /game )
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
└── vercel.json                    # Configuração de deploy Vercel
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

Página estática com regras, pontuação e dicas de estratégia. Sem chamadas à API.

---

### 🎮 **Jogar.jsx** — Tela do Jogo (`/jogar` e `/game`)

Coração da aplicação. Gerencia todo o ciclo de vida do jogo.

**Estados principais:**
```js
const [gameId, setGameId]                     // ID da sessão
const [score, setScore]                        // Pontuação atual
const [attempts, setAttempts]                  // Tentativas realizadas
const [remainingCountries, setRemainingCountries]  // Candidatos restantes
const [questions, setQuestions]                // Lista de perguntas disponíveis
const [selectedQuestion, setSelectedQuestion]  // Pergunta selecionada
const [userAnswer, setUserAnswer]              // SIM (true) | NÃO (false)
const [gameStatus, setGameStatus]              // Status atual do jogo
const [targetCountry, setTargetCountry]        // País revelado ao final
```

**Fases do jogo no frontend:**
1. **Inicialização** — `POST /api/games/start` → carrega países e perguntas
2. **Loop de perguntas** — `POST /api/games/answer` → atualiza candidatos
3. **Fase de palpite (GUESSING)** — robô propõe um país
   - `POST /api/games/deny` — jogador nega → robô tenta outro
   - `POST /api/games/confirm` — jogador confirma → `ROBOT_WON`
4. **Reveal (WAITING_FOR_REVEAL)** — robô desistiu
   - `POST /api/games/reveal` → `{ countryId }` → calcula `HUMAN_WON`

**Suporta visitante:** Rota acessível sem token JWT.

---

### 👤 **Perfil.jsx** — Perfil e Histórico (`/perfil`)

Página do usuário logado com estatísticas e histórico de partidas.

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

| Componente | Descrição |
|---|---|
| `GameGlobe.jsx` | Globo 3D interativo exibido durante o jogo |
| `Planet3D.jsx` | Planeta decorativo 3D com animação CSS |
| `SouthAmericaHologram.jsx` | Mapa holográfico da América do Sul com CSS/SVG |

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

Definidas em `Stars.css` — estrelas de diferentes tamanhos e velocidades de animação, criando profundidade de campo no fundo de toda a aplicação.

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
// vercel.json
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
// E se o interceptor está ativo verificando os headers da request no DevTools → Network
```

### Refresh em rota diferente de `/` dá 404

Configure seu servidor/reverse-proxy para redirecionar tudo ao `index.html` (comportamento de SPA). O `vercel.json` já faz isso para deploy na Vercel.

---

## 📝 Melhorias Futuras

- [ ] Migrar para **TypeScript**
- [ ] Implementar **Context API** ou **Zustand** para estado global
- [ ] Substituir `alert()` por **Toast notifications**
- [ ] Testes unitários com **Vitest + Testing Library**
- [ ] **PWA** (Progressive Web App) 
- [ ] Página de **Ranking** global de jogadores

---

*Última atualização: Fevereiro 2026*
