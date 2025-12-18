# 🌍 Atlas4Me - Jogo Educativo de Geografia

> Descubra países da América do Sul através de perguntas estratégicas! Um jogo estilo Akinator focado em geografia, construído com React e Spring Boot.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Sobre o Projeto

**Atlas4Me** é uma aplicação web educativa que gamifica o aprendizado de geografia. O sistema "pensa" em um país da América do Sul e o jogador tenta descobrir qual é através de perguntas sobre características geográficas, culturais e históricas.

### 🎯 Como Funciona

1. **Sistema escolhe** um país secreto dos 13 da América do Sul
2. **Jogador pergunta** características (ex: "Fala Espanhol?", "Tem litoral?")
3. **Sistema filtra** países que não correspondem às respostas
4. **Jogador adivinha** quando restar poucos países
5. **Sistema pontua** baseado em acertos (100 pontos - 10 por erro)

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
│   └── H2/MySQL Database
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
- H2 Database (dev) / MySQL (prod)
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

**Acessar H2 Console:**
- URL: http://localhost:5202/h2-console
- JDBC URL: `jdbc:h2:mem:atlas4me`
- Username: `sa`
- Password: (vazio)

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
3. O sistema sorteia um país secreto
4. Faça perguntas estratégicas:
   - "O país fala Espanhol?" → SIM/NÃO
   - "Tem saída para o mar?" → SIM/NÃO
   - "A Cordilheira dos Andes passa por ele?" → SIM/NÃO
5. Observe a lista de países restantes diminuir
6. Quando tiver certeza, **tente adivinhar o país!**
7. Ganhe pontos e suba no ranking global 🏆

### Dicas de Estratégia

💡 **Comece com perguntas que dividem bem os países:**
- "Fala Espanhol?" → Elimina 4 países de uma vez
- "Tem litoral?" → Divide entre costeiros e interiores

💡 **Use perguntas de bandeira no final:**
- Quando restar 2-3 países, características visuais ajudam

💡 **Evite perguntas muito específicas no início:**
- "Usa Euro?" só identifica 1 país (Guiana Francesa)

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

### Versão 2.0 🔮 (Futuro)
- [ ] Modo multiplayer online
- [ ] Novos continentes (Europa, Ásia, África)
- [ ] Sistema de conquistas
- [ ] Chat em tempo real
- [ ] PWA (modo offline)
- [ ] Analytics e métricas

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/atlas4me-react.git`
3. **Crie uma branch**: `git checkout -b feature/MinhaFeature`
4. **Faça suas alterações**
5. **Teste** localmente
6. **Commit**: `git commit -m 'feat: Adiciona MinhaFeature'`
7. **Push**: `git push origin feature/MinhaFeature`
8. **Abra um Pull Request**

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
- [ ] H2 Console: não funciona em produção (só dev)
- [ ] Alert() nativo: substituir por toast notifications
- [ ] Sem suporte a múltiplas sessões simultâneas

**Reporte bugs em:** [GitHub Issues](https://github.com/seu-usuario/atlas4me-react/issues)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autores

- **Seu Nome** - Desenvolvimento Full Stack - [@seu-usuario](https://github.com/seu-usuario)

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
