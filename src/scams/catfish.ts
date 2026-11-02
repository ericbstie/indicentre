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
    "Sent it this morning. He says the satellite on the platform is down this week, so no calls. I'm counting days.",
    "My friends stopped asking about him. I stopped telling them.",
    "Paid for the ferry. He sent a photo of the ticket. It's a bit blurry, but the sea is out there, isn't it.",
  ],
  warmups: [
    {
      id: "hello",
      label: "First message",
      subject: "Is that a lake in your profile photo?",
      body: `Sorry to message out of nowhere, {name}. I'm Daniel.
I work on an oil platform, so mostly I look at the sea. You looked like someone who laughs a lot.`,
      lures: { curiosity: 0.8 },
    },
    {
      id: "good-morning",
      label: "Good morning, every day",
      subject: "Good morning sunshine",
      body: `Did you sleep? I dreamt we were on a ferry together.
When this contract ends I want to visit you first, {name}. You're the only one I really talk to out here.`,
      lures: { curiosity: 0.6, urgency: 0.2 },
    },
  ],
  templates: [
    {
      id: "stuck-abroad",
      label: "Stuck, needs help once",
      subject: "I hate asking you this",
      body: `My card is blocked out here and the company won't pay me until the contract ends.
I need 14,000 for a customs fee on my equipment or I lose the job.
I'll pay you back the day I land, {name}. You know I would.`,
      lures: { urgency: 0.8, curiosity: 0.4 },
    },
    {
      id: "ferry-ticket",
      label: "Ticket to come and visit",
      subject: "I found a ferry!! almost",
      body: `There's a crossing next month. Only problem is my salary is stuck until the 30th.
If you cover the ticket I'll bring your money back with the scarf I bought you.
I can't wait to see you, {name}.`,
      lures: { curiosity: 0.7, urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
