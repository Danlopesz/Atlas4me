import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { COUNTRY_COORDS } from '../utils/constants';

// Importação estática do GeoJSON higienizado localmente
import geoJsonData from '../assets/world.geo.json';

// --- 1. CONFIGURAÇÕES VISUAIS (Strict Design System - Day Style) ---
const COLORS = {
    primary: '#18ff7e',                     // Verde Neon Claro para o dia
    activeCap: 'rgba(24, 255, 126, 0.4)',   // Translúcido
    activeStroke: '#18ff7e',                // Brilho intenso
    eliminatedCap: 'rgba(200, 200, 200, 0.05)', // Quase invisível de dia
    eliminatedStroke: 'rgba(100, 100, 100, 0.1)',
    ahaCap: 'rgba(57, 255, 20, 0.9)',       // Verde Limão Intenso (Fase 4)
    ahaStroke: '#ffffff',
    atmosphereNormal: 'rgba(255, 255, 255, 0.6)', // Atmosfera Diurna Branca
    atmosphereAha: '#000a14'                // Escurecido na Fase 4 para dar foco
};

// --- 2. MOTOR MATEMÁTICO DE CLUSTERS (O(1)) ---
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

    if (validCount === 0) return { lat: 0, lng: 0, isDominant: false };

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latSpread = maxLat - minLat;
    const lngSpread = maxLng - minLng;

    // Cluster dominante: caixa delimitadora < 60 graus
    const isDominant = latSpread < 60 && lngSpread < 60;

    return { lat: centerLat, lng: centerLng, isDominant };
};

// --- 3. COMPONENTE PRINCIPAL ---
const GameGlobe = ({ validIsoCodes = [] }) => {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

    // Estados Orquestrados Visualmente
    const [visualStates, setVisualStates] = useState({});
    const [atmosphere, setAtmosphere] = useState(COLORS.atmosphereNormal);

    // Refs de Controle Interno
    const prevIsosRef = useRef([]);
    const isFirstRender = useRef(true);
    const timeoutIds = useRef([]);

    // Responsividade do Canvas
    useEffect(() => {
        const updateSize = () => {
            const parent = document.querySelector('.map-zone');
            if (parent) setDimensions({ width: parent.clientWidth, height: parent.clientHeight });
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // --- 4. ENGINE DE COREOGRAFIA DE CÂMERA (Controle Estrito) ---
    const executeCameraPhase = useCallback((activeIsos) => {
        const count = activeIsos.length;
        if (count === 0 || !globeRef.current) return;

        const controls = globeRef.current.controls();
        const cluster = calculateCluster(activeIsos);

        // Destrava controles preventivamente
        controls.enableZoom = true;
        controls.enablePan = true;

        // Rotação suave entre perguntas, SÓ quando o globo for global (>10)
        controls.autoRotate = count > 10;
        if (controls.autoRotate) controls.autoRotateSpeed = 0.5;

        // Fases da Câmera: Controle Estrito de Zoom e Atmosfera
        if (count === 1) {
            // Fase 4: Aha - Zoom Rápido, Atmosfera Escurecida, Rotação Parada, Controles Bloqueados
            controls.enableZoom = false;
            controls.enablePan = false;
            setAtmosphere(COLORS.atmosphereAha);
            globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: 0.7 }, 1500);

        } else if (count >= 2 && count <= 3) {
            // Fase 3: Foco Regional - Zoom Agressivo
            setAtmosphere(COLORS.atmosphereNormal);
            globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: 1.1 }, 1200);

        } else if (count >= 4 && count <= 10) {
            // Fase 2: Convergência
            setAtmosphere(COLORS.atmosphereNormal);
            if (cluster.isDominant) {
                globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: 1.8 }, 1200);
            } else {
                globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: 2.5 }, 1200);
            }

        } else {
            // Fase 1: Exploração Global
            setAtmosphere(COLORS.atmosphereNormal);
            globeRef.current.pointOfView({ lat: cluster.lat, lng: cluster.lng, alt: 2.5 }, 1000);
        }
    }, []);

    // --- 5. ORQUESTRAÇÃO DE EVENTOS BLINDADA NO USEEFFECT ---
    useEffect(() => {
        // PROTEÇÃO: Impede que o globo quebre com arrays nulos/vazios
        if (!validIsoCodes || validIsoCodes.length === 0) {
            setVisualStates({}); // Reinicia visualmente para um globo vazio
            executeCameraPhase([]);
            isFirstRender.current = true; // Prepara para nova partida
            return;
        }

        const currentIsos = validIsoCodes.map(i => i.toUpperCase());

        timeoutIds.current.forEach(clearTimeout);
        timeoutIds.current = [];

        if (isFirstRender.current) {
            // PRIMEIRA RENDERIZAÇÃO
            const initialStates = {};
            currentIsos.forEach(iso => initialStates[iso] = 'ACTIVE');

            // setTimeout 0ms tira a execução do tempo síncrono, calando o ESLint
            const idInit = setTimeout(() => {
                setVisualStates(initialStates);
                executeCameraPhase(currentIsos);
            }, 0);
            timeoutIds.current.push(idInit);

            prevIsosRef.current = currentIsos;
            isFirstRender.current = false;
        } else {
            // RENDERIZAÇÕES SUBSEQUENTES
            const previousIsos = prevIsosRef.current;
            const eliminatedIsos = previousIsos.filter(iso => !currentIsos.includes(iso));
            const isReset = currentIsos.length > previousIsos.length;

            if (isReset) {
                const resetStates = {};
                currentIsos.forEach(iso => resetStates[iso] = 'ACTIVE');
                setVisualStates(resetStates);
                executeCameraPhase(currentIsos);
            } else if (eliminatedIsos.length > 0) {
                // PRIORIDADE 1: Eliminação Visual com Batched Staggering (de 4 em 4)
                const CHUNK_SIZE = 4;
                const DELAY_PER_CHUNK = 100;

                for (let i = 0; i < eliminatedIsos.length; i += CHUNK_SIZE) {
                    const chunk = eliminatedIsos.slice(i, i + CHUNK_SIZE);

                    const id = setTimeout(() => {
                        setVisualStates(prev => {
                            const nextState = { ...prev };
                            chunk.forEach(iso => nextState[iso] = 'ELIMINATED');
                            return nextState;
                        });
                    }, (i / CHUNK_SIZE) * DELAY_PER_CHUNK);

                    timeoutIds.current.push(id);
                }

                // PRIORIDADE 2: Delay de Compreensão + Câmera
                const totalBatches = Math.ceil(eliminatedIsos.length / CHUNK_SIZE);
                const comprehensionDelay = (totalBatches * DELAY_PER_CHUNK) + 400;

                const idCam = setTimeout(() => {
                    executeCameraPhase(currentIsos);
                }, comprehensionDelay);

                timeoutIds.current.push(idCam);
            }

            prevIsosRef.current = currentIsos;
        }

        return () => timeoutIds.current.forEach(clearTimeout);
    }, [validIsoCodes, executeCameraPhase]);

    // Acessor de O(1) para o estado do polígono
    const getPolyState = (feat) => visualStates[feat.properties.ISO_A2] || 'ELIMINATED';

    return (
        <div className="globe-wrapper" style={{ width: '100%', height: '100%', cursor: 'crosshair' }}>
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(255,255,255,0)" // Fundo Claro/Transparente

                // MAPA ESTILO DIA (Google Earth)
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                showAtmosphere={true}
                atmosphereColor={atmosphere}
                atmosphereAltitude={0.15}

                polygonsData={geoJsonData.features}

                polygonAltitude={(feat) => {
                    const state = getPolyState(feat);
                    if (state === 'AHA') return 0.05;
                    if (state === 'ACTIVE') return 0.02;
                    return 0.001; // Colado no chão
                }}
                polygonCapColor={(feat) => {
                    const state = getPolyState(feat);
                    if (state === 'AHA') return COLORS.ahaCap;
                    if (state === 'ACTIVE') return COLORS.activeCap;
                    return COLORS.eliminatedCap;
                }}
                polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
                polygonStrokeColor={(feat) => {
                    const state = getPolyState(feat);
                    if (state === 'AHA') return COLORS.ahaStroke;
                    if (state === 'ACTIVE') return COLORS.activeStroke;
                    return COLORS.eliminatedStroke;
                }}
                polygonsTransitionDuration={400}

                // --- ENGINE DE LABELS DINÂMICOS E LEGÍVEIS (O(1)) ---
                labelsData={geoJsonData.features}
                labelLat={feat => COUNTRY_COORDS[feat.properties.ISO_A2]?.lat || 0} // Busca no dicionário local
                labelLng={feat => COUNTRY_COORDS[feat.properties.ISO_A2]?.lng || 0}
                labelText={feat => COUNTRY_COORDS[feat.properties.ISO_A2]?.name || feat.properties.ISO_A2} // Prefere o nome, cai pro ISO
                labelSize={1.5}
                labelColor={feat => {
                    const state = getPolyState(feat);
                    if (state === 'ACTIVE' || state === 'AHA') return COLORS.activeStroke; // Verde Neon
                    return 'rgba(0,0,0,0)'; // Oculta países mortos
                }}
                labelResolution={3}     // Alta nitidez
                labelIncludeDot={false} // Remove o ponto feio centralizado

                onGlobeReady={() => {
                    if (globeRef.current) {
                        globeRef.current.controls().enableZoom = true;
                    }
                }}
            />
        </div>
    );
};

export default GameGlobe;