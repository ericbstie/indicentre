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
import { scams, starterScams } from "../src/scams/registry.ts";
import {
  failHeat,
  payout,
  pulls,
  resolveScam,
  resolveWarmup,
  warmed,
} from "../src/scams/resolve.ts";
import type { ScamDef, ScamTemplate } from "../src/scams/types.ts";
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
    buys: () => false,
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
    p * payout(scam, victim) - (1 - p) * failHeat(scam, m) * HEAT_PRICE;
  return { victim, scam, template, p, score };
};

const minutesFor = (s: ScamDef) => s.minutes * (1 + (s.warmups?.length ?? 0));

/** One attempt on a fresh batch of leads, as the Leads app plays it. */
const play = (rng: Rng, s: GameState, pl: Player): GameState => {
  const m = modifiersFor(s.ownedTools);
  const open = scams.filter(
    (sc) =>
      s.unlockedScams.includes(sc.id) &&
      s.minute + minutesFor(sc) <= SHIFT_MINUTES,
  );
  const opts = generateVictims(rng, LEADS).flatMap((v) =>
    open.flatMap((sc) => sc.templates.map((t) => option(v, sc, t, m))),
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
  );
  for (const a of out.actions) next = reduce(next, a);
  return next;
};

const worstFail = (s: GameState) => {
  const m = modifiersFor(s.ownedTools);
  return Math.max(
    ...scams
      .filter((sc) => s.unlockedScams.includes(sc.id))
      .map((sc) => failHeat(sc, m)),
  );
};

const shop = (s: GameState, pl: Player) => {
  let next = s;
  for (const item of catalog)
    if (pl.buys(item) && canBuy(next, item))
      next = reduce(next, { type: "buy", item });
  return next;
};

interface Run {
  readonly s: GameState;
  readonly bought: ReadonlyArray<[string, number]>;
}

const run = (seed: number, pl: Player): Run => {
  const rng = seeded(seed);
  let s = initialState(starterScams);
  const bought: Array<[string, number]> = [];
  while (s.status === "playing") {
    const day = s.day;
    const cap =
      s.earnedToday >= quotaFor(day) ? pl.heatCapAfterQuota : pl.heatCap;
    const canWork = scams.some(
      (sc) =>
        s.unlockedScams.includes(sc.id) &&
        s.minute + minutesFor(sc) <= SHIFT_MINUTES,
    );
    if (canWork && s.shutdownMeter + worstFail(s) < cap) {
      s = play(rng, s, pl);
      continue;
    }
    const before = new Set([...s.unlockedScams, ...s.ownedTools]);
    s = shop(s, pl);
    for (const id of [...s.unlockedScams, ...s.ownedTools])
      if (!before.has(id)) bought.push([id, day]);
    s = reduce(s, { type: "endDay" });
  }
  return { s, bought };
};

const N = Number(process.argv[2] ?? 400);
const pctOf = (n: number) => `${Math.round((100 * n) / N)}%`.padStart(4);
console.log(
  `${N} runs per player. quota ${Array.from({ length: WIN_DAY }, (_, i) => quotaFor(i + 1)).join(" ")}`,
);
console.log(
  "player            won  shut fired  days  per day d1..d10, survivors only",
);
for (const pl of PLAYERS) {
  const end: Record<string, number> = {};
  const perDay: number[] = [];
  const heatDay: number[] = [];
  const alive: number[] = [];
  const buyDay: Record<string, number[]> = {};
  let days = 0;
  for (let seed = 1; seed <= N; seed++) {
    const { s, bought } = run(seed, pl);
    end[s.status] = (end[s.status] ?? 0) + 1;
    days += s.days.length;
    s.days.forEach((d, i) => {
      perDay[i] = (perDay[i] ?? 0) + d.earned;
      heatDay[i] = (heatDay[i] ?? 0) + d.heatEnd;
      alive[i] = (alive[i] ?? 0) + 1;
    });
    for (const [id, d] of bought) (buyDay[id] ??= []).push(d);
  }
  console.log(
    `${pl.name.padEnd(17)} ${pctOf(end["won"] ?? 0)} ${pctOf(end["shutdown"] ?? 0)} ${pctOf(end["fired"] ?? 0)} ${(days / N).toFixed(1).padStart(5)}  earned ${perDay.map((x, i) => Math.round(x / alive[i]!)).join(" ")}`,
  );
  console.log(
    `${"".padEnd(41)}heat   ${heatDay.map((x, i) => Math.round(x / alive[i]!)).join(" ")}`,
  );
  const buys = Object.entries(buyDay).map(
    ([id, ds]) =>
      `${id} d${(ds.reduce((a, b) => a + b, 0) / ds.length).toFixed(1)} (${pctOf(ds.length).trim()})`,
  );
  if (buys.length) console.log(`  buys: ${buys.join(", ")}`);
}
