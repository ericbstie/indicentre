// Procedural victims. Pure data + types; no DOM. Content lives in tables.ts
// and fragments.ts so writers never touch logic.

/**
 * What a victim falls for. A scam's `fitTags` are matched against these.
 * The first four equal the template lures in scams/types.ts.
 */
export const TAGS = [
  "authority",
  "urgency",
  "greed",
  "curiosity",
  "fear",
  "lonely",
  "parcel",
  "bank",
  "romance",
  "job",
  "tech-help",
  "family",
] as const;
export type Tag = (typeof TAGS)[number];

export const AGE_BANDS = [
  "20s",
  "30s",
  "40s",
  "50s",
  "60s",
  "70s",
  "80s",
] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const ageBand = (age: number): AgeBand =>
  AGE_BANDS[
    Math.min(AGE_BANDS.length - 1, Math.max(0, Math.floor(age / 10) - 2))
  ]!;

/** The habit that beats a scam. Shown when the victim wins: the lesson. */
export interface Defense {
  readonly id: string;
  /** What they did, third person, no pronouns. "Called the bank back on the number on the card." */
  readonly behavior: string;
  /** What they said, in their own voice. */
  readonly line: string;
  /** Scams pulling any of these tags run into this habit. */
  readonly counters: ReadonlyArray<Tag>;
}

/** One concrete, specific fact. Its tag is a true weakness, so the hint is fair. */
export interface Detail {
  readonly text: string;
  readonly tag: Tag;
}

export interface Victim {
  readonly id: string;
  readonly name: string;
  readonly age: number;
  readonly occupation: string;
  /** 0..1. High = spots fakes, hovers links, knows what remote access is. */
  readonly techComfort: number;
  /** 0..1. High = assumes the caller is who they say. */
  readonly trust: number;
  /** Payout multiplier, ~0.4..2. */
  readonly wealth: number;
  readonly weaknesses: ReadonlyArray<Tag>;
  readonly detail: Detail;
  /** Their hidden tell: the habit that makes some scams bounce off. */
  readonly defense: Defense;
}

export const firstName = (v: { readonly name: string }) =>
  v.name.split(" ")[0] ?? v.name;
