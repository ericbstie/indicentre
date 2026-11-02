// The dossier's "angle": the opening a scammer would read off a victim's top
// weakness, then the convincer, the small true-looking detail that makes the
// pitch land (research/history-of-the-con.md). Coarse on purpose: it names
// the pressure, not a method, so the player learns to recognise it.

import type { Tag } from "./types.ts";

export const ANGLES: Readonly<Record<Tag, string>> = {
  authority:
    "Sound official. A case number and a name to ask for do more than any threat.",
  urgency:
    "Put a clock on it. Today, not next week, so there's no evening to sleep on it.",
  greed:
    "Offer a win and pay a little out first. The small win makes the big one believable.",
  curiosity:
    "Leave a question open. Their own name in the subject line makes it feel meant for them.",
  fear: "Open with a problem, then be the only one with the fix. Scared people don't stop to check.",
  lonely:
    "Be the one who calls back, and remember what was said last time. Ask for nothing at first.",
  parcel:
    "A missed delivery. It lands when there really is something in transit.",
  bank: "Be the bank. Read back one thing the bank would know and the trust is already there.",
  job: "Offer work and pay for the first small job. That payslip gets the fee paid later.",
  "tech-help":
    "Offer to fix the computer. Point at an error that was always there and call it the problem.",
  family:
    "Be family in trouble, on a new number. A nickname lifted from a public post does the rest.",
};
