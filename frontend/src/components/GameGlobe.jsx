import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { COUNTRY_COORDS } from '../utils/constants';

// PASSO 1: Constantes criadas UMA VEZ na memória, fora do componente.
const COLORS = {
    neonCyan: '#00f3ff',
    glowBlue: '#00a8ff',
    text: '#ffffff',
    hologram: 'rgba(0, 243, 255, 0.15)'
};

const GameGlobe = ({ validIsoCodes = [] }) => {
    const globeRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });

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

    // Construção dos dados visuais limpa e sem "useMemo"
    const globeData = validIsoCodes
        .map(iso => {
            const data = COUNTRY_COORDS[iso.toUpperCase()];
            if (!data) return null;
            return {
                lat: data.lat,
                lng: data.lng,
                name: data.name,
                size: 0.3,
                color: COLORS.neonCyan
            };
        })
        .filter(Boolean); // O código termina exatamente aqui, sem chaves ou colchetes extras!

    // ÚNICO controle de Foco Dinâmico da Câmera
    useEffect(() => {
        if (globeData.length > 0 && globeRef.current) {
            // Desativa auto-rotação para focar nos candidatos
            globeRef.current.controls().autoRotate = false;

            const avgLat = globeData.reduce((sum, d) => sum + d.lat, 0) / globeData.length;
            const avgLng = globeData.reduce((sum, d) => sum + d.lng, 0) / globeData.length;

            const altitude = globeData.length > 5 ? 2.5 : 1.8;
            globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, alt: altitude }, 1500);
        } else if (globeRef.current) {
            // Se não houver jogo ou zerou os candidatos, volta a girar
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
        }
    }, [globeData]);

    return (
        <div className="globe-wrapper" style={{ width: '100%', height: '100%' }}>
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"

                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                showAtmosphere={true}
                atmosphereColor={COLORS.neonCyan}
                atmosphereAltitude={0.15}

                pointsData={globeData}
                pointRadius="size"
                pointColor="color"
                pointAltitude={0.02}

                labelsData={globeData}
                labelLat={d => d.lat}
                labelLng={d => d.lng}
                labelText={d => d.name}
                labelSize={1.5}
                labelColor={() => COLORS.text}
                labelAltitude={0.05}

                ringsData={globeData}
                ringColor={() => COLORS.neonCyan}
                ringMaxRadius={3}
                ringPropagationSpeed={2}
                ringRepeatPeriod={800}

                onGlobeReady={() => {
                    if (globeRef.current) {
                        globeRef.current.controls().autoRotate = true;
                        globeRef.current.controls().autoRotateSpeed = 0.6;
                        globeRef.current.controls().enableZoom = true;
                    }
                }}
            />
        </div>
    );
};

export default GameGlobe;