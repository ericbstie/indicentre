import { describe, expect, test } from "bun:test";
import { initialState, reduce, SHUTDOWN_MAX } from "./state.ts";

const s0 = initialState(["phishing"]);

describe("reduce", () => {
  test("earn adds bucks, ignores non-positive amounts", () => {
    expect(reduce(s0, { type: "earn", amount: 50 }).scamBucks).toBe(50);
    expect(reduce(s0, { type: "earn", amount: -5 })).toBe(s0);
  });

  test("heat is clamped and maxing it shuts the center down", () => {
    expect(reduce(s0, { type: "heat", amount: -10 }).shutdownMeter).toBe(0);
    const raided = reduce(s0, { type: "heat", amount: 250 });
    expect(raided.shutdownMeter).toBe(SHUTDOWN_MAX);
    expect(raided.status).toBe("shutdown");
    expect(reduce(raided, { type: "earn", amount: 10 })).toBe(raided);
  });
});
