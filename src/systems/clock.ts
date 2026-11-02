import * as THREE from "three";
import type { GameSystem } from "./system.ts";

/**
 * The shift clock. Time only moves when a scam runs (see core/economy.ts);
 * this adds the punch clock by the door so the player can clock out early.
 */
export default {
  id: "clock",
  start({ game, world }) {
    const punch = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.4, 0.12),
      new THREE.MeshLambertMaterial({ color: 0x3a3a40 }),
    );
    punch.position.set(-2, 1.4, 4.9);
    world.office.scene.add(punch);
    world.interactions.add({
      object: punch,
      label: "Clock out",
      use: () => game.dispatch({ type: "endDay" }),
    });
  },
} satisfies GameSystem;
