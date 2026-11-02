import { describe, expect, test } from "bun:test";
import { int, pick, range, sample, seedFrom, seeded, weighted } from "./rng.ts";

const draws = (seed: number, n = 5) => {
  const r = seeded(seed);
  return Array.from({ length: n }, r);
};

describe("rng", () => {
  test("same seed, same stream; different seed, different stream", () => {
    expect(draws(7)).toEqual(draws(7));
    expect(draws(7)).not.toEqual(draws(8));
    for (const x of draws(3, 1000)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  test("int, range, pick and sample stay in bounds", () => {
    const r = seeded(1);
    for (let i = 0; i < 200; i++) {
      const n = int(r, 2, 4);
      expect(n >= 2 && n <= 4 && Number.isInteger(n)).toBe(true);
      const f = range(r, 0.5, 1.5);
      expect(f >= 0.5 && f < 1.5).toBe(true);
    }
    expect(["a", "b"]).toContain(pick(r, ["a", "b"]));
    expect(new Set(sample(r, [1, 2, 3, 4], 3)).size).toBe(3);
  });

  test("weighted respects weights and skips zero", () => {
    const r = seeded(11);
    const counts = { a: 0, b: 0, c: 0 };
    const w = { a: 3, b: 1, c: 0 };
    for (let i = 0; i < 4000; i++)
      counts[weighted(r, ["a", "b", "c"] as const, (x) => w[x])]++;
    expect(counts.c).toBe(0);
    expect(counts.a / counts.b).toBeGreaterThan(2.4);
    expect(counts.a / counts.b).toBeLessThan(3.6);
    expect(() => weighted(r, ["a"], () => 0)).toThrow();
  });

  test("seedFrom is stable and spreads", () => {
    expect(seedFrom("playtest")).toBe(seedFrom("playtest"));
    expect(seedFrom("a")).not.toBe(seedFrom("b"));
  });
});
