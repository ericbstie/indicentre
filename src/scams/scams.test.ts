import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { TAGS, type Victim } from "../victims/types.ts";
import phishing from "./phishing.ts";
import { availableScams, scams, starterScams } from "./registry.ts";
import { personalize, pulls, resolveScam } from "./resolve.ts";
import { CHANNELS } from "./types.ts";

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
  test("ids are unique", () => {
    expect(new Set(scams.map((s) => s.id)).size).toBe(scams.length);
  });

  for (const s of scams) {
    test(`${s.id} is well formed`, () => {
      expect(CHANNELS).toContain(s.channel);
      expect(s.minutes).toBeGreaterThan(0);
      expect(s.payout).toBeGreaterThan(0);
      expect(s.heat.fail).toBeGreaterThan(s.heat.success);
      expect(s.fitTags.length).toBeGreaterThan(0);
      for (const tag of s.fitTags) expect(TAGS).toContain(tag);
      expect(s.whatToSpot).toHaveLength(3);
      for (const line of [...s.whatToSpot, s.successLine])
        expect(line.trim().length).toBeGreaterThan(0);
      expect(s.templates.length).toBeGreaterThan(0);
      const steps = [...(s.warmups ?? []), ...s.templates];
      expect(new Set(steps.map((t) => t.id)).size).toBe(steps.length);
      for (const t of steps) {
        expect(t.redFlags.length).toBeGreaterThan(0);
        expect(Object.keys(t.lures).length).toBeGreaterThan(0);
      }
    });
  }

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
  test("a template pulls the scam's fitTags plus its own lures", () => {
    expect(pulls(phishing, template("account-locked"))).toEqual([
      "parcel",
      "bank",
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
