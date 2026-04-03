/**
 * @module components/globe/Earth
 * Core Earth sphere with module-level texture preloading.
 *
 * Downloads 4k PBR textures the moment this module is imported —
 * before React or the Canvas exist. The component picks up the
 * already-resolved (or in-flight) promises and applies them in
 * a single GPU upload, eliminating per-stage stutter.
 *
 * This component is a STATIC mesh — rotation is handled by
 * the parent SpinningGlobeGroup in GameGlobe3D.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Mesh } from "three";

// ── Module-level preload ────────────────────────────────────
// Downloads start the instant this module is first imported.
// No React tree, no Canvas, no GPU context needed yet.
const textureLoader = new THREE.TextureLoader();

const preloadedTextures = {
  color: textureLoader.loadAsync("/textures/earth/ppe_normalMap_4k.jpg"),
  night: textureLoader.loadAsync("/textures/earth/ppe_night_4k.jpg"),
  roughness: textureLoader.loadAsync("/textures/earth/ppe_roughness_4k.jpg"),
  bump: textureLoader.loadAsync("/textures/earth/ppe_bump_4k.jpg"),
};

/** Sphere geometry segments — 128×128 minimum to avoid visible faceting */
const SPHERE_SEGMENTS = 128;

export function Earth() {
  const meshRef = useRef<Mesh | null>(null);
  const texturesLoadedRef = useRef(false);

  // Apply placeholder immediately, then swap in preloaded 4k textures
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || texturesLoadedRef.current) return;

    // Create immediate dark-blue placeholder
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0d1b35";
    ctx.fillRect(0, 0, 4, 4);
    const placeholder = new THREE.CanvasTexture(canvas);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.map = placeholder;
    mat.needsUpdate = true;

    // Await the promises that are ALREADY in-flight (or resolved)
    Promise.all([
      preloadedTextures.color,
      preloadedTextures.night,
      preloadedTextures.roughness,
      preloadedTextures.bump,
    ]).then(([color, night, roughness, bump]) => {
      if (!meshRef.current) return;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;

      color.colorSpace = THREE.SRGBColorSpace;
      night.colorSpace = THREE.SRGBColorSpace;

      mat.map = color;
      mat.emissiveMap = night;
      mat.roughnessMap = roughness;
      mat.bumpMap = bump;
      mat.bumpScale = 0.02;
      mat.needsUpdate = true;

      texturesLoadedRef.current = true;
      placeholder.dispose();
    });
  }, []);

  // GPU CLEANUP: dispose geometry + textures on unmount
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.map?.dispose();
        mat.emissiveMap?.dispose();
        mat.roughnessMap?.dispose();
        mat.bumpMap?.dispose();
        mat.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef} name="earthMesh">
      <sphereGeometry args={[1, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      <meshStandardMaterial
        roughness={1}
        metalness={0.1}
        emissive="#ffaa66"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
} 
