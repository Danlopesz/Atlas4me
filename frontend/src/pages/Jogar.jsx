import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Jogar() {
    const navigate = useNavigate();
    const [gameStatus, setGameStatus] = useState('LOBBY');
    const [question, setQuestion] = useState(null);
    const [targetCountry, setTargetCountry] = useState(null);
    const [message, setMessage] = useState('Clique em Iniciar para desafiar o Atlas!');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    const processResponse = (data) => {
        if (data.targetCountry) {
            setTargetCountry(data.targetCountry);
            setGameStatus('GUESSING');
            setMessage(`Eu acho que é: ${data.targetCountry}`);
        } else if (data.nextQuestion) {
            setQuestion({
                id: data.gameId,
                questionId: data.nextQuestion.id,
                text: data.nextQuestion.text
            });
            setTargetCountry(null);
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);
        } else if (data.status === 'HUMAN_WON') {
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
                questionId: question.questionId, 
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

    const handleConfirmWin = () => {
        alert("O Atlas venceu! Tente enganá-lo na próxima.");
        setGameStatus('LOBBY');
        setMessage("Eu sou imbatível! Quer tentar de novo?");
    };

    const handleDenyWin = async () => {
        try {
            setMessage("Pensando novamente...");
            const response = await api.post('/api/games/deny');
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao negar:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card" style={{maxWidth: '800px'}}>
                    
                    <h2 style={{fontSize: '1.5rem', color: '#b0b0b0'}}>
                        {userName ? `Olá, ${userName}!` : 'Desafio Atlas'}
                    </h2>

                    <div style={{ marginTop: '30px' }}>
                        
                        {/* LOBBY */}
                        {gameStatus === 'LOBBY' && (
                            <>
                                <h1>BEM-VINDO</h1>
                                <p style={{fontSize: '1.2rem', color: 'white'}}>{message}</p>
                                <button onClick={handleStartGame}>Iniciar Jogo</button>
                            </>
                        )}

                        {/* JOGANDO */}
                        {gameStatus === 'PLAYING' && (
                            <>
                                <h2 style={{color: '#00e5ff'}}>PERGUNTA:</h2>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '20px 0'}}>
                                    {message}
                                </p>
                                <div style={{display: 'flex', gap: '20px'}}>
                                    <button style={{background: '#2ecc71'}} onClick={() => handleAnswer(true)}>Sim</button>
                                    <button style={{background: '#e74c3c'}} onClick={() => handleAnswer(false)}>Não</button>
                                </div>
                            </>
                        )}

                        {/* ROBÔ CHUTANDO */}
                        {gameStatus === 'GUESSING' && (
                            <>
                                <h2 style={{color: '#ff9f43'}}>O ROBÔ ACHA QUE É:</h2>
                                <h1 style={{fontSize: '3rem', color: 'white', margin: '20px 0'}}>{targetCountry}</h1>
                                <p>Ele acertou?</p>
                                <div style={{display: 'flex', gap: '20px'}}>
                                    <button style={{background: '#2ecc71'}} onClick={handleConfirmWin}>Sim!</button>
                                    <button style={{background: '#e74c3c'}} onClick={handleDenyWin}>Não!</button>
                                </div>
                            </>
                        )}

                        {/* LOADING */}
                        {gameStatus === 'LOADING' && <p>Consultando banco de dados...</p>}

                        {/* FIM */}
                        {gameStatus === 'FINISHED' && (
                            <>
                                <h1 style={{color: '#2ecc71'}}>VOCÊ VENCEU!</h1>
                                <p>{message}</p>
                                <button onClick={() => setGameStatus('LOBBY')}>Jogar Novamente</button>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default Jogar;