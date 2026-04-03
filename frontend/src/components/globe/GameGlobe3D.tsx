/**
 * @module components/globe/GameGlobe3D
 * Root component — orchestrates the entire 3D globe scene.
 *
 * Responsibilities:
 *   - Fetches Natural Earth GeoJSON on mount
 *   - Configures R3F Canvas with cinematic tone-mapping
 *   - Wires up all sub-components: Earth, Atmosphere, Stars,
 *     CountriesLayer, GlobeCamera, GlobeControls, CountryLabels,
 *     plus post-processing (Bloom)
 *   - Passes `validIsoCodes` from parent down to reactive layers
 *
 * CANVAS RULES:
 *   - toneMapping: ACESFilmicToneMapping (cinematic colors)
 *   - toneMappingExposure: 1.2 (slightly elevated for realism)
 *   - outputColorSpace: SRGBColorSpace (correct texture display)
 *   - HDRI loaded locally from /public/hdri/space.hdr
 *   - Bloom: intensity ≤ 0.2, luminanceThreshold ≥ 0.7 (subtle, not cartoon)
 *   - Initial camera: South America centered via latLngToVector3(-15, -55, 2.4)
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
import { Earth } from "./Earth";
import { Atmosphere } from "./Atmosphere";
import { Stars } from "./Stars";
import { CountriesLayer } from "./CountriesLayer";
import { GlobeCamera } from "./GlobeCamera";
import { GlobeControls } from "./GlobeControls";
import { CountryLabels } from "./CountryLabels";
import type { GameGlobe3DProps } from "../../types/globe";
import type { GeoFeatureCollection } from "../../types/geo";
import { parseGeoJSON } from "../../utils/geoJsonParser";
import { latLngToVector3 } from "../../utils/geoMath";
import { COUNTRY_COORDS } from "../../utils/constants";

/** Natural Earth 110m GeoJSON — lightweight for fast initial load */
const GEO_JSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

/** Initial camera position: South America centered */
const INITIAL_POS = latLngToVector3(-15, -55, 3.9);

/** Idle rotation speed in radians per second */
const ROTATION_SPEED = 0.02;

/**
 * Wrapper that applies synchronized idle rotation to all children.
 * Everything "stuck to the planet surface" (Earth mesh, country borders,
 * country labels) lives inside this group so they rotate as one unit.
 * Rotation pauses while the camera is performing a fly-to animation.
 */
function SpinningGlobeGroup({ children, isGameActive }: { children: React.ReactNode, isGameActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Só rotaciona sozinho se a câmera NÃO estiver voando E o jogo NÃO estiver ativo
    if (groupRef.current && !window.__globeIsFocusing && !isGameActive) {
      groupRef.current.rotation.y += delta * ROTATION_SPEED;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export function GameGlobe3D({ validIsoCodes }: GameGlobe3DProps) {
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch GeoJSON once on mount — cancellable to prevent state updates after unmount
  useEffect(() => {
    let cancelled = false;

    fetch(GEO_JSON_URL)
      .then((r) => r.json())
      .then((raw: unknown) => {
        if (!cancelled) setGeoData(parseGeoJSON(raw));
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setGeoError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (geoError) {
    return <div>Erro ao carregar dados geográficos: {geoError}</div>;
  }

  return (
    <Canvas
      camera={{ position: INITIAL_POS, fov: 45, near: 0.1, far: 1000 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        {/* ── Lighting ──────────────────────────────────────────── */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[5, 3, 5]}
          intensity={2.5}
          castShadow={false}
          color="#fff5e0"
        />

        {/* HDRI as scene.environment ONLY — background comes from Stars */}
        <Environment
          files="/hdri/space.hdr"
          background={false}
          environmentIntensity={0.3}
        />

        {/* ── Atmosphere & Stars — fixed in world space ────────── */}
        <Atmosphere />
        <Stars />

        {/* ── Orbit Controls — world space ─────────────────────── */}
        <GlobeControls />

        {/* ── Spinning Globe Group ─────────────────────────────── */}
        <SpinningGlobeGroup isGameActive={validIsoCodes.length > 0}>
          <Earth />
          {geoData && (
            <>
              <CountriesLayer
                features={geoData.features}
                validIsoCodes={validIsoCodes}
              />
              <CountryLabels
                validIsoCodes={validIsoCodes}
                countryCoords={COUNTRY_COORDS}
              />
            </>
          )}
        </SpinningGlobeGroup>

        {/* ── Camera — MUST stay outside SpinningGlobeGroup ────── */}
        {/* It calculates positions in world space coordinates     */}
        {geoData && (
          <GlobeCamera
            validIsoCodes={validIsoCodes}
          />
        )}

        {/* ── Post-processing: subtle Bloom, NOT neon/cartoon ─── */}
        <EffectComposer>
          <Bloom
            intensity={0.15}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
