import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// URL do GeoJSON da América do Sul (TopoJSON do Highcharts)
const geoUrl = "https://code.highcharts.com/mapdata/custom/south-america.topo.json";

const SouthAmericaHologram = ({ activeLocations = [] }) => {

    // Normaliza os códigos ISO recebidos do backend
    const activeIsos = activeLocations.map(loc => loc.isoCode.toLowerCase());

    // Configuração dos Labels para evitar sobreposição
    // Offset manual inteligente: países do Pacífico → esquerda, Atlântico → direita
    const labelOffsets = {
        'br': { x: 60, y: 0 },    // Brasil: Texto pra direita (Atlântico)
        'pe': { x: -50, y: 0 },   // Peru: Texto pra esquerda (Pacífico)
        'cl': { x: -50, y: 0 },   // Chile: Texto pra esquerda (Pacífico)
        'ec': { x: -50, y: -10 }, // Equador: Esquerda/Cima
        'co': { x: -50, y: -15 }, // Colômbia: Esquerda/Cima
        've': { x: 40, y: -20 },  // Venezuela: Direita/Cima
        'ar': { x: 40, y: 50 },   // Argentina: Direita/Baixo
        'bo': { x: 50, y: 0 },    // Bolívia: Direita
        'py': { x: 50, y: 0 },    // Paraguai: Direita
        'uy': { x: 50, y: 0 },    // Uruguai: Direita
        'gy': { x: 50, y: -10 },  // Guiana: Direita/Cima
        'sr': { x: 50, y: 0 },    // Suriname: Direita
        'gf': { x: 50, y: 10 }    // G. Francesa: Direita/Baixo
    };

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: 'relative',
            background: 'radial-gradient(circle at center, #051020 0%, #000000 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(0, 229, 255, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>

            {/* Título Tático Fixo */}
            <div style={{
                position: 'absolute',
                top: 15,
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <span style={{
                    color: '#00e5ff',
                    fontSize: '14px',
                    letterSpacing: '3px',
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(0, 229, 255, 0.8)'
                }}>
                    LATINOS
                </span>
            </div>

            {/* Grid de fundo (opcional, efeito blueprint) */}
            <svg style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.15
            }}>
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 450,        // Zoom reduzido (era 600)
                    center: [-60, -25] // Centraliza no meio do continente
                }}
                style={{
                    width: "95%",
                    height: "95%",
                    maxWidth: "100%",
                    maxHeight: "100%"
                }}
            >
                {/* Filtro SVG para glow */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Renderiza os países */}
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            // O TopoJSON do Highcharts usa 'hc-a2' para código ISO
                            const geoId = geo.properties["hc-a2"]?.toLowerCase();
                            const isActive = activeIsos.includes(geoId);

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    style={{
                                        default: {
                                            fill: isActive ? "rgba(0, 229, 255, 0.18)" : "rgba(30, 40, 60, 0.4)",
                                            stroke: isActive ? "#00e5ff" : "#2a3b4c",
                                            strokeWidth: isActive ? 2 : 0.5,
                                            outline: "none",
                                            transition: "all 0.4s ease",
                                            filter: isActive ? "url(#glow)" : "none"
                                        },
                                        hover: {
                                            fill: "rgba(0, 229, 255, 0.3)",
                                            stroke: "#00e5ff",
                                            strokeWidth: 2,
                                            outline: "none"
                                        },
                                        pressed: {
                                            fill: "rgba(0, 229, 255, 0.4)",
                                            outline: "none"
                                        }
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>

                {/* Marcadores e Labels */}
                {activeLocations.map((loc) => {
                    const offset = labelOffsets[loc.isoCode.toLowerCase()] || { x: 30, y: 0 };

                    return (
                        <Marker key={loc.isoCode} coordinates={[loc.lon, loc.lat]}>

                            {/* Linha Conectora (tracejada) */}
                            <line
                                x1={0}
                                y1={0}
                                x2={offset.x}
                                y2={offset.y}
                                stroke="#00e5ff"
                                strokeWidth={1.5}
                                strokeDasharray="4,3"
                                opacity={0.75}
                            />

                            {/* Ponto Central (alvo) */}
                            <circle
                                r={4}
                                fill="#00e5ff"
                                stroke="#fff"
                                strokeWidth={1.5}
                                filter="url(#glow)"
                            />

                            {/* Anel Externo (estático, sem pulso) */}
                            <circle
                                r={8}
                                fill="none"
                                stroke="#00e5ff"
                                strokeWidth={1}
                                opacity={0.5}
                            />

                            {/* Fundo do Texto (caixa) - Largura dinâmica com padding adequado */}
                            <rect
                                x={offset.x > 0 ? offset.x + 5 : offset.x - (getCountryName(loc.isoCode).length * 7.5 + 18)}
                                y={offset.y - 13}
                                width={getCountryName(loc.isoCode).length * 7.5 + 18}
                                height={24}
                                fill="rgba(0, 10, 20, 0.9)"
                                stroke="#00e5ff"
                                strokeWidth={1}
                                rx={3}
                            />

                            {/* Texto (Label) */}
                            <text
                                x={offset.x > 0 ? offset.x + 14 : offset.x - 9}
                                y={offset.y + 3}
                                textAnchor={offset.x > 0 ? "start" : "end"}
                                fill="#ffffff"
                                fontSize={11}
                                fontWeight="bold"
                                fontFamily="'Arial', sans-serif"
                                letterSpacing={1.5}
                                style={{
                                    textShadow: '0 0 8px #00e5ff',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {getCountryName(loc.isoCode)}
                            </text>
                        </Marker>
                    );
                })}

            </ComposableMap>
        </div>
    );
};

// Dicionário de nomes dos países
const getCountryName = (code) => {
    const names = {
        br: "BRASIL",
        ar: "ARGENTINA",
        cl: "CHILE",
        co: "COLÔMBIA",
        pe: "PERU",
        ec: "EQUADOR",
        ve: "VENEZUELA",
        bo: "BOLÍVIA",
        py: "PARAGUAI",
        uy: "URUGUAI",
        gy: "GUIANA",
        sr: "SURINAME",
        gf: "G. FRANCESA"
    };
    return names[code.toLowerCase()] || code.toUpperCase();
};

export default SouthAmericaHologram;