import type { ScamDef } from "./types.ts";

export default {
  id: "tech-support",
  name: "Tech support call",
  channel: "call",
  price: 150,
  minutes: 30,
  payout: 90,
  heat: { success: 4, fail: 12 },
  fitTags: ["tech-help", "fear"],
  successLines: [
    "Thank you for being so patient on the phone, forty minutes! The computer is slower now but you said that's normal at first.",
    "I bought the cards like you said and read you the numbers. I hope you keep your job.",
    "I paid for the licence. Now the bank has stopped my card and wants to know who I let into the computer. What do I tell them?",
  ],
  templates: [
    {
      id: "error-reports",
      label: "Your computer is sending errors",
      subject:
        '"Hello, Datavakt technical department. Am I speaking with the main user of the computer?"',
      body: `We are getting error reports from your computer, {name}, more than three hundred this week. It is not safe right now.
Please go to the computer and switch it on. I will show you the errors myself, in your own system log, all the red ones. Then I connect and clean it, free of charge.
After that the protection licence is 1,499. Most customers take the lifetime one.`,
      lures: { authority: 0.9, urgency: 0.7 },
    },
    {
      id: "refund",
      label: "Refund, typed in wrong",
      subject: '"Hi, Datavakt billing here. It is about your refund."',
      body: `Your antivirus subscription was cancelled, {name}, so we owe you 2,000 back.
I'll connect to your computer to send it, just open your bank so you can see it arrive. Oh. Oh no. I typed 20,000.
Please, you have to send the difference back today. Gift cards are fastest. Otherwise my manager fires me.`,
      lures: { greed: 0.6, authority: 0.6, urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
