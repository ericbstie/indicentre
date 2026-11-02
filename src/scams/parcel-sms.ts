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
    "paid it, it was only 1.99. but now my bank app says 2,400 went out tonight?? is that you",
    "Booked for Thursday. What is the parcel, I don't remember ordering anything",
    "paid on the bus, quicker than the post office queue. thanks for the reminder",
  ],
  templates: [
    {
      id: "customs-fee",
      label: "Parcel held, customs fee",
      subject: "From +44 7418 552093",
      body: `QuickCrate: Your parcel NO44718 is held due to an unpaid customs fee (1.99). Pay within 12h or it will be returned to sender: quickcrate-no.fee-pay.top/44718`,
      lures: { urgency: 0.7, curiosity: 0.5 },
    },
    {
      id: "missed-delivery",
      label: "Missed delivery, pick a slot",
      subject: "From +47 921 04 377",
      body: `QuickCrate: We missed you today. Your parcel is waiting. Choose a new delivery time (fee 0.50): qc-redeliver.info/s/8Kq2
Reply Y and reopen this message if the link does not work.`,
      lures: { curiosity: 0.8, urgency: 0.3 },
    },
  ],
} satisfies ScamDef;
