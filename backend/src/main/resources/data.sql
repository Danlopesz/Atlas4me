-- === LIMPEZA ===
DELETE FROM country_features;
DELETE FROM questions;
DELETE FROM countries; -- Cuidado com chaves estrangeiras, talvez precise deletar jogos antes

-- === 1. PAÍSES (13 Guerreiros) ===
INSERT INTO countries (id, name, iso_code, image_url) VALUES 
(1, 'Brasil', 'BR', '/images/countries/br.png'),
(2, 'Argentina', 'AR', '/images/countries/ar.png'),
(3, 'Uruguai', 'UY', '/images/countries/uy.png'),
(4, 'Paraguai', 'PY', '/images/countries/py.png'),
(5, 'Bolívia', 'BO', '/images/countries/bo.png'),
(6, 'Chile', 'CL', '/images/countries/cl.png'),
(7, 'Peru', 'PE', '/images/countries/pe.png'),
(8, 'Equador', 'EC', '/images/countries/ec.png'),
(9, 'Colômbia', 'CO', '/images/countries/co.png'),
(10, 'Venezuela', 'VE', '/images/countries/ve.png'),
(11, 'Guiana', 'GY', '/images/countries/gy.png'),
(12, 'Suriname', 'SR', '/images/countries/sr.png'),
(13, 'Guiana Francesa', 'GF', '/images/countries/gf.png');

-- === 2. PERGUNTAS (Mais simples e diretas) ===
INSERT INTO questions (id, text, category, helper_image_url) VALUES
-- Q1: Idioma Espanhol (Filtra Brasil, Guianas, Suriname)
(1, 'A língua principal falada neste país é o Espanhol?', 'CULTURA', '/images/maps/idiomas.png'),

-- Q2: Fronteira Brasil (Filtra Chile e Equador)
(2, 'Olhando o mapa: Este país faz fronteira com o Brasil?', 'GEOGRAFIA', '/images/maps/fronteiras-br.png'),

-- Q3: Litoral (Filtra Bolívia e Paraguai)
(3, 'Este país tem saída para o mar (litoral)?', 'GEOGRAFIA', '/images/maps/litoral.png'),

-- Q4: Bandeira Amarela (Visual fácil)
(4, 'A bandeira deste país tem a cor Amarela?', 'BANDEIRA', NULL),

-- Q5: Equador (Precisa do mapa)
(5, 'O mapa mostra a Linha do Equador cortando este país?', 'GEOGRAFIA', '/images/maps/equador.png'),

-- Q6: Português (Mata o Brasil)
(6, 'A língua oficial é o Português?', 'CULTURA', '/images/maps/idiomas.png'),

-- Q7: A Bala de Prata da Guiana Francesa (Curiosidade)
(7, 'A moeda oficial deste lugar é o Euro?', 'ECONOMIA', '/images/maps/moedas.png'),

-- Q8: População (Diferencia gigantes de pequenos)
(8, 'Este país tem mais de 40 milhões de habitantes?', 'POPULACAO', NULL),

-- Q9: Nome (Sua ideia sutil!)
(9, 'O nome deste país começa com a letra "A" ou "U"?', 'NOMES', NULL),

-- Q10: Bandeira Vermelha
(10, 'A bandeira deste país tem a cor Vermelha?', 'BANDEIRA', NULL);


-- === 3. GABARITO (CARACTERÍSTICAS) ===

-- Q1: FALA ESPANHOL? (Todos menos BR, GY, SR, GF)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 1, false), (2, 1, true), (3, 1, true), (4, 1, true), (5, 1, true),
(6, 1, true), (7, 1, true), (8, 1, true), (9, 1, true), (10, 1, true),
(11, 1, false), (12, 1, false), (13, 1, false);

-- Q2: FRONTEIRA BRASIL? (Chile e Equador = False)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 2, false), (2, 2, true), (3, 2, true), (4, 2, true), (5, 2, true),
(6, 2, false), (7, 2, true), (8, 2, false), (9, 2, true), (10, 2, true),
(11, 2, true), (12, 2, true), (13, 2, true);

-- Q3: TEM LITORAL? (Bolívia e Paraguai = False)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 3, true), (2, 3, true), (3, 3, true), (4, 3, false), (5, 3, false),
(6, 3, true), (7, 3, true), (8, 3, true), (9, 3, true), (10, 3, true),
(11, 3, true), (12, 3, true), (13, 3, true);

-- Q4: TEM AMARELO? (Chile, Peru, Paraguai, Guiana Fran = False)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 4, true), (2, 4, true), (3, 4, true), (4, 4, false), (5, 4, true),
(6, 4, false), (7, 4, false), (8, 4, true), (9, 4, true), (10, 4, true),
(11, 4, true), (12, 4, true), (13, 4, false);

-- Q5: LINHA DO EQUADOR? (Brasil, Equador, Colômbia = True)
-- (Considerando "corta o país". Venezuela/Guianas ficam ao norte, não são cortadas)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 5, true), (2, 5, false), (3, 5, false), (4, 5, false), (5, 5, false),
(6, 5, false), (7, 5, false), (8, 5, true), (9, 5, true), (10, 5, false),
(11, 5, false), (12, 5, false), (13, 5, false);

-- Q6: FALA PORTUGUÊS? (Só Brasil)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 6, true), (2, 6, false), (3, 6, false), (4, 6, false), (5, 6, false),
(6, 6, false), (7, 6, false), (8, 6, false), (9, 6, false), (10, 6, false),
(11, 6, false), (12, 6, false), (13, 6, false);

-- Q7: USA EURO? (Só Guiana Francesa)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 7, false), (2, 7, false), (3, 7, false), (4, 7, false), (5, 7, false),
(6, 7, false), (7, 7, false), (8, 7, false), (9, 7, false), (10, 7, false),
(11, 7, false), (12, 7, false), (13, 7, true);

-- Q8: POPULAÇÃO > 40 MILHÕES? (Brasil, Colômbia, Argentina)
-- (Dados aprox: BR=215m, CO=51m, AR=46m. O resto é menor)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 8, true), (2, 8, true), (3, 8, false), (4, 8, false), (5, 8, false),
(6, 8, false), (7, 8, false), (8, 8, false), (9, 8, true), (10, 8, false),
(11, 8, false), (12, 8, false), (13, 8, false);

-- Q9: COMEÇA COM "A" ou "U"? (Argentina, Uruguai) - Filtra os do Cone Sul
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 9, false), (2, 9, true), (3, 9, true), (4, 9, false), (5, 9, false),
(6, 9, false), (7, 9, false), (8, 9, false), (9, 9, false), (10, 9, false),
(11, 9, false), (12, 9, false), (13, 9, false);

-- Q10: TEM VERMELHO? (Chile, Peru, Colômbia, Venezuela, Paraguai, Bolívia, Equador, Guiana, Suriname, GF)
-- (NÃO TEM: Brasil, Argentina, Uruguai) -> Ótima pergunta para eliminar o trio do sul!
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 10, false), (2, 10, false), (3, 10, false), 
(4, 10, true), (5, 10, true), (6, 10, true), (7, 10, true), (8, 10, true), 
(9, 10, true), (10, 10, true), (11, 10, true), (12, 10, true), (13, 10, true);