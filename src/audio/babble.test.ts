import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { MAX_SECONDS, plan, voiceFor } from "./babble.ts";

describe("voiceFor", () => {
  test("same name, same voice; different names differ", () => {
    expect(voiceFor("Priya")).toEqual(voiceFor("Priya"));
    expect(voiceFor("Priya")).not.toEqual(voiceFor("Rohan"));
  });
});

describe("plan", () => {
  const voice = voiceFor("Test");
  const go = (text: string) => plan(text, voice, seeded(1));

  test("longer lines babble longer", () => {
    expect(go("Hi there, friend.").length).toBeLessThan(
      go("Hi there, friend. The pension office called about your account.")
        .length,
    );
  });

  test("syllables are in order and never overlap", () => {
    const s = go("Ask for 2.99, not 200. A small fee doesn't feel like money.");
    for (let i = 1; i < s.length; i++)
      expect(s[i]!.at).toBeGreaterThanOrEqual(s[i - 1]!.at + s[i - 1]!.dur);
  });

  test("long lines are capped", () => {
    const s = go("blah ".repeat(200));
    const last = s.at(-1)!;
    expect(last.at + last.dur).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test("questions end higher", () => {
    const q = plan("Really?", voice, seeded(3)).at(-1)!;
    const s = plan("Really.", voice, seeded(3)).at(-1)!;
    expect(q.freq).toBeGreaterThan(s.freq);
  });

  test("nothing to say, no sound", () => {
    expect(go("... —")).toEqual([]);
  });
});
