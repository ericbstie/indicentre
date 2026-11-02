import * as THREE from "three";
import type { GameState } from "../core/state.ts";
import type { ModelId } from "../scene/models.ts";
import { DESK_TOP, place } from "../scene/office.ts";
import { upgrades } from "../workplace/upgrades.ts";
import type { GameSystem } from "./system.ts";

/** One thing on or around your desk, in the desk group's local space. */
interface Prop {
  readonly model: ModelId | "photo";
  readonly at: readonly [x: number, y: number, z: number];
  readonly rotY?: number;
}

const QUARTER = Math.PI / 2;

/** What each upgrade puts at your desk. The desk faces -z; you sit at +z. */
const PROPS: Readonly<Record<string, ReadonlyArray<Prop>>> = {
  // Between you and Rohan, who sits to your right.
  partition: [{ model: "divider", at: [1.05, 0, 0.4], rotY: -QUARTER }],
  booth: [
    { model: "divider", at: [0, 0, -0.65] },
    { model: "rug", at: [0, 0, 0.5] },
    { model: "lamp", at: [1.05, 1.58, 0.1] },
  ],
  plant: [{ model: "plant", at: [0.6, DESK_TOP, -0.28] }],
  photo: [{ model: "photo", at: [0.5, DESK_TOP, -0.05], rotY: -0.3 }],
  monitor: [{ model: "monitor", at: [-0.72, DESK_TOP, -0.05], rotY: 0.5 }],
};

/** A small framed photo; too simple to be worth a model file. */
const photo = () => {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.18, 0.015),
    new THREE.MeshLambertMaterial({ color: 0x3a2a1a }),
  );
  const picture = new THREE.Mesh(
    new THREE.PlaneGeometry(0.11, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x8fb0c8 }),
  );
  picture.position.z = 0.008;
  frame.add(picture);
  frame.position.y = 0.09;
  frame.rotation.x = -0.2;
  return new THREE.Group().add(frame);
};

/** Upgrades whose props should be at the desk: owned cosmetics, desks up to your tier. */
const shown = (s: GameState) =>
  upgrades.filter((u) =>
    u.tier !== undefined
      ? u.tier <= s.workplace.deskTier
      : s.workplace.owned.includes(u.id),
  );

/** Puts bought upgrades at the player's desk. Nothing is ever sold back. */
export default {
  id: "workplace",
  start({ game, world }) {
    const desk = world.office.pcScreen.parent;
    if (!desk) return;
    const placed = new Set<string>();
    const sync = () => {
      for (const u of shown(game.state())) {
        if (placed.has(u.id)) continue;
        placed.add(u.id);
        for (const p of PROPS[u.id] ?? []) {
          const [x, y, z] = p.at;
          if (p.model !== "photo") {
            place(desk, p.model, x, y, z, p.rotY);
            continue;
          }
          const g = photo();
          g.position.set(x, y, z);
          g.rotation.y = p.rotY ?? 0;
          desk.add(g);
        }
      }
    };
    sync();
    game.subscribe(sync);
  },
} satisfies GameSystem;
