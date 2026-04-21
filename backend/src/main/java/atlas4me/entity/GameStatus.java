package atlas4me.entity;

    public  enum GameStatus {
        IN_PROGRESS, // Jogo rolando
        ROBOT_WON, // O Robô adivinhou o país
        HUMAN_WON, // O Robô desistiu/errou (Vitória do usuário)
        GAVE_UP,// O usuário desistiu via botão (Opcional)
        WAITING_FOR_REVEAL,// Aguardando o usuário revelar o país
        FINISHED_REVEALED,// Jogo finalizado com revelação
        GUESSING, // Estado intermediário onde o robô está tentando adivinhar
        ABANDONED // Sessão abandonada (browser fechado/navegação sem jogar)
    }

