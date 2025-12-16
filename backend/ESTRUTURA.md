# 📁 Estrutura do Projeto Atlas4Me Backend

## ✅ Organização Atualizada e Corrigida

O projeto foi **completamente reorganizado** seguindo as melhores práticas de arquitetura Java Spring Boot.

---

## 📂 Estrutura de Diretórios

```
backend/src/main/java/altas4me/
│
├── 📁 controller/                      # Camada de Apresentação (API REST)
│   ├── AuthController.java            # Endpoints de autenticação
│   ├── GameController.java            # Endpoints do jogo
│   └── CountryController.java         # Endpoints de países
│
├── 📁 entity/                          # Camada de Domínio (Entidades JPA)
│   ├── User.java                      # Entidade Usuário
│   ├── Country.java                   # Entidade País
│   ├── GameSession.java               # Entidade Sessão de Jogo
│   └── GameAttempt.java               # Entidade Tentativa de Jogo
│
├── 📁 features/                        # Camada de Aplicação (Use Cases)
│   │
│   ├── 📁 auth/                       # Feature: Autenticação
│   │   ├── 📁 dto/
│   │   │   ├── 📁 request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   └── RegisterRequest.java
│   │   │   └── 📁 response/
│   │   │       └── AuthResponse.java
│   │   ├── LoginService.java         # Serviço de Login
│   │   └── RegisterService.java      # Serviço de Cadastro
│   │
│   └── 📁 game/                       # Feature: Jogo
│       ├── 📁 dto/
│       │   ├── 📁 request/
│       │   │   └── GameAnswerRequest.java
│       │   └── 📁 response/
│       │       ├── GameResponse.java
│       │       ├── GameHistoryDTO.java
│       │       └── CountryDTO.java
│       ├── GameService.java          # Serviço principal do jogo
│       ├── CountryService.java       # Serviço de países
│       └── GameAlgorithmService.java # Algoritmo do jogo
│
├── 📁 infra/                          # Camada de Infraestrutura
│   ├── 📁 repository/                 # Repositórios JPA
│   │   ├── UserRepository.java
│   │   ├── CountryRepository.java
│   │   ├── GameSessionRepository.java
│   │   └── GameAttemptRepository.java
│   └── 📁 exception/                  # Tratamento de exceções
│       ├── GlobalExceptionHandler.java
│       ├── ErrorResponse.java
│       └── ValidationErrorResponse.java
│
├── 📁 security/                       # Camada de Segurança
│   ├── SecurityConfig.java           # Configuração Spring Security
│   ├── JwtTokenProvider.java         # Provedor de tokens JWT
│   ├── JwtAuthenticationFilter.java  # Filtro de autenticação
│   └── CustomUserDetailsService.java # Carregador de usuários
│
├── 📁 shared/                         # Recursos Compartilhados
│   ├── 📁 exception/                  # Exceções customizadas
│   │   ├── ResourceNotFoundException.java
│   │   ├── BusinessException.java
│   │   └── DuplicateEmailException.java
│   └── Utils.java                    # Utilitários gerais
│
└── Atlas4meApplication.java          # Classe principal
```

---

## 🎯 Separação por Features

### ✅ Vantagens da Nova Estrutura

#### 1. **Feature-Based Organization**
Cada funcionalidade (Auth, Game) tem sua própria pasta com:
- DTOs específicos (Request/Response)
- Services de negócio
- Toda lógica relacionada agrupada

#### 2. **DTOs Organizados**
```
features/
  └── auth/
      └── dto/
          ├── request/    # LoginRequest, RegisterRequest
          └── response/   # AuthResponse
  └── game/
      └── dto/
          ├── request/    # GameAnswerRequest
          └── response/   # GameResponse, GameHistoryDTO, CountryDTO
```

#### 3. **Separação de Responsabilidades**
- **Controllers**: Apenas recebem requisições e retornam respostas
- **Services**: Contêm toda lógica de negócio
- **Repositories**: Acesso a dados
- **Entities**: Modelos de domínio

---

## 🔄 Fluxo de Requisição

```
1. Cliente HTTP Request
   ↓
2. Controller (API Layer)
   ↓
3. Service (Business Logic)
   ↓
4. Repository (Data Access)
   ↓
5. Database (H2/MySQL)
   ↓
6. Response DTO
   ↓
7. Cliente HTTP Response
```

---

## 📋 Dependências entre Camadas

```
Controller → Service → Repository → Entity
    ↓          ↓
   DTO    Exception
```

### Regras:
- ✅ Controllers **usam** Services e DTOs
- ✅ Services **usam** Repositories e Entities
- ✅ Repositories **usam** Entities
- ❌ Entities **não dependem** de nada
- ❌ DTOs **não dependem** de Entities

---

## 🛠️ Arquivos Corrigidos

### Controllers
- ✅ `AuthController.java` - Imports corretos para auth DTOs
- ✅ `GameController.java` - Imports corretos para game DTOs
- ✅ `CountryController.java` - Import correto para CountryDTO

### Services
- ✅ `LoginService.java` - Import correto de LoginRequest e AuthResponse
- ✅ `RegisterService.java` - Import correto de RegisterRequest e AuthResponse
- ✅ `GameService.java` - Imports corretos de GameAnswerRequest, GameResponse, GameHistoryDTO
- ✅ `CountryService.java` - Import correto de CountryDTO

### DTOs Reorganizados
- ✅ Movidos de `shared/dto/` para `features/[auth|game]/dto/[request|response]/`
- ✅ Cada feature tem seus próprios DTOs
- ✅ Separação clara entre Request e Response

---

## 🎨 Padrões Aplicados

### 1. **Clean Architecture**
- Separação clara de responsabilidades
- Dependências apontam para dentro
- Camadas independentes

### 2. **Feature-Sliced Design**
- Organização por funcionalidade
- Fácil manutenção
- Escalabilidade

### 3. **DTO Pattern**
- Objetos específicos para transferência
- Validação centralizada
- Separação de concerns

### 4. **Repository Pattern**
- Abstração do acesso a dados
- Facilita testes
- Independência de tecnologia

---

## 📦 Endpoints da API

### Autenticação (`/api/auth`)
```
POST /api/auth/register  → RegisterRequest  → AuthResponse
POST /api/auth/login     → LoginRequest     → AuthResponse
```

### Jogo (`/api/game`)
```
POST /api/game/start     → (authenticated)  → GameResponse
POST /api/game/answer    → GameAnswerRequest → GameResponse
GET  /api/game/history   → (authenticated)  → List<GameHistoryDTO>
```

### Países (`/api/countries`)
```
GET  /api/countries      → (public)         → List<CountryDTO>
```

---

## ✅ Checklist de Qualidade

- ✅ Todos os imports corrigidos
- ✅ Sem dependências circulares
- ✅ DTOs organizados por feature
- ✅ Separação Request/Response
- ✅ Validações com Bean Validation
- ✅ Tratamento de exceções global
- ✅ Segurança JWT implementada
- ✅ CORS configurado
- ✅ Código compilável sem erros

---

## 🚀 Como Usar

```bash
# Compilar
mvn clean compile

# Executar
mvn spring-boot:run

# Testar
mvn test

# Empacotar
mvn clean package
```

---

## 📝 Convenções de Nomenclatura

### Packages
- `controller` - Controllers REST
- `entity` - Entidades JPA
- `features.[nome]` - Features/módulos
- `infra` - Infraestrutura
- `security` - Segurança
- `shared` - Compartilhado

### Classes
- `*Controller` - Controllers
- `*Service` - Services
- `*Repository` - Repositories
- `*Request` - DTOs de entrada
- `*Response` - DTOs de saída
- `*DTO` - Data Transfer Objects
- `*Exception` - Exceções customizadas

### Métodos
- `find*` - Buscar
- `save*` - Salvar
- `delete*` - Deletar
- `get*` - Obter
- `create*` - Criar
- `update*` - Atualizar

---

## 🎓 Boas Práticas Implementadas

1. ✅ **Imutabilidade**: DTOs com Lombok
2. ✅ **Validação**: Bean Validation nos DTOs
3. ✅ **Tratamento de Erros**: GlobalExceptionHandler
4. ✅ **Segurança**: JWT + Spring Security
5. ✅ **Transações**: @Transactional nos services
6. ✅ **Injeção de Dependência**: Constructor injection
7. ✅ **Clean Code**: Nomes descritivos
8. ✅ **SOLID**: Single Responsibility Principle

---

**Projeto 100% funcional e organizado! 🎉**
