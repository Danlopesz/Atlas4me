-- Adiciona coluna iso_code na tabela country_features
ALTER TABLE country_features ADD COLUMN iso_code VARCHAR(10);

-- Popula a coluna com os dados dos países relacionados
UPDATE country_features cf
INNER JOIN countries c ON cf.country_id = c.id
SET cf.iso_code = c.iso_code;

-- Torna a coluna NOT NULL depois de popular
ALTER TABLE country_features MODIFY COLUMN iso_code VARCHAR(10) NOT NULL;
