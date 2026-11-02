import { Effect } from "effect";

/** Mixer channels. Each has its own gain into the master. */
export type Bus = "voice" | "music" | "sfx";

const LEVELS: Record<Bus, number> = { voice: 0.5, music: 0.18, sfx: 0.35 };
const MUTE_KEY = "indicentre.muted";

export interface AudioEngineShape {
  /** The context, once the player has clicked or pressed a key. */
  readonly ctx: () => AudioContext | undefined;
  /** A channel's input node, once the context exists. */
  readonly bus: (name: Bus) => GainNode | undefined;
  /** Runs `f` when the context exists (now, or on the first input). */
  readonly ready: (f: (ctx: AudioContext) => void) => void;
  /** Lowers the music until `until` (context time), then brings it back. */
  readonly duck: (until: number) => void;
  readonly muted: () => boolean;
  /** Flips mute, persists it, returns the new value. */
  readonly toggleMute: () => boolean;
}

const load = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
};
const save = (muted: boolean) => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
};

/**
 * Web Audio graph: buses -> master -> speakers. Browsers only allow audio
 * after a user gesture, so the context is created on the first click/key.
 */
const makeAudioEngine = Effect.sync((): AudioEngineShape => {
  let ctx: AudioContext | undefined;
  let master: GainNode | undefined;
  const buses = new Map<Bus, GainNode>();
  const waiting: Array<(ctx: AudioContext) => void> = [];
  let muted = load();

  const unlock = () => {
    if (!ctx) {
      ctx = new AudioContext();
      master = new GainNode(ctx, { gain: muted ? 0 : 1 });
      master.connect(ctx.destination);
      for (const [name, gain] of Object.entries(LEVELS)) {
        const g = new GainNode(ctx, { gain });
        g.connect(master);
        buses.set(name as Bus, g);
      }
      waiting.splice(0).forEach((f) => f(ctx!));
    }
    if (ctx.state === "suspended") void ctx.resume();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
  }

  return {
    ctx: () => ctx,
    bus: (name) => buses.get(name),
    ready: (f) => (ctx ? f(ctx) : waiting.push(f)),
    duck: (until) => {
      const music = buses.get("music");
      if (!ctx || !music) return;
      const g = music.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setTargetAtTime(LEVELS.music * 0.35, ctx.currentTime, 0.08);
      g.setTargetAtTime(LEVELS.music, until, 0.4);
    },
    muted: () => muted,
    toggleMute: () => {
      muted = !muted;
      save(muted);
      if (ctx && master)
        master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
      return muted;
    },
  };
});

/** The page's one engine, for Effect-free UI code (like the `Game` facade). */
export const audio: AudioEngineShape = Effect.runSync(makeAudioEngine);
