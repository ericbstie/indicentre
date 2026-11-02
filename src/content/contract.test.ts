// Data contract for everything the player reads. Shapes are the compiler's
// job; this checks the rules a type can't express (docs/consistency.md,
// CONTRIBUTING.md "Content tone").
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { scams } from "../scams/registry.ts";
import { tools } from "../shop/tools.ts";
import { ANGLES } from "../victims/angles.ts";
import * as victimTables from "../victims/tables.ts";
import { FRAGMENTS } from "../victims/fragments.ts";
import { TAGS } from "../victims/types.ts";
import { bossLines } from "./boss.ts";
import { coworkers } from "./coworkers.ts";
import { welcomeMail } from "./mail.ts";
import * as news from "./news.ts";
import { beats, endings } from "./story.ts";
import { voices } from "./voices.ts";

/** Every string reachable from a value. */
const strings = (v: unknown): string[] =>
  typeof v === "string"
    ? [v]
    : v && typeof v === "object"
      ? Object.values(v).flatMap(strings)
      : [];

const CONTENT = {
  scams,
  tools,
  victimTables,
  FRAGMENTS,
  ANGLES,
  bossLines,
  coworkers,
  beats,
  endings,
  welcomeMail,
  news,
};

// Real companies, products and payment rails that tend to sneak into scam
// text. Use the made-up ones in docs/consistency.md instead.
const BRANDS =
  /\b(PayPal|Amazon|Apple|iPhone|Microsoft|Windows|Google|Gmail|Facebook|Instagram|WhatsApp|TikTok|Tinder|Netflix|Spotify|DHL|FedEx|UPS|Posten|Vipps|DNB|Nordea|Visa|Mastercard|eBay|Bitcoin|TeamViewer|AnyDesk|Western Union|Norton|McAfee)\b/;

describe("content contract", () => {
  for (const [name, value] of Object.entries(CONTENT))
    test(`${name}: no real brand names`, () => {
      expect(strings(value).filter((s) => BRANDS.test(s))).toEqual([]);
    });

  // Voice guide: no "X, Y and Z" lists; they read as machine-written.
  test("no triads", () => {
    const triad = /\b[\w'-]+, [\w'-]+,? and [\w'-]+/;
    const all = Object.values(CONTENT).flatMap(strings);
    expect(all.filter((s) => triad.test(s))).toEqual([]);
  });

  // `{name}` is always the victim's first name; text that nobody fills
  // must not have slots. Seen: `{first}` in fragments next to `{name}` in scams.
  test("text only uses the slots its filler provides", () => {
    const filled: Record<string, ReadonlyArray<string>> = {
      scams: ["name"],
      FRAGMENTS: ["name"],
      news: ["place", "role", "name", "age", "amount", "scam"],
      beats: ["nick", "quota", "earned"],
      endings: ["nick", "quota", "earned"],
    };
    const bad = Object.entries(CONTENT).flatMap(([group, value]) =>
      strings(value).filter((s) =>
        [...s.matchAll(/\{(\w+)\}/g)].some(
          (m) => !(filled[group] ?? []).includes(m[1]!),
        ),
      ),
    );
    expect(bad).toEqual([]);
  });

  test("ids are unique within each table", () => {
    const tables = {
      scams,
      tools,
      coworkers,
      defenses: victimTables.DEFENSES,
    };
    for (const [name, rows] of Object.entries(tables)) {
      const ids = rows.map((r) => r.id);
      expect({
        name,
        dupes: ids.filter((id, i) => ids.indexOf(id) !== i),
      }).toEqual({ name, dupes: [] });
    }
  });

  test("every tag a scam or defense names is a victim tag", () => {
    const used = [
      ...scams.flatMap((s) => s.fitTags),
      ...victimTables.DEFENSES.flatMap((d) => d.counters),
    ];
    expect(
      used.filter((t) => !(TAGS as ReadonlyArray<string>).includes(t)),
    ).toEqual([]);
  });

  // Lines are said in turn, so a one-line pool repeats every time.
  test("every boss reaction has 2+ lines for both moods", () => {
    for (const lines of Object.values(bossLines)) {
      expect(lines.low.length).toBeGreaterThan(1);
      expect(lines.high.length).toBeGreaterThan(1);
    }
  });

  test("tuned voices belong to someone who speaks", () => {
    const speakers = [...coworkers.map((c) => c.name), "Boss"];
    expect(Object.keys(voices).filter((n) => !speakers.includes(n))).toEqual(
      [],
    );
  });

  // Eric 2026-11-02: no generic feedback after a pitch. Seen: a result card
  // with the victim's defense line on a loss, and a beat promising that
  // "after every send it shows what they should have spotted". The
  // catfisher File's red flags are a separate EXTRA, not a pitch result.
  test("no post-pitch debrief text", () => {
    const debrief =
      /red flags?|should have spotted|could have spotted|did right|odds were|after every (send|pitch)/i;
    const resultCard = readFileSync("src/apps/leads.ts", "utf8");
    const all = [...Object.values(CONTENT).flatMap(strings), resultCard];
    expect(all.filter((s) => debrief.test(s))).toEqual([]);
  });

  test("no stray whitespace around text", () => {
    const all = Object.values(CONTENT).flatMap(strings);
    expect(all.filter((s) => s !== s.trim())).toEqual([]);
  });
});
