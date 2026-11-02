import type { ScamDef } from "./types.ts";

export default {
  id: "catfish",
  name: "Romance scam",
  channel: "social",
  price: 300,
  minutes: 40,
  payout: 220,
  heat: { success: 6, fail: 15 },
  fitTags: ["romance", "lonely"],
  successLines: [
    "sent it this morning ❤ I know you said no calls this week because of the satellite. I'm counting the days",
    "Sent the money. My friends stopped asking about you, and I stopped telling them.",
    "Paid for the ferry. The photo of the ticket is a bit blurry but I can see the sea in it. Is that where you are now?",
  ],
  warmups: [
    {
      id: "hello",
      label: "First message",
      subject: "Is that a lake in your profile photo?",
      body: `Sorry to message out of nowhere {name}, I'm Daniel. I work on an oil platform so mostly I look at the sea lol.
You have a kind smile, I hope that is not too forward. Can we talk on another app? This one drops all the time out here.`,
      lures: { curiosity: 0.8 },
    },
    {
      id: "good-morning",
      label: "Good morning, every day",
      subject: "Good morning my dear",
      body: `Did you sleep? I dreamt we took a ferry together.
When this contract ends I want to come to you first {name}. You are the only one I really talk to out here 💕`,
      lures: { curiosity: 0.6, urgency: 0.2 },
    },
  ],
  templates: [
    {
      id: "stuck-abroad",
      label: "Stuck, needs help once",
      subject: "I hate asking you this",
      body: `My dear I am so ashamed to ask. My card got blocked out here and the company don't pay until the contract ends.
Customs is holding my equipment and wants 14,000 or I lose the job. I pay you back the day I land, you know I would {name}.
Please don't tell your friends, they don't understand us.`,
      lures: { urgency: 0.8, curiosity: 0.4 },
    },
    {
      id: "ferry-ticket",
      label: "Ticket to come and visit",
      subject: "I found a ferry!! almost",
      body: `There is a crossing on the 14th. Only problem is my salary is stuck until the 30th 😔
If you cover the ticket I bring your money back with me, and the scarf I bought you.
My camera is still broken but soon you see me for real {name}.`,
      lures: { curiosity: 0.7, urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
