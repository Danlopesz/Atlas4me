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
 * - Construção dos DTOs de resposta (GameResponse e GameResponse legado)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    // --- Repositórios ---
    private final GameSessionRepository gameSessionRepository;
    private final GameAttemptRepository gameAttemptRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final CountryRepository countryRepository;
    private final CountryFeatureRepository countryFeatureRepository;

    // --- Motor de inferência ---
    private final KnowledgeBaseCache knowledgeBaseCache;
    private final InferenceEngine inferenceEngine;

    // =========================================================================
    // INÍCIO DO JOGO (mantém GameResponse legado para compatibilidade)
    // =========================================================================

    @Transactional
    public GameResponse startNewGame(String userEmail, String continent) {
        User user = null;

        if (userEmail != null && !userEmail.equals("guest") && !userEmail.equals("anonymousUser")) {
            user = getUserOrThrow(userEmail);
            gameSessionRepository.findByUserAndStatus(user, GameStatus.IN_PROGRESS)
                    .ifPresent(old -> {
                        old.setStatus(GameStatus.ROBOT_WON);
                        old.setFinishedAt(LocalDateTime.now());
                        gameSessionRepository.save(old);
                    });
        }

        GameSession session = createNewSession(user);
        List<Country> all = countryRepository.findAll();

        // Seleciona primeira pergunta pelo motor
        QuestionResponse firstQuestion = selectNextQuestion(session, all);
        return buildGameResponse(session, all, "Pense em um país... Eu vou adivinhar!", firstQuestion);
    }

    // =========================================================================
    // RESPOSTA (novo GameResponse)
    // =========================================================================

    @Transactional
    public GameResponse submitAnswer(String userEmail, GameAnswerRequest request) {
        GameSession session = resolveSession(request.getGameId(), GameStatus.IN_PROGRESS);

        processAttempt(session, request);

        List<Country> remainingCountries = getRemainingCountries(session);

        if (remainingCountries.isEmpty()) {
            session.finish(GameStatus.HUMAN_WON);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remainingCountries, "Ops! Não sobrou nenhum país. Você me enganou!",
                    null);
        }

        if (remainingCountries.size() == 1) {
            session.setTargetCountry(remainingCountries.get(0));
            session.finish(GameStatus.GUESSING);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remainingCountries,
                    "Acho que já sei! É o " + remainingCountries.get(0).getName() + "?", null);
        }

        session.setScore(Math.max(0, session.getScore() - 2));
        QuestionResponse nextQuestion = selectNextQuestion(session, remainingCountries);
        gameSessionRepository.save(session);
        return buildGameResponse(session, remainingCountries, "Hmm... Próxima pergunta!", nextQuestion);
    }

    // =========================================================================
    // FEEDBACK DE PALPITE — endpoint unificado /guess-feedback
    // =========================================================================

    @Transactional
    public GameResponse processGuessFeedback(String userEmail, GuessFeedbackRequest request) {
        GameSession session = resolveSession(request.gameId(), GameStatus.GUESSING);

        if (request.correct()) {
            // Robô acertou
            session.finish(GameStatus.ROBOT_WON);
            session.setScore(session.getScore() + 20);
            gameSessionRepository.save(session);
            return buildGameResponse(session, List.of(session.getTargetCountry()),
                    "Eu sabia! Sou um gênio da geografia! 🗺️", null);
        }

        // Robô errou: descarta candidato e retoma inferência
        session.addRejectedCountry(session.getTargetCountry());
        session.setTargetCountry(null);
        session.setScore(Math.max(0, session.getScore() - 10));

        List<Country> remaining = getRemainingCountries(session);

        if (remaining.isEmpty()) {
            session.finish(GameStatus.WAITING_FOR_REVEAL);
            gameSessionRepository.save(session);
            return buildGameResponse(session, remaining,
                    "Ok, você me pegou! Qual país você pensou?", null);
        }

        session.setStatus(GameStatus.IN_PROGRESS);
        QuestionResponse nextQuestion = selectNextQuestion(session, remaining);
        gameSessionRepository.save(session);
        return buildGameResponse(session, remaining, "Entendi, não é esse. Vamos continuar!", nextQuestion);
    }

    // =========================================================================
    // HISTÓRICO (mantém GameResponse legado)
    // =========================================================================

    public List<GameResponse> getUserGameHistory(String userEmail) {
        if (userEmail == null || userEmail.equals("guest") || userEmail.equals("anonymousUser")) {
            return new ArrayList<>();
        }
        User user = getUserOrThrow(userEmail);
        return gameSessionRepository.findByUserOrderByStartedAtDesc(user).stream()
                .map(game -> GameResponse.builder()
                        .gameId(game.getId())
                        .status(game.getStatus().name())
                        .score(game.getScore())
                        .attempts(game.getAttempts())
                        .won(game.getWon())
                        .startedAt(game.getStartedAt())
                        .finishedAt(game.getFinishedAt())
                        .targetCountry(game.getTargetCountry() != null ? game.getTargetCountry().getName() : null)
                        .feedback("Histórico")
                        .questionText("Histórico")
                        .build())
                .collect(Collectors.toList());
    }

    // =========================================================================
    // REVEAL (mantém GameResponse legado)
    // =========================================================================

    @Transactional
    public GameResponse revealAnswer(String userEmail, Long realCountryId, Long gameId) {
        GameSession session = resolveSession(gameId, GameStatus.WAITING_FOR_REVEAL);

        Country realCountry = countryRepository.findById(realCountryId)
                .orElseThrow(() -> new ResourceNotFoundException("País desconhecido."));

        List<String> mistakes = new ArrayList<>();
        for (GameAttempt attempt : session.getGameAttempts()) {
            Question q = attempt.getQuestion();
            boolean userAnswer = attempt.getUserAnswer();
            boolean realFact = countryFeatureRepository
                    .findByCountryAndQuestion(realCountry, q)
                    .map(CountryFeature::getIsTrue)
                    .orElse(false);

            attempt.setIsCorrect(userAnswer == realFact);
            if (userAnswer != realFact) {
                String truth = realFact ? "SIM" : "NÃO";
                String youSaid = userAnswer ? "SIM" : "NÃO";
                mistakes.add("Na pergunta '" + q.getText() + "', você respondeu " + youSaid
                        + ", mas para " + realCountry.getName() + " é " + truth + ".");
            }
        }

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
                .targetCountry(realCountry.getName())
                .feedback(finalMessage)
                .questionText(finalMessage)
                .build();
    }

    // =========================================================================
    // FILTRAGEM OTIMIZADA — 100% em RAM via KnowledgeBaseCache
    // =========================================================================

    private List<Country> getRemainingCountries(GameSession session) {
        // 1. Universo inicial de IDs do cache (sem query ao banco)
        Set<Long> candidateIds = new HashSet<>(knowledgeBaseCache.getCountryQuestionMatrix().keySet());

        // 2. Interseção progressiva por resposta — O(n) por tentativa
        for (GameAttempt attempt : session.getGameAttempts()) {
            Long qId = attempt.getQuestion().getId();
            boolean userAnswer = attempt.getUserAnswer();
            Set<Long> compatible = userAnswer
                    ? knowledgeBaseCache.getTrueCountries(qId)
                    : knowledgeBaseCache.getFalseCountries(qId);
            candidateIds.retainAll(compatible);
        }

        // 3. Remove países já descartados por palpites errados
        if (!session.getRejectedCountries().isEmpty()) {
            Set<Long> rejectedIds = session.getRejectedCountries().stream()
                    .map(Country::getId)
                    .collect(Collectors.toSet());
            candidateIds.removeAll(rejectedIds);
        }

        // 4. Única ida ao banco: WHERE id IN (...) usando os IDs restantes
        return countryRepository.findAllById(candidateIds);
    }

    // =========================================================================
    // SELEÇÃO DE PRÓXIMA PERGUNTA UNIFICADA
    // =========================================================================

    private QuestionResponse selectNextQuestion(GameSession session, List<Country> remainingCountries) {
        Set<Long> candidateIds = remainingCountries.stream()
                .map(Country::getId)
                .collect(Collectors.toSet());
        Set<Long> askedIds = session.getGameAttempts().stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toSet());

        Long bestId = inferenceEngine.selectBestQuestion(new GameState(candidateIds, askedIds));
        if (bestId == null)
            throw new BusinessException("Sem mais perguntas disponíveis.");

        Question bestQ = questionRepository.findById(bestId)
                .orElseThrow(() -> new ResourceNotFoundException("Pergunta não encontrada: " + bestId));

        // mapHints: ISO Codes dos candidatos restantes que responderiam SIM
        Set<Long> trueIds = knowledgeBaseCache.getTrueCountries(bestId);
        List<String> mapHints = remainingCountries.stream()
                .filter(c -> trueIds.contains(c.getId()))
                .map(Country::getIsoCode)
                .collect(Collectors.toList());

        return new QuestionResponse(bestQ.getId(), bestQ.getText(), bestQ.getCategory(), bestQ.getHelperImageUrl(),
                mapHints);
    }

    // =========================================================================
    // BUILDER UNIFICADO DE RESPOSTA
    // =========================================================================

    private GameResponse buildGameResponse(GameSession session, List<Country> remaining,
            String feedback, QuestionResponse nextQ) {
        String robotGuess = session.getTargetCountry() != null
                ? session.getTargetCountry().getName()
                : null;

        List<String> remainingIsos = remaining != null
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
                .remainingCountries(remainingIsos)
                .nextQuestion(nextQ)
                .feedback(feedback)
                .questionText(feedback) // retrocompatibilidade
                .build();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private GameSession resolveSession(Long gameId, GameStatus expectedStatus) {
        GameSession session = gameSessionRepository.findById(gameId)
                .orElseThrow(() -> new BusinessException("Jogo não encontrado com ID: " + gameId));
        if (session.getStatus() != expectedStatus) {
            throw new BusinessException(
                    "Sessão em estado inválido. Esperado: " + expectedStatus
                            + ", atual: " + session.getStatus());
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
        session.setTargetCountry(countryRepository.findRandomCountry().orElse(null));
        session.setScore(100);
        session.setAttempts(0);
        session.setStatus(GameStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        return gameSessionRepository.save(session);
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }
}
