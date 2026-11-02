// The 10-day arc (research/story-and-engagement.md). One scam type per day.
// Voice: KPI culture and office life, never anyone's ethnicity or accent.
import type { Beat, Line } from "../story/story.ts";

export const beats: ReadonlyArray<Beat> = [
  // Day 0: you get catfished. Day 10 mirrors it.
  {
    id: "d0-catfished",
    day: 0,
    on: "dayStart",
    atDesk: true,
    lines: [
      {
        speaker: "Phone",
        line: "HOT SINGLES in your area! 3 online now, 400 m away. Say hi?",
      },
      {
        speaker: "Angel ♥",
        line: "hiii sorry I think a friend gave me the wrong number?? you seem sweet tho. what do I call you",
        choose: { key: "nick", options: ["Tiger", "Sunshine"] },
      },
      {
        speaker: "Phone",
        line: "Eight days of good-morning texts. She laughs at your jokes. Her dog is called Biscuit. Every time you try to video call, her camera is broken.",
      },
      {
        speaker: "Angel ♥",
        line: "{nick} I'm so embarrassed. my card got blocked and the hospital wants 200 before they see mum. I pay you back friday I promise",
      },
      {
        speaker: "Phone",
        line: "You sent 200. Message not delivered. Angel ♥ has left the chat.",
      },
      {
        speaker: "Boss",
        line: "Aww. Did you just get scammed? Come. I'll show you how it works.",
      },
    ],
    learn:
      "Never met, camera always broken, then a crisis that needs money: stop there. Here you learn each scam by running it, so it doesn't happen to you again.",
  },
  // Day 1: phishing. Priya shows you the ropes; the boss counts.
  {
    id: "d1-start",
    day: 1,
    on: "dayStart",
    introduces: "phishing",
    free: true,
    lines: [
      {
        speaker: "Boss",
        line: "Welcome to Windoze tech support! Ahaha. Just kidding. We are a customer care company.",
      },
      {
        speaker: "Boss",
        line: "Quota today: {quota} bucks. And more than Tommy.",
      },
    ],
  },
  {
    id: "d1-pc",
    day: 1,
    on: "pc",
    lines: [
      {
        speaker: "Priya",
        line: "You're the new one? Leads app. Pick a person, pick a mail, send.",
      },
      {
        speaker: "Priya",
        line: 'If they bite, they write back. If they don\'t, the TV usually tells you why. The boss calls that "quality". I call it knowing which mails to stop sending.',
      },
    ],
    learn:
      "A deadline, a link, a sender that's almost right. If a mail has all three, don't click. Open the real site yourself.",
  },
  {
    id: "d1-scam",
    day: 1,
    on: "scam",
    lines: [
      {
        speaker: "Priya",
        line: "{earned} of {quota}. Every send eats clock. At five the boss walks over, and you'll want a number by then.",
      },
    ],
  },
  {
    id: "d1-end",
    day: 1,
    on: "dayEnd",
    lines: [
      {
        speaker: "Tommy",
        line: "First day? I did four hundred on my first day. Ask anyone. Like the watch? It's real. Mostly.",
      },
    ],
  },
  // Day 2: tech support. "Show me your technique" with the boss behind you.
  {
    id: "d2-start",
    day: 2,
    on: "dayStart",
    introduces: "tech-support",
    free: true,
    watch: true,
    lines: [
      {
        speaker: "Boss",
        line: "Phones today. Rohan's script is on your desk. It has a coffee ring on it. That's how you know it works.",
      },
      { speaker: "Boss", line: "And today I watch. Show me your technique." },
    ],
  },
  {
    id: "d2-watch",
    day: 2,
    on: "watching",
    lines: [
      {
        speaker: "Boss",
        line: "Rhythm, junior. They doubt, you push. They do what you say, you stall. Never let them hang up.",
      },
    ],
    call: {
      scam: "tech-support",
      victim: {
        name: "Arne",
        age: 71,
        occupation: "retired bus driver",
        detail:
          "Got a tablet for his birthday and keeps it in the box it came in.",
        defense: {
          behavior:
            "Asked his daughter before doing anything a caller told him to.",
          line: "My daughter says real companies don't ring people about their computer. So. Bye.",
        },
      },
      ms: 3500,
      pass: 4,
      steps: [
        {
          line: "Hello? Who is this? My computer seems fine to me.",
          want: "Push",
        },
        { line: "Oh. Errors? Alright. What do I click?", want: "Stall" },
        {
          line: "Hang on, let me get my daughter. She does computers.",
          want: "Push",
        },
        {
          line: "I'm at the shop. The lad at the till asked what the cards are for.",
          want: "Push",
        },
        {
          line: "Right, I've scratched the back. Lots of numbers. Shall I read them?",
          want: "Stall",
        },
      ],
      won: {
        speaker: "You",
        line: "Five hundred. Thank you, Arne. Do not redeem.",
      },
      lost: {
        speaker: "Arne",
        line: "My daughter says real companies don't ring people about their computer. So. Bye.",
      },
      payout: 50,
      minutes: 30,
      heat: { success: 3, fail: 8 },
    },
    learn:
      "Real companies don't call you about your computer. Gift cards are never a payment. If a caller won't let you hang up or ask someone, hang up.",
  },
  // Day 3: breather. Marketplace in the Shop; the first lead who says no.
  {
    id: "d3-start",
    day: 3,
    on: "dayStart",
    introduces: "marketplace",
    lines: [
      {
        speaker: "Mags",
        line: "Boss is in a meeting about meetings. Breathe.",
      },
      {
        speaker: "Mags",
        line: "Marketplace is in the Shop now. You're the buyer: full price, no haggling, and your courier pays by link. Or pay too much and ask for the difference back.",
      },
    ],
  },
  {
    id: "d3-pc",
    day: 3,
    on: "pc",
    lines: [
      {
        speaker: "Mail",
        line: 'Re: your listing. "My son says the app has a pay button for a reason. I\'ll use that."',
      },
      { speaker: "Mags", line: "Happens. Sons are bad for business." },
    ],
    learn:
      "Buyers pay you, never the other way. A link that wants your card so you can receive money is taking it.",
  },
  // Day 4: volume. Parcel texts, heat climbs, the first news report.
  {
    id: "d4-start",
    day: 4,
    on: "dayStart",
    introduces: "parcel-sms",
    lines: [
      {
        speaker: "Boss",
        line: "Volume day! Parcel texts. Everybody is waiting for a parcel. Even me. It's a chair.",
      },
      {
        speaker: "Boss",
        line: "Watch the meter. Send a thousand of anything and someone notices.",
      },
    ],
  },
  {
    id: "d4-pc",
    day: 4,
    on: "pc",
    introduces: "pyramid",
    lines: [
      {
        speaker: "Mags",
        line: "Side gig in the Shop. Sell people a starter kit, they sell it to their friends. Nobody sells it to a customer.",
      },
      {
        speaker: "Mags",
        line: "Find the ones posting about rent. Call them hun. Say spots are filling up.",
      },
    ],
  },
  {
    id: "d4-end",
    day: 4,
    on: "dayEnd",
    lines: [
      {
        speaker: "TV",
        line: 'Evening news. A pensioner in Tromsø paid 2.99 to release a parcel she never ordered. Then her card paid 2,990 more. "I just wanted the parcel," she says.',
      },
      { speaker: "Priya", line: "Turn it over. It's always the same lady." },
    ],
    learn:
      "Carriers don't text you to pay a fee by link. Check the tracking number on the carrier's own site.",
  },
  // Day 5: bank calls. Persondata makes them land.
  {
    id: "d5-start",
    day: 5,
    on: "dayStart",
    introduces: "bank-impersonation",
    lines: [
      {
        speaker: "Boss",
        line: 'Quota goes up today. So does ambition. You are now "the fraud department".',
      },
      {
        speaker: "Rohan",
        line: "Buy the data package before you call. A pensioner who hears her own dog's name doesn't hang up.",
      },
    ],
    learn:
      'Your bank will never ask you to move money to a "safe account" or read out a code. Hang up and call the number on your card.',
  },
  {
    id: "d5-pc",
    day: 5,
    on: "pc",
    introduces: "art-commission",
    lines: [
      {
        speaker: "Priya",
        line: "Slow call day? Do art. People post their dead dog and ask for a painting. You answer with somebody else's portfolio.",
      },
      {
        speaker: "Priya",
        line: "Half up front. The picture machine does the rest in nine seconds. It can't count legs, but grief can't either.",
      },
    ],
    learn:
      "Ask an artist for a quick sketch made just for you, and pay through a site that holds the money until the work arrives.",
  },
  // Day 6: the twist. The intro chat was the center's recruitment funnel.
  {
    id: "d6-start",
    day: 6,
    on: "dayStart",
    introduces: "catfish",
    free: true,
    lines: [
      {
        speaker: "Tommy's screen",
        line: 'Tommy\'s at lunch. His screen is unlocked. A chat window: "hiii sorry I think a friend gave me the wrong number??" Same photo. Same dog. Biscuit.',
      },
      {
        speaker: "Tommy",
        line: "Oh. You saw. Don't take it personal, {nick}. Half this floor got hired off that chat.",
      },
      {
        speaker: "Boss",
        line: "Aww, did you just get- sorry. Habit. It's page one of the script.",
      },
      {
        speaker: "Boss",
        line: "Romance desk is yours. Go easy today. Feelings take time.",
      },
    ],
    learn:
      'Reverse-search the profile photo. Count how often the camera "breaks". Someone real will video call before they ask for anything.',
  },
  // Day 7: the boss's bonus scheme, funded by lottery mails.
  {
    id: "d7-start",
    day: 7,
    on: "dayStart",
    introduces: "lottery",
    lines: [
      {
        speaker: "Boss",
        line: "New bonus scheme! Bring in two juniors, get a cut of what they make. They bring in two each. It's called Team Growth. Do not draw it as a triangle.",
      },
      {
        speaker: "Priya",
        line: "And it's paid for with lottery mails. \"You've won.\" Nobody ever asks what they entered.",
      },
    ],
    learn:
      "You can't win a draw you never entered. If the money comes from recruiting people, not selling something, it's a pyramid.",
  },
  // Day 7, second desk: blackmail mails bluffing with leaked passwords.
  {
    id: "d7-blackmail",
    day: 7,
    on: "dayStart",
    introduces: "blackmail",
    lines: [
      {
        speaker: "Boss",
        line: "The data package has a back shelf. Old passwords from old leaks. We don't throw food away here.",
      },
      {
        speaker: "Priya",
        line: "Mail them their own password from 2019. Say you saw everything through the camera. You saw nothing. Ask for crypto, give them a deadline.",
      },
    ],
    learn:
      "A threat mail that quotes an old password got it from a leak, not your camera. There is no video. Change the password, report it, never pay.",
  },
  // Day 8: Tommy fights back. Account takeover.
  {
    id: "d8-start",
    day: 8,
    on: "dayStart",
    introduces: "account-takeover",
    lines: [
      {
        speaker: "Tommy",
        line: 'Two of your leads got a text last night from "a friend". Telling them it\'s a scam. Wonder who.',
      },
      {
        speaker: "Mags",
        line: 'Two can play. Account takeover is in the Shop. You message them as their own friend: "sent you a code by mistake, can you send it back?"',
      },
    ],
    learn:
      "Never share a login code, even with a friend. A friend who needs your code is someone else.",
  },
  // Day 9: the big fish. Slow trust, one fake invoice.
  {
    id: "d9-start",
    day: 9,
    on: "dayStart",
    introduces: "fake-invoice",
    lines: [
      {
        speaker: "Boss",
        line: "Big fish. Fjordvik Rør AS. Twelve vans, one accountant, and she's on holiday next week.",
      },
      {
        speaker: "Boss",
        line: 'Be polite. Be boring. Then one invoice with new bank details. And the meter is high, so if I hear the word "raid" I start shredding.',
      },
    ],
    learn:
      "A supplier who changes bank details by email is the oldest trick in accounts. Call them on the number you already have.",
  },
  {
    id: "d9-pc",
    day: 9,
    on: "pc",
    introduces: "company-hack",
    lines: [
      {
        speaker: "Rohan",
        line: "While you're in the accounts, try the staff. New hires post the job on day one. Badge photo, team photo, the boss's name in the caption.",
      },
      {
        speaker: "Rohan",
        line: 'Company hack is in the Shop. One mail from "the CEO" or "IT". Gift cards, or a password typed into your fake website. Nobody new questions the CEO.',
      },
    ],
    learn:
      "A CEO who wants gift cards by mail is not your CEO. Check strange requests on a channel you already use, and log in from your own bookmark.",
  },
  // Day 10: the finale plays at the run's end (see `endings`).
  {
    id: "d10-start",
    day: 10,
    on: "dayStart",
    lines: [
      {
        speaker: "Boss",
        line: "Last day. You're level with Tommy. Top seller gets the window desk. And my respect. Mostly the desk.",
      },
      {
        speaker: "Tommy",
        line: "Lonely at the top, {nick}. Ha. I'm not lonely. I've got eleven chats open.",
      },
    ],
  },
];

export interface Ending {
  readonly lines: ReadonlyArray<Line>;
  readonly title: string;
  /** One line above the "What to spot" list. */
  readonly note?: string;
}

/** How a run ends. The win mirrors day 0: you catfish the catfisher. */
export const endings: Readonly<Record<"won" | "shutdown" | "fired", Ending>> = {
  won: {
    title: "Top seller",
    lines: [
      {
        speaker: "Phone",
        line: "Day 10, 15:10. A new profile messages Tommy. A nice photo. A dog. A camera that's always broken.",
      },
      { speaker: "Tommy", line: "lol who is this. ok. you seem sweet tho" },
      {
        speaker: "Phone",
        line: "16:40. A crisis. A small ask. Then a bigger one. Tommy pays both.",
      },
      {
        speaker: "Boss",
        line: "Top seller! I knew it. I said it. Nobody heard me say it, but I said it.",
      },
      {
        speaker: "Boss",
        line: 'Here. The "hot singles" account. You run the funnel now, {nick}.',
      },
      {
        speaker: "Phone",
        line: 'A new chat opens. Somewhere a junior is typing: "hi?"',
      },
    ],
    note: "Never met. Camera always broken. A crisis, a small ask, a bigger one. On day 0 you missed every one. Tommy did too.",
  },
  shutdown: {
    title: "Raided",
    lines: [
      { speaker: "Boss", line: "Shred everything! Not the coffee machine!" },
      {
        speaker: "TV",
        line: "Police raided a call centre this morning. The servers left in evidence bags, still warm.",
      },
    ],
  },
  fired: {
    title: "Fired",
    lines: [
      {
        speaker: "Boss",
        line: "Two days under quota. Your desk goes to Tommy.",
      },
      { speaker: "Tommy", line: "Thanks." },
    ],
  },
};
