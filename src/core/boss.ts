// Pure boss rules: how scams and quota results move the boss's mood, and
// when he reacts. The boss system (systems/boss.ts) applies these.

export const DAILY_QUOTA = 150;
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

export const quotaResult = (
  earned: number,
  quota = DAILY_QUOTA,
): QuotaResult =>
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
