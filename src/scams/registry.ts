import type { ScamId } from "../core/state.ts";
import { phishing } from "./phishing.ts";
import type { ScamDef } from "./types.ts";

/** Every scam in the game. Add new ones here; order = shop order. */
export const scams: ReadonlyArray<ScamDef> = [phishing];

/** Scams unlocked on a fresh run. */
export const starterScams: ReadonlyArray<ScamId> = scams
  .filter((s) => s.price === 0)
  .map((s) => s.id);

export const scamById = (id: ScamId) => scams.find((s) => s.id === id);
