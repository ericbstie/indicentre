// What the floor manager says. Each reaction has a pool for when he is in a
// bad mood (below WATCH_BELOW) and one for a good mood. Voice: KPI culture,
// one real detail from docs/call-center-culture.md (fines list, end-of-day
// form, drum, small weekly prizes), never about anyone's ethnicity or accent.

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
      "Three in a row. That's a fine. It's on the list by the printer, between sleeping at the desk and eating at the desk.",
      "Three misses. Sign the fine form. If you don't sign it, it doubles, and that's not me, that's the form.",
      "Your call log looks like a weather report. All of it bad.",
    ],
    high: [
      "Three misses. Rohan's Tuesday call is on the training tape. Listen to it on your break.",
      "Bad patch. Have some water, the water is free until Friday.",
      "Rough hour. Shake it off. Quietly, people are working.",
    ],
  },
  bigWin: {
    low: [
      "Hm. Good. Don't get used to me saying good.",
      "That one goes on the board. In pencil, for now.",
      "Fine. That's the number I wanted on Tuesday.",
    ],
    high: [
      "Somebody hit the drum. We don't have a drum. Somebody expense a drum.",
      "I'm posting that in the group chat. I expect twenty-six thumbs up by lunch.",
      "That's a whiteboard number. Someone find the good marker.",
    ],
  },
  quotaMissed: {
    low: [
      "Short. Fill in the end-of-day form and read me the box that says 'successes'.",
      "I put your total in the shared drive. The shared drive is embarrassed.",
      "Short again. HR has a template for this. I've never had to use it twice.",
    ],
    high: [
      "Missed. Don't fear the fine, let it fuel your fire. That's off the poster, I didn't make it up.",
      "Missed it. Tomorrow you surprise me. The good kind of surprise.",
      "Missed. I'll write 'learning day' in the report. I get two of those a year.",
    ],
  },
  quotaMet: {
    low: [
      "Quota met. Exactly met. Ambition is free, you know.",
      "Exactly on the line. I've seen pensioners with more ambition.",
      "Met. This week's prize is the desk fan, and the fan is not for people who just meet.",
    ],
    high: [
      "Quota met. You're on the board, bottom half, but on it.",
      "Quota met. Nobody will write a song about it, but it's met.",
      "That's the number. Same again tomorrow, then a bit more.",
    ],
  },
  quotaSmashed: {
    low: [
      "Double quota. I've moved your name up the whiteboard, one below mine.",
      "Double. Don't smile, it makes the others nervous.",
    ],
    high: [
      "Double quota! I'm printing this and pinning it next to the eagle poster.",
      "Double quota. I told regional about you. Spelled your name right and everything.",
      "Double! The good chair is yours tomorrow, and only tomorrow.",
    ],
  },
  watchStart: {
    low: [
      "Show me your technique. I'll just stand here and breathe.",
      "Next one, I watch. Do it exactly how you'd do it if I wasn't here.",
      "Don't mind me. I'm filling in your form as we go.",
    ],
    high: [
      "Let's see your technique. Pretend I'm not here.",
      "Go on, show me. I've cleared five minutes.",
    ],
  },
  watchSuccess: {
    low: [
      "Okay. Okay. Now do that forty more times.",
      "Acceptable. I'm writing down 'acceptable'.",
    ],
    high: [
      "See? Technique. I taught you that, in spirit.",
      "Clean. I'm keeping the recording for the new hires.",
    ],
  },
  watchFail: {
    low: [
      "That's not a technique, that's a hobby.",
      "They spotted it before you finished the subject line.",
      "I watched that whole thing. I want those minutes back.",
    ],
    high: [
      "They noticed. Read your own message once before you send it.",
      "Close. Read it out loud next time. A bad mail sounds bad.",
    ],
  },
  newDesk: {
    low: [
      "New desk. Same numbers. I'll be checking which one is the problem.",
      "A new desk is an investment. I'll be checking the returns.",
    ],
    high: [
      "Nice desk. I had that desk in 2019. Look where I am now.",
      "Desk like that, I expect numbers like that.",
    ],
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
    "Sign below. An unsigned warning counts twice.",
  ],
});
