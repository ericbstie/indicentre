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

export const SHUTDOWN_MAX = 100;

export const BOSS_MOOD_MAX = 100;
export const BOSS_MOOD_START = 50;

export type ScamId = string;

export interface Mail {
  readonly id: string;
  readonly from: string;
  readonly subject: string;
  readonly body: string;
  readonly read: boolean;
}

export interface GameState {
  readonly scamBucks: number;
  /** 0..SHUTDOWN_MAX. At max the call center is raided and the run ends. */
  readonly shutdownMeter: number;
  readonly day: number;
  /** Minutes since the workday started. */
  readonly minute: number;
  readonly unlockedScams: ReadonlyArray<ScamId>;
  /** Newest first. */
  readonly inbox: ReadonlyArray<Mail>;
  readonly status: "playing" | "shutdown";
  /** Failed attempts per scam type; coworkers open up as this grows. */
  readonly scamFails: Readonly<Record<ScamId, number>>;
  /** Hints heard so far, per coworker id. */
  readonly talkedTo: Readonly<Record<string, number>>;
  /** 0..BOSS_MOOD_MAX. How the boss feels about you; see core/boss.ts. */
  readonly bossMood: number;
  /** Bucks earned since this shift started. */
  readonly earnedToday: number;
  readonly heatAtDayStart: number;
  /** DayEnded log, oldest first. */
  readonly days: ReadonlyArray<DaySummary>;
  readonly ownedTools: ReadonlyArray<ToolId>;
}

export type Action =
  | { readonly type: "earn"; readonly amount: number }
  | { readonly type: "spend"; readonly amount: number }
  | { readonly type: "heat"; readonly amount: number }
  | { readonly type: "tick"; readonly minutes: number }
  | { readonly type: "unlock"; readonly scam: ScamId }
  | { readonly type: "mail"; readonly mail: Omit<Mail, "read"> }
  | { readonly type: "readMail"; readonly id: string }
  | { readonly type: "scamFailed"; readonly scam: ScamId }
  | { readonly type: "heardHint"; readonly coworker: string }
  | { readonly type: "bossMood"; readonly amount: number }
  /** Clock out: ends the shift now. */
  | { readonly type: "endDay" }
  | { readonly type: "buy"; readonly item: Purchase };

export const initialState = (
  unlockedScams: ReadonlyArray<ScamId> = [],
): GameState => ({
  scamBucks: 0,
  shutdownMeter: 0,
  day: 1,
  minute: 0,
  unlockedScams,
  inbox: [],
  status: "playing",
  scamFails: {},
  talkedTo: {},
  bossMood: BOSS_MOOD_START,
  earnedToday: 0,
  heatAtDayStart: 0,
  days: [],
  ownedTools: [],
});

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export const canAfford = (s: GameState, amount: number) =>
  s.scamBucks >= amount;

export const unreadCount = (s: GameState) =>
  s.inbox.filter((m) => !m.read).length;

export const failsAt = (s: GameState, scam: ScamId) => s.scamFails[scam] ?? 0;

export const hintsHeard = (s: GameState, coworker: string) =>
  s.talkedTo[coworker] ?? 0;

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
  if (s.status === "shutdown") return s;
  switch (a.type) {
    case "earn":
      return a.amount > 0
        ? {
            ...s,
            scamBucks: s.scamBucks + a.amount,
            earnedToday: s.earnedToday + a.amount,
          }
        : s;
    case "spend":
      return a.amount > 0 && canAfford(s, a.amount)
        ? { ...s, scamBucks: s.scamBucks - a.amount }
        : s;
    case "heat":
      return withHeat(s, s.shutdownMeter + a.amount);
    case "tick":
      return advance(s, a.minutes);
    case "unlock":
      return isUnlocked(s, a.scam)
        ? s
        : { ...s, unlockedScams: [...s.unlockedScams, a.scam] };
    case "mail":
      return s.inbox.some((m) => m.id === a.mail.id)
        ? s
        : { ...s, inbox: [{ ...a.mail, read: false }, ...s.inbox] };
    case "readMail":
      return {
        ...s,
        inbox: s.inbox.map((m) => (m.id === a.id ? { ...m, read: true } : m)),
      };
    case "scamFailed":
      return {
        ...s,
        scamFails: { ...s.scamFails, [a.scam]: failsAt(s, a.scam) + 1 },
      };
    case "heardHint":
      return {
        ...s,
        talkedTo: {
          ...s.talkedTo,
          [a.coworker]: hintsHeard(s, a.coworker) + 1,
        },
      };
    case "bossMood":
      return {
        ...s,
        bossMood: clamp(s.bossMood + a.amount, 0, BOSS_MOOD_MAX),
      };
    case "endDay":
      return endDay(s);
    case "buy":
      return buy(s, a.item);
  }
};
