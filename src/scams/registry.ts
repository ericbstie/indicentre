import type { ScamId } from "../core/state.ts";
import { allScams } from "./index.ts";
import type { ScamDef } from "./types.ts";

/** Every scam in the game, in shop order (cheapest first). */
export const scams: ReadonlyArray<ScamDef> = [...allScams].sort(
  (a, b) => a.price - b.price || a.id.localeCompare(b.id),
);

/** Scams unlocked on a fresh run. */
export const starterScams: ReadonlyArray<ScamId> = scams
  .filter((s) => s.price === 0)
  .map((s) => s.id);

export const scamById = (id: ScamId) => scams.find((s) => s.id === id);
