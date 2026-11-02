import type { ScamDef } from "./types.ts";

export default {
  id: "account-takeover",
  name: "Account takeover",
  channel: "social",
  price: 220,
  requires: "fake-website",
  minutes: 25,
  payout: 130,
  heat: { success: 5, fail: 12 },
  fitTags: ["curiosity", "fear", "urgency", "family"],
  whatToSpot: [
    "TODO: what to spot, from the victim's side.",
    "TODO: second line.",
    "TODO: the right thing to do instead.",
  ],
  successLine: "TODO: what a victim says after falling for it.",
  templates: [
    {
      id: "first",
      label: "TODO label",
      subject: "TODO subject",
      body: "Hi {name},\n\nTODO body.",
      lures: { urgency: 0.5 },
      redFlags: ["TODO: what a careful recipient would notice"],
    },
  ],
} satisfies ScamDef;
