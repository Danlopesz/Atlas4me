import React from 'react';

// Posições aproximadas dos centros dos países no mapa (para labels e highlights)
// Baseado na imagem real em /img/south-america-map.png
const COUNTRY_CENTERS = {
    've': { x: 300, y: 120, name: 'VENEZUELA' },
    'co': { x: 250, y: 180, name: 'COLÔMBIA' },
    'ec': { x: 220, y: 240, name: 'EQUADOR' },
    'pe': { x: 240, y: 340, name: 'PERU' },
    'br': { x: 420, y: 340, name: 'BRASIL' },
    'bo': { x: 300, y: 400, name: 'BOLÍVIA' },
    'py': { x: 340, y: 480, name: 'PARAGUAI' },
    'uy': { x: 380, y: 560, name: 'URUGUAI' },
    'ar': { x: 300, y: 650, name: 'ARGENTINA' },
    'cl': { x: 220, y: 580, name: 'CHILE' },
    'gy': { x: 360, y: 160, name: 'GUIANA' },
    'sr': { x: 390, y: 170, name: 'SURINAME' },
    'gf': { x: 420, y: 180, name: 'G. FRANCESA' }
};

// Configuração de leader lines para evitar sobreposição
const LEADER_LINES = {
    've': { labelX: 450, labelY: 100 },
    'co': { labelX: 150, labelY: 160 },
    'ec': { labelX: 120, labelY: 230 },
    'pe': { labelX: 130, labelY: 340 },
    'gy': { labelX: 480, labelY: 140 },
    'sr': { labelX: 500, labelY: 160 },
    'gf': { labelX: 520, labelY: 180 }
};

const SouthAmericaHologram = ({ activeLocations = [] }) => {

    const activeIsos = activeLocations.map(loc => loc.isoCode.toLowerCase());
    const isActive = (iso) => activeIsos.includes(iso);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'radial-gradient(ellipse at center, rgba(0, 30, 60, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%)',
            overflow: 'hidden'
        }}>

            {/* Container do mapa */}
            <div style={{
                position: 'relative',
                width: '90%',
                height: '90%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>

                {/* Imagem base do mapa REAL */}
                <img
                    src="/img/south-america-map.png"
                    alt="South America"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        opacity: 0.75,
                        filter: 'brightness(0.85) contrast(1.3)'
                    }}
                />

                {/* SVG Overlay para labels e efeitos */}
                <svg
                    viewBox="0 0 600 800"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >
                    {/* Título */}
                    <text
                        x="300"
                        y="30"
                        textAnchor="middle"
                        fill="#00e5ff"
                        fontSize="16"
                        fontFamily="'Courier New', monospace"
                        fontWeight="bold"
                        letterSpacing="3"
                        style={{ opacity: 0.95 }}
                    >
                        TACTICAL SCAN // SOUTH AMERICA
                    </text>

                    {/* Filtros */}
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(0, 229, 255, 0)" />
                            <stop offset="50%" stopColor="rgba(0, 229, 255, 0.6)" />
                            <stop offset="100%" stopColor="rgba(0, 229, 255, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Marcadores de países ativos (círculos pulsantes) */}
                    <g id="active-markers">
                        {Object.keys(COUNTRY_CENTERS).map((iso) => {
                            if (!isActive(iso)) return null;

                            const center = COUNTRY_CENTERS[iso];

                            return (
                                <g key={`marker-${iso}`}>
                                    {/* Círculo externo pulsante */}
                                    <circle
                                        cx={center.x}
                                        cy={center.y}
                                        r="60"
                                        fill="rgba(0, 229, 255, 0.08)"
                                        stroke="#00e5ff"
                                        strokeWidth="2"
                                        filter="url(#glow)"
                                        style={{
                                            animation: 'pulse 2s ease-in-out infinite'
                                        }}
                                    />

                                    {/* Círculo central */}
                                    <circle
                                        cx={center.x}
                                        cy={center.y}
                                        r="35"
                                        fill="rgba(0, 229, 255, 0.15)"
                                        stroke="#00e5ff"
                                        strokeWidth="3"
                                        filter="url(#glow)"
                                    />

                                    {/* Ponto central */}
                                    <circle
                                        cx={center.x}
                                        cy={center.y}
                                        r="5"
                                        fill="#00e5ff"
                                        filter="url(#glow)"
                                    />
                                </g>
                            );
                        })}
                    </g>

                    {/* Labels */}
                    <g id="labels">
                        {Object.keys(COUNTRY_CENTERS).map((iso) => {
                            if (!isActive(iso)) return null;

                            const center = COUNTRY_CENTERS[iso];
                            const leader = LEADER_LINES[iso];
                            const labelX = leader ? leader.labelX : center.x;
                            const labelY = leader ? leader.labelY : center.y - 80;

                            return (
                                <g key={`label-${iso}`}>
                                    {/* Leader line se necessário */}
                                    {leader && (
                                        <>
                                            <line
                                                x1={center.x}
                                                y1={center.y}
                                                x2={labelX - (center.name.length * 5)}
                                                y2={labelY}
                                                stroke="#00e5ff"
                                                strokeWidth="1.5"
                                                strokeDasharray="5,5"
                                                opacity="0.7"
                                            />
                                        </>
                                    )}

                                    {/* Fundo do texto */}
                                    <rect
                                        x={labelX - (center.name.length * 6) - 12}
                                        y={labelY - 20}
                                        width={(center.name.length * 12) + 24}
                                        height="32"
                                        fill="rgba(0, 10, 20, 0.95)"
                                        stroke="#00e5ff"
                                        strokeWidth="2"
                                        rx="6"
                                    />

                                    {/* Texto */}
                                    <text
                                        x={labelX}
                                        y={labelY}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="14"
                                        fontFamily="'Arial', sans-serif"
                                        fontWeight="bold"
                                        letterSpacing="2.5"
                                        style={{
                                            textShadow: '0 0 15px #00e5ff, 0 0 25px rgba(0, 229, 255, 0.8)',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {center.name}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Linha de scan */}
                    <rect
                        x="0"
                        y="40"
                        width="600"
                        height="10"
                        fill="url(#scanGradient)"
                        opacity="0.8"
                    >
                        <animate
                            attributeName="y"
                            from="40"
                            to="800"
                            dur="5s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </svg>
            </div>

            {/* CSS */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { 
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.5;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default SouthAmericaHologram;