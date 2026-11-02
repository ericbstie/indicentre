import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { generateVictims } from "./generate.ts";
import {
  attempt,
  COUNTERED,
  fitLabel,
  MAX_CHANCE,
  MIN_CHANCE,
  successChance,
} from "./resistance.ts";
import type { Victim } from "./types.ts";

const victim = (over: Partial<Victim> = {}): Victim => ({
  id: "x",
  name: "Gunnar Lie",
  age: 74,
  occupation: "Retired ferry engineer",
  techComfort: 0.1,
  trust: 0.8,
  wealth: 1.5,
  weaknesses: ["bank", "authority", "tech-help"],
  detail: { text: "Still prints every email.", tag: "tech-help" },
  hobby: { text: "h", source: "s" },
  recent: { text: "r", source: "s", hide: "x" },
  defense: {
    id: "video-call",
    behavior: "Asked for a video call.",
    line: "Camera broken again?",
    counters: ["lonely"],
  },
  ...over,
});

describe("successChance", () => {
  test("fitting tags beat missing ones", () => {
    const v = victim();
    expect(successChance(v, ["bank", "authority"])).toBeGreaterThan(
      successChance(v, ["greed", "parcel"]),
    );
  });

  test("tech comfort lowers, trust raises", () => {
    const tags = ["bank"] as const;
    const base = successChance(victim(), tags);
    expect(successChance(victim({ techComfort: 0.9 }), tags)).toBeLessThan(
      base,
    );
    expect(successChance(victim({ trust: 0.2 }), tags)).toBeLessThan(base);
  });

  test("the tell cuts the odds", () => {
    const tags = ["bank", "lonely"] as const;
    const plain = successChance(
      victim({ defense: { ...victim().defense, counters: ["job"] } }),
      tags,
    );
    expect(successChance(victim(), tags)).toBeCloseTo(
      Math.max(MIN_CHANCE, plain * COUNTERED),
    );
  });

  test("always clamped", () => {
    for (const v of generateVictims(seeded(4), 50))
      for (const tags of [[], ["bank"], ["greed", "urgency"]] as const) {
        const p = successChance(v, tags);
        expect(p).toBeGreaterThanOrEqual(MIN_CHANCE);
        expect(p).toBeLessThanOrEqual(MAX_CHANCE);
      }
  });
});

describe("attempt", () => {
  test("win and loss follow the roll", () => {
    expect(attempt(() => 0, victim(), ["bank"]).success).toBe(true);
    expect(attempt(() => 0.99, victim(), ["bank"]).success).toBe(false);
  });

  test("a loss shows the tell when the scam ran into it", () => {
    const r = attempt(() => 0.99, victim(), ["lonely"]);
    expect(r.success || r.defense.id).toBe("video-call");
  });

  test("otherwise a loss shows a habit that guards a pulled tag", () => {
    const r = attempt(seeded(1), victim(), ["parcel"]);
    if (r.success) throw new Error("expected loss");
    expect(r.defense.counters).toContain("parcel");
  });

  test("victims win sometimes, even fitting ones", () => {
    const rng = seeded(77);
    const vs = generateVictims(rng, 200);
    const wins = vs.filter(
      (v) => attempt(rng, v, v.weaknesses.slice(0, 2)).success,
    );
    expect(wins.length).toBeGreaterThan(40);
    expect(wins.length).toBeLessThan(180);
  });
});

describe("fitLabel", () => {
  test("buckets odds without exposing them", () => {
    expect(fitLabel(MAX_CHANCE)).toBe("good fit");
    expect(fitLabel(0.5)).toBe("good fit");
    expect(fitLabel(0.49)).toBe("maybe");
    expect(fitLabel(0.25)).toBe("maybe");
    expect(fitLabel(0.24)).toBe("long shot");
    expect(fitLabel(MIN_CHANCE)).toBe("long shot");
  });
});
