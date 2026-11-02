import { failsAt, type GameState, type ScamId } from "../core/state.ts";
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
   * specialty unlocks one more. Each hint is a red flag seen from our side.
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
      "The subject line does all the work. If it doesn't sound like a deadline, nobody opens it.",
      "Pensioners read every word. Students read nothing. Write for the one you've got.",
      "People check the sender name. Almost nobody checks what comes after the @.",
      "Ask for 2.99, not 200. A small fee doesn't feel like money until it's their card number.",
      "The ones who hover over the link before clicking? Let them go. They're already gone.",
      "Get one Flokk login and you've got four hundred friends who trust the name. Just pray they haven't turned on two-factor.",
    ],
    idle: [
      "That's my fourteenth mail today and it's not even lunch. Don't stand there, it shows up on my numbers.",
      "The printer jammed on my quota sheet. I'm taking it as a sign.",
      "Can't talk. The boss walks past every eleven minutes. I timed it.",
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
      "Nobody fears a virus they can't see. Tell them the computer is 'sending errors'. Sounds expensive.",
      "Say a department, not a name. 'The security desk' beats 'Rohan' every time.",
      "If they say they'll call back on the official number, it's over. Hang up before they do.",
      "New tablet, grandkids set it up, nobody showed them anything. That's the call.",
      "Keep them on the line. The second they ask someone else in the house, you've lost them.",
      "Bank calls? Say 'fraud department' and they thank you for stealing from them. Just don't let them hang up to ring the card number.",
    ],
    idle: [
      "My chair lost a wheel on Tuesday. Facilities said Q3. It's November.",
      "I've been on hold with our own IT for twenty minutes. Professionally, I respect it.",
      "Bring coffee next time. Talking costs coffee.",
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
      "Cheap listing, nice photos, and you're 'away for work'. That's why it has to be shipped.",
      "Get them off the app. The app has a report button. A text message doesn't.",
      "Ask for a small deposit to 'hold it'. Someone who's paid a bit will pay the rest.",
      "A buyer who says 'I'll pick it up and pay cash' is not your buyer. Move on.",
      "Never use the same photos twice in one city. Somebody always does an image search.",
    ],
    idle: [
      "Someone ate my yoghurt. It had my name on it. In marker. I'm sending a mail to all.",
      "The fridge has a rota now. I made the rota. Nobody reads the rota.",
      "Don't touch the plant. It's the only thing in here that's growing.",
    ],
  },
];

/** Hints this coworker will share, given how often the player has failed their specialty. */
export const unlockedHints = (c: Coworker, s: GameState) =>
  c.hints.slice(0, 1 + failsAt(s, c.specialty));

/** What they say the `n`th time they have no new hint for you. */
export const idleLine = (c: Coworker, s: GameState, n: number) =>
  (s.workplace.deskTier > 0 && c.newDesk) || c.idle[n % c.idle.length]!;
