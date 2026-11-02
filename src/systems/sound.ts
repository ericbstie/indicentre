import "../audio/audio.css";
import { audio } from "../audio/engine.ts";
import { startMusic } from "../audio/music.ts";
import type { GameSystem } from "./system.ts";

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

/** Sound: background music; M toggles mute (remembered), shown in a corner line. */
export default {
  id: "sound",
  start() {
    const key = document.createElement("div");
    key.className = "sound-key";
    const label = () =>
      (key.textContent = `[M] Sound ${audio.muted() ? "off" : "on"}`);
    label();
    document.body.append(key);

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyM" || e.repeat || typing(e.target)) return;
      audio.toggleMute();
      label();
    };
    window.addEventListener("keydown", onKey);
    let stopMusic = () => {};
    audio.ready((ctx) => (stopMusic = startMusic(ctx)));
    return () => {
      stopMusic();
      window.removeEventListener("keydown", onKey);
      key.remove();
    };
  },
} satisfies GameSystem;
