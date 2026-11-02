import type { Voice } from "../audio/babble.ts";

/**
 * Hand-tuned voices by speaker name, merged over the voice derived from the
 * name. Anyone not listed still gets a stable voice of their own; add an
 * entry only when two speakers sound too alike or a character needs a type.
 */
export const voices: Readonly<Record<string, Partial<Voice>>> = {
  Boss: { pitch: 105, rate: 8, wave: "sawtooth", bright: 0.8 },
  Priya: { pitch: 290, rate: 12.5, wave: "triangle" },
  Rohan: { pitch: 165, rate: 10, wave: "square", bright: 0.9 },
  Mags: { pitch: 235, rate: 9.5, wave: "triangle", bright: 1.25 },
};
