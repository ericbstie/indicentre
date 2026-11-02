// The "show me your technique" phone call as a rhythm beat: each victim line
// wants a push (they doubt, so hurry them) or a stall (they comply, so keep
// them calm). Answer in time or the line counts as missed.
import type { VictimProfile } from "../core/events.ts";
import type { DialogChoice, DialogNode } from "../dialog/dialog.ts";
import type { Line } from "./story.ts";

export type Move = "Push" | "Stall";

export interface Call {
  readonly scam: string;
  /** Who picks up; also what the news gets if the call lands. */
  readonly victim: VictimProfile;
  readonly steps: ReadonlyArray<{ readonly line: string; readonly want: Move }>;
  /** Time to answer each line. */
  readonly ms: number;
  /** Right answers needed to land the call. */
  readonly pass: number;
  readonly won: Line;
  readonly lost: Line;
  readonly payout: number;
  readonly minutes: number;
  readonly heat: { readonly success: number; readonly fail: number };
}

/** The call as a dialog chain. `done` gets the result when the last line is shown. */
export const callDialog = (
  call: Call,
  done: (won: boolean) => void,
): DialogNode => {
  let hits = 0;
  const end = (): DialogNode => {
    const won = hits >= call.pass;
    done(won);
    const { speaker, line } = won ? call.won : call.lost;
    return {
      speaker,
      line,
      choices: [{ label: "Go on" }],
    };
  };
  const step = (i: number): DialogNode => {
    const s = call.steps[i];
    if (!s) return end();
    const answer = (move?: Move): DialogChoice => ({
      label: move ?? "",
      pick: () => {
        if (move === s.want) hits++;
      },
      next: () => step(i + 1),
    });
    return {
      speaker: call.victim.name,
      line: s.line,
      choices: [answer("Push"), answer("Stall")],
      timeout: { ms: call.ms, then: answer() },
    };
  };
  return step(0);
};
