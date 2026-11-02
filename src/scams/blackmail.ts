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
    "I paid it. Please delete it now. I have changed the password, and the old one from 2019 as well. Please don't write to me again.",
    "i didnt know how to buy crypto so a young man at the kiosk helped me. it is sent. i havent told anyone",
    "Sent it. I still don't know what you think you have. I've put tape over the camera and I don't sleep much.",
  ],
  templates: [
    {
      id: "old-password",
      label: "I know your password",
      subject: "{name} - sommer2019",
      body: `Hello {name},

I know that sommer2019 is your password. You dont know me and you are probably thinking why you are getting this mail.

I placed a software on a website you visited and it gave me access to your device and camera. I have recorded you. I also copied all your contacts.

What you should do: pay 1,500 in crypto to the wallet below. You have 48 hours. I have a special pixel in this mail and I know right now you have read it.

If I dont get the payment, the video goes to all your contacts. If I get it, I delete everything and you never hear from me again.

Wallet: qx77f41nord2290akd8r03mzl

Do not reply, this mail is auto-generated.`,
      lures: { authority: 0.4, urgency: 0.6 },
    },
    {
      id: "deadline",
      label: "48 hours to pay",
      subject: "SECOND NOTICE {name}",
      body: `{name},

this is second time I write you. You did not pay.

24 hours left. After that the video goes to your family and your work first.

Same wallet: qx77f41nord2290akd8r03mzl
Amount is now 2,000 because you made me wait.

Dont go to police. They can not help you and I will know.`,
      lures: { urgency: 0.9 },
    },
    {
      id: "be-reasonable",
      label: "Let's keep this between us",
      subject: "Re: our little secret",
      body: `Dear {name},

I am not a bad person and I do not want to ruin your life. Think of this as a business deal.

I have what I have. You know which password I mean. For 1,500 in crypto I delete it and we both forget this.

Nobody needs to know. Not your work, not your friends.`,
      lures: { authority: 0.3, urgency: 0.5, curiosity: 0.3 },
    },
  ],
} satisfies ScamDef;
