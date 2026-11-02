import { expect, test } from "bun:test";
import {
  BIG_WIN,
  DAILY_QUOTA,
  FAIL_STREAK,
  MOOD,
  quotaResult,
  scamMood,
  SMASH_FACTOR,
} from "./boss.ts";
import { BOSS_MOOD_MAX, initialState, reduce } from "./state.ts";

test("quota result bands", () => {
  expect(quotaResult(DAILY_QUOTA - 1)).toBe("missed");
  expect(quotaResult(DAILY_QUOTA)).toBe("met");
  expect(quotaResult(DAILY_QUOTA * SMASH_FACTOR)).toBe("smashed");
});

test("scam mood: big wins count more, the streak penalty lands once", () => {
  expect(scamMood(true, BIG_WIN - 1, 0)).toBe(MOOD.success);
  expect(scamMood(true, BIG_WIN, 0)).toBe(MOOD.bigWin);
  expect(scamMood(false, 0, 1)).toBe(MOOD.fail);
  expect(scamMood(false, 0, FAIL_STREAK)).toBe(MOOD.fail + MOOD.failStreak);
  expect(scamMood(false, 0, FAIL_STREAK + 1)).toBe(MOOD.fail);
});

test("bossMood action is clamped to 0..max", () => {
  const s0 = initialState();
  expect(reduce(s0, { type: "bossMood", amount: -500 }).bossMood).toBe(0);
  expect(reduce(s0, { type: "bossMood", amount: 500 }).bossMood).toBe(
    BOSS_MOOD_MAX,
  );
});
