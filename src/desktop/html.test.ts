import { expect, test } from "bun:test";
import { tagList } from "./html.ts";

test("tagList escapes each tag into a .tag chip", () => {
  expect(tagList(["greed", "<b>"])).toBe(
    `<span class="tags"><span class="tag">greed</span><span class="tag">&lt;b&gt;</span></span>`,
  );
});
