-- 1. Adiciona as colunas na tabela
ALTER TABLE countries ADD COLUMN latitude DOUBLE;
ALTER TABLE countries ADD COLUMN longitude DOUBLE;

-- 2. Popula com os dados
UPDATE countries SET latitude = -14.2350, longitude = -51.9253 WHERE iso_code = 'BR'; -- Brasil
UPDATE countries SET latitude = -38.4161, longitude = -63.6167 WHERE iso_code = 'AR'; -- Argentina
UPDATE countries SET latitude = -35.6751, longitude = -71.5430 WHERE iso_code = 'CL'; -- Chile
UPDATE countries SET latitude = 4.5709,   longitude = -74.2973 WHERE iso_code = 'CO'; -- Colômbia
UPDATE countries SET latitude = -9.1900,  longitude = -75.0152 WHERE iso_code = 'PE'; -- Peru
UPDATE countries SET latitude = -1.8312,  longitude = -78.1834 WHERE iso_code = 'EC'; -- Equador
UPDATE countries SET latitude = 6.4238,   longitude = -66.5897 WHERE iso_code = 'VE'; -- Venezuela
UPDATE countries SET latitude = -16.2902, longitude = -63.5887 WHERE iso_code = 'BO'; -- Bolívia
UPDATE countries SET latitude = -23.4425, longitude = -58.4438 WHERE iso_code = 'PY'; -- Paraguai
UPDATE countries SET latitude = -32.5228, longitude = -55.7658 WHERE iso_code = 'UY'; -- Uruguai
UPDATE countries SET latitude = 4.8604,   longitude = -58.9302 WHERE iso_code = 'GY'; -- Guiana
UPDATE countries SET latitude = 3.9193,   longitude = -56.0278 WHERE iso_code = 'SR'; -- Suriname
UPDATE countries SET latitude = 3.9339,   longitude = -53.1258 WHERE iso_code = 'GF'; -- Guiana Francesa