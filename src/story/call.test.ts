import { expect, test } from "bun:test";
import type { DialogChoice, DialogNode } from "../dialog/dialog.ts";
import { type Call, callDialog } from "./call.ts";

const line = { speaker: "V", line: "" };
const call: Call = {
  scam: "tech-support",
  victim: {
    name: "V",
    age: 70,
    occupation: "retired",
    detail: "d",
    defense: { behavior: "b", line: "l" },
  },
  steps: [
    { line: "a", want: "Push" },
    { line: "b", want: "Stall" },
    { line: "c", want: "Push" },
  ],
  ms: 1000,
  pass: 2,
  won: { ...line, line: "won" },
  lost: { ...line, line: "lost" },
  payout: 50,
  minutes: 30,
  heat: { success: 2, fail: 8 },
};

const pick = (c: DialogChoice): DialogNode => {
  c.pick?.();
  const next = typeof c.next === "function" ? c.next() : c.next;
  return next!;
};

const play = (moves: ReadonlyArray<0 | 1 | "timeout">) => {
  const results: boolean[] = [];
  let node = callDialog(call, (won) => results.push(won));
  for (const m of moves)
    node = pick(m === "timeout" ? node.timeout!.then : node.choices![m]!);
  return { results, last: node.line };
};

test("enough right moves lands the call, once", () => {
  expect(play([0, 1, 1])).toEqual({ results: [true], last: "won" });
});

test("a timeout counts as a miss", () => {
  expect(play([0, "timeout", 1])).toEqual({ results: [false], last: "lost" });
});

// Playtest 2: one Esc on the boss's first line skipped the whole call.
test("Esc can't hang up mid-call; on the result it goes on", () => {
  let node = callDialog(call, () => {});
  for (let i = 0; i < 3; i++) {
    expect(node.esc).toBeNull();
    node = pick(node.choices![0]!);
  }
  expect(node.esc).toBe(node.choices![0]);
});
