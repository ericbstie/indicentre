import type { ScamDef } from "./types.ts";

export default {
  id: "parcel-sms",
  name: "Parcel text",
  channel: "sms",
  price: 60,
  minutes: 15,
  payout: 45,
  heat: { success: 2, fail: 7 },
  fitTags: ["parcel", "urgency", "curiosity"],
  successLine: "TODO: what a victim says after falling for it.",
  templates: [
    {
      id: "customs-fee",
      label: "TODO label",
      subject: "TODO subject",
      body: "TODO body.",
      lures: { urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
