-- 1. Limpeza (Opcional: Remove tabelas antigas se existirem para recriar do zero)
 DROP TABLE IF EXISTS game_attempts;
 DROP TABLE IF EXISTS country_features;
 DROP TABLE IF EXISTS game_sessions;
 DROP TABLE IF EXISTS questions;
 DROP TABLE IF EXISTS countries;
 DROP TABLE IF EXISTS users;

-- 2. Tabela de Usuários
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    total_score INT DEFAULT 0,
    games_played INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 3. Tabela de Países (Simplificada para o Akinator)
CREATE TABLE countries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    iso_code VARCHAR(5) NOT NULL, -- Ex: BR, AR
    image_url VARCHAR(255)        -- Caminho da bandeira/imagem
);

-- 4. Tabela de Perguntas (O "Menu" do Robô)
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- GEOGRAFIA, CULTURA, BANDEIRA
    helper_image_url VARCHAR(255)  -- Mapa de apoio visual
);

-- 5. Tabela de Características (O "Cérebro/Memória" do Robô)
-- Liga País + Pergunta + Resposta (Sim/Não)
CREATE TABLE country_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    country_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    is_true BOOLEAN NOT NULL,
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 6. Tabela de Sessão de Jogo
CREATE TABLE game_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_country_id BIGINT NOT NULL, -- O país secreto
    status VARCHAR(20) NOT NULL,       -- IN_PROGRESS, ROBOT_WON, HUMAN_WON
    score INT DEFAULT 100,
    attempts INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_country_id) REFERENCES countries(id)
);

-- 7. Tabela de Histórico de Tentativas (Log do Jogo)
CREATE TABLE game_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    question_text VARCHAR(255) NOT NULL, -- O que foi perguntado
    user_answer BOOLEAN NOT NULL,        -- O que o usuário respondeu
    is_correct BOOLEAN,                  -- Se essa resposta ajudou a filtrar
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
);