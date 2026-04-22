/**
 * @module components/globe/Stars
 * Procedural star field rendered as a Points cloud.
 *
 * 8 000 stars are distributed uniformly on a sphere shell
 * between radius 80 and 100 (far behind the globe).
 *
 * CLEANUP: BufferGeometry is explicitly disposed on unmount
 * to prevent GPU memory leaks in long-running sessions.
 */

import { useMemo, useRef, useEffect } from "react";
import type { Points, BufferGeometry } from "three";

/** Total number of stars to render */
const STAR_COUNT = 8_000;

/** Inner and outer radii of the star distribution shell */
const SHELL_INNER_RADIUS = 80;
const SHELL_THICKNESS = 20;

/** Visual parameters */
const POINT_SIZE = 0.15;
const POINT_OPACITY = 0.9;

export function Stars() {
  const pointsRef = useRef<Points | null>(null);
  const geometryRef = useRef<BufferGeometry | null>(null);

  const { positions, sizes } = useMemo<{
    positions: Float32Array;
    sizes: Float32Array;
  }>(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const sz = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform spherical distribution via inverse-CDF sampling
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SHELL_INNER_RADIUS + Math.random() * SHELL_THICKNESS;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Varying sizes for visual depth
      sz[i] = Math.random() * 1.5 + 0.3;
    }

    return { positions: pos, sizes: sz };
  }, []);

  // GPU CLEANUP: dispose geometry + material on unmount (Section 14)
  useEffect(() => {
    return () => {
      geometryRef.current?.dispose();
      if (pointsRef.current) {
        const mat = pointsRef.current.material;
        const mats = Array.isArray(mat) ? mat : [mat];
        mats.forEach((m) => m.dispose());
      }
    };
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={POINT_SIZE}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={POINT_OPACITY}
        vertexColors={false}
      />
    </points>
  );
}
