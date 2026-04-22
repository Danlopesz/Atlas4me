-- =========================================================
-- V3: Índice composto para otimizar queries de ranking
-- Cobre: filtro por status, agrupamento por user_id + target_country_id
-- =========================================================

CREATE INDEX idx_game_sessions_ranking
ON game_sessions (user_id, status, target_country_id);
