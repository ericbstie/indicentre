// Story beats: pure data types and the rules for which beat plays when.
// The beats themselves live in src/content/story.ts; systems/story.ts plays them.
import { quotaToday } from "../core/economy.ts";
import { defineSlice } from "../core/slice.ts";
import type { GameState, ScamId } from "../core/state.ts";
import type { Call } from "./call.ts";

/**
 * When a beat plays. Each beat plays once per run.
 * - dayStart: the shift begins (after the boss's end-of-day visit)
 * - pc: the player sits down at their PC
 * - scam: the first scam of the day resolves
 * - dayEnd: the shift is over (after the day report)
 * - watching: the boss stands behind the player, waiting for a scam
 */
export type Trigger = "dayStart" | "pc" | "scam" | "dayEnd" | "watching";

export interface Line {
  readonly speaker: string;
  /** `{nick}`, `{quota}` and `{earned}` are filled in when shown. */
  readonly line: string;
  /** Two answers; the picked label is remembered under `key`. */
  readonly choose?: {
    readonly key: string;
    readonly options: readonly [string, string];
  };
}

export interface Beat {
  /** Unique; recorded in the story slice so a beat plays once per run. */
  readonly id: string;
  /** In-game day. 0 is the prologue, played before day 1 starts. */
  readonly day: number;
  readonly on: Trigger;
  readonly lines: ReadonlyArray<Line>;
  /** A phone call played after the lines; it counts as a scam attempt. */
  readonly call?: Call;
  /** After the lines, the boss comes over to watch (see `watching`). */
  readonly watch?: true;
  /** Plays with the camera at the player's desk, looking at the screen. */
  readonly atDesk?: true;
  /** The real-world defense, shown as a "What to spot" line after `lines`, before any call. */
  readonly learn?: string;
  /** The scam this day is about. From this day on the Shop sells it... */
  readonly introduces?: ScamId;
  /** ...unless it's handed over for free when the beat plays. */
  readonly free?: true;
}

type StoryAction =
  | { readonly type: "story/seen"; readonly id: string }
  | {
      readonly type: "story/choice";
      readonly key: string;
      readonly value: string;
    };

/** Beat ids already played, and remembered choices (e.g. your nickname). */
export const story = defineSlice(
  "story",
  {
    seen: [] as ReadonlyArray<string>,
    choices: {} as Readonly<Record<string, string>>,
  },
  (st, a: StoryAction) => {
    switch (a.type) {
      case "story/seen":
        return st.seen.includes(a.id)
          ? st
          : { ...st, seen: [...st.seen, a.id] };
      case "story/choice":
        return { ...st, choices: { ...st.choices, [a.key]: a.value } };
    }
  },
);
export const sawBeat = (id: string) => ({ type: "story/seen", id }) as const;
export const chose = (key: string, value: string) =>
  ({ type: "story/choice", key, value }) as const;

/** Beats due for this day and trigger that haven't played yet, in data order. */
export const dueBeats = (
  beats: ReadonlyArray<Beat>,
  s: GameState,
  day: number,
  on: Trigger,
) => {
  const { seen } = story.get(s);
  return beats.filter(
    (b) => b.day === day && b.on === on && !seen.includes(b.id),
  );
};

export interface Paid {
  readonly name: string;
  readonly age: number;
  readonly bucks: number;
}

/** Everyone who paid the player this run, oldest first. The ending reads it. */
export const paid = defineSlice(
  "paid",
  [] as ReadonlyArray<Paid>,
  (list, a: { readonly type: "paid/add"; readonly who: Paid }) => [
    ...list,
    a.who,
  ],
);
export const addPaid = (who: Paid) => ({ type: "paid/add", who }) as const;

/** Placeholder values for story lines. `{last}` is the last person who
 * paid, `{victims}` the last three with their ages, newest first. */
export const storyVars = (s: GameState) => {
  const recent = paid.get(s).toReversed();
  return {
    nick: story.get(s).choices["nick"] ?? "you",
    quota: String(quotaToday(s)),
    earned: String(s.earnedToday),
    last: recent[0]?.name ?? "Tommy",
    victims: recent
      .slice(0, 3)
      .map((p) => `${p.name}, ${p.age}.`)
      .join(" "),
  };
};

/** Replaces `{key}` with `vars[key]`; unknown keys stay as they are. */
export const fill = (text: string, vars: Readonly<Record<string, string>>) =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

/** The beat that brings in `scam`; scams without one never become available. */
const introOf = (beats: ReadonlyArray<Beat>, scam: ScamId) =>
  beats.find((b) => b.introduces === scam);

/** Whether the Shop sells `scam` on `day`. Free scams are never sold. */
export const shopSells = (
  beats: ReadonlyArray<Beat>,
  scam: ScamId,
  day: number,
) => {
  const intro = introOf(beats, scam);
  return intro !== undefined && !intro.free && intro.day <= day;
};

/** Every "What to spot" line the player has seen, in arc order. */
export const learned = (beats: ReadonlyArray<Beat>, s: GameState) =>
  beats.flatMap((b) =>
    b.learn && story.get(s).seen.includes(b.id) ? [b.learn] : [],
  );
