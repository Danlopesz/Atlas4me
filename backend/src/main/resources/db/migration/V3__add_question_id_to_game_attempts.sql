-- Adiciona a coluna que está faltando
ALTER TABLE game_attempts ADD COLUMN question_id BIGINT;

-- (Opcional, mas recomendado) Adiciona a chave estrangeira para garantir integridade
-- Certifique-se que o nome da tabela de perguntas é 'question' ou 'questions' no seu banco.
-- Pelo seu log anterior, parece ser 'question' (singular) ou 'questions' (plural).
-- Vou assumir 'question'. Se der erro, mude para 'questions'.

ALTER TABLE game_attempts 
ADD CONSTRAINT fk_game_attempts_question 
FOREIGN KEY (question_id) REFERENCES questions(id);