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
  fitTags: ["bank", "authority", "urgency", "fear"],
  successLine:
    "She had my account number already, so I knew she was real. The money's safe now. She said not to ring the branch, they're part of the problem.",
  templates: [
    {
      id: "safe-account",
      label: "Move it to a safe account",
      subject: '"Fjellstad Bank, fraud department. Is this {name}?"',
      body: `Someone is logged into your account from abroad right now, {name}.
We think it's someone inside the branch, so we can't freeze it the normal way.
Move your savings to this protected account while we clean up. It's still your money.`,
      lures: { authority: 0.9, urgency: 0.8 },
    },
    {
      id: "read-the-code",
      label: "Read me the code to cancel it",
      subject: '"Fjellstad Bank security. We\'ve stopped a payment for you."',
      body: `A payment of 9,840 is about to leave your account, {name}. Did you make it?
No? Good, I can cancel it. You'll get a code by text in a second.
Read it back to me and the payment stops. Quickly, it goes through at the hour.`,
      lures: { authority: 0.8, urgency: 0.9 },
    },
  ],
} satisfies ScamDef;
