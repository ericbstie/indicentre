// Data contract for everything the player reads. Shapes are the compiler's
// job; this checks the rules a type can't express (docs/consistency.md,
// CONTRIBUTING.md "Content tone").
import { describe, expect, test } from "bun:test";
import { scams } from "../scams/registry.ts";
import { tools } from "../shop/tools.ts";
import * as victimTables from "../victims/tables.ts";
import { FRAGMENTS } from "../victims/fragments.ts";
import { TAGS } from "../victims/types.ts";
import { bossLines } from "./boss.ts";
import { coworkers } from "./coworkers.ts";
import { endings } from "./endings.ts";
import { welcomeMail } from "./mail.ts";
import * as news from "./news.ts";
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
  bossLines,
  coworkers,
  endings,
  welcomeMail,
  news,
};

// Real companies, products and payment rails that tend to sneak into scam
// text. Use made-up names (BankCo, ParcelPost) instead.
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

  test("scam text only uses the {name} slot", () => {
    const bad = strings(scams).filter((s) =>
      [...s.matchAll(/\{(\w+)\}/g)].some((m) => m[1] !== "name"),
    );
    expect(bad).toEqual([]);
  });

  test("news banks only use the slots news.fill provides", () => {
    const slots = ["place", "role", "first", "age", "amount", "scam"];
    const bad = strings(news).filter((s) =>
      [...s.matchAll(/\{(\w+)\}/g)].some((m) => !slots.includes(m[1]!)),
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

  test("every boss reaction has lines for both moods", () => {
    for (const lines of Object.values(bossLines)) {
      expect(lines.low.length).toBeGreaterThan(0);
      expect(lines.high.length).toBeGreaterThan(0);
    }
  });

  test("tuned voices belong to someone who speaks", () => {
    const speakers = [...coworkers.map((c) => c.name), "Boss"];
    expect(Object.keys(voices).filter((n) => !speakers.includes(n))).toEqual(
      [],
    );
  });

  test("no stray whitespace around text", () => {
    const all = Object.values(CONTENT).flatMap(strings);
    expect(all.filter((s) => s !== s.trim())).toEqual([]);
  });
});
