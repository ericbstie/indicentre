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
  {
    id: "d1-start",
    day: 1,
    on: "dayStart",
    introduces: "phishing",
    free: true,
    lines: [
      {
        speaker: "Boss",
        line: "Mail first. Email is cheap, email is fast, and people still click things.",
      },
    ],
  },
];
