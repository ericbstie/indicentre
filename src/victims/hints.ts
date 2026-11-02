import { pick, type Picker, type Rng } from "../core/rng.ts";
import { FRAGMENTS } from "./fragments.ts";
import { firstName, type Victim } from "./types.ts";

/**
 * 1-2 hint lines for a lead card. Line 1 is the concrete detail; line 2 (if
 * the victim has another weakness) points at it in a coworker's voice.
 * Pass a day's `pickLine` so the same line doesn't come twice in a row.
 */
export const writeHints = (
  rng: Rng,
  v: Victim,
  pickLine: Picker = pick,
): ReadonlyArray<string> => {
  const others = v.weaknesses.filter((t) => t !== v.detail.tag);
  if (!others.length) return [v.detail.text];
  const line = pickLine(rng, FRAGMENTS[pick(rng, others)]);
  return [v.detail.text, line.replaceAll("{name}", firstName(v))];
};
