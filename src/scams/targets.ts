import { int, pick, type Rng, sample } from "../core/rng.ts";
import type { LureWeights, Target } from "./types.ts";

interface Archetype {
  readonly label: string;
  readonly age: readonly [number, number];
  readonly susceptibility: LureWeights;
  readonly savvy: number;
  readonly wealth: number;
  readonly notes: ReadonlyArray<string>;
}

// Each archetype's notes hint at what works on them; that is the puzzle.
const ARCHETYPES: ReadonlyArray<Archetype> = [
  {
    label: "Retiree",
    age: [66, 84],
    susceptibility: {
      authority: 0.9,
      urgency: 0.7,
      greed: 0.3,
      curiosity: 0.3,
    },
    savvy: 0.15,
    wealth: 1.6,
    notes: [
      "Trusts anything with a logo on it",
      "Banks with BankCo for 40 years",
      "Shares grandkid photos publicly",
      "Answers every phone call",
    ],
  },
  {
    label: "Student",
    age: [19, 25],
    susceptibility: {
      authority: 0.3,
      urgency: 0.4,
      greed: 0.8,
      curiosity: 0.8,
    },
    savvy: 0.45,
    wealth: 0.5,
    notes: [
      "Enters every giveaway online",
      "Orders packages weekly",
      "Broke until the next loan payment",
      "Clicks first, reads later",
    ],
  },
  {
    label: "Busy parent",
    age: [32, 48],
    susceptibility: {
      authority: 0.6,
      urgency: 0.9,
      greed: 0.3,
      curiosity: 0.6,
    },
    savvy: 0.35,
    wealth: 1.1,
    notes: [
      "Reads mail on the phone between meetings",
      "Waiting on three online orders",
      "Never has time to double-check",
    ],
  },
  {
    label: "IT consultant",
    age: [27, 55],
    susceptibility: {
      authority: 0.2,
      urgency: 0.2,
      greed: 0.3,
      curiosity: 0.4,
    },
    savvy: 0.85,
    wealth: 1.4,
    notes: [
      "Hovers over every link",
      "Has 2FA on the toaster",
      "Posts screenshots of phishing mails for fun",
    ],
  },
];

const FIRST = [
  "Margaret",
  "Kari",
  "Ole",
  "Ingrid",
  "Lars",
  "Sofie",
  "Emma",
  "Jonas",
  "Hanna",
  "Erik",
  "Linda",
  "Tom",
  "Aisha",
  "Mateo",
  "Yuki",
  "Grace",
];
const LAST = [
  "Olsen",
  "Hansen",
  "Berg",
  "Larsen",
  "Smith",
  "Haugen",
  "Dahl",
  "Moen",
  "Novak",
  "Silva",
  "Kim",
  "Brown",
  "Lund",
  "Bakke",
];

const jitter = (rng: Rng, v: number) =>
  Math.min(1, Math.max(0, v + (rng() - 0.5) * 0.3));

export const generateTarget = (rng: Rng, id: string): Target => {
  const a = pick(rng, ARCHETYPES);
  return {
    id,
    name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
    age: int(rng, a.age[0], a.age[1]),
    archetype: a.label,
    notes: sample(rng, a.notes, 2),
    susceptibility: {
      authority: jitter(rng, a.susceptibility.authority),
      urgency: jitter(rng, a.susceptibility.urgency),
      greed: jitter(rng, a.susceptibility.greed),
      curiosity: jitter(rng, a.susceptibility.curiosity),
    },
    savvy: jitter(rng, a.savvy),
    wealth: a.wealth * (0.8 + rng() * 0.4),
  };
};

export const generateTargets = (rng: Rng, n: number, prefix = "t") =>
  Array.from({ length: n }, (_, i) => generateTarget(rng, `${prefix}${i}`));
