import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import type { CountriesLayerProps } from "../../types/globe";
import type { CountryFeature } from "../../types/geo";
import { latLngToVector3 } from "../../utils/geoMath";

// ─── Constants ────────────────────────────────────────────────────────────────
const GLOBE_RADIUS = 1.005;
const GLOW_RADIUS = 1.008; // levemente acima do border para o halo neon

const COLOR_CANDIDATE = new THREE.Color(0x00e5ff); // cyan
const COLOR_ELIMINATED = new THREE.Color(0xffffff);
const COLOR_DEFAULT = new THREE.Color(0xffffff);

const LINE_FADE_FULL = 3.0;
const LINE_HIDE = 3.8;

// ─── Render mode ─────────────────────────────────────────────────────────────
type RenderMode = 'idle' | 'outline-subtle' | 'outline-bright';

function getRenderMode(n: number): RenderMode {
    if (n === 0) return 'idle';
    if (n > 50) return 'outline-subtle';
    return 'outline-bright';
}

// ─── Border geometry builder ──────────────────────────────────────────────────
function buildBorderGeometry(feature: CountryFeature): THREE.BufferGeometry | null {
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

// ─── Glow geometry builder ────────────────────────────────────────────────────
// Mesma lógica do buildBorderGeometry, mas projeta os pontos em GLOW_RADIUS
// para que o halo fique levemente acima da borda core, criando profundidade neon.
function buildGlowGeometry(feature: CountryFeature): THREE.BufferGeometry | null {
    const rings: number[][][] =
        feature.geometry.type === "Polygon"
            ? feature.geometry.coordinates
            : feature.geometry.coordinates.flat();

    const points: THREE.Vector3[] = [];
    rings.forEach((ring) => {
        for (let i = 0; i < ring.length; i++) {
            const [lng, lat] = ring[i];
            const [lngNext, latNext] = ring[(i + 1) % ring.length];
            points.push(latLngToVector3(lat, lng, GLOW_RADIUS));
            points.push(latLngToVector3(latNext, lngNext, GLOW_RADIUS));
        }
    });

    if (points.length === 0) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CountriesLayer({
    features,
    validIsoCodes,
}: CountriesLayerProps) {
    const borderGroupRef = useRef<THREE.Group | null>(null);
    const linesRef = useRef<Record<string, THREE.LineSegments>>({});
    const materialsRef = useRef<Record<string, THREE.LineBasicMaterial>>({});
    const baseOpacitiesRef = useRef<Record<string, number>>({});

    const glowGroupRef = useRef<THREE.Group | null>(null);
    const glowLinesRef = useRef<Record<string, THREE.LineSegments>>({});
    const glowMaterialsRef = useRef<Record<string, THREE.LineBasicMaterial>>({});
    const baseGlowOpacitiesRef = useRef<Record<string, number>>({});

    const { camera } = useThree();

    // ── Border geometries ────────────────────────────────────────────────────
    const borderGeomMap = useMemo(() => {
        const map: Record<string, THREE.BufferGeometry> = {};
        features.forEach((f) => {
            const iso = f.properties.NORMALIZED_ISO;
            if (!iso) return;
            const g = buildBorderGeometry(f);
            if (g) map[iso] = g;
        });
        return map;
    }, [features]);

    // ── Glow geometries (same topology as border, higher radius) ────────────────
    const glowGeomMap = useMemo(() => {
        const map: Record<string, THREE.BufferGeometry> = {};
        features.forEach((f) => {
            const iso = f.properties.NORMALIZED_ISO;
            if (!iso) return;
            const g = buildGlowGeometry(f);
            if (g) map[iso] = g;
        });
        return map;
    }, [features]);

    // ── Create border LineSegments ───────────────────────────────────────────
    useEffect(() => {
        if (!borderGroupRef.current) return;
        const group = borderGroupRef.current;
        group.clear();
        linesRef.current = {};
        materialsRef.current = {};

        Object.entries(borderGeomMap).forEach(([iso, geometry]) => {
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
    }, [borderGeomMap]);

    // ── Create glow LineSegments ─────────────────────────────────────────────
    useEffect(() => {
        if (!glowGroupRef.current) return;
        const group = glowGroupRef.current;
        group.clear();
        glowLinesRef.current = {};
        glowMaterialsRef.current = {};

        Object.entries(glowGeomMap).forEach(([iso, geometry]) => {
            const material = new THREE.LineBasicMaterial({
                color: COLOR_CANDIDATE,
                transparent: true,
                opacity: 0, // invisível por padrão — ativado no useEffect de validIsoCodes
            });
            const line = new THREE.LineSegments(geometry, material);
            glowMaterialsRef.current[iso] = material;
            glowLinesRef.current[iso] = line;
            group.add(line);
        });

        return () => {
            Object.values(glowMaterialsRef.current).forEach((m) => m.dispose());
            glowMaterialsRef.current = {};
            glowLinesRef.current = {};
            group.clear();
        };
    }, [glowGeomMap]);

    // ── React to validIsoCodes change ────────────────────────────────────────
    useEffect(() => {
        const validSet = new Set(validIsoCodes);
        const N = validIsoCodes.length;
        const mode = getRenderMode(N);

        Object.entries(materialsRef.current).forEach(([iso, material]) => {
            const isCandidate = validSet.has(iso);

            if (mode === 'idle') {
                material.color.set(COLOR_DEFAULT);
                baseOpacitiesRef.current[iso] = 0.2;
            } else if (mode === 'outline-subtle') {
                material.color.set(COLOR_DEFAULT);
                baseOpacitiesRef.current[iso] = isCandidate ? 0.4 : 0.04;
            } else {
                // outline-bright (inclui N=1)
                material.color.set(isCandidate ? COLOR_CANDIDATE : COLOR_ELIMINATED);
                baseOpacitiesRef.current[iso] = isCandidate ? 0.9 : 0.06;
            }
            material.needsUpdate = true;
        });

        // Glow: visível apenas nos candidatos em outline-bright
        Object.entries(glowMaterialsRef.current).forEach(([iso, glowMat]) => {
            const isCandidate = validSet.has(iso);
            const showGlow = isCandidate && (mode === 'outline-bright');
            glowMat.color.set(COLOR_CANDIDATE);
            baseGlowOpacitiesRef.current[iso] = showGlow ? 0.35 : 0;
            glowMat.needsUpdate = true;
        });
    }, [validIsoCodes]);

    // ── Per-frame: LOD on borders + glow ─────────────────────────────────────
    useFrame(() => {
        const dist = camera.position.length();

        let lodFactor: number;
        if (dist > LINE_HIDE) lodFactor = 0;
        else if (dist < LINE_FADE_FULL) lodFactor = 1;
        else lodFactor = 1 - (dist - LINE_FADE_FULL) / (LINE_HIDE - LINE_FADE_FULL);

        Object.entries(materialsRef.current).forEach(([iso, material]) => {
            if (lodFactor <= 0) { material.visible = false; return; }
            material.visible = true;
            material.opacity = (baseOpacitiesRef.current[iso] ?? 0.2) * lodFactor;
        });

        // LOD + fade no glow neon
        Object.entries(glowMaterialsRef.current).forEach(([iso, glowMat]) => {
            const baseGlow = baseGlowOpacitiesRef.current[iso] ?? 0;
            if (lodFactor <= 0 || baseGlow === 0) {
                glowMat.visible = false;
                return;
            }
            glowMat.visible = true;
            // Pulsa suavemente entre 70% e 100% da opacidade base para efeito vivo
            const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.003);
            glowMat.opacity = baseGlow * lodFactor * pulse;
        });
    });

    return (
        <>
            <group ref={borderGroupRef} />
            <group ref={glowGroupRef} />
        </>
    );
}
