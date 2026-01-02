-- =======================================================
-- 1. LIMPEZA (Ordem correta para evitar erro de FK)
-- =======================================================
DROP TABLE IF EXISTS game_session_rejected;
DROP TABLE IF EXISTS country_features;
DROP TABLE IF EXISTS game_attempts;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS users;

-- =======================================================
-- 2. CRIAÇÃO DAS TABELAS
-- =======================================================

-- Tabela de Usuários
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    total_score INT DEFAULT 0 CHECK (total_score >= 0),
    games_played INT DEFAULT 0 CHECK (games_played >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Países
CREATE TABLE countries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    iso_code VARCHAR(5) NOT NULL,
    image_url VARCHAR(255)
);

-- Tabela de Perguntas
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    helper_image_url VARCHAR(255)
);

-- Tabela de Características (O Cérebro)
CREATE TABLE country_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    is_true BOOLEAN NOT NULL, -- A verdade absoluta sobre o país
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE (country_id, question_id) -- Garante que não duplique fatos
);

-- Tabela de Sessão de Jogo
CREATE TABLE game_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    target_country_id BIGINT, -- CORREÇÃO: Removido NOT NULL (começa vazio)
    status VARCHAR(50) NOT NULL, -- IN_PROGRESS, WAITING_FOR_REVEAL, FINISHED...
    score INT DEFAULT 100 CHECK (score >= 0),
    attempts INT DEFAULT 0 CHECK (attempts >= 0),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_country_id) REFERENCES countries(id)
);

-- Tabela de Histórico de Tentativas (Log)
CREATE TABLE game_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,     -- CORREÇÃO: Adicionado direto na criação
    user_answer BOOLEAN NOT NULL,    -- Resposta do usuário na hora
    is_correct BOOLEAN DEFAULT NULL, -- CORREÇÃO: O modo Detetive preenche isso no final
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Tabela de Rejeitados (Akinator chutou e errou)
CREATE TABLE game_session_rejected (
    session_id BIGINT NOT NULL,
    country_id BIGINT NOT NULL,
    PRIMARY KEY (session_id, country_id),
    CONSTRAINT fk_session_rejected FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    CONSTRAINT fk_country_rejected FOREIGN KEY (country_id) REFERENCES countries(id)
);