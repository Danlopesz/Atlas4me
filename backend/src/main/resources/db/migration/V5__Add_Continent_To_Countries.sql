-- Adiciona a coluna com valor padrão para não quebrar os registros existentes
ALTER TABLE countries ADD COLUMN continent VARCHAR(50) DEFAULT 'SOUTH_AMERICA';

-- Garante que os 13 países atuais fiquem marcados corretamente
UPDATE countries SET continent = 'SOUTH_AMERICA';