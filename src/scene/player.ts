import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { ROOM } from "./office.ts";

const SPEED = 3; // m/s
const MARGIN = 0.4; // keep away from walls

/** WASD + mouse look. Movement only happens while the pointer is locked. */
export const createPlayer = (camera: THREE.Camera, dom: HTMLElement) => {
  const controls = new PointerLockControls(camera, dom);
  const keys = new Set<string>();
  window.addEventListener("keydown", (e) => keys.add(e.code));
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  window.addEventListener("blur", () => keys.clear());

  const axis = (pos: string, neg: string) =>
    (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);

  return {
    controls,
    update(dt: number) {
      if (!controls.isLocked) return;
      const step = SPEED * dt;
      controls.moveForward(axis("KeyW", "KeyS") * step);
      controls.moveRight(axis("KeyD", "KeyA") * step);
      const p = camera.position;
      p.x = THREE.MathUtils.clamp(
        p.x,
        -ROOM.width / 2 + MARGIN,
        ROOM.width / 2 - MARGIN,
      );
      p.z = THREE.MathUtils.clamp(
        p.z,
        -ROOM.depth / 2 + MARGIN,
        ROOM.depth / 2 - MARGIN,
      );
    },
  };
};

export type Player = ReturnType<typeof createPlayer>;
