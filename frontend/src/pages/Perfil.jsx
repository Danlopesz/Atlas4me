import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';


function Perfil() {
    const [history, setHistory] = useState([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/api/games/history');
            setHistory(response.data);
        } catch (error) {
            console.error("Erro ao buscar histórico", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CÁLCULOS DAS ESTATÍSTICAS ---
    const totalGames = history.length;
    const defeats = history.filter(h => h.status === 'ROBOT_WON').length;
    const wins = totalGames - defeats;

    return (
        <>
            <Navbar />
            <div className="main-content" style={{ flexDirection: 'column', padding: '100px 20px' }}>

                {/* CABEÇALHO DO PERFIL (STATS) */}
                <div className="glass-card" style={{ maxWidth: '900px', marginBottom: '30px', textAlign: 'left' }}>
                    <h1 style={{ fontSize: '2rem', color: 'var(--neon-cyan)', textTransform: 'uppercase' }}>{userName}</h1>

                    <div style={{ display: 'flex', gap: '40px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {/* Partidas */}
                        <div>
                            <h3 style={{ color: '#ccc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Partidas</h3>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>{totalGames}</p>
                        </div>

                        {/* Vitórias */}
                        <div>
                            <h3 style={{ color: '#ccc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Vitórias (Você)</h3>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2ecc71' }}>{wins}</p>
                        </div>

                        {/* Derrotas */}
                        <div>
                            <h3 style={{ color: '#ccc', fontSize: '0.9rem', textTransform: 'uppercase' }}>Derrotas (Robô)</h3>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e74c3c' }}>{defeats}</p>
                        </div>
                    </div>
                </div>

                {/* TABELA DE HISTÓRICO */}
                <div className="glass-card" style={{ maxWidth: '900px', padding: '20px' }}>
                    <h2 style={{ color: '#b0b0b0', marginBottom: '20px', textAlign: 'left' }}>HISTÓRICO RECENTE</h2>

                    {loading ? (
                        <p>Carregando histórico...</p>
                    ) : history.length === 0 ? (
                        <p>Você ainda não jogou nenhuma partida logado.</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {/* CORREÇÃO 1: Adicionado tableLayout: 'fixed' na tag table */}
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                color: 'white',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>
                                        {/* As larguras aqui agora serão respeitadas */}
                                        <th style={{ padding: '15px', width: '20%' }}>Data</th>
                                        <th style={{ padding: '15px', width: '20%' }}>Resultado</th>
                                        <th style={{ padding: '15px', width: '40%' }}>País Alvo</th>
                                        <th style={{ padding: '15px', width: '20%', textAlign: 'right' }}>Pontos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((game) => (
                                        <tr key={game.gameId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px', color: '#ccc' }}>
                                                Recente
                                            </td>

                                            <td style={{ padding: '15px' }}>
                                                {game.status === 'ROBOT_WON' ?
                                                    <span style={{ color: '#ff9f43', fontWeight: 'bold' }}>Derrota</span> :
                                                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Vitória</span>
                                                }
                                            </td>

                                            {/* CORREÇÃO 2: Tratamento para nomes de países longos não quebrarem a tabela */}
                                            <td style={{
                                                padding: '15px',
                                                textTransform: 'uppercase',
                                                color: 'var(--neon-cyan)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={game.targetCountry}> {/* Title mostra o nome completo ao passar o mouse */}
                                                {game.targetCountry || "?"}
                                            </td>

                                            <td style={{ padding: '15px', fontWeight: 'bold', textAlign: 'right' }}>
                                                {game.score}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Perfil;