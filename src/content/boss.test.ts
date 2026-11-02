import { expect, test } from "bun:test";
import { quotaFor } from "../core/economy.ts";
import { bossLines, verdictLine, writtenWarning } from "./boss.ts";

const day = (earned: number) => ({
  day: 2,
  earned,
  heatStart: 0,
  heatEnd: 0,
  quota: quotaFor(2),
  met: earned >= quotaFor(2),
  warned: false,
});

test("the verdict comes from the pool for the day's result and his mood", () => {
  expect(bossLines.quotaMissed.low).toContain(verdictLine(day(0), 10));
  expect(bossLines.quotaMet.high).toContain(verdictLine(day(quotaFor(2)), 90));
  expect(bossLines.quotaSmashed.low).toContain(
    verdictLine(day(quotaFor(2) * 2), 10),
  );
});

test("the written warning quotes the day's numbers", () => {
  const w = writtenWarning(day(12));
  expect(w.lines[0]).toContain(`${quotaFor(2)} bucks, delivered 12`);
});
