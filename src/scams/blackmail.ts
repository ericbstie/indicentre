import type { ScamDef } from "./types.ts";

export default {
  id: "blackmail",
  name: "Blackmail mail",
  channel: "mail",
  price: 200,
  requires: "persondata",
  minutes: 25,
  payout: 120,
  heat: { success: 6, fail: 14 },
  fitTags: ["fear"],
  successLines: [
    "Paid. Please delete it. I've changed the password, the old one too, the one from 2019.",
    "I didn't know how to buy crypto. The boy at the kiosk showed me. Please don't write again.",
    "Sent it. I still don't know what you have. I've put a plaster over the camera anyway.",
  ],
  templates: [
    {
      id: "old-password",
      label: "I know your password",
      subject: "{name}, your password is sommer2019",
      body: `Hi {name},

Yes, sommer2019. That's your password. I've had it for a while.
I used it to get into your laptop and I've been watching through the camera.
I know what you do in the evenings. So will your contacts, unless you pay.

Ignore this mail and I send everything to everyone in your address book.`,
      lures: { authority: 0.4, urgency: 0.6 },
    },
    {
      id: "deadline",
      label: "48 hours to pay",
      subject: "Final notice. 48 hours.",
      body: `{name},

You opened this mail, so the timer has started. I can see that.
48 hours. Payment in crypto only, to the wallet below. Not a bank, not cash.
After that the files go out. Your family first.

Wallet: QX-7741-NORD-2290
Don't tell anyone. I'll know.`,
      lures: { urgency: 0.9 },
    },
    {
      id: "be-reasonable",
      label: "Let's keep this between us",
      subject: "Re: our little secret",
      body: `Dear {name},

I'm a reasonable person. I don't want to ruin anyone's life.
Pay 1,500 in crypto and I delete everything and you never hear from me again.
Nobody needs to know. Not your work, not your friends.

You already know which password I mean.`,
      lures: { authority: 0.3, urgency: 0.5, curiosity: 0.3 },
    },
  ],
} satisfies ScamDef;
