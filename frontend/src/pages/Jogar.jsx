import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Jogar() {
    const navigate = useNavigate();

    // Estados do Jogo
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, PLAYING, GUESSING, WAITING_FOR_REVEAL, REPORT, ROBOT_WON
    const [question, setQuestion] = useState(null);
    const [targetCountry, setTargetCountry] = useState(null); // Palpite do Robô
    const [message, setMessage] = useState('Clique em Iniciar para desafiar o Atlas!');
    const [userName, setUserName] = useState('');

    // Estados para o "Modo Detetive" (Revelação)
    const [countries, setCountries] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState("");

    // Carrega nome do usuário ao abrir
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    // Carrega lista de países se o robô desistir
    useEffect(() => {
        if (gameStatus === 'WAITING_FOR_REVEAL') {
            fetchCountries();
        }
    }, [gameStatus]);

    const fetchCountries = async () => {
        try {
            // Se ainda não tiver essa rota no back, o array vazio evita erro, 
            // mas o ideal é criar o endpoint @GetMapping("/api/countries")
            const response = await api.get('/api/countries');
            setCountries(response.data);
        } catch (error) {
            console.error("Erro ao buscar países", error);
            // Fallback temporário para teste se a API falhar
            setCountries([
                { id: 1, name: "Brasil" }, { id: 2, name: "Argentina" }, { id: 3, name: "Uruguai" },
                { id: 13, name: "Guiana Francesa" } // Adicione outros se precisar testar sem backend
            ]);
        }
    };

    // --- PROCESSADOR CENTRAL DE RESPOSTAS ---
    const processResponse = (data) => {
        console.log("Status recebido:", data.status); // Para debug

        // 1. Robô chutando um país
        if (data.status === 'GUESSING') {
            setTargetCountry(data.targetCountry);
            setGameStatus('GUESSING');
            setMessage(`Eu acho que é: ${data.targetCountry}`);
        }
        // 2. Jogo continua (Próxima pergunta)
        else if (data.nextQuestion) {
            setQuestion({
                id: data.gameId,
                questionId: data.nextQuestion.id,
                text: data.nextQuestion.text
            });
            setTargetCountry(null);
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);
        }
        // 3. Robô desistiu (Vitória Humana -> Hora de revelar)
        else if (data.status === 'WAITING_FOR_REVEAL' || data.status === 'HUMAN_WON') {
            setGameStatus('WAITING_FOR_REVEAL');
            setMessage(data.questionText || "Desisto! Não sei qual é. Me conte a verdade.");
        }
        // 4. Robô venceu (Confirmado pelo usuário)
        else if (data.status === 'ROBOT_WON') {
            setGameStatus('FINISHED_ROBOT');
            setMessage(data.feedback || "Eu sabia! Sou um gênio!");
        }
        // 5. Relatório do Detetive (Pós-revelação)
        else if (data.status === 'REPORT') {
            setGameStatus('REPORT');
            setMessage(data.feedback);
        }
    };

    // --- AÇÕES DO USUÁRIO ---

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
            // setMessage("Processando..."); // Opcional, pode tirar se piscar muito
            const response = await api.post('/api/games/answer', payload);
            processResponse(response.data);
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao responder.");
        }
    };

    const handleConfirmWin = async () => {
        try {
            const response = await api.post('/api/games/confirm');
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao confirmar:", error);
        }
    };

    const handleDenyWin = async () => {
        try {
            setMessage("Pensando novamente...");
            const response = await api.post('/api/games/deny');
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao negar:", error);
            alert(error.response?.data?.message || "Erro ao negar.");
        }
    };

    const handleReveal = async () => {
        if (!selectedCountryId) return alert("Selecione um país!");
        try {
            const payload = { countryId: selectedCountryId };
            const response = await api.post('/api/games/reveal', payload);
            processResponse(response.data);
        } catch (error) {
            console.error("Erro ao revelar", error);
        }
    };

    // Função para limpar o estado e voltar ao início
    const handlePlayAgain = () => {
        setGameStatus('LOBBY');
        setMessage('Clique em Iniciar para desafiar o Atlas!'); // Restaura a mensagem original
        setQuestion(null);
        setTargetCountry(null);
        setSelectedCountryId("");
        setTimeout(() => setMessage('Clique em Iniciar para desafiar o Atlas!'), 0);
        // Não limpamos o userName para não deslogar o usuário
    };

    // --- RENDERIZAÇÃO ---
    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card" style={{ maxWidth: '800px' }}>

                    <h2 style={{ fontSize: '1.5rem', color: '#b0b0b0', marginBottom: '20px' }}>
                        {userName ? `Olá, ${userName}!` : 'Desafio Atlas'}
                    </h2>

                    {/* ÁREA DINÂMICA DO JOGO */}
                    <div>

                        {/* 1. LOBBY */}
                        {gameStatus === 'LOBBY' && (
                            <>
                                <h1>BEM-VINDO</h1>
                                <p style={{ fontSize: '1.2rem', color: 'white' }}>{message}</p>
                                <button className="btn-primary" onClick={handleStartGame}>Iniciar Jogo</button>
                            </>
                        )}

                        {/* 2. JOGANDO (Perguntas) */}
                        {gameStatus === 'PLAYING' && (
                            <>
                                <h2 style={{ color: '#00e5ff' }}>PERGUNTA:</h2>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: '30px 0' }}>
                                    {message}
                                </p>
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <button style={{ background: '#2ecc71', width: '120px' }} onClick={() => handleAnswer(true)}>Sim 👍</button>
                                    <button style={{ background: '#e74c3c', width: '120px' }} onClick={() => handleAnswer(false)}>Não 👎</button>
                                </div>
                            </>
                        )}

                        {/* 3. ROBÔ CHUTANDO */}
                        {gameStatus === 'GUESSING' && (
                            <>
                                <h2 style={{ color: '#ff9f43' }}>O ROBÔ ACHA QUE É:</h2>
                                <h1 style={{ fontSize: '3.5rem', color: 'white', margin: '20px 0', textTransform: 'uppercase' }}>
                                    {targetCountry}
                                </h1>
                                <p>Ele acertou?</p>
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <button style={{ background: '#2ecc71' }} onClick={handleConfirmWin}>Sim! 😱</button>
                                    <button style={{ background: '#e74c3c' }} onClick={handleDenyWin}>Não! 🤣</button>
                                </div>
                            </>
                        )}

                        {/* 4. ROBÔ DESISTIU (REVELAÇÃO) */}
                        {gameStatus === 'WAITING_FOR_REVEAL' && (
                            <>
                                <h1 style={{ color: '#2ecc71' }}>VOCÊ VENCEU! 🏆</h1>
                                <p style={{ fontSize: '1.2rem' }}>{message}</p>

                                <div style={{ margin: '30px 0' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', color: '#b0b0b0' }}>
                                        Qual era o país que você pensou?
                                    </label>
                                    <select
                                        value={selectedCountryId}
                                        onChange={(e) => setSelectedCountryId(e.target.value)}
                                        style={{
                                            padding: '15px',
                                            borderRadius: '10px',
                                            width: '100%',
                                            maxWidth: '400px',
                                            color: '#333',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="">Selecione na lista...</option>
                                        {countries.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button className="btn-primary" onClick={handleReveal}>
                                    Verificar e ver Relatório 🕵️‍♂️
                                </button>
                            </>
                        )}

                        {/* 5. RELATÓRIO FINAL */}
                        {gameStatus === 'REPORT' && (
                            <div style={{ textAlign: 'left' }}>
                                <h2 style={{ textAlign: 'center', color: '#ff9f43', marginBottom: '20px' }}>
                                    RELATÓRIO DO DETETIVE 🔍
                                </h2>
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem' }}>
                                        {message}
                                    </p>
                                </div>
                                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handlePlayAgain}>
                                    Jogar Novamente
                                </button>
                            </div>
                        )}

                        {/* 6. ROBÔ VENCEU (FIM DE JOGO) */}
                        {gameStatus === 'FINISHED_ROBOT' && (
                            <>
                                <h1 style={{ color: '#ff9f43' }}>O ROBÔ VENCEU! 🤖</h1>
                                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>{message}</p>
                                <button className="btn-primary" onClick={handlePlayAgain}>
                                    Jogar Novamente
                                </button>
                            </>
                        )}

                        {/* LOADING GENÉRICO */}
                        {gameStatus === 'LOADING' && (
                            <div style={{ padding: '40px' }}>
                                <div className="spinner" style={{
                                    width: '40px', height: '40px',
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    borderTop: '4px solid #00e5ff',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 20px'
                                }}></div>
                                <p>Processando...</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default Jogar;