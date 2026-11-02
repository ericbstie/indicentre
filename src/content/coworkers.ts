import { defineEvent } from "../core/events.ts";
import { defineSlice } from "../core/slice.ts";
import type { GameState, ScamId } from "../core/state.ts";
import type { NpcLook } from "../scene/npc.ts";

export interface Coworker {
  readonly id: string;
  readonly name: string;
  /** The scam type their hints are about. */
  readonly specialty: ScamId;
  /** Index into the office's coworker desks. */
  readonly desk: number;
  readonly look: NpcLook;
  /**
   * Said in order. The first is free; each failed attempt at their
   * specialty unlocks one more. Each hint is a red flag seen from our side
   * and names one victim tag, as the Leads chips spell it.
   */
  readonly hints: ReadonlyArray<string>;
  /** When they have nothing new for you; said in turn. */
  readonly idle: ReadonlyArray<string>;
  /** Replaces `idle` once you've moved to a better desk. */
  readonly newDesk?: string;
}

export const coworkers: ReadonlyArray<Coworker> = [
  {
    id: "priya",
    name: "Priya",
    specialty: "phishing",
    desk: 0,
    look: {
      shirt: 0x7a3b8f,
      skin: 0x8d5a3b,
      hair: 0x1a1210,
      outfit: "casual-female",
    },
    hints: [
      "The subject line does all the work. If there's no urgency in it, nobody opens it.",
      "Pensioners read every word. Students read nothing. Both open anything that smells of authority.",
      "Write as their bank. People check the sender name. Almost nobody checks what comes after the @.",
      "Text them about a parcel and ask for 1.99, not 200. A small fee doesn't feel like money until it's their card number.",
      "The ones who hover over the link before clicking? Let them go. Pick the ones with curiosity, they click first.",
      "Greed is the quiet lure. Nobody writes back angry about an inheritance. They write back with questions.",
    ],
    idle: [
      "That's my fourteenth mail today and it's not even lunch. Don't stand there, it shows up on my numbers.",
      "Fined fifty for no first mail before nine. The fines list is longer than my script now.",
      "Can't talk. The boss walks past every eleven minutes and I've timed it.",
    ],
  },
  {
    id: "rohan",
    name: "Rohan",
    specialty: "tech-support",
    desk: 2,
    look: {
      shirt: 0x3b6e8f,
      skin: 0xa0704a,
      hair: 0x2b1d14,
      outfit: "casual2-male",
    },
    hints: [
      "Fear sells repairs. Tell them the computer is 'sending errors'. Nobody can see an error, so it sounds expensive.",
      "Authority is a department, not a name. 'The security desk' beats 'Rohan' every time.",
      "Urgency keeps them off the official number. Once they say they'll ring back, it's over. Hang up before they do.",
      "New tablet, grandkids set it up, nobody showed them anything. That's a tech-help lead, so call them first.",
      "The lonely ones stay on the line. The second they ask someone else in the house, you've lost them.",
      "Bank calls? Say 'fraud department' and they thank you for stealing from them. Just don't let them hang up to ring the card number.",
    ],
    idle: [
      "My chair lost a wheel on Tuesday. Facilities said Q3. It's November.",
      "I've been on hold with our own IT for twenty minutes. Professionally, I respect it.",
      "Coffee is for closers. I closed once in August, so I get the decaf.",
    ],
    newDesk:
      "You got a partition? I've asked for one since March. Enjoy hearing yourself think, I guess.",
  },
  {
    id: "mags",
    name: "Mags",
    specialty: "marketplace",
    desk: 4,
    look: {
      shirt: 0x8f6a2b,
      skin: 0xc49a78,
      hair: 0x6b3a1e,
      outfit: "casual3-female",
    },
    hints: [
      "Pose as the buyer. Sellers want the thing gone, so nobody asks why a buyer's courier pays by link. The ones who post a parcel every week ask least.",
      "Offer the full asking price and don't haggle. A seller who got their price is too busy with the greed to look at how you're paying.",
      "The courier page says RECEIVE in big letters. Curiosity gets the click, the card form does the rest.",
      "Overpay on purpose and ask for the difference back for your mover. Add urgency: he collects Thursday, so it has to go today.",
      "Invoices? Write as the supplier, a week before payday, with all the authority of a letterhead. Bookkeepers who ring the old number to check, you just lost.",
    ],
    idle: [
      "Someone ate my yoghurt. It had my name on it. In marker. I'm sending a mail to all.",
      "This week's prize is a phone charger. Last week it was the same charger.",
      "Don't touch the plant. It's the only thing in here that's growing.",
    ],
  },
];

type Counts = Readonly<Record<string, number>>;
const bump = (counts: Counts, id: string): Counts => ({
  ...counts,
  [id]: (counts[id] ?? 0) + 1,
});

/** Failed attempts per scam type; coworkers open up as this grows. */
const scamFails = defineSlice(
  "fails",
  {} as Counts,
  (fails, a: { readonly type: "fails/add"; readonly scam: ScamId }) =>
    bump(fails, a.scam),
);
export const scamFailed = (scam: ScamId) =>
  ({ type: "fails/add", scam }) as const;
const failsAt = (s: GameState, scam: ScamId) => scamFails.get(s)[scam] ?? 0;

/** Hints heard so far, per coworker id. */
const hintsHeardSlice = defineSlice(
  "hints",
  {} as Counts,
  (heard, a: { readonly type: "hints/heard"; readonly coworker: string }) =>
    bump(heard, a.coworker),
);
export const heardHint = (coworker: string) =>
  ({ type: "hints/heard", coworker }) as const;
export const hintsHeard = (s: GameState, coworker: string) =>
  hintsHeardSlice.get(s)[coworker] ?? 0;

/** A coworker just shared one of their hints. */
export const HintGiven = defineEvent<{
  readonly coworker: string;
  readonly scam: ScamId;
  readonly hint: string;
}>("HintGiven");

/** Hints this coworker will share, given how often the player has failed their specialty. */
export const unlockedHints = (c: Coworker, s: GameState) =>
  c.hints.slice(0, 1 + failsAt(s, c.specialty));

/** What they say the `n`th time they have no new hint for you. */
export const idleLine = (c: Coworker, s: GameState, n: number) =>
  (s.workplace.deskTier > 0 && c.newDesk) || c.idle[n % c.idle.length]!;
