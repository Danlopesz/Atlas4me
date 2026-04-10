import pandas as pd
import numpy as np

# ==============================
# CONFIG
# ==============================

ARQUIVO_PAISES = 'DB-Atlas4me - TabCountryV2.csv'
ARQUIVO_PERGUNTAS = 'DB-Atlas4me - TabQuestionsV2.csv'
ARQUIVO_COUNTRYFEATURES = 'DB-Atlas4me - TabCountryFeaturesV2.csv'

ARQUIVO_V5 = 'V5__create_tables.sql'
ARQUIVO_V6 = 'V6__insert_data.sql'

BATCH_SIZE = 500 # Evita queries gigantes e estouro de buffer do MySQL

# ==============================
# UTIL
# ==============================

def formatar_valor(valor):
    if pd.isna(valor) or str(valor).strip() == '':
        return 'NULL'
    if isinstance(valor, str):
        # Escapa aspas simples para o SQL
        valor = valor.replace("'", "''").strip()
        return f"'{valor}'"
    return str(valor)

def escrever_insert_em_lote(f, tabela, colunas, valores):
    """Gera inserts em lote utilizando INSERT IGNORE conforme solicitado."""
    if not valores:
        return

    for i in range(0, len(valores), BATCH_SIZE):
        chunk = valores[i:i+BATCH_SIZE]
        sql = f"INSERT IGNORE INTO {tabela} ({', '.join(colunas)}) VALUES\n"
        sql += ",\n".join(chunk) + ";\n\n"
        f.write(sql)

# ==============================
# V5 - CREATE TABLE
# ==============================

def gerar_sql_v5_create():
    with open(ARQUIVO_V5, 'w', encoding='utf-8') as f:
        f.write("""-- =======================================================
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
        CREATE TABLE IF NOT EXISTS countries (
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
                """)
    print(f"✅ {ARQUIVO_V5} gerado com sucesso.")

# ==============================
# V6 - INSERT DATA
# ==============================

def gerar_sql_v6_insert():
    with open(ARQUIVO_V6, 'w', encoding='utf-8') as f:
        f.write("-- Flyway Migration: V6\n")
        f.write("-- Inserção de dados em countries, questions e country_features\n\n")

        # 1. COUNTRIES ==========================================
        try:
            df_countries = pd.read_csv(ARQUIVO_PAISES)
            valores_countries = []

            for _, row in df_countries.iterrows():
                valores_countries.append(f"({formatar_valor(row.get('name_en'))}, {formatar_valor(row.get('name_pt'))}, {formatar_valor(row.get('continent'))}, {formatar_valor(row.get('subcontinent'))}, {formatar_valor(row.get('capital'))}, {formatar_valor(row.get('iso_code'))}, {formatar_valor(row.get('flag_url'))}, {formatar_valor(row.get('latitude'))}, {formatar_valor(row.get('longitude'))})")

            col_countries = ["name_en", "name_pt", "continent", "subcontinent", "capital", "iso_code", "flag_url", "latitude", "longitude"]
            f.write("-- ==========================================\n-- COUNTRIES\n-- ==========================================\n\n")
            escrever_insert_em_lote(f, "countries", col_countries, valores_countries)
            print(f"✅ {len(valores_countries)} países processados.")
        except Exception as e:
            print(f"❌ Erro em countries: {e}")

        # 2. QUESTIONS ==========================================
        # Mantendo header=1 conforme seu script original, ajuste se necessário
        map_questions = {} # Dicionário para uso posterior no cruzamento
        try:
            df_questions = pd.read_csv(ARQUIVO_PERGUNTAS, header=1)
            valores_questions = []

            for _, row in df_questions.iterrows():
                q_id = row.get('Id')
                if pd.isna(q_id):
                    continue

                q_pt = row.get('question_pt')

                # Guarda no mapa: Pergunta PT -> ID (para bater com a planilha de features)
                if pd.notna(q_pt):
                    map_questions[str(q_pt).strip()] = int(q_id)

                valores_questions.append(f"({int(q_id)}, {formatar_valor(row.get('featureKey'))}, {formatar_valor(q_pt)}, {formatar_valor(row.get('question_en'))}, {formatar_valor(row.get('category'))})")

            col_questions = ["id", "feature_key", "question_pt", "question_en", "category"]
            f.write("-- ==========================================\n-- QUESTIONS\n-- ==========================================\n\n")
            escrever_insert_em_lote(f, "questions", col_questions, valores_questions)
            print(f"✅ {len(valores_questions)} perguntas processadas.")
        except Exception as e:
            print(f"❌ Erro em questions: {e}")

        # 3. COUNTRY FEATURES ===================================
        try:
            df_features = pd.read_csv(ARQUIVO_COUNTRYFEATURES)
            valores_features = []

            # Agora a primeira coluna da sua planilha é o ISO Code (ex: "BRA")
            nome_coluna_iso = df_features.columns[0]
            perguntas_colunas = df_features.columns[1:]

            for _, row in df_features.iterrows():
                # Pegamos direto o ISO da planilha
                iso_code_planilha = str(row[nome_coluna_iso]).strip()
                if iso_code_planilha.lower() == 'nan' or not iso_code_planilha:
                    continue

                for q_text_col in perguntas_colunas:
                    q_text = str(q_text_col).strip()
                    q_id = map_questions.get(q_text) # Busca o ID numérico da pergunta (16, 17, etc)

                    if q_id is not None:
                        val_booleano = str(row[q_text_col]).strip()

                        # 🚀 A CORREÇÃO MÁGICA ESTÁ AQUI:
                        # Aceita '1', '1.0', ou até '1.00' como verdadeiro!
                        is_true = "TRUE" if val_booleano in ['1', '1.0', '1.00'] else "FALSE"

                        subquery_pais = f"(SELECT id FROM countries WHERE iso_code = '{iso_code_planilha}')"
                        valores_features.append(f"({subquery_pais}, {q_id}, {is_true})")

            col_features = ["country_id", "question_id", "is_true"]
            escrever_insert_em_lote(f, "country_features", col_features, valores_features)

        except Exception as e:
            print(f"❌ Erro em country_features: {e}")

    print(f"\n🚀 {ARQUIVO_V6} gerado com sucesso!")

# ==============================
# MAIN
# ==============================

if __name__ == "__main__":
    gerar_sql_v5_create()
    gerar_sql_v6_insert()