import { voices } from "../content/voices.ts";
import { babble, voiceFor } from "./babble.ts";

/** A line someone says out loud. */
export interface SpokenLine {
  /** Who is talking; picks a stable voice (pitch, tempo) per speaker. */
  readonly speaker: string;
  /** The subtitle. Its length decides how long the babble lasts. */
  readonly text: string;
}

/**
 * Plays neutral gibberish babble for a line while its subtitle is shown
 * (design doc: people talk gibberish with text underneath; no accents).
 * Called by the dialog overlay every time a line appears; a new line cuts
 * off the previous one and `hush` runs when the dialog closes.
 */
export const speak = (line: SpokenLine): void =>
  babble(line.text, { ...voiceFor(line.speaker), ...voices[line.speaker] });

export { hush } from "./babble.ts";
