import { describe, expect, test } from "bun:test";
import { owns } from "../core/economy.ts";
import { initialState, reduce } from "../core/state.ts";

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
