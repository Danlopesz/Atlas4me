# 🌍 Atlas4Me - Jogo Educativo de Geografia

> Descubra países da América do Sul através de perguntas estratégicas! Um jogo estilo Akinator focado em geografia, construído com React e Spring Boot.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é uma aplicação web educativa que gamifica o aprendizado de geografia, inspirada no famoso Akinator. O jogador **pensa em um país** da América do Sul e o sistema tenta adivinhar através de perguntas inteligentes.

### 🎯 Como Funciona

1. **Jogador pensa** em um país secreto dos 13 da América do Sul (não revela!)
2. **Sistema faz perguntas** com respostas SIM ou NÃO (ex: "Fala Espanhol?", "Tem litoral?")
3. **Jogador responde** honestamente sobre o país que pensou
4. **Sistema filtra** países candidatos baseado nas respostas
5. **Sistema tenta adivinhar** quando restarem poucos países
6. **Sistema pontua** baseado em quantas tentativas precisou (menos é melhor)

### ✨ Funcionalidades

- ✅ **Autenticação JWT** - Login seguro com tokens
- ✅ **Algoritmo Inteligente** - Filtragem progressiva de países
- ✅ **Sistema de Pontuação** - Ranking global de jogadores
- ✅ **16 Perguntas Estratégicas** - Geografia, cultura, bandeiras
- ✅ **13 Países** - Todos da América do Sul
- ✅ **Feedback Educativo** - Mostra onde você errou
- ✅ **Histórico de Partidas** - Reveja seus jogos anteriores
- ✅ **Design Responsivo** - Funciona em desktop e mobile

---

## 🏗️ Arquitetura

```
Atlas4Me/
├── backend/           # API REST Spring Boot
│   ├── Java 21
│   ├── Spring Security + JWT
│   ├── Spring Data JPA
│   ├── Flyway Migrations
│   └── MySQL Database (Port 3307)
│
└── frontend/          # SPA React
    ├── React 19 + Vite
    ├── React Router
    ├── Axios HTTP Client
    └── CSS3 Moderno
```

### Tecnologias Utilizadas

**Backend:**
- Java 21
- Spring Boot 3.2.0
- Spring Security (JWT)
- Spring Data JPA
- Flyway
- MySQL Database (Port 3307)
- Lombok
- Maven

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- React Router DOM 7.10.1
- Axios 1.13.2
- CSS3 (sem frameworks)

---

## 🚀 Como Executar

### Pré-requisitos

- **Java 21+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Maven 3.8+** (incluído no wrapper)
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/atlas4me-react.git
cd atlas4me-react
```

### 2️⃣ Executar Backend

```bash
cd backend

# Instalar dependências e compilar
mvn clean install

# Executar aplicação
mvn spring-boot:run

# Backend rodando em http://localhost:5202
```

**Verificar se está funcionando:**
```bash
curl http://localhost:5202/api/countries
# Deve retornar JSON com lista de países
```

**Acessar Banco MySQL (via DBeaver ou outro cliente):**
- Host: `localhost:3307`
- Database: `atlas4me`
- Username: `root`
- Password: `atlas`

### 3️⃣ Executar Frontend

```bash
# Em outro terminal
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Frontend rodando em http://localhost:5173
```

### 4️⃣ Acessar Aplicação

Abra seu navegador em: **http://localhost:5173**

---

## 📱 Como Jogar

1. **Cadastre-se** ou faça **Login**
2. Clique em **"Jogar"**
3. **PENSE em um país** da América do Sul (Brasil, Argentina, Chile, etc.) - **NÃO REVELE!**
4. **Sistema faz perguntas** sobre o país que você pensou:
   - "O país fala Espanhol?" → Você responde: SIM ou NÃO
   - "Tem saída para o mar?" → Você responde: SIM ou NÃO
   - "A Cordilheira dos Andes passa por ele?" → Você responde: SIM ou NÃO
5. **Responda honestamente** sobre o país que você pensou
6. Observe o sistema **eliminar países** que não correspondem às suas respostas
7. Quando o sistema tiver certeza, ele **tentará adivinhar** o país!
8. Se errar, ele tenta novamente até acertar ou desistir
9. Pontuação: Quanto menos tentativas o sistema precisar, melhor para ele (e pior para você!) 🏆

### Dicas para Vencer o Sistema

💡 **Pense em países menos óbvios:**
- Países pequenos como Suriname ou Guiana são mais difíceis de adivinhar

💡 **Responda com atenção:**
- Um erro seu pode confundir o algoritmo e fazer você perder

💡 **Conheça bem o país:**
- Sistema pergunta sobre: geografia, cultura, bandeira, idioma, economia

---

## 📊 Estrutura do Banco de Dados

### Entidades Principais

```
User ──(1:N)──> GameSession ──(1:N)──> GameAttempt
                     │
                     └──(N:1)──> Country
                                    │
                                    └──(1:N)──> CountryFeature ──(N:1)──> Question
```

**6 Tabelas:**
1. **users** - Jogadores cadastrados
2. **game_sessions** - Partidas individuais
3. **game_attempts** - Log de cada resposta
4. **countries** - Países do jogo
5. **questions** - Perguntas disponíveis
6. **country_features** - Matriz (País × Pergunta × Resposta)

---

## 🔐 Segurança

- **Autenticação:** JWT (JSON Web Tokens)
- **Senhas:** Criptografadas com BCrypt
- **CORS:** Configurado para permitir frontend
- **SQL Injection:** Protegido pelo JPA/Hibernate
- **XSS:** Headers de segurança configurados
- **Token Expiration:** 24 horas (configurável)

---

## 📚 Documentação

- 📖 [**Documentação Completa**](DOCUMENTACAO_COMPLETA.md) - Guia técnico detalhado
- 🔧 [**Backend README**](backend/README.md) - API REST e arquitetura
- 🎨 [**Frontend README**](frontend/README.md) - Interface React
- 📊 [**Migrations SQL**](backend/src/main/resources/db/migration/) - Schema do banco

### Endpoints da API

**Autenticação:**
```
POST /api/auth/register  - Cadastro de usuário
POST /api/auth/login     - Login e geração de JWT
```

**Jogo:**
```
POST /api/game/start     - Iniciar nova partida
POST /api/game/answer    - Responder pergunta
GET  /api/game/history   - Histórico de jogos
```

**Países:**
```
GET  /api/countries      - Listar todos os países
```

---

## 🧪 Testes

### Backend

```bash
cd backend

# Executar todos os testes
mvn test

# Executar com coverage
mvn test jacoco:report

# Ver relatório em:
# target/site/jacoco/index.html
```

### Frontend

```bash
cd frontend

# Testes (a implementar)
npm run test
```

---

## 📦 Build para Produção

### Backend

```bash
cd backend

# Gerar JAR executável
mvn clean package -DskipTests

# JAR em: target/atlas4me-backend-1.0.0.jar

# Executar
java -jar target/atlas4me-backend-1.0.0.jar
```

### Frontend

```bash
cd frontend

# Build otimizado
npm run build

# Arquivos em: dist/

# Testar build localmente
npm run preview
```

### Docker (Opcional)

```bash
# Backend
docker build -t atlas4me-backend ./backend
docker run -p 5202:5202 atlas4me-backend

# Frontend
docker build -t atlas4me-frontend ./frontend
docker run -p 5173:5173 atlas4me-frontend
```

---

## 🌱 Roadmap

### Versão 1.0 ✅ (Atual)
- [x] Sistema de autenticação JWT
- [x] Algoritmo de filtragem de países
- [x] 13 países da América do Sul
- [x] 16 perguntas estratégicas
- [x] Sistema de pontuação
- [x] Interface responsiva

### Versão 1.1 🔄 (Em Progresso)
- [ ] Migrar frontend para TypeScript
- [ ] Adicionar testes unitários
- [ ] Implementar cache Redis
- [ ] Dark mode
- [ ] Implementar features de Usuario


### Versão 2.0 🔮 (Futuro)
- [ ] Modo multiplayer online
- [ ] Novos continentes (Europa, Ásia, África)
- [ ] Sistema de conquistas
- [ ] Chat em tempo real
- [ ] PWA (modo offline)
- [ ] Analytics e métricas

---
### Padrões de Código

- **Backend:** Seguir convenções Java/Spring Boot
- **Frontend:** ESLint configurado
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Documentação
  - `refactor:` Refatoração
  - `test:` Testes

---

## 🐛 Problemas Conhecidos

- [ ] Navegador mobile: botões pequenos (melhorar UX)
- [ ] Alert() nativo: substituir por toast notifications
- [ ] Sem suporte a múltiplas sessões simultâneas
- [ ] Validação de email duplicado: melhorar mensagem de erro

**Reporte bugs em:** [GitHub Issues](https://github.com/seu-usuario/atlas4me-react/issues)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autores

- **Daniel Lopes** - Desenvolvimento Full Stack 

---

## 📞 Contato

- **Email:** suporte@atlas4me.com
- **Issues:** https://github.com/seu-usuario/atlas4me-react/issues
- **Discussões:** https://github.com/seu-usuario/atlas4me-react/discussions

---

## ⭐ Agradecimentos

- **Spring Initializr** - Bootstrap do projeto backend
- **Vite** - Build tool rápido e moderno
- **ChatGPT** - Assistência em documentação
- **Comunidade Open Source** - Bibliotecas incríveis

---

## 📊 Estatísticas do Projeto

- **Backend:** ~4.500 linhas de código Java
- **Frontend:** ~2.000 linhas de código React/CSS
- **Banco de Dados:** 6 tabelas, 16 perguntas, 13 países
- **API Endpoints:** 6 principais
- **Tempo de Desenvolvimento:** ~2 meses

---

**🎮 Divirta-se aprendendo geografia! 🌎**

---

*Última atualização: Dezembro 2025*
