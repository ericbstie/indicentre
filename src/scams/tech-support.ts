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
  whatToSpot: [
    "Real companies don't call you about a virus.",
    '"Install this so I can help" means remote access to your PC.',
    "Hang up and call the number on the official website.",
  ],
  successLine:
    "He was so patient with me. Forty minutes! You don't get service like that anymore.",
  lesson:
    "No real company calls you about your computer. Hang up, then call them on a number you looked up yourself.",
  templates: [
    {
      id: "error-reports",
      label: "Your computer is sending errors",
      subject:
        '"Hello, Windoze Help Desk. We are calling about your computer."',
      body: `We have received 312 error reports from your computer this week, {name}.
I just need you to open one program so I can look at it with you. Free of charge.
The repair licence afterwards is 1,499. Most customers take the lifetime one.`,
      lures: { authority: 0.9, urgency: 0.7 },
      redFlags: [
        "They called out of the blue",
        "No company can see errors on your home computer",
        "Asks you to install something that hands over control",
      ],
    },
    {
      id: "refund",
      label: "Refund, typed in wrong",
      subject: '"Hi, Nettvakt Security here, about your refund."',
      body: `Your antivirus subscription ended, {name}, and we owe you 2,000 back.
I'll connect to your computer to send it. Oh. Oh no. I typed 20,000.
You'll have to send the difference back today or my manager fires me.`,
      lures: { greed: 0.6, authority: 0.6, urgency: 0.5 },
      redFlags: [
        "A refund you never asked for",
        "Real refunds don't need access to your computer",
        "Their 'mistake' becomes your bill",
      ],
    },
  ],
} satisfies ScamDef;
