import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from "../services/api";
import Navbar from "../components/Navbar";
import '../assets/Jogar.css';

// Props:
//   onIsoUpdate(isos: string[]) — atualiza ISOs destacados no UnifiedGlobe (via App.jsx)
//   onIsoReset()               — limpa destaques ao desmontar

function Jogar({ onIsoUpdate, onIsoReset }) {

    // --- ESTADOS ---
    const [gameId, setGameId] = useState(null);
    const [gameStatus, setGameStatus] = useState('LOBBY');
    const [question, setQuestion] = useState(null);
    const [targetCountry, setTargetCountry] = useState(null);
    const [message, setMessage] = useState('Clique em Iniciar para desafiar o Atlas!');
    const [countries, setCountries] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState('');

    // Busca lista de países para o reveal
    useEffect(() => {
        if (gameStatus !== 'WAITING_FOR_REVEAL') return;
        api.get('/api/countries')
            .then(r => setCountries(r.data))
            .catch(e => console.error('Erro ao buscar países', e));
    }, [gameStatus]);

    // Limpa o globo ao desmontar (usuário navega para outra rota)
    useEffect(() => {
        return () => { if (onIsoReset) onIsoReset(); };
    }, [onIsoReset]);

    // --- LÓGICA CENTRAL ---
    const processResponse = useCallback((data) => {
        if (data.gameId) setGameId(data.gameId);

        if (data.status === 'GUESSING') {
            setTargetCountry(data.targetCountry);
            setGameStatus('GUESSING');
            setMessage(`Eu acho que é: ${data.targetCountry}`);

        } else if (data.nextQuestion) {
            setQuestion({ id: data.gameId, questionId: data.nextQuestion.id, text: data.nextQuestion.text });
            setTargetCountry(null);
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);
            if (onIsoUpdate) onIsoUpdate(data.nextQuestion.validIsoCodes || []);

        } else if (data.status === 'WAITING_FOR_REVEAL' || data.status === 'HUMAN_WON') {
            setGameStatus('WAITING_FOR_REVEAL');
            setMessage(data.questionText || 'Desisto! Não sei qual é. Me conte a verdade.');

        } else if (data.status === 'ROBOT_WON') {
            setGameStatus('FINISHED_ROBOT');
            setMessage(data.feedback || 'Zero surpresas! Atlas was born to win');

        } else if (data.status === 'REPORT') {
            setGameStatus('REPORT');
            setMessage(data.feedback);
        }
    }, [onIsoUpdate]);

    // --- HANDLERS ---
    const handleStartGame = async () => {
        setGameStatus('LOADING');
        setMessage('Estabelecendo conexão via satélite...');
        if (onIsoUpdate) onIsoUpdate([]);
        try {
            const r = await api.post('/api/games/start');
            processResponse(r.data);
        } catch (e) {
            console.error(e);
            setGameStatus('LOBBY');
            setMessage('Erro ao conectar com o cérebro do Atlas.');
        }
    };

    const handleAnswer = async (answer) => {
        if (!question?.id) return;
        try {
            const r = await api.post('/api/games/answer', { gameId, questionId: question.questionId, answer });
            processResponse(r.data);
        } catch (e) {
            console.error(e);
            alert('Erro ao responder.');
        }
    };

    const handleConfirmWin = async () => {
        try { processResponse((await api.post('/api/games/confirm', { gameId })).data); }
        catch (e) { console.error(e); }
    };

    const handleDenyWin = async () => {
        setMessage('Recalculando probabilidades...');
        try { processResponse((await api.post('/api/games/deny', { gameId })).data); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao negar.'); }
    };

    const handleReveal = async () => {
        if (!selectedCountryId) return alert('Selecione um país!');
        try { processResponse((await api.post('/api/games/reveal', { gameId, countryId: selectedCountryId })).data); }
        catch (e) { console.error(e); }
    };

    const handlePlayAgain = () => {
        setGameStatus('LOBBY');
        setQuestion(null);
        setTargetCountry(null);
        setGameId(null);
        setSelectedCountryId('');
        if (onIsoUpdate) onIsoUpdate([]);
        setTimeout(() => setMessage('Clique em Iniciar para desafiar o Atlas!'), 0);
    };

    // --- RENDERIZAÇÃO: CARD FLUTUANTE GLASSMORPHISM ---
    // A Navbar é global (renderizada pelo App em z-index 500).
    // O .game-overlay é posicionado e estilizado no GlobalLayout.css.
    return (
        <>
            {/* Navbar global, sempre no topo — pointer-events: auto via CSS */}
            <Navbar />

            {/* Card flutuante de perguntas (glassmorphism, canto esquerdo) */}
            <div className="overlay-panel game-overlay is-visible">

                {/* Cabeçalho */}
                <div className="game-header">
                    <Link to="/" className="game-header-link">← INÍCIO</Link>
                    <span className="game-header-sep">|</span>
                    <span className="game-header-label">ATLAS INTELLIGENCE</span>
                </div>

                {/* Card principal do jogo */}
                <div className="glass-card question-card">

                    {/* 1. LOBBY */}
                    {gameStatus === 'LOBBY' && (
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '1.7rem', color: 'white', marginBottom: '10px' }}>
                                JÁ PENSOU NO PAÍS?
                            </h1>
                            <p style={{ margin: '16px 0', color: '#ccc' }}>{message}</p>
                            <button className="btn-primary" onClick={handleStartGame}>INICIAR</button>
                        </div>
                    )}

                    {/* 2. LOADING */}
                    {gameStatus === 'LOADING' && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                border: '4px solid rgba(255,255,255,0.1)',
                                borderTop: '4px solid #00e5ff',
                                borderRadius: '50%', margin: '0 auto 20px',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p style={{ color: '#00e5ff' }}>{message}</p>
                            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                        </div>
                    )}

                    {/* 3. JOGANDO */}
                    {gameStatus === 'PLAYING' && (
                        <div>
                            <h2 style={{ color: '#00e5ff', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>
                                PERGUNTA:
                            </h2>
                            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', margin: '0 0 24px', lineHeight: '1.5' }}>
                                {message}
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-game btn-sim" style={{ flex: 1 }} onClick={() => handleAnswer(true)}>SIM</button>
                                <button className="btn-game btn-nao" style={{ flex: 1 }} onClick={() => handleAnswer(false)}>NÃO</button>
                            </div>
                        </div>
                    )}

                    {/* 4. GUESSING */}
                    {gameStatus === 'GUESSING' && (
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#ff9f43', letterSpacing: '2px', marginBottom: '10px' }}>ATLAS INFORMA! O PAÍS É:</h2>
                            <h1 style={{ fontSize: '2.2rem', margin: '10px 0', color: 'white', textTransform: 'uppercase' }}>{targetCountry}</h1>
                            <p style={{ marginBottom: '18px', color: '#ccc' }}>ATLAS ACERTOU?</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-game" style={{ background: '#2ecc71', flex: 1 }} onClick={handleConfirmWin}>ÓBVIO!</button>
                                <button className="btn-game" style={{ background: '#e74c3c', flex: 1 }} onClick={handleDenyWin}>ERROU!</button>
                            </div>
                        </div>
                    )}

                    {/* 5. WAITING_FOR_REVEAL */}
                    {gameStatus === 'WAITING_FOR_REVEAL' && (
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ color: '#2ecc71', marginBottom: '10px' }}>VOCÊ VENCEU! 🏆</h1>
                            <p style={{ marginBottom: '18px', color: '#ccc' }}>{message}</p>
                            <select
                                style={{
                                    width: '100%', padding: '10px', marginBottom: '18px',
                                    borderRadius: '8px', background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(0,229,255,0.3)', color: 'white', fontFamily: 'inherit'
                                }}
                                value={selectedCountryId}
                                onChange={e => setSelectedCountryId(e.target.value)}
                            >
                                <option value="">Selecione o país real...</option>
                                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button className="btn-primary" onClick={handleReveal}>ENVIAR RELATÓRIO</button>
                        </div>
                    )}

                    {/* 6. REPORT */}
                    {gameStatus === 'REPORT' && (
                        <div>
                            <h2 style={{ textAlign: 'center', color: '#ff9f43', marginBottom: '16px' }}>RELATÓRIO FINAL</h2>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                                <p style={{ whiteSpace: 'pre-wrap', color: '#ccc', fontSize: '0.88rem' }}>{message}</p>
                            </div>
                            <button className="btn-primary" style={{ marginTop: '18px', width: '100%' }} onClick={handlePlayAgain}>JOGAR NOVAMENTE</button>
                        </div>
                    )}

                    {/* 7. ROBOT_WON */}
                    {gameStatus === 'FINISHED_ROBOT' && (
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ color: '#ff9f43' }}>ATLAS WINNER! 🤖</h1>
                            <p style={{ fontSize: '1.1rem', margin: '18px 0', color: '#ccc' }}>{message}</p>
                            <button className="btn-primary" onClick={handlePlayAgain}>JOGAR NOVAMENTE</button>
                        </div>
                    )}

                </div>

            </div>
        </>
    );
}

export default Jogar;