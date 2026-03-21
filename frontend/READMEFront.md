# 🌍 Atlas4Me Frontend — Interface Web

> SPA React com tema espacial que expõe a experiência do jogo de dedução geográfica ao usuário. A grande estrela é o **`GameGlobe`** — um globo 3D interativo (`react-globe.gl`) que atualiza seus marcadores em tempo real conforme o motor de inferência elimina candidatos. A interface consome o campo `validIsoCodes` retornado pelo backend a cada pergunta para manter o globo sincronizado.

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-7.x-red.svg)](https://reactrouter.com/)
[![react-globe.gl](https://img.shields.io/badge/react--globe.gl-Three.js-green.svg)](https://www.npmjs.com/package/react-globe.gl)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Páginas e Componentes](#-páginas-e-componentes)
4. [Máquina de Estados do Jogo](#-máquina-de-estados-do-jogo)
5. [GameGlobe — Globo 3D Interativo](#-gameglobe--globo-3d-interativo)
6. [Fluxo de Navegação](#-fluxo-de-navegação)
7. [Sistema de Autenticação](#-sistema-de-autenticação)
8. [Design e Estilos](#-design-e-estilos)
9. [Comunicação com Backend](#-comunicação-com-backend)
10. [Como Executar](#-como-executar)
11. [Build para Produção](#-build-para-produção)

---

## 🚀 Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19.x | Biblioteca de UI |
| Vite | 7.x | Build tool + Dev Server (HMR) |
| React Router DOM | 7.x | Roteamento client-side (SPA) |
| Axios | 1.x | Cliente HTTP + interceptors |
| `react-globe.gl` | — | **Globo 3D interativo** (Three.js/WebGL) |
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
│   │   ├── GameGlobe.jsx          # Globo 3D interativo (react-globe.gl)
│   │   └── Planet3D.jsx           # Planeta 3D animado (decorativo)
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
│   ├── utils/
│   │   └── constants.js           # COUNTRY_COORDS — mapa ISO → { lat, lng, name }
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

Página inicial com apresentação do jogo. Acesso público, sem chamadas à API.
- Hero section com slogan e botões CTA para `/jogar` e `/como-jogar`
- Elementos visuais com tema espacial (estrelas animadas, `Planet3D`)

---

### 🔐 **Login.jsx** — Autenticação (`/login`)

Formulário de login com integração JWT.

**Fluxo:**
1. `POST /api/auth/login`
2. Dados salvos no `localStorage` (`token`, `userId`, `firstName`, `email`, `totalScore`)
3. Redirecionamento para `/jogar`

---

### 📝 **Cadastro.jsx** — Registro (`/cadastro`)

Formulário com campos: `firstName`, `lastName`, `email`, `password`.
- `POST /api/auth/register` → sucesso redireciona para `/login`

---

### ❓ **ComoJogar.jsx** — Tutorial (`/como-jogar`)

Página estática com regras, pontuação e explicação do mecanismo de dedução. Sem chamadas à API.

---

### 🎮 **Jogar.jsx** — Tela do Jogo (`/jogar` e `/game`)

Componente central da aplicação. Gerencia todo o ciclo de vida da sessão de inferência com **layout dividido em dois painéis**:

- **Painel esquerdo** (`.question-zone`): pergunta atual + botões SIM/NÃO, score, mensagens de feedback
- **Painel direito** (`.map-zone`): `<GameGlobe validIsoCodes={validIsoCodes} />` — globo 3D com os candidatos restantes

---

### 👤 **Perfil.jsx** — Perfil e Histórico (`/perfil`)

Página do usuário logado com estatísticas e histórico de sessões.

**Dados exibidos:** nome, total de partidas, vitórias, derrotas, tabela Data | Resultado | País Alvo | Pontos

**Chamada API:** `GET /api/games/history → List<GameResponse>`

---

## 🎮 Máquina de Estados do Jogo

`Jogar.jsx` controla o ciclo de vida da sessão com uma máquina de estados local. O estado central é `gameStatus`, que determina qual UI exibir.

### Estados

| `gameStatus` | Descrição | UI exibida |
|---|---|---|
| `LOBBY` | Tela inicial antes de começar | Botão "INICIAR" |
| `LOADING` | Aguardando resposta do `POST /start` | Spinner + mensagem |
| `PLAYING` | Motor fazendo perguntas | Pergunta + botões SIM/NÃO + globo atualizado |
| `GUESSING` | Candidatos ≤ 1 — robô propõe um país | Nome do país + botões CONFIRMEI/ERROU |
| `WAITING_FOR_REVEAL` | Sistema desistiu — usuário vai revelar | Dropdown de países + botão ENVIAR |
| `FINISHED_ROBOT` | `ROBOT_WON` — robô acertou | Mensagem de vitória + JOGAR NOVAMENTE |
| `REPORT` | `HUMAN_WON` — relatório final | Feedback completo + JOGAR NOVAMENTE |

### Estados React Principais

```js
const [gameId, setGameId]               // ID da sessão ativa
const [gameStatus, setGameStatus]        // Estado visual (tabela acima)
const [question, setQuestion]            // { id, questionId, text }
const [validIsoCodes, setValidIsoCodes]  // ISO codes dos candidatos restantes → prop do GameGlobe
const [targetCountry, setTargetCountry]  // País que o robô está prestes a chutar
const [message, setMessage]             // Mensagem exibida ao usuário
const [countries, setCountries]         // Lista de países para seleção (reveal)
const [selectedCountryId, setSelectedCountryId] // ID selecionado no reveal
```

### `processResponse(data)` — Função Central de Estado

Toda resposta do backend passa por `processResponse`, que mapeia `data.status` para o `gameStatus` correto E atualiza o `validIsoCodes` para o globo:

```js
const processResponse = (data) => {
    if (data.status === 'GUESSING') {
        setGameStatus('GUESSING');
        setTargetCountry(data.targetCountry);

    } else if (data.nextQuestion) {
        setGameStatus('PLAYING');
        setQuestion(data.nextQuestion);
        // Atualiza os candidatos no globo 3D
        setValidIsoCodes(data.nextQuestion.validIsoCodes || []);

    } else if (data.status === 'WAITING_FOR_REVEAL' || data.status === 'HUMAN_WON') {
        setGameStatus('WAITING_FOR_REVEAL');

    } else if (data.status === 'ROBOT_WON') {
        setGameStatus('FINISHED_ROBOT');

    } else if (data.status === 'REPORT') {
        setGameStatus('REPORT');
    }
};
```

### Handlers Principais

| Handler | Endpoint | Descrição |
|---|---|---|
| `handleStartGame` | `POST /api/games/start` | Inicia sessão; recebe 1ª pergunta + `validIsoCodes` |
| `handleAnswer(bool)` | `POST /api/games/answer` | Envia SIM/NÃO; atualiza `validIsoCodes` no globo |
| `handleConfirmWin` | `POST /api/games/confirm` | Confirma palpite correto → `ROBOT_WON` |
| `handleDenyWin` | `POST /api/games/deny` | Nega palpite → sistema tenta próximo |
| `handleReveal` | `POST /api/games/reveal` | Revela país → `HUMAN_WON` / `REPORT` |
| `handlePlayAgain` | — | Reseta todos os estados, volta a `LOBBY` |

---

## 🌐 GameGlobe — Globo 3D Interativo

`GameGlobe.jsx` é o componente visual mais importante do projeto. Usa a biblioteca `react-globe.gl` (que internamente usa Three.js + WebGL) para renderizar um globo terrestre 3D com marcadores neon nos países candidatos.

### Props

```jsx
<GameGlobe validIsoCodes={validIsoCodes} />
// validIsoCodes: string[] — array de ISO codes (ex: ["BR", "AR", "CO"])
// passado direto do estado de Jogar.jsx, atualizado via processResponse()
```

### Como Funciona

```js
const GameGlobe = ({ validIsoCodes = [] }) => {
    const globeRef = useRef();

    // 1. Mapeia ISOs para coordenadas geográficas (dict local COUNTRY_COORDS)
    const globeData = validIsoCodes
        .map(iso => {
            const data = COUNTRY_COORDS[iso.toUpperCase()];
            if (!data) return null;
            return { lat: data.lat, lng: data.lng, name: data.name, size: 0.3, color: '#00f3ff' };
        })
        .filter(Boolean);

    // 2. Câmera auto-centraliza nos candidatos restantes
    useEffect(() => {
        if (globeData.length > 0 && globeRef.current) {
            globeRef.current.controls().autoRotate = false;
            const avgLat = globeData.reduce((s, d) => s + d.lat, 0) / globeData.length;
            const avgLng = globeData.reduce((s, d) => s + d.lng, 0) / globeData.length;
            const altitude = globeData.length > 5 ? 2.5 : 1.8; // zoom: mais candidatos → mais distante
            globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, alt: altitude }, 1500);
        } else if (globeRef.current) {
            globeRef.current.controls().autoRotate = true; // gira quando inativo
        }
    }, [globeData]);
};
```

### Camadas Visuais do Globo

| Camada | Prop | Valores |
|---|---|---|
| Imagem do globo | `globeImageUrl` | `earth-night.jpg` (Three-Globe CDN) |
| Relevo | `bumpImageUrl` | `earth-topology.png` |
| Atmosfera | `atmosphereColor` | `#00f3ff` (neon cyan) |
| Marcadores | `pointsData={globeData}` | Pontos neon nos candidatos |
| Labels | `labelsData={globeData}` | Nome do país flutuando |
| Anéis | `ringsData={globeData}` | Anéis pulsantes neon |

### Fluxo Backend → Globo

```
POST /api/games/answer
    │
    ▼
GameService.selectNextQuestion()
    ├─ calcula validIsoCodes (ISO dos candidatos que responderiam SIM)
    └─ inclui em QuestionResponse.validIsoCodes
    │
    ▼
Frontend: processResponse(data)
    └─ setValidIsoCodes(data.nextQuestion.validIsoCodes)
    │
    ▼
GameGlobe recebe nova prop validIsoCodes
    └─ reconstrói globeData → globo 3D atualiza marcadores
    └─ câmera reposiciona para centralizar nos candidatos restantes
```

> **Nota:** `COUNTRY_COORDS` em `utils/constants.js` é o dicionário local `{ ISO: { lat, lng, name } }` que mapeia os ISO codes para coordenadas geográficas. Não há chamada à API para isso.

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

// Interceptor de response — redireciona em 401 (token expirado)
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

Definidas em `Stars.css` — estrelas de diferentes tamanhos e velocidades, criando profundidade de campo em todas as páginas.

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

A tela de jogo usa **dois painéis lado a lado**:
- `.question-zone` (esquerda) — painel de controle com perguntas, score e botões
- `.map-zone` (direita) — `<GameGlobe validIsoCodes={validIsoCodes} />` (máx. 800×800px)

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

### Globo 3D não renderiza (`GameGlobe` vazio)

```
1. Verifique se `validIsoCodes` está chegando na prop (console.log no GameGlobe)
2. Confirme que COUNTRY_COORDS em utils/constants.js tem os ISOs correspondentes
3. Verifique se há erro de WebGL no console (GPU/driver issue)
```

### 401 após login

```js
// Verifique se o token está sendo enviado:
console.log(localStorage.getItem('token'));
// E se o interceptor está ativo — Network DevTools > Request Headers
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
- [ ] Migrar `handleConfirmWin` e `handleDenyWin` para o endpoint unificado `/guess-feedback`
- [ ] Animação de eliminação de candidatos em tempo real no globo
- [ ] Página de **Ranking** global de jogadores

---

*Última atualização: Março 2026*
