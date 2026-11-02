import { expect, test } from "bun:test";
import { wrapText } from "./screenText.ts";

const chars = (s: string) => s.length;

test("wrapText breaks on words within the width", () => {
  expect(wrapText("one two three four", 9, chars)).toEqual([
    "one two",
    "three",
    "four",
  ]);
});

test("wrapText keeps a long word on its own line", () => {
  expect(wrapText("a extraordinarily b", 5, chars)).toEqual([
    "a",
    "extraordinarily",
    "b",
  ]);
  expect(wrapText("   ", 5, chars)).toEqual([]);
});
