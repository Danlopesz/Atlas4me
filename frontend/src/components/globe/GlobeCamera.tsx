/**
 * @module components/globe/GlobeCamera
 * Programmatic camera controller with safe spherical position slerping.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { GlobeCameraProps } from "../../types/globe";
import { COUNTRY_COORDS } from "../../utils/constants";
import { latLngToVector3 } from "../../utils/geoMath";

const LERP_SPEED = 0.04;

window.__globeIsFocusing = false;

export function GlobeCamera({ validIsoCodes }: GlobeCameraProps): null {
  const { camera, scene } = useThree();
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 3.9));
  const startPositionRef = useRef<THREE.Vector3>(new THREE.Vector3()); // Mais semântico que currentPositionRef
  const isFocusingRef = useRef<boolean>(false);
  const animProgressRef = useRef<number>(0);

  useEffect(() => {
    if (validIsoCodes.length === 0) return;

    const activeCoords = validIsoCodes
      .filter((iso) => iso in COUNTRY_COORDS)
      .map((iso) => COUNTRY_COORDS[iso as keyof typeof COUNTRY_COORDS]);

    if (activeCoords.length === 0) return;

    const avgVector = new THREE.Vector3();

    // 1. INTELIGÊNCIA DE FOCO MATEMATICAMENTE SEGURA
    if (validIsoCodes.length > 20) {
      avgVector.copy(camera.position).normalize();
    } else {
      activeCoords.forEach((c) => {
        avgVector.add(latLngToVector3(c.lat, c.lng, 1));
      });

      if (avgVector.lengthSq() < 0.001) {
        avgVector.copy(camera.position).normalize();
      } else {
        avgVector.normalize();

        // FIX CRÍTICO 1: Usar o Quaternion Global Absoluto em vez de apenas rotation.y
        // Isso resolve o bug do "Oceano" caso o globo tenha offsets visuais ou esteja aninhado.
        const spinningGroup = scene.getObjectByName("spinning-globe-group");
        if (spinningGroup) {
          const globeWorldRotation = new THREE.Quaternion();
          spinningGroup.getWorldQuaternion(globeWorldRotation);
          avgVector.applyQuaternion(globeWorldRotation);
        }
      }
    }

    // 2. ZOOM DINÂMICO ESCALONADO
    let targetDistance = 3.5;
    if (validIsoCodes.length === 1) targetDistance = 2.0;
    else if (validIsoCodes.length <= 5) targetDistance = 2.4;
    else if (validIsoCodes.length <= 15) targetDistance = 2.8;
    else if (validIsoCodes.length <= 40) targetDistance = 3.2;

    avgVector.multiplyScalar(targetDistance);

    targetPositionRef.current.copy(avgVector);
    startPositionRef.current.copy(camera.position);
    isFocusingRef.current = true;
    animProgressRef.current = 0;
    window.__globeIsFocusing = true;
  }, [validIsoCodes, scene, camera]);

  useFrame((_, delta) => {
    if (!isFocusingRef.current) return;

    animProgressRef.current = Math.min(animProgressRef.current + delta * LERP_SPEED * 60, 1);
    const t = easeInOut(animProgressRef.current);

    // FIX CRÍTICO 2: Interpolação esférica pela Posição, não pela Rotação.
    // Usamos o conceito do seu próprio geoMath.ts para traçar um arco perfeito sobre a esfera.
    const forward = new THREE.Vector3(0, 0, 1);

    // Calcula os quaternions que representam a direção de origem e destino
    const startQ = new THREE.Quaternion().setFromUnitVectors(forward, startPositionRef.current.clone().normalize());
    const targetQ = new THREE.Quaternion().setFromUnitVectors(forward, targetPositionRef.current.clone().normalize());

    // Interpola a direção
    const currentQ = startQ.clone().slerp(targetQ, t);

    // Interpola a distância suavemente
    const startDist = startPositionRef.current.length();
    const targetDist = targetPositionRef.current.length();
    const currentDist = THREE.MathUtils.lerp(startDist, targetDist, t);

    // Define a posição da câmera na curva exata do arco
    camera.position.set(0, 0, currentDist).applyQuaternion(currentQ);

    // FIX CRÍTICO 3: Força a câmera a olhar para o centro.
    // Isso garante que o eixo UP (0,1,0) se mantenha estável, evitando conflitos com o OrbitControls no fim do voo.
    camera.lookAt(0, 0, 0);

    if (animProgressRef.current >= 1) {
      isFocusingRef.current = false;
      window.__globeIsFocusing = false;
    }
  });

  return null;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}