import { expect, test } from "bun:test";
import { voiceFor } from "../audio/babble.ts";
import { coworkers } from "./coworkers.ts";
import { voices } from "./voices.ts";

test("every coworker and the boss sound different", () => {
  const names = [...coworkers.map((c) => c.name), "Boss"];
  const pitches = names.map((n) => ({ ...voiceFor(n), ...voices[n] }).pitch);
  const sorted = [...pitches].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++)
    expect(sorted[i]! - sorted[i - 1]!).toBeGreaterThan(30);
});
