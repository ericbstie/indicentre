// Balance sim: plays many seeded runs with scripted players and prints win
// rates. Uses the real reducer, victims, scams and tools, so retuning a number
// in its data file shows up here.   bun run sim [runs]
import { type Rng, seeded } from "../src/core/rng.ts";
import { initialState, reduce, type GameState } from "../src/core/state.ts";
import {
  canBuy,
  quotaFor,
  SHIFT_MINUTES,
  WIN_DAY,
} from "../src/core/economy.ts";
import { beats } from "../src/content/story.ts";
import { shopSells } from "../src/story/story.ts";
import { scams } from "../src/scams/registry.ts";
import {
  failHeat,
  payout,
  pulls,
  resolveScam,
  resolveWarmup,
  warmed,
} from "../src/scams/resolve.ts";
import type { ScamDef, ScamTemplate } from "../src/scams/types.ts";
import { freshness, markLanded } from "../src/scams/wear.ts";
import { catalog, type CatalogItem } from "../src/shop/catalog.ts";
import { type Modifiers, modifiersFor } from "../src/shop/tools.ts";
import { generateVictims } from "../src/victims/generate.ts";
import { successChance } from "../src/victims/resistance.ts";
import type { Victim } from "../src/victims/types.ts";

interface Player {
  readonly name: string;
  /** Chance of taking the best option instead of a random one. Persondata
   * shows the odds, so it adds READ_ODDS. */
  readonly skill: number;
  /** Stop for the day before a report could push heat past this. */
  readonly heatCap: number;
  /** Lower cap once today's quota is met: bank the day. */
  readonly heatCapAfterQuota: number;
  readonly buys: (item: CatalogItem) => boolean;
  /** Pitches only this scam, whatever else is unlocked. */
  readonly only?: string;
}

const PLAYERS: ReadonlyArray<Player> = [
  {
    name: "careful+tools",
    skill: 0.6,
    heatCap: 70,
    heatCapAfterQuota: 35,
    buys: () => true,
  },
  {
    name: "careful no tools",
    skill: 0.6,
    heatCap: 70,
    heatCapAfterQuota: 35,
    buys: (i) => i.kind === "scam",
  },
  {
    name: "phishing only",
    skill: 0.6,
    heatCap: 70,
    heatCapAfterQuota: 35,
    buys: (i) => i.kind === "tool",
    only: "phishing",
  },
  {
    // Never reads the fit, never watches the meter, clocks out at quota.
    name: "sloppy",
    skill: 0,
    heatCap: Infinity,
    heatCapAfterQuota: 0,
    buys: () => true,
  },
  {
    name: "random",
    skill: 0,
    heatCap: 90,
    heatCapAfterQuota: 90,
    buys: () => true,
  },
];

/** Bucks a careful player trades for one point of heat. */
const HEAT_PRICE = 3;
const LEADS = 3;
const READ_ODDS = 0.3;

interface Option {
  readonly victim: Victim;
  readonly scam: ScamDef;
  readonly template: ScamTemplate;
  /** Chance the whole thing lands, warm-ups included. */
  readonly p: number;
  readonly score: number;
}

/** Odds a careful player reads off hints (or persondata). Warm-ups compound. */
const option = (
  s: GameState,
  victim: Victim,
  scam: ScamDef,
  template: ScamTemplate,
  m: Modifiers,
): Option => {
  let p = 1;
  let v = victim;
  for (const [i, w] of (scam.warmups ?? []).entries()) {
    p *= successChance(v, pulls(scam, w), m.chanceBonus);
    v = warmed(victim, scam, i + 1);
  }
  p *= successChance(v, pulls(scam, template), m.chanceBonus);
  const score =
    p * payout(scam, victim, freshness(s, scam.id)) -
    (1 - p) * failHeat(scam, m) * HEAT_PRICE;
  return { victim, scam, template, p, score };
};

const minutesFor = (s: ScamDef) => s.minutes * (1 + (s.warmups?.length ?? 0));

/** One attempt on a fresh batch of leads, as the Leads app plays it. */
const play = (rng: Rng, s: GameState, pl: Player): GameState => {
  const m = modifiersFor(s.ownedTools);
  const open = workable(s, pl);
  const opts = generateVictims(rng, LEADS).flatMap((v) =>
    open.flatMap((sc) => sc.templates.map((t) => option(s, v, sc, t, m))),
  );
  const o =
    rng() < pl.skill + (pl.skill && m.reveal >= 2 ? READ_ODDS : 0)
      ? opts.reduce((a, b) => (b.score > a.score ? b : a))
      : opts[Math.floor(rng() * opts.length)]!;
  let next = s;
  let landed = 0;
  for (const w of o.scam.warmups ?? []) {
    const out = resolveWarmup(
      rng,
      o.scam,
      warmed(o.victim, o.scam, landed),
      w,
      m,
    );
    for (const a of out.actions) next = reduce(next, a);
    if (!out.success) return next;
    landed++;
  }
  const out = resolveScam(
    rng,
    o.scam,
    warmed(o.victim, o.scam, landed),
    o.template,
    m,
    freshness(s, o.scam.id),
  );
  for (const a of out.actions) next = reduce(next, a);
  return out.success ? reduce(next, markLanded(next, o.scam.id)) : next;
};

/** Scams the player would pitch that still fit in today's shift. */
const workable = (s: GameState, pl: Player) =>
  scams.filter(
    (sc) =>
      s.unlockedScams.includes(sc.id) &&
      (pl.only === undefined || sc.id === pl.only) &&
      s.minute + minutesFor(sc) <= SHIFT_MINUTES,
  );

const worstFail = (s: GameState, pl: Player) => {
  const m = modifiersFor(s.ownedTools);
  return Math.max(0, ...workable(s, pl).map((sc) => failHeat(sc, m)));
};

/** Tools first (they pay for themselves), then scams the story has put on
 * sale, then the desk. */
const SHOP_ORDER = ["tool", "scam", "upgrade"];
const forSale = [...catalog].sort(
  (a, b) => SHOP_ORDER.indexOf(a.kind) - SHOP_ORDER.indexOf(b.kind),
);

const shop = (s: GameState, pl: Player) => {
  let next = s;
  for (const item of forSale)
    if (
      pl.buys(item) &&
      (item.kind !== "scam" || shopSells(beats, item.id, s.day)) &&
      canBuy(next, item)
    )
      next = reduce(next, { type: "buy", item });
  return next;
};

/** What the story hands out for free on the current day. */
const freeScams = (s: GameState) =>
  beats.reduce(
    (next, b) =>
      b.free && b.introduces && b.day <= s.day
        ? reduce(next, {
            type: "buy",
            item: { kind: "scam", id: b.introduces, price: 0 },
          })
        : next,
    s,
  );

interface Run {
  readonly s: GameState;
  readonly bought: ReadonlyArray<[string, number]>;
}

const run = (seed: number, pl: Player): Run => {
  const rng = seeded(seed);
  let s = freeScams(initialState());
  const bought: Array<[string, number]> = [];
  while (s.status === "playing") {
    const day = s.day;
    const cap =
      s.earnedToday >= quotaFor(day) ? pl.heatCapAfterQuota : pl.heatCap;
    if (workable(s, pl).length && s.shutdownMeter + worstFail(s, pl) < cap) {
      s = play(rng, s, pl);
      continue;
    }
    const before = new Set([...s.unlockedScams, ...s.ownedTools]);
    s = shop(s, pl);
    for (const id of [...s.unlockedScams, ...s.ownedTools])
      if (!before.has(id)) bought.push([id, day]);
    s = freeScams(reduce(s, { type: "endDay" }));
  }
  return { s, bought };
};

const N = Number(process.argv[2] ?? 400);
const pctOf = (n: number) => `${Math.round((100 * n) / N)}%`.padStart(4);
/** Win-rate targets, and the most a one-scam run may win. */
const TARGETS: Readonly<Record<string, string>> = {
  "careful+tools": "~70%",
  "careful no tools": "~30%",
  random: "~5%",
  "phishing only": `<=${10}%`,
};
const PHISHING_ONLY_MAX = 0.1;
console.log(
  `${N} runs per player. quota ${Array.from({ length: WIN_DAY }, (_, i) => quotaFor(i + 1)).join(" ")}`,
);
console.log(
  "player            won  shut fired warned  days  per day d1..d10, survivors only",
);
for (const pl of PLAYERS) {
  const end: Record<string, number> = {};
  const perDay: number[] = [];
  const ratioDay: number[] = [];
  const heatDay: number[] = [];
  const alive: number[] = [];
  const buyDay: Record<string, number[]> = {};
  let days = 0;
  let warned = 0;
  let raidedDay1 = 0;
  for (let seed = 1; seed <= N; seed++) {
    const { s, bought } = run(seed, pl);
    end[s.status] = (end[s.status] ?? 0) + 1;
    days += s.days.length;
    if (s.status === "shutdown" && s.day === 1) raidedDay1++;
    if (s.days.some((d) => d.warned)) warned++;
    s.days.forEach((d, i) => {
      perDay[i] = (perDay[i] ?? 0) + d.earned;
      ratioDay[i] = (ratioDay[i] ?? 0) + d.earned / d.quota;
      heatDay[i] = (heatDay[i] ?? 0) + d.heatEnd;
      alive[i] = (alive[i] ?? 0) + 1;
    });
    for (const [id, d] of bought) (buyDay[id] ??= []).push(d);
  }
  const avg = (xs: number[], digits = 0) =>
    xs.map((x, i) => (x / alive[i]!).toFixed(digits)).join(" ");
  const target = TARGETS[pl.name];
  console.log(
    `${pl.name.padEnd(17)} ${pctOf(end["won"] ?? 0)} ${pctOf(end["shutdown"] ?? 0)} ${pctOf(end["fired"] ?? 0)} ${pctOf(warned).padStart(6)} ${(days / N).toFixed(1).padStart(5)}  earned ${avg(perDay)}${target ? `   target ${target}` : ""}`,
  );
  console.log(`${"".padEnd(48)}x quota ${avg(ratioDay, 1)}`);
  console.log(`${"".padEnd(48)}heat   ${avg(heatDay)}`);
  if (raidedDay1) console.log(`  raided on day 1: ${pctOf(raidedDay1).trim()}`);
  const buys = Object.entries(buyDay).map(
    ([id, ds]) =>
      `${id} d${(ds.reduce((a, b) => a + b, 0) / ds.length).toFixed(1)} (${pctOf(ds.length).trim()})`,
  );
  if (buys.length) console.log(`  buys: ${buys.join(", ")}`);
  if (pl.only && (end["won"] ?? 0) / N > PHISHING_ONLY_MAX) {
    console.log(
      `FAIL: ${pl.name} wins more than ${PHISHING_ONLY_MAX * 100}% of runs. One scam shouldn't carry a run.`,
    );
    process.exitCode = 1;
  }
}
