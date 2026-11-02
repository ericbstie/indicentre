import { type AgeBand, ageBand, type Tag, type Victim } from "./types.ts";

/**
 * How much of a victim the player can see. 0 = the lead list; buying
 * persondata raises it. Each level adds fields to the view.
 */
export type RevealLevel = 0 | 1 | 2;

export interface VictimView {
  readonly id: string;
  readonly name: string;
  readonly ageBand: AgeBand;
  readonly occupation: string;
  readonly hints: ReadonlyArray<string>;
  /** Level 1+. */
  readonly weaknesses?: ReadonlyArray<Tag>;
  readonly techComfort?: number;
  /** Level 2. */
  readonly trust?: number;
  readonly wealth?: number;
  readonly defense?: string;
}

export const reveal = (
  v: Victim,
  hints: ReadonlyArray<string>,
  level: RevealLevel,
): VictimView => ({
  id: v.id,
  name: v.name,
  ageBand: ageBand(v.age),
  occupation: v.occupation,
  hints,
  ...(level >= 1 && { weaknesses: v.weaknesses, techComfort: v.techComfort }),
  ...(level >= 2 && {
    trust: v.trust,
    wealth: v.wealth,
    defense: v.defense.behavior,
  }),
});
