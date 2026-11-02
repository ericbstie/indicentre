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
import { upgrades } from "../workplace/upgrades.ts";
import { CALL_BACK } from "./lessons.ts";
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
  upgrades,
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

  // Slop rules (research/avoiding-slop.md). Scam mail bodies and the chat
  // personas imitate how scammers write, so the voice rules skip them.
  const CHAT = ["Angel ♥", "Sam ♥"];
  const voiced = {
    ...CONTENT,
    scams: scams.map((s) => s.successLines),
    beats: beats.map((b) => ({
      ...b,
      lines: b.lines.filter((l) => !CHAT.includes(l.speaker)),
    })),
    welcomeMail: welcomeMail.subject,
  };
  // Grouped by the array each string sits in: one pool of lines.
  const pools = (v: unknown, pool: unknown = v): [unknown, string][] =>
    typeof v === "string"
      ? [[pool, v]]
      : v && typeof v === "object"
        ? Object.values(v).flatMap((x) => pools(x, Array.isArray(v) ? v : pool))
        : [];
  const sentences = (s: string) =>
    s.replace(/["“”]/g, "").split(/(?<=[.!?])\s+(?=[A-Z{'])/);
  const closer = (s: string) => sentences(s).at(-1)!;

  // Seen: "Double quota. Fine. I was wrong about you. Once." and 67 more.
  // A one-sentence line ("Thanks.") is a reply, not a tag.
  test("few lines end on a tag of three words or fewer", () => {
    const multi = pools(voiced).filter(([, s]) => sentences(s).length > 1);
    const tagged = multi.filter(([, s]) => closer(s).split(/\s+/).length <= 3);
    const perPool = new Map<unknown, string[]>();
    for (const [p, s] of tagged) perPool.set(p, [...(perPool.get(p) ?? []), s]);
    expect([...perPool.values()].filter((l) => l.length > 1)).toEqual([]);
    expect(tagged.length).toBeLessThanOrEqual(multi.length * 0.1);
  });

  // Seen: "So. Bye." from four different speakers. CALL_BACK repeats on purpose.
  test("no two lines share a closing sentence", () => {
    const lines = [...new Set(Object.values(voiced).flatMap(strings))];
    const seen = new Map<string, string>();
    const dupes = lines.flatMap((s) => {
      const c = closer(s);
      if (sentences(s).length < 2 || c === CALL_BACK) return [];
      const first = seen.get(c);
      seen.set(c, s);
      return first ? [[first, s]] : [];
    });
    expect(dupes).toEqual([]);
  });

  // Seen: "Welcome to the team!!" and the boss's "Ahaha".
  test("no double bangs or typed laughter outside scam texts and chats", () => {
    const loud = /!!|\b(a?ha){2,}\b/i;
    const all = Object.values(voiced).flatMap(strings);
    expect(all.filter((s) => loud.test(s))).toEqual([]);
  });

  // Seen: "...a parcel she never ordered" on the TV.
  test("news never gives a victim a pronoun", () => {
    const pronoun = /\b(she|he|her|his|him)\b/i;
    const tv = beats.flatMap((b) =>
      b.lines.filter((l) => l.speaker === "TV").map((l) => l.line),
    );
    const headlines = [
      ...news.VICTIM_HEADLINES,
      ...news.SPOTTED_HEADLINES,
      ...news.AMBIENT.map((a) => a.headline),
      ...tv,
    ];
    expect(headlines.filter((s) => pronoun.test(s))).toEqual([]);
  });

  // Seen: "Survey: one in three has clicked a link they regretted".
  test("headlines name a source", () => {
    expect(
      news.AMBIENT.map((a) => a.headline).filter((h) =>
        /^(Study|Survey|Report):/.test(h),
      ),
    ).toEqual([]);
  });

  // Seen: BankCo, ParcelPost, TrendStore, "Reginald P. Fortune, Esq.".
  test("no placeholder or joke names", () => {
    const placeholder = /\b[A-Z][a-z]+Co\b|\bEsq\.|ParcelPost|TrendStore/;
    const all = Object.values(CONTENT).flatMap(strings);
    expect(all.filter((s) => placeholder.test(s))).toEqual([]);
  });

  // Seen: the call-back lesson in four wordings across beats and the Shop.
  test("every call-back lesson uses CALL_BACK", () => {
    const lessons = [
      ...beats.map((b) => b.learn),
      ...tools.map((t) => t.lesson),
      ...upgrades.map((u) => u.lesson),
    ].filter((l): l is string => !!l);
    expect(
      lessons.filter(
        (l) => /\b(call|ring)\b.*\bnumber\b/i.test(l) && !l.includes(CALL_BACK),
      ),
    ).toEqual([]);
  });

  test("no stray whitespace around text", () => {
    const all = Object.values(CONTENT).flatMap(strings);
    expect(all.filter((s) => s !== s.trim())).toEqual([]);
  });
});
