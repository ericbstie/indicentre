import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import {
  coworkers,
  heardHint,
  hintsHeard,
  idleLine,
  scamFailed,
  unlockedHints,
} from "./coworkers.ts";

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
    const s1 = reduce(s0, scamFailed("tech-support"));
    expect(unlockedHints(priya, s1)).toHaveLength(1);
    const s2 = reduce(s1, scamFailed("phishing"));
    expect(unlockedHints(priya, s2)).toHaveLength(2);
  });

  test("idle lines come in turn, never the same twice in a row", () => {
    const s = initialState();
    for (const c of coworkers) {
      expect(c.idle.length).toBeGreaterThanOrEqual(3);
      for (let n = 0; n < 6; n++)
        expect(idleLine(c, s, n)).not.toBe(idleLine(c, s, n + 1));
    }
  });

  test("counts hints heard per coworker", () => {
    const s1 = reduce(initialState(), heardHint("priya"));
    expect(hintsHeard(s1, "priya")).toBe(1);
    expect(hintsHeard(s1, "rohan")).toBe(0);
  });
});
