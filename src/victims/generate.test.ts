import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { daily, generateVictims } from "./generate.ts";
import {
  DEFENSES,
  DETAILS,
  FIRST_NAMES,
  LAST_NAMES,
  OCCUPATIONS,
} from "./tables.ts";
import { firstName, TAGS } from "./types.ts";

const batch = generateVictims(seeded(2026), 100);

describe("victim tables", () => {
  test("every tag has a detail and a defense that can surface it", () => {
    for (const t of TAGS) {
      expect(DETAILS.some((d) => d.tag === t)).toBe(true);
      expect(DEFENSES.some((d) => d.counters.includes(t))).toBe(true);
    }
  });

  test("ranges are sane and ids unique", () => {
    for (const o of OCCUPATIONS) {
      for (const [lo, hi] of [o.age, o.techComfort, o.trust, o.wealth])
        expect(lo).toBeLessThanOrEqual(hi);
      expect(o.leans.length).toBeGreaterThan(0);
    }
    expect(new Set(DEFENSES.map((d) => d.id)).size).toBe(DEFENSES.length);
    expect(new Set(FIRST_NAMES).size).toBe(FIRST_NAMES.length);
    expect(new Set(LAST_NAMES).size).toBe(LAST_NAMES.length);
  });

  test("every occupation's age range has at least one detail", () => {
    for (const o of OCCUPATIONS)
      for (const age of o.age)
        expect(
          DETAILS.some(
            (d) => age >= (d.minAge ?? 0) && age <= (d.maxAge ?? Infinity),
          ),
        ).toBe(true);
  });
});

describe("generateVictims", () => {
  test("deterministic per seed", () => {
    expect(generateVictims(seeded(5), 4)).toEqual(
      generateVictims(seeded(5), 4),
    );
    expect(generateVictims(seeded(5), 4)).not.toEqual(
      generateVictims(seeded(6), 4),
    );
  });

  test("no duplicate names in 100 draws", () => {
    expect(new Set(batch.map((v) => v.name)).size).toBe(100);
  });

  test("a day's batches never reuse a first name until they run out", () => {
    const today = daily();
    const rng = seeded(9);
    const day1 = Array.from({ length: 10 }, () =>
      generateVictims(rng, 3, today(1)),
    ).flat();
    const firsts = day1.map(firstName);
    expect(new Set(firsts).size).toBe(firsts.length);
    // Once the first names run out, only full names stay unique.
    const long = Array.from({ length: 30 }, () =>
      generateVictims(rng, 3, today(1)),
    ).flat();
    const full = [...day1, ...long].map((v) => v.name);
    expect(new Set(full).size).toBe(full.length);
    expect(today(2).names.size).toBe(0);
  });

  test("within a day, a defense never says the same line twice in a row", () => {
    const today = daily();
    const rng = seeded(11);
    const last = new Map<string, string>();
    for (let i = 0; i < 40; i++)
      for (const v of generateVictims(rng, 3, today(1))) {
        expect(v.defense.line).not.toBe(last.get(v.defense.id) ?? "");
        last.set(v.defense.id, v.defense.line);
      }
  });

  test("profiles are distinct and internally consistent", () => {
    const shapes = new Set(
      batch.map((v) => `${v.occupation}|${v.detail.text}|${v.defense.id}`),
    );
    expect(shapes.size).toBeGreaterThan(70);
    for (const v of batch) {
      expect(v.weaknesses).toContain(v.detail.tag);
      expect(v.defense.counters).not.toContain(v.detail.tag);
      for (const x of [v.techComfort, v.trust]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(1);
      }
    }
  });

  test("tag distribution: every tag shows up, none dominates", () => {
    const count = new Map<string, number>();
    for (const v of batch)
      for (const t of v.weaknesses) count.set(t, (count.get(t) ?? 0) + 1);
    for (const t of TAGS) expect(count.get(t) ?? 0).toBeGreaterThan(0);
    const total = [...count.values()].reduce((a, b) => a + b, 0);
    for (const n of count.values()) expect(n / total).toBeLessThan(0.25);
  });

  test("a spread of ages and occupations", () => {
    expect(new Set(batch.map((v) => v.occupation)).size).toBeGreaterThan(10);
    expect(batch.some((v) => v.age < 30)).toBe(true);
    expect(batch.some((v) => v.age >= 70)).toBe(true);
  });
});
