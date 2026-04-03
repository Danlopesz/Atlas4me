import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import type { CountriesLayerProps } from "../../types/globe";
import type { CountryFeature } from "../../types/geo";
import { latLngToVector3 } from "../../utils/geoMath";

const GLOBE_RADIUS = 1.005;
const COLOR_CANDIDATE = new THREE.Color(0x00e5ff);
const COLOR_ELIMINATED = new THREE.Color(0xffffff);
const COLOR_DEFAULT = new THREE.Color(0xffffff);

const LINE_FADE_FULL = 3.0;  // totalmente visível abaixo desta distância
const LINE_HIDE = 3.8;       // completamente invisível acima (zoom out / visão inicial)

function buildBorderGeometry(
  feature: CountryFeature
): THREE.BufferGeometry | null {
  const rings: number[][][] =
    feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat();

  const points: THREE.Vector3[] = [];
  rings.forEach((ring) => {
    for (let i = 0; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      const [lngNext, latNext] = ring[(i + 1) % ring.length];
      points.push(latLngToVector3(lat, lng, GLOBE_RADIUS));
      points.push(latLngToVector3(latNext, lngNext, GLOBE_RADIUS));
    }
  });

  if (points.length === 0) return null;
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function CountriesLayer({
  features,
  validIsoCodes,
}: CountriesLayerProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const linesRef = useRef<Record<string, THREE.LineSegments>>({});
  const materialsRef = useRef<Record<string, THREE.LineBasicMaterial>>({});
  const { camera } = useThree();
  const baseOpacitiesRef = useRef<Record<string, number>>({});

  const geometryMap = useMemo(() => {
    const map: Record<string, THREE.BufferGeometry> = {};
    features.forEach((feature) => {
      const iso = feature.properties.NORMALIZED_ISO;
      if (!iso) return;
      const geom = buildBorderGeometry(feature);
      if (geom) map[iso] = geom;
    });
    return map;
  }, [features]);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    group.clear();

    Object.entries(geometryMap).forEach(([iso, geometry]) => {
      const material = new THREE.LineBasicMaterial({
        color: COLOR_DEFAULT,
        transparent: true,
        opacity: 0.2,
      });
      const line = new THREE.LineSegments(geometry, material);
      materialsRef.current[iso] = material;
      linesRef.current[iso] = line;
      group.add(line);
    });

    return () => {
      Object.values(materialsRef.current).forEach((m) => m.dispose());
      materialsRef.current = {};
      linesRef.current = {};
      group.clear();
    };
  }, [geometryMap]);

  useEffect(() => {
    const validSet = new Set(validIsoCodes);
    const gameActive = validIsoCodes.length > 0;

    Object.entries(materialsRef.current).forEach(([iso, material]) => {
      const isCandidate = validSet.has(iso);
      let targetOpacity: number;
      let targetColor: THREE.Color;

      if (!gameActive) {
        targetColor = COLOR_DEFAULT;
        targetOpacity = 0.2;
      } else if (isCandidate) {
        targetColor = COLOR_CANDIDATE;
        targetOpacity = 0.9;
      } else {
        targetColor = COLOR_ELIMINATED;
        targetOpacity = 0.06;
      }

      material.color.set(targetColor);
      // Salvar opacidade alvo — o useFrame vai modular pelo LOD
      baseOpacitiesRef.current[iso] = targetOpacity;
      material.needsUpdate = true;
    });
  }, [validIsoCodes]);

  // LOD das linhas — atualizado no loop de render, sem re-render React
  useFrame(() => {
    const dist = camera.position.length();
    let lodFactor: number;

    if (dist > LINE_HIDE) {
      lodFactor = 0;
    } else if (dist < LINE_FADE_FULL) {
      lodFactor = 1;
    } else {
      lodFactor = 1 - (dist - LINE_FADE_FULL) / (LINE_HIDE - LINE_FADE_FULL);
    }

    Object.entries(materialsRef.current).forEach(([iso, material]) => {
      // Se lodFactor chegou a 0, desligamos a renderização da linha totalmente
      if (lodFactor <= 0) {
        material.visible = false;
        return;
      }

      // Caso contrário, garantimos que ela está visível e aplicamos a opacidade
      material.visible = true;
      const base = baseOpacitiesRef.current[iso] ?? 0.2;
      material.opacity = base * lodFactor;
    });
  });

  return <group ref={groupRef} />;
}