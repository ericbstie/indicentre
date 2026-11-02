// News items for the office TV. Pure: everything takes an Rng so the same
// scam produces the same story in tests.

import {
  PLACES,
  SPOTTED_HEADLINES,
  VICTIM_HEADLINES,
  VICTIM_QUOTES,
} from "../content/news.ts";
import type { EventOf, VictimProfile } from "../core/events.ts";
import { pick, type Rng } from "../core/rng.ts";
import { scams } from "../scams/registry.ts";
import { firstName } from "../victims/types.ts";

export interface NewsItem {
  readonly headline: string;
  /** "Gunnar, 74. Plays bridge on Thursdays." Empty for ambient news. */
  readonly profile: string;
  readonly quote: string;
  readonly kind: "victim" | "spotted" | "ambient";
}

/** Scam bucks are game money; the news reports kroner, rounded like a paper would. */
const BUCKS_TO_KR = 650;

export const kroner = (bucks: number) =>
  (Math.round((bucks * BUCKS_TO_KR) / 100) * 100).toLocaleString("en-US");

/** Fills `{slot}`s and capitalizes the result, since a slot may open a headline. */
export const fill = (text: string, slots: Readonly<Record<string, string>>) => {
  const out = text.replace(/\{(\w+)\}/g, (m, k: string) => slots[k] ?? m);
  return out.charAt(0).toUpperCase() + out.slice(1);
};

const sentence = (s: string) => {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
};

export const profileLine = (v: VictimProfile) =>
  `${firstName(v)}, ${v.age}. ${sentence(v.detail)}`;

const slotsFor = (
  rng: Rng,
  e: EventOf<"ScamResolved">,
): Record<string, string> => ({
  place: pick(rng, PLACES),
  role: e.victim.occupation.toLowerCase(),
  name: firstName(e.victim),
  age: String(e.victim.age),
  amount: kroner(e.bucks),
  scam: (
    scams.find((s) => s.id === e.scam)?.name ?? "online scam"
  ).toLowerCase(),
});

/** The story the TV runs after a scam worked. */
export const victimStory = (rng: Rng, e: EventOf<"ScamResolved">): NewsItem => {
  const slots = slotsFor(rng, e);
  return {
    headline: fill(pick(rng, VICTIM_HEADLINES), slots),
    profile: profileLine(e.victim),
    quote: `"${pick(rng, VICTIM_QUOTES)}"`,
    kind: "victim",
  };
};

/** The story the TV runs when the target caught the scam: the lesson, told by them. */
const spottedStory = (rng: Rng, e: EventOf<"ScamResolved">): NewsItem => {
  const slots = slotsFor(rng, e);
  return {
    headline: fill(pick(rng, SPOTTED_HEADLINES), slots),
    profile: `${firstName(e.victim)}, ${e.victim.age}. ${sentence(e.victim.defense.behavior)}`,
    quote: `"${e.victim.defense.line}"`,
    kind: "spotted",
  };
};

/** Whatever the TV should run for a resolved scam, win or lose. */
export const storyFor = (rng: Rng, e: EventOf<"ScamResolved">) =>
  e.success ? victimStory(rng, e) : spottedStory(rng, e);
