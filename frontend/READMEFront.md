# 🌍 Atlas4Me Frontend — Interface Web

> SPA React 19 High-End com tema espacial e experiência 3D imersiva. A grande estrela é o **`GameGlobe3D`** — um globo terrestre de alta fidelidade desenvolvido com **React Three Fiber (R3F)** e **Three.js**, apresentando texturas 4K, oclusão matemática nativa e sistema de câmera inteligente que sincroniza em tempo real com o motor de inferência.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r173-black.svg)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-9.x-white.svg)](https://docs.pmnd.rs/react-three-fiber)

---

## 📋 Índice

1. [Stack Tecnológica](#-stack-tecnológica)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Páginas e Componentes](#-páginas-e-componentes)
4. [Máquina de Estados do Jogo](#-máquina-de-estados-do-jogo)
5. [GameGlobe3D — Arquitetura Modular 3D](#-gameglobe3d--arquitetura-modular-3d)
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
| TypeScript | 5.x | Linguagem principal (Tipagem Estrita) |
| React | 19.x | Biblioteca de UI |
| Vite | 7.x | Build tool + Dev Server (HMR) |
| Three.js | r173 | Engine 3D (WebGL) |
| React Three Fiber | 9.x | Renderer React para Three.js |
| React Three Drei | 10.x | Helpers e abstrações para R3F |
| React Router DOM | 7.x | Roteamento client-side (SPA) |
| Axios | 1.x | Cliente HTTP + interceptors |
| CSS3 Puro | — | Estilização (Co-location) |

---

## 📁 Estrutura do Projeto (Co-location)

```
frontend/
├── public/
│   ├── textures/                   # Texturas 4K (Earth, Bump, Clouds)
│   └── hdri/                       # Mapas de iluminação ambiente
├── src/
│   ├── styles/                     # Estilos globais e utilitários
│   │   ├── index.css              # Reset + Variáveis Neon + Glassmorphism
│   │   ├── Stars.css              # Animação de fundo espacial
│   │   └── GlobalLayout.css       # Estrutura de containers sobrepostos
│   │
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── Navbar.tsx             # Menu reativo
│   │   ├── Navbar.css             # Estilo local (Co-location)
│   │   └── globe/                 # Arquitetura Modular 3D
│   │       ├── GameGlobe3D.tsx    # Orquestrador da cena R3F
│   │       ├── Earth.tsx          # Mesh do planeta + Shaders
│   │       ├── Atmosphere.tsx     # Efeito de brilho atmosférico
│   │       ├── CountriesLayer.tsx # Geometrias dos países (TopoJSON)
│   │       ├── CountryLabels.tsx  # Rótulos HTML oclusivos (LOD)
│   │       ├── GlobeCamera.tsx    # Câmera inteligente (Quaternion slerp)
│   │       └── GlobeControls.tsx  # OrbitControls customizados
│   │
│   ├── pages/                      # Rotas da aplicação
│   │   ├── home/                  # Página Inicial
│   │   │   ├── Home.tsx
│   │   │   └── Home.css
│   │   ├── jogar/                 # Core do Jogo
│   │   │   ├── Jogar.tsx
│   │   │   └── Jogar.css
│   │   └── auth/                  # Login, Cadastro e Perfil
│   │       ├── Login.tsx
│   │       ├── Cadastro.tsx
│   │       └── Perfil.tsx
│   │
│   ├── services/
│   │   └── api.ts                 # Axios Instance + Tipagem (AxiosInstance)
│   │
│   ├── types/                     # Interfaces globais e do domínio
│   │   ├── game.ts                # GameStatus, QuestionResponse
│   │   └── globe.ts               # Props do 3D e Coordenadas
│   │
│   ├── utils/
│   │   ├── constants.ts           # COUNTRY_COORDS (Interface CountryCoordData)
│   │   └── geoMath.ts             # Cálculos Lat/Lng para Vector3
│   │
│   ├── App.tsx                    # Roteador + Scene Manager
│   └── main.tsx                   # Entry point (createRoot)
```

---

## 🎨 Páginas e Componentes

### 🏠 **Home.tsx** — Landing Page (`/`)

Apresentação impactante com o novo slogan: **"PENSE EM UM PAÍS..."**.
- Integração visual com o fundo estelar.
- Limpeza de estados do globo ao montar via `onIsoReset`.

---

### 🔐 **Auth (Login/Cadastro/Perfil)**

Migrados para TypeScript com interfaces rigorosas para payloads e respostas da API.
- **Login.tsx**: Gerencia JWT e persistência de perfil.
- **Perfil.tsx**: Dashboard de estatísticas (`GameHistoryItem[]`) com cálculos de performance.

---

### 🎮 **Jogar.tsx** — Engine Visual do Jogo (`/jogar`)

Gerencia a máquina de estados reativa sincronizada com o Backend.
- **Tipagem Estrita**: Estados controlados por union types (`GameStatus`).
- **Layout Split**: Painel de interface Glassmorphism sobreposto à cena 3D.
- **ProcessResponse**: Atualiza dinamicamente os `validIsoCodes`, disparando animações no globo.

---

## 🌐 GameGlobe3D — Arquitetura Modular 3D

Diferente de implementações prontas, o **GameGlobe3D** é um sistema modular construído do zero sobre **React Three Fiber** para performance máxima.

### Características Técnicas

| Feature | Descrição |
|---|---|
| **Texturas 4K** | Mapas de Albedo e Bump de alta resolução para fidelidade visual. |
| **LOD (Level of Detail)** | Rótulos e detalhes que aparecem/somem dinamicamente conforme a distância da câmera. |
| **Oclusão Matemática** | Rótulos de países desaparecem naturalmente ao passarem para o "lado escuro" do planeta (Dot Product). |
| **Smart Camera** | Transições suaves (Fly-to) entre hemisférios usando interpolação de Quaternions. |
| **Post-processing** | Bloom seletivo e Tone Mapping (ACESFilmic) para visual cinematográfico. |

### Fluxo de Reatividade

1. O estado `validIsoCodes` muda em `Jogar.tsx`.
2. O `CountriesLayer.tsx` re-renderiza apenas as geometrias afetadas.
3. O `CountryLabels.tsx` sincroniza a visibilidade dos nomes via `useFrame` (60fps).
4. A câmera ajusta o zoom e a rotação para enquadrar os candidatos restantes.

---

## 🔐 Sistema de Autenticação (TypeScript)

### `services/api.ts`

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

---

## 🚀 Como Executar

### Passos

```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Melhorias Futuras

- [x] Migrar para **TypeScript** (Concluído ✅)
- [x] Refatorar Globo para **React Three Fiber** (Concluído ✅)
- [ ] Implementar **Zustand** para estado global da sessão
- [ ] Substituir `alert()` por **Toast notifications**
- [ ] **PWA** (Progressive Web App)
- [ ] Animação de eliminação de candidatos com Shaders customizados
