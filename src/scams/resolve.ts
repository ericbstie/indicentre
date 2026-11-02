import type { Action } from "../core/state.ts";
import type { Rng } from "../core/rng.ts";
import {
  LURES,
  type ScamDef,
  type ScamTemplate,
  type Target,
} from "./types.ts";

export const MIN_CHANCE = 0.05;
export const MAX_CHANCE = 0.9;

/** Probability the template works on this target. Pure, so UI can preview it. */
export const successChance = (target: Target, template: ScamTemplate) => {
  let pull = 0;
  let total = 0;
  for (const lure of LURES) {
    const w = template.lures[lure] ?? 0;
    pull += w * target.susceptibility[lure];
    total += w;
  }
  const fit = total > 0 ? pull / total : 0;
  const p = 0.1 + 0.75 * fit - 0.5 * target.savvy;
  return Math.min(MAX_CHANCE, Math.max(MIN_CHANCE, p));
};

export interface Outcome {
  readonly success: boolean;
  readonly chance: number;
  readonly bucks: number;
  readonly heat: number;
  /** Dispatch these in order to apply the outcome. */
  readonly actions: ReadonlyArray<Action>;
}

export const resolveScam = (
  rng: Rng,
  scam: ScamDef,
  target: Target,
  template: ScamTemplate,
): Outcome => {
  const chance = successChance(target, template);
  const success = rng() < chance;
  const bucks = success ? Math.round(scam.payout * target.wealth) : 0;
  const heat = success ? scam.heat.success : scam.heat.fail;
  return {
    success,
    chance,
    bucks,
    heat,
    actions: [
      { type: "tick", minutes: scam.minutes },
      ...(bucks ? [{ type: "earn", amount: bucks } as const] : []),
      { type: "heat", amount: heat },
    ],
  };
};

export const personalize = (text: string, target: Target) =>
  text.replaceAll("{name}", target.name.split(" ")[0] ?? target.name);
