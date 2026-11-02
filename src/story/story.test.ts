import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { type Beat, chose, dueBeats, fill, sawBeat, story } from "./story.ts";

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
