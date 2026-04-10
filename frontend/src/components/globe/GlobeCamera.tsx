/**
 * @module components/globe/GlobeCamera
 * Programmatic camera controller with safe Quaternion.slerp fly-to animation.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { GlobeCameraProps } from "../../types/globe";
import { COUNTRY_COORDS } from "../../utils/constants";
import { latLngToVector3 } from "../../utils/geoMath";

const LERP_SPEED = 0.04;

window.__globeIsFocusing = false;

export function GlobeCamera({ validIsoCodes }: GlobeCameraProps): null {
  const { camera, scene } = useThree();
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 3.9));
  const currentPositionRef = useRef<THREE.Vector3>(camera.position.clone());
  const isFocusingRef = useRef<boolean>(false);
  const animProgressRef = useRef<number>(0);

  // Um objeto "fantasma" para calcular rotações seguras (evita divisão por zero)
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (validIsoCodes.length === 0) return;

    const activeCoords = validIsoCodes
      .filter((iso) => iso in COUNTRY_COORDS)
      .map((iso) => COUNTRY_COORDS[iso as keyof typeof COUNTRY_COORDS]);

    if (activeCoords.length === 0) return;

    const avgVector = new THREE.Vector3();

    // 1. INTELIGÊNCIA DE FOCO
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

        // Busca a rotação atualizada do grupo rotativo (sincroniza câmera com o globo)
        const spinningGroup = scene.getObjectByName("spinning-globe-group");
        const currentGlobeRotationY = spinningGroup?.rotation.y || 0;
        avgVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentGlobeRotationY);
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
    currentPositionRef.current.copy(camera.position);
    isFocusingRef.current = true;
    animProgressRef.current = 0;
    window.__globeIsFocusing = true;
  }, [validIsoCodes, scene, camera]);

  useFrame((_, delta) => {
    if (!isFocusingRef.current) return;

    animProgressRef.current = Math.min(animProgressRef.current + delta * LERP_SPEED * 60, 1);
    const t = easeInOut(animProgressRef.current);

    // Cálculos seguros de Quaternion usando o Fantasma
    dummy.position.copy(currentPositionRef.current);
    dummy.lookAt(0, 0, 0);
    const startQ = dummy.quaternion.clone();

    dummy.position.copy(targetPositionRef.current);
    dummy.lookAt(0, 0, 0);
    const targetQ = dummy.quaternion.clone();

    // Interpola a rotação perfeitamente sem erros de matemática
    camera.quaternion.slerpQuaternions(startQ, targetQ, t);

    // Interpola a distância e recua a câmera a partir da origem
    const startDist = currentPositionRef.current.length();
    const endDist = targetPositionRef.current.length();
    const currentDist = THREE.MathUtils.lerp(startDist, endDist, t);

    camera.position.set(0, 0, currentDist).applyQuaternion(camera.quaternion);

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