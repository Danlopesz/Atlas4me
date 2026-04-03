/**
 * @module types/globe
 * Props and state interfaces for all GameGlobe3D sub-components.
 * Every component in src/components/globe/ pulls its prop type from here.
 *
 * CRITICAL: Three.js types are imported with `import type` to ensure
 * they are erased at runtime and never bundled as values.
 */

import type { Mesh } from "three";
import type { CountryFeature } from "./geo";

/** Root component — receives the backend's validIsoCodes array. */
export interface GameGlobe3DProps {
  validIsoCodes: string[];
}

/** CountriesLayer — renders GeoJSON meshes and highlights active countries. */
export interface CountriesLayerProps {
  features: CountryFeature[];
  validIsoCodes: string[];
}

/** GlobeCamera — programmatic camera control (fly-to, zoom). */
export interface GlobeCameraProps {
  validIsoCodes: string[];
}

/**
 * Reference to a country's rendered meshes.
 * Used by CountriesLayer for per-country material updates.
 *
 * - `activeMesh`: mesh rendered when the country is a candidate (highlighted)
 * - `inactiveMesh`: mesh rendered when the country is eliminated (dimmed)
 *
 * Both are nullable because refs are initialized as null before mount.
 */
export interface CountryMeshRef {
  isoCode: string;
  activeMesh: Mesh | null;
  inactiveMesh: Mesh | null;
}

export interface CountryLabelsProps {
  validIsoCodes: string[];
  countryCoords: Record<string, { lat: number; lng: number; name: string; rank: number }>;
}

export interface GlobeControlsProps {
  // sem props — acessa câmera via useThree
}