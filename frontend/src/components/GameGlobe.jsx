import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Função matemática para converter Latitude/Longitude do Java para XYZ do 3D
const calcPosFromLatLonRad = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
};

const GameGlobe = ({ markers = [] }) => {
    const mountRef = useRef(null);
    const globeRef = useRef(new THREE.Group());

    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        // Sem neblina para ficar bem nítido no jogo

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 13; // Um pouco mais perto que na Home (Zoom)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (mountRef.current) {
            while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
            mountRef.current.appendChild(renderer.domElement);
        }

        const earthGroup = globeRef.current;

        // --- ROTAÇÃO INICIAL: FOCADO NA AMÉRICA DO SUL ---
        // Ajuste manual para o Brasil aparecer de frente
        earthGroup.rotation.y = 4.7;
        earthGroup.rotation.x = 0.2;

        scene.add(earthGroup);

        // ILUMINAÇÃO
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(-10, 5, 20); // Luz vindo de frente/esquerda
        scene.add(sunLight);
        scene.add(new THREE.AmbientLight(0x404040, 1.5)); // Mais claro que na home para ver bem o mapa

        // TEXTURAS
        const textureLoader = new THREE.TextureLoader();
        const earthMap = textureLoader.load('/img/earth-8k.jpg');
        // Sem nuvens no mapa tático para não atrapalhar a visão dos países
        // const cloudMap = textureLoader.load('/img/clouds-8k.jpg'); 

        // TERRA
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(4, 64, 64),
            new THREE.MeshPhongMaterial({ map: earthMap, shininess: 5 })
        );
        earthGroup.add(earth);

        // ATMOSFERA (Mais sutil)
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(4.1, 64, 64),
            new THREE.MeshPhongMaterial({
                color: 0x00e5ff, transparent: true, opacity: 0.1,
                side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
            })
        );
        earthGroup.add(atmosphere);

        // GRUPO DOS MARKERS
        const markersGroup = new THREE.Group();
        markersGroup.name = "markers";
        earthGroup.add(markersGroup);

        // ANIMAÇÃO
        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            // No jogo, o planeta gira MUITO devagar, quase estático
            earthGroup.rotation.y += 0.0002;
            renderer.render(scene, camera);
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
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
        };
    }, []);

    // --- ATUALIZAÇÃO DOS PINOS ---
    useEffect(() => {
        const earthGroup = globeRef.current;
        const markersGroup = earthGroup.children.find(c => c.name === "markers");

        if (markersGroup) {
            markersGroup.clear();

            markers.forEach(m => {
                if (!m.lat || !m.lon) return;

                const pos = calcPosFromLatLonRad(m.lat, m.lon, 4.0);

                // Pino Ciano Brilhante
                const pin = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0x00e5ff })
                );
                pin.position.copy(pos);

                // Glow do pino (uma esfera transparente maior volta)
                const glow = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 16, 16),
                    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 })
                );
                glow.position.copy(pos);

                markersGroup.add(pin);
                markersGroup.add(glow);
            });
        }
    }, [markers]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameGlobe;