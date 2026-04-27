import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from "../../services/api";
import Navbar from "../../components/navbar/Navbar";
import CountryCombobox from "../../components/combobox/CountryCombobox";
import { FlagStrip } from "../../components/flag-strip/FlagStrip";
import { useConfetti } from "../../hooks/useConfetti";
import '../../pages/jogar/Jogar.css';
import axios from 'axios';

// --- INTERFACES ---
export type GameStatus =
    | 'LOBBY'
    | 'LOADING'
    | 'PLAYING'
    | 'GUESSING'
    | 'WAITING_FOR_REVEAL'
    | 'FINISHED_ROBOT'
    | 'REPORT'
    | 'HUMAN_WON'
    | 'ROBOT_WON'
    | 'IN_PROGRESS'
    | 'GAVE_UP'
    | 'FINISHED_REVEALED';

export interface GameQuestion {
    id: number;
    questionId: number;
    text: string;
}

export interface Country {
    id: number;
    namePt: string;
    isoCode?: string;
    flagUrl?: string;
}

export interface QuestionData {
    id: number;
    text: string;
    category?: string;
    mapLocations?: Array<{ isoCode: string; lat: number; lng: number }>;
    validIsoCodes?: string[];
}

export interface GameResponseData {
    gameId?: number;
    status: GameStatus;
    targetCountry?: string;
    score?: number;
    attempts?: number;
    remainingCountries?: string[];
    nextQuestion?: QuestionData;
    completed?: boolean;
    feedback?: string;
    questionText?: string;
}

interface JogarProps {
    onIsoUpdate?: (isos: string[]) => void;
    onIsoReset?: () => void;
}

function Jogar({ onIsoUpdate, onIsoReset }: JogarProps) {

    // --- ESTADOS ---
    const [gameId, setGameId] = useState<number | null>(null);
    const [gameStatus, setGameStatus] = useState<GameStatus>('LOBBY');
    const [question, setQuestion] = useState<GameQuestion | null>(null);
    const [targetCountry, setTargetCountry] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('Clique em Iniciar para desafiar o Atlas!');
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountryId, setSelectedCountryId] = useState<string>('');
    const [localValidIsoCodes, setLocalValidIsoCodes] = useState<string[]>([]);
    const [questionCategory, setQuestionCategory] = useState<string | null>(null);
    const [cardPulse, setCardPulse] = useState(false);
    const [cardShake, setCardShake] = useState(false);

    const { fire: fireConfetti } = useConfetti();

    const isoToName = useMemo(() => {
        const map: Record<string, string> = {};
        countries.forEach(c => { if (c.isoCode) map[c.isoCode] = c.namePt; });
        return map;
    }, [countries]);

    const isoToFlagUrl = useMemo(() => {
        const map: Record<string, string> = {};
        countries.forEach(c => {
            if (c.isoCode && c.flagUrl) map[c.isoCode] = c.flagUrl;
        });
        return map;
    }, [countries]);

    // Busca lista de países uma vez no mount
    useEffect(() => {
        api.get('/api/countries')
            .then(r => setCountries(r.data))
            .catch(e => {
                console.error('Erro ao buscar países:', '/api/countries', e.response?.status, e);
            });
    }, []);

    // Limpa o globo ao desmontar (usuário navega para outra rota)
    useEffect(() => {
        return () => { if (onIsoReset) onIsoReset(); };
    }, [onIsoReset]);

    const pulseCard = useCallback(() => {
        setCardPulse(true);
        setTimeout(() => setCardPulse(false), 200);
    }, []);

    // --- LÓGICA CENTRAL ---
    const processResponse = useCallback((data: GameResponseData) => {
        if (data.gameId) setGameId(data.gameId);

        if (data.status === 'GUESSING') {
            // Se vier undefined, forçamos a ser null para bater com o useState
            setTargetCountry(data.targetCountry || null);
            setGameStatus('GUESSING');
            setMessage(`Eu acho que é: ${data.targetCountry}`);

        } else if (data.nextQuestion) {
            setQuestion({
                id: data.gameId || 0, // Garante que nunca será undefined
                questionId: data.nextQuestion.id,
                text: data.nextQuestion.text
            });
            setQuestionCategory(data.nextQuestion.category || null);
            setTargetCountry(null);
            setGameStatus('PLAYING');
            setMessage(data.nextQuestion.text);
            const isos = data.nextQuestion.validIsoCodes || [];
            setLocalValidIsoCodes(isos);
            if (onIsoUpdate) onIsoUpdate(isos);
            pulseCard();

        } else if (data.status === 'WAITING_FOR_REVEAL' || data.status === 'HUMAN_WON') {
            setGameStatus('WAITING_FOR_REVEAL');
            setMessage(data.questionText || 'Desisto! Não sei qual é. Me conte a verdade.');
            fireConfetti();

        } else if (data.status === 'ROBOT_WON') {
            setGameStatus('FINISHED_ROBOT');
            setMessage(data.feedback || 'Zero surpresas! Atlas was born to win');

        } else if (data.status === 'REPORT') {
            setGameStatus('REPORT');
            // Se vier undefined, forçamos a ser string vazia para bater com o useState
            setMessage(data.feedback || '');
        }
    }, [onIsoUpdate, pulseCard, fireConfetti]);

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

    const handleAnswer = useCallback(async (answer: boolean) => {
        if (!question?.id) return;
        try {
            const r = await api.post('/api/games/answer', { gameId, questionId: question.questionId, answer });
            processResponse(r.data);
        } catch (e) {
            console.error(e);
            alert('Erro ao responder.');
        }
    }, [gameId, question, processResponse]);


    const handleConfirmWin = async () => {
        try {
            const response = await api.post('/api/games/confirm', { gameId });
            processResponse(response.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDenyWin = async () => {
        setCardShake(true);
        setTimeout(() => setCardShake(false), 500);
        setMessage('Recalculando probabilidades...');
        try {
            const response = await api.post('/api/games/deny', { gameId });
            processResponse(response.data);
        } catch (e) {
            // Proteção do TypeScript (isAxiosError) para podermos acessar e.response
            if (axios.isAxiosError(e)) {
                alert(e.response?.data?.message || 'Erro ao negar.');
            } else {
                alert('Erro ao negar.');
            }
        }
    };

    const handleReveal = async () => {
        if (!selectedCountryId) {
            alert('Selecione um país!');
            return;
        }
        try {
            const response = await api.post('/api/games/reveal', { gameId, countryId: selectedCountryId });
            processResponse(response.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePlayAgain = () => {
        setGameStatus('LOBBY');
        setQuestion(null);
        setTargetCountry(null);
        setGameId(null);
        setSelectedCountryId('');
        setLocalValidIsoCodes([]);
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

                {/* Flag strip — shows candidate flags when N ≤ 50 */}
                <FlagStrip
                    validIsoCodes={localValidIsoCodes}
                    flagUrls={isoToFlagUrl}
                    countryNames={isoToName}
                />

                {/* Card principal do jogo */}
                <div className={`glass-card question-card${cardPulse ? ' card--pulse' : ''}${cardShake ? ' card--shake' : ''}`}>

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
                            <p className="loading-message" style={{ color: '#00e5ff' }}>{message}</p>
                            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                        </div>
                    )}

                    {/* 3. JOGANDO */}
                    {gameStatus === 'PLAYING' && (() => {
                        const CATEGORY_ICONS: Record<string, string> = {
                            BANDEIRA: '🚩', GEOGRAFIA: '🗺️', RELIGIÃO: '⛪',
                            CULTURA: '🎭', ECONOMIA: '💰', ESPORTE: '⚽', IDIOMA: '🗣️',
                        };
                        return (
                            <div>
                                <h2 style={{ color: '#00e5ff', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>
                                    PERGUNTA:
                                </h2>
                                <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white', margin: '0 0 24px', lineHeight: '1.5' }}>
                                    {questionCategory && (
                                        <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                                            {CATEGORY_ICONS[questionCategory] ?? '❓'}
                                        </span>
                                    )}
                                    {message}
                                </p>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button className="btn-game btn-sim" style={{ flex: 1 }} onClick={() => handleAnswer(true)}>SIM</button>
                                    <button className="btn-game btn-nao" style={{ flex: 1 }} onClick={() => handleAnswer(false)}>NÃO</button>
                                </div>
                            </div>
                        );
                    })()}

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
                            <CountryCombobox
                                countries={countries}
                                value={selectedCountryId}
                                onChange={(id) => setSelectedCountryId(String(id))}
                            />
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