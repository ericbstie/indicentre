// Pure boss rules: how scams and quota results move the boss's mood, and
// when he reacts. The boss system (systems/boss.ts) applies these.

/** Earning this multiple of the quota counts as smashing it. */
export const SMASH_FACTOR = 2;
/** A single scam paying at least this is a big win. */
export const BIG_WIN = 60;
/** This many failed scams in a row and the boss notices. */
export const FAIL_STREAK = 3;
/** Below this mood the boss stops trusting you to work unsupervised. */
export const WATCH_BELOW = 50;

export const MOOD = {
  success: 2,
  bigWin: 6,
  fail: -3,
  failStreak: -5,
  quotaMissed: -20,
  quotaMet: 5,
  quotaSmashed: 15,
} as const;

export type QuotaResult = "missed" | "met" | "smashed";

/** Grades a finished day (the DayEnded summary). The quota comes from core/economy.ts. */
export const quotaResult = ({
  earned,
  quota,
}: {
  readonly earned: number;
  readonly quota: number;
}): QuotaResult =>
  earned < quota
    ? "missed"
    : earned >= quota * SMASH_FACTOR
      ? "smashed"
      : "met";

export const quotaMood: Readonly<Record<QuotaResult, number>> = {
  missed: MOOD.quotaMissed,
  met: MOOD.quotaMet,
  smashed: MOOD.quotaSmashed,
};

/** Mood change for one resolved scam. `streak` = fails in a row, including this one. */
export const scamMood = (
  success: boolean,
  bucks: number,
  streak: number,
): number =>
  success
    ? bucks >= BIG_WIN
      ? MOOD.bigWin
      : MOOD.success
    : MOOD.fail + (streak === FAIL_STREAK ? MOOD.failStreak : 0);

/** Which line pool the boss speaks from. */
export const moodPool = (mood: number): "low" | "high" =>
  mood < WATCH_BELOW ? "low" : "high";
