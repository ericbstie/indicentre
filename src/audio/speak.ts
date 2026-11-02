/** A line someone says out loud. */
export interface SpokenLine {
  /** Who is talking; pick a stable voice (pitch, tempo) per speaker. */
  readonly speaker: string;
  /** The subtitle. Its length should decide how long the babble lasts. */
  readonly text: string;
}

/**
 * Plays neutral gibberish babble for a line while its subtitle is shown
 * (design doc: people talk gibberish with text underneath; no accents).
 * Called by the dialog overlay every time a line appears. A new call
 * should cut off the previous line; `hush` runs when the dialog closes.
 * No-op until the sound system lands.
 */
export const speak = (_line: SpokenLine): void => {};

export { hush } from "./babble.ts";
