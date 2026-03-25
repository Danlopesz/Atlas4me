import React, { useEffect, useRef, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { COUNTRY_COORDS } from '../utils/constants';
import geoJsonData from '../assets/world.geo.json';

// --- DESIGN SYSTEM ---
const COLORS = {
    spotlightFill: 'rgba(0, 229, 255, 0.22)',
    spotlightStroke: '#00e5ff',
    transparentFill: 'rgba(0, 0, 0, 0)',
    borderFaint: 'rgba(255, 255, 255, 0.18)',
    atmosphere: '#1a6fff',
};

// --- MOTOR DE CÂMERA ---
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
    if (validCount === 0) return { lat: -15, lng: -47, alt: 1.8 };
    const alt = validCount <= 2 ? 0.8 : validCount <= 6 ? 1.2 : 1.8;
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2, alt };
};

// --- GERADOR DE UNIVERSO PROCEDURAL (0 BYTES DE DOWNLOAD) ---
const generateStarrySkybox = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // Resolução 2K para ficar nítido
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fundo do espaço sideral escuro
    ctx.fillStyle = '#030408';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhando 5000 estrelas
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);

        // 15% das estrelas terão aquele tom "neon cyan" do Atlas4Me
        ctx.fillStyle = Math.random() > 0.85 ? '#00e5ff' : '#ffffff';
        ctx.globalAlpha = Math.random() * 0.8 + 0.2; // Opacidade variada (brilho)
        ctx.fill();
    }

    // Retorna a imagem gerada em Base64
    return canvas.toDataURL('image/png');
};

// Guardamos a imagem em memória para não gerar de novo
const SKYBOX_TEXTURE = generateStarrySkybox();

const UnifiedGlobe = ({ validIsoCodes = [], globeOffsetX = 0 }) => {
    const globeRef = useRef();
    const frameRef = useRef();
    const canvasWrapRef = useRef();
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });


    useEffect(() => {
        const onResize = () =>
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Controle de Hover, Touch e Rotação Manual
    useEffect(() => {
        const el = canvasWrapRef.current;
        if (!el) return;

        // Lógica para Desktop (Mouse)
        const onMouseMove = (e) => {
            const globe = globeRef.current;
            if (!globe) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const onGlobe = globe.toGlobeCoords(x, y) !== null;
            const ctrl = globe.controls();
            if (ctrl) ctrl.enableRotate = onGlobe;
        };

        // Lógica para Mobile (Toque) - NOVO!
        const onTouchStart = (e) => {
            const globe = globeRef.current;
            if (!globe) return;
            const rect = el.getBoundingClientRect();
            const touch = e.touches[0]; // Pega o primeiro dedo na tela
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            // Verifica se tocou no planeta ou no espaço vazio
            const onGlobe = globe.toGlobeCoords(x, y) !== null;
            const ctrl = globe.controls();
            if (ctrl) {
                ctrl.enableRotate = onGlobe; // Libera o giro manual!
                if (onGlobe) ctrl.autoRotate = false; // Pausa o giro automático para não brigar com o dedo
            }
        };

        const onMouseLeave = () => {
            const ctrl = globeRef.current?.controls();
            if (ctrl) ctrl.enableRotate = false;
        };

        // Adicionamos os escutadores
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('touchstart', onTouchStart, { passive: true }); // Essencial para mobile

        return () => {
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('touchstart', onTouchStart);
        };
    }, []);

    // Foco da Câmera
    useEffect(() => {
        if (!globeRef.current) return;
        const cluster = calculateCluster(validIsoCodes);
        const isMobile = dimensions.width <= 768;
        const effectiveOffsetX = isMobile ? 0 : globeOffsetX;

        const lngOffset = effectiveOffsetX > 0
            ? (effectiveOffsetX / dimensions.width) * 90
            : 0;
        globeRef.current.pointOfView(
            { lat: cluster.lat, lng: cluster.lng - lngOffset, alt: cluster.alt },
            1200
        );
    }, [validIsoCodes, globeOffsetX, dimensions.width]);

    const isHighlighted = useCallback((feat) => {
        const iso = feat.properties.ISO_A2 || feat.properties.ADM0_A3;
        if (!iso) return false;
        return validIsoCodes.some(c => c.toUpperCase() === iso.toUpperCase());
    }, [validIsoCodes]);

    // ─────────────────────────────────────────────────────────────────────────
    // handleGlobeReady — Melhorias visuais 3D (Oceano, Nuvens e Universo)
    // ─────────────────────────────────────────────────────────────────────────
    const handleGlobeReady = useCallback(() => {
        const globe = globeRef.current;
        if (!globe) return;

        const scene = globe.scene();
        const GLOBE_RADIUS = globe.getGlobeRadius();

        // Controles de zoom e velocidade
        const ctrl = globe.controls();
        ctrl.enableZoom = true;
        ctrl.enableRotate = false; // Mousemove vai gerenciar isso
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.3;
        ctrl.zoomSpeed = 1.2;
        ctrl.minDistance = 150;
        ctrl.maxDistance = 700;

        // 1. ESTÉTICA DO OCEANO
        const globeMat = globe.globeMaterial();
        globeMat.color = new THREE.Color(0x2a5fff);
        globeMat.emissive = new THREE.Color(0x051025);
        globeMat.emissiveIntensity = 0.5;
        globeMat.needsUpdate = true;

        // 2. CAMADA DE NUVENS
        const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 64, 64);
        const cloudTex = new THREE.TextureLoader().load('/img/clouds-8k.jpg');
        const cloudMat = new THREE.MeshPhongMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide,
            depthWrite: false,
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        scene.add(cloudMesh);

        // 3. CAMADA DE ESTRELAS 3D (O UNIVERSO IMERSIVO)
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff, // Branco brilhante
            size: 2.0,       // <-- Tamanho fixo em pixels na tela!
            sizeAttenuation: false, // <-- O SEGREDO! Impede que a estrela encolha com a distância
            transparent: true,
            opacity: 0.9
        });

        const starCount = 8000; // Mais volume de estrelas para preencher a tela
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 900; // Esfera gigantesca envolvendo a Terra
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starField = new THREE.Points(starGeometry, starMaterial);

        // Adicionamos o universo diretamente à cena!
        scene.add(starField);

        // Loop das Nuvens
        const animate = () => {
            if (cloudMesh) cloudMesh.rotation.y += 0.0002;
            frameRef.current = requestAnimationFrame(animate);
        };
        animate();

    }, []);

    useEffect(() => {
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    useEffect(() => {
        const ctrl = globeRef.current?.controls();
        if (!ctrl) return;
        ctrl.autoRotate = validIsoCodes.length === 0;
    }, [validIsoCodes]);

    const isMobile = dimensions.width <= 768;
    const effectiveOffsetX = isMobile ? 0 : globeOffsetX;

    return (
        // ESTRUTURA DOM INTACTA (Zero interferências no Mouse)
        <div style={{ position: 'fixed', inset: 0, zIndex: 10, background: 'transparent', cursor: 'default' }}>
            <div
                ref={canvasWrapRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    transform: effectiveOffsetX > 0 ? `translateX(${effectiveOffsetX / 2}px)` : 'none',
                    transition: 'transform 0.6s ease',
                }}
            >
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}

                    globeImageUrl="/img/earth-8k.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl={SKYBOX_TEXTURE}
                    showAtmosphere={true}
                    atmosphereColor={COLORS.atmosphere}
                    atmosphereAltitude={0.25}

                    polygonsData={geoJsonData.features}
                    polygonCapColor={feat => isHighlighted(feat) ? COLORS.spotlightFill : COLORS.transparentFill}
                    polygonStrokeColor={feat => isHighlighted(feat) ? COLORS.spotlightStroke : COLORS.borderFaint}
                    polygonSideColor={() => 'rgba(0,0,0,0)'}
                    polygonAltitude={feat => isHighlighted(feat) ? 0.015 : 0.001}
                    polygonsTransitionDuration={400}

                    labelsData={geoJsonData.features.filter(feat => {
                        const props = feat.properties;
                        let code = props.ISO_A2 || props.ADM0_A3;
                        if (props.NAME === 'French Guiana' || props.ADMIN === 'French Guiana') code = 'GF';
                        feat._normCode = code;
                        return COUNTRY_COORDS[code] !== undefined;
                    })}
                    labelLat={feat => COUNTRY_COORDS[feat._normCode].lat}
                    labelLng={feat => COUNTRY_COORDS[feat._normCode].lng}
                    labelText={feat => COUNTRY_COORDS[feat._normCode].name}
                    labelColor={feat => isHighlighted(feat) ? '#00e5ff' : 'rgba(255,255,255,0.5)'}
                    labelSize={feat => isHighlighted(feat) ? 1.3 : 0.85}
                    labelResolution={3}
                    labelIncludeDot={false}

                    onGlobeReady={handleGlobeReady}
                />
            </div>
        </div>
    );
};

export default UnifiedGlobe;