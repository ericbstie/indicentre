// What the floor manager says. Each reaction has a pool for when he is in a
// bad mood (below WATCH_BELOW) and one for a good mood. Voice: KPI culture,
// one concrete detail, never about anyone's ethnicity or accent.

import { moodPool, type QuotaResult, quotaResult } from "../core/boss.ts";
import type { DaySummary } from "../core/economy.ts";

export type BossReaction =
  | "failStreak"
  | "bigWin"
  | "quotaMissed"
  | "quotaMet"
  | "quotaSmashed"
  | "watchStart"
  | "watchSuccess"
  | "watchFail"
  | "newDesk";

export interface MoodLines {
  readonly low: ReadonlyArray<string>;
  readonly high: ReadonlyArray<string>;
}

export const bossLines: Readonly<Record<BossReaction, MoodLines>> = {
  failStreak: {
    low: [
      "Three in a row. I've started a spreadsheet just for you.",
      "IT checked your phone. Your phone is fine.",
    ],
    high: [
      "Three misses. Happens. Don't let it happen a fourth time.",
      "Bad patch. Have some water, the water is free until Friday.",
    ],
  },
  bigWin: {
    low: [
      "Hm. Good. Don't get used to me saying good.",
      "That one goes on the board. In pencil, for now.",
    ],
    high: [
      "Somebody ring the bell! We don't have a bell. Somebody expense a bell.",
      "Look at that number. That's going in the Monday huddle.",
    ],
  },
  quotaMissed: {
    low: [
      "Quota is a number, junior. Not a suggestion.",
      "I put your total in the shared drive. The shared drive is embarrassed.",
    ],
    high: [
      "I believed in you this morning. Look what you did to my morning.",
      "Missed it. Tomorrow you surprise me. The good kind of surprise.",
    ],
  },
  quotaMet: {
    low: ["Quota met. Exactly met. Ambition is free, you know."],
    high: ["Quota hit. Go home, come back hungrier."],
  },
  quotaSmashed: {
    low: ["Double quota. Fine. I was wrong about you. Once."],
    high: [
      "Double quota! I'm printing this and pinning it next to the eagle poster.",
    ],
  },
  watchStart: {
    low: [
      "Show me your technique. I'll just stand here. Breathing.",
      "Next one, I watch. Do it exactly how you'd do it if I wasn't here.",
    ],
    high: ["Let's see your technique. Pretend I'm not here."],
  },
  watchSuccess: {
    low: ["Okay. Okay. Now do that forty more times."],
    high: ["See? Technique. I taught you that. Spiritually."],
  },
  watchFail: {
    low: [
      "That's not a technique, that's a hobby.",
      "They spotted it before you finished the subject line.",
    ],
    high: ["They noticed. Read your own message once before you send it."],
  },
  newDesk: {
    low: ["New desk. Same numbers. I'll be checking which one is the problem."],
    high: ["Nice desk. I had that desk in 2019. Look where I am now."],
  },
};

const VERDICT: Readonly<Record<QuotaResult, BossReaction>> = {
  missed: "quotaMissed",
  met: "quotaMet",
  smashed: "quotaSmashed",
};

/** His end-of-day verdict for the day report. Rotates through the pool by day. */
export const verdictLine = (d: DaySummary, mood: number) => {
  const pool = bossLines[VERDICT[quotaResult(d)]][moodPool(mood)];
  return pool[d.day % pool.length] ?? "";
};

/** The run's first missed quota: HR's form letter, signed by nobody in HR. */
export const writtenWarning = (d: DaySummary) => ({
  title: "Formal written warning",
  lines: [
    `Re: Day ${d.day}. Quota ${d.quota} bucks, delivered ${d.earned}.`,
    "This letter goes in your file. Your file was empty until today, which HR also found suspicious.",
    "Miss two days in a row from here and someone else gets your chair. The chair has been told.",
    "No need to sign. We know where you sit.",
  ],
});
