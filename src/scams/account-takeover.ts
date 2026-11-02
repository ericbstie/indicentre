import type { ScamDef } from "./types.ts";

export default {
  id: "account-takeover",
  name: "Account takeover",
  channel: "social",
  price: 220,
  requires: "fake-website",
  minutes: 25,
  payout: 130,
  heat: { success: 5, fail: 12 },
  fitTags: ["curiosity", "fear", "urgency", "family"],
  whatToSpot: [
    "TODO: what to spot, from the victim's side.",
    "TODO: second line.",
    "TODO: the right thing to do instead.",
  ],
  successLine:
    "I logged in on the link and everything looked normal, so no harm done. Odd, though. My cousin says I've been asking everyone for money all week.",
  templates: [
    {
      id: "suspicious-login",
      label: "Suspicious login, verify now",
      subject: "Flokk Security: new login from Tromsø. Was this you?",
      body: `Hi {name},

Someone just signed in to your Flokk account from a device we don't recognise.
If this wasn't you, confirm your login in the next 30 minutes or we lock the account to protect it.

[ Secure my account ]  (flokk-account-check.help)

Flokk Trust & safety`,
      lures: { authority: 0.7, urgency: 0.8 },
      redFlags: [
        "A login link sent in a message, not shown in the app",
        "The address isn't Flokk's own site",
        "Thirty minutes to save an account you've had for years",
      ],
    },
    {
      id: "is-this-you",
      label: "Is this you in this video??",
      subject: "Flokk message from Kim: is this you??",
      body: `{name} is this you in this video?? someone posted it in the town group

flokk-video.live/watch/8812

you have to log in to see it, it's blurred otherwise. sorry, thought you should know`,
      lures: { curiosity: 0.9, urgency: 0.4 },
      redFlags: [
        "A video you have to log in again to watch",
        "The friend writes nothing like they normally do",
        "Being logged in already, then asked to log in again",
      ],
    },
    {
      id: "code-by-mistake",
      label: "Sent you my code by mistake",
      subject: "Flokk message from a friend: sorry, wrong number!",
      body: `hiii {name}, sorry to bother you. I sent my login code to your number by mistake

can you send it back to me? it's 6 digits, should be there now
it runs out in a few minutes and I'm locked out without it`,
      lures: { urgency: 0.7, curiosity: 0.3 },
      redFlags: [
        "Codes go to the account's own phone, so it's your code",
        "A friend who needs your code is someone else",
        "Ringing the friend would have ended it in ten seconds",
      ],
    },
  ],
} satisfies ScamDef;
