import { expect, test } from "bun:test";
import {
  BIG_WIN,
  BOSS_MOOD_MAX,
  bossMood,
  changeMood,
  FAIL_STREAK,
  MOOD,
  moodPool,
  quotaResult,
  scamMood,
  SMASH_FACTOR,
  WATCH_BELOW,
} from "./boss.ts";
import { initialState, reduce } from "./state.ts";

test("quota result bands", () => {
  const quota = 60;
  expect(quotaResult({ earned: quota - 1, quota })).toBe("missed");
  expect(quotaResult({ earned: quota, quota })).toBe("met");
  expect(quotaResult({ earned: quota * SMASH_FACTOR, quota })).toBe("smashed");
});

test("scam mood: big wins count more, the streak penalty lands once", () => {
  expect(scamMood(true, BIG_WIN - 1, 0)).toBe(MOOD.success);
  expect(scamMood(true, BIG_WIN, 0)).toBe(MOOD.bigWin);
  expect(scamMood(false, 0, 1)).toBe(MOOD.fail);
  expect(scamMood(false, 0, FAIL_STREAK)).toBe(MOOD.fail + MOOD.failStreak);
  expect(scamMood(false, 0, FAIL_STREAK + 1)).toBe(MOOD.fail);
});

test("boss mood is clamped to 0..max", () => {
  const s0 = initialState();
  expect(bossMood.get(reduce(s0, changeMood(-500)))).toBe(0);
  expect(bossMood.get(reduce(s0, changeMood(500)))).toBe(BOSS_MOOD_MAX);
});

test("mood pool flips at the watch threshold", () => {
  expect(moodPool(WATCH_BELOW - 1)).toBe("low");
  expect(moodPool(WATCH_BELOW)).toBe("high");
});
