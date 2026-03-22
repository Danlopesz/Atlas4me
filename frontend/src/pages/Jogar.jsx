import React, { useState, useEffect } from 'react';
import api from "../services/api";
import Navbar from "../components/Navbar";
import GameGlobe from '../components/GameGlobe';
import '../assets/Jogar.css';
function Jogar() {

    // --- ESTADOS ---
    const [gameId, setGameId] = useState(null);
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, LOADING, PLAYING, GUESSING, FINISHED_ROBOT, REPORT, WAITING_FOR_REVEAL
    const [question, setQuestion] = useState(null);
    const [targetCountry, setTargetCountry] = useState(null);
    const [message, setMessage] = useState('Clique em Iniciar para desafiar o Atlas!');

    // Estado para o mapa (recebe do backend)
    const [highlightedIsos, setHighlightedIsos] = useState([]);

    // Estados para o fluxo de revelação
    const [countries, setCountries] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState("");

    // --- EFEITOS ---
    useEffect(() => {
        if (gameStatus === 'WAITING_FOR_REVEAL') {
            const fetchCountries = async () => {
                try {
                    const response = await api.get('/api/countries');
                    setCountries(response.data);
                } catch (error) {
                    console.error("Erro ao buscar países", error);
                }
            };
            fetchCountries();
        }
    }, [gameStatus]);

    // --- LÓGICA DO JOGO ---
    const processResponse = (data) => {
        console.log("Status recebido:", data.status);

        if (data.gameId) setGameId(data.gameId);

        if (data.status === 'GUESSING') {
            setTargetCountry(data.targetCountry);
            setGameStatus('GUESSING');
            setMessage(`Eu acho que é: ${data.targetCountry}`);
        }
        else if (data.nextQuestion) {
            setQuestion({
                id: data.gameId,
                questionId: data.nextQuestion.id,
                text: data.nextQuestion.text
            });
            setTargetCountry(null);
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);

            // REGRA DO HOLOFOTE:
            // O mapa ilumina ESTRITAMENTE os países que respondem SIM a esta pergunta específica
            const isos = data.nextQuestion.validIsoCodes || [];
            setHighlightedIsos(isos);
        }
        else if (data.status === 'WAITING_FOR_REVEAL' || data.status === 'HUMAN_WON') {
            setGameStatus('WAITING_FOR_REVEAL');
            setMessage(data.questionText || "Desisto! Não sei qual é. Me conte a verdade.");
        }
        else if (data.status === 'ROBOT_WON') {
            setGameStatus('FINISHED_ROBOT');
            setMessage(data.feedback || "Zero surpresas! Atlas was born to win");
        }
        else if (data.status === 'REPORT') {
            setGameStatus('REPORT');
            setMessage(data.feedback);
        }
    };

    // --- HANDLERS ---
    const handleStartGame = async () => {
        setGameStatus('LOADING');
        setMessage('Estabelecendo conexão via satélite...');
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
                gameId: gameId,
                questionId: question.questionId,
                answer: userAnswer
            };
            const response = await api.post('/api/games/answer', payload);
            processResponse(response.data);
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao responder.");
        }
    };

    const handleConfirmWin = async () => {
        try {
            const response = await api.post('/api/games/confirm', { gameId: gameId });
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao confirmar:", error);
        }
    };

    const handleDenyWin = async () => {
        try {
            setMessage("Recalculando probabilidades...");
            const response = await api.post('/api/games/deny', { gameId: gameId });
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao negar:", error);
            alert(error.response?.data?.message || "Erro ao negar.");
        }
    };

    const handleReveal = async () => {
        if (!selectedCountryId) return alert("Selecione um país!");
        try {
            const payload = {
                gameId: gameId,
                countryId: selectedCountryId
            };
            const response = await api.post('/api/games/reveal', payload);
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao revelar", error);
        }
    };

    const handlePlayAgain = () => {
        setGameStatus('LOBBY');
        setQuestion(null);
        setTargetCountry(null);
        setGameId(null);
        setHighlightedIsos([]);
        setSelectedCountryId("");
        setTimeout(() => setMessage('Clique em Iniciar para desafiar o Atlas!'), 0);
    };

    // --- RENDERIZAÇÃO (LAYOUT DIVIDIDO) ---
    return (
        <>
            <Navbar />

            {/* CONTAINER PRINCIPAL */}
            <div className="game-container">

                {/* --- LADO ESQUERDO: CONTROLE E PERGUNTAS --- */}
                <div className="question-zone">

                    <div className="glass-card question-card">

                        {/* 1. LOBBY */}
                        {gameStatus === 'LOBBY' && (
                            <div style={{ textAlign: 'center' }}>
                                <h1 style={{ fontSize: '2rem', color: 'white', marginBottom: '10px' }}>JÁ PENSOU NO PAÍS?</h1>
                                <p style={{ margin: '20px 0', color: '#ccc' }}>{message}</p>
                                <button className="btn-primary" onClick={handleStartGame}>INICIAR</button>
                            </div>
                        )}

                        {/* 2. LOADING */}
                        {gameStatus === 'LOADING' && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="spinner" style={{
                                    width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)',
                                    borderTop: '4px solid #00e5ff', borderRadius: '50%', margin: '0 auto 20px',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ color: '#00e5ff' }}>{message}</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                        {/* 3. JOGANDO (A Pergunta) */}
                        {gameStatus === 'PLAYING' && (
                            <div>
                                <h2 style={{ color: '#00e5ff', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    PERGUNTA:
                                </h2>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: '30px 0', lineHeight: '1.4' }}>
                                    {message}
                                </p>
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <button className="btn-game btn-sim" style={{ flex: 1 }} onClick={() => handleAnswer(true)}>
                                        SIM
                                    </button>
                                    <button className="btn-game btn-nao" style={{ flex: 1 }} onClick={() => handleAnswer(false)}>
                                        NÃO
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 4. ROBÔ CHUTANDO */}
                        {gameStatus === 'GUESSING' && (
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ color: '#ff9f43', letterSpacing: '2px' }}>ATLAS INFORMA! O PAÍS É:</h2>
                                <h1 style={{ fontSize: '3rem', margin: '20px 0', color: 'white', textTransform: 'uppercase' }}>{targetCountry}</h1>
                                <p style={{ marginBottom: '20px' }}>ATLAS ACERTOU?</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button className="btn-game" style={{ background: '#2ecc71' }} onClick={handleConfirmWin}>OBVIO!</button>
                                    <button className="btn-game" style={{ background: '#e74c3c' }} onClick={handleDenyWin}>PREPOTENTE, ATLAS ERROU</button>
                                </div>
                            </div>
                        )}

                        {/* 5. WAITING FOR REVEAL (Robô perdeu) */}
                        {gameStatus === 'WAITING_FOR_REVEAL' && (
                            <div style={{ textAlign: 'center' }}>
                                <h1 style={{ color: '#2ecc71', marginBottom: '10px' }}>VOCÊ VENCEU! 🏆</h1>
                                <p style={{ marginBottom: '20px' }}>{message}</p>
                                <select
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}
                                    value={selectedCountryId}
                                    onChange={(e) => setSelectedCountryId(e.target.value)}
                                >
                                    <option value="">Selecione o país real...</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button className="btn-primary" onClick={handleReveal}>ENVIAR RELATÓRIO</button>
                            </div>
                        )}

                        {/* 6. REPORT (Fim do jogo) */}
                        {gameStatus === 'REPORT' && (
                            <div style={{ textAlign: 'left' }}>
                                <h2 style={{ textAlign: 'center', color: '#ff9f43', marginBottom: '20px' }}>RELATÓRIO FINAL</h2>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
                                </div>
                                <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={handlePlayAgain}>JOGAR NOVAMENTE</button>
                            </div>
                        )}

                        {/* 7. ROBÔ VENCEU */}
                        {gameStatus === 'FINISHED_ROBOT' && (
                            <div style={{ textAlign: 'center' }}>
                                <h1 style={{ color: '#ff9f43' }}>ATLAS WINNER! 🤖</h1>
                                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>{message}</p>
                                <button className="btn-primary" onClick={handlePlayAgain}>JOGAR NOVAMENTE</button>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- LADO DIREITO: MAPA HOLOGRÁFICO --- */}
                <div className="map-zone">

                    {/* O Mapa com tamanho controlado */}
                    <div style={{ width: '100%', maxWidth: '700px', height: '80%', maxHeight: '800px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <GameGlobe validIsoCodes={highlightedIsos} />
                    </div>
                </div>

            </div>
        </>
    );
}

export default Jogar;