import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { beats as arc } from "../content/story.ts";
import {
  type Beat,
  chose,
  dueBeats,
  fill,
  sawBeat,
  shopSells,
  story,
} from "./story.ts";

const beat = (id: string, day: number, on: Beat["on"]): Beat => ({
  id,
  day,
  on,
  lines: [{ speaker: "Boss", line: id }],
});

describe("dueBeats", () => {
  const beats = [beat("a", 1, "pc"), beat("b", 1, "pc"), beat("c", 2, "pc")];
  test("matches day and trigger, in data order", () => {
    const s = initialState();
    expect(dueBeats(beats, s, 1, "pc").map((b) => b.id)).toEqual(["a", "b"]);
    expect(dueBeats(beats, s, 1, "scam")).toEqual([]);
  });
  test("a seen beat never plays again", () => {
    const s = reduce(initialState(), sawBeat("a"));
    expect(dueBeats(beats, s, 1, "pc").map((b) => b.id)).toEqual(["b"]);
  });
});

test("fill replaces known keys only", () => {
  expect(
    fill("Hi {nick}, {quota} to go {x}", { nick: "Tiger", quota: "60" }),
  ).toBe("Hi Tiger, 60 to go {x}");
});

test("seen beats are recorded once; choices are remembered", () => {
  const s1 = reduce(initialState(), sawBeat("d0"));
  expect(reduce(s1, sawBeat("d0"))).toBe(s1);
  expect(story.get(s1).seen).toEqual(["d0"]);
  const s2 = reduce(s1, chose("nick", "Tiger"));
  expect(story.get(s2).choices["nick"]).toBe("Tiger");
});

describe("scam schedule", () => {
  const sched: ReadonlyArray<Beat> = [
    { ...beat("d1", 1, "dayStart"), introduces: "phishing", free: true },
    { ...beat("d3", 3, "dayStart"), introduces: "marketplace" },
  ];
  test("the Shop sells a scam from its day on, never a free one", () => {
    expect(shopSells(sched, "marketplace", 2)).toBe(false);
    expect(shopSells(sched, "marketplace", 3)).toBe(true);
    expect(shopSells(sched, "phishing", 5)).toBe(false);
    expect(shopSells(sched, "lottery", 9)).toBe(false);
  });

  test("beat ids are unique", () => {
    expect(new Set(arc.map((b) => b.id)).size).toBe(arc.length);
  });
});
