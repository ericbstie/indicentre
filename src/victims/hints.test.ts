import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { FRAGMENTS } from "./fragments.ts";
import { generateVictims } from "./generate.ts";
import { writeHints } from "./hints.ts";
import { DEFENSES, DETAILS, HOBBIES, RECENT_EVENTS } from "./tables.ts";
import { TAGS } from "./types.ts";

// From the voice guide: stock phrases that read as machine-written.
const BANNED =
  /\b(delve|seamless|navigate|journey|testament|not only|in today's|it's important to note)\b/i;
// Names don't tell us pronouns; keep content pronoun-free.
const PRONOUNS = /\b(he|she|him|her|his|hers)\b/i;

const all = [
  ...Object.values(FRAGMENTS).flat(),
  ...DETAILS.map((d) => d.text),
  ...DEFENSES.flatMap((d) => [d.behavior, ...d.lines]),
  ...[...HOBBIES, ...RECENT_EVENTS].flatMap((l) => [
    l.text,
    l.source,
    ...("hide" in l ? [l.hide] : []),
  ]),
];

describe("hint content", () => {
  test("60+ fragments, 5+ per tag", () => {
    expect(Object.values(FRAGMENTS).flat().length).toBeGreaterThanOrEqual(60);
    for (const t of TAGS) expect(FRAGMENTS[t].length).toBeGreaterThanOrEqual(5);
  });

  test("voice rules: no stock phrases, no gendered pronouns", () => {
    for (const s of all) {
      expect(s).not.toMatch(BANNED);
      expect(s).not.toMatch(PRONOUNS);
    }
  });
});

describe("writeHints", () => {
  const victims = generateVictims(seeded(9), 40);

  test("1-2 lines, detail first, name filled in", () => {
    for (const v of victims) {
      const h = writeHints(seeded(1), v);
      expect(h.length).toBeGreaterThanOrEqual(1);
      expect(h.length).toBeLessThanOrEqual(2);
      expect(h[0]).toBe(v.detail.text);
      for (const line of h) expect(line).not.toContain("{");
    }
  });

  test("deterministic per seed", () => {
    const v = victims[0]!;
    expect(writeHints(seeded(3), v)).toEqual(writeHints(seeded(3), v));
  });
});
