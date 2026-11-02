// Story beats: pure data types and the rules for which beat plays when.
// The beats themselves live in src/content/story.ts; systems/story.ts plays them.
import { defineSlice } from "../core/slice.ts";
import type { GameState } from "../core/state.ts";

/**
 * When a beat plays. Each beat plays once per run.
 * - dayStart: the shift begins (after the boss's end-of-day visit)
 * - pc: the player sits down at their PC
 * - scam: the first scam of the day resolves
 * - dayEnd: the shift is over (after the day report)
 */
export type Trigger = "dayStart" | "pc" | "scam" | "dayEnd";

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
  /** Unique; recorded in `storySeen` so a beat plays once per run. */
  readonly id: string;
  /** In-game day. 0 is the prologue, played before day 1 starts. */
  readonly day: number;
  readonly on: Trigger;
  readonly lines: ReadonlyArray<Line>;
  /** The real-world defense, shown as a last "What to spot" line. */
  readonly learn?: string;
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

/** Replaces `{key}` with `vars[key]`; unknown keys stay as they are. */
export const fill = (text: string, vars: Readonly<Record<string, string>>) =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
