// The 10-day arc (research/story-and-engagement.md). One scam type per day.
// Voice: KPI culture and office life, never anyone's ethnicity or accent.
import type { Beat } from "../story/story.ts";

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
        line: "Welcome to Windowly tech support! Ahaha. Just kidding. We are a customer care company.",
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
        line: 'After every send it shows what they should have spotted. Read it. The boss calls that "quality". I call it knowing which mails to stop sending.',
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
];
