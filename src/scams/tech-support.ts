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
  successLine:
    "He was so patient with me. Forty minutes! You don't get service like that anymore.",
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
    },
    {
      id: "refund",
      label: "Refund, typed in wrong",
      subject: '"Hi, Nettvakt Security here, about your refund."',
      body: `Your antivirus subscription ended, {name}, and we owe you 2,000 back.
I'll connect to your computer to send it. Oh. Oh no. I typed 20,000.
You'll have to send the difference back today or my manager fires me.`,
      lures: { greed: 0.6, authority: 0.6, urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
