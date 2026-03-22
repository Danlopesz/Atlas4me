import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { COUNTRY_COORDS } from '../utils/constants';

// Importação estática do GeoJSON
import geoJsonData from '../assets/world.geo.json';

// --- 1. DESIGN SYSTEM: HOLOFOTE SOBRE SATÉLITE ---
const COLORS = {
    // Destaque da Pergunta
    spotlightFill: 'rgba(0, 229, 255, 0.4)', // Ciano Neon Translúcido
    transparentFill: 'rgba(0, 0, 0, 0)',     // 100% Transparente

    // Elementos Geográficos Fixos
    countryBorder: 'rgba(255, 255, 255, 0.4)', // Linha de fronteira fina e branca
    labelText: '#FFFFFF',                      // Nomes sempre em branco

    atmosphere: 'rgba(255, 255, 255, 0.2)'     // Atmosfera sutil
};

// --- 2. MOTOR MATEMÁTICO DE CÂMERA ---
const calculateCluster = (isos) => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let validCount = 0;

    isos.forEach(iso => {
        const coord = COUNTRY_COORDS[iso.toUpperCase()];
        if (coord) {
            if (coord.lat < minLat) minLat = coord.lat;
            if (coord.lat > maxLat) maxLat = coord.lat;
            if (coord.lng < minLng) minLng = coord.lng;
            if (coord.lng > maxLng) maxLng = coord.lng;
            validCount++;
        }
    });

    if (validCount === 0) return { lat: -15, lng: -60, isDominant: false }; // Foco padrão América do Sul

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    return { lat: centerLat, lng: centerLng };
};

// --- 3. COMPONENTE PRINCIPAL ---
const GameGlobe = ({ validIsoCodes = [] }) => {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

    // Responsividade
    useEffect(() => {
        const updateSize = () => {
            const parent = document.querySelector('.map-zone');
            if (parent) setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Coreografia de Câmera (Foca onde o Holofote está)
    useEffect(() => {
        if (!globeRef.current || validIsoCodes.length === 0) return;

        const cluster = calculateCluster(validIsoCodes);
        const altitude = validIsoCodes.length <= 3 ? 1.0 : 2.0; // Zoom in se houver poucos alvos

        globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: altitude }, 1000);
    }, [validIsoCodes]);

    // Função auxiliar O(1) para verificar se o país é alvo do Holofote atual
    const isHighlighted = useCallback((feat) => {
        const iso = feat.properties.ISO_A2 || feat.properties.ADM0_A3;
        if (!iso) return false;
        return validIsoCodes.some(code => code.toUpperCase() === iso.toUpperCase());
    }, [validIsoCodes]);

    return (
        <div className="globe-wrapper" style={{ width: '100%', height: '100%', cursor: 'grab' }}>
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}

                // --- VISUAL DE SATÉLITE ---
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(255,255,255,0)" // Fundo transparente para o componente pai
                showAtmosphere={true}
                atmosphereColor={COLORS.atmosphere}
                atmosphereAltitude={0.15}

                // --- POLÍGONOS E HOLOFOTE ---
                polygonsData={geoJsonData.features}

                // Preenchimento: Ilumina apenas os ISOs da pergunta. O resto é vidro transparente.
                polygonCapColor={feat => isHighlighted(feat) ? COLORS.spotlightFill : COLORS.transparentFill}

                // Borda: Desenha o mapa múndi permanente
                polygonStrokeColor={() => COLORS.countryBorder}

                polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
                polygonAltitude={feat => isHighlighted(feat) ? 0.02 : 0.001}
                polygonsTransitionDuration={300}

                // --- LABELS PERMANENTES ---
                // Filtramos para renderizar label APENAS se o país estiver mapeado no constants.js
                // Isso evita labels vazias com undefined ou zeros no oceano
                labelsData={geoJsonData.features.filter(feat => {
                    // Função inline para normalizar o ISO Code ou Nome
                    const props = feat.properties;
                    let code = props.ISO_A2 || props.ADM0_A3;
                    if (props.NAME === 'French Guiana' || props.ADMIN === 'French Guiana') code = 'GF';

                    feat.normalizedCode = code; // Salva para uso rápido abaixo
                    return COUNTRY_COORDS[code] !== undefined;
                })}

                labelLat={feat => COUNTRY_COORDS[feat.normalizedCode].lat}
                labelLng={feat => COUNTRY_COORDS[feat.normalizedCode].lng}
                labelText={feat => COUNTRY_COORDS[feat.normalizedCode].name}

                labelColor={() => COLORS.labelText}

                // Ajuste de UI: Tamanho base menor (0.9) para caber nas guianas, destaque sutil (1.2) se iluminado
                labelSize={feat => isHighlighted(feat) ? 1.2 : 0.9}
                labelResolution={3}
                labelIncludeDot={false}

                onGlobeReady={() => {
                    if (globeRef.current) {
                        globeRef.current.controls().enableZoom = true;
                        globeRef.current.controls().autoRotate = true;
                        globeRef.current.controls().autoRotateSpeed = 0.3;
                    }
                }}
            />
        </div>
    );
};

export default GameGlobe;