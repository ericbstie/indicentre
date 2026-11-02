import { describe, expect, test } from "bun:test";
import { owns } from "../core/economy.ts";
import { initialState, reduce } from "../core/state.ts";
import phishing from "../scams/phishing.ts";
import { failHeat, pulls, resolveScam } from "../scams/resolve.ts";
import { successChance } from "../victims/resistance.ts";
import type { Victim } from "../victims/types.ts";
import { catalog } from "./catalog.ts";
import { modifiersFor, NO_MODS, tools } from "./tools.ts";

const rich = reduce(initialState(["phishing"]), { type: "earn", amount: 300 });
const tool = (id: string) => catalog.find((c) => c.id === id)!;

describe("catalog", () => {
  test("ids unique, prices positive, every tool teaches", () => {
    expect(new Set(catalog.map((c) => c.id)).size).toBe(catalog.length);
    for (const c of catalog) expect(c.price).toBeGreaterThan(0);
    for (const t of tools) expect(t.lesson.length).toBeGreaterThan(0);
  });
});

describe("buy", () => {
  test("pays the price and grants the item once", () => {
    const item = tool("persondata");
    const s = reduce(rich, { type: "buy", item });
    expect(s.scamBucks).toBe(300 - item.price);
    expect(owns(s, item)).toBe(true);
    expect(reduce(s, { type: "buy", item })).toBe(s);
  });

  test("unaffordable purchases do nothing", () => {
    const broke = initialState();
    expect(reduce(broke, { type: "buy", item: tool("spoofed-id") })).toBe(
      broke,
    );
  });

  test("buying a scam unlocks it; spending does not touch the quota", () => {
    const item = { kind: "scam", id: "lottery", price: 100 } as const;
    const s = reduce(rich, { type: "buy", item });
    expect(s.unlockedScams).toContain("lottery");
    expect(s.earnedToday).toBe(300);
  });
});

describe("tool effects", () => {
  const v: Victim = {
    id: "x",
    name: "Kari Nordby",
    age: 70,
    occupation: "Retired teacher",
    techComfort: 0.4,
    trust: 0.5,
    wealth: 1,
    weaknesses: ["authority"],
    detail: { text: "Same bank for 41 years.", tag: "authority" },
    defense: { id: "d", behavior: "b", line: "l", counters: ["job"] },
  };
  const tpl = phishing.templates[0]!;

  test("no tools means no modifiers", () => {
    expect(modifiersFor([])).toEqual(NO_MODS);
  });

  test("persondata reveals, fake website raises odds, spoofed ID halves fail heat", () => {
    const mods = modifiersFor(["fake-website", "spoofed-id", "persondata"]);
    expect(mods.reveal).toBe(2);
    expect(
      successChance(v, pulls(phishing, tpl), mods.chanceBonus),
    ).toBeCloseTo(successChance(v, pulls(phishing, tpl)) + 0.1);
    const fail = resolveScam(() => 0.99, phishing, v, tpl, mods);
    expect(fail.success).toBe(false);
    expect(fail.heat).toBe(failHeat(phishing, mods));
    expect(fail.heat).toBe(Math.round(phishing.heat.fail / 2));
  });
});
