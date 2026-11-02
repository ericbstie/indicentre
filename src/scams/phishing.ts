import type { ScamDef } from "./types.ts";

export default {
  id: "phishing",
  name: "Phishing mail",
  channel: "mail",
  price: 0,
  minutes: 20,
  payout: 40,
  heat: { success: 2, fail: 8 },
  fitTags: ["parcel", "bank"],
  whatToSpot: [
    "Urgency is the tell. Real deadlines don't arrive by surprise email.",
    "Check the sender's domain, not the name it shows.",
    "Never log in through a link. Type the address yourself.",
  ],
  successLine:
    "Done! I filled everything in. Thank you so much for warning me, you are very kind.",
  templates: [
    {
      id: "account-locked",
      label: "Your account is locked",
      subject: "URGENT: Account suspended - action required",
      body: `Dear valued customer {name},

We detected unusual activity and your BankCo account has been LOCKED.
Verify your identity within 24 hours or your account will be closed permanently.

[ Verify Now ]  (bankco-secure-login.net)

BankCo Security Team`,
      lures: { authority: 0.8, urgency: 0.9 },
      redFlags: [
        "Pressure to act within hours",
        "Link goes to a lookalike domain, not the bank's real site",
        "Banks never ask you to log in through an email link",
      ],
    },
    {
      id: "parcel-fee",
      label: "Parcel waiting, small fee",
      subject: "Your parcel is on hold",
      body: `Hi {name},

Your parcel could not be delivered due to an unpaid customs fee of 2.99.
Pay now to schedule redelivery: [ Pay fee ]

ParcelPost-Delivery Services`,
      lures: { curiosity: 0.8, urgency: 0.5 },
      redFlags: [
        "You weren't expecting a parcel",
        "A tiny fee is bait to get your card details",
        "Sender name doesn't match the real postal service",
      ],
    },
    {
      id: "inheritance",
      label: "Long-lost great-uncle",
      subject: "Confidential: unclaimed inheritance of 4,500,000",
      body: `Dear {name},

I am the solicitor of your late great-uncle Bartholomew, who left 4,500,000 to his closest living relative. That is you.
To release the funds, a small processing fee is required. Kindly reply with your bank details.

Barrister Reginald P. Fortune, Esq.`,
      lures: { greed: 1, authority: 0.4 },
      redFlags: [
        "A relative you've never heard of",
        "You must pay a fee to receive money",
        "Asks for bank details by email",
      ],
    },
  ],
} satisfies ScamDef;
