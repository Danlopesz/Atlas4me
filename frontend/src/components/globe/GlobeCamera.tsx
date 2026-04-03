/**
 * @module components/globe/GlobeCamera
 * Programmatic camera controller with Quaternion.slerp fly-to animation.
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
  const targetPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 2.4));
  const currentPositionRef = useRef<THREE.Vector3>(camera.position.clone());
  const isFocusingRef = useRef<boolean>(false);
  const animProgressRef = useRef<number>(0);

  useEffect(() => {
    if (validIsoCodes.length === 0) return;

    const activeCoords = validIsoCodes
      .filter((iso) => iso in COUNTRY_COORDS)
      .map((iso) => COUNTRY_COORDS[iso as keyof typeof COUNTRY_COORDS]);

    if (activeCoords.length === 0) return;

    let avgVector = new THREE.Vector3();

    // 1. INTELIGÊNCIA DE FOCO: Só calcula o centro se fizer sentido geográfico
    if (validIsoCodes.length > 40) {
      // Muitos países espalhados: mantém o ângulo atual do jogador
      avgVector.copy(camera.position).normalize();
    } else {
      // Cluster menor de países: calcula o centro exato
      activeCoords.forEach((c) => {
        avgVector.add(latLngToVector3(c.lat, c.lng, 1));
      });

      // Proteção matemática caso a média dê zero absoluto
      if (avgVector.lengthSq() < 0.001) {
        avgVector.copy(camera.position).normalize();
      } else {
        avgVector.normalize();
        const earthMesh = scene.getObjectByName("earthMesh");
        const currentGlobeRotationY = earthMesh?.parent?.rotation.y || 0;
        avgVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentGlobeRotationY);
      }
    }

    // 2. ZOOM DINÂMICO ESCALONADO
    let targetDistance = 3.5;
    if (validIsoCodes.length === 1) targetDistance = 2.0;       // Revelação final (confortável)
    else if (validIsoCodes.length <= 5) targetDistance = 2.4;   // Foco muito próximo
    else if (validIsoCodes.length <= 15) targetDistance = 2.8;  // Foco regional (ex: América do Sul)
    else if (validIsoCodes.length <= 40) targetDistance = 3.2;  // Foco continental
    else targetDistance = 3.5;                                  // Visão global (espaço)

    avgVector.multiplyScalar(targetDistance);

    targetPositionRef.current = avgVector;
    currentPositionRef.current = camera.position.clone();
    isFocusingRef.current = true;
    animProgressRef.current = 0;
    window.__globeIsFocusing = true;
  }, [validIsoCodes, scene, camera]);

  useFrame((_state, delta) => {
    if (!isFocusingRef.current) return;

    animProgressRef.current = Math.min(animProgressRef.current + delta * LERP_SPEED * 60, 1);
    const t = easeInOut(animProgressRef.current);

    const forward = new THREE.Vector3(0, 0, 1);
    const fromQ = new THREE.Quaternion().setFromUnitVectors(
      forward,
      currentPositionRef.current.clone().normalize()
    );
    const toQ = new THREE.Quaternion().setFromUnitVectors(
      forward,
      targetPositionRef.current.clone().normalize()
    );

    const slerpedQ = fromQ.slerp(toQ, t);

    const startDist = currentPositionRef.current.length();
    const endDist = targetPositionRef.current.length();
    const currentDist = THREE.MathUtils.lerp(startDist, endDist, t);

    const newPos = new THREE.Vector3(0, 0, currentDist).applyQuaternion(slerpedQ);

    camera.position.copy(newPos);
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