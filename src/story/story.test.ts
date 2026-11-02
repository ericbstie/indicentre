import { describe, expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { beats as arc } from "../content/story.ts";
import { scams } from "../scams/registry.ts";
import {
  type Beat,
  chose,
  dueBeats,
  sawBeat,
  addPaid,
  shopSells,
  story,
  storyVars,
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

  const intros = arc.flatMap((b) => (b.introduces ? [b] : []));

  // A scam with no intro beat never reaches the Shop. Reserved slot names
  // ("parcel", "bank") once silently pointed at no scam at all.
  test("every registered scam has a day in the arc", () => {
    const days = intros.map((b) => `day ${b.day}: ${b.introduces}`);
    const missing = scams
      .filter((s) => !intros.some((b) => b.introduces === s.id))
      .map(
        (s) =>
          `${s.id}: add \`introduces: "${s.id}"\` to a dayStart beat in src/content/story.ts (taken: ${days.join(", ")})`,
      );
    expect(missing).toEqual([]);
  });

  test("the arc introduces only registered scams, once each", () => {
    // Day 8's scam is in PR #27; delete this entry when it lands.
    const pending = ["account-takeover"];
    const ids = new Set([...scams.map((s) => s.id), ...pending]);
    const unknown = intros
      .filter((b) => !ids.has(b.introduces!))
      .map((b) => `${b.id} introduces unknown scam "${b.introduces}"`);
    expect(unknown).toEqual([]);
    const named = intros.map((b) => b.introduces);
    expect(new Set(named).size).toBe(named.length);
  });

  test("beat ids are unique", () => {
    expect(new Set(arc.map((b) => b.id)).size).toBe(arc.length);
  });
});

test("the ending names the last people who paid, newest first", () => {
  const s = ["Arne", "Kari", "Lise", "Gunnar"].reduce(
    (st, name, i) => reduce(st, addPaid({ name, age: 60 + i, bucks: 50 })),
    initialState(),
  );
  expect(storyVars(s).last).toBe("Gunnar");
  expect(storyVars(s).victims).toBe("Gunnar, 63. Lise, 62. Kari, 61.");
});
