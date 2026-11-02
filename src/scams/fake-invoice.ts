import type { ScamDef } from "./types.ts";

export default {
  id: "fake-invoice",
  name: "Fake invoice",
  channel: "mail",
  price: 260,
  requires: "spoofed-id",
  minutes: 35,
  payout: 160,
  heat: { success: 6, fail: 14 },
  fitTags: ["bank"],
  successLines: [
    "Hi Trine, paid today to the new account as asked. I tried ringing first but nobody picked up, so I went by your email. Have a nice weekend.",
    "done, paid it. didnt want to hold up the Nordby job. can you send me the paperwork for my files when you're back",
    "Payment sent. Our auditor has now asked me who you are, and I don't know what to tell them.",
  ],
  templates: [
    {
      id: "new-bank-details",
      label: "Supplier changed banks",
      subject: "Haldorsen Pipe & Valve - change of bank details",
      body: `Hi {name},

Hope all is well.

Please be advised that we have changed our bank. Our old account will be closed at the end of the month, so all payments from now on should go to the new account in the attached letter.

Invoice 20419 (34,600) is due Friday. Could you please use the new details for this one already. Our phones are being moved this week, so please confirm by email only.

Best regards
Trine Haugen
Accounts Receivable
Haldorsen Pipe & Valve AS
accounts@haldorsen-pipe.co`,
      lures: { authority: 0.6, urgency: 0.7 },
    },
    {
      id: "boss-in-a-meeting",
      label: "The boss needs it paid now",
      subject: "Urgent",
      body: `{name} are you at your desk

Stuck in a meeting with the bank, can't take calls. Need a payment made to the new contractor today before 3 or we lose the Nordby job. Invoice attached.
Go ahead without my signature, I'll sort the paperwork Monday. Let me know when done.

Sent from my phone`,
      lures: { authority: 0.9, urgency: 0.9 },
    },
    {
      id: "directory-renewal",
      label: "Renew the trade listing",
      subject:
        "2nd REMINDER - Nordvest Trade Register - Entry No. 77120 - Payment Overdue",
      body: `Dear {name},

According to our records, the annual entry for your company in the Nordvest Trade Register (entry no. 77120) has not been renewed.

Amount due: 4,890
Due date: OVERDUE

To avoid removal from the register and a collection charge of 750, payment must be received within 5 working days.

Nordvest Trade Register, Registry Office
This is not a public register. Payment of this notice confirms acceptance of our terms.`,
      lures: { authority: 0.8, urgency: 0.6 },
    },
  ],
} satisfies ScamDef;
