// Economy slice: shift clock, day rollover and the DayEnded log.
// Pure functions over GameState; state.ts delegates its cases here.
import type { GameState, ScamId } from "./state.ts";

/** Shift length (09:00 -> 17:00). Time only moves when a scam runs. */
export const SHIFT_MINUTES = 8 * 60;
/** Heat that cools off overnight, so one bad day is not game over. */
export const OVERNIGHT_COOLDOWN = 25;

/** Day 1 quota and how much it rises each day. */
const QUOTA_BASE = 60;
const QUOTA_STEP = 15;
export const quotaFor = (day: number) => QUOTA_BASE + QUOTA_STEP * (day - 1);

/** Missing the quota this many days in a row gets you fired. */
export const FIRE_AFTER_MISSES = 2;
/** Finish this day still employed and un-raided: top seller. */
export const WIN_DAY = 10;

/** The DayEnded event payload. Appended to `GameState.days` when a shift ends. */
export interface DaySummary {
  readonly day: number;
  readonly earned: number;
  readonly heatStart: number;
  readonly heatEnd: number;
  readonly quota: number;
  readonly met: boolean;
}

/** Close the shift: log it, cool heat overnight, start the next day at 09:00. */
export const endDay = (s: GameState): GameState => {
  const summary: DaySummary = {
    day: s.day,
    earned: s.earnedToday,
    heatStart: s.heatAtDayStart,
    heatEnd: s.shutdownMeter,
    quota: quotaFor(s.day),
    met: s.earnedToday >= quotaFor(s.day),
  };
  const heat = Math.max(0, s.shutdownMeter - OVERNIGHT_COOLDOWN);
  const next: GameState = {
    ...s,
    day: s.day + 1,
    minute: 0,
    earnedToday: 0,
    shutdownMeter: heat,
    heatAtDayStart: heat,
    days: [...s.days, summary],
  };
  const status =
    missStreak(next) >= FIRE_AFTER_MISSES
      ? "fired"
      : summary.day >= WIN_DAY
        ? "won"
        : s.status;
  return { ...next, status };
};

/** Advance the clock. Work that runs past 17:00 ends the shift (one day max). */
export const advance = (s: GameState, minutes: number): GameState => {
  const minute = s.minute + Math.max(0, minutes);
  return minute >= SHIFT_MINUTES ? endDay(s) : { ...s, minute };
};

/** Consecutive missed quotas, counting back from the last finished day. */
export const missStreak = (s: GameState) => {
  let n = 0;
  for (let i = s.days.length - 1; i >= 0 && !s.days[i]!.met; i--) n++;
  return n;
};

export type ToolId = string;

/** Something the Shop sells. Catalog data lives in src/shop/. */
export interface Purchase {
  readonly kind: "scam" | "tool";
  readonly id: ScamId | ToolId;
  readonly price: number;
}

export const owns = (s: GameState, p: Omit<Purchase, "price">) =>
  (p.kind === "scam" ? s.unlockedScams : s.ownedTools).includes(p.id);

/** Pay and unlock. No-op if already owned or unaffordable. Spending never
 * counts against the quota, which only looks at what was earned. */
export const buy = (s: GameState, p: Purchase): GameState => {
  if (owns(s, p) || p.price < 0 || s.scamBucks < p.price) return s;
  const paid = { ...s, scamBucks: s.scamBucks - p.price };
  return p.kind === "scam"
    ? { ...paid, unlockedScams: [...s.unlockedScams, p.id] }
    : { ...paid, ownedTools: [...s.ownedTools, p.id] };
};
