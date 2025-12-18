package atlas4me.entity;

    public  enum GameStatus {
        IN_PROGRESS, // Jogo rolando
        ROBOT_WON, // O Robô adivinhou o país
        HUMAN_WON, // O Robô desistiu/errou (Vitória do usuário)
        GAVE_UP,
        WAITING_FOR_REVEAL,
        FINISHED_REVEALED // O usuário desistiu (Opcional)
    }

