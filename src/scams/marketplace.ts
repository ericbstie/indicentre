import type { ScamDef } from "./types.ts";

export default {
  id: "marketplace",
  name: "Marketplace overpayment",
  channel: "marketplace",
  price: 100,
  minutes: 25,
  payout: 60,
  heat: { success: 3, fail: 8 },
  fitTags: ["parcel", "greed"],
  whatToSpot: [
    "Keep the payment and the chat inside the marketplace.",
    "Overpaid and asked to send the difference back? That first payment will bounce.",
    "You never type in card details to receive money.",
  ],
  successLine:
    "Sent the difference to his mover. Nice man. Shame nobody ever came for the bike.",
  lesson:
    "Keep the whole sale inside the marketplace. Nobody overpays a stranger by accident.",
  templates: [
    {
      id: "overpay",
      label: "Buyer pays too much",
      subject: "Re: your listing. still available??",
      body: `Hi {name}, I'll take it, asking price is fine.
I'm sending 3,000 instead of 1,200 because my mover needs paying too. Please pass him the 1,800 difference, he collects Thursday.
God bless`,
      lures: { greed: 0.7, urgency: 0.4 },
      redFlags: [
        "Pays more than the asking price, then wants change back",
        "Wants the money handled outside the app",
        "Never asks one question about the item",
      ],
    },
    {
      id: "courier-link",
      label: "Courier pays you through a link",
      subject: "Re: your listing. Paid via Kwikship!",
      body: `Hi {name}! Payment is reserved with Kwikship courier.
Enter your card here to RECEIVE the money: [ Receive 1,200 ]
Pickup booked for tomorrow 10:00.`,
      lures: { curiosity: 0.6, urgency: 0.6, greed: 0.4 },
      redFlags: [
        "Your card details are never needed to receive money",
        "The link leads outside the marketplace",
        "The buyer picked a courier you've never heard of",
      ],
    },
  ],
} satisfies ScamDef;
