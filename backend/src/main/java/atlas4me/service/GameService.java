package atlas4me.service;

import atlas4me.dto.request.GameAnswerRequest;
import atlas4me.dto.request.GuessFeedbackRequest;
import atlas4me.dto.response.GameResponse;
import atlas4me.dto.response.QuestionResponse;
import atlas4me.entity.*;
import atlas4me.exception.BusinessException;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.*;
import atlas4me.service.inference.GameState;
import atlas4me.service.inference.InferenceEngine;
import atlas4me.service.inference.KnowledgeBaseCache;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Orquestrador do ciclo de vida de uma sessão de inferência.
 *
 * Responsabilidades:
 * - Persistência (GameSession, GameAttempt)
 * - Filtragem de candidatos via KnowledgeBaseCache (100% em RAM)
 * - Delegação ao InferenceEngine para seleção de perguntas
 * - Construção dos DTOs de resposta (GameResponse)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private static final int INITIAL_SCORE = 100;
    private static final int QUESTION_PENALTY = 2;
    private static final int WRONG_GUESS_PENALTY = 10;
    private static final int CORRECT_GUESS_BONUS = 20;
    private static final String ANSWER_YES = "SIM";
    private static final String ANSWER_NO = "NÃO";

    private final GameSessionRepository gameSessionRepository;
    private final GameAttemptRepository gameAttemptRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final CountryRepository countryRepository;
    private final CountryFeatureRepository countryFeatureRepository;

    private final KnowledgeBaseCache knowledgeBaseCache;
    private final InferenceEngine inferenceEngine;

    // =========================================================================
    // API PÚBLICA
    // =========================================================================

    /**
     * Inicia uma nova sessão de jogo, abandonando qualquer sessão ativa anterior.
     *
     * @param userEmail e-mail do usuário autenticado, ou "guest"/"anonymousUser" para visitantes.
     * @param continent continente para filtrar países (reservado para uso futuro).
     * @return {@link GameResponse} com a primeira pergunta e o estado inicial do jogo.
     * @throws BusinessException se a base de conhecimento estiver vazia.
     */
    @Transactional
    public GameResponse startNewGame(String userEmail, String continent) {
        User user = resolveAuthenticatedUser(userEmail);

        if (user != null) {
            abandonActiveSession(user);
        }

        GameSession session = createNewSession(user);
        List<Country> allKnownCountries = getRemainingCountries(session);

        if (allKnownCountries.isEmpty()) {
            throw new BusinessException("A base de conhecimento está vazia. O Akinator não tem países para adivinhar!");
        }

        log.info("Iniciando novo jogo com {} países candidatos.", allKnownCountries.size());

        QuestionResponse firstQuestion = selectNextQuestion(session, allKnownCountries);
        return buildGameResponse(session, allKnownCountries, "Pense em um país... Eu vou adivinhar!", firstQuestion);
    }

    /**
     * Processa a resposta do usuário a uma pergunta e avança o estado da inferência.
     *
     * @param userEmail e-mail do usuário autenticado.
     * @param request   dados da resposta, incluindo ID do jogo, ID da pergunta e valor booleano.
     * @return {@link GameResponse} com a próxima pergunta ou o palpite final do robô.
     */
    @Transactional
    public GameResponse submitAnswer(String userEmail, GameAnswerRequest request) {
        GameSession session = resolveSession(request.getGameId(), GameStatus.IN_PROGRESS);

        processAttempt(session, request);

        List<Country> remainingCountries = getRemainingCountries(session);

        if (remainingCountries.isEmpty()) {
            session.finish(GameStatus.HUMAN_WON);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remainingCountries, "Ops! Não sobrou nenhum país. Você me enganou!", null);
        }

        if (remainingCountries.size() == 1) {
            session.setTargetCountry(remainingCountries.get(0));
            session.finish(GameStatus.GUESSING);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remainingCountries,
                    "Acho que já sei! É o " + remainingCountries.get(0).getNamePt() + "?", null);
        }

        session.setScore(Math.max(0, session.getScore() - QUESTION_PENALTY));
        QuestionResponse nextQuestion = selectNextQuestion(session, remainingCountries);
        gameSessionRepository.save(session);
        return buildGameResponse(session, remainingCountries, "Hmm... Próxima pergunta!", nextQuestion);
    }

    /**
     * Processa o feedback do usuário sobre o palpite do robô.
     * Se correto, encerra com vitória do robô. Se errado, descarta o candidato e retoma a inferência.
     *
     * @param userEmail e-mail do usuário autenticado.
     * @param request   feedback indicando se o palpite foi correto.
     * @return {@link GameResponse} com o resultado ou a próxima pergunta.
     */
    @Transactional
    public GameResponse processGuessFeedback(String userEmail, GuessFeedbackRequest request) {
        GameSession session = resolveSession(request.gameId(), GameStatus.GUESSING);

        if (request.correct()) {
            session.finish(GameStatus.ROBOT_WON);
            session.setScore(session.getScore() + CORRECT_GUESS_BONUS);
            gameSessionRepository.save(session);
            return buildGameResponse(session, List.of(session.getTargetCountry()),
                    "Eu sabia! Sou um gênio da geografia! 🗺️", null);
        }

        session.addRejectedCountry(session.getTargetCountry());
        session.setTargetCountry(null);
        session.setScore(Math.max(0, session.getScore() - WRONG_GUESS_PENALTY));

        List<Country> remainingCountries = getRemainingCountries(session);

        if (remainingCountries.isEmpty()) {
            session.finish(GameStatus.WAITING_FOR_REVEAL);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remainingCountries, "Ok, você me pegou! Qual país você pensou?", null);
        }

        session.setStatus(GameStatus.IN_PROGRESS);
        QuestionResponse nextQuestion = selectNextQuestion(session, remainingCountries);
        gameSessionRepository.save(session);
        return buildGameResponse(session, remainingCountries, "Entendi, não é esse. Vamos continuar!", nextQuestion);
    }

    /**
     * Retorna o histórico de sessões encerradas do usuário autenticado.
     *
     * @param userEmail e-mail do usuário autenticado.
     * @return lista de {@link GameResponse} representando partidas anteriores, ou lista vazia para visitantes.
     */
    public List<GameResponse> getUserGameHistory(String userEmail) {
        if (isGuestUser(userEmail)) {
            return new ArrayList<>();
        }
        User user = getUserOrThrow(userEmail);
        return gameSessionRepository.findHistoryByUser(user).stream()
                .map(this::mapSessionToHistoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Revela o país real pensado pelo usuário e gera um relatório de discrepâncias de inferência.
     *
     * @param userEmail     e-mail do usuário autenticado.
     * @param realCountryId ID do país revelado pelo usuário.
     * @param gameId        ID da sessão de jogo.
     * @return {@link GameResponse} com status REPORT e as discrepâncias encontradas.
     * @throws ResourceNotFoundException se o país informado não existir na base.
     */
    @Transactional
    public GameResponse revealAnswer(String userEmail, Long realCountryId, Long gameId) {
        GameSession session = resolveSession(gameId, GameStatus.WAITING_FOR_REVEAL);

        Country realCountry = countryRepository.findById(realCountryId)
                .orElseThrow(() -> new ResourceNotFoundException("País desconhecido."));

        List<String> mistakes = collectMistakes(session, realCountry);

        session.setTargetCountry(realCountry);
        session.setStatus(GameStatus.FINISHED_REVEALED);
        session.setFinishedAt(LocalDateTime.now());
        gameSessionRepository.save(session);

        String finalMessage = mistakes.isEmpty()
                ? "Uau! Você jogou perfeitamente e eu não tinha esse país no meu radar."
                : "Ahá! Descobri por que eu errei:\n" + String.join("\n", mistakes);

        return GameResponse.builder()
                .gameId(session.getId())
                .status("REPORT")
                .targetCountry(realCountry.getNamePt())
                .feedback(finalMessage)
                .questionText(finalMessage)
                .build();
    }

    // =========================================================================
    // INFERÊNCIA E FILTRAGEM
    // =========================================================================

    private List<Country> getRemainingCountries(GameSession session) {
        Set<Long> candidateIds = new HashSet<>(knowledgeBaseCache.getCountryQuestionMatrix().keySet());

        for (GameAttempt attempt : session.getGameAttempts()) {
            Long questionId = attempt.getQuestion().getId();
            Set<Long> compatibleIds = attempt.getUserAnswer()
                    ? knowledgeBaseCache.getTrueCountries(questionId)
                    : knowledgeBaseCache.getFalseCountries(questionId);
            candidateIds.retainAll(compatibleIds);
        }

        if (!session.getRejectedCountries().isEmpty()) {
            Set<Long> rejectedIds = session.getRejectedCountries().stream()
                    .map(Country::getId)
                    .collect(Collectors.toSet());
            candidateIds.removeAll(rejectedIds);
        }

        return countryRepository.findAllById(candidateIds);
    }

    private QuestionResponse selectNextQuestion(GameSession session, List<Country> remainingCountries) {
        Set<Long> candidateIds = remainingCountries.stream()
                .map(Country::getId)
                .collect(Collectors.toSet());
        Set<Long> askedIds = session.getGameAttempts().stream()
                .map(attempt -> attempt.getQuestion().getId())
                .collect(Collectors.toSet());

        double entropy = inferenceEngine.getCurrentEntropy(candidateIds);
        Long bestQuestionId = inferenceEngine.selectBestQuestion(new GameState(candidateIds, askedIds));

        if (bestQuestionId == null) {
            log.error("InferenceEngine retornou nulo. Possível empate total ou poda lógica excessiva.");
            throw new BusinessException("Sem mais perguntas disponíveis.");
        }

        Question bestQuestion = questionRepository.findById(bestQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pergunta não encontrada: " + bestQuestionId));

        log.info("Registro: {} países restantes, {} perguntas já feitas. H(C) = {} bits. Pergunta: '{}'",
                candidateIds.size(), askedIds.size(), String.format("%.4f", entropy),
                bestQuestion.getQuestionPt());

        Set<Long> trueIds = knowledgeBaseCache.getTrueCountries(bestQuestionId);
        List<String> validIsoCodes = remainingCountries.stream()
                .filter(country -> trueIds.contains(country.getId()))
                .map(Country::getIsoCode)
                .collect(Collectors.toList());

        return new QuestionResponse(bestQuestion.getId(), bestQuestion.getQuestionPt(),
                bestQuestion.getCategory(), validIsoCodes);
    }

    // =========================================================================
    // BUILDERS E MAPEADORES
    // =========================================================================

    private GameResponse buildGameResponse(GameSession session, List<Country> remaining,
            String feedback, QuestionResponse nextQuestion) {
        String robotGuess = session.getTargetCountry() != null
                ? session.getTargetCountry().getNamePt()
                : null;

        List<String> remainingIsoCodes = remaining != null
                ? remaining.stream().map(Country::getIsoCode).collect(Collectors.toList())
                : new ArrayList<>();

        return GameResponse.builder()
                .gameId(session.getId())
                .status(session.getStatus().name())
                .score(session.getScore())
                .attempts(session.getAttempts())
                .won(session.getWon())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .targetCountry(robotGuess)
                .remainingCountries(remainingIsoCodes)
                .nextQuestion(nextQuestion)
                .feedback(feedback)
                .questionText(feedback)
                .build();
    }

    private GameResponse mapSessionToHistoryResponse(GameSession session) {
        return GameResponse.builder()
                .gameId(session.getId())
                .status(session.getStatus().name())
                .score(session.getScore())
                .attempts(session.getAttempts())
                .won(session.getWon())
                .startedAt(session.getStartedAt())
                .finishedAt(session.getFinishedAt())
                .targetCountry(session.getTargetCountry() != null ? session.getTargetCountry().getNamePt() : null)
                .feedback("Histórico")
                .questionText("Histórico")
                .build();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private List<String> collectMistakes(GameSession session, Country realCountry) {
        List<String> mistakes = new ArrayList<>();
        for (GameAttempt attempt : session.getGameAttempts()) {
            Question question = attempt.getQuestion();
            boolean userAnswer = attempt.getUserAnswer();
            boolean expectedAnswer = countryFeatureRepository
                    .findByCountryAndQuestion(realCountry, question)
                    .map(CountryFeature::getIsTrue)
                    .orElse(false);

            attempt.setIsCorrect(userAnswer == expectedAnswer);

            if (userAnswer != expectedAnswer) {
                mistakes.add(buildMistakeMessage(question, userAnswer, expectedAnswer, realCountry));
            }
        }
        return mistakes;
    }

    private String buildMistakeMessage(Question question, boolean userAnswer,
            boolean expectedAnswer, Country country) {
        return "Na pergunta '" + question.getQuestionPt() + "', você respondeu " + toAnswerLabel(userAnswer)
                + ", mas para " + country.getNamePt() + " é " + toAnswerLabel(expectedAnswer) + ".";
    }

    private void abandonActiveSession(User user) {
        gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                .ifPresent(existingSession -> {
                    existingSession.setStatus(GameStatus.ABANDONED);
                    existingSession.setFinishedAt(LocalDateTime.now());
                    gameSessionRepository.save(existingSession);
                });
    }

    private GameSession resolveSession(Long gameId, GameStatus expectedStatus) {
        GameSession session = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + gameId));
        if (session.getStatus() != expectedStatus) {
            throw new BusinessException(
                    "Sessão em estado inválido. Esperado: " + expectedStatus + ", atual: " + session.getStatus());
        }
        return session;
    }

    private void processAttempt(GameSession session, GameAnswerRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Pergunta inválida"));
        GameAttempt attempt = new GameAttempt();
        attempt.setGameSession(session);
        attempt.setQuestion(question);
        attempt.setUserAnswer(request.getAnswer());
        attempt.setAttemptedAt(LocalDateTime.now());
        gameAttemptRepository.save(attempt);
        session.setAttempts(session.getAttempts() + 1);
        session.getGameAttempts().add(attempt);
    }

    private GameSession createNewSession(User user) {
        GameSession session = new GameSession();
        session.setUser(user);
        session.setTargetCountry(null);
        session.setScore(INITIAL_SCORE);
        session.setAttempts(0);
        session.setStatus(GameStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        return gameSessionRepository.save(session);
    }

    private User resolveAuthenticatedUser(String userEmail) {
        if (isGuestUser(userEmail)) {
            return null;
        }
        return getUserOrThrow(userEmail);
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    private boolean isGuestUser(String userEmail) {
        return userEmail == null || userEmail.equals("guest") || userEmail.equals("anonymousUser");
    }

    private String toAnswerLabel(boolean answer) {
        return answer ? ANSWER_YES : ANSWER_NO;
    }
}