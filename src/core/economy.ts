// Economy slice: shift clock, day rollover and the DayEnded log.
// Pure functions over GameState; state.ts delegates its cases here.
import { type DeskTier, hasUpgrade, install } from "../workplace/slice.ts";
import type { GameState, ScamId } from "./state.ts";

/** Shift length (09:00 -> 17:00). Time only moves when a scam runs. */
export const SHIFT_MINUTES = 8 * 60;
/** Heat that cools off overnight, so one bad day is not game over. */
export const OVERNIGHT_COOLDOWN = 40;

/** Day 1 quota and how much it rises each day. */
const QUOTA_BASE = 45;
const QUOTA_STEP = 17;
export const quotaFor = (day: number) => QUOTA_BASE + QUOTA_STEP * (day - 1);

/** Missing the quota this many days in a row gets you fired. The first miss of
 * the run is a written warning instead and starts no streak. */
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
  /** The run's first missed quota: a written warning that doesn't count. */
  readonly warned: boolean;
}

/** Close the shift: log it, cool heat overnight, start the next day at 09:00. */
export const endDay = (s: GameState): GameState => {
  const met = s.earnedToday >= quotaFor(s.day);
  const summary: DaySummary = {
    day: s.day,
    earned: s.earnedToday,
    heatStart: s.heatAtDayStart,
    heatEnd: s.shutdownMeter,
    quota: quotaFor(s.day),
    met,
    warned: !met && s.days.every((d) => d.met),
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

/** Consecutive missed quotas that count, back from the last finished day.
 * The warned day ends the count like a met one. */
export const missStreak = (s: GameState) => {
  let n = 0;
  for (let i = s.days.length - 1; i >= 0; i--) {
    const d = s.days[i]!;
    if (d.met || d.warned) break;
    n++;
  }
  return n;
};

export type ToolId = string;

/** Something the Shop sells. Catalog data lives in src/shop/. */
export interface Purchase {
  readonly kind: "scam" | "tool" | "upgrade";
  readonly id: ScamId | ToolId;
  readonly price: number;
  /** Upgrades only: the desk tier this buys (workplace/slice.ts). */
  readonly tier?: DeskTier;
  /** A tool you must own before this is for sale. */
  readonly requires?: ToolId;
}

export const owns = (s: GameState, p: Omit<Purchase, "price">) =>
  p.kind === "upgrade"
    ? hasUpgrade(s.workplace, p)
    : (p.kind === "scam" ? s.unlockedScams : s.ownedTools).includes(p.id);

/** Not owned yet, affordable, and its required tool is owned. */
export const canBuy = (s: GameState, p: Purchase) =>
  !owns(s, p) &&
  p.price >= 0 &&
  s.scamBucks >= p.price &&
  (p.requires === undefined || s.ownedTools.includes(p.requires));

/** Pay and unlock. No-op unless `canBuy`. Spending never counts against the
 * quota, which only looks at what was earned. */
export const buy = (s: GameState, p: Purchase): GameState => {
  if (!canBuy(s, p)) return s;
  const paid = { ...s, scamBucks: s.scamBucks - p.price };
  switch (p.kind) {
    case "scam":
      return { ...paid, unlockedScams: [...s.unlockedScams, p.id] };
    case "tool":
      return { ...paid, ownedTools: [...s.ownedTools, p.id] };
    case "upgrade":
      return { ...paid, workplace: install(s.workplace, p) };
  }
};
