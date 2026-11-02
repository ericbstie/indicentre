import type { ScamDef } from "./types.ts";

export default {
  id: "lottery",
  name: "Fake lottery win",
  channel: "mail",
  price: 80,
  minutes: 15,
  payout: 50,
  heat: { success: 2, fail: 7 },
  fitTags: [],
  successLines: [
    "Dear Mrs Moore, I have paid the 349 as you said. My sister says these things are never real, so I have not told her the amount. When does the money come?",
    "paid the shipping :) cant believe i actually won something for once. do you need my address again or have you got it",
    "I paid the second fee as well. That was what we had put aside for the holidays, but you said this is the last one.",
  ],
  templates: [
    {
      id: "grand-draw",
      label: "Grand draw winner",
      subject: "CONGRATULATIONS!!! Your E-mail Has Won (Batch No. 0091/GCD)",
      body: `Dear Lucky Winner,

We are pleased to inform you that your e-mail address attached to ticket no. 44-0172-9935 has won in the GRAND CONTINENTAL ONLINE DRAW held on the 14th of this month. You have been approved for a lump sum pay of 850,000 (Eight Hundred and Fifty Thousand).

To begin your claim, contact your claims agent with your winning numbers. A one-time clearance fee of 349 is required before release of fund.

NOTE: Keep this award from public until your claim is processed, to avoid double claiming.

Mrs. Helen Moore
Claims Agent
grandcontinental.claims@freemail.co`,
      lures: { greed: 0.9, urgency: 0.5, authority: 0.3 },
    },
    {
      id: "giveaway",
      label: "Giveaway prize, pay shipping",
      subject: "🎁 {name}, you've been picked! (1 of 5)",
      body: `Hi {name}!

Great news, you're one of 5 winners in the Lykke Sport summer giveaway 🎉 Your prize: wireless headphones (worth 1,899).

We just need you to cover shipping (4.95). Claim within 24 hours or the prize goes to the next person on the list.

[ CLAIM MY PRIZE ]

Lykke Sport Rewards Team
You received this because you took part in a Lykke Sport promotion.`,
      lures: { greed: 0.6, curiosity: 0.6, urgency: 0.6 },
    },
  ],
} satisfies ScamDef;
