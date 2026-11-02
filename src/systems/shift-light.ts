import * as THREE from "three";
import { SHIFT_MINUTES } from "../core/economy.ts";
import type { GameSystem } from "./system.ts";

const MORNING = new THREE.Color(0xeef2ff);
const EVENING = new THREE.Color(0xffc98a);

/** The tube lights warm from cool morning white to late-afternoon orange as the shift runs. */
export default {
  id: "shift-light",
  start({ game, world }) {
    const want = new THREE.Color();
    world.onFrame((dt) => {
      const t = Math.min(1, game.state().minute / SHIFT_MINUTES);
      want.lerpColors(MORNING, EVENING, t * t);
      // Ease toward it, so a long scam or a new day fades instead of snapping.
      const k = Math.min(1, dt * 1.5);
      for (const tube of world.office.tubes) tube.color.lerp(want, k);
    });
  },
} satisfies GameSystem;
