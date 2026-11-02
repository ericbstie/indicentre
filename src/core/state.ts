// Pure game state. No I/O, no Effect: everything here is a plain function
// so it can be unit-tested and replayed. Side effects live in store.ts.

export const WORKDAY_MINUTES = 8 * 60; // 09:00 -> 17:00
export const SHUTDOWN_MAX = 100;
/** Heat that cools off overnight, so one bad day is not game over. */
export const OVERNIGHT_COOLDOWN = 5;

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
}

export type Action =
  | { readonly type: "earn"; readonly amount: number }
  | { readonly type: "spend"; readonly amount: number }
  | { readonly type: "heat"; readonly amount: number }
  | { readonly type: "tick"; readonly minutes: number }
  | { readonly type: "unlock"; readonly scam: ScamId }
  | { readonly type: "mail"; readonly mail: Omit<Mail, "read"> }
  | { readonly type: "readMail"; readonly id: string }
  | { readonly type: "scamFailed"; readonly scam: ScamId };

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
});

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export const canAfford = (s: GameState, amount: number) =>
  s.scamBucks >= amount;

export const unreadCount = (s: GameState) =>
  s.inbox.filter((m) => !m.read).length;

export const failsAt = (s: GameState, scam: ScamId) => s.scamFails[scam] ?? 0;

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

const tick = (s: GameState, minutes: number): GameState => {
  const elapsed = s.minute + Math.max(0, minutes);
  const days = Math.floor(elapsed / WORKDAY_MINUTES);
  const next = { ...s, day: s.day + days, minute: elapsed % WORKDAY_MINUTES };
  return days > 0
    ? withHeat(next, s.shutdownMeter - OVERNIGHT_COOLDOWN * days)
    : next;
};

/** The only way state changes. Invalid actions return the state unchanged. */
export const reduce = (s: GameState, a: Action): GameState => {
  if (s.status === "shutdown") return s;
  switch (a.type) {
    case "earn":
      return a.amount > 0 ? { ...s, scamBucks: s.scamBucks + a.amount } : s;
    case "spend":
      return a.amount > 0 && canAfford(s, a.amount)
        ? { ...s, scamBucks: s.scamBucks - a.amount }
        : s;
    case "heat":
      return withHeat(s, s.shutdownMeter + a.amount);
    case "tick":
      return tick(s, a.minutes);
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
  }
};
