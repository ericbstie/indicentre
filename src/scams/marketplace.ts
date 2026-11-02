import type { ScamDef } from "./types.ts";

export default {
  id: "marketplace",
  name: "Marketplace overpayment",
  channel: "marketplace",
  price: 100,
  minutes: 25,
  payout: 60,
  heat: { success: 3, fail: 8 },
  fitTags: ["parcel"],
  successLines: [
    "Sent the 1,800 to his mover. The bank says the 3,000 was never sent.",
    "Entered my card so the money could come in. Still waiting. The courier page had a lovely little truck on it.",
    "He paid too much, so of course I sent the rest back. I'd want someone to do the same for me.",
  ],
  templates: [
    {
      id: "overpay",
      label: "Buyer pays too much",
      subject: "Re: your listing. still available??",
      body: `Hi {name}, I'll take it, asking price is fine.
I'm sending 3,000 instead of 1,200 because my mover needs paying too. Please pass him the 1,800 difference, he collects Thursday.
God bless`,
      lures: { greed: 0.7, urgency: 0.4 },
    },
    {
      id: "courier-link",
      label: "Courier pays you through a link",
      subject: "Re: your listing. Paid via Kwikship!",
      body: `Hi {name}! Payment is reserved with Kwikship courier.
Enter your card here to RECEIVE the money: [ Receive 1,200 ]
Pickup booked for tomorrow 10:00.`,
      lures: { curiosity: 0.6, urgency: 0.6, greed: 0.4 },
    },
  ],
} satisfies ScamDef;
