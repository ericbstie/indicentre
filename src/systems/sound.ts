import "../audio/audio.css";
import { audio } from "../audio/engine.ts";
import { startMusic } from "../audio/music.ts";
import { sfx } from "../audio/sfx.ts";
import type { GameSystem } from "./system.ts";

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);

/**
 * Sound: background music, UI sounds for app launches, scam results and
 * rising heat. M toggles mute (remembered), shown in a corner line.
 */
export default {
  id: "sound",
  start({ game }) {
    const key = document.createElement("div");
    key.className = "sound-key";
    const label = () =>
      (key.textContent = `[M] Sound ${audio.muted() ? "off" : "on"}`);
    label();
    document.body.append(key);

    window.addEventListener("keydown", (e) => {
      if (e.code !== "KeyM" || e.repeat || typing(e.target)) return;
      audio.toggleMute();
      label();
    });
    document.addEventListener("click", (e) => {
      if (e.target instanceof Element && e.target.closest(".app-icon"))
        sfx.click();
    });
    // A scam raises heat just before it resolves: tick after the stinger.
    let heatPending = false;
    game.on("HeatChanged", (e) => {
      if (e.to <= e.from) return;
      heatPending = true;
      queueMicrotask(() => {
        if (heatPending) sfx.heat();
        heatPending = false;
      });
    });
    game.on("ScamResolved", (e) => {
      (e.success ? sfx.success : sfx.fail)();
      if (heatPending) sfx.heat(0.55);
      heatPending = false;
    });
    audio.ready(startMusic);
  },
} satisfies GameSystem;
