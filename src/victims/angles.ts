// The dossier's "angle": the opening a scammer would read off a victim's top
// weakness. Coarse on purpose: it names the pressure, not a method, so the
// player learns to recognise it. One line per tag, scammer's voice.

import type { Tag } from "./types.ts";

export const ANGLES: Readonly<Record<Tag, string>> = {
  authority: "Sound official. Anything with a crest on it gets done.",
  urgency: "Put a clock on it. A deadline does the thinking.",
  greed: "Offer a win. Nobody reads the small print on a prize.",
  curiosity: "Leave a question open. 'Is this you?' gets clicked.",
  fear: "Open with a problem. Scared people want a fix, fast.",
  lonely: "Be the one who calls back. Friendliness is the whole pitch.",
  parcel: "A missed delivery. There's always something in transit.",
  bank: "Be the bank. The trust is already there.",
  romance: "Slow and warm. Ask for nothing at first.",
  job: "Offer work. Easy money, starts Monday.",
  "tech-help": "Offer to fix the computer. It's always slow.",
  family: "Be family in trouble. Nobody checks the number first.",
};
