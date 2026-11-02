import {
  int,
  noRepeat,
  pick,
  type Picker,
  range,
  type Rng,
  sample,
  seedFrom,
  seeded,
  weighted,
} from "../core/rng.ts";
import {
  DEFENSES,
  DETAILS,
  FIRST_NAMES,
  HOBBIES,
  LAST_NAMES,
  OCCUPATIONS,
  RECENT_EVENTS,
} from "./tables.ts";
import { type Defense, firstName, type Victim } from "./types.ts";

const MAX_NAME_TRIES = 50;

/**
 * What one day's leads have used so far: names (first and full), details
 * and, per line pool, the line said last. `newDay()` starts clean.
 */
const newDay = () => ({
  names: new Set<string>(),
  details: new Set<string>(),
  pickLine: noRepeat(),
});
type Today = ReturnType<typeof newDay>;

/** A defense habit with one of its lines. */
export const voiced = (
  rng: Rng,
  d: (typeof DEFENSES)[number],
  pickLine: Picker = pick,
): Defense => ({
  id: d.id,
  behavior: d.behavior,
  line: pickLine(rng, d.lines),
  counters: d.counters,
});

const fits = (age: number, d: { minAge?: number; maxAge?: number }) =>
  age >= (d.minAge ?? 0) && age <= (d.maxAge ?? Infinity);

/**
 * A first and last name; neither the full name nor the first name is in
 * `used`. Once every first name is used, only the full name stays unique.
 */
const drawName = (rng: Rng, used: ReadonlySet<string>) => {
  let name = "";
  for (let i = 0; i < 2 * MAX_NAME_TRIES; i++) {
    const first = pick(rng, FIRST_NAMES);
    name = `${first} ${pick(rng, LAST_NAMES)}`;
    if (!used.has(name) && (i >= MAX_NAME_TRIES || !used.has(first))) break;
  }
  return name;
};

/** One victim whose first and full name `today` hasn't used. */
export const generateVictim = (
  rng: Rng,
  id: string,
  today: Today = newDay(),
): Victim => {
  const job = weighted(rng, OCCUPATIONS, (o) => o.w);
  const age = int(rng, job.age[0], job.age[1]);
  // A detail comes back only once every detail that fits the age was used today.
  const fresh = DETAILS.some((d) => fits(age, d) && !today.details.has(d.text));
  const detail = weighted(rng, DETAILS, (d) =>
    fits(age, d) && !(fresh && today.details.has(d.text)) ? d.w : 0,
  );
  today.details.add(detail.text);
  const weaknesses = [
    ...new Set([detail.tag, ...sample(rng, job.leans, int(rng, 1, 2))]),
  ];
  // The visible hint must stay true, so the tell never cancels the detail.
  const defense = weighted(rng, DEFENSES, (d) =>
    d.counters.includes(detail.tag) ? 0 : d.w,
  );
  const name = drawName(rng, today.names);
  // Dossier flavour draws from its own stream, so adding it left every
  // existing seed's victims (and the economy sim) unchanged.
  const leak = seeded(seedFrom(`${id}/${name}`));
  const byAge = (x: { minAge?: number; maxAge?: number }) =>
    fits(age, x) ? 1 : 0;
  const { text, source } = weighted(leak, HOBBIES, byAge);
  const recent = weighted(leak, RECENT_EVENTS, byAge);
  return {
    id,
    name,
    age,
    occupation: job.label,
    techComfort: range(rng, ...job.techComfort),
    trust: range(rng, ...job.trust),
    wealth: range(rng, ...job.wealth),
    weaknesses,
    detail: { text: detail.text, tag: detail.tag },
    hobby: { text, source },
    recent: { text: recent.text, source: recent.source, hide: recent.hide },
    defense: voiced(rng, defense, today.pickLine),
  };
};

/**
 * n victims, none sharing a first or full name with each other or with
 * anyone `today` has seen. Their names are added to `today`.
 */
export const generateVictims = (
  rng: Rng,
  n: number,
  today: Today = newDay(),
  prefix = "v",
) =>
  Array.from({ length: n }, (_, i) => {
    const v = generateVictim(rng, `${prefix}${i}`, today);
    today.names.add(v.name).add(firstName(v));
    return v;
  });

/** `today(day)`: the same `newDay()` all day, a fresh one when the day changes. */
export const daily = () => {
  let day = -1;
  let today = newDay();
  return (d: number) => {
    if (d !== day) today = newDay();
    day = d;
    return today;
  };
};
