import { audio } from "./engine.ts";

// Slow, warm office loop: two major-seventh chords swaying every two bars,
// a soft kick and shaker underneath. Synthesized, so no files to ship.
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
/** MIDI notes: [bass, ...pad]. Fmaj7 then Em7. */
const CHORDS = [
  [41, 53, 57, 60, 64],
  [40, 52, 55, 59, 62],
] as const;

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

const pad = (ctx: AudioContext, out: AudioNode, notes: number[], t: number) => {
  const len = BAR * 2;
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 900 });
  const env = new GainNode(ctx, { gain: 0 });
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.08, t + 1.2);
  env.gain.setValueAtTime(0.08, t + len - 0.2);
  env.gain.linearRampToValueAtTime(0, t + len + 1.3);
  filter.connect(env).connect(out);
  for (const n of notes)
    for (const detune of [-6, 6]) {
      const osc = new OscillatorNode(ctx, {
        type: "triangle",
        frequency: hz(n),
        detune,
      });
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + len + 1.4);
    }
};

const pluck = (
  ctx: AudioContext,
  out: AudioNode,
  t: number,
  freq: number,
  dur: number,
  gain: number,
  drop = 1,
) => {
  const osc = new OscillatorNode(ctx, { type: "sine", frequency: freq });
  if (drop !== 1)
    osc.frequency.exponentialRampToValueAtTime(freq * drop, t + dur);
  const env = new GainNode(ctx, { gain: 0 });
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

let noise: AudioBuffer | undefined;
const shaker = (ctx: AudioContext, out: AudioNode, t: number) => {
  if (!noise) {
    noise = new AudioBuffer({
      length: ctx.sampleRate / 10,
      sampleRate: ctx.sampleRate,
    });
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = new AudioBufferSourceNode(ctx, { buffer: noise });
  const hp = new BiquadFilterNode(ctx, { type: "highpass", frequency: 6000 });
  const env = new GainNode(ctx, { gain: 0 });
  env.gain.setValueAtTime(0.12, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  src.connect(hp).connect(env).connect(out);
  src.start(t);
  src.stop(t + 0.08);
};

const bar = (ctx: AudioContext, out: AudioNode, i: number, t: number) => {
  const [bass, ...notes] = CHORDS[Math.floor(i / 2) % CHORDS.length]!;
  if (i % 2 === 0) pad(ctx, out, notes, t);
  pluck(ctx, out, t, hz(bass), BEAT * 1.5, 0.35);
  pluck(ctx, out, t + BEAT * 2.5, hz(bass), BEAT, 0.25);
  for (const beat of [0, 2])
    pluck(ctx, out, t + beat * BEAT, 110, 0.18, 0.5, 0.4);
  for (let b = 0; b < 4; b++) shaker(ctx, out, t + (b + 0.5) * BEAT);
};

/** Loops the background music on the music bus. */
export const startMusic = (ctx: AudioContext) => {
  const out = audio.bus("music");
  if (!out) return;
  let i = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    // A hidden tab pauses timers; restart on the beat instead of catching up.
    if (next < ctx.currentTime) next = ctx.currentTime + 0.1;
    while (next < ctx.currentTime + 1) {
      bar(ctx, out, i++, next);
      next += BAR;
    }
  };
  tick();
  setInterval(tick, 400);
};
