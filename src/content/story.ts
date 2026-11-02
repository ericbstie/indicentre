// The 10-day arc (research/story-and-engagement.md). One scam type per day.
// Voice: KPI culture and office life, never anyone's ethnicity or accent.
import type { Beat } from "../story/story.ts";

export const beats: ReadonlyArray<Beat> = [
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
