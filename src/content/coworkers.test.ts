import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { coworkers, unlockedHints } from "./coworkers.ts";

describe("coworkers", () => {
  test("unique ids and desks, 4-6 hints each", () => {
    expect(new Set(coworkers.map((c) => c.id)).size).toBe(coworkers.length);
    expect(new Set(coworkers.map((c) => c.desk)).size).toBe(coworkers.length);
    for (const c of coworkers) {
      expect(c.hints.length).toBeGreaterThanOrEqual(4);
      expect(c.hints.length).toBeLessThanOrEqual(6);
    }
  });

  test("one hint is free, each failed attempt at the specialty unlocks one", () => {
    const priya = coworkers.find((c) => c.id === "priya")!;
    const s0 = initialState();
    expect(unlockedHints(priya, s0)).toEqual(priya.hints.slice(0, 1));
    const s1 = reduce(s0, { type: "scamFailed", scam: "tech-support" });
    expect(unlockedHints(priya, s1)).toHaveLength(1);
    const s2 = reduce(s1, { type: "scamFailed", scam: "phishing" });
    expect(unlockedHints(priya, s2)).toHaveLength(2);
  });
});
