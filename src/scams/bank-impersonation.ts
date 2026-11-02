import type { ScamDef } from "./types.ts";

export default {
  id: "bank-impersonation",
  name: "Bank fraud call",
  channel: "call",
  price: 180,
  requires: "spoofed-id",
  minutes: 30,
  payout: 110,
  heat: { success: 5, fail: 13 },
  fitTags: ["bank", "fear"],
  successLines: [
    "Thank you for ringing about it. The cashier at the branch asked what the money was for and I said a new kitchen, like you told me. When does it go back to my normal account?",
    "I read you the code and you said the payment stopped. The app still shows it, but you said it's slow to update.",
    "Moved it all to the safe account like you said. That was the money for the roof, so please look after it.",
  ],
  templates: [
    {
      id: "safe-account",
      label: "Move it to a safe account",
      subject: '"Fjellstad Bank, fraud department. Is this {name}?"',
      body: `I have your date of birth and address on screen here, so you know it's really us.
Someone is logged into your account from abroad right now, {name}. We think it's someone at your branch, so please don't speak to anyone there. If they ask, the money is for a new kitchen.
Move your savings to this protected account while we clean up. It's still your money.`,
      lures: { authority: 0.9, urgency: 0.8 },
    },
    {
      id: "read-the-code",
      label: "Read me the code to cancel it",
      subject: '"Fjellstad Bank security. We\'ve stopped a payment for you."',
      body: `A payment of 9,840 to an online shop is about to go through, {name}. Was that you?
No? Okay, don't worry, I can stop it. You'll get a code by text now. It will say don't share this code with anyone, that's normal.
Just read it back to me and the payment stops. Quickly please, it goes through on the hour.`,
      lures: { authority: 0.8, urgency: 0.9 },
    },
  ],
} satisfies ScamDef;
