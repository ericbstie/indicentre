import type { Rng } from "../core/rng.ts";
import type { Action } from "../core/state.ts";
import { type Attempt, attempt } from "../victims/resistance.ts";
import { firstName, type Tag, type Victim } from "../victims/types.ts";
import { LURES, type ScamDef, type ScamTemplate } from "./types.ts";

/** Victim weakness tags this template pulls (its lures with weight > 0). */
export const fitTags = (t: ScamTemplate): ReadonlyArray<Tag> =>
  LURES.filter((l) => (t.lures[l] ?? 0) > 0);

export type Outcome = Attempt & {
  readonly bucks: number;
  readonly heat: number;
  /** Dispatch these in order to apply the outcome. */
  readonly actions: ReadonlyArray<Action>;
};

/** Expected payout on success, for the pre-commit preview. */
export const payout = (scam: ScamDef, victim: Victim) =>
  Math.round(scam.payout * victim.wealth);

export const resolveScam = (
  rng: Rng,
  scam: ScamDef,
  victim: Victim,
  template: ScamTemplate,
): Outcome => {
  const a = attempt(rng, victim, fitTags(template));
  const bucks = a.success ? payout(scam, victim) : 0;
  const heat = a.success ? scam.heat.success : scam.heat.fail;
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
