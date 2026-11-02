import { int, pick, range, type Rng, sample, weighted } from "../core/rng.ts";
import {
  DEFENSES,
  DETAILS,
  FIRST_NAMES,
  LAST_NAMES,
  OCCUPATIONS,
} from "./tables.ts";
import { firstName, type Victim } from "./types.ts";

const MAX_NAME_TRIES = 50;

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

/** One victim whose first and full name are not in `used`. */
export const generateVictim = (
  rng: Rng,
  id: string,
  used: ReadonlySet<string> = new Set(),
): Victim => {
  const job = weighted(rng, OCCUPATIONS, (o) => o.w);
  const age = int(rng, job.age[0], job.age[1]);
  const detail = weighted(rng, DETAILS, (d) => (fits(age, d) ? d.w : 0));
  const weaknesses = [
    ...new Set([detail.tag, ...sample(rng, job.leans, int(rng, 1, 2))]),
  ];
  // The visible hint must stay true, so the tell never cancels the detail.
  const defense = weighted(rng, DEFENSES, (d) =>
    d.counters.includes(detail.tag) ? 0 : d.w,
  );
  const name = drawName(rng, used);
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
    defense: {
      id: defense.id,
      behavior: defense.behavior,
      line: defense.line,
      counters: defense.counters,
    },
  };
};

/**
 * n victims, none sharing a first or full name with each other or with
 * `used`. Their names are added to `used`.
 */
export const generateVictims = (
  rng: Rng,
  n: number,
  used = new Set<string>(),
  prefix = "v",
) =>
  Array.from({ length: n }, (_, i) => {
    const v = generateVictim(rng, `${prefix}${i}`, used);
    used.add(v.name).add(firstName(v));
    return v;
  });

/**
 * The names used so far on a day, for `generateVictims`. Asking for a new
 * day starts an empty set, so nobody comes back the same day.
 */
export const namesUsedOn = () => {
  let day = -1;
  const used = new Set<string>();
  return (d: number) => {
    if (d !== day) used.clear();
    day = d;
    return used;
  };
};
