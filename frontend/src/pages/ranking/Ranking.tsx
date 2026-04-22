import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/navbar/Navbar';
import api from '../../services/api';
import '../../pages/ranking/Ranking.css';

interface RankingEntryResponse {
    rank: number | null;
    userId: number;
    displayName: string;
    discoveredCountries: number;
    lastDiscoveryFormatted: string;
}

interface RankingResponse {
    topPlayers: RankingEntryResponse[];
    currentUserEntry: RankingEntryResponse | null;
    totalActivePlayers: number;
}

function medal(rank: number | null): string | number {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank ?? '—';
}

function Ranking() {
    const [data, setData] = useState<RankingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRanking = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get<RankingResponse>('/api/ranking')
            .then(r => setData(r.data))
            .catch(() => setError('Erro ao carregar o ranking.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchRanking(); }, [fetchRanking]);

    const currentUserId = data?.currentUserEntry?.userId ?? null;
    const userInTop = currentUserId !== null
        ? data!.topPlayers.some(p => p.userId === currentUserId)
        : false;

    const renderRow = (entry: RankingEntryResponse, isCurrent: boolean) => (
        <tr key={entry.userId} className={isCurrent ? 'ranking-row-current' : ''}>
            <td>
                <span className="ranking-medal">{medal(entry.rank)}</span>
            </td>
            <td>{entry.displayName}</td>
            <td className="ranking-discovered">{entry.discoveredCountries}</td>
            <td className="col-last-country">{entry.lastDiscoveryFormatted}</td>
        </tr>
    );

    return (
        <>
            <Navbar />
            <div className="main-content" style={{ flexDirection: 'column' }}>
                <div className="glass-card glass-card--profile">

                    <div className="ranking-header">
                        <h1>Ranking Global</h1>
                        {data && (
                            <p>{data.totalActivePlayers} explorador{data.totalActivePlayers !== 1 ? 'es' : ''} ativo{data.totalActivePlayers !== 1 ? 's' : ''}</p>
                        )}
                    </div>

                    {loading && (
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando ranking...</p>
                    )}

                    {error && (
                        <div className="ranking-error">
                            <p>{error}</p>
                            <button className="ranking-retry-btn" onClick={fetchRanking}>
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading && !error && data && (
                        data.topPlayers.length === 0 ? (
                            <p className="ranking-empty">Nenhum explorador ainda. Seja o primeiro!</p>
                        ) : (
                            <table className="ranking-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>#</th>
                                        <th>Explorador</th>
                                        <th>Países Descobertos</th>
                                        <th className="col-last-country">Último Descoberto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topPlayers.map(entry =>
                                        renderRow(entry, entry.userId === currentUserId)
                                    )}

                                    {!userInTop && data.currentUserEntry && (
                                        <>
                                            <tr className="ranking-separator">
                                                <td colSpan={4}>• • •</td>
                                            </tr>
                                            {renderRow(data.currentUserEntry, true)}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        )
                    )}

                </div>
            </div>
        </>
    );
}

export default Ranking;
