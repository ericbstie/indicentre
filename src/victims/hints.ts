import { pick, type Rng } from "../core/rng.ts";
import { FRAGMENTS } from "./fragments.ts";
import { firstName, type Victim } from "./types.ts";

/**
 * 1-2 hint lines for a lead card. Line 1 is the concrete detail; line 2 (if
 * the victim has another weakness) points at it in a coworker's voice.
 */
export const writeHints = (rng: Rng, v: Victim): ReadonlyArray<string> => {
  const others = v.weaknesses.filter((t) => t !== v.detail.tag);
  if (!others.length) return [v.detail.text];
  const line = pick(rng, FRAGMENTS[pick(rng, others)]);
  return [v.detail.text, line.replaceAll("{name}", firstName(v))];
};
