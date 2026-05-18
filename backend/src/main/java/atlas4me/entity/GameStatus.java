package atlas4me.entity;

/**
 * Estados possíveis de uma sessão de jogo, representando o ciclo de vida completo
 * de uma partida — do início até o encerramento (com ou sem revelação do país).
 */
public enum GameStatus {

    /** Jogo em andamento — aguardando resposta do usuário. */
    IN_PROGRESS,

    /** Robô adivinhou o país corretamente. */
    ROBOT_WON,

    /** Robô esgotou os candidatos sem acertar — vitória do usuário. */
    HUMAN_WON,

    /** Usuário optou por encerrar a partida antes do fim. */
    GAVE_UP,

    /** Robô esgotou as perguntas e aguarda o usuário revelar o país real. */
    WAITING_FOR_REVEAL,

    /** Jogo finalizado com revelação do país pensado pelo usuário. */
    FINISHED_REVEALED,

    /** Estado intermediário — robô identificou um único candidato e está tentando adivinhar. */
    GUESSING,

    /** Sessão abandonada sem finalização (ex: nova sessão iniciada ou browser fechado). */
    ABANDONED
}