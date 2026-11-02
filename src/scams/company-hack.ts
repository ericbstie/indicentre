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
    "Bought the gift cards on my lunch break and sent the codes. That was 4,000 kr of my own money, and Halvard never asked for them.",
    "Typed my password in twice because the page froze. IT says they never sent a reset, but they'll look into the freezing.",
    "Opened the bonus list. It asked me to log in again and then it was empty. Maybe they haven't finished it yet.",
  ],
  templates: [
    {
      id: "ceo-gift-cards",
      label: "The CEO needs a favour",
      subject: "are you at your desk?",
      body: `{name}, are you around? In back-to-back board meetings, can't take calls.

I need eight gift cards for client thank-yous before 4. Buy them on your card, I'll have it paid back with your salary.
Send me photos of the codes here. Keep it between us for now, it's a surprise.

Halvard
Sent from my phone`,
      lures: { authority: 0.9, urgency: 0.7 },
    },
    {
      id: "it-password-reset",
      label: "IT: mailbox locks at 17:00",
      subject: "ACTION REQUIRED: mailbox migration today",
      body: `Hi {name},

We are moving all staff mailboxes to the new server tonight.
Mailboxes not confirmed by 17:00 will be locked and their mail may be lost.

Confirm your login here: staff-portal-login.co/confirm

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
