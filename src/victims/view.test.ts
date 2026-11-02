import { describe, expect, test } from "bun:test";
import { seeded } from "../core/rng.ts";
import { generateVictim } from "./generate.ts";
import { ageBand } from "./types.ts";
import { reveal } from "./view.ts";

const v = generateVictim(seeded(12), "v0");

describe("reveal", () => {
  test("level 0 hides every number and the tell", () => {
    const view = reveal(v, ["hint"], 0);
    expect(Object.keys(view).sort()).toEqual(
      ["ageBand", "hints", "id", "name", "occupation"].sort(),
    );
    expect(view.ageBand).toBe(ageBand(v.age));
  });

  test("each level adds fields", () => {
    expect(reveal(v, [], 1).weaknesses).toEqual(v.weaknesses);
    expect(reveal(v, [], 1).defense).toBeUndefined();
    expect(reveal(v, [], 2).defense).toBe(v.defense.behavior);
    expect(reveal(v, [], 2).wealth).toBe(v.wealth);
    expect(reveal(v, [], 1).recent).toBeUndefined();
    expect(reveal(v, [], 2).recent).toEqual(v.recent);
  });

  test("age bands", () => {
    expect(ageBand(19)).toBe("20s");
    expect(ageBand(44)).toBe("40s");
    expect(ageBand(93)).toBe("80s");
  });
});
