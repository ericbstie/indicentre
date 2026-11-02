import type { ToolId } from "../core/economy.ts";
import type { ScamId } from "../core/state.ts";
import type { Tag } from "../victims/types.ts";

/** Psychological levers a scam pulls. Each is also a victim weakness tag. */
export const LURES = ["authority", "urgency", "greed", "curiosity"] as const;
export type Lure = (typeof LURES)[number];
export type LureWeights = Readonly<Record<Lure, number>>;

/** Where a scam happens. Shown before the player commits. */
export const CHANNELS = ["mail", "call", "marketplace", "social"] as const;
export type Channel = (typeof CHANNELS)[number];

/** One concrete message/script the player can send. */
export interface ScamTemplate {
  readonly id: string;
  readonly label: string;
  /** Mail subject, call opener or listing title. */
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
  readonly channel: Channel;
  /** Scam bucks to unlock; 0 = available from the start. */
  readonly price: number;
  /** A tool (src/shop/tools.ts) the Shop wants you to own before selling this. */
  readonly requires?: ToolId;
  /** In-game minutes one attempt takes. */
  readonly minutes: number;
  /** Base payout before target wealth. */
  readonly payout: number;
  /** Shutdown meter change on success / when the target reports you. */
  readonly heat: { readonly success: number; readonly fail: number };
  readonly templates: ReadonlyArray<ScamTemplate>;
  /**
   * Contacts that build trust before the ask, played in order. Each costs
   * `minutes`; one the victim sees through ends the scam.
   */
  readonly warmups?: ReadonlyArray<ScamTemplate>;
  /** Victim weaknesses this scam is built for, on top of its templates' lures. */
  readonly fitTags: ReadonlyArray<Tag>;
  /** The debrief card, from the victim's side. Exactly 3 lines. */
  readonly whatToSpot: readonly [string, string, string];
  /** What a victim says after falling for it. `{name}` allowed. */
  readonly successLine: string;
}
