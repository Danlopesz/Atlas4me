import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const countryNames = {
    ar: 'Argentina', bo: 'Bolívia', br: 'Brasil', cl: 'Chile',
    co: 'Colômbia', ec: 'Equador', gf: 'Guiana Francesa',
    gy: 'Guiana', pe: 'Peru', py: 'Paraguai', sr: 'Suriname',
    uy: 'Uruguai', ve: 'Venezuela'
};

const calcPosFromLatLonRad = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

const GameGlobe = ({ markers = [] }) => {
    const containerRef = useRef(null);
    const mountRef = useRef(null);
    const labelsContainerRef = useRef(null);

    const globeRef = useRef(new THREE.Group());
    const earthMeshRef = useRef(null);

    const markersRef = useRef(markers);
    useEffect(() => { markersRef.current = markers; }, [markers]);

    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 6;
        controls.maxDistance = 25;
        controls.enableZoom = false; // Inicia sem zoom no scroll da página

        const earthGroup = globeRef.current;
        scene.add(earthGroup);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(-10, 5, 20);
        scene.add(sunLight);
        scene.add(new THREE.AmbientLight(0x404040, 2.0));

        const textureLoader = new THREE.TextureLoader();
        const earthMap = textureLoader.load('/img/earth-8k.jpg');

        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(4, 64, 64),
            new THREE.MeshPhongMaterial({ map: earthMap, shininess: 5 })
        );
        earthMeshRef.current = earth;
        earthGroup.add(earth);

        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(4.1, 64, 64),
            new THREE.MeshPhongMaterial({
                color: 0x00e5ff, transparent: true, opacity: 0.15,
                side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
            })
        );
        earthGroup.add(atmosphere);

        const markersGroup = new THREE.Group();
        markersGroup.name = "markers";
        earthGroup.add(markersGroup);

        // Raycaster (Para ativar zoom apenas quando mouse estiver sobre a Terra)
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handlePointerMove = (event) => {
            if (!mountRef.current || !earthMeshRef.current) return;
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(earthMeshRef.current);
            if (intersects.length > 0) {
                controls.enableZoom = true;
                mountRef.current.style.cursor = 'grab';
            } else {
                controls.enableZoom = false;
                mountRef.current.style.cursor = 'default';
            }
        };
        window.addEventListener('pointermove', handlePointerMove);

        let frameId;
        const tempV = new THREE.Vector3();

        // Variáveis alvo para a câmera focar na América do Sul
        const TARGET_ROT_Y = 4.7;
        const TARGET_ROT_X = 0.2;

        const animate = () => {
            frameId = requestAnimationFrame(animate);

            // --- LÓGICA DE FOCO DA CÂMERA ---
            if (markersRef.current.length === 0) {
                // Modo descanso: Gira lentamente
                earthGroup.rotation.y += 0.0005;
            } else {
                // Tem pergunta na tela! Gira suavemente até alinhar a América do Sul com a câmera
                earthGroup.rotation.y += (TARGET_ROT_Y - earthGroup.rotation.y) * 0.05;
                earthGroup.rotation.x += (TARGET_ROT_X - earthGroup.rotation.x) * 0.05;
            }

            controls.update();
            renderer.render(scene, camera);

            // Lógica de grudar os nomes (Mantida)
            if (markersRef.current.length > 0 && labelsContainerRef.current) {
                const labelElements = labelsContainerRef.current.children;
                const canvasWidth = mountRef.current.clientWidth;
                const canvasHeight = mountRef.current.clientHeight;

                markersRef.current.forEach((m, i) => {
                    const label = labelElements[i];
                    if (!label) return;

                    const lat = m.latitude !== undefined ? m.latitude : m.lat;
                    const lon = m.longitude !== undefined ? m.longitude : m.lon;

                    const pos = calcPosFromLatLonRad(lat, lon, 4.0);
                    pos.applyMatrix4(earthGroup.matrixWorld);

                    const cameraDir = camera.position.clone().sub(pos).normalize();
                    const surfaceNormal = pos.clone().normalize();
                    const isFacingCamera = surfaceNormal.dot(cameraDir) > 0.2;

                    if (isFacingCamera) {
                        tempV.copy(pos).project(camera);
                        const x = (tempV.x * 0.5 + 0.5) * canvasWidth;
                        const y = (tempV.y * -0.5 + 0.5) * canvasHeight;

                        label.style.display = 'block';
                        label.style.left = `${x}px`;
                        label.style.top = `${y - 15}px`;
                    } else {
                        label.style.display = 'none';
                    }
                });
            }
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
            controls.dispose();
        };
    }, []);

    // --- DESENHO DOS PINOS MINIMALISTAS ---
    useEffect(() => {
        const earthGroup = globeRef.current;
        const markersGroup = earthGroup.children.find(c => c.name === "markers");

        if (markersGroup) {
            markersGroup.clear();
            if (!markers || markers.length === 0) return;

            markers.forEach(m => {
                const lat = m.latitude !== undefined ? m.latitude : m.lat;
                const lon = m.longitude !== undefined ? m.longitude : m.lon;
                if (lat === undefined || lon === undefined) return;

                const pos = calcPosFromLatLonRad(lat, lon, 4.0);

                // 1. Núcleo branco minúsculo (estilo radar)
                const pin = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                pin.position.copy(pos);

                // 2. Aura ciano translúcida muito menor e mais suave
                const glow = new THREE.Mesh(
                    new THREE.SphereGeometry(0.09, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
                );
                glow.position.copy(pos);

                markersGroup.add(pin);
                markersGroup.add(glow);
            });
        }
    }, [markers]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            <div ref={labelsContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {markers.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            color: '#ffffff', // Letra branca para melhor leitura
                            fontWeight: 'bold',
                            textShadow: '0 0 5px #00e5ff, 0 0 10px #000', // Sombra ciano e preta
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            transform: 'translate(-50%, -50%)',
                            display: 'none',
                            zIndex: 10
                        }}
                    >
                        {m.name || countryNames[m.isoCode] || m.isoCode.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameGlobe;