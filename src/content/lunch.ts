// The lunch thread: Angel's ordinary mails between the catfisher clues. No red
// flags on purpose. This is the part that feels real, so day 6 hurts.

import type { GameState } from "../core/state.ts";

/** Same sender as the catfisher file's mail clues. */
export const LUNCH_FROM = "Angel ♥";

export interface LunchMail {
  readonly id: string;
  readonly day: number;
  readonly subject: string;
  /** Written when it lands, so it can mention how yesterday went. */
  readonly body: (s: GameState) => string;
}

/** Did the last shift meet quota? Undefined before the first shift ends. */
const metYesterday = (s: GameState) => s.days.at(-1)?.met;

export const lunchMails: ReadonlyArray<LunchMail> = [
  {
    id: "plan",
    day: 2,
    subject: "lunch plan",
    body: () => `ok I made a list of places for when I'm back

1. the noodle place by the station. you said they put the egg in wrong and I need to see this

that's the list

Thursday the 14th? 12:30. I'll be the one with the sunburn

Angel`,
  },
  {
    id: "table",
    day: 3,
    subject: "Re: lunch plan",
    body: (
      s,
    ) => `Rang the noodle place. Window table, Thursday the 14th, 12:30. They wanted a name so I gave yours, hope that's ok.

${
  metYesterday(s) === false
    ? "You sounded tired last night. Don't let them keep you late, nobody gets a medal for that."
    : "You sounded happy last night. Whatever you did at work, do it again."
}

Fish in the mess hall again. Third day running. I'm dreaming about noodles.

Angel`,
  },
  {
    id: "gran",
    day: 4,
    subject: "ring your gran",
    body: () => `The TV in the mess hall had a thing on about people getting calls from fake banks. Old people mostly.

Ring your gran tonight. Not about that, just to hear her. I never rang mine enough.

Ten days till noodles.

Angel`,
  },
];

/** Inbox id of a lunch mail. */
export const lunchMailId = (m: LunchMail) => `lunch-${m.id}`;

export const lunchMailsDue = (day: number) =>
  lunchMails.filter((m) => m.day <= day);
