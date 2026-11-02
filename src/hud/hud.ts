import "./hud.css";
import { quotaFor } from "../core/economy.ts";
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
    <div class="prompt" data-prompt></div>
    <div class="banner" data-banner hidden></div>`;
  const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!;
  const bucks = $("[data-bucks]");
  const time = $("[data-clock]");
  const quota = $("[data-quota]");
  const meter = $("[data-meter]");
  const prompt = $("[data-prompt]");
  const banner = $("[data-banner]");

  return {
    render(s: GameState) {
      const q = quotaFor(s.day);
      time.textContent = `Day ${s.day} · ${clock(s)}`;
      bucks.textContent = `${s.scamBucks} bucks`;
      quota.textContent = `Quota ${Math.min(s.earnedToday, q)}/${q}`;
      quota.classList.toggle("met", s.earnedToday >= q);
      meter.style.width = `${(s.shutdownMeter / SHUTDOWN_MAX) * 100}%`;
      if (s.status === "shutdown") {
        banner.hidden = false;
        banner.textContent = "RAIDED. The call center has been shut down.";
      }
    },
    prompt(label: string | undefined) {
      prompt.textContent = label ? `[E] ${label}` : "";
    },
  };
};
