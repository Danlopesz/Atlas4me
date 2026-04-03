/**
 * @module hooks/useCountryGeometries
 * Converts GeoJSON CountryFeature[] into Three.js BufferGeometry objects.
 *
 * This hook is the PERFORMANCE CORE of CountriesLayer:
 *   - Geometries are computed ONCE (useMemo depends only on `features`)
 *   - `validIsoCodes` NEVER enters the dependency array
 *   - All GPU resources are disposed on unmount via useEffect cleanup
 *
 * Approach for each country polygon:
 *   1. Build a 2D THREE.Shape from coordinate ring (lng=X, lat=Y)
 *   2. Triangulate with THREE.ShapeGeometry (uses earcut internally)
 *   3. Re-project every vertex from 2D → 3D sphere via latLngToVector3
 *   4. Recompute normals for correct lighting
 */

import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CountryFeature } from "../types/geo";
import { latLngToVector3 } from "../utils/geoMath";

/**
 * Slightly above Earth surface (r=1.0) to prevent z-fighting
 * between the country overlay and the textured Earth sphere.
 */
const PROJECTION_RADIUS = 1.001;

/** Map of NORMALIZED_ISO (alpha-2) code → BufferGeometry for that country. */
interface CountryGeometryMap {
  [isoCode: string]: THREE.BufferGeometry;
}

/** Return type of useCountryGeometries hook. */
export interface UseCountryGeometriesResult {
  /** Individual geometry per country — used for per-country highlighting. */
  geometryMap: CountryGeometryMap;
  /** All geometries merged — used for batch-rendering inactive countries. */
  mergedInactiveGeometry: THREE.BufferGeometry | null;
}

export function useCountryGeometries(
  features: CountryFeature[]
): UseCountryGeometriesResult {
  const disposeRef = useRef<(() => void) | null>(null);

  const result = useMemo<UseCountryGeometriesResult>(() => {
    const geometryMap: CountryGeometryMap = {};

    // Build individual geometry for each country
    for (const feature of features) {
      const iso = feature.properties.NORMALIZED_ISO;
      const geom = buildCountryGeometry(feature);
      if (geom) geometryMap[iso] = geom;
    }

    // Merge all geometries into one for batch-rendering inactive countries.
    // mergeGeometries() copies data internally — originals are preserved.
    const allGeoms = Object.values(geometryMap);
    const mergedInactiveGeometry =
      allGeoms.length > 0 ? (mergeGeometries(allGeoms) ?? null) : null;

    return { geometryMap, mergedInactiveGeometry };
  }, [features]); // features is stable after fetch — does NOT change during gameplay

  // CRITICAL CLEANUP: dispose all GPU geometry buffers on unmount
  useEffect(() => {
    disposeRef.current = () => {
      Object.values(result.geometryMap).forEach((g) => g.dispose());
      result.mergedInactiveGeometry?.dispose();
    };
    return () => {
      disposeRef.current?.();
    };
  }, [result]);

  return result;
}

// ──────────────────────── Geometry Builder ─────────────────────────────────

/**
 * Converts a GeoJSON CountryFeature (Polygon or MultiPolygon) into a
 * Three.js BufferGeometry projected onto the globe sphere surface.
 *
 * Steps per polygon ring:
 *   1. Create THREE.Shape from outer ring (coordinates are [lng, lat])
 *   2. Add interior holes from subsequent rings
 *   3. Triangulate via THREE.ShapeGeometry (earcut)
 *   4. Project each vertex: 2D (lng, lat) → 3D sphere via latLngToVector3
 *   5. Recompute vertex normals
 *
 * @returns BufferGeometry on success, null if the feature has no valid polygons
 */
function buildCountryGeometry(
  feature: CountryFeature
): THREE.BufferGeometry | null {
  const { geometry } = feature;

  // Normalize Polygon → [coordinates] to match MultiPolygon format
  const polygonSets: number[][][][] =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];

  const geometries: THREE.BufferGeometry[] = [];

  for (const polygon of polygonSets) {
    const outerRing = polygon[0];
    // GeoJSON rings are closed (last point = first), so need ≥ 4 coords for 3 unique vertices
    if (!outerRing || outerRing.length < 4) continue;

    // ── Build 2D shape from outer ring (lng=X, lat=Y) ──
    const shape = new THREE.Shape();
    shape.moveTo(outerRing[0][0], outerRing[0][1]);
    for (let i = 1; i < outerRing.length; i++) {
      shape.lineTo(outerRing[i][0], outerRing[i][1]);
    }

    // ── Add interior holes ──
    for (let h = 1; h < polygon.length; h++) {
      const holeRing = polygon[h];
      if (!holeRing || holeRing.length < 4) continue;

      const holePath = new THREE.Path();
      holePath.moveTo(holeRing[0][0], holeRing[0][1]);
      for (let i = 1; i < holeRing.length; i++) {
        holePath.lineTo(holeRing[i][0], holeRing[i][1]);
      }
      shape.holes.push(holePath);
    }

    try {
      // Triangulate in 2D lat/lng space (curveSegments=1: all segments are linear)
      const shapeGeom = new THREE.ShapeGeometry(shape, 1);
      const positions = shapeGeom.attributes.position;

      // ── Project 2D vertices onto the sphere surface ──
      for (let i = 0; i < positions.count; i++) {
        const lng = positions.getX(i);
        const lat = positions.getY(i);
        const vec = latLngToVector3(lat, lng, PROJECTION_RADIUS);
        positions.setXYZ(i, vec.x, vec.y, vec.z);
      }

      positions.needsUpdate = true;
      shapeGeom.computeVertexNormals();
      geometries.push(shapeGeom);
    } catch {
      // Skip polygons that fail earcut triangulation (degenerate geometry)
      continue;
    }
  }

  if (geometries.length === 0) return null;
  if (geometries.length === 1) return geometries[0];

  // Merge multiple polygon parts into a single BufferGeometry
  const merged = mergeGeometries(geometries);
  // Dispose individual parts since data was copied into merged
  geometries.forEach((g) => g.dispose());
  return merged ?? null;
}
