import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { latLngToVector3 } from "../../utils/geoMath";
import { CountryCoordData } from "../../utils/constants";

interface CountryLabelsProps {
  validIsoCodes: string[];
  countryCoords: Record<string, CountryCoordData>;
}

const LABEL_FADE_FULL = 2.2;
const LABEL_HIDE = 3.2;
const DOT_THRESHOLD = 0.3;
const DOT_FADE_RANGE = 0.2;

export function CountryLabels({
  validIsoCodes,
  countryCoords,
}: CountryLabelsProps) {
  const { camera } = useThree();

  // 1. Criamos um grupo para capturar a matriz de rotação global
  const groupRef = useRef<THREE.Group>(null);

  // 2. Dicionário de referências para manipular as divs HTML diretamente sem re-renderizar o React
  const labelsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const validSet = useMemo(() => new Set(validIsoCodes), [validIsoCodes]);
  const gameActive = validIsoCodes.length > 0;

  // 3. Vetores reutilizáveis (evita criar lixo na memória a cada frame)
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;

    const cameraDistance = camera.position.length();
      let globalOpacity = 1;

    if (cameraDistance > LABEL_HIDE) {
      globalOpacity = 0;
    } else if (cameraDistance > LABEL_FADE_FULL) {
      globalOpacity = 1 - (cameraDistance - LABEL_FADE_FULL) / (LABEL_HIDE - LABEL_FADE_FULL);
    }

    // ... (início do useFrame) ...
    camPos.copy(camera.position).normalize();

    Object.entries(countryCoords).forEach(([iso, { lat, lng, rank }]) => {
      const div = labelsRef.current[iso];
      if (!div) return;

      const isCandidate = validSet.has(iso);
      const isEliminated = gameActive && !isCandidate;

      // === LÓGICA GOOGLE EARTH: ZOOM & RANKS ===
      let rankOpacity = 1;

      // Os países eliminados ou não-candidatos sofrem o rigor do Zoom
      if (cameraDistance > 3.0) {
        rankOpacity = 0; // Zoom out máximo: ninguém aparece
      } else if (!isCandidate) { // Se não for candidato, obedece aos Ranks
        if (rank === 1 && cameraDistance > 2.8) rankOpacity = 0;
        if (rank === 2 && cameraDistance > 2.4) rankOpacity = 0;
        if (rank === 3 && cameraDistance > 1.8) rankOpacity = 0;
      }

      // Se a lógica do Google Earth escondeu, aborta o resto para poupar CPU
      if (rankOpacity === 0) {
        div.style.opacity = "0";
        return;
      }

      // === CÁLCULO DE OCLUSÃO (FRENTE/COSTAS DO PLANETA) ===
      const localPos = latLngToVector3(lat, lng, 1.02);
      worldPos.copy(localPos).applyMatrix4(groupRef.current!.matrixWorld).normalize();

      const dot = camPos.dot(worldPos);

      // Se está nas costas do planeta
      if (dot < DOT_THRESHOLD) {
        div.style.opacity = "0";
        return;
      }

      const edgeOpacity = Math.min(1, (dot - DOT_THRESHOLD) / DOT_FADE_RANGE);

      // Aplica as transparências finais
      const finalOpacity = rankOpacity * edgeOpacity * (isEliminated ? 0.2 : 1);
      div.style.opacity = finalOpacity.toFixed(3);
    });
  });

  return (
    <group ref={groupRef}>
      {Object.entries(countryCoords).map(([iso, { lat, lng, name }]) => {
        const position = latLngToVector3(lat, lng, 1.02);
        const isCandidate = validSet.has(iso);

        return (
          <Html
            key={iso}
            position={position}
            center
            distanceFactor={1.2}
            zIndexRange={[10, 20]}
          >
            <div
              // Capturamos a div no nosso dicionário de referências
              ref={(el) => { labelsRef.current[iso] = el; }} style={{
                color: isCandidate ? "#00e5ff" : "rgba(255,255,255,0.7)",
                fontSize: isCandidate ? "11px" : "9px",
                fontWeight: isCandidate ? 600 : 400,
                fontFamily: "sans-serif",
                letterSpacing: isCandidate ? "0.08em" : "0.04em",
                textShadow: isCandidate
                  ? "0 0 8px rgba(0,229,255,0.8), 0 1px 3px rgba(0,0,0,0.9)"
                  : "0 1px 3px rgba(0,0,0,0.9)",
                opacity: 0, // Começa invisível; o useFrame assume o controle instantaneamente
                transition: "color 0.3s ease, font-size 0.3s ease", // Removemos a opacidade da transição CSS
                pointerEvents: "none",
                whiteSpace: "nowrap",
                userSelect: "none",
                zIndex: isCandidate ? 100 : 1, // Candidatos sempre por cima
              }}
            >
              {name}
            </div>
          </Html>
        );
      })}
    </group>
  );
}