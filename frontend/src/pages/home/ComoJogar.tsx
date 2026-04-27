import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import { PageHeader } from '../../components/page-header/PageHeader';

const steps = [
    {
        n: 1,
        title: 'Pense em um País',
        text: 'Qualquer um dos 197 países do mundo. Não revele — o segredo é seu!',
        tooltip: undefined,
    },
    {
        n: 2,
        title: 'Inicie a Partida',
        text: 'O Atlas vai te fazer perguntas estratégicas. Cada resposta elimina uma parte dos candidatos.',
        tooltip: undefined,
    },
    {
        n: 3,
        title: 'Observe o Globo 🌍',
        text: 'A cada pergunta, os países destacados no globo são aqueles para os quais a resposta é SIM. Se o país que você pensou está destacado, responda SIM. Se não está, responda NÃO. O globo é seu apoio visual — use-o a seu favor.',
        tooltip: 'Não entendeu? Olhe o globo enquanto joga — ele responde visualmente junto com você.',
    },
    {
        n: 4,
        title: 'Responda com Honestidade',
        text: 'O Atlas é determinístico: ele compara suas respostas com atributos verificados de cada país. Respostas honestas garantem que o jogo funcione como esperado.',
        tooltip: undefined,
    },
    {
        n: 5,
        title: 'Deixe o Atlas Tentar',
        text: 'Quando restar apenas um candidato, o Atlas vai arriscar seu palpite. Se acertar, confirme. Se errar (raro!), você pode revelar o país real e ver onde o Atlas se perdeu.',
        tooltip: undefined,
    },
    {
        n: 6,
        title: 'Explore o Mundo',
        text: 'Cada partida completa adiciona um país ao seu mapa pessoal. O objetivo? Colorir os 197 países do globo no seu perfil. Quantos você já descobriu?',
        tooltip: undefined,
    },
];

function ComoJogar() {
    return (
        <>
            <Navbar />
            <div className="main-content">
                <div className="glass-card glass-card--wide" style={{ textAlign: 'left' }}>
                    <PageHeader title="COMO JOGAR" subtitle="Entenda o motor de entropia do Atlas" />

                    <ol style={{ listStyle: 'none', padding: 0, marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {steps.map(({ n, title, text, tooltip }) => (
                            <li key={n} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <span style={{
                                    color: '#00e5ff',
                                    fontWeight: '800',
                                    fontSize: '1.2rem',
                                    minWidth: '28px',
                                    lineHeight: '1.4',
                                }}>
                                    {n}.
                                </span>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: '4px' }} title={tooltip}>
                                        {title}
                                    </strong>
                                    <span style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {text}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Callout — entropia de Shannon */}
                    <div style={{
                        borderLeft: '3px solid #00e5ff',
                        background: 'rgba(0, 229, 255, 0.06)',
                        padding: '16px 20px',
                        borderRadius: '8px',
                        marginTop: '28px',
                    }}>
                        <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <strong style={{ color: '#00e5ff' }}>💡 DICA:</strong>{' '}
                            O Atlas usa <strong style={{ color: 'white' }}>entropia de Shannon</strong> para
                            escolher a pergunta mais eficiente a cada rodada — aquela que divide os candidatos ao
                            meio. Por isso ele chega ao seu país tão rápido.
                        </p>
                    </div>

                    {/* CTA */}
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link
                            to="/jogar"
                            style={{
                                display: 'inline-block',
                                padding: '14px 36px',
                                background: 'var(--neon-cyan)',
                                color: '#000',
                                fontWeight: '800',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                letterSpacing: '1px',
                                fontSize: '0.95rem',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                        >
                            COMEÇAR A EXPLORAR →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ComoJogar;
