import { expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import {
  clues,
  cluesDue,
  FILE_COMPLETE,
  fileComplete,
  findClue,
  foundClues,
} from "./catfisher.ts";
import { coworkers } from "./coworkers.ts";

test("one clue a day, unique ids, coworkers that exist", () => {
  expect(clues.map((c) => c.day)).toEqual(clues.map((_, i) => i + 1));
  expect(new Set(clues.map((c) => c.id)).size).toBe(clues.length);
  for (const c of clues)
    if (c.via.kind === "coworker") {
      const id = c.via.coworker;
      expect(coworkers.some((w) => w.id === id)).toBe(true);
    }
  expect(clues.length).toBeGreaterThanOrEqual(FILE_COMPLETE);
});

test("due clues never repeat and missed ones wait for later days", () => {
  expect(cluesDue(1, []).map((c) => c.id)).toEqual(["no-video"]);
  expect(cluesDue(2, ["no-video"]).map((c) => c.id)).toEqual(["too-fast"]);
  expect(cluesDue(3, ["no-video"]).map((c) => c.id)).toEqual([
    "too-fast",
    "stock-photo",
  ]);
});

test("each clue is recorded once, in the order found", () => {
  const s1 = reduce(initialState(), findClue("a"));
  expect(reduce(s1, findClue("a"))).toBe(s1);
  expect(foundClues.get(reduce(s1, findClue("b")))).toEqual(["a", "b"]);
});

test("the file is complete at the threshold", () => {
  const found = (n: number) =>
    clues
      .slice(0, n)
      .reduce((s, c) => reduce(s, findClue(c.id)), initialState());
  expect(fileComplete(found(FILE_COMPLETE - 1))).toBe(false);
  expect(fileComplete(found(FILE_COMPLETE))).toBe(true);
});
