import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Planet3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. CENA
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.03);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 16;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (mountRef.current) {
            // Garante que o container esteja limpo antes de adicionar
            while(mountRef.current.firstChild){
                mountRef.current.removeChild(mountRef.current.firstChild);
            }
            mountRef.current.appendChild(renderer.domElement);
        }

        // Grupo da Terra
        const earthGroup = new THREE.Group();
        earthGroup.position.x = 6; // Posição à direita
        scene.add(earthGroup);

        // 2. ILUMINAÇÃO (Essencial para não ficar preto!)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(-10, 5, 10);
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Luz base
        scene.add(ambientLight);

        // Luz de borda azulada (Cinematográfica)
        const rimLight = new THREE.SpotLight(0x00aaff, 5);
        rimLight.position.set(15, 0, -20);
        rimLight.lookAt(earthGroup.position);
        scene.add(rimLight);

        // 3. TEXTURAS
        const textureLoader = new THREE.TextureLoader();

        // Carregando suas imagens locais
        const earthMap = textureLoader.load('/img/earth-8k.jpg');

        // Tenta carregar nuvens, mas só aplica se der certo
        const cloudMap = textureLoader.load('/img/clouds-8k.jpg');

        // 4. PLANETA TERRA
        const earthGeometry = new THREE.SphereGeometry(4, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthMap,
            shininess: 10,
            // color: 0xffffff // Branco padrão (não mistura com vermelho)
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earth);

        // 5. NUVENS (Com correção para fundo preto)
        const cloudGeometry = new THREE.SphereGeometry(4.05, 64, 64);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: cloudMap,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        earthGroup.add(clouds);

        // 6. ATMOSFERA (Glow)
        const atmosphereGeometry = new THREE.SphereGeometry(4.05, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        earthGroup.add(atmosphere);

        // 7. ESTRELAS
        const starsGeo = new THREE.BufferGeometry();
        const starsCnt = 1500;
        const starsPos = new Float32Array(starsCnt * 3);
        for(let i=0; i<starsCnt*3; i++) starsPos[i] = (Math.random() - 0.5) * 300;
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({size: 0.1, color: 0xffffff, transparent: true, opacity: 0.8});
        const starMesh = new THREE.Points(starsGeo, starsMat);
        scene.add(starMesh);

        // 8. ANIMAÇÃO
        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            earth.rotation.y += 0.001;
            clouds.rotation.y += 0.0014; // Nuvens um pouco mais rápido
            starMesh.rotation.y -= 0.0001;
            renderer.render(scene, camera);
        };
        animate();

        // 9. RESIZE
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            earthGeometry.dispose();
            earthMaterial.dispose();
            cloudMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: '#050505', // Fundo quase preto
            }}
        />
    );
};

export default Planet3D;