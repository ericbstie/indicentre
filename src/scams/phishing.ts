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
  successLines: [
    "Done, I put in everything it asked for. It said my code was wrong the first time so I typed it again. Is that all now?",
    "hello i did the form but the page went white at the end. do i need to do it again or did it go through, i dont want to miss the deadline",
    "I filled it in. Then my bank rang about a payment I didn't make and asked if I had answered any emails. Please tell me that wasn't you.",
  ],
  templates: [
    {
      id: "account-locked",
      label: "Your account is locked",
      subject: "Security Alert : Your account has been temporarily Suspended",
      body: `Dear Customer,

We have detected unusual sign-in activity on your Fjellstad Bank online account. For your protection your account has been temporarily Suspended.

To restore full access kindly verify your identity within 24 hours. Failure to do so will result in permanent closure of your account.

[ Restore Access ]

Ref: FJB-SEC-20931
Fjellstad Bank Online Security | fjellstad-bank.secure-verify.net
This is an automated message, please do not reply.`,
      lures: { authority: 0.8, urgency: 0.9 },
    },
    {
      id: "parcel-fee",
      label: "Parcel waiting, small fee",
      subject: "QuickCrate: Delivery attempt failed (Ref NO22810476)",
      body: `Dear {name},

Your shipment NO22810476 could not be delivered because import charges have not been paid.

Status: On hold at terminal
Amount due: 1.99
Pay within: 48 hours

[ Pay and reschedule ]

If payment is not received the package will be returned to sender.
QuickCrate Customer Service | Do not reply to this email`,
      lures: { curiosity: 0.8, urgency: 0.5 },
    },
    {
      id: "inheritance",
      label: "Long-lost great-uncle",
      subject: "ATTN: {name} - NEXT OF KIN CLAIM (REF: LM/2291/NO)",
      body: `Attention {name},

I am Henrik Lie, private solicitor to the late Mr. Per Aas who died in a car accident abroad in 2023. He left the sum of 4,500,000 in a deposit account without a will, and our search has shown you as his closest living relative.

The bank has given notice that the fund will go to the State if not claimed within 14 working days. Kindly reply with your home address and private phone number so I can file the claim in your favour. A small administration fee for stamp duty will apply.

Please treat this as strictly confidential.

Barr. Henrik Lie
Lie & Moen Advokatfirma
(reply only to: henrik.lie.chambers@mailbox.co)`,
      lures: { greed: 1, authority: 0.4 },
    },
  ],
} satisfies ScamDef;
