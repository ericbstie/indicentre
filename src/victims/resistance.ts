import { pick, type Rng } from "../core/rng.ts";
import { DEFENSES } from "./tables.ts";
import type { Defense, Tag, Victim } from "./types.ts";

export const MIN_CHANCE = 0.05;
export const MAX_CHANCE = 0.9;
/** A scam that runs into the victim's tell keeps this share of its odds. */
export const COUNTERED = 0.35;

const clamp = (p: number) => Math.min(MAX_CHANCE, Math.max(MIN_CHANCE, p));

/** Share of the scam's fitTags that hit a weakness, 0..1. */
export const fit = (v: Victim, fitTags: ReadonlyArray<Tag>) =>
  fitTags.length
    ? fitTags.filter((t) => v.weaknesses.includes(t)).length / fitTags.length
    : 0;

const isCountered = (v: Victim, fitTags: ReadonlyArray<Tag>) =>
  fitTags.some((t) => v.defense.counters.includes(t));

/**
 * p = clamp(0.25 + 0.6·fit + 0.3·(trust − 0.5) − 0.3·techComfort + bonus)
 * then × COUNTERED if the scam pulls a tag the victim's tell guards. Pure, so
 * the UI can preview it.
 */
export const successChance = (
  v: Victim,
  fitTags: ReadonlyArray<Tag>,
  /** Flat bonus from the player's tools (shop/tools.ts), added to p. */
  bonus = 0,
) => {
  const p =
    0.25 +
    0.6 * fit(v, fitTags) +
    0.3 * (v.trust - 0.5) -
    0.3 * v.techComfort +
    bonus;
  return clamp(clamp(p) * (isCountered(v, fitTags) ? COUNTERED : 1));
};

export type Attempt =
  | { readonly success: true; readonly chance: number }
  | {
      readonly success: false;
      readonly chance: number;
      /** What the victim did right. The lesson of a failed scam. */
      readonly defense: Defense;
    };

/**
 * Roll one attempt. On a loss the victim shows a behavior: their own tell if
 * the scam ran into it, else a habit that guards one of the scam's tags.
 */
export const attempt = (
  rng: Rng,
  v: Victim,
  fitTags: ReadonlyArray<Tag>,
  bonus = 0,
): Attempt => {
  const chance = successChance(v, fitTags, bonus);
  if (rng() < chance) return { success: true, chance };
  if (isCountered(v, fitTags))
    return { success: false, chance, defense: v.defense };
  const fitting = DEFENSES.filter((d) =>
    d.counters.some((t) => fitTags.includes(t)),
  );
  return {
    success: false,
    chance,
    defense: fitting.length ? pick(rng, fitting) : v.defense,
  };
};
