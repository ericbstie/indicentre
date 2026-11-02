// Pure game state. No I/O, no Effect: everything here is a plain function
// so it can be unit-tested and replayed. Side effects live in store.ts.
import {
  advance,
  buy,
  type DaySummary,
  endDay,
  type Purchase,
  type ToolId,
} from "./economy.ts";
import { initialWorkplace, type WorkplaceState } from "../workplace/slice.ts";
import { reduceSlices, type SliceAction } from "./slice.ts";

export const SHUTDOWN_MAX = 100;

export type ScamId = string;

/** The whole run. Saved as JSON (core/save.ts): keep it plain data, and bump
 * SAVE_VERSION when its shape changes. Feature state lives in `slices`. */
export interface GameState {
  readonly scamBucks: number;
  /** 0..SHUTDOWN_MAX. At max the call center is raided and the run ends. */
  readonly shutdownMeter: number;
  readonly day: number;
  /** Minutes since the workday started. */
  readonly minute: number;
  readonly unlockedScams: ReadonlyArray<ScamId>;
  /** Anything but "playing" ends the run (see economy.ts for fired/won). */
  readonly status: "playing" | "shutdown" | "fired" | "won";
  /** Bucks earned since this shift started. */
  readonly earnedToday: number;
  readonly heatAtDayStart: number;
  /** DayEnded log, oldest first. */
  readonly days: ReadonlyArray<DaySummary>;
  readonly ownedTools: ReadonlyArray<ToolId>;
  readonly workplace: WorkplaceState;
  /** Feature state by slice key; read it with `slice.get(state)` (core/slice.ts). */
  readonly slices: Readonly<Record<string, unknown>>;
}

/** Economy actions. Features add slice actions, not variants here. */
export type CoreAction =
  | { readonly type: "earn"; readonly amount: number }
  | { readonly type: "heat"; readonly amount: number }
  | { readonly type: "tick"; readonly minutes: number }
  /** Clock out: ends the shift now. */
  | { readonly type: "endDay" }
  | { readonly type: "buy"; readonly item: Purchase };

export type Action = CoreAction | SliceAction;

const isSliceAction = (a: Action): a is SliceAction => a.type.includes("/");

export const initialState = (
  unlockedScams: ReadonlyArray<ScamId> = [],
): GameState => ({
  scamBucks: 0,
  shutdownMeter: 0,
  day: 1,
  minute: 0,
  unlockedScams,
  status: "playing",
  earnedToday: 0,
  heatAtDayStart: 0,
  days: [],
  ownedTools: [],
  workplace: initialWorkplace,
  slices: {},
});

export const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export const isUnlocked = (s: GameState, scam: ScamId) =>
  s.unlockedScams.includes(scam);

/** "09:00"-style wall clock for the HUD. */
export const clock = (s: GameState) => {
  const total = 9 * 60 + s.minute;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const withHeat = (s: GameState, shutdownMeter: number): GameState => {
  const meter = clamp(shutdownMeter, 0, SHUTDOWN_MAX);
  return {
    ...s,
    shutdownMeter: meter,
    status: meter >= SHUTDOWN_MAX ? "shutdown" : s.status,
  };
};

/** The only way state changes. Invalid actions return the state unchanged. */
export const reduce = (s: GameState, a: Action): GameState => {
  if (s.status !== "playing") return s;
  if (isSliceAction(a)) {
    const slices = reduceSlices(s.slices, a);
    return slices === s.slices ? s : { ...s, slices };
  }
  switch (a.type) {
    case "earn":
      return a.amount > 0
        ? {
            ...s,
            scamBucks: s.scamBucks + a.amount,
            earnedToday: s.earnedToday + a.amount,
          }
        : s;
    case "heat":
      return withHeat(s, s.shutdownMeter + a.amount);
    case "tick":
      return advance(s, a.minutes);
    case "endDay":
      return endDay(s);
    case "buy":
      return buy(s, a.item);
  }
};
