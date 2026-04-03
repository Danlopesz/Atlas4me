/**
 * @module components/globe/GlobeControls
 * OrbitControls wrapper with globe-specific restrictions:
 *   - Rotation enabled ONLY when pointer is over the globe sphere
 *   - Pan disabled (camera always centered on origin)
 *   - Zoom clamped to [1.4, 6.0] (no clipping through Earth or losing it)
 *   - Damping for smooth inertia feel
 *   - Pointer events (not mouse) for mobile/touch support
 *   - Disabled during fly-to animation (window.__globeIsFocusing)
 */

import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export function GlobeControls() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera, gl } = useThree();

  // ── Configure control limits on mount ───────────────────────────────────
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Zoom bounds
    controls.minDistance = 1.4;
    controls.maxDistance = 6.0;

    // No pan — rotation + zoom only
    controls.enablePan = false;

    // Smooth damping
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    // Input speeds
    controls.rotateSpeed = 0.4;
    controls.zoomSpeed = 0.8;
  }, []);

  // ── Raycaster-based rotation guard ─────────────────────────────────────
  // Rotation is only enabled when the pointer is over the globe sphere.
  // This prevents "sky-dragging" — rotating by grabbing empty space.
  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const sphereCenter = new THREE.Vector3(0, 0, 0);
    const GLOBE_RADIUS = 1.005;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // Check if ray passes near the globe sphere
      const distToCenter = raycaster.ray.distanceToPoint(sphereCenter);
      const isOverGlobe = distToCenter < GLOBE_RADIUS;

      if (controlsRef.current) {
        controlsRef.current.enableRotate = isOverGlobe;
        canvas.style.cursor = isOverGlobe ? "grab" : "default";
      }
    };

    const onPointerDown = () => {
      if (controlsRef.current?.enableRotate) {
        canvas.style.cursor = "grabbing";
      }
    };

    const onPointerUp = () => {
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [camera, gl]);

  // ── Disable controls during fly-to animation ──────────────────────────
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !window.__globeIsFocusing;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.03}
      minDistance={1.4}
      maxDistance={6.0}
    />
  );
}
