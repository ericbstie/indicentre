// Text banks for the office news TV. Voice: local paper, flat, one number,
// one place, one name. Victims are people, not punchlines. No pronouns for
// victims (we don't know them), no triads. Slots: {place} {role} {name}
// {age} {amount} {scam}. {role} is the victim's occupation, lowercased.

import type { NewsItem } from "../news/news.ts";

export const PLACES = [
  "Bergen",
  "Drammen",
  "Tromsø",
  "Skien",
  "Hamar",
  "Bodø",
  "Ålesund",
  "Moss",
  "Kristiansand",
  "Lillehammer",
];

export const VICTIM_HEADLINES = [
  "{place} {role} loses {amount} kr to {scam}",
  "{amount} kr gone in one afternoon, says {place} {role}",
  "Police warn after {place} {role} pays {amount} kr",
  "{place}: {role} hit by {scam}, loses {amount} kr",
  "Another {scam} in {place}. This time {amount} kr",
  "{role} in {place} out {amount} kr after one click",
];

/** What the victim told the reporter. Short, specific, a little off-topic. */
export const VICTIM_QUOTES = [
  "It had the logo. It had my name. I thought that was enough.",
  "I was going to buy a new fridge with that.",
  "I told my son. He went very quiet on the phone, which is worse.",
  "They were so polite. That's the part I keep thinking about.",
  "I checked the sender. I just didn't know what I was checking for.",
  "I've changed every password. I wrote them in a notebook. Is that bad?",
  "It said twenty-four hours. I didn't want to lose the account.",
  "The real bank called the next day. Too late, but nice of them.",
  "I keep opening the mail again. It still looks real to me.",
  "I'm not stupid. I was in a hurry.",
  "My grandson does my email on Sundays now.",
  "They thanked me at the end. They actually thanked me.",
  "The police said I'm the third one on this street this month.",
  "I was on the bus. I just wanted it sorted before my stop.",
  "The screen said Fjellstad Bank. I checked. That was the whole problem.",
  "It was 1.99. Who checks a link for 1.99?",
  "It was our plumbing supplier's name. Their logo. One extra dash in the address.",
  "It had my old password in the subject. I paid for a video that never existed.",
  "The portrait was of our dog. Mostly. I paid half up front, then the other half for the fixed one.",
];

/**
 * A target who did not fall for it. The profile and quote come from the
 * victim's own defense (src/victims/tables.ts), so the lesson is theirs.
 */
export const SPOTTED_HEADLINES = [
  "{place} {role} spots {scam}, deletes it",
  "Not today: {place} {role} reports {scam} to police",
  "{role} in {place} sees through {scam}",
  "{place} {role} forwards {scam} to police, goes back to lunch",
];

/** World news the TV cycles when nothing has happened. */
export const AMBIENT: ReadonlyArray<NewsItem> = (
  [
    ["Hamar council votes 7 to 6 to keep the Thursday market", ""],
    [
      "BankCo repeats: it will never ask for your code",
      `"We print it on the receipts now," a spokesperson said.`,
    ],
    ["Parcel volumes up 18% before Christmas, ParcelPost says", ""],
    [
      "Bodø police: fake delivery texts are up again this autumn",
      `"If you didn't order anything, there is no parcel."`,
    ],
    [
      "Skien pensioners' club starts Tuesday 'scam coffee'",
      `"We read the strange emails out loud. It's become quite popular."`,
    ],
    ["Sleet in the west tomorrow, 4 degrees. Bring the good gloves", ""],
    ["Survey: one in three has clicked a link they regretted", ""],
    ["Student loans pay out Friday. So do the fake 'loan office' mails", ""],
    ["Lottery board: you can't win a draw you never entered", ""],
    [
      "Moss man, 81, takes his first computer course. Passes",
      `"The teacher said hover before you click. I hover over everything now."`,
    ],
    ["Ålesund ferry 40 minutes late, seagull blamed", ""],
    [
      "Report: scam call centres 'more organised than ever'",
      `"Some of them have quarterly targets," one investigator said.`,
    ],
    ["Phone networks to label suspected spam calls from March", ""],
    ["Drammen bakery wins the regional cinnamon bun prize again", ""],
    ["Bank fraud in the region: 412 cases so far this year", ""],
    [
      "Kristiansand school teaches 12-year-olds to spot fake prize mails",
      `"They're better at it than the staff," the head teacher admitted.`,
    ],
    ["Police: no real officer asks you to move money to a 'safe account'", ""],
    ["Local man wins 2,000 kr on a scratch card, tells everyone", ""],
    [
      "Tromsø library opens an 'is this a scam?' desk on Saturdays",
      `"Bring the letter. Or the phone. Or your grandson."`,
    ],
    ["Study: most scam victims aren't old. Most are in a hurry", ""],
    [
      "Bergen illustrator finds her pet portraits on a stranger's commission page",
      `"Twelve people paid him for my work. None of them got it," she said.`,
    ],
    [
      "Police: 'I saw you through your camera' mails are a bluff",
      `"The password comes from an old leak. There is no video. Don't pay, report it," an officer said.`,
    ],
    [
      "Skien plumbing firm pays 34,600 kr to a supplier's 'new account'",
      `"The supplier never moved banks," the owner said. "We ring them now. Every time."`,
    ],
  ] as const
).map(([headline, quote]) => ({
  headline,
  profile: "",
  quote,
  kind: "ambient",
}));
