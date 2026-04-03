import * as THREE from "three";

export function createFallbackTexture(color: string): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 2, 2);
    return new THREE.CanvasTexture(canvas);
}