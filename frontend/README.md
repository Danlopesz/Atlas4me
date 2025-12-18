# 🌍 Atlas4Me Frontend - Interface Web

> Interface React moderna e responsiva para o jogo de geografia Atlas4Me. Single Page Application (SPA) com autenticação JWT, navegação fluida e experiência gamificada.

## 🚀 Stack Tecnológica

- **React 19.2.0** - Biblioteca de interface do usuário
- **Vite 7.2.4** - Build tool ultrarrápido (HMR em <100ms)
- **React Router DOM 7.10.1** - Roteamento client-side
- **Axios 1.13.2** - Cliente HTTP com interceptors
- **CSS3 Puro** - Estilização sem frameworks (mais controle)
- **ESLint 9** - Linter para qualidade de código

## 📋 Índice

- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Páginas e Componentes](#-páginas-e-componentes)
- [Fluxo de Navegação](#-fluxo-de-navegação)
- [Sistema de Autenticação](#-sistema-de-autenticação)
- [Comunicação com Backend](#-comunicação-com-backend)
- [Estilos e Design](#-estilos-e-design)
- [Como Executar](#-como-executar)
- [Build para Produção](#-build-para-produção)

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/                     # Arquivos estáticos
│   └── vite.svg               # Favicon
├── src/
│   ├── assets/                # CSS e imagens
│   │   ├── Auth.css          # Login/Cadastro
│   │   ├── Home.css          # Página inicial
│   │   ├── Jogar.css         # Tela de jogo
│   │   ├── Navbar.css        # Barra de navegação
│   │   ├── index.css         # Reset + variáveis globais
│   │   └── img/              # Imagens (bandeiras, ícones)
│   ├── components/            # Componentes reutilizáveis
│   │   └── Navbar.jsx        # Menu de navegação
│   ├── pages/                 # Páginas/rotas
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Autenticação
│   │   ├── Cadastro.jsx      # Registro de usuário
│   │   ├── ComoJogar.jsx     # Instruções do jogo
│   │   └── Jogar.jsx         # Tela principal do jogo
│   ├── services/              # Lógica de negócio
│   │   └── api.js            # Configuração Axios + interceptors
│   ├── App.jsx                # Roteamento principal
│   └── main.jsx               # Entry point (ReactDOM.render)
├── index.html                 # HTML raiz (SPA)
├── vite.config.js             # Configuração Vite
├── eslint.config.js           # Regras de linting
├── package.json               # Dependências
└── README.md                  # Este arquivo
```

---

## 🎨 Páginas e Componentes

### 📄 **1. Home.jsx** - Landing Page

**Função:** Página inicial do site com apresentação do jogo.

**Elementos:**
- Hero section com slogan
- Descrição do conceito (Akinator geográfico)
- Botões CTA (Call-to-Action):
  - "Jogar Agora" → redireciona para `/jogar`
  - "Como Jogar" → redireciona para `/como-jogar`
- Design atrativo com animações sutis

**Estado:**
- Sem autenticação necessária (página pública)
- Detecta se usuário está logado para personalizar mensagem

**Componentes usados:**
- `<Navbar />` - Menu superior
- Conteúdo próprio da home

---

### 🔐 **2. Login.jsx** - Autenticação

**Função:** Formulário de login com integração ao backend JWT.

**Campos:**
```jsx
<input name="email" type="email" required />
<input name="password" type="password" required />
```

**Fluxo:**
1. Usuário preenche formulário
2. Submit dispara `handleSubmit()`
3. `POST /api/auth/login` com credenciais
4. Backend retorna `{ token, userId, firstName, ... }`
5. Token salvo em `localStorage.setItem('token', token)`
6. Dados do usuário salvos em `localStorage` (nome, email, score)
7. Redirecionamento para `/jogar`

**Tratamento de Erros:**
```javascript
catch (error) {
    const mensagemErro = error.response?.data?.message || 'Credenciais inválidas';
    alert(mensagemErro); // TODO: Substituir por toast/modal
}
```

**Validações:**
- Email format (HTML5 validation)
- Campos obrigatórios
- Mensagens de erro do backend

---

### 📝 **3. Cadastro.jsx** - Registro de Usuário

**Função:** Formulário de criação de conta nova.

**Campos:**
```jsx
<input name="firstName" required />
<input name="lastName" required />
<input name="email" type="email" required />
<input name="password" type="password" required />
```

**Fluxo:**
1. Validação client-side (required, email format)
2. `POST /api/auth/register` com dados do formulário
3. Backend cria usuário com senha criptografada
4. Sucesso → Alert + redirecionamento para `/login`
5. Erro → Exibe mensagem (ex: "Email já cadastrado")

**Estado:**
```javascript
const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: ''
});
```

**Controlled Components:**
```jsx
<input 
    value={formData.firstName} 
    onChange={handleChange} // Atualiza estado em tempo real
/>
```

---

### ❓ **4. ComoJogar.jsx** - Tutorial

**Função:** Página explicativa com regras e dicas do jogo.

**Conteúdo:**
- Como funciona o algoritmo de eliminação
- Sistema de pontuação (100 pontos, -10 por erro)
- Tipos de perguntas (Geografia, Cultura, Bandeira)
- Dicas de estratégia
- Exemplos visuais

**Características:**
- Página estática (sem chamadas API)
- Design didático com ícones e exemplos
- Link de retorno para Home

---

### 🎮 **5. Jogar.jsx** - Tela Principal do Jogo

**Função:** Interface de interação com o jogo (coração da aplicação).

**Estados:**
```javascript
const [gameId, setGameId] = useState(null);           // ID da sessão
const [score, setScore] = useState(100);              // Pontuação atual
const [attempts, setAttempts] = useState(0);          // Tentativas
const [remainingCountries, setRemainingCountries] = useState([]); // Países restantes
const [questions, setQuestions] = useState([]);       // Lista de perguntas
const [selectedQuestion, setSelectedQuestion] = useState(null);
const [userAnswer, setUserAnswer] = useState(null);   // SIM/NÃO
const [gameOver, setGameOver] = useState(false);
const [won, setWon] = useState(false);
const [targetCountry, setTargetCountry] = useState(null); // País revelado
```

**Fluxo do Jogo:**

**Fase 1: Inicialização**
```javascript
useEffect(() => {
    startNewGame();
}, []);

const startNewGame = async () => {
    const response = await api.post('/api/game/start');
    setGameId(response.data.gameId);
    setScore(response.data.score);
    setRemainingCountries(response.data.remainingCountries);
    loadQuestions();
};
```

**Fase 2: Jogador Responde**
```javascript
const submitAnswer = async () => {
    const response = await api.post('/api/game/answer', {
        gameId,
        questionId: selectedQuestion.id,
        answer: userAnswer // true ou false
    });
    
    setScore(response.data.score);
    setAttempts(response.data.attempts);
    setRemainingCountries(response.data.remainingCountries);
    
    if (response.data.completed) {
        setGameOver(true);
        setWon(response.data.won);
        setTargetCountry(response.data.targetCountry);
    }
};
```

**Fase 3: Fim do Jogo**
```jsx
{gameOver && (
    <div className="game-result">
        {won ? (
            <>
                <h2>🎉 Parabéns! Você venceu!</h2>
                <p>País: {targetCountry.name}</p>
                <p>Pontuação: {score} pontos</p>
            </>
        ) : (
            <>
                <h2>😢 Não foi dessa vez!</h2>
                <p>O país era: {targetCountry.name}</p>
            </>
        )}
        <button onClick={startNewGame}>Jogar Novamente</button>
    </div>
)}
```

**Componentes Visuais:**
- **Painel de Status:** Score, tentativas, países restantes
- **Seletor de Pergunta:** Dropdown ou lista
- **Botões de Resposta:** SIM / NÃO
- **Lista de Países:** Atualiza dinamicamente conforme respostas
- **Modal de Resultado:** Exibe ao final do jogo
- **Botão de Desistir:** Revela país e finaliza

**Proteção de Rota:**
```javascript
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login'); // Redireciona se não autenticado
    }
}, []);
```

---

### 🧭 **6. Navbar.jsx** - Componente de Navegação

**Função:** Menu superior presente em todas as páginas.

**Elementos:**
```jsx
<nav className="navbar">
    <div className="navbar-brand">
        <Link to="/">🌍 Atlas4Me</Link>
    </div>
    <div className="navbar-links">
        {isLoggedIn ? (
            <>
                <Link to="/jogar">Jogar</Link>
                <span>Olá, {userName}!</span>
                <button onClick={logout}>Sair</button>
            </>
        ) : (
            <>
                <Link to="/login">Entrar</Link>
                <Link to="/cadastro">Cadastrar</Link>
            </>
        )}
    </div>
</nav>
```

**Lógica de Autenticação:**
```javascript
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userName, setUserName] = useState('');

useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('firstName');
    setIsLoggedIn(!!token);
    setUserName(name || 'Usuário');
}, []);

const logout = () => {
    localStorage.clear(); // Remove token e dados
    setIsLoggedIn(false);
    navigate('/');
};
```

**Responsividade:**
- Desktop: Menu horizontal
- Mobile: Menu hambúrguer (TODO)

---

## 🔄 Fluxo de Navegação

```
┌─────────────┐
│   /         │  Landing Page (Home.jsx)
│   Home      │  • Apresentação do jogo
└──────┬──────┘  • Botões CTA
       │
       ├─────────► /login (Login.jsx)
       │           • Formulário de autenticação
       │           • POST /api/auth/login
       │           • Armazena token + dados
       │           • Redireciona para /jogar
       │
       ├─────────► /cadastro (Cadastro.jsx)
       │           • Formulário de registro
       │           • POST /api/auth/register
       │           • Redireciona para /login
       │
       ├─────────► /como-jogar (ComoJogar.jsx)
       │           • Tutorial do jogo
       │           • Página estática
       │
       └─────────► /jogar (Jogar.jsx) 🔒 Protegida
                   • Verifica token
                   • Se não autenticado → /login
                   • POST /api/game/start
                   • POST /api/game/answer (loop)
                   • GET /api/game/history
```

---

## 🔐 Sistema de Autenticação

### Configuração Axios (api.js)

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5202', // Backend Spring Boot
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Adiciona token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Trata erros globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

### Armazenamento Local

**Login bem-sucedido:**
```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('userId', response.data.userId);
localStorage.setItem('firstName', response.data.firstName);
localStorage.setItem('email', response.data.email);
localStorage.setItem('totalScore', response.data.totalScore);
```

**Uso em componentes:**
```javascript
const token = localStorage.getItem('token');
const isLoggedIn = !!token; // Converte para boolean
```

**Logout:**
```javascript
localStorage.clear(); // Remove todos os dados
// OU
localStorage.removeItem('token');
localStorage.removeItem('userId');
// ...
```

### Proteção de Rotas

**Método 1: Verificação no useEffect**
```javascript
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
    }
}, []);
```

**Método 2: Higher-Order Component (Recomendado)**
```javascript
// components/ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

// App.jsx
<Route path="/jogar" element={
    <ProtectedRoute>
        <Jogar />
    </ProtectedRoute>
} />
```

---

## 🎨 Estilos e Design

### Sistema de Cores (index.css)

```css
:root {
    --primary-color: #2196F3;      /* Azul principal */
    --secondary-color: #4CAF50;    /* Verde sucesso */
    --danger-color: #f44336;       /* Vermelho erro */
    --dark-bg: #1a1a2e;           /* Fundo escuro */
    --light-bg: #16213e;          /* Cards */
    --text-primary: #ffffff;       /* Texto principal */
    --text-secondary: #b4b4b4;     /* Texto secundário */
}
```

### Glass Morphism Effect

```css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Responsividade

```css
/* Mobile First */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
    }
    
    .game-board {
        grid-template-columns: 1fr; /* 1 coluna em mobile */
    }
}

/* Desktop */
@media (min-width: 769px) {
    .game-board {
        grid-template-columns: repeat(2, 1fr); /* 2 colunas */
    }
}
```

### Animações

```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.page-enter {
    animation: fadeIn 0.3s ease-in-out;
}
```

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js 18+** (Recomendado: 20 LTS)
- **npm 9+** ou **yarn 1.22+**

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/atlas4me-react.git
cd atlas4me-react/frontend

# 2. Instale as dependências
npm install
# ou
yarn install

# 3. Configure variáveis de ambiente (opcional)
# Crie .env.local
echo "VITE_API_URL=http://localhost:5202" > .env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

### Acessar

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5202 (deve estar rodando)

### Hot Module Replacement (HMR)

Vite recarrega mudanças instantaneamente sem refresh completo da página.

---

## 📦 Build para Produção

```bash
# Build otimizado
npm run build
# ou
yarn build

# Gera pasta dist/ com arquivos otimizados:
# - HTML minificado
# - CSS com prefixes automáticos
# - JS com tree-shaking e code-splitting
# - Assets com hash de cache-busting
```

### Testar Build Localmente

```bash
npm run preview
# Servidor local em http://localhost:4173
```

### Deploy

**Opções populares:**
- **Vercel:** `vercel deploy`
- **Netlify:** Drag & drop da pasta `dist/`
- **GitHub Pages:** GitHub Actions workflow
- **AWS S3 + CloudFront:** Upload manual ou CI/CD

**Variáveis de ambiente:**
```bash
# .env.production
VITE_API_URL=https://api.atlas4me.com
```

---

## 🐛 Debug e Troubleshooting

### Problema: CORS Error

**Sintoma:**
```
Access to XMLHttpRequest at 'http://localhost:5202' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solução:**
1. Verificar `SecurityConfig.java` no backend:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    configuration.setAllowedOrigins(List.of(
        "http://localhost:5173", // Adicionar porta do Vite
        "http://localhost:3000"
    ));
}
```

### Problema: Token não sendo enviado

**Sintoma:** 401 Unauthorized mesmo após login

**Debug:**
```javascript
// Verificar no console do navegador
console.log('Token:', localStorage.getItem('token'));

// Verificar se interceptor está funcionando
api.interceptors.request.use((config) => {
    console.log('Headers:', config.headers); // Deve ter Authorization
    return config;
});
```

### Problema: Navegação não funciona

**Sintoma:** Refresh em rota diferente de `/` dá 404

**Solução:** Configurar servidor para SPA
```javascript
// vite.config.js
export default {
    server: {
        historyApiFallback: true // Redireciona tudo para index.html
    }
}
```

---

## 🧪 Testes (TODO)

```bash
# Adicionar dependências
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Executar testes
npm run test
```

---

## 📝 Melhorias Futuras

- [ ] Migrar para **TypeScript** (type safety)
- [ ] Adicionar **React Query** (cache de requisições)
- [ ] Implementar **Context API** para estado global (evitar prop drilling)
- [ ] Substituir `alert()` por **Toast notifications**
- [ ] Adicionar **Loading skeletons** durante requests
- [ ] Implementar **Dark/Light mode toggle**
- [ ] Criar testes unitários com **Vitest**
- [ ] Adicionar **Storybook** para documentação de componentes
- [ ] Implementar **PWA** (Progressive Web App) com service worker
- [ ] Adicionar **Analytics** (Google Analytics ou Plausible)

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🔗 Links Úteis

- [Documentação React](https://react.dev/)
- [Documentação Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)

---

**Desenvolvido com ❤️ para aprendizado de geografia**
