import { sfx } from "../audio/sfx.ts";
import type { GameSystem } from "./system.ts";

/** Metres between footfalls. */
const STRIDE = 0.75;
/** A jump longer than this in one frame is a seat change, not a step. */
const TELEPORT = 0.5;

/** Footsteps by distance walked, so standing still is silent. */
export default {
  id: "footsteps",
  start({ world }) {
    const { camera, player } = world;
    const last = camera.position.clone();
    let walked = 0;
    return world.onFrame(() => {
      const p = camera.position;
      const d = Math.hypot(p.x - last.x, p.z - last.z);
      last.copy(p);
      if (!player.controls.isLocked || d > TELEPORT) {
        walked = 0;
        return;
      }
      walked += d;
      if (walked < STRIDE) return;
      walked -= STRIDE;
      sfx.step();
    });
  },
} satisfies GameSystem;
