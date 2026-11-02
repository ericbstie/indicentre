import "./hud.css";
import { quotaToday } from "../core/economy.ts";
import { clock, type GameState, SHUTDOWN_MAX } from "../core/state.ts";

/** Always-on overlay: day/time, bucks, quota, heat. Nothing else. */
export const createHud = (root: HTMLElement) => {
  root.innerHTML = `
    <div class="hud-stats">
      <span data-clock></span>
      <span data-bucks></span>
      <span data-quota></span>
      <span class="heat">Heat <span class="meter"><i data-meter></i></span></span>
    </div>
    <div class="crosshair">+</div>
    <div class="prompt" data-prompt></div>`;
  const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!;
  const bucks = $("[data-bucks]");
  const time = $("[data-clock]");
  const quota = $("[data-quota]");
  const meter = $("[data-meter]");
  const prompt = $("[data-prompt]");
  const crosshair = $(".crosshair");

  return {
    render(s: GameState) {
      const q = quotaToday(s);
      time.textContent = `Day ${s.day} · ${clock(s)}`;
      bucks.textContent = `${s.scamBucks} bucks`;
      quota.textContent = `Quota ${s.earnedToday}/${q}`;
      quota.classList.toggle("met", s.earnedToday >= q);
      meter.style.width = `${(s.shutdownMeter / SHUTDOWN_MAX) * 100}%`;
    },
    /** Each frame: the crosshair only while the mouse looks around, not at
     * the PC or in a dialog; the [E] prompt for what's under it. */
    aim(looking: boolean, label: string | undefined) {
      if (crosshair.hidden === looking) crosshair.hidden = !looking;
      prompt.textContent = label ? `[E] ${label}` : "";
    },
  };
};
