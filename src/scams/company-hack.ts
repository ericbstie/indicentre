import type { ScamDef } from "./types.ts";

export default {
  id: "company-hack",
  name: "Company hack",
  channel: "mail",
  price: 280,
  requires: "fake-website",
  minutes: 35,
  payout: 190,
  heat: { success: 6, fail: 15 },
  fitTags: ["fear", "tech-help"],
  successLines: [
    "Hi Halvard, all 8 are bought and the photos are sent. It came to 4,000 on my own card, so please don't forget the salary bit.",
    "done, I had to log in twice because the page froze the first time. is my mailbox ok now? I have a lot of client mail in there",
    "Opened the bonus file but it asked me to log in again and then it was empty. Could you share it again, it's not working for me.",
  ],
  templates: [
    {
      id: "ceo-gift-cards",
      label: "The CEO needs a favour",
      subject: "Are you available?",
      body: `{name}, are you available? Need a quick favour.

In back-to-back meetings, can't take calls. I need eight gift cards for client thank-yous before 4. Buy them on your card, I'll have it paid back with your salary.

Scratch the backs and send me photos of the codes here. Keep it between us for now, it's a surprise.

Halvard
Sent from my phone`,
      lures: { authority: 0.9, urgency: 0.7 },
    },
    {
      id: "it-password-reset",
      label: "IT: mailbox locks at 17:00",
      subject: "[IT Notice] Mailbox upgrade - action required before 17:00",
      body: `Dear Staff,

As part of our scheduled mailbox upgrade, all accounts must be re-validated today.
Mailboxes not validated by 17:00 will be suspended and incoming mail may be lost.

Validate your account: staff-portal-login.co/validate

Thank you for your cooperation.
IT Service Desk
Please do not reply to this message`,
      lures: { authority: 0.6, urgency: 0.8 },
    },
    {
      id: "bonus-list",
      label: "Shared file: bonus list",
      subject: 'Halvard shared "Bonus round Q4 (draft)" with you',
      body: `Halvard has shared a file with you.

Bonus round Q4 (draft).sheet
"{name}, have a look before it goes to the board. Not for wider circulation."

Open in Docs: staff-portal-login.co/docs/q4

You are receiving this because you work with Halvard.`,
      lures: { curiosity: 0.9, authority: 0.4 },
    },
  ],
} satisfies ScamDef;
