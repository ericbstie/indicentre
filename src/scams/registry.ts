import { type GameState, isUnlocked } from "../core/state.ts";
import { allScams } from "./index.ts";
import type { ScamDef } from "./types.ts";

/** Every scam in the game, in shop order (cheapest first). */
export const scams: ReadonlyArray<ScamDef> = [...allScams].sort(
  (a, b) => a.price - b.price || a.id.localeCompare(b.id),
);

/** Scams the player can run right now. Locked ones stay hidden. */
export const availableScams = (s: GameState) =>
  scams.filter((scam) => isUnlocked(s, scam.id));
