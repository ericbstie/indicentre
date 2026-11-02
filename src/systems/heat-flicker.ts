import { SHUTDOWN_MAX } from "../core/state.ts";
import { still } from "../scene/ease.ts";
import { TUBE_INTENSITY } from "../scene/office.ts";
import type { GameSystem } from "./system.ts";

/** Heat (0-100) where the lights start to act up. */
const FROM = 60;
/** Seconds between flickers: at FROM heat, and at full heat. */
const CALM = 25;
const TENSE = 6;
/** One flicker: [seconds, brightness] steps. Slow dips, never a strobe. */
const DIPS = [
  [0.12, 0.3],
  [0.15, 1],
  [0.2, 0.45],
] as const;

/** At high heat a ceiling tube dips now and then: the room is nervous too. */
export default {
  id: "heat-flicker",
  start({ game, world }) {
    if (still) return;
    const tubes = world.office.tubes;
    let wait = CALM;
    let tube = 0;
    /** Index into DIPS while flickering, -1 when steady. */
    let step = -1;
    let left = 0;
    const dip = (i: number) => {
      const light = tubes[tube];
      const d = DIPS[i];
      step = d ? i : -1;
      left = d ? d[0] : 0;
      if (light) light.intensity = TUBE_INTENSITY * (d ? d[1] : 1);
    };
    return world.onFrame((dt) => {
      if (step >= 0) {
        left -= dt;
        if (left <= 0) dip(step + 1);
        return;
      }
      const heat = game.state().shutdownMeter;
      if (heat < FROM) return;
      wait -= dt;
      if (wait > 0) return;
      const t = (heat - FROM) / (SHUTDOWN_MAX - FROM);
      wait = (CALM + (TENSE - CALM) * t) * (0.6 + Math.random() * 0.8);
      tube = Math.floor(Math.random() * tubes.length);
      dip(0);
    });
  },
} satisfies GameSystem;
