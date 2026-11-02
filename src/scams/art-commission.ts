import type { ScamDef } from "./types.ts";

export default {
  id: "art-commission",
  name: "Fake art commission",
  channel: "social",
  price: 90,
  minutes: 20,
  payout: 55,
  heat: { success: 2, fail: 7 },
  fitTags: ["family"],
  successLines: [
    "It came already! Biscuit has five legs in it, but the eyes are exactly his. Framing it anyway.",
    "Logo arrived. The sign says BKAERY in letters that aren't quite letters. Paid the rest, the artist seemed so busy.",
    "Paid the deposit. The sketch comes Friday, she says. She said that last Friday too, but artists are like that.",
  ],
  templates: [
    {
      id: "pet-portrait",
      label: "Portrait of a pet that died",
      subject: "Re: looking for someone to paint our old dog",
      body: `Hi {name}, so sorry about your dog. I paint memorial portraits, hand-done, oil look.
Portfolio: mirelle-studio.art/pets
Half up front (45) and I can start tonight. Most clients cry when they see it, the good kind.`,
      lures: { curiosity: 0.6, urgency: 0.3 },
    },
    {
      id: "shop-logo",
      label: "Cheap logo for a small shop",
      subject: "Logo for your shop? 3 concepts in 24h",
      body: `Hi {name}! Saw your shop has no proper logo yet.
I do 3 concepts in 24 hours, 60 total, this week only (usually 240).
Deposit first so I can block the slot, I only take 4 a week.`,
      lures: { greed: 0.7, urgency: 0.5 },
    },
    {
      id: "gift-deadline",
      label: "Family portrait before a birthday",
      subject: "Commissions open, 2 slots left before the holidays",
      body: `Hi {name}, you asked about a family portrait for a birthday?
I can still make it in time if we start today. Send 2-3 photos and the deposit.
Full payment by transfer, the art site takes 20% so I don't use it.`,
      lures: { urgency: 0.7, greed: 0.3 },
    },
  ],
} satisfies ScamDef;
