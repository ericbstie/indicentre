import type { ToolId } from "../core/economy.ts";
import type { RevealLevel } from "../victims/view.ts";

/** How owned tools change a scam attempt. Pure data; resolve.ts applies it. */
export interface Modifiers {
  /** How much of each lead's profile is visible (victims/view.ts). */
  readonly reveal: RevealLevel;
  /** Added to success chance before clamping. */
  readonly chanceBonus: number;
  /** Multiplies heat when a target reports you. */
  readonly failHeatMult: number;
  /** Added to success chance on channel "call" scams (your desk). */
  readonly callBonus: number;
}

export const NO_MODS: Modifiers = {
  reveal: 0,
  chanceBonus: 0,
  failHeatMult: 1,
  callBonus: 0,
};

export interface ToolDef {
  readonly id: ToolId;
  readonly name: string;
  readonly price: number;
  /** Shop line: what it does in game terms. */
  readonly blurb: string;
  /** The real-world defense against this tool. */
  readonly lesson: string;
  readonly effect: Partial<Modifiers>;
}

export const tools: ReadonlyArray<ToolDef> = [
  {
    id: "persondata",
    name: "Persondata package",
    price: 80,
    blurb:
      "Profiles scraped from public posts. Shows what each lead falls for and the exact odds on every pitch.",
    lesson: "Everything you post publicly is research material for someone.",
    effect: { reveal: 2 },
  },
  {
    id: "fake-website",
    name: "Fake website",
    price: 150,
    blurb:
      "A login page that looks right at a glance. +10% odds on every pitch.",
    lesson: "Check the address bar, not the logo.",
    effect: { chanceBonus: 0.1 },
  },
  {
    id: "spoofed-id",
    name: "Spoofed caller ID",
    price: 180,
    blurb:
      "Mail and calls show someone else's name. Failed pitches cost half the heat.",
    lesson:
      "Sender names and caller ID can be faked. Call back on a number you already know.",
    effect: { failHeatMult: 0.5 },
  },
];

export const modifiersFor = (owned: ReadonlyArray<ToolId>): Modifiers =>
  tools
    .filter((t) => owned.includes(t.id))
    .reduce<Modifiers>(
      (m, t) => ({
        reveal: Math.max(m.reveal, t.effect.reveal ?? 0) as RevealLevel,
        chanceBonus: m.chanceBonus + (t.effect.chanceBonus ?? 0),
        failHeatMult: m.failHeatMult * (t.effect.failHeatMult ?? 1),
        callBonus: m.callBonus + (t.effect.callBonus ?? 0),
      }),
      NO_MODS,
    );
