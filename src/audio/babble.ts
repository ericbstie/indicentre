import { pick, range, type Rng, seedFrom, seeded } from "../core/rng.ts";
import { audio } from "./engine.ts";

/** How someone sounds. Derived from their name so it never changes. */
export interface Voice {
  /** Base pitch in Hz. */
  readonly pitch: number;
  /** Syllables per second. */
  readonly rate: number;
  readonly wave: OscillatorType;
  /** Formant multiplier: >1 brighter, <1 darker. */
  readonly bright: number;
}

/** One blip of babble, relative to the start of the line. */
export interface Syllable {
  readonly at: number;
  readonly dur: number;
  readonly freq: number;
  /** Formant (filter) frequency in Hz: the "vowel". */
  readonly vowel: number;
}

const WAVES: ReadonlyArray<OscillatorType> = ["triangle", "square", "sawtooth"];
const VOWELS = [800, 450, 320, 550, 380]; // a e i o u, roughly
/** Longer lines babble for at most this long; the subtitle carries the rest. */
export const MAX_SECONDS = 4;

export const voiceFor = (speaker: string): Voice => {
  const rng = seeded(seedFrom(speaker));
  return {
    pitch: range(rng, 150, 330),
    rate: range(rng, 9, 13),
    wave: pick(rng, WAVES),
    bright: range(rng, 0.8, 1.4),
  };
};

const semis = (n: number) => 2 ** (n / 12);

/** Syllable timing for a line: about one blip per three letters, pauses at punctuation. */
export const plan = (text: string, voice: Voice, rng: Rng): Syllable[] => {
  const out: Syllable[] = [];
  let t = 0;
  for (const word of text.split(/\s+/)) {
    const letters = word.replace(/[^\p{L}\p{N}]/gu, "").length;
    if (!letters) continue;
    const n = Math.max(1, Math.round(letters / 3));
    const end = word.at(-1) ?? "";
    for (let i = 0; i < n; i++) {
      const dur = range(rng, 0.8, 1.2) / voice.rate;
      if (t + dur > MAX_SECONDS) return out;
      const last = i === n - 1;
      const lift = last ? (end === "?" ? 4 : end === "!" ? 2 : 0) : 0;
      out.push({
        at: t,
        dur,
        freq: voice.pitch * semis(range(rng, -3, 3) + lift),
        vowel: pick(rng, VOWELS) * voice.bright,
      });
      t += dur + 0.012;
    }
    t += /[.!?;:]/.test(end) ? 0.18 : /,/.test(end) ? 0.1 : 0.04;
  }
  return out;
};

let playing: OscillatorNode[] = [];

/** Cuts off the line being babbled, if any. */
export const hush = () => {
  const ctx = audio.ctx();
  for (const osc of playing) osc.stop(ctx?.currentTime);
  playing = [];
};

/** Babbles `text` in `voice` on the voice bus, replacing any current line. */
export const babble = (text: string, voice: Voice) => {
  hush();
  const ctx = audio.ctx();
  const out = audio.bus("voice");
  if (!ctx || !out) return;
  const t0 = ctx.currentTime + 0.03;
  const syllables = plan(text, voice, seeded(seedFrom(text)));
  for (const s of syllables) {
    const start = t0 + s.at;
    const osc = new OscillatorNode(ctx, {
      type: voice.wave,
      frequency: s.freq,
    });
    osc.frequency.setValueAtTime(s.freq * 1.06, start);
    osc.frequency.exponentialRampToValueAtTime(s.freq, start + s.dur);
    const formant = new BiquadFilterNode(ctx, {
      type: "lowpass",
      frequency: s.vowel * 2,
      Q: 6,
    });
    const env = new GainNode(ctx, { gain: 0 });
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(1, start + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, start + s.dur);
    osc.connect(formant).connect(env).connect(out);
    osc.start(start);
    osc.stop(start + s.dur + 0.02);
    osc.onended = () => osc.disconnect();
    playing.push(osc);
  }
  const last = syllables.at(-1);
  if (last) audio.duck(t0 + last.at + last.dur);
};
