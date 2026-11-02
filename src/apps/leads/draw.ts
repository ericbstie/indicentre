import { seeded } from "../../core/rng.ts";
import { daily, generateVictims } from "../../victims/generate.ts";
import { writeHints } from "../../victims/hints.ts";
import type { Victim } from "../../victims/types.ts";
import {
  type RevealLevel,
  reveal,
  type VictimView,
} from "../../victims/view.ts";

const LEADS_PER_BATCH = 3;

interface Lead {
  readonly victim: Victim;
  readonly view: VictimView;
}

const today = daily();

/** A batch of leads: who they are and how much the player may see. */
export const drawLeads = (
  seed: number,
  day: number,
  level: RevealLevel,
): ReadonlyArray<Lead> => {
  const rng = seeded(seed);
  const t = today(day);
  return generateVictims(rng, LEADS_PER_BATCH, t).map((victim) => ({
    victim,
    view: reveal(victim, writeHints(rng, victim, t.pickLine), level),
  }));
};
