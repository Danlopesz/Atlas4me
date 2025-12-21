package atlas4me.service;

import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.response.GameResponse;
import atlas4me.dto.response.QuestionResponse;
// Certifique-se de importar o Enum correto
import atlas4me.entity.*;
import atlas4me.exception.BusinessException;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameSessionRepository gameSessionRepository;
    private final GameAttemptRepository gameAttemptRepository;
    private final UserRepository userRepository;

    // Novos Repositories necessários para a lógica do Robô
    private final QuestionRepository questionRepository;
    private final CountryRepository countryRepository;
    private final CountryFeatureRepository countryFeatureRepository;

    // --- INÍCIO DO JOGO ---
    // --- INÍCIO DO JOGO ---
    @Transactional
    public GameResponse startNewGame(String userEmail) {
        User user = getUserOrThrow(userEmail);

        // MUDANÇA AQUI:
        // Em vez de dar erro se tiver jogo, nós ENCERRANOS o jogo velho.
        // Assim o usuário sempre começa "do zero" como você pediu.
        gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                .ifPresent(oldSession -> {
                    oldSession.setStatus(GameStatus.ROBOT_WON); // O Robô ganha por W.O. (abandono)
                    oldSession.setFinishedAt(LocalDateTime.now());
                    gameSessionRepository.save(oldSession);
                });

        // Agora cria a sessão nova limpinha
        GameSession session = createNewSession(user);

        // O robô calcula a PRIMEIRA melhor pergunta
        QuestionResponse firstQuestion = getNextBestQuestion(session);

        List<Question> allQuestions = questionRepository.findAll();

        if (allQuestions.isEmpty()) {
            throw new RuntimeException("SOCORRO: Não há perguntas cadastradas no banco de dados!");
        }

        return buildGameResponse(session, "Pense em um país... Eu vou adivinhar!", firstQuestion);
    }

    // --- PROCESSAMENTO DA RESPOSTA ---
    @Transactional
    public GameResponse submitAnswer(String userEmail, GameAnswerRequest request) {
        User user = getUserOrThrow(userEmail);

        GameSession session = gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                .orElseThrow(() -> new BusinessException("Nenhum jogo ativo encontrado."));

        // 1. Processa a resposta do usuário e salva no histórico
        processAttempt(session, request);

        // 2. Verifica quantos países sobraram
        List<Country> remainingCountries = getRemainingCountries(session);

        String feedback;
        QuestionResponse nextQuestion = null;

        if (remainingCountries.isEmpty()) {
            // Caso raro: Usuário respondeu algo que eliminou tudo (contadição)
            session.finish(GameStatus.HUMAN_WON);
            feedback = "Ops! Não sobrou nenhum país. Você me enganou!";
        } else if (remainingCountries.size() == 1) {
            // VITÓRIA DO ROBÔ: Só sobrou um!
            Country guessedCountry = remainingCountries.get(0);
            session.setTargetCountry(guessedCountry); // Atualiza qual era o país
            session.finish(GameStatus.GUESSING);
            feedback = "Haha! Eu venci! O país é: " + guessedCountry.getName();
        } else {
            // JOGO CONTINUA: Calcula a próxima pergunta
            try {
                nextQuestion = getNextBestQuestion(session);
                feedback = "Hmm... interessante. Próxima pergunta!";
                updateScore(session); // Deduz pontos por rodada
            } catch (BusinessException e) {
                // Acabaram as perguntas e ainda tem > 1 país
                session.finish(GameStatus.HUMAN_WON);
                feedback = "Desisto! Fiquei sem perguntas. Você venceu!";
            }
        }

        gameSessionRepository.save(session);
        return buildGameResponse(session, feedback, nextQuestion);
    }

    // --- O CÉREBRO DO ROBÔ (A Lógica Matemática) ---

    private QuestionResponse getNextBestQuestion(GameSession session) {
        // 1. Quem ainda está no jogo?
        List<Country> remainingCountries = getRemainingCountries(session);

        // 2. Quais perguntas eu JÁ fiz?
        List<Long> askedQuestionIds = session.getGameAttempts().stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toList());

        // 3. Pega todas as perguntas disponíveis (que não foram feitas)
        List<Question> availableQuestions = questionRepository.findAll().stream()
                .filter(q -> !askedQuestionIds.contains(q.getId()))
                .collect(Collectors.toList());

        if (availableQuestions.isEmpty()) {
            throw new BusinessException("Sem mais perguntas disponíveis.");
        }

        // 4. CALCULAR O MELHOR SPLIT (50/50)
        Question bestQuestion = null;
        int bestBalanceScore = -1; // Quanto maior, melhor

        for (Question q : availableQuestions) {
            int countYes = 0;
            int countNo = 0;

            for (Country c : remainingCountries) {
                // Verifica a característica no banco ("Memória do Robô")
                boolean isTrue = countryFeatureRepository.findByCountryAndQuestion(c, q)
                        .map(CountryFeature::getIsTrue)
                        .orElse(false);

                if (isTrue)
                    countYes++;
                else
                    countNo++;
            }

            // Se a pergunta não elimina ninguém (todos Sim ou todos Não), ela é inútil
            // agora
            if (countYes == 0 || countNo == 0)
                continue;

            // Pontuação de Balanceamento: O menor grupo define a qualidade.
            // Ex: 10 países. 5 Sim / 5 Não -> Score 5 (Perfeito)
            // Ex: 10 países. 1 Sim / 9 Não -> Score 1 (Ruim, arriscado)
            int currentBalance = Math.min(countYes, countNo);

            if (currentBalance > bestBalanceScore) {
                bestBalanceScore = currentBalance;
                bestQuestion = q;
            }
        }

        // Fallback: Se nenhuma pergunta for boa (todas inúteis), pega a primeira
        // disponível
        if (bestQuestion == null) {
            bestQuestion = availableQuestions.get(0);
        }

        return new QuestionResponse(
                bestQuestion.getId(),
                bestQuestion.getText(),
                bestQuestion.getCategory(),
                bestQuestion.getHelperImageUrl());
    }

    // Filtra os países baseados no histórico de respostas
    private List<Country> getRemainingCountries(GameSession session) {
        List<Country> candidates = countryRepository.findAll(); // Começa com todos (13)

        for (GameAttempt attempt : session.getGameAttempts()) {
            candidates = candidates.stream()
                    .filter(c -> {
                        // O país tem essa característica?
                        boolean featureIsTrue = countryFeatureRepository
                                .findByCountryAndQuestion(c, attempt.getQuestion())
                                .map(CountryFeature::getIsTrue)
                                .orElse(false);

                        // O país sobrevive se a característica bater com o que o usuário respondeu
                        // Ex: Usuário disse "TEM PRAIA" (true). O país tem praia? (true). Mantém.
                        // Ex: Usuário disse "TEM PRAIA" (true). Bolívia não tem (false). Elimina.
                        return featureIsTrue == attempt.getUserAnswer();
                    })
                    .collect(Collectors.toList());
        }
        candidates.removeAll(session.getRejectedCountries());
        return candidates;
    }

    // --- MÉTODOS AUXILIARES ---

    private void processAttempt(GameSession session, GameAnswerRequest request) {
        // Busca a pergunta real pelo ID (Segurança)
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Pergunta inválida"));

        GameAttempt attempt = new GameAttempt();
        attempt.setGameSession(session);
        attempt.setQuestion(question); // Salva o Objeto Question
        attempt.setUserAnswer(request.getAnswer());
        attempt.setAttemptedAt(LocalDateTime.now());

        gameAttemptRepository.save(attempt);
        session.setAttempts(session.getAttempts() + 1);
        // Atualiza a lista em memória para o getNextBestQuestion usar na mesma
        // transação
        session.getGameAttempts().add(attempt);
    }

    private GameSession createNewSession(User user) {
        GameSession session = new GameSession();
        session.setUser(user);
        // Pega um país qualquer só para preencher o campo @NotNull, mas o alvo é
        // dinâmico
        session.setTargetCountry(countryRepository.findAll().get(0));
        session.setScore(100);
        session.setAttempts(0);
        session.setStatus(GameStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        return gameSessionRepository.save(session);
    }

    private void updateScore(GameSession session) {
        // Cada pergunta custa 2 pontos, por exemplo
        session.setScore(Math.max(0, session.getScore() - 2));
    }

    // Substitua o seu método 'buildGameResponse' atual por este:
    private GameResponse buildGameResponse(GameSession session, String feedback, QuestionResponse nextQuestion) {

        String robotGuess = null;

        // No estilo Akinator, só mostramos o país quando o Robô tem certeza (Status =
        // ROBOT_WON)
        // Enquanto estiver JOGANDO (IN_PROGRESS) ou se o HUMANO GANHAR (HUMAN_WON -
        // robô desistiu),
        // mandamos null para não mostrar o "chute" errado ou precoce.
        if (session.getStatus() == GameStatus.ROBOT_WON || session.getStatus() == GameStatus.GUESSING) {
            if (session.getTargetCountry() != null) {
                robotGuess = session.getTargetCountry().getName();
            }
        }

        return GameResponse.builder()
           .gameId(session.getId())
                .status(session.getStatus().toString())
                .score(session.getScore())
                .attempts(session.getAttempts())
                // O status HUMAN_WON avisa o front que é hora de mostrar a tela de Vitória do Humano
                .won(session.getStatus() == GameStatus.HUMAN_WON) 
                .targetCountry(robotGuess) 
                .nextQuestion(nextQuestion)
                .feedback(feedback)
                .questionText(feedback)
                .build();
    }

    // Métodos de validação padrão
    private User getUserOrThrow(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    public List<GameResponse> getUserGameHistory(String userEmail) {
        User user = getUserOrThrow(userEmail);
        return gameSessionRepository.findByUserOrderByStartedAtDesc(user).stream()
                .map(game -> buildGameResponse(game, "Histórico", null))
                .collect(Collectors.toList());
    }

    @Transactional
    public GameResponse denyRobotGuess(String userEmail) {
        User user = getUserOrThrow(userEmail);
        
        // --- CORREÇÃO AQUI ---
        // Troquei GameStatus.ROBOT_WON por GameStatus.GUESSING
        // O robô ainda não ganhou, ele está apenas "Chutando"
        GameSession session = gameSessionRepository.findByUserAndStatus(user, GameStatus.GUESSING)
                .orElseThrow(() -> new BusinessException("Nenhum palpite pendente para recusar."));

        // 1. Adiciona o país atual à lista negra dessa sessão
        Country wrongGuess = session.getTargetCountry();
        
        // CERTIFIQUE-SE que sua Entidade GameSession tem esse método auxiliar, 
        // ou use: session.getRejectedCountries().add(wrongGuess);
        session.addRejectedCountry(wrongGuess); 
        
        session.setTargetCountry(null); // Limpa o chute atual para não repetir

        // 2. Penalidade (Opcional, mas justo)
        session.setScore(Math.max(0, session.getScore() - 10));

        // 3. Verifica se ainda existem OUTROS países possíveis
        List<Country> remaining = getRemainingCountries(session);

        if (remaining.isEmpty()) {
            // Se não sobrou ninguém, o Robô desiste e pede a verdade (Modo Detetive)
            session.setStatus(GameStatus.WAITING_FOR_REVEAL);
            session.setFinishedAt(LocalDateTime.now()); 
            gameSessionRepository.save(session);

            // O status "HUMAN_WON" no JSON avisa o front para mostrar a tela de Vitória/Revelação
            return GameResponse.builder()
                .status("WAITING_FOR_REVEAL") 
                .gameId(session.getId())
                .questionText("Ok, você me pegou! Não sei qual é. Que país você pensou?")
                .feedback("Desisto! Me conte a verdade para eu aprender.")
                .build();
        } else {
            // AINDA TEM OPÇÃO! O jogo continua.
            session.setStatus(GameStatus.IN_PROGRESS);
            gameSessionRepository.save(session);

            // Calcula próxima pergunta
            QuestionResponse nextQ = getNextBestQuestion(session);
            
            return GameResponse.builder()
                    .status("PLAYING")
                    .gameId(session.getId())
                    .questionText("Entendi, não é " + wrongGuess.getName() + ". Vamos continuar!")
                    .nextQuestion(nextQ)
                    .build();
        }
    }

    @Transactional
    public GameResponse confirmRobotGuess(String userEmail) {
        User user = getUserOrThrow(userEmail);
        
        // 1. Busca o jogo que está na fase de chute (GUESSING)
        GameSession session = gameSessionRepository.findByUserAndStatus(user, GameStatus.GUESSING)
                .orElseThrow(() -> new BusinessException("Não há nenhum palpite para confirmar."));

        // 2. O usuário confirmou! O Robô venceu.
        session.setStatus(GameStatus.ROBOT_WON); 
        session.setFinishedAt(LocalDateTime.now());
        
        // Aumenta a pontuação por vitória (Opcional)
        session.setScore(session.getScore() + 20);

        gameSessionRepository.save(session);

        // 3. Retorna a resposta final usando o auxiliar padrão
        // Como o status agora é ROBOT_WON, o buildGameResponse vai mostrar o nome do país.
        return buildGameResponse(session, "Eu sabia! Sou um gênio da geografia! 🗺️", null);
    }

    @Transactional
    public GameResponse revealAnswer(String userEmail, Long realCountryId) {
        User user = getUserOrThrow(userEmail);
        GameSession session = gameSessionRepository.findByUserAndStatus(user, GameStatus.WAITING_FOR_REVEAL)
                .orElseThrow(() -> new BusinessException("Nenhum jogo aguardando revelação foi encontrado."));

        Country realCountry = countryRepository.findById(realCountryId)
                .orElseThrow(() -> new ResourceNotFoundException("País desconhecido."));

        // --- MODO DETETIVE ONLINE---
        List<String> mistakes = new ArrayList<>();

        for (GameAttempt attempt : session.getGameAttempts()) {
            Question q = attempt.getQuestion();
            boolean userAnswer = attempt.getUserAnswer();

            // O que o banco diz sobre o País Real vs A Pergunta Feita?
            boolean realFact = countryFeatureRepository.findByCountryAndQuestion(realCountry, q)
                    .map(CountryFeature::getIsTrue)
                    .orElse(false); // Assumindo false se não tiver cadastro (cuidado aqui)
            // B. Compara a resposta do usuário com a verdade
            boolean isUserCorrect = (userAnswer == realFact);
            // C. CRUCIAL: Salva o resultado da auditoria no objeto!
            // Isso vai preencher a coluna 'is_correct' no banco de dados
            attempt.setIsCorrect(isUserCorrect);

            if (!isUserCorrect) {
                String truth = realFact ? "SIM" : "NÃO";
                String youSaid = userAnswer ? "SIM" : "NÃO";
                mistakes.add("Na pergunta '" + q.getText() + "', você respondeu " + youSaid + ", mas para "
                        + realCountry.getName() + " é " + truth + ".");
            }
        }
        session.setTargetCountry(realCountry);
        session.setStatus(GameStatus.FINISHED_REVEALED);
        session.setFinishedAt(LocalDateTime.now()); // Novo status final
        gameSessionRepository.save(session);

        String finalMessage;
        if (mistakes.isEmpty()) {
            finalMessage = "Uau! Você jogou perfeitamente e eu não tinha esse país no meu radar. Vou aprender com isso!";
            // Aqui você poderia adicionar lógica para salvar esse caso para análise futura
        } else {
            finalMessage = "Ahá! Descobri por que eu errei. Você se confundiu:\n" + String.join("\n", mistakes);
        }

        // Retorna um DTO adaptado para mostrar esse relatório
        return GameResponse.builder()
                .status("REPORT") // Um status especial pro Front mostrar o relatório
                .targetCountry(realCountry.getName())
                .feedback(finalMessage) // Usando o campo de texto para mandar o relatório
                .build();
    }

}
