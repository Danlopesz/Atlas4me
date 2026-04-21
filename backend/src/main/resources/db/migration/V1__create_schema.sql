-- =======================================================
-- 1. LIMPEZA (Ordem correta para evitar erro de FK)
-- =======================================================
-- DROP TABLE IF EXISTS game_session_rejected;
-- DROP TABLE IF EXISTS country_features;
-- DROP TABLE IF EXISTS game_attempts;
-- DROP TABLE IF EXISTS game_sessions;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS countries;
-- DROP TABLE IF EXISTS users;

-- =======================================================
-- 2. CRIAÇÃO DAS TABELAS
-- =======================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS countries     (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_pt VARCHAR(255) NOT NULL,
    continent VARCHAR(100) NOT NULL,
    subcontinent VARCHAR(100),
    capital VARCHAR(255),
    iso_code VARCHAR(10) UNIQUE NOT NULL,
    flag_url VARCHAR(500),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6)
);

-- Tabela de Perguntas
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY,
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    question_pt VARCHAR(255) NOT NULL,
    question_en VARCHAR(255) NOT NULL,
    category VARCHAR(100)
);

-- Tabela Associativa: Países x Features
CREATE TABLE IF NOT EXISTS country_features (
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   country_id BIGINT NOT NULL,
   question_id BIGINT NOT NULL,
   is_true BOOLEAN NOT NULL,
   FOREIGN KEY (country_id) REFERENCES countries(id),
   FOREIGN KEY (question_id) REFERENCES questions(id),
   UNIQUE (country_id, question_id)
);

-- Tabela de Sessão de Jogo
CREATE TABLE IF NOT EXISTS game_sessions (
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
   user_id BIGINT NULL,
   target_country_id BIGINT,
   status VARCHAR(50) NOT NULL,
   score INT DEFAULT 100 CHECK (score >= 0),
   attempts INT DEFAULT 0 CHECK (attempts >= 0),
   started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   finished_at TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (target_country_id) REFERENCES countries(id),
   version BIGINT DEFAULT 0
);

-- Tabela de Histórico de Tentativas (Log)
CREATE TABLE IF NOT EXISTS game_attempts (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     session_id BIGINT NOT NULL,
     question_id BIGINT NOT NULL,
     user_answer BOOLEAN NOT NULL,
     is_correct BOOLEAN DEFAULT NULL,
     attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (session_id) REFERENCES game_sessions(id),
     FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Tabela de Rejeitados (Akinator chutou e errou)
CREATE TABLE IF NOT EXISTS game_session_rejected (
     session_id BIGINT NOT NULL,
     country_id BIGINT NOT NULL,
     PRIMARY KEY (session_id, country_id),
     CONSTRAINT fk_session_rejected FOREIGN KEY (session_id) REFERENCES game_sessions(id),
     CONSTRAINT fk_country_rejected FOREIGN KEY (country_id) REFERENCES countries(id)
);
