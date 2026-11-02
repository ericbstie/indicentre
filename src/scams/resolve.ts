import type { Rng } from "../core/rng.ts";
import type { Action } from "../core/state.ts";
import { type Modifiers, NO_MODS } from "../shop/tools.ts";
import { type Attempt, attempt } from "../victims/resistance.ts";
import { firstName, type Tag, type Victim } from "../victims/types.ts";
import { LURES, type ScamDef, type ScamTemplate } from "./types.ts";

/**
 * Victim weakness tags a template pulls: the scam's fitTags plus the
 * template's lures with weight > 0.
 */
export const pulls = (scam: ScamDef, t: ScamTemplate): ReadonlyArray<Tag> => [
  ...new Set<Tag>([
    ...scam.fitTags,
    ...LURES.filter((l) => (t.lures[l] ?? 0) > 0),
  ]),
];

export type Outcome = Attempt & {
  readonly bucks: number;
  readonly heat: number;
  /** Dispatch these in order to apply the outcome. */
  readonly actions: ReadonlyArray<Action>;
};

/** Expected payout on success, for the pre-commit preview. */
export const payout = (scam: ScamDef, victim: Victim) =>
  Math.round(scam.payout * victim.wealth);

/** Heat when the victim reports you, after tools. */
export const failHeat = (scam: ScamDef, mods: Modifiers = NO_MODS) =>
  Math.round(scam.heat.fail * mods.failHeatMult);

export const resolveScam = (
  rng: Rng,
  scam: ScamDef,
  victim: Victim,
  template: ScamTemplate,
  mods: Modifiers = NO_MODS,
): Outcome => {
  const a = attempt(rng, victim, pulls(scam, template), mods.chanceBonus);
  const bucks = a.success ? payout(scam, victim) : 0;
  const heat = a.success ? scam.heat.success : failHeat(scam, mods);
  return {
    ...a,
    bucks,
    heat,
    actions: [
      { type: "tick", minutes: scam.minutes },
      ...(bucks ? [{ type: "earn", amount: bucks } as const] : []),
      { type: "heat", amount: heat },
    ],
  };
};

export const personalize = (text: string, who: { readonly name: string }) =>
  text.replaceAll("{name}", firstName(who));
