import type { ScamDef } from "./types.ts";

export default {
  id: "bank-impersonation",
  name: "Bank fraud call",
  channel: "call",
  price: 180,
  minutes: 30,
  payout: 110,
  heat: { success: 5, fail: 13 },
  fitTags: ["bank", "authority", "urgency", "fear"],
  whatToSpot: [
    "TODO: what to spot, from the victim's side.",
    "TODO: second line.",
    "TODO: the right thing to do instead.",
  ],
  successLine: "TODO: what a victim says after falling for it.",
  templates: [
    {
      id: "safe-account",
      label: "Move it to a safe account",
      subject: '"Fjellstad Bank, fraud department."',
      body: "TODO body, {name}.",
      lures: { authority: 0.9, urgency: 0.8 },
      redFlags: ["TODO"],
    },
  ],
} satisfies ScamDef;
