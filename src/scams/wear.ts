// A scam wears out when you run it all day: word gets round, banks post
// warnings, the same mail lands in spam. Landed scams count; a new day resets.
import { defineSlice } from "../core/slice.ts";
import type { GameState, ScamId } from "../core/state.ts";

/** Wins on one scam in a day that still pay in full. */
const FRESH_WINS = 2;
/** Each win past that pays this much of the one before. */
const WEAR = 0.5;

interface Wear {
  readonly day: number;
  readonly wins: Readonly<Record<ScamId, number>>;
}

interface Landed {
  readonly type: "wear/landed";
  readonly scam: ScamId;
  readonly day: number;
}

const wear = defineSlice(
  "wear",
  { day: 0, wins: {} } as Wear,
  (w, a: Landed) => {
    const wins = w.day === a.day ? w.wins : {};
    return { day: a.day, wins: { ...wins, [a.scam]: (wins[a.scam] ?? 0) + 1 } };
  },
);

export const markLanded = (s: GameState, scam: ScamId): Landed => ({
  type: "wear/landed",
  scam,
  day: s.day,
});

/** Share of the full payout `scam` pays right now: 1, 1, then 0.5, 0.25... */
export const freshness = (s: GameState, scam: ScamId) => {
  const w = wear.get(s);
  const wins = w.day === s.day ? (w.wins[scam] ?? 0) : 0;
  return WEAR ** Math.max(0, wins + 1 - FRESH_WINS);
};
