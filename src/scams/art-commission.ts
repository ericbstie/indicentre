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
    "It came already! Biscuit has five legs in it but the eyes are exactly his. We're framing it anyway, thank you",
    "logo arrived, thanks. the sign says BKAERY though? the letters look a bit melted. paid the rest, I know you're busy",
    "Paid the deposit two weeks ago and your page is gone now. Are you still doing it? It was the only good photo of him we had.",
  ],
  templates: [
    {
      id: "pet-portrait",
      label: "Portrait of a pet that died",
      subject: "Re: looking for someone to paint our old dog",
      body: `Hi {name}, so sorry for your loss 🙏 I do hand painted memorial portraits, oil look.
Recent ones here (styles vary, I like to experiment): mirelle-studio.art/pets
Half up front (45) and I can start tonight. Most clients cry when they see it, the good kind ❤`,
      lures: { curiosity: 0.6, urgency: 0.3 },
    },
    {
      id: "shop-logo",
      label: "Cheap logo for a small shop",
      subject: "Logo for your shop? 3 concepts in 24h",
      body: `Hi {name}! Saw your shop has no proper logo yet.
I do 3 concepts in 24 hours, 60 total, this week only (usually 240). 100% original, no AI.
Deposit first so I can block the slot, I only take 4 a week.`,
      lures: { greed: 0.7, urgency: 0.5 },
    },
    {
      id: "gift-deadline",
      label: "Family portrait before a birthday",
      subject: "Commissions open, 2 slots left before the holidays",
      body: `Hi {name}, you asked about a family portrait for a birthday?
I can still make it in time if we start today. Send 2-3 photos and the deposit.
Payment by bank transfer please, the art site takes 20% so I don't use it.`,
      lures: { urgency: 0.7, greed: 0.3 },
    },
  ],
} satisfies ScamDef;
