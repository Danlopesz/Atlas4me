/**
 * @module utils/geoMath
 * Pure mathematical utilities for geographic ↔ 3D conversions.
 *
 * CRITICAL RULE: Never interpolate lat/lng directly for camera animation.
 * Always use Quaternion.slerp or Vector3.lerp in 3D space.
 */

import * as THREE from "three";
import type { GeoPoint } from "../types/geo";

/**
 * Converts geographic coordinates (lat/lng in degrees) to a 3D position
 * on the surface of a sphere with the given `radius`.
 *
 * Uses the standard spherical-to-Cartesian conversion:
 *   phi   = colatitude  (90° - lat), measured from +Y axis
 *   theta = longitude + 180°, measured in XZ plane
 *
 * The resulting coordinate system is Y-up (Three.js default).
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi: number = (90 - lat) * (Math.PI / 180);
  const theta: number = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Computes the geographic centroid of a set of points by averaging
 * their 3D positions on the sphere surface, then projecting back.
 *
 * This avoids the "averaging lat/lng" anti-pattern which produces
 * incorrect results near the dateline and poles.
 *
 * @param points - Array of geographic coordinates
 * @param radius - Sphere radius
 * @returns Position on the sphere surface (magnitude = radius)
 */
export function computeGeographicCenter(
  points: GeoPoint[],
  radius: number
): THREE.Vector3 {
  if (points.length === 0) {
    return new THREE.Vector3(0, 0, radius);
  }

  const sum: THREE.Vector3 = points.reduce(
    (acc: THREE.Vector3, p: GeoPoint): THREE.Vector3 =>
      acc.add(latLngToVector3(p.lat, p.lng, radius)),
    new THREE.Vector3()
  );

  return sum.divideScalar(points.length).normalize().multiplyScalar(radius);
}

/**
 * Interpolates camera position along the great-circle arc between
 * two points on the globe using quaternion slerp.
 *
 * The camera is placed at `radius * 2.5` distance from the origin,
 * looking toward the interpolated point on the sphere.
 *
 * @param from   - Starting position (normalized direction)
 * @param to     - Target position (normalized direction)
 * @param t      - Interpolation factor [0, 1]
 * @param radius - Globe radius (camera distance = radius * 2.5)
 * @returns Camera world position on the interpolated arc
 */
export function slerpCameraPosition(
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number,
  radius: number
): THREE.Vector3 {
  const forward: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

  const fromQ: THREE.Quaternion = new THREE.Quaternion().setFromUnitVectors(
    forward,
    from.clone().normalize()
  );
  const toQ: THREE.Quaternion = new THREE.Quaternion().setFromUnitVectors(
    forward,
    to.clone().normalize()
  );

  const slerpedQ: THREE.Quaternion = fromQ.clone().slerp(toQ, t);

  return new THREE.Vector3(0, 0, radius * 2.5).applyQuaternion(slerpedQ);
}
