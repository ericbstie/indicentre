import { describe, expect, test } from "bun:test";
import {
  FIRE_AFTER_MISSES,
  missStreak,
  OVERNIGHT_COOLDOWN,
  quotaFor,
  SHIFT_MINUTES,
  WIN_DAY,
} from "./economy.ts";
import { diffEvents } from "./events.ts";
import { type Action, clock, initialState, reduce } from "./state.ts";

const s0 = initialState(["phishing"]);
const run = (...as: Action[]) => as.reduce(reduce, s0);

describe("shift clock", () => {
  test("formats minutes since 09:00", () => {
    expect(clock(s0)).toBe("09:00");
    expect(clock(run({ type: "tick", minutes: 95 }))).toBe("10:35");
  });

  test("work past 17:00 ends the day and logs a DayEnded summary", () => {
    const s = run(
      { type: "heat", amount: 40 },
      { type: "earn", amount: 30 },
      { type: "tick", minutes: SHIFT_MINUTES - 10 },
      { type: "tick", minutes: 45 },
    );
    expect(s.day).toBe(2);
    expect(s.minute).toBe(0);
    expect(s.earnedToday).toBe(0);
    expect(s.shutdownMeter).toBe(40 - OVERNIGHT_COOLDOWN);
    expect(s.days.at(-1)).toEqual({
      day: 1,
      earned: 30,
      heatStart: 0,
      heatEnd: 40,
      quota: quotaFor(1),
      met: false,
      warned: true,
    });
  });

  test("one huge tick ends at most one day", () => {
    expect(run({ type: "tick", minutes: SHIFT_MINUTES * 3 }).day).toBe(2);
  });

  test("clocking out ends the shift early; heat never cools below 0", () => {
    const s = run({ type: "tick", minutes: 60 }, { type: "endDay" });
    expect(s.day).toBe(2);
    expect(s.shutdownMeter).toBe(0);
    expect(s.days).toHaveLength(1);
  });
});

describe("quota", () => {
  test("rises every day", () => {
    expect(quotaFor(2)).toBeGreaterThan(quotaFor(1));
    expect(quotaFor(10)).toBeGreaterThan(quotaFor(9));
  });

  test("met when the day's earnings reach it; misses streak until a hit", () => {
    const met = run({ type: "earn", amount: quotaFor(1) }, { type: "endDay" });
    expect(met.days.at(-1)?.met).toBe(true);
    expect(missStreak(met)).toBe(0);
    const warned = reduce(met, { type: "endDay" });
    expect(warned.days.at(-1)?.warned).toBe(true);
    expect(missStreak(warned)).toBe(0);
    const missed = reduce(warned, { type: "endDay" });
    expect(missed.days.at(-1)?.warned).toBe(false);
    expect(missStreak(missed)).toBe(1);
    const recovered = [
      { type: "earn", amount: quotaFor(4) } as const,
      { type: "endDay" } as const,
    ].reduce(reduce, missed);
    expect(missStreak(recovered)).toBe(0);
  });
});

describe("run end", () => {
  const meetQuota = (s: ReturnType<typeof run>) =>
    [
      { type: "earn", amount: quotaFor(s.day) } as const,
      { type: "endDay" } as const,
    ].reduce(reduce, s);

  test("the first missed quota is a written warning, not a strike", () => {
    const s = run({ type: "endDay" }, { type: "endDay" });
    expect(s.days.map((d) => d.warned)).toEqual([true, false]);
    expect(s.status).toBe("playing");
  });

  test(`after the warning, missing ${FIRE_AFTER_MISSES} days in a row gets you fired`, () => {
    const one = run({ type: "endDay" }, { type: "endDay" });
    expect(one.status).toBe("playing");
    const s = reduce(one, { type: "endDay" });
    expect(s.status).toBe("fired");
    expect(diffEvents(one, s)).toContainEqual({
      type: "RunEnded",
      status: "fired",
    });
    expect(reduce(s, { type: "earn", amount: 5 })).toBe(s);
  });

  test(`surviving to the end of day ${WIN_DAY} wins`, () => {
    let s = s0;
    while (s.status === "playing") s = meetQuota(s);
    expect(s.status).toBe("won");
    expect(s.days).toHaveLength(WIN_DAY);
  });
});
