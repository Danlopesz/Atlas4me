import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../assets/Jogar.css";

function Jogar() {
    const navigate = useNavigate();
    
    // Estados
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, PLAYING, GUESSING
    const [question, setQuestion] = useState(null); // Guarda ID e Texto da pergunta
    const [targetCountry, setTargetCountry] = useState(null); // Guarda o chute do Robô
    const [message, setMessage] = useState('Clique em Iniciar para desafiar o Atlas!');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    // --- FUNÇÃO CENTRAL QUE PROCESSA A RESPOSTA DO JAVA ---
    const processResponse = (data) => {
        console.log("Resposta do Server:", data);

        // CENÁRIO 1: O Robô decidiu chutar um país (Akinator)
        if (data.targetCountry) {
            setTargetCountry(data.targetCountry);
            setGameStatus('GUESSING'); // Muda a tela para "O Robô acha que é..."
            setMessage(`Eu acho que é: ${data.targetCountry}`);
        } 
        // CENÁRIO 2: O jogo continua com perguntas
        else if (data.nextQuestion) {
            setQuestion({
                id: data.gameId,           
                questionId: data.nextQuestion.id,
                text: data.nextQuestion.text   
            });
            setTargetCountry(null); // Limpa qualquer chute anterior
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);
        }
        // CENÁRIO 3: Robô desistiu (Você venceu)
        else if (data.status === 'HUMAN_WON') {
            setGameStatus('FINISHED');
            setMessage("Desisto! Não sei mais o que perguntar. Você venceu!");
        }
    };

    const handleStartGame = async () => {
        setGameStatus('LOADING');
        setMessage('Carregando...');
        try {
            const response = await api.post('/api/games/start');
            processResponse(response.data);
        } catch (error) {
            console.error("Erro:", error);
            setGameStatus('LOBBY');
            setMessage("Erro ao conectar com o cérebro do Atlas.");
        }
    };

    const handleAnswer = async (userAnswer) => {
        if (!question || !question.id) return;

        try {
            const payload = { 
                gameId: question.id, 
                questionId: question.questionId, // <--- ADICIONE ESTA LINHA OBRIGATÓRIA
                answer: userAnswer 
            };
            
            setMessage("Processando..."); 
            
            const response = await api.post('/api/games/answer', payload);
            processResponse(response.data);

        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao responder. Tente novamente.");
        }
    };

    // Funções para quando o Robô chuta o país
    const handleConfirmWin = () => {
        alert("O Atlas venceu! Tente enganá-lo na próxima.");
        setGameStatus('LOBBY');
        setMessage("Eu sou imbatível! Quer tentar de novo?");
    };

const handleDenyWin = async () => {
    try {
        setMessage("Pensando novamente...");
        const response = await api.post('/api/games/deny');
        processResponse(response.data); // O jogo volta para 'PLAYING' ou 'FINISHED'
    } catch (error) {
        console.error("Erro ao negar:", error);
    }
};

    return (
        <>
            <header>
                <div className="inner">
                    <div className="logo">
                       {/* Ajuste o caminho da imagem se necessário */}
                       <img src="/assets/img/thumbnail_logooriginal.png" alt="Atlas Logo" />
                    </div>
                    <nav>
                        <Link to="/">Inicio</Link>
                        <Link to="/como-jogar">Como Jogar</Link>
                        <Link to="/login" onClick={() => localStorage.removeItem('token')}>Sair</Link>
                    </nav>
                </div>
            </header>

            <section className="main-content">
                <div className="game-container">
                    
                    <h1 className="game-title">
                        {userName ? `Olá, ${userName}!` : 'Desafio Atlas'}
                    </h1>

                    <div className="question-box">
                        
                        {/* ESTADO 1: LOBBY (Botão Iniciar) */}
                        {gameStatus === 'LOBBY' && (
                            <>
                                <h2>BEM-VINDO</h2>
                                <p className="question-text">{message}</p>
                                <button className="btn-primary" onClick={handleStartGame}>
                                    Iniciar Jogo
                                </button>
                            </>
                        )}

                        {/* ESTADO 2: JOGANDO (Perguntas) */}
                        {gameStatus === 'PLAYING' && (
                            <>
                                <h2>PERGUNTA:</h2>
                                {/* Note: Removi o style color: white para o CSS funcionar */}
                                <p className="question-text">{message}</p> 
                                
                                <div className="btn-group">
                                    <button className="btn-yes" onClick={() => handleAnswer(true)}>Sim 👍</button>
                                    <button className="btn-no" onClick={() => handleAnswer(false)}>Não 👎</button>
                                </div>
                            </>
                        )}

                        {/* ESTADO 3: ROBÔ CHUTANDO (Akinator) */}
                        {gameStatus === 'GUESSING' && (
                            <>
                                <h2 style={{color: '#ff9f43'}}>O ROBÔ ACHA QUE É:</h2>
                                <p className="question-text" style={{fontSize: '2.5rem'}}>
                                    {targetCountry}
                                </p>
                                <p style={{color: '#666'}}>Ele acertou?</p>
                                
                                <div className="btn-group">
                                    <button className="btn-yes" onClick={handleConfirmWin}>Sim, é esse! 😱</button>
                                    <button className="btn-no" onClick={handleDenyWin}>Não, errou! 🤣</button>
                                </div>
                            </>
                        )}

                        {/* ESTADO 4: CARREGANDO */}
                        {gameStatus === 'LOADING' && (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>Consultando o mapa...</p>
                        )}
                        
                         {/* ESTADO 5: FIM DE JOGO (VITÓRIA HUMANA) */}
                         {gameStatus === 'FINISHED' && (
                            <>
                                <h2 style={{color: '#2ecc71'}}>VOCÊ VENCEU!</h2>
                                <p className="question-text">{message}</p>
                                <button className="btn-primary" onClick={() => setGameStatus('LOBBY')}>
                                    Jogar Novamente
                                </button>
                            </>
                        )}

                    </div>
                </div>
            </section>
        </>
    );
}

export default Jogar;