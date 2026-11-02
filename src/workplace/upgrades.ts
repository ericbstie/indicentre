import { CALL_BACK } from "../content/lessons.ts";
import type { DeskTier } from "./slice.ts";

/** Something for your own desk, sold in the Shop's "Your desk" section. */
interface UpgradeDef {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  /** Shop line: what it does in game terms. */
  readonly blurb: string;
  /** Desks only: the tier it moves you to. */
  readonly tier?: DeskTier;
  /** Shown once owned, like a tool's lesson. */
  readonly lesson?: string;
}

const QUIET_LINE = `A quiet line and a calm voice are props. ${CALL_BACK}`;

/** Shop order: desks first, then cosmetics. */
export const upgrades: ReadonlyArray<UpgradeDef> = [
  {
    id: "partition",
    name: "Side partition",
    price: 150,
    tier: 1,
    blurb: "A bookcase between you and Rohan's headset. +5% odds on calls.",
    lesson: QUIET_LINE,
  },
  {
    id: "booth",
    name: "Corner booth",
    price: 350,
    tier: 2,
    blurb:
      "Shelves on two sides and a rug that eats the echo. +10% odds on calls.",
    lesson: QUIET_LINE,
  },
  {
    id: "plant",
    name: "Desk plant",
    price: 40,
    blurb: "Plastic, so it can't die on you. Looks like you plan to stay.",
  },
  {
    id: "photo",
    name: "Framed photo",
    price: 60,
    blurb:
      "The family that came with the frame. Visitors assume they're yours.",
  },
  {
    id: "monitor",
    name: "Second monitor",
    price: 90,
    blurb: "Same leads on two screens. Squinting is for juniors.",
  },
];
