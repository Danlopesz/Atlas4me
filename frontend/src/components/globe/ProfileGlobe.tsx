import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Environment } from "@react-three/drei";
import { Earth } from "./Earth";
import { Atmosphere } from "./Atmosphere";
import { Stars } from "../Stars/Stars";
import { CountriesLayer } from "./CountriesLayer";
import type { GeoFeatureCollection } from "../../types/geo";
import { parseGeoJSON } from "../../utils/geoJsonParser";
import { latLngToVector3 } from "../../utils/geoMath";

const GEO_JSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

const INITIAL_POS = latLngToVector3(20, 0, 2.8);
const ROTATION_SPEED = 0.08;

interface ProfileGlobeProps {
  isoCodesDiscovered: string[];
}

function AutoRotatingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * ROTATION_SPEED;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function GlobeScene({ isoCodesDiscovered }: ProfileGlobeProps) {
  const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_JSON_URL)
      .then((r) => r.json())
      .then((raw: unknown) => {
        if (!cancelled) setGeoData(parseGeoJSON(raw));
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#fff5e0" />

      <Environment files="/hdri/space.hdr" background={false} environmentIntensity={0.3} />

      <Atmosphere />
      <Stars />

      <AutoRotatingGroup>
        <Earth />
        {geoData && (
          <CountriesLayer
            features={geoData.features}
            validIsoCodes={isoCodesDiscovered}
          />
        )}
      </AutoRotatingGroup>

      <EffectComposer>
        <Bloom intensity={0.15} luminanceThreshold={0.8} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function ProfileGlobe({ isoCodesDiscovered }: ProfileGlobeProps) {
  const isEmpty = isoCodesDiscovered.length === 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: INITIAL_POS, fov: 45, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <GlobeScene isoCodesDiscovered={isoCodesDiscovered} />
        </Suspense>
      </Canvas>

      {isEmpty && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.45)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          Jogue sua primeira partida para começar a colorir o mundo.
        </div>
      )}
    </div>
  );
}
