import { describe, expect, test } from "bun:test";
import {
  failsAt,
  hintsHeard,
  initialState,
  reduce,
  SHUTDOWN_MAX,
  unreadCount,
} from "./state.ts";

const s0 = initialState(["phishing"]);

describe("reduce", () => {
  test("earn adds bucks, ignores non-positive amounts", () => {
    expect(reduce(s0, { type: "earn", amount: 50 }).scamBucks).toBe(50);
    expect(reduce(s0, { type: "earn", amount: -5 })).toBe(s0);
  });

  test("spend only succeeds when affordable", () => {
    const rich = reduce(s0, { type: "earn", amount: 30 });
    expect(reduce(rich, { type: "spend", amount: 20 }).scamBucks).toBe(10);
    expect(reduce(rich, { type: "spend", amount: 40 })).toBe(rich);
  });

  test("heat is clamped and maxing it shuts the center down", () => {
    expect(reduce(s0, { type: "heat", amount: -10 }).shutdownMeter).toBe(0);
    const raided = reduce(s0, { type: "heat", amount: 250 });
    expect(raided.shutdownMeter).toBe(SHUTDOWN_MAX);
    expect(raided.status).toBe("shutdown");
    expect(reduce(raided, { type: "earn", amount: 10 })).toBe(raided);
  });

  test("unlock is idempotent", () => {
    expect(reduce(s0, { type: "unlock", scam: "phishing" })).toBe(s0);
    expect(
      reduce(s0, { type: "unlock", scam: "tech-support" }).unlockedScams,
    ).toEqual(["phishing", "tech-support"]);
  });
});

test("mail arrives newest first, unread, once per id; reading marks it", () => {
  const mail = { id: "m1", from: "Boss", subject: "Hi", body: "Work." };
  const s1 = reduce(s0, { type: "mail", mail });
  expect(reduce(s1, { type: "mail", mail })).toBe(s1);
  expect(unreadCount(s1)).toBe(1);
  const s2 = reduce(s1, { type: "readMail", id: "m1" });
  expect(unreadCount(s2)).toBe(0);
});

describe("scamFails", () => {
  test("counts failures per scam type", () => {
    const once = reduce(s0, { type: "scamFailed", scam: "phishing" });
    const twice = reduce(once, { type: "scamFailed", scam: "phishing" });
    expect(failsAt(twice, "phishing")).toBe(2);
    expect(failsAt(twice, "tech-support")).toBe(0);
  });
});

describe("talkedTo", () => {
  test("counts hints heard per coworker", () => {
    const s1 = reduce(s0, { type: "heardHint", coworker: "priya" });
    expect(hintsHeard(s1, "priya")).toBe(1);
    expect(hintsHeard(s1, "rohan")).toBe(0);
  });
});
