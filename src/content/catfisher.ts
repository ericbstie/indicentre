// EXTRA: the catfisher file. One clue a day about "Sam", the match who
// catfished the player before day 1. Each clue names one catfishing red
// flag, from the victim's side. Ignoring them costs nothing but the story.

import { clueCount, type GameState } from "../core/state.ts";

/** How a clue reaches the player: a mail, or a coworker leaning over. */
export type ClueVia =
  | { readonly kind: "mail"; readonly from: string; readonly subject: string }
  | { readonly kind: "coworker"; readonly coworker: string };

export interface Clue {
  readonly id: string;
  /** First day it can turn up. A missed coworker clue waits for the next chance. */
  readonly day: number;
  readonly via: ClueVia;
  /** Mail body, or the coworker's line. */
  readonly text: string;
  /** The File app row: what you now know about Sam. */
  readonly note: string;
  readonly redFlag: string;
}

export const clues: ReadonlyArray<Clue> = [
  {
    id: "no-video",
    day: 1,
    via: { kind: "mail", from: "Sam ♥", subject: "miss u already" },
    text: `hey you

Sorry I went quiet. Phone camera broke AGAIN, third one this year, the rig eats electronics. So no video call this week either. Next week promise.

Was thinking about you on my lunch break. 12:30 sharp, same as always lol

Sam`,
    note: "Sam's camera has been broken for the whole relationship.",
    redFlag: "Always a reason they can't video call or meet.",
  },
  {
    id: "too-fast",
    day: 2,
    via: { kind: "coworker", coworker: "priya" },
    text: "You left your chat open. Your Sam said 'soulmate' on day three? That's quick. We're told to wait until day five.",
    note: "Sam called you a soulmate three days in.",
    redFlag: "Big feelings, very fast, from someone you've never met.",
  },
  {
    id: "stock-photo",
    day: 3,
    via: {
      kind: "mail",
      from: "IT Desk",
      subject: "Shared drive full (again)",
    },
    text: `Hello all,

The shared drive is at 98%. Please clean up your folders.

Biggest offender: /marketing/profiles/smiles/ with 4,000 copies of the same photo. Person on a beach, chipped green mug, big grin. Whoever this is, they are in every folder. Please delete the duplicates.

IT Desk
(this is an automated message, please do not reply, we will not read it)`,
    note: "Sam's beach photo, green mug and all, sits in a folder on our own drive.",
    redFlag: "Their photo turns up somewhere else. Search the image.",
  },
  {
    id: "story-gaps",
    day: 4,
    via: { kind: "coworker", coworker: "mags" },
    text: "Oil rig, you said? My cousin works rigs. Six weeks on, no signal, one phone call on Sundays. Not forty texts a day.",
    note: "A rig worker with no signal who texts forty times a day.",
    redFlag: "The details of their life don't add up.",
  },
  {
    id: "off-app",
    day: 5,
    via: { kind: "mail", from: "Sam ♥", subject: "new number!!" },
    text: `Hi!! Let's stop using the dating app, the mods read everything and it's creepy. Text me on this number instead, it's just us there.

Can't wait for Friday's chat. 9:00 like always.

Sam
Sent from my work phone`,
    note: "Sam wanted off the dating app. And has a 9-to-5 'work phone'.",
    redFlag: "Pushes you off the dating app to a private chat.",
  },
  {
    id: "crisis-script",
    day: 6,
    via: { kind: "coworker", coworker: "rohan" },
    text: "Found a binder by the printer. 'Week two: introduce a crisis. Hospital or customs, never both.' Coffee ring on the cover. Green mug, I'd say.",
    note: "Sam's crisis came out of a binder by our printer.",
    redFlag: "A sudden crisis right before the first money ask.",
  },
  {
    id: "secret",
    day: 7,
    via: { kind: "mail", from: "Sam ♥", subject: "just between us" },
    text: `Please don't tell your friends about us yet. They'll get jealous and say things. They don't know me like you do.

Also customs are holding my parcel again, can you help one more time? I'll pay you back the day I'm home.

Sam`,
    note: "Sam asked you to keep it from your friends. Then asked for money again.",
    redFlag: "Asks you to keep the relationship secret.",
  },
  {
    id: "gift-cards",
    day: 8,
    via: { kind: "coworker", coworker: "priya" },
    text: "Gift card rack at the corner shop is empty again. Someone on this floor is 'stuck at customs' every Thursday. Same mug on his desk every Thursday too.",
    note: "Sam's customs fees are paid in gift cards. Someone here drinks from a green mug.",
    redFlag: "Wants gift cards, crypto or a wire. Money you can't get back.",
  },
];

/** Clues needed by day 10 for the file to count as complete. */
export const FILE_COMPLETE = 6;

/** The Boss on day 10, if the player built the file. Flavour only. */
export const fileCompleteMail = {
  id: "clue-finale",
  from: "The Boss",
  subject: "That file of yours",
  body: `Heard you've been keeping a file on our Sam.

Cute. Curious people sell. That's why we hired you.

Sam has a desk on this floor and a chipped green mug. You'll figure out which. Today's a good day to return the favour.

- The Boss`,
};

/** Inbox id of a mail clue; reading that mail finds the clue. */
export const clueMailId = (c: Clue) => `clue-${c.id}`;

/** Clues that can turn up by `day` and aren't found yet, oldest first. */
export const cluesDue = (day: number, found: ReadonlyArray<string>) =>
  clues.filter((c) => c.day <= day && !found.includes(c.id));

export const fileComplete = (s: GameState) => clueCount(s) >= FILE_COMPLETE;
