import { sfx } from "../audio/sfx.ts";
import { coworkers } from "../content/coworkers.ts";
import type { GameSystem } from "./system.ts";

/** Metres at which a coworker's typing fades out completely. */
const HEARING = 6;
/** Average seconds between one coworker's bursts of typing. */
const EVERY = 10;
const LOUDEST = 0.12;

/** Coworkers type in short bursts, louder the closer you stand. */
export default {
  id: "office-tone",
  start({ world }) {
    const desks = coworkers.flatMap((c) => world.office.desks[c.desk] ?? []);
    const waits = desks.map(() => Math.random() * EVERY);
    return world.onFrame((dt) => {
      desks.forEach((desk, i) => {
        const w = (waits[i] ?? 0) - dt;
        waits[i] = w > 0 ? w : EVERY * (0.5 + Math.random());
        if (w > 0) return;
        const near = 1 - world.camera.position.distanceTo(desk) / HEARING;
        if (near <= 0) return;
        const keys = 3 + Math.floor(Math.random() * 6);
        let at = 0;
        for (let k = 0; k < keys; k++) {
          sfx.key(LOUDEST * near * near, at);
          at += 0.07 + Math.random() * 0.09;
        }
      });
    });
  },
} satisfies GameSystem;
