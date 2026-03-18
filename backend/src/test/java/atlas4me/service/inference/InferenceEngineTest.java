package atlas4me.service.inference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class InferenceEngineTest {

    @Mock
    private KnowledgeBaseCache cache;

    @InjectMocks
    private InferenceEngine inferenceEngine;

    @BeforeEach
    void setUp() {
        // Arrange: Configurando o Mini-Universo de 4 Países e 4 Perguntas
        lenient().when(cache.getAllQuestionIds()).thenReturn(Set.of(1L, 2L, 3L, 4L));

        // Q1 (Geografia - Prio 50): Divide perfeitamente (50/50)
        lenient().when(cache.getTrueCountries(1L)).thenReturn(Set.of(1L, 2L));
        lenient().when(cache.getFalseCountries(1L)).thenReturn(Set.of(3L, 4L));
        lenient().when(cache.getQuestionPriority(1L)).thenReturn(50);

        // Q2 (Economia - Prio 10): Divide perfeitamente (50/50)
        lenient().when(cache.getTrueCountries(2L)).thenReturn(Set.of(1L, 3L));
        lenient().when(cache.getFalseCountries(2L)).thenReturn(Set.of(2L, 4L));
        lenient().when(cache.getQuestionPriority(2L)).thenReturn(10);

        // Q3 (Bandeira - Prio 30): Divide mal (75/25)
        lenient().when(cache.getTrueCountries(3L)).thenReturn(Set.of(1L));
        lenient().when(cache.getFalseCountries(3L)).thenReturn(Set.of(2L, 3L, 4L));
        lenient().when(cache.getQuestionPriority(3L)).thenReturn(30);

        // Q4 (População - Prio 20): Não divide nada (100/0)
        lenient().when(cache.getTrueCountries(4L)).thenReturn(Set.of(1L, 2L, 3L, 4L));
        lenient().when(cache.getFalseCountries(4L)).thenReturn(Collections.emptySet());
        lenient().when(cache.getQuestionPriority(4L)).thenReturn(20);
    }

    @Test
    void shouldReturnNullWhenCandidatesAreOneOrZero() {
        // Arrange
        GameState emptyState        = new GameState(Collections.emptySet(), Collections.emptySet());
        GameState oneCandidateState = new GameState(Set.of(1L), Collections.emptySet());

        // Act & Assert
        assertNull(inferenceEngine.selectBestQuestion(emptyState),
                "Deve retornar null quando não há candidatos.");
        assertNull(inferenceEngine.selectBestQuestion(oneCandidateState),
                "Deve retornar null quando resta apenas 1 candidato (hora do palpite).");
    }

    @Test
    void shouldSelectQuestionWithHighestInformationGainAndTieBreak() {
        // Arrange
        GameState state = new GameState(Set.of(1L, 2L, 3L, 4L), Collections.emptySet());

        // Act
        Long bestQuestionId = inferenceEngine.selectBestQuestion(state);

        // Assert
        // Q1 e Q2 têm o mesmo Ganho de Informação máximo (dividem 2 e 2).
        // Mas Q1 (prio 50) ganha de Q2 (prio 10) no desempate da categoria.
        assertEquals(1L, bestQuestionId,
                "Deve selecionar Q1 devido ao maior Ganho de Informação combinado com a maior prioridade.");
    }

    @Test
    void shouldIgnoreAskedQuestionsAndSelectNextBest() {
        // Arrange — simulando que Q1 já foi respondida
        GameState state = new GameState(Set.of(1L, 2L, 3L, 4L), Set.of(1L));

        // Act
        Long bestQuestionId = inferenceEngine.selectBestQuestion(state);

        // Assert
        // Q1 é a melhor, mas já foi feita. A próxima com maior Ganho de Informação é Q2.
        assertEquals(2L, bestQuestionId,
                "Deve ignorar Q1 (já perguntada) e selecionar Q2.");
    }

    @Test
    void shouldIgnoreZeroGainQuestions() {
        // Arrange — ficaram apenas candidatos 1 e 2
        GameState state = new GameState(Set.of(1L, 2L), Collections.emptySet());

        // Act
        Long bestQuestionId = inferenceEngine.selectBestQuestion(state);

        // Assert
        // Para candidatos [1, 2]:
        //   Q1 → SIM para ambos (Ganho 0) — ignorada
        //   Q4 → SIM para ambos (Ganho 0) — ignorada
        //   Q2 → divide [1] e [2] (Ganho máximo, prio 10)
        //   Q3 → divide [1] e [2] (Ganho máximo, prio 30)
        // Q3 vence Q2 no desempate de categoria!
        assertEquals(3L, bestQuestionId,
                "Deve ignorar Q1 e Q4 (Ganho 0) e escolher Q3, que vence Q2 no desempate.");
    }

    @Test
    void shouldFilterCandidatesCorrectly() {
        // Arrange
        Set<Long> initialCandidates = Set.of(1L, 2L, 3L, 4L);

        // Act — usuário respondeu SIM (true) para Q1
        Set<Long> filteredCandidates = inferenceEngine.filterCandidates(initialCandidates, 1L, true);

        // Assert — Q1(true) mapeia para países 1 e 2 no mock
        assertEquals(Set.of(1L, 2L), filteredCandidates,
                "O filtro deve retornar a interseção correta dos candidatos com a matriz de conhecimento.");
    }
}
