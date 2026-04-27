import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import { ProfileGlobe } from '../../components/globe/ProfileGlobe';
import api from '../../services/api';
import '../../pages/perfil/Perfil.css';
import { PageHeader } from '../../components/page-header/PageHeader';

interface ProfileStats {
    displayName: string;
    discoveredIsoCodes: string[];
    totalDiscovered: number;
    totalGames: number;
    totalWins: number;
    totalDefeats: number;
    lastDiscoveredCountry: string | null;
}

interface GameHistoryItem {
    gameId: string;
    status: string;
    targetCountry?: string;
    points?: number;
}

const TOTAL_COUNTRIES = 197;

function getMotivation(pct: number): string {
    if (pct < 10) return 'Sua jornada está começando...';
    if (pct < 30) return 'Você está explorando o mundo!';
    if (pct < 60) return 'Metade do mundo já te conhece.';
    if (pct < 90) return 'Quase um Atlas humano!';
    return 'Lenda da geografia mundial. 🌍';
}

function Perfil() {
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [history, setHistory] = useState<GameHistoryItem[]>([]);
    const [progressWidth, setProgressWidth] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = api.get<ProfileStats>('/api/users/profile/stats');
        const fetchHistory = api.get<GameHistoryItem[]>('/api/games/history');

        Promise.allSettled([fetchStats, fetchHistory]).then(([statsResult, historyResult]) => {
            if (statsResult.status === 'fulfilled') {
                const data = statsResult.value.data;
                setStats(data);
                const pct = (data.totalDiscovered / TOTAL_COUNTRIES) * 100;
                setTimeout(() => setProgressWidth(pct), 100);
            }
            if (historyResult.status === 'fulfilled') {
                setHistory(historyResult.value.data);
            }
            setLoading(false);
        });
    }, []);

    const pct = stats ? (stats.totalDiscovered / TOTAL_COUNTRIES) * 100 : 0;

    return (
        <>
            <Navbar />
            <div className="main-content" style={{ flexDirection: 'column' }}>
                <PageHeader title="SEU PERFIL" subtitle={stats?.displayName} />

                {/* SEÇÃO 1 — Hero */}
                <div className="glass-card glass-card--profile profile-hero" style={{ marginBottom: '24px' }}>
                    <h1 className="profile-display-name">
                        {stats?.displayName ?? '...'}
                    </h1>

                    <div className="profile-discovered-badge">
                        {stats?.totalDiscovered ?? 0} / {TOTAL_COUNTRIES} países descobertos
                    </div>

                    <div className="profile-progress-bar">
                        <div
                            className="profile-progress-fill"
                            style={{ width: `${progressWidth}%` }}
                        />
                    </div>

                    <p className="profile-motivation">{getMotivation(pct)}</p>
                </div>

                {/* SEÇÃO 2 — Globo */}
                <div className="glass-card glass-card--profile profile-globe-section" style={{ marginBottom: '24px' }}>
                    <div className="profile-globe-wrapper">
                        <ProfileGlobe isoCodesDiscovered={stats?.discoveredIsoCodes ?? []} />
                    </div>

                    {stats?.lastDiscoveredCountry && (
                        <p className="profile-last-country">
                            Último descoberto: <span>{stats.lastDiscoveredCountry}</span>
                        </p>
                    )}
                </div>

                {/* SEÇÃO 3 — Estatísticas + Histórico */}
                <div className="glass-card glass-card--profile" style={{ padding: '28px' }}>

                    {/* Grid de stats */}
                    <div className="profile-stats-grid">
                        <div className="profile-stat-card">
                            <span className="profile-stat-number">{stats?.totalGames ?? 0}</span>
                            <span className="profile-stat-label">Partidas</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-number" style={{ color: '#2ecc71' }}>
                                {stats?.totalWins ?? 0}
                            </span>
                            <span className="profile-stat-label">Vitórias</span>
                        </div>
                        <div className="profile-stat-card">
                            <span className="profile-stat-number" style={{ color: '#e74c3c' }}>
                                {stats?.totalDefeats ?? 0}
                            </span>
                            <span className="profile-stat-label">Derrotas</span>
                        </div>
                    </div>

                    {/* Histórico */}
                    <h2 className="profile-history-title">Histórico Recente</h2>

                    {loading ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando...</p>
                    ) : history.length === 0 ? (
                        <div className="profile-empty-cta">
                            <p>Você ainda não jogou. Que tal começar agora?</p>
                            <Link to="/jogar" className="btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
                                JOGAR
                            </Link>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                color: 'white',
                                tableLayout: 'fixed',
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', width: '25%' }}>Data</th>
                                        <th style={{ padding: '12px', width: '50%' }}>País Alvo</th>
                                        <th style={{ padding: '12px', width: '25%' }}>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((game) => (
                                        <tr key={game.gameId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', color: '#ccc', fontSize: '0.85rem' }}>
                                                Recente
                                            </td>
                                            <td style={{
                                                padding: '12px',
                                                textTransform: 'uppercase',
                                                color: 'var(--neon-cyan)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontSize: '0.9rem',
                                            }} title={game.targetCountry}>
                                                {game.targetCountry ?? '?'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {game.status === 'ROBOT_WON' ? (
                                                    <span style={{ color: '#ff9f43', fontWeight: 'bold' }}>Derrota</span>
                                                ) : (
                                                    <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Vitória</span>
                                                )}
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
