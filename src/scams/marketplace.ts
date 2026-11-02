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
    "Gave your mover the 1,800 like you said. My bank says your 3,000 never came in though, can you check your end?",
    "I put my card in but it still says pending. Do I need to do it again? Pickup is still 10 tomorrow right",
    "He collected it, nice man. Sent the change back as agreed, I'd want someone to do the same for me.",
  ],
  templates: [
    {
      id: "overpay",
      label: "Buyer pays too much",
      subject: "Is this still available?",
      body: `Hi {name} is this still available? I will take it, asking price is fine. No need to hold it for others.
I am working out of town so my mover will collect Thursday. I sent 3,000 because his fee is included, please give him the 1,800 cash when he comes.
Payment sent, check your email. God bless`,
      lures: { greed: 0.7, urgency: 0.4 },
    },
    {
      id: "courier-link",
      label: "Courier pays you through a link",
      subject: "ok deal. I pay with QuickCrate delivery",
      body: `Hi {name}, I take it for asking price. I can't come myself so I ordered QuickCrate home pickup.
Payment is already reserved for you. Open the link and enter your card to RECEIVE the money: quickcrate-delivery.safe-pay.cc/1200
They pick up tomorrow 10:00. Send me screenshot when done please`,
      lures: { curiosity: 0.6, urgency: 0.6, greed: 0.4 },
    },
  ],
} satisfies ScamDef;
