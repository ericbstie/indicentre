import { describe, expect, test } from "bun:test";
import { owns } from "../core/economy.ts";
import { initialState, reduce } from "../core/state.ts";
import phishing from "../scams/phishing.ts";
import { bonusFor, pulls, resolveScam } from "../scams/resolve.ts";
import techSupport from "../scams/tech-support.ts";
import type { ScamDef } from "../scams/types.ts";
import { NO_MODS } from "../shop/tools.ts";
import { successChance } from "../victims/resistance.ts";
import type { Victim } from "../victims/types.ts";
import { callOddsModifier, DESK_CALL_BONUS, type DeskTier } from "./slice.ts";

const rich = reduce(initialState(), { type: "earn", amount: 1000 });
const buy = (s: typeof rich, id: string, price: number, tier?: 1 | 2) =>
  reduce(s, {
    type: "buy",
    item: tier
      ? { kind: "upgrade", id, price, tier }
      : { kind: "upgrade", id, price },
  });

describe("workplace purchases", () => {
  test("a cosmetic is owned once and leaves the desk tier alone", () => {
    const s = buy(rich, "plant", 40);
    expect(s.scamBucks).toBe(960);
    expect(s.workplace).toEqual({ owned: ["plant"], deskTier: 0 });
    expect(buy(s, "plant", 40)).toBe(s);
  });

  test("a desk raises the tier; a lower desk then counts as owned", () => {
    const s = buy(rich, "desk-2", 350, 2);
    expect(s.workplace.deskTier).toBe(2);
    expect(owns(s, { kind: "upgrade", id: "desk-1", tier: 1 })).toBe(true);
    expect(buy(s, "desk-1", 150, 1)).toBe(s);
  });

  test("unaffordable upgrades do nothing; spending keeps the quota", () => {
    const broke = initialState();
    expect(buy(broke, "desk-1", 150, 1)).toBe(broke);
    expect(buy(rich, "desk-1", 150, 1).earnedToday).toBe(1000);
  });
});

describe("call odds", () => {
  const v: Victim = {
    id: "x",
    name: "Kari Nordby",
    age: 70,
    occupation: "Retired teacher",
    techComfort: 0.4,
    trust: 0.5,
    wealth: 1,
    weaknesses: ["tech-help"],
    detail: { text: "Printer has been broken since May.", tag: "tech-help" },
    defense: { id: "d", behavior: "b", line: "l", counters: ["job"] },
  };
  const mods = (tier: DeskTier) => ({
    ...NO_MODS,
    callBonus: callOddsModifier({ owned: [], deskTier: tier }),
  });
  const odds = (scam: ScamDef, tier: DeskTier) =>
    successChance(
      v,
      pulls(scam, scam.templates[0]!),
      bonusFor(scam, mods(tier)),
    );

  test("desk tiers 0/1/2 add 0/5/10 points to calls", () => {
    expect(techSupport.channel).toBe("call");
    expect(DESK_CALL_BONUS).toEqual({ 0: 0, 1: 0.05, 2: 0.1 });
    expect(odds(techSupport, 1)).toBeCloseTo(
      odds(techSupport, 0) + DESK_CALL_BONUS[1],
    );
    expect(odds(techSupport, 2)).toBeCloseTo(
      odds(techSupport, 0) + DESK_CALL_BONUS[2],
    );
  });

  test("the desk does nothing for mail scams", () => {
    expect(odds(phishing, 2)).toBe(odds(phishing, 0));
  });

  test("resolve rolls with the desk bonus", () => {
    const roll = 0.5 * (odds(techSupport, 0) + odds(techSupport, 2));
    const tpl = techSupport.templates[0]!;
    expect(resolveScam(() => roll, techSupport, v, tpl, mods(0)).success).toBe(
      false,
    );
    expect(resolveScam(() => roll, techSupport, v, tpl, mods(2)).success).toBe(
      true,
    );
  });
});
