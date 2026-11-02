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
    "Paid the fee! The money clears in 6 to 8 weeks. I've already told my sister about the boat.",
    "I never win anything, so I knew this one had to be real. Fee's paid. I'm keeping it quiet like they said.",
    "Paid the second fee. That was the last of the holiday money.",
  ],
  templates: [
    {
      id: "grand-draw",
      label: "Grand draw winner",
      subject: "WINNER NOTIFICATION Ref. 0091-GCD / {name}",
      body: `Dear {name},

Your email address was selected in the Grand Continental Online Draw. Prize: 850,000.
To release it we require a one-time clearance fee of 349 within 72 hours.
For security, keep this win confidential until it is paid out.

Helen Moore
Claims Department`,
      lures: { greed: 0.9, urgency: 0.5, authority: 0.3 },
    },
    {
      id: "giveaway",
      label: "Giveaway prize, pay shipping",
      subject: "You won the Lykke Sport summer giveaway!",
      body: `Hey {name}! You're one of 5 winners (the headphones!!)
Just cover 4.95 shipping in the next 24h or we draw someone else: [ Claim ]

xx the Lykke Sport team`,
      lures: { greed: 0.6, curiosity: 0.6, urgency: 0.6 },
    },
  ],
} satisfies ScamDef;
