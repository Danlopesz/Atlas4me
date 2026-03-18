import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const GameGlobe = ({ markers = [] }) => {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

    // Configuração de cores e estilo (Tema Atlas4Me)
    const COLORS = {
        neonCyan: '#00f3ff',
        glowBlue: '#00a8ff',
        text: '#ffffff',
        hologram: 'rgba(0, 243, 255, 0.15)'
    };

    // Ajuste de responsividade do container
    useEffect(() => {
        const updateSize = () => {
            const parent = document.querySelector('.map-zone');
            if (parent) {
                setDimensions({
                    width: parent.clientWidth,
                    height: parent.clientHeight
                });
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Lógica de Foco Dinâmico (Câmera)
    useEffect(() => {
        if (markers.length > 0 && globeRef.current) {
            // 1. Desativa a auto-rotação para focar
            globeRef.current.controls().autoRotate = false;

            // 2. Calcula o centro médio dos países candidatos
            const avgLat = markers.reduce((sum, m) => sum + (m.lat || m.latitude), 0) / markers.length;
            const avgLon = markers.reduce((sum, m) => sum + (m.lon || m.longitude), 0) / markers.length;

            // 3. Suave transição de câmera (pointOfView)
            // O zoom (altitude) aumenta se houver muitos países para caber todos na tela
            const altitude = markers.length > 5 ? 2.5 : 1.8;
            globeRef.current.pointOfView({ lat: avgLat, lng: avgLon, alt: altitude }, 1500);
        } else if (globeRef.current) {
            // Se não houver jogo, volta a girar lentamente
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
        }
    }, [markers]);

    // Renderização dos Pontos e Labels
    // Usamos useMemo para performance, re-calculando apenas se a lista de candidatos mudar
    const globeData = useMemo(() => markers.map(m => ({
        lat: m.lat || m.latitude,
        lng: m.lon || m.longitude,
        name: m.name || m.isoCode?.toUpperCase(),
        size: 0.2,
        color: COLORS.neonCyan
    })), [markers]);

    return (
        <div className="globe-wrapper" style={{ cursor: 'grab', width: '100%', height: '100%' }}>
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)" // Transparente para usar o Stars.css do fundo

                // Textura do Globo (Pode usar uma versão "Night" para efeito mais tech)
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                // Estilo Holográfico
                showAtmosphere={true}
                atmosphereColor={COLORS.neonCyan}
                atmosphereAltitude={0.15}

                // Pontos (Candidatos Atuais)
                pointsData={globeData}
                pointRadius="size"
                pointColor="color"
                pointAltitude={0.02}
                pointsMerge={true} // Melhora performance com muitos pontos

                // Labels (Nomes na lateral)
                labelsData={globeData}
                labelLat={d => d.lat}
                labelLng={d => d.lng}
                labelText={d => d.name}
                labelSize={1.2}
                labelDotRadius={0.4}
                labelColor={() => COLORS.text}
                labelResolution={3}
                labelAltitude={0.05}

                // Anéis de Pulso (Efeito Radar nos candidatos)
                ringsData={globeData}
                ringColor={() => COLORS.neonCyan}
                ringMaxRadius={2}
                ringPropagationSpeed={3}
                ringRepeatPeriod={1000}

                // Configurações de Controle
                onGlobeReady={() => {
                    if (globeRef.current) {
                        globeRef.current.controls().autoRotate = true;
                        globeRef.current.controls().autoRotateSpeed = 0.6;
                        globeRef.current.controls().enableZoom = true;
                    }
                }}
            />

            <style>{`
        .globe-wrapper canvas {
          outline: none;
          transition: opacity 1s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default GameGlobe;