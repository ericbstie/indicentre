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
    "Starter kit came! Forty bottles of tea in the hallway 😅 sold two so far, both to my mum. When do the sign-ups start paying?",
    "went Gold so my upline earns too, thats the whole point right, we lift each other up 💛",
    "I signed up my cousin and my old flatmate. Neither of them talks to me now, but I made Silver.",
  ],
  templates: [
    {
      id: "own-boss",
      label: "Be your own boss",
      subject: "hey hun!! random q 💛",
      body: `Heyyy {name}!! random q but are you open to making some extra money from your phone? Saw your post about things being tight, sending hugs 🫶
I was SO there last spring. Now I work 2 hrs a day with Thrivora and honestly it changed my life 🙏 It's NOT one of those pyramid things lol, it's affiliate.
Starter kit is 1,490 and pays for itself after 3 sign-ups. Can I add you to our team chat tonight? Only reaching out to a few people x`,
      lures: { greed: 0.7, curiosity: 0.5, urgency: 0.4 },
    },
    {
      id: "school-run",
      label: "Earn around the school run",
      subject: "parents helping parents 🌸",
      body: `Hi {name}, we haven't met but I see you in the parents' group!
I earn around naptime with Thrivora, no boss, no commute. Kit is 1,490 and the company covers half if you join before Friday.
Free for a quick call tonight? I only invite people I think would be good at it x`,
      lures: { greed: 0.5, urgency: 0.6, authority: 0.2 },
    },
  ],
} satisfies ScamDef;
