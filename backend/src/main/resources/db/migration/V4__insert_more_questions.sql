-- V4__insert_more_questions_and_features.sql
-- Adiciona 21 novas perguntas (IDs 40 a 60) e mapeia os 36 países

-- =======================================================
-- 1. NOVAS PERGUNTAS (Sem duplicar as 1 a 39)
-- =======================================================
INSERT IGNORE INTO questions (id, text, category, helper_image_url) VALUES
(40, 'O país faz fronteira terrestre com a França?', 'GEOGRAFIA', NULL),
(41, 'O país é banhado pelo Mar Mediterrâneo?', 'GEOGRAFIA', NULL),
(42, 'A Cordilheira dos Alpes passa por este país?', 'GEOGRAFIA', NULL),
(43, 'O território do país é um arquipélago (composto por várias ilhas)?', 'GEOGRAFIA', NULL),
(44, 'A bandeira principal do país possui a cor Azul?', 'BANDEIRA', NULL),
(45, 'A bandeira principal do país possui o desenho de uma ou mais estrelas?', 'BANDEIRA', NULL),
(46, 'O país foi uma das 13 colônias originais que formaram os Estados Unidos?', 'HISTORIA', NULL),
(47, 'O país já fez parte do Império Britânico?', 'HISTORIA', NULL),
(48, 'O país foi um dos membros fundadores da União Europeia?', 'POLITICA', NULL),
(49, 'O país é membro permanente do Conselho de Segurança da ONU?', 'POLITICA', NULL),
(50, 'O Francês é um dos idiomas oficiais deste país?', 'CULTURA', NULL),
(51, 'O Cristianismo é a religião predominante no país?', 'CULTURA', NULL),
(52, 'O país faz parte do grupo econômico BRICS?', 'ECONOMIA', NULL),
(53, 'O país é membro do grupo G7?', 'ECONOMIA', NULL),
(54, 'O país tem uma população superior a 100 milhões de habitantes?', 'POPULACAO', NULL),
(55, 'O país abriga parte da Floresta Amazônica?', 'GEOGRAFIA', NULL),
(56, 'O país é famoso por abrigar as Pirâmides de Gizé?', 'CULTURA', NULL),
(57, 'A Grande Muralha está localizada neste país?', 'CULTURA', NULL),
(58, 'O monumento Taj Mahal fica neste país?', 'CULTURA', NULL),
(59, 'O Trópico de Câncer corta o território deste país?', 'GEOGRAFIA', NULL),
(60, 'O país está localizado no chamado Círculo de Fogo do Pacífico?', 'GEOGRAFIA', NULL);

-- =======================================================
-- 2. GABARITO (CARACTERÍSTICAS GLOBAIS)
-- Países 1-13 (América do Sul), 14:US, 15:CA, 16:MX, 17:DE, 18:FR, 19:ES, 20:CH,
-- 21:IT, 22:GB, 23:RU, 24:CN, 25:IN, 26:JP, 27:KR, 28:TH, 29:ID, 30:NZ,
-- 31:EG, 32:ZA, 33:TR, 34:AU, 35:NG, 36:SA
-- =======================================================

-- Q40: Fronteira com a França (BR, DE, ES, CH, IT)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1,40,true,'BR'),(2,40,false,'AR'),(3,40,false,'UY'),(4,40,false,'PY'),(5,40,false,'BO'),(6,40,false,'CL'),(7,40,false,'PE'),(8,40,false,'EC'),(9,40,false,'CO'),(10,40,false,'VE'),(11,40,false,'GY'),(12,40,false,'SR'),(13,40,false,'GF'),(14,40,false,'US'),(15,40,false,'CA'),(16,40,false,'MX'),(17,40,true,'DE'),(18,40,false,'FR'),(19,40,true,'ES'),(20,40,true,'CH'),(21,40,true,'IT'),(22,40,false,'GB'),(23,40,false,'RU'),(24,40,false,'CN'),(25,40,false,'IN'),(26,40,false,'JP'),(27,40,false,'KR'),(28,40,false,'TH'),(29,40,false,'ID'),(30,40,false,'NZ'),(31,40,false,'EG'),(32,40,false,'ZA'),(33,40,false,'TR'),(34,40,false,'AU'),(35,40,false,'NG'),(36,40,false,'SA');

-- Q41: Mar Mediterrâneo (ES, FR, IT, EG, TR)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,41,false,'BR'),(2,41,false,'AR'),(3,41,false,'UY'),(4,41,false,'PY'),(5,41,false,'BO'),(6,41,false,'CL'),(7,41,false,'PE'),(8,41,false,'EC'),(9,41,false,'CO'),(10,41,false,'VE'),(11,41,false,'GY'),(12,41,false,'SR'),(13,41,false,'GF'),(14,41,false,'US'),(15,41,false,'CA'),(16,41,false,'MX'),(17,41,false,'DE'),(18,41,true,'FR'),(19,41,true,'ES'),(20,41,false,'CH'),(21,41,true,'IT'),(22,41,false,'GB'),(23,41,false,'RU'),(24,41,false,'CN'),(25,41,false,'IN'),(26,41,false,'JP'),(27,41,false,'KR'),(28,41,false,'TH'),(29,41,false,'ID'),(30,41,false,'NZ'),(31,41,true,'EG'),(32,41,false,'ZA'),(33,41,true,'TR'),(34,41,false,'AU'),(35,41,false,'NG'),(36,41,false,'SA');

-- Q42: Alpes (DE, FR, CH, IT)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,42,false,'BR'),(2,42,false,'AR'),(3,42,false,'UY'),(4,42,false,'PY'),(5,42,false,'BO'),(6,42,false,'CL'),(7,42,false,'PE'),(8,42,false,'EC'),(9,42,false,'CO'),(10,42,false,'VE'),(11,42,false,'GY'),(12,42,false,'SR'),(13,42,false,'GF'),(14,42,false,'US'),(15,42,false,'CA'),(16,42,false,'MX'),(17,42,true,'DE'),(18,42,true,'FR'),(19,42,false,'ES'),(20,42,true,'CH'),(21,42,true,'IT'),(22,42,false,'GB'),(23,42,false,'RU'),(24,42,false,'CN'),(25,42,false,'IN'),(26,42,false,'JP'),(27,42,false,'KR'),(28,42,false,'TH'),(29,42,false,'ID'),(30,42,false,'NZ'),(31,42,false,'EG'),(32,42,false,'ZA'),(33,42,false,'TR'),(34,42,false,'AU'),(35,42,false,'NG'),(36,42,false,'SA');

-- Q43: Arquipélago (GB, JP, ID, NZ)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,43,false,'BR'),(2,43,false,'AR'),(3,43,false,'UY'),(4,43,false,'PY'),(5,43,false,'BO'),(6,43,false,'CL'),(7,43,false,'PE'),(8,43,false,'EC'),(9,43,false,'CO'),(10,43,false,'VE'),(11,43,false,'GY'),(12,43,false,'SR'),(13,43,false,'GF'),(14,43,false,'US'),(15,43,false,'CA'),(16,43,false,'MX'),(17,43,false,'DE'),(18,43,false,'FR'),(19,43,false,'ES'),(20,43,false,'CH'),(21,43,false,'IT'),(22,43,true,'GB'),(23,43,false,'RU'),(24,43,false,'CN'),(25,43,false,'IN'),(26,43,true,'JP'),(27,43,false,'KR'),(28,43,false,'TH'),(29,43,true,'ID'),(30,43,true,'NZ'),(31,43,false,'EG'),(32,43,false,'ZA'),(33,43,false,'TR'),(34,43,false,'AU'),(35,43,false,'NG'),(36,43,false,'SA');

-- Q44: Bandeira Azul (BR, AR, UY, PY, CL, CO, VE, US, FR, GB, RU, IN, TH, KR, NZ, ZA, AU)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,44,true,'BR'),(2,44,true,'AR'),(3,44,true,'UY'),(4,44,true,'PY'),(5,44,false,'BO'),(6,44,true,'CL'),(7,44,false,'PE'),(8,44,true,'EC'),(9,44,true,'CO'),(10,44,true,'VE'),(11,44,false,'GY'),(12,44,false,'SR'),(13,44,false,'GF'),(14,44,true,'US'),(15,44,false,'CA'),(16,44,false,'MX'),(17,44,false,'DE'),(18,44,true,'FR'),(19,44,false,'ES'),(20,44,false,'CH'),(21,44,false,'IT'),(22,44,true,'GB'),(23,44,true,'RU'),(24,44,false,'CN'),(25,44,true,'IN'),(26,44,false,'JP'),(27,44,true,'KR'),(28,44,true,'TH'),(29,44,false,'ID'),(30,44,true,'NZ'),(31,44,false,'EG'),(32,44,true,'ZA'),(33,44,false,'TR'),(34,44,true,'AU'),(35,44,false,'NG'),(36,44,false,'SA');

-- Q45: Estrela na Bandeira (BR, PY, CL, VE, SR, GF, US, CN, NZ, TR, AU)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,45,true,'BR'),(2,45,false,'AR'),(3,45,false,'UY'),(4,45,true,'PY'),(5,45,false,'BO'),(6,45,true,'CL'),(7,45,false,'PE'),(8,45,false,'EC'),(9,45,false,'CO'),(10,45,true,'VE'),(11,45,false,'GY'),(12,45,true,'SR'),(13,45,true,'GF'),(14,45,true,'US'),(15,45,false,'CA'),(16,45,false,'MX'),(17,45,false,'DE'),(18,45,false,'FR'),(19,45,false,'ES'),(20,45,false,'CH'),(21,45,false,'IT'),(22,45,false,'GB'),(23,45,false,'RU'),(24,45,true,'CN'),(25,45,false,'IN'),(26,45,false,'JP'),(27,45,false,'KR'),(28,45,false,'TH'),(29,45,false,'ID'),(30,45,true,'NZ'),(31,45,false,'EG'),(32,45,false,'ZA'),(33,45,true,'TR'),(34,45,true,'AU'),(35,45,false,'NG'),(36,45,false,'SA');

-- Q46: 13 Colônias (US)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,46,false,'BR'),(2,46,false,'AR'),(3,46,false,'UY'),(4,46,false,'PY'),(5,46,false,'BO'),(6,46,false,'CL'),(7,46,false,'PE'),(8,46,false,'EC'),(9,46,false,'CO'),(10,46,false,'VE'),(11,46,false,'GY'),(12,46,false,'SR'),(13,46,false,'GF'),(14,46,true,'US'),(15,46,false,'CA'),(16,46,false,'MX'),(17,46,false,'DE'),(18,46,false,'FR'),(19,46,false,'ES'),(20,46,false,'CH'),(21,46,false,'IT'),(22,46,false,'GB'),(23,46,false,'RU'),(24,46,false,'CN'),(25,46,false,'IN'),(26,46,false,'JP'),(27,46,false,'KR'),(28,46,false,'TH'),(29,46,false,'ID'),(30,46,false,'NZ'),(31,46,false,'EG'),(32,46,false,'ZA'),(33,46,false,'TR'),(34,46,false,'AU'),(35,46,false,'NG'),(36,46,false,'SA');

-- Q47: Ex-Império Britânico (GY, US, CA, IN, NG, ZA, AU, NZ)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,47,false,'BR'),(2,47,false,'AR'),(3,47,false,'UY'),(4,47,false,'PY'),(5,47,false,'BO'),(6,47,false,'CL'),(7,47,false,'PE'),(8,47,false,'EC'),(9,47,false,'CO'),(10,47,false,'VE'),(11,47,true,'GY'),(12,47,false,'SR'),(13,47,false,'GF'),(14,47,true,'US'),(15,47,true,'CA'),(16,47,false,'MX'),(17,47,false,'DE'),(18,47,false,'FR'),(19,47,false,'ES'),(20,47,false,'CH'),(21,47,false,'IT'),(22,47,false,'GB'),(23,47,false,'RU'),(24,47,false,'CN'),(25,47,true,'IN'),(26,47,false,'JP'),(27,47,false,'KR'),(28,47,false,'TH'),(29,47,false,'ID'),(30,47,true,'NZ'),(31,47,false,'EG'),(32,47,true,'ZA'),(33,47,false,'TR'),(34,47,true,'AU'),(35,47,true,'NG'),(36,47,false,'SA');

-- Q48: Fundador UE (DE, FR, IT)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,48,false,'BR'),(2,48,false,'AR'),(3,48,false,'UY'),(4,48,false,'PY'),(5,48,false,'BO'),(6,48,false,'CL'),(7,48,false,'PE'),(8,48,false,'EC'),(9,48,false,'CO'),(10,48,false,'VE'),(11,48,false,'GY'),(12,48,false,'SR'),(13,48,false,'GF'),(14,48,false,'US'),(15,48,false,'CA'),(16,48,false,'MX'),(17,48,true,'DE'),(18,48,true,'FR'),(19,48,false,'ES'),(20,48,false,'CH'),(21,48,true,'IT'),(22,48,false,'GB'),(23,48,false,'RU'),(24,48,false,'CN'),(25,48,false,'IN'),(26,48,false,'JP'),(27,48,false,'KR'),(28,48,false,'TH'),(29,48,false,'ID'),(30,48,false,'NZ'),(31,48,false,'EG'),(32,48,false,'ZA'),(33,48,false,'TR'),(34,48,false,'AU'),(35,48,false,'NG'),(36,48,false,'SA');

-- Q49: Membro Permanente ONU (US, GB, FR, RU, CN)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,49,false,'BR'),(2,49,false,'AR'),(3,49,false,'UY'),(4,49,false,'PY'),(5,49,false,'BO'),(6,49,false,'CL'),(7,49,false,'PE'),(8,49,false,'EC'),(9,49,false,'CO'),(10,49,false,'VE'),(11,49,false,'GY'),(12,49,false,'SR'),(13,49,false,'GF'),(14,49,true,'US'),(15,49,false,'CA'),(16,49,false,'MX'),(17,49,false,'DE'),(18,49,true,'FR'),(19,49,false,'ES'),(20,49,false,'CH'),(21,49,false,'IT'),(22,49,true,'GB'),(23,49,true,'RU'),(24,49,true,'CN'),(25,49,false,'IN'),(26,49,false,'JP'),(27,49,false,'KR'),(28,49,false,'TH'),(29,49,false,'ID'),(30,49,false,'NZ'),(31,49,false,'EG'),(32,49,false,'ZA'),(33,49,false,'TR'),(34,49,false,'AU'),(35,49,false,'NG'),(36,49,false,'SA');

-- Q50: Francês Oficial (FR, CA, CH, GF)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,50,false,'BR'),(2,50,false,'AR'),(3,50,false,'UY'),(4,50,false,'PY'),(5,50,false,'BO'),(6,50,false,'CL'),(7,50,false,'PE'),(8,50,false,'EC'),(9,50,false,'CO'),(10,50,false,'VE'),(11,50,false,'GY'),(12,50,false,'SR'),(13,50,true,'GF'),(14,50,false,'US'),(15,50,true,'CA'),(16,50,false,'MX'),(17,50,false,'DE'),(18,50,true,'FR'),(19,50,false,'ES'),(20,50,true,'CH'),(21,50,false,'IT'),(22,50,false,'GB'),(23,50,false,'RU'),(24,50,false,'CN'),(25,50,false,'IN'),(26,50,false,'JP'),(27,50,false,'KR'),(28,50,false,'TH'),(29,50,false,'ID'),(30,50,false,'NZ'),(31,50,false,'EG'),(32,50,false,'ZA'),(33,50,false,'TR'),(34,50,false,'AU'),(35,50,false,'NG'),(36,50,false,'SA');

-- Q51: Cristianismo Predominante (Américas, Europa, ZA, AU, NZ)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,51,true,'BR'),(2,51,true,'AR'),(3,51,true,'UY'),(4,51,true,'PY'),(5,51,true,'BO'),(6,51,true,'CL'),(7,51,true,'PE'),(8,51,true,'EC'),(9,51,true,'CO'),(10,51,true,'VE'),(11,51,true,'GY'),(12,51,true,'SR'),(13,51,true,'GF'),(14,51,true,'US'),(15,51,true,'CA'),(16,51,true,'MX'),(17,51,true,'DE'),(18,51,true,'FR'),(19,51,true,'ES'),(20,51,true,'CH'),(21,51,true,'IT'),(22,51,true,'GB'),(23,51,true,'RU'),(24,51,false,'CN'),(25,51,false,'IN'),(26,51,false,'JP'),(27,51,false,'KR'),(28,51,false,'TH'),(29,51,false,'ID'),(30,51,true,'NZ'),(31,51,false,'EG'),(32,51,true,'ZA'),(33,51,false,'TR'),(34,51,true,'AU'),(35,51,false,'NG'),(36,51,false,'SA');

-- Q52: BRICS (BR, RU, IN, CN, ZA, EG)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,52,true,'BR'),(2,52,false,'AR'),(3,52,false,'UY'),(4,52,false,'PY'),(5,52,false,'BO'),(6,52,false,'CL'),(7,52,false,'PE'),(8,52,false,'EC'),(9,52,false,'CO'),(10,52,false,'VE'),(11,52,false,'GY'),(12,52,false,'SR'),(13,52,false,'GF'),(14,52,false,'US'),(15,52,false,'CA'),(16,52,false,'MX'),(17,52,false,'DE'),(18,52,false,'FR'),(19,52,false,'ES'),(20,52,false,'CH'),(21,52,false,'IT'),(22,52,false,'GB'),(23,52,true,'RU'),(24,52,true,'CN'),(25,52,true,'IN'),(26,52,false,'JP'),(27,52,false,'KR'),(28,52,false,'TH'),(29,52,false,'ID'),(30,52,false,'NZ'),(31,52,true,'EG'),(32,52,true,'ZA'),(33,52,false,'TR'),(34,52,false,'AU'),(35,52,false,'NG'),(36,52,false,'SA');

-- Q53: G7 (US, CA, DE, FR, IT, GB, JP)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,53,false,'BR'),(2,53,false,'AR'),(3,53,false,'UY'),(4,53,false,'PY'),(5,53,false,'BO'),(6,53,false,'CL'),(7,53,false,'PE'),(8,53,false,'EC'),(9,53,false,'CO'),(10,53,false,'VE'),(11,53,false,'GY'),(12,53,false,'SR'),(13,53,false,'GF'),(14,53,true,'US'),(15,53,true,'CA'),(16,53,false,'MX'),(17,53,true,'DE'),(18,53,true,'FR'),(19,53,false,'ES'),(20,53,false,'CH'),(21,53,true,'IT'),(22,53,true,'GB'),(23,53,false,'RU'),(24,53,false,'CN'),(25,53,false,'IN'),(26,53,true,'JP'),(27,53,false,'KR'),(28,53,false,'TH'),(29,53,false,'ID'),(30,53,false,'NZ'),(31,53,false,'EG'),(32,53,false,'ZA'),(33,53,false,'TR'),(34,53,false,'AU'),(35,53,false,'NG'),(36,53,false,'SA');

-- Q54: População > 100M (BR, US, MX, RU, CN, IN, JP, ID, EG, NG)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,54,true,'BR'),(2,54,false,'AR'),(3,54,false,'UY'),(4,54,false,'PY'),(5,54,false,'BO'),(6,54,false,'CL'),(7,54,false,'PE'),(8,54,false,'EC'),(9,54,false,'CO'),(10,54,false,'VE'),(11,54,false,'GY'),(12,54,false,'SR'),(13,54,false,'GF'),(14,54,true,'US'),(15,54,false,'CA'),(16,54,true,'MX'),(17,54,false,'DE'),(18,54,false,'FR'),(19,54,false,'ES'),(20,54,false,'CH'),(21,54,false,'IT'),(22,54,false,'GB'),(23,54,true,'RU'),(24,54,true,'CN'),(25,54,true,'IN'),(26,54,true,'JP'),(27,54,false,'KR'),(28,54,false,'TH'),(29,54,true,'ID'),(30,54,false,'NZ'),(31,54,true,'EG'),(32,54,false,'ZA'),(33,54,false,'TR'),(34,54,false,'AU'),(35,54,true,'NG'),(36,54,false,'SA');

-- Q55: Floresta Amazônica (BR, BO, PE, EC, CO, VE, GY, SR, GF)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,55,true,'BR'),(2,55,false,'AR'),(3,55,false,'UY'),(4,55,false,'PY'),(5,55,true,'BO'),(6,55,false,'CL'),(7,55,true,'PE'),(8,55,true,'EC'),(9,55,true,'CO'),(10,55,true,'VE'),(11,55,true,'GY'),(12,55,true,'SR'),(13,55,true,'GF'),(14,55,false,'US'),(15,55,false,'CA'),(16,55,false,'MX'),(17,55,false,'DE'),(18,55,false,'FR'),(19,55,false,'ES'),(20,55,false,'CH'),(21,55,false,'IT'),(22,55,false,'GB'),(23,55,false,'RU'),(24,55,false,'CN'),(25,55,false,'IN'),(26,55,false,'JP'),(27,55,false,'KR'),(28,55,false,'TH'),(29,55,false,'ID'),(30,55,false,'NZ'),(31,55,false,'EG'),(32,55,false,'ZA'),(33,55,false,'TR'),(34,55,false,'AU'),(35,55,false,'NG'),(36,55,false,'SA');

-- Q56: Pirâmides de Gizé (EG)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,56,false,'BR'),(2,56,false,'AR'),(3,56,false,'UY'),(4,56,false,'PY'),(5,56,false,'BO'),(6,56,false,'CL'),(7,56,false,'PE'),(8,56,false,'EC'),(9,56,false,'CO'),(10,56,false,'VE'),(11,56,false,'GY'),(12,56,false,'SR'),(13,56,false,'GF'),(14,56,false,'US'),(15,56,false,'CA'),(16,56,false,'MX'),(17,56,false,'DE'),(18,56,false,'FR'),(19,56,false,'ES'),(20,56,false,'CH'),(21,56,false,'IT'),(22,56,false,'GB'),(23,56,false,'RU'),(24,56,false,'CN'),(25,56,false,'IN'),(26,56,false,'JP'),(27,56,false,'KR'),(28,56,false,'TH'),(29,56,false,'ID'),(30,56,false,'NZ'),(31,56,true,'EG'),(32,56,false,'ZA'),(33,56,false,'TR'),(34,56,false,'AU'),(35,56,false,'NG'),(36,56,false,'SA');

-- Q57: Grande Muralha (CN)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,57,false,'BR'),(2,57,false,'AR'),(3,57,false,'UY'),(4,57,false,'PY'),(5,57,false,'BO'),(6,57,false,'CL'),(7,57,false,'PE'),(8,57,false,'EC'),(9,57,false,'CO'),(10,57,false,'VE'),(11,57,false,'GY'),(12,57,false,'SR'),(13,57,false,'GF'),(14,57,false,'US'),(15,57,false,'CA'),(16,57,false,'MX'),(17,57,false,'DE'),(18,57,false,'FR'),(19,57,false,'ES'),(20,57,false,'CH'),(21,57,false,'IT'),(22,57,false,'GB'),(23,57,false,'RU'),(24,57,true,'CN'),(25,57,false,'IN'),(26,57,false,'JP'),(27,57,false,'KR'),(28,57,false,'TH'),(29,57,false,'ID'),(30,57,false,'NZ'),(31,57,false,'EG'),(32,57,false,'ZA'),(33,57,false,'TR'),(34,57,false,'AU'),(35,57,false,'NG'),(36,57,false,'SA');

-- Q58: Taj Mahal (IN)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,58,false,'BR'),(2,58,false,'AR'),(3,58,false,'UY'),(4,58,false,'PY'),(5,58,false,'BO'),(6,58,false,'CL'),(7,58,false,'PE'),(8,58,false,'EC'),(9,58,false,'CO'),(10,58,false,'VE'),(11,58,false,'GY'),(12,58,false,'SR'),(13,58,false,'GF'),(14,58,false,'US'),(15,58,false,'CA'),(16,58,false,'MX'),(17,58,false,'DE'),(18,58,false,'FR'),(19,58,false,'ES'),(20,58,false,'CH'),(21,58,false,'IT'),(22,58,false,'GB'),(23,58,false,'RU'),(24,58,false,'CN'),(25,58,true,'IN'),(26,58,false,'JP'),(27,58,false,'KR'),(28,58,false,'TH'),(29,58,false,'ID'),(30,58,false,'NZ'),(31,58,false,'EG'),(32,58,false,'ZA'),(33,58,false,'TR'),(34,58,false,'AU'),(35,58,false,'NG'),(36,58,false,'SA');

-- Q59: Trópico de Câncer (MX, EG, IN, CN, SA)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
 (1,59,false,'BR'),(2,59,false,'AR'),(3,59,false,'UY'),(4,59,false,'PY'),(5,59,false,'BO'),(6,59,false,'CL'),(7,59,false,'PE'),(8,59,false,'EC'),(9,59,false,'CO'),(10,59,false,'VE'),(11,59,false,'GY'),(12,59,false,'SR'),(13,59,false,'GF'),(14,59,false,'US'),(15,59,false,'CA'),(16,59,true,'MX'),(17,59,false,'DE'),(18,59,false,'FR'),(19,59,false,'ES'),(20,59,false,'CH'),(21,59,false,'IT'),(22,59,false,'GB'),(23,59,false,'RU'),(24,59,true,'CN'),(25,59,true,'IN'),(26,59,false,'JP'),(27,59,false,'KR'),(28,59,false,'TH'),(29,59,false,'ID'),(30,59,false,'NZ'),(31,59,true,'EG'),(32,59,false,'ZA'),(33,59,false,'TR'),(34,59,false,'AU'),(35,59,false,'NG'),(36,59,true,'SA');

-- Q60: Círculo de Fogo do Pacífico (CL, PE, EC, CO, US, CA, MX, RU, JP, ID, NZ)
INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES
(1,60,false,'BR'),(2,60,false,'AR'),(3,60,false,'UY'),(4,60,false,'PY'),(5,60,false,'BO'),(6,60,true,'CL'),(7,60,true,'PE'),(8,60,true,'EC'),(9,60,true,'CO'),(10,60,false,'VE'),(11,60,false,'GY'),(12,60,false,'SR'),(13,60,false,'GF'),(14,60,true,'US'),(15,60,true,'CA'),(16,60,true,'MX'),(17,60,false,'DE'),(18,60,false,'FR'),(19,60,false,'ES'),(20,60,false,'CH'),(21,60,false,'IT'),(22,60,false,'GB'),(23,60,true,'RU'),(24,60,false,'CN'),(25,60,false,'IN'),(26,60,true,'JP'),(27,60,false,'KR'),(28,60,false,'TH'),(29,60,true,'ID'),(30,60,true,'NZ'),(31,60,false,'EG'),(32,60,false,'ZA'),(33,60,false,'TR'),(34,60,false,'AU'),(35,60,false,'NG'),(36,60,false,'SA');