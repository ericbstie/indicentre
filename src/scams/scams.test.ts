import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import type { Victim } from "../victims/types.ts";
import phishing from "./phishing.ts";
import { availableScams, scams, starterScams } from "./registry.ts";
import { fitTags, personalize, resolveScam } from "./resolve.ts";

const victim = (over: Partial<Victim> = {}): Victim => ({
  id: "x",
  name: "Kari Nordby",
  age: 70,
  occupation: "Retired teacher",
  techComfort: 0.1,
  trust: 0.8,
  wealth: 1,
  weaknesses: ["authority", "urgency"],
  detail: { text: "Same bank for 41 years.", tag: "authority" },
  defense: { id: "d", behavior: "b", line: "l", counters: ["job"] },
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

  test("each scam lives in src/scams/<id>.ts", async () => {
    for (const s of scams)
      expect(await Bun.file(`src/scams/${s.id}.ts`).exists()).toBe(true);
  });

  test("phishing is a starter scam", () => {
    expect(starterScams).toContain("phishing");
  });

  test("locked scams are not available", () => {
    expect(availableScams(initialState())).toEqual([]);
    expect(availableScams(initialState(["phishing"]))).toEqual([phishing]);
  });
});

describe("resolution", () => {
  test("fitTags are the template's lures", () => {
    expect(fitTags(template("account-locked"))).toEqual([
      "authority",
      "urgency",
    ]);
  });

  test("outcome actions apply payout and heat through the reducer", () => {
    const t = victim({ wealth: 2 });
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
    expect(personalize("Hi {name}!", victim())).toBe("Hi Kari!");
  });
});
