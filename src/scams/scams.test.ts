import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { initialState, reduce } from "../core/state.ts";
import { phishing } from "./phishing.ts";
import { scams, starterScams } from "./registry.ts";
import {
  MAX_CHANCE,
  MIN_CHANCE,
  personalize,
  resolveScam,
  successChance,
} from "./resolve.ts";
import { generateTargets } from "./targets.ts";
import type { Target } from "./types.ts";

const target = (over: Partial<Target> = {}): Target => ({
  id: "x",
  name: "Kari Nordby",
  age: 70,
  archetype: "Retiree",
  notes: [],
  susceptibility: { authority: 1, urgency: 1, greed: 0, curiosity: 0 },
  savvy: 0,
  wealth: 1,
  ...over,
});

const template = (id: string) => phishing.templates.find((t) => t.id === id)!;

describe("scam data", () => {
  test("ids are unique and every scam is well formed", () => {
    expect(new Set(scams.map((s) => s.id)).size).toBe(scams.length);
    for (const s of scams) {
      expect(s.templates.length).toBeGreaterThan(0);
      expect(s.lesson.length).toBeGreaterThan(0);
      for (const t of s.templates) expect(t.redFlags.length).toBeGreaterThan(0);
    }
  });

  test("phishing is a starter scam", () => {
    expect(starterScams).toContain("phishing");
  });
});

describe("targets", () => {
  test("generation is deterministic per seed", () => {
    expect(generateTargets(seeded(42), 3)).toEqual(
      generateTargets(seeded(42), 3),
    );
    expect(generateTargets(seeded(1), 3)).not.toEqual(
      generateTargets(seeded(2), 3),
    );
  });
});

describe("resolution", () => {
  test("matching lures beat mismatched ones; savvy lowers chance", () => {
    const t = target();
    const fit = successChance(t, template("account-locked"));
    expect(fit).toBeGreaterThan(successChance(t, template("prize")));
    expect(
      successChance(target({ savvy: 1 }), template("account-locked")),
    ).toBeLessThan(fit);
  });

  test("chance is clamped", () => {
    for (const t of phishing.templates) {
      const p = successChance(target({ savvy: 1 }), t);
      expect(p).toBeGreaterThanOrEqual(MIN_CHANCE);
      expect(p).toBeLessThanOrEqual(MAX_CHANCE);
    }
  });

  test("outcome actions apply payout and heat through the reducer", () => {
    const t = target({ wealth: 2 });
    const win = resolveScam(() => 0, phishing, t, template("account-locked"));
    const lose = resolveScam(
      () => 0.99,
      phishing,
      t,
      template("account-locked"),
    );
    const apply = (o: typeof win) => o.actions.reduce(reduce, initialState());
    expect(win.success).toBe(true);
    expect(apply(win).scamBucks).toBe(phishing.payout * 2);
    expect(apply(win).shutdownMeter).toBe(phishing.heat.success);
    expect(lose.success).toBe(false);
    expect(apply(lose).scamBucks).toBe(0);
    expect(apply(lose).shutdownMeter).toBe(phishing.heat.fail);
    expect(apply(lose).minute).toBe(phishing.minutes);
  });

  test("personalize uses the first name", () => {
    expect(personalize("Hi {name}!", target())).toBe("Hi Kari!");
  });
});
