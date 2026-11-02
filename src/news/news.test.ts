import { expect, test } from "bun:test";
import type { EventOf } from "../core/events.ts";
import { seeded } from "../core/rng.ts";
import { fill, kroner, profileLine, storyFor, victimStory } from "./news.ts";

const event: EventOf<"ScamResolved"> = {
  type: "ScamResolved",
  scam: "phishing",
  target: "t0",
  success: true,
  bucks: 64,
  heat: 2,
  victim: {
    name: "Gunnar Dahl",
    age: 74,
    occupation: "Retired ferry engineer",
    detail: "Plays bridge on Thursdays.",
    defense: {
      behavior: "Called the bank on the number printed on the card instead.",
      line: "I'll ring the number on my card and ask them myself.",
    },
  },
};

test("kroner rounds to the nearest hundred with separators", () => {
  expect(kroner(64)).toBe("41,600");
  expect(kroner(0)).toBe("0");
});

test("fill replaces known slots, leaves unknown ones, capitalizes", () => {
  expect(fill("{a} and {b}", { a: "x" })).toBe("X and {b}");
});

test("profile line uses the victim's concrete detail", () => {
  expect(profileLine(event.victim)).toBe(
    "Gunnar, 74. Plays bridge on Thursdays.",
  );
});

test("victim story is deterministic and fully filled", () => {
  const a = victimStory(seeded(1), event);
  expect(victimStory(seeded(1), event)).toEqual(a);
  for (let s = 0; s < 50; s++) {
    const n = victimStory(seeded(s), event);
    expect(n.headline).not.toContain("{");
    expect(n.kind).toBe("victim");
    expect(n.tags).toContain("elderly");
  }
});

test("a failed scam becomes good news told with the victim's own defense", () => {
  const n = storyFor(seeded(4), { ...event, success: false, bucks: 0 });
  expect(n.kind).toBe("spotted");
  expect(n.profile).toBe(
    "Gunnar, 74. Called the bank on the number printed on the card instead.",
  );
  expect(n.quote).toBe(`"${event.victim.defense.line}"`);
  expect(n.headline).not.toContain("{");
});
