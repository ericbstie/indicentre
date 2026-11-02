import type { ScamDef } from "./types.ts";

export default {
  id: "fake-invoice",
  name: "Fake invoice",
  channel: "mail",
  price: 260,
  requires: "spoofed-id",
  minutes: 35,
  payout: 160,
  heat: { success: 6, fail: 14 },
  fitTags: ["authority", "urgency", "bank"],
  successLine: "TODO: what a victim says after falling for it.",
  templates: [
    {
      id: "first",
      label: "TODO label",
      subject: "TODO subject",
      body: "Hi {name},\n\nTODO body.",
      lures: { urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
