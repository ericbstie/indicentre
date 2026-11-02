// Economy slice: shift clock, day rollover and the DayEnded log.
// Pure functions over GameState; state.ts delegates its cases here.
import type { GameState } from "./state.ts";

/** Shift length (09:00 -> 17:00). Time only moves when a scam runs. */
export const SHIFT_MINUTES = 8 * 60;
/** Heat that cools off overnight, so one bad day is not game over. */
export const OVERNIGHT_COOLDOWN = 25;

/** Day 1 quota and how much it rises each day. */
export const QUOTA_BASE = 60;
export const QUOTA_STEP = 15;
export const quotaFor = (day: number) => QUOTA_BASE + QUOTA_STEP * (day - 1);

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
  return {
    ...s,
    day: s.day + 1,
    minute: 0,
    earnedToday: 0,
    shutdownMeter: heat,
    heatAtDayStart: heat,
    days: [...s.days, summary],
  };
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
