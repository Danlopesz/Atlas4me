package atlas4me.service;

import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.response.GameResponse;
import atlas4me.dto.response.QuestionResponse;
import atlas4me.dto.response.LocationResponse;
import atlas4me.entity.*;
import atlas4me.exception.BusinessException;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameSessionRepository gameSessionRepository;
    private final GameAttemptRepository gameAttemptRepository;
    private final UserRepository userRepository;

    // Novos Repositories necessários para a lógica do Robô
    private final QuestionRepository questionRepository;
    private final CountryRepository countryRepository;
    private final CountryFeatureRepository countryFeatureRepository;
    private final Map<Long, Map<Long, Boolean>> knowledgeBase = new HashMap<>();

    @PostConstruct
    public void initCache() {
        log.info("Iniciando carregamento da Base de Conhecimento para a memória...");
        // Traz TODAS as features do banco de uma vez só!
        List<CountryFeature> allFeatures = countryFeatureRepository.findAll();

        for (CountryFeature cf : allFeatures) {
            knowledgeBase
                    .computeIfAbsent(cf.getCountry().getId(), k -> new HashMap<>())
                    .put(cf.getQuestion().getId(), cf.getIsTrue());
        }
        log.info("Cérebro carregado com sucesso! {} características mapeadas na RAM.", allFeatures.size());
    }


    // --- INÍCIO DO JOGO ---
    @Transactional
    public GameResponse startNewGame(String userEmail, String continent) {
        User user = null;

        // MUDANÇA: Só busca no banco se NÃO for convidado/nulo
        if (userEmail != null && !userEmail.equals("guest") && !userEmail.equals("anonymousUser")) {
            user = getUserOrThrow(userEmail);
            gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                    .ifPresent(oldSession -> {
                        oldSession.setStatus(GameStatus.ROBOT_WON);
                        oldSession.setFinishedAt(LocalDateTime.now());
                        gameSessionRepository.save(oldSession);
                    });
        }
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
        GameSession session;

        // MUDANÇA: Tenta achar pelo ID do jogo primeiro (Funciona para Guest e User)
        if (request.getGameId() != null) {
            session = gameSessionRepository.findById(request.getGameId())
                    .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + request.getGameId()));
        }
        // Fallback: Se não tem ID, tenta pelo usuário (Só para logados)
        else if (userEmail != null && !userEmail.equals("guest")) {
            User user = getUserOrThrow(userEmail);
            session = gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                    .orElseThrow(() -> new BusinessException("Nenhum jogo ativo encontrado."));
        } else {
            throw new BusinessException("ID do jogo é obrigatório para visitantes.");
        }

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

    public List<GameResponse> getUserGameHistory(String userEmail) {
        // MUDANÇA: Guarda logo no início
        if (userEmail == null || userEmail.equals("guest") || userEmail.equals("anonymousUser")) {
            return new ArrayList<>(); // Retorna lista vazia sem dar erro
        }

        User user = getUserOrThrow(userEmail);
        return gameSessionRepository.findByUserOrderByStartedAtDesc(user).stream()
                .map(game -> buildGameResponse(game, "Histórico", null))
                .collect(Collectors.toList());
    }

    @Transactional
    public GameResponse denyRobotGuess(String userEmail, Long gameId) {
        GameSession session;

        // MUDANÇA 2: Prioridade para buscar pelo ID do Jogo (Funciona para Guest e
        // Logado)
        if (gameId != null) {
            session = gameSessionRepository.findById(gameId)
                    .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + gameId));
        }
        // Fallback: Se não veio ID, tenta buscar pelo usuário (apenas se não for guest)
        else if (userEmail != null && !userEmail.equals("guest") && !userEmail.equals("anonymousUser")) {
            User user = getUserOrThrow(userEmail);
            session = gameSessionRepository.findByUserAndStatus(user, GameStatus.GUESSING)
                    .orElseThrow(() -> new BusinessException("Nenhum palpite pendente para este usuário."));
        } else {
            throw new BusinessException("Erro: ID do jogo é obrigatório para visitantes.");
        }

        // 1. Adiciona o país atual à lista negra dessa sessão
        Country wrongGuess = session.getTargetCountry();

        if (wrongGuess != null) {
            // Usa o seu método auxiliar ou o padrão do Java
            session.addRejectedCountry(wrongGuess);
        }

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
                    .questionText("Entendi, não é " + (wrongGuess != null ? wrongGuess.getName() : "esse")
                            + ". Vamos continuar!")
                    .nextQuestion(nextQ)
                    .build();
        }
    }

    @Transactional
    public GameResponse confirmRobotGuess(String userEmail, Long gameId) {

        GameSession session;

        // 1. Tenta achar pelo ID do jogo (Funciona para Guest e Logado)
        if (gameId != null) {
            session = gameSessionRepository.findById(gameId)
                    .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + gameId));
        }
        // 2. Fallback: Se não tem ID, tenta pelo usuário (Só para logados antigos)
        else if (userEmail != null && !userEmail.equals("guest")) {
            User user = getUserOrThrow(userEmail);
            session = gameSessionRepository.findByUserAndStatus(user, GameStatus.GUESSING)
                    .orElseThrow(() -> new BusinessException("Não há nenhum palpite para confirmar."));
        } else {
            throw new BusinessException("ID do jogo é obrigatório para visitantes.");
        }

        // O usuário confirmou! O Robô venceu.
        session.setStatus(GameStatus.ROBOT_WON);
        session.setFinishedAt(LocalDateTime.now());

        // Aumenta a pontuação por vitória (Opcional)
        session.setScore(session.getScore() + 20);

        gameSessionRepository.save(session);

        return buildGameResponse(session, "Eu sabia! Sou um gênio da geografia! 🗺️", null);
    }

    @Transactional
    public GameResponse revealAnswer(String userEmail, Long realCountryId, Long gameId) {

        GameSession session;

        // 1. Busca pelo ID do jogo
        if (gameId != null) {
            session = gameSessionRepository.findById(gameId)
                    .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + gameId));
        }
        // 2. Fallback para usuário logado
        else if (userEmail != null && !userEmail.equals("guest")) {
            User user = getUserOrThrow(userEmail);
            session = gameSessionRepository.findByUserAndStatus(user, GameStatus.WAITING_FOR_REVEAL)
                    .orElseThrow(() -> new BusinessException("Nenhum jogo aguardando revelação foi encontrado."));
        } else {
            throw new BusinessException("ID do jogo é obrigatório para visitantes.");
        }

        // --- LÓGICA ORIGINAL DE AUDITORIA ---

        Country realCountry = countryRepository.findById(realCountryId)
                .orElseThrow(() -> new ResourceNotFoundException("País desconhecido."));

        List<String> mistakes = new ArrayList<>();

        for (GameAttempt attempt : session.getGameAttempts()) {
            Question q = attempt.getQuestion();
            boolean userAnswer = attempt.getUserAnswer();

            boolean realFact = countryFeatureRepository.findByCountryAndQuestion(realCountry, q)
                    .map(CountryFeature::getIsTrue)
                    .orElse(false);

            attempt.setIsCorrect(userAnswer == realFact);

            if (userAnswer != realFact) {
                String truth = realFact ? "SIM" : "NÃO";
                String youSaid = userAnswer ? "SIM" : "NÃO";
                mistakes.add("Na pergunta '" + q.getText() + "', você respondeu " + youSaid + ", mas para "
                        + realCountry.getName() + " é " + truth + ".");
            }
        }

        session.setTargetCountry(realCountry);
        session.setStatus(GameStatus.FINISHED_REVEALED);
        session.setFinishedAt(LocalDateTime.now());
        gameSessionRepository.save(session);

        String finalMessage;
        if (mistakes.isEmpty()) {
            finalMessage = "Uau! Você jogou perfeitamente e eu não tinha esse país no meu radar. Vou aprender com isso!";
        } else {
            finalMessage = "Ahá! Descobri por que eu errei. Você se confundiu:\n" + String.join("\n", mistakes);
        }

        return GameResponse.builder()
                .status("REPORT")
                .targetCountry(realCountry.getName())
                .feedback(finalMessage)
                .build();
    }

    // --- O CÉREBRO DO ROBÔ (A Lógica Matemática de Entropia) ---
    private QuestionResponse getNextBestQuestion(GameSession session) {
        // 1. Quem ainda está no jogo?
        List<Country> remainingCountries = getRemainingCountries(session);

        // 2. Quais perguntas eu JÁ fiz?
        List<Long> askedQuestionIds = session.getGameAttempts().stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toList());

        // 3. Pega todas as perguntas disponíveis
        List<Question> availableQuestions = questionRepository.findAll().stream()
                .filter(q -> !askedQuestionIds.contains(q.getId()))
                .collect(Collectors.toList());

        if (availableQuestions.isEmpty()) {
            throw new BusinessException("Sem mais perguntas disponíveis.");
        }

        // 4. CALCULAR O MELHOR SPLIT COM ENTROPIA E DESEMPATE (100% NA MEMÓRIA)
        Question bestQuestion = null;
        double maxEntropy = -1.0;
        int bestPriority = -1;

        for (Question q : availableQuestions) {
            int countYes = 0;
            int countNo = 0;

            for (Country c : remainingCountries) {
                // Busca a resposta direto do nosso mapa rápido em RAM!
                boolean isTrue = knowledgeBase
                        .getOrDefault(c.getId(), new HashMap<>())
                        .getOrDefault(q.getId(), false);

                if (isTrue) countYes++;
                else countNo++;
            }

            // Se a pergunta não divide o grupo (todo mundo responde igual), ignoramos
            if (countYes == 0 || countNo == 0) continue;

            // Calcula a incerteza (ganho de informação)
            double currentEntropy = calculateEntropy(countYes, countNo);
            int currentPriority = getCategoryPriority(q.getCategory());

            // A Mágica: Escolhe quem tem maior entropia. Se empatar, olha a categoria!
            if (currentEntropy > maxEntropy) {
                maxEntropy = currentEntropy;
                bestPriority = currentPriority;
                bestQuestion = q;
            } else if (currentEntropy == maxEntropy && currentPriority > bestPriority) {
                // Empate matemático: vence a categoria com maior prioridade (ex: Geografia)
                bestPriority = currentPriority;
                bestQuestion = q;
            }
        }

        // Se por algum motivo bizarro todas as perguntas forem inúteis, pega a primeira
        if (bestQuestion == null) {
            bestQuestion = availableQuestions.get(0);
        }

        // Buscamos TODOS os países (mesmo os eliminados) que têm essa característica
        // para acender no mapa educativo.
        final Long bestQuestionId = bestQuestion.getId();
        List<LocationResponse> mapLocations = countryRepository.findAll().stream()
                .filter(c -> knowledgeBase.getOrDefault(c.getId(), new HashMap<>()).getOrDefault(bestQuestionId, false))
                .map(c -> new LocationResponse(
                        c.getIsoCode().toLowerCase(),
                        c.getLatitude(),
                        c.getLongitude()
                ))
                .collect(Collectors.toList());

        return new QuestionResponse(
                bestQuestion.getId(),
                bestQuestion.getText(),
                bestQuestion.getCategory(),
                bestQuestion.getHelperImageUrl(),
                mapLocations
        );
    }
    // Filtra os países baseados no histórico de respostas (100% em RAM!)
    private List<Country> getRemainingCountries(GameSession session) {
        List<Country> candidates = countryRepository.findByContinent("SOUTH_AMERICA");

        for (GameAttempt attempt : session.getGameAttempts()) {
            candidates = candidates.stream()
                    .filter(c -> {
                        // Verifica no Cache Rápido em vez de fazer query no banco!
                        boolean featureIsTrue = knowledgeBase
                                .getOrDefault(c.getId(), new HashMap<>())
                                .getOrDefault(attempt.getQuestion().getId(), false);

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
                // O status HUMAN_WON avisa o front que é hora de mostrar a tela de Vitória do
                // Humano
                .won(session.getStatus() == GameStatus.HUMAN_WON)
                .targetCountry(robotGuess)
                .nextQuestion(nextQuestion)
                .feedback(feedback)
                .questionText(feedback)
                .build();
    }
    private User getUserOrThrow(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }


    // Define a prioridade da pergunta caso haja empate matemático (Entropia igual)
    // Valores maiores = maior prioridade
    private int getCategoryPriority(String category) {
        if (category == null) return 0;
        return switch (category.toUpperCase()) {
            case "GEOGRAFIA" -> 4;
            case "POPULACAO" -> 3;
            case "CULTURA" -> 2;
            case "ECONOMIA" -> 1;
            case "BANDEIRA" -> 0;
            default -> 0;
        };
    }

    // Calcula a Entropia de Shannon para um grupo dividido entre "Sim" e "Não"
    private double calculateEntropy(int countYes, int countNo) {
        int total = countYes + countNo;
        if (total == 0) return 0.0;

        double pYes = (double) countYes / total;
        double pNo = (double) countNo / total;

        double entropy = 0.0;
        // Fórmula da entropia: -p * log2(p)
        if (pYes > 0) entropy -= pYes * (Math.log(pYes) / Math.log(2));
        if (pNo > 0) entropy -= pNo * (Math.log(pNo) / Math.log(2));

        return entropy;
    }
}
