/**
 * @module components/globe/GlobeLoader
 * Suspense fallback displayed inside the R3F Canvas while
 * textures, HDRI, and GeoJSON are loading.
 *
 * Uses @react-three/drei Html to render DOM content inside
 * the 3D scene (centered in the viewport).
 */

import { Html } from "@react-three/drei";

export function GlobeLoader() {
  return (
    <Html center>
      <div
        style={{
          color: "white",
          fontSize: "14px",
          fontFamily: "sans-serif",
          opacity: 0.7,
          letterSpacing: "0.1em",
        }}
      >
        Carregando globo...
      </div>
    </Html>
  );
}
