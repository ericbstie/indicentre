import type { ScamDef } from "./types.ts";

export default {
  id: "pyramid",
  name: "Pyramid scheme",
  channel: "social",
  price: 120,
  minutes: 20,
  payout: 70,
  heat: { success: 3, fail: 9 },
  fitTags: ["job", "family"],
  successLines: [
    "Starter kit's in the hallway. Forty bottles of tea. I've sold two, both to my mum.",
    "Bought the Gold tier so my upline earns too. That's the whole point, we lift each other.",
    "Signed up my cousin and my old flatmate. Neither of them talks to me now, but I'm Silver.",
  ],
  templates: [
    {
      id: "own-boss",
      label: "Be your own boss",
      subject: "hey hun!! random q 💛",
      body: `Hey {name}! Saw your post about money being tight, sending hugs.
I was SO there last spring. Now I work two hours a day from my phone with Thrivora.
Starter kit is 1,490 and it pays for itself after your first three sign-ups. Can I add you to our team chat tonight? Spots are filling up.`,
      lures: { greed: 0.7, curiosity: 0.5, urgency: 0.4 },
    },
    {
      id: "school-run",
      label: "Earn around the school run",
      subject: "parents helping parents",
      body: `Hi {name}, we haven't met but I see you in the parents' group.
I earn around naptime with Thrivora, no boss, no commute. The kit is 1,490 and the company covers half if you join before Friday.
I only invite people I think would be good at it x`,
      lures: { greed: 0.5, urgency: 0.6, authority: 0.2 },
    },
  ],
} satisfies ScamDef;
