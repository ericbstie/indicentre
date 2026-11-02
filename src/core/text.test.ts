import { expect, test } from "bun:test";
import { fill } from "./text.ts";

test("fill replaces known keys only", () => {
  expect(
    fill("Hi {nick}, {quota} to go {x}", { nick: "Tiger", quota: "60" }),
  ).toBe("Hi Tiger, 60 to go {x}");
});
