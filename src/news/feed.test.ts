import { expect, test } from "bun:test";
import { AMBIENT } from "../content/news.ts";
import { seeded } from "../core/rng.ts";
import { createFeed } from "./feed.ts";
import type { NewsItem } from "./news.ts";

const item = (headline: string): NewsItem => ({
  headline,
  profile: "",
  quote: "",
  kind: "victim",
});

test("ambient bank has at least 20 items", () => {
  expect(AMBIENT.length).toBeGreaterThanOrEqual(20);
});

test("breaking news jumps the queue, then ambient resumes", () => {
  const feed = createFeed(seeded(3), AMBIENT);
  feed.next();
  feed.push(item("a"));
  feed.push(item("b"));
  expect(feed.next()?.headline).toBe("a");
  expect(feed.next()?.headline).toBe("b");
  expect(feed.next()?.kind).toBe("ambient");
});

test("ambient loop covers every item and never repeats back to back", () => {
  const feed = createFeed(seeded(9), AMBIENT);
  const seen: NewsItem[] = [];
  for (let i = 0; i < AMBIENT.length * 5; i++) seen.push(feed.next()!);
  expect(new Set(seen.slice(0, AMBIENT.length)).size).toBe(AMBIENT.length);
  for (let i = 1; i < seen.length; i++) expect(seen[i]).not.toBe(seen[i - 1]);
});

test("empty feed returns undefined", () => {
  expect(createFeed(seeded(1), []).next()).toBeUndefined();
});
