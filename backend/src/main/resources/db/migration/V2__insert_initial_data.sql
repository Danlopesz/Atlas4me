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

INSERT INTO questions (id, text, category, helper_image_url) VALUES
-- Q1: Cultura (Divide Brasil e Guianas do resto)
(1, 'A língua principal falada neste país é o Espanhol?', 'CULTURA', '/images/maps/idiomas.png'),

-- Q2: Geografia (O Grande Divisor da América do Sul)
(2, 'A Cordilheira dos Andes passa por este país?', 'GEOGRAFIA', '/images/maps/andes.png'),

-- Q3: Geografia (Litoral vs Interior)
(3, 'Este país tem saída para o mar (litoral)?', 'GEOGRAFIA', '/images/maps/litoral.png'),

-- Q4: Bandeira (Verde é melhor que Amarelo para distinguir)
(4, 'A bandeira deste país possui a cor Verde?', 'BANDEIRA', NULL),

-- Q5: Geografia (Pacífico vs Atlântico - CRUCIAL para Peru vs Uruguai)
(5, 'Este país é banhado pelo Oceano Pacífico?', 'GEOGRAFIA', '/images/maps/oceanos.png'),

-- Q6: Geografia (Fronteiras)
(6, 'Este país faz fronteira com o Brasil?', 'GEOGRAFIA', '/images/maps/fronteiras-br.png'),

-- Q7: Economia (A "Bala de Prata" da Guiana Francesa)
(7, 'A moeda oficial deste lugar é o Euro?', 'ECONOMIA', '/images/maps/moedas.png'),

-- Q8: População (Diferencia os gigantes)
(8, 'Este país tem mais de 40 milhões de habitantes?', 'POPULACAO', NULL),

-- Q9: Bandeira (Vermelho é muito comum, bom para agrupar)
(9, 'A bandeira deste país tem a cor Vermelha?', 'BANDEIRA', NULL),

-- Q10: Geografia (Linha do Equador)
(10, 'A Linha do Equador corta este país?', 'GEOGRAFIA', '/images/maps/equador.png'),

-- Q11: O "Sol de Maio" (Mata a charada entre Argentina/Uruguai vs o resto)
(11, 'A bandeira deste país possui um símbolo de "Sol"?', 'BANDEIRA', '/images/maps/sol-bandeira.png'),

-- Q12: Futebol (Separa os campeões tradicionais: Brasil, Argentina, Uruguai)
(12, 'A seleção de futebol masculina deste país já venceu uma Copa do Mundo?', 'CULTURA', NULL),

-- Q13: Caribe (Separa Venezuela e Colômbia do resto do continente)
(13, 'Este país é banhado pelo Mar do Caribe (parte norte)?', 'GEOGRAFIA', '/images/maps/caribe.png'),

-- Q14: Estrelas na Bandeira (Chile, Venezuela, Suriname, Brasil, Honduras...)
(14, 'A bandeira tem uma ou mais estrelas?', 'BANDEIRA', NULL),

-- Q15: Língua Inglesa (A "Bala de Prata" da Guiana)
(15, 'O idioma oficial é o Inglês?', 'CULTURA', '/images/maps/idiomas.png'),

-- Q16: Língua Holandesa (A "Bala de Prata" do Suriname)
(16, 'O idioma oficial é o Holandês?', 'CULTURA', '/images/maps/idiomas.png');
-- === 3. GABARITO (CARACTERÍSTICAS) ===

-- Q1: ESPANHOL? (Falso: Brasil, Guiana, Suriname, G. Francesa)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 1, false), (2, 1, true), (3, 1, true), (4, 1, true), (5, 1, true),
(6, 1, true), (7, 1, true), (8, 1, true), (9, 1, true), (10, 1, true),
(11, 1, false), (12, 1, false), (13, 1, false);

-- Q2: TEM ANDES? (Verdadeiro: Ven, Col, Equ, Per, Bol, Chi, Arg)
-- (Esta pergunta separa Uruguai [False] de Peru [True] imediatamente)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 2, false), (2, 2, true), (3, 2, false), (4, 2, false), (5, 2, true),
(6, 2, true), (7, 2, true), (8, 2, true), (9, 2, true), (10, 2, true),
(11, 2, false), (12, 2, false), (13, 2, false);

-- Q3: TEM LITORAL? (Falso: Bolívia, Paraguai)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 3, true), (2, 3, true), (3, 3, true), (4, 3, false), (5, 3, false),
(6, 3, true), (7, 3, true), (8, 3, true), (9, 3, true), (10, 3, true),
(11, 3, true), (12, 3, true), (13, 3, true);

-- Q4: BANDEIRA TEM VERDE? (Verdadeiro: Brasil, Bolívia, Guiana, Suriname)
-- (Considerando bandeiras oficiais nacionais. GF usa a da França = sem verde)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 4, true), (2, 4, false), (3, 4, false), (4, 4, false), (5, 4, true),
(6, 4, false), (7, 4, false), (8, 4, false), (9, 4, false), (10, 4, false),
(11, 4, true), (12, 4, true), (13, 4, false);

-- Q5: BANHADO PELO PACÍFICO? (Verdadeiro: Colômbia, Equador, Peru, Chile)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 5, false), (2, 5, false), (3, 5, false), (4, 5, false), (5, 5, false),
(6, 5, true), (7, 5, true), (8, 5, true), (9, 5, true), (10, 5, false), 
(11, 5, false), (12, 5, false), (13, 5, false);

-- Q6: FRONTEIRA COM BRASIL? (Falso: Chile, Equador. Brasil considera-se falso consigo mesmo na lógica do jogo)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 6, false), (2, 6, true), (3, 6, true), (4, 6, true), (5, 6, true),
(6, 6, false), (7, 6, true), (8, 6, false), (9, 6, true), (10, 6, true),
(11, 6, true), (12, 6, true), (13, 6, true);

-- Q7: USA EURO? (Verdadeiro: Só Guiana Francesa)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 7, false), (2, 7, false), (3, 7, false), (4, 7, false), (5, 7, false),
(6, 7, false), (7, 7, false), (8, 7, false), (9, 7, false), (10, 7, false),
(11, 7, false), (12, 7, false), (13, 7, true);

-- Q8: POPULAÇÃO > 40 MILHÕES? (Verdadeiro: Brasil, Colômbia, Argentina)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 8, true), (2, 8, true), (3, 8, false), (4, 8, false), (5, 8, false),
(6, 8, false), (7, 8, false), (8, 8, false), (9, 8, true), (10, 8, false),
(11, 8, false), (12, 8, false), (13, 8, false);

-- Q9: BANDEIRA TEM VERMELHO? (Falso: Brasil, Argentina, Uruguai)
-- (Esta pergunta isola muito bem o Cone Sul Atlântico)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 9, false), (2, 9, false), (3, 9, false), 
(4, 9, true), (5, 9, true), (6, 9, true), (7, 9, true), (8, 9, true), 
(9, 9, true), (10, 9, true), (11, 9, true), (12, 9, true), (13, 9, true);

-- Q10: CORTADO PELA LINHA DO EQUADOR? (Verdadeiro: Equador, Colômbia, Brasil)
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 10, true), (2, 10, false), (3, 10, false), (4, 10, false), (5, 10, false),
(6, 10, false), (7, 10, false), (8, 10, true), (9, 10, true), (10, 10, false),
(11, 10, false), (12, 10, false), (13, 10, false);

-- === Q11: TEM SOL NA BANDEIRA? ===
-- VERDADEIRO: Argentina (2), Uruguai (3).
-- (Nota: Equador e Bolívia têm no brasão pequeno, mas o Sol da Arg/Uru é o elemento principal.
-- Para evitar confusão, vamos considerar TRUE apenas Arg e Uru que é o destaque visual).
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 11, false), (2, 11, true), (3, 11, true), (4, 11, false), (5, 11, false),
(6, 11, false), (7, 11, false), (8, 11, false), (9, 11, false), (10, 11, false),
(11, 11, false), (12, 11, false), (13, 11, false);

-- === Q12: JÁ GANHOU COPA DO MUNDO? ===
-- VERDADEIRO: Brasil (1), Argentina (2), Uruguai (3).
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 12, true), (2, 12, true), (3, 12, true), (4, 12, false), (5, 12, false),
(6, 12, false), (7, 12, false), (8, 12, false), (9, 12, false), (10, 12, false),
(11, 12, false), (12, 12, false), (13, 12, false);

-- === Q13: BANHADO PELO MAR DO CARIBE? ===
-- VERDADEIRO: Colômbia (9), Venezuela (10).
-- (Nota: Guianas são Atlântico Norte, não Caribe tecnicamente).
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 13, false), (2, 13, false), (3, 13, false), (4, 13, false), (5, 13, false),
(6, 13, false), (7, 13, false), (8, 13, false), (9, 13, true), (10, 13, true),
(11, 13, false), (12, 13, false), (13, 13, false);

-- === Q14: TEM ESTRELA(S) NA BANDEIRA? ===
-- VERDADEIRO: Brasil (1), Paraguai (4), Chile (6), Venezuela (10), Suriname (12), Guiana Francesa (13 - depende da bandeira, mas a oficial da frança não, a independentista sim. Vamos por FALSE pois usa-se a da França oficialmente).
-- Chile (1 estrela), Venezuela (arco de estrelas), Suriname (1 estrela amarela), Paraguai (tem estrela no brasão central).
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 14, true), (2, 14, false), (3, 14, false), (4, 14, true), (5, 14, false),
(6, 14, true), (7, 14, false), (8, 14, false), (9, 14, false), (10, 14, true),
(11, 14, false), (12, 14, true), (13, 14, false);

-- === Q15: FALA INGLÊS? (Guiana) ===
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 15, false), (2, 15, false), (3, 15, false), (4, 15, false), (5, 15, false),
(6, 15, false), (7, 15, false), (8, 15, false), (9, 15, false), (10, 15, false),
(11, 15, true), (12, 15, false), (13, 15, false);

-- === Q16: FALA HOLANDÊS? (Suriname) ===
INSERT INTO country_features (country_id, question_id, is_true) VALUES
(1, 16, false), (2, 16, false), (3, 16, false), (4, 16, false), (5, 16, false),
(6, 16, false), (7, 16, false), (8, 16, false), (9, 16, false), (10, 16, false),
(11, 16, false), (12, 16, true), (13, 16, false);