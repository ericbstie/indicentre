import type { ScamId } from "../core/state.ts";

/** Psychological levers a scam pulls. Targets have a susceptibility to each. */
export const LURES = ["authority", "urgency", "greed", "curiosity"] as const;
export type Lure = (typeof LURES)[number];
export type LureWeights = Readonly<Record<Lure, number>>;

export interface Target {
  readonly id: string;
  readonly name: string;
  readonly age: number;
  readonly archetype: string;
  /** What the player "knows" about them; hints at which lure fits. */
  readonly notes: ReadonlyArray<string>;
  /** 0..1 per lure. */
  readonly susceptibility: LureWeights;
  /** 0..1, how likely they are to spot red flags. */
  readonly savvy: number;
  /** Payout multiplier, ~0.5..2. */
  readonly wealth: number;
}

/** One concrete message/script the player can send. */
export interface ScamTemplate {
  readonly id: string;
  readonly label: string;
  readonly subject: string;
  /** `{name}` is replaced with the target's first name. */
  readonly body: string;
  /** Which levers this template pulls, 0..1. */
  readonly lures: Partial<LureWeights>;
  /**
   * The learning payload: what a careful recipient would notice.
   * Shown to the player after every attempt.
   */
  readonly redFlags: ReadonlyArray<string>;
}

/**
 * A scam type. Adding a scam = adding one of these to scams/registry.ts.
 * Keep mechanics abstract: no real-world operational detail.
 */
export interface ScamDef {
  readonly id: ScamId;
  readonly name: string;
  /** Scam bucks to unlock; 0 = available from the start. */
  readonly price: number;
  /** In-game minutes one attempt takes. */
  readonly minutes: number;
  /** Base payout before target wealth. */
  readonly payout: number;
  /** Shutdown meter change on success / when the target reports you. */
  readonly heat: { readonly success: number; readonly fail: number };
  readonly templates: ReadonlyArray<ScamTemplate>;
  /** One-line takeaway for the player (the real-world defense). */
  readonly lesson: string;
}
