import type { ScamDef } from "./types.ts";

export default {
  id: "parcel-sms",
  name: "Parcel text",
  channel: "sms",
  price: 60,
  requires: "fake-website",
  minutes: 15,
  payout: 45,
  heat: { success: 2, fail: 7 },
  fitTags: ["parcel"],
  successLines: [
    "Paid it. It was only 1.99. Then the card paid 2,400 more overnight.",
    "Rebooked the delivery for Thursday. I'm not sure what I ordered, but I'll find out Thursday.",
    "Paid the fee on the bus. Quicker than queueing at the post office, and the link was right there.",
  ],
  templates: [
    {
      id: "customs-fee",
      label: "Parcel held, customs fee",
      subject: "QuickCrate: parcel held, fee unpaid",
      body: `QuickCrate: Your parcel NO-44718 is held at our terminal. Customs fee of 1.99 is unpaid.
Pay within 12 hrs or the parcel will be RETURNED to sender:
quickcrate-fee-pay.net/no44718`,
      lures: { urgency: 0.7, curiosity: 0.5 },
    },
    {
      id: "missed-delivery",
      label: "Missed delivery, pick a slot",
      subject: "QuickCrate: we missed you today",
      body: `Hi {name}, our driver could not deliver your package today (nobody home).
Choose a new delivery time here, rebooking fee 0.50: qc-redeliver.info/slot
QuickCrate Customer Team`,
      lures: { curiosity: 0.8, urgency: 0.3 },
    },
  ],
} satisfies ScamDef;
