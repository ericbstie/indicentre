import { int, pick, range, type Rng, sample, weighted } from "../core/rng.ts";
import {
  DEFENSES,
  DETAILS,
  FIRST_NAMES,
  LAST_NAMES,
  OCCUPATIONS,
} from "./tables.ts";
import type { Victim } from "./types.ts";

const MAX_NAME_TRIES = 50;

const fits = (age: number, d: { minAge?: number; maxAge?: number }) =>
  age >= (d.minAge ?? 0) && age <= (d.maxAge ?? Infinity);

/** One victim. `taken` names are avoided so a batch never repeats a person. */
export const generateVictim = (
  rng: Rng,
  id: string,
  taken: ReadonlySet<string> = new Set(),
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
  let name = "";
  for (let i = 0; i < MAX_NAME_TRIES && (!name || taken.has(name)); i++)
    name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
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

/** n victims with distinct names. */
export const generateVictims = (rng: Rng, n: number, prefix = "v") => {
  const taken = new Set<string>();
  return Array.from({ length: n }, (_, i) => {
    const v = generateVictim(rng, `${prefix}${i}`, taken);
    taken.add(v.name);
    return v;
  });
};
