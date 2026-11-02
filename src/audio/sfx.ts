import { audio } from "./engine.ts";

/** [frequency Hz, start s, length s] */
type Note = readonly [number, number, number];

const play = (
  wave: OscillatorType,
  notes: ReadonlyArray<Note>,
  gain = 0.5,
  delay = 0,
) => {
  const ctx = audio.ctx();
  const out = audio.bus("sfx");
  if (!ctx || !out) return;
  const t0 = ctx.currentTime + 0.01 + delay;
  for (const [freq, at, dur] of notes) {
    const t = t0 + at;
    const osc = new OscillatorNode(ctx, { type: wave, frequency: freq });
    const env = new GainNode(ctx, { gain: 0 });
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(env).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
};

/** Short UI sounds, all on the sfx bus at one level. */
export const sfx = {
  click: () => play("triangle", [[1200, 0, 0.04]], 0.4),
  success: () =>
    play("triangle", [
      [523, 0, 0.15],
      [659, 0.08, 0.15],
      [784, 0.16, 0.3],
    ]),
  fail: () =>
    play(
      "square",
      [
        [311, 0, 0.18],
        [233, 0.14, 0.35],
      ],
      0.25,
    ),
  /** `delay` lets it follow a stinger instead of muddying it. */
  heat: (delay = 0) => play("square", [[150, 0, 0.07]], 0.3, delay),
  /** A soft footfall; the pitch wanders so steps don't sound looped. */
  step: () => play("triangle", [[75 + Math.random() * 30, 0, 0.09]], 0.3),
};
