import type { ScamId } from "../core/state.ts";

/** Psychological levers a scam pulls. Each is also a victim weakness tag. */
export const LURES = ["authority", "urgency", "greed", "curiosity"] as const;
export type Lure = (typeof LURES)[number];
export type LureWeights = Readonly<Record<Lure, number>>;

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
 * A scam type: one file in src/scams/ with `export default { ... } satisfies ScamDef`.
 * `bun run gen` collects it into src/scams/index.ts.
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
