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
    },
  ],
} satisfies ScamDef;
