import { clock, type GameState, SHUTDOWN_MAX } from "../core/state.ts";

/** Always-on overlay: scam bucks, shutdown meter, clock, crosshair prompt. */
export const createHud = (root: HTMLElement) => {
  root.innerHTML = `
    <div class="hud-stats">
      <span data-bucks></span>
      <span data-clock></span>
      <div class="meter" title="Shutdown meter"><i data-meter></i></div>
    </div>
    <div class="crosshair">+</div>
    <div class="prompt" data-prompt></div>
    <div class="banner" data-banner hidden></div>`;
  const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!;
  const bucks = $("[data-bucks]");
  const time = $("[data-clock]");
  const meter = $("[data-meter]");
  const prompt = $("[data-prompt]");
  const banner = $("[data-banner]");

  return {
    render(s: GameState) {
      bucks.textContent = `${s.scamBucks} scam bucks`;
      time.textContent = `Day ${s.day} · ${clock(s)}`;
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
