import { expect, test } from "bun:test";
import { endDay } from "../core/economy.ts";
import { initialState, reduce } from "../core/state.ts";
import { freshness, markLanded } from "./wear.ts";

const win = (s = initialState(), scam = "phishing") =>
  reduce(s, markLanded(s, scam));

test("the first two wins pay in full, then each pays 70% of the last", () => {
  const one = win();
  const two = win(one);
  const three = win(two);
  expect(freshness(one, "phishing")).toBe(1);
  expect(freshness(two, "phishing")).toBeCloseTo(0.7);
  expect(freshness(three, "phishing")).toBeCloseTo(0.49);
});

test("wear is per scam and resets the next day", () => {
  const s = win(win(win()));
  expect(freshness(s, "lottery")).toBe(1);
  expect(freshness(endDay(s), "phishing")).toBe(1);
  expect(freshness(win(endDay(s)), "phishing")).toBe(1);
});
