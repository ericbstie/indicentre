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
    "Paid it before lunch. Trine from Haldorsen even rang to say thanks, so that's sorted. Strange that Trine doesn't remember ringing.",
    "The boss said don't wait for him, so I didn't. He's back Monday. I'll tell him it's done.",
    "Renewed the register entry. We've never been in a trade register before. Feels official.",
  ],
  templates: [
    {
      id: "new-bank-details",
      label: "Supplier changed banks",
      subject: "Haldorsen Pipe & Valve: NEW bank details from 1 December",
      body: `Hi {name},

Please note we have moved banks. From today, pay all Haldorsen invoices to the new account below. The old one will be Closed.
Invoice 20419 (34,600) is due Friday, so please use the new details for that one already.

Any questions, ring me on the number in my signature.

Trine, Accounts
accounts@haldorsen-pipe.co`,
      lures: { authority: 0.6, urgency: 0.7 },
    },
    {
      id: "boss-in-a-meeting",
      label: "The boss needs it paid now",
      subject: "quick one before 3",
      body: `{name}, I'm in with the bank all afternoon, can't talk.
Need you to pay the attached invoice to the new contractor today, it's holding up the Nordby job.
Don't wait for me to sign, I'll sort the paperwork Monday.

Sent from my phone`,
      lures: { authority: 0.9, urgency: 0.9 },
    },
    {
      id: "directory-renewal",
      label: "Renew the trade listing",
      subject: "2nd REMINDER: Nordvest Trade Register, annual entry",
      body: `Dear {name},

Your company entry in the Nordvest Trade Register expires this month.
Annual fee 4,890 is now overdue. Pay within 5 days to avoid removal and a collection charge.

Nordvest Trade Register, Registry Office`,
      lures: { authority: 0.8, urgency: 0.6 },
    },
  ],
} satisfies ScamDef;
