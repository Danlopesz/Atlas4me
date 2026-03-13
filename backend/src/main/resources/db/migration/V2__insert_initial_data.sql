-- === LIMPEZA ===
-- DELETE FROM country_features;
-- DELETE FROM questions;
-- DELETE FROM countries; -- Cuidado com chaves estrangeiras, talvez precise deletar jogos antes

-- =======================================================
-- 3. CARGA DE DADOS (Seus Inserts Originais)
-- =======================================================

-- Países
INSERT IGNORE INTO countries (id, name, iso_code, image_url, latitude, longitude, continent) VALUES 
(1, 'Brasil', 'BR', '/images/countries/br.png', -14.2350, -51.9253, 'SOUTH_AMERICA'),
(2, 'Argentina', 'AR', '/images/countries/ar.png', -38.4161, -63.6167, 'SOUTH_AMERICA'),
(3, 'Uruguai', 'UY', '/images/countries/uy.png', -32.5228, -55.7658, 'SOUTH_AMERICA'),
(4, 'Paraguai', 'PY', '/images/countries/py.png', -23.4425, -58.4438, 'SOUTH_AMERICA'),
(5, 'Bolívia', 'BO', '/images/countries/bo.png', -16.2902, -63.5887, 'SOUTH_AMERICA'),
(6, 'Chile', 'CL', '/images/countries/cl.png', -35.6751, -71.5430, 'SOUTH_AMERICA'),
(7, 'Peru', 'PE', '/images/countries/pe.png', -9.1900, -75.0152, 'SOUTH_AMERICA'),
(8, 'Equador', 'EC', '/images/countries/ec.png', -1.8312, -78.1834, 'SOUTH_AMERICA'),
(9, 'Colômbia', 'CO', '/images/countries/co.png', 4.5709, -74.2973, 'SOUTH_AMERICA'),
(10, 'Venezuela', 'VE', '/images/countries/ve.png', 6.4238, -66.5897, 'SOUTH_AMERICA'),
(11, 'Guiana', 'GY', '/images/countries/gy.png', 4.8604, -58.9302, 'SOUTH_AMERICA'),
(12, 'Suriname', 'SR', '/images/countries/sr.png', 3.9193, -56.0278, 'SOUTH_AMERICA'),
(13, 'Guiana Francesa', 'GF', '/images/countries/gf.png', 3.9339, -53.1258, 'SOUTH_AMERICA');

-- Perguntas
INSERT IGNORE INTO questions (id, text, category, helper_image_url) VALUES 
(1, 'A língua principal falada neste país é o Espanhol?', 'CULTURA', '/images/maps/idiomas.png'),
(2, 'A Cordilheira dos Andes passa por este país?', 'GEOGRAFIA', '/images/maps/andes.png'),
(3, 'Este país tem saída para o mar (litoral)?', 'GEOGRAFIA', '/images/maps/litoral.png'),
(4, 'A bandeira deste país possui a cor Verde?', 'BANDEIRA', NULL),
(5, 'Este país é banhado pelo Oceano Pacífico?', 'GEOGRAFIA', '/images/maps/oceanos.png'),
(6, 'Este país faz fronteira com o Brasil?', 'GEOGRAFIA', '/images/maps/fronteiras-br.png'),
(7, 'A moeda oficial deste lugar é o Euro?', 'ECONOMIA', '/images/maps/moedas.png'),
(8, 'Este país tem mais de 40 milhões de habitantes?', 'POPULACAO', NULL),
(9, 'A bandeira deste país tem a cor Vermelha?', 'BANDEIRA', NULL),
(10, 'A Linha do Equador corta este país?', 'GEOGRAFIA', '/images/maps/equador.png'),
(11, 'A bandeira deste país possui um símbolo de "Sol"?', 'BANDEIRA', '/images/maps/sol-bandeira.png'),
(12, 'A seleção de futebol masculina deste país já venceu uma Copa do Mundo?', 'CULTURA', NULL),
(13, 'Este país é banhado pelo Mar do Caribe (parte norte)?', 'GEOGRAFIA', '/images/maps/caribe.png'),
(14, 'O idioma oficial é o Inglês?', 'CULTURA', '/images/maps/idiomas.png'),
(15, 'O idioma oficial é o Holandês?', 'CULTURA', '/images/maps/idiomas.png');

-- === 3. GABARITO (CARACTERÍSTICAS) ===

-- Q1: ESPANHOL? (Falso: Brasil, Guiana, Suriname, G. Francesa)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 1, false, 'BR'),
(2, 1, true, 'AR'),
(3, 1, true, 'UY'),
(4, 1, true, 'PY'),
(5, 1, true, 'BO'),
(6, 1, true, 'CL'),
(7, 1, true, 'PE'),
(8, 1, true, 'EC'),
(9, 1, true, 'CO'),
(10, 1, true, 'VE'),
(11, 1, false, 'GY'),
(12, 1, false, 'SR'),
(13, 1, false, 'GF');

-- Q2: TEM ANDES? (Verdadeiro: Ven, Col, Equ, Per, Bol, Chi, Arg)
-- (Esta pergunta separa Uruguai [False] de Peru [True] imediatamente)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 2, false, 'BR'),
(2, 2, true, 'AR'),
(3, 2, false, 'UY'),
(4, 2, false, 'PY'),
(5, 2, true, 'BO'),
(6, 2, true, 'CL'),
(7, 2, true, 'PE'),
(8, 2, true, 'EC'),
(9, 2, true, 'CO'),
(10, 2, true, 'VE'),
(11, 2, false, 'GY'),
(12, 2, false, 'SR'),
(13, 2, false, 'GF');

-- Q3: TEM LITORAL? (Falso: Bolívia, Paraguai)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 3, true, 'BR'),
(2, 3, true, 'AR'),
(3, 3, true, 'UY'),
(4, 3, false, 'PY'),
(5, 3, false, 'BO'),
(6, 3, true, 'CL'),
(7, 3, true, 'PE'),
(8, 3, true, 'EC'),
(9, 3, true, 'CO'),
(10, 3, true, 'VE'),
(11, 3, true, 'GY'),
(12, 3, true, 'SR'),
(13, 3, true, 'GF');

-- Q4: BANDEIRA TEM VERDE? (Verdadeiro: Brasil, Bolívia, Guiana, Suriname)
-- (Considerando bandeiras oficiais nacionais. GF usa a da França = sem verde)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 4, true, 'BR'),
(2, 4, false, 'AR'),
(3, 4, false, 'UY'),
(4, 4, false, 'PY'),
(5, 4, true, 'BO'),
(6, 4, false, 'CL'),
(7, 4, false, 'PE'),
(8, 4, false, 'EC'),
(9, 4, false, 'CO'),
(10, 4, false, 'VE'),
(11, 4, true, 'GY'),
(12, 4, true, 'SR'),
(13, 4, false, 'GF');

-- Q5: BANHADO PELO PACÍFICO? (Verdadeiro: Colômbia, Equador, Peru, Chile)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 5, false, 'BR'),
(2, 5, false, 'AR'),
(3, 5, false, 'UY'),
(4, 5, false, 'PY'),
(5, 5, false, 'BO'),
(6, 5, true, 'CL'),
(7, 5, true, 'PE'),
(8, 5, true, 'EC'),
(9, 5, true, 'CO'),
(10, 5, false, 'VE'),
(11, 5, false, 'GY'),
(12, 5, false, 'SR'),
(13, 5, false, 'GF');

-- Q6: FRONTEIRA COM BRASIL? (Falso: Chile, Equador. Brasil considera-se falso consigo mesmo na lógica do jogo)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 6, false, 'BR'),
(2, 6, true, 'AR'),
(3, 6, true, 'UY'),
(4, 6, true, 'PY'),
(5, 6, true, 'BO'),
(6, 6, false, 'CL'),
(7, 6, true, 'PE'),
(8, 6, false, 'EC'),
(9, 6, true, 'CO'),
(10, 6, true, 'VE'),
(11, 6, true, 'GY'),
(12, 6, true, 'SR'),
(13, 6, true, 'GF');

-- Q7: USA EURO? (Verdadeiro: Só Guiana Francesa)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 7, false, 'BR'),
(2, 7, false, 'AR'),
(3, 7, false, 'UY'),
(4, 7, false, 'PY'),
(5, 7, false, 'BO'),
(6, 7, false, 'CL'),
(7, 7, false, 'PE'),
(8, 7, false, 'EC'),
(9, 7, false, 'CO'),
(10, 7, false, 'VE'),
(11, 7, false, 'GY'),
(12, 7, false, 'SR'),
(13, 7, true, 'GF');

-- Q8: POPULAÇÃO > 40 MILHÕES? (Verdadeiro: Brasil, Colômbia, Argentina)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 8, true, 'BR'),
(2, 8, true, 'AR'),
(3, 8, false, 'UY'),
(4, 8, false, 'PY'),
(5, 8, false, 'BO'),
(6, 8, false, 'CL'),
(7, 8, false, 'PE'),
(8, 8, false, 'EC'),
(9, 8, true, 'CO'),
(10, 8, false, 'VE'),
(11, 8, false, 'GY'),
(12, 8, false, 'SR'),
(13, 8, false, 'GF');

-- Q9: BANDEIRA TEM VERMELHO? (Falso: Brasil, Argentina, Uruguai)
-- (Esta pergunta isola muito bem o Cone Sul Atlântico)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 9, false, 'BR'),
(2, 9, false, 'AR'),
(3, 9, false, 'UY'),
(4, 9, true, 'PY'),
(5, 9, true, 'BO'),
(6, 9, true, 'CL'),
(7, 9, true, 'PE'),
(8, 9, true, 'EC'),
(9, 9, true, 'CO'),
(10, 9, true, 'VE'),
(11, 9, true, 'GY'),
(12, 9, true, 'SR'),
(13, 9, true, 'GF');

-- Q10: CORTADO PELA LINHA DO EQUADOR? (Verdadeiro: Equador, Colômbia, Brasil)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 10, true, 'BR'),
(2, 10, false, 'AR'),
(3, 10, false, 'UY'),
(4, 10, false, 'PY'),
(5, 10, false, 'BO'),
(6, 10, false, 'CL'),
(7, 10, false, 'PE'),
(8, 10, true, 'EC'),
(9, 10, true, 'CO'),
(10, 10, false, 'VE'),
(11, 10, false, 'GY'),
(12, 10, false, 'SR'),
(13, 10, false, 'GF');

-- === Q11: TEM SOL NA BANDEIRA? ===
-- VERDADEIRO: Argentina (2), Uruguai (3).
-- (Nota: Equador e Bolívia têm no brasão pequeno, mas o Sol da Arg/Uru é o elemento principal.
-- Para evitar confusão, vamos considerar TRUE apenas Arg e Uru que é o destaque visual).
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 11, false, 'BR'),
(2, 11, true, 'AR'),
(3, 11, true, 'UY'),
(4, 11, false, 'PY'),
(5, 11, false, 'BO'),
(6, 11, false, 'CL'),
(7, 11, false, 'PE'),
(8, 11, false, 'EC'),
(9, 11, false, 'CO'),
(10, 11, false, 'VE'),
(11, 11, false, 'GY'),
(12, 11, false, 'SR'),
(13, 11, false, 'GF');

-- === Q12: JÁ GANHOU COPA DO MUNDO? ===
-- VERDADEIRO: Brasil (1), Argentina (2), Uruguai (3).
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 12, true, 'BR'),
(2, 12, true, 'AR'),
(3, 12, true, 'UY'),
(4, 12, false, 'PY'),
(5, 12, false, 'BO'),
(6, 12, false, 'CL'),
(7, 12, false, 'PE'),
(8, 12, false, 'EC'),
(9, 12, false, 'CO'),
(10, 12, false, 'VE'),
(11, 12, false, 'GY'),
(12, 12, false, 'SR'),
(13, 12, false, 'GF');

-- === Q13: BANHADO PELO MAR DO CARIBE? ===
-- VERDADEIRO: Colômbia (9), Venezuela (10).
-- (Nota: Guianas são Atlântico Norte, não Caribe tecnicamente).
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 13, false, 'BR'),
(2, 13, false, 'AR'),
(3, 13, false, 'UY'),
(4, 13, false, 'PY'),
(5, 13, false, 'BO'),
(6, 13, false, 'CL'),
(7, 13, false, 'PE'),
(8, 13, false, 'EC'),
(9, 13, true, 'CO'),
(10, 13, true, 'VE'),
(11, 13, false, 'GY'),
(12, 13, false, 'SR'),
(13, 13, false, 'GF');

-- === Q14: FALA INGLÊS? (Guiana) ===
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 14, false, 'BR'),
(2, 14, false, 'AR'),
(3, 14, false, 'UY'),
(4, 14, false, 'PY'),
(5, 14, false, 'BO'),
(6, 14, false, 'CL'),
(7, 14, false, 'PE'),
(8, 14, false, 'EC'),
(9, 14, false, 'CO'),
(10, 14, false, 'VE'),
(11, 14, true, 'GY'),
(12, 14, false, 'SR'),
(13, 14, false, 'GF');

-- === Q15: FALA HOLANDÊS? (Suriname) ===
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1, 15, false, 'BR'),
(2, 15, false, 'AR'),
(3, 15, false, 'UY'),
(4, 15, false, 'PY'),
(5, 15, false, 'BO'),
(6, 15, false, 'CL'),
(7, 15, false, 'PE'),
(8, 15, false, 'EC'),
(9, 15, false, 'CO'),
(10, 15, false, 'VE'),
(11, 15, false, 'GY'),
(12, 15, true, 'SR'),
(13, 15, false, 'GF');