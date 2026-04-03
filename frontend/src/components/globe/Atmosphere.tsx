/**
 * @module components/globe/Atmosphere
 * Atmospheric halo using a Fresnel-based custom ShaderMaterial.
 *
 * CRITICAL: MeshStandardMaterial with transparency is INSUFFICIENT
 * for a realistic atmosphere — a custom fragment shader with Fresnel
 * falloff is mandatory to produce the characteristic edge-glow.
 *
 * Rendering rules:
 *   - depthWrite: false   → prevents z-fighting with the Earth mesh
 *   - AdditiveBlending    → glow accumulates naturally over the scene
 *   - FrontSide only      → renders only the outward-facing hemisphere
 *   - Scale 1.025         → atmosphere shell sits just above Earth surface
 */

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import type { Mesh, Material } from "three";

/** Helper to dispose a material or array of materials */
function disposeMaterial(mat: Material | Material[]): void {
  const mats = Array.isArray(mat) ? mat : [mat];
  mats.forEach((m) => m.dispose());
}

// ────────────────────────────── GLSL Shaders ──────────────────────────────

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform vec3  glowColor;
  uniform float coefficient;
  uniform float power;

  void main() {
    vec3  viewDir = normalize(-vPosition);
    float fresnelFactor = dot(viewDir, vNormal);

    // Invert: strongest glow at glancing angles (edges), weakest head-on
    fresnelFactor = clamp(1.0 - fresnelFactor, 0.0, 1.0);
    fresnelFactor = coefficient * pow(fresnelFactor, power);

    gl_FragColor = vec4(glowColor, fresnelFactor * 0.1);
  }
`;

// ────────────────────────────── Atmosphere scale ──────────────────────────

/** Scale factor — atmosphere shell radius relative to Earth radius (1.0) */
const ATMOSPHERE_SCALE = 1.025;

/** Sphere segments — 64×64 is sufficient for a smooth glow shell */
const SPHERE_SEGMENTS = 64;

// ────────────────────────────── Component ─────────────────────────────────

export function Atmosphere() {
  const meshRef = useRef<Mesh | null>(null);

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(0x4488ff) },
      coefficient: { value: 0.4 },
      power: { value: 6.5 },
    }),
    []
  );

  // GPU CLEANUP: dispose geometry + ShaderMaterial on unmount (Section 14)
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        disposeMaterial(meshRef.current.material);
      }
    };
  }, []);

  return (
    <mesh
      ref={meshRef}
      scale={[ATMOSPHERE_SCALE, ATMOSPHERE_SCALE, ATMOSPHERE_SCALE]}
    >
      <sphereGeometry args={[1, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
