import { expect, test } from "bun:test";
import { linesDialog } from "./lines.ts";

const ctx = { vars: () => ({}), remember: () => {} };

test("Esc steps a story scene one line, and never skips a choice", () => {
  const node = linesDialog(ctx, [
    { speaker: "A", line: "one" },
    { speaker: "A", line: "pick", choose: { key: "k", options: ["x", "y"] } },
  ]);
  expect(node.esc).toBe(node.choices![0]);
  const next = node.esc!.next;
  expect(typeof next === "function" && next().esc).toBeNull();
});
