import { type DaySummary, OVERNIGHT_COOLDOWN } from "../core/economy.ts";
import { esc } from "../desktop/html.ts";
import { showDialog } from "../hud/dialog.ts";
import type { GameSystem } from "./system.ts";

const reportHtml = (d: DaySummary) => `
  <h2>Day ${esc(d.day)} is over</h2>
  <table>
    <tr><td>Earned</td><td>${esc(d.earned)} / ${esc(d.quota)} bucks quota</td></tr>
    <tr><td>Heat</td><td>${esc(d.heatStart)} → ${esc(d.heatEnd)} (cools ${esc(OVERNIGHT_COOLDOWN)} overnight)</td></tr>
  </table>
  <p class="${d.met ? "met" : "missed"}">${d.met ? "Quota met." : "Quota missed."}</p>`;

/** End-of-day summary card: earned vs quota and heat. The boss reacts on his own. */
export default {
  id: "day-report",
  start({ game }) {
    return game.on("DayEnded", ({ summary }) => {
      // The run-end card replaces the report on the last day.
      if (game.state().status === "playing")
        showDialog(reportHtml(summary), `Start day ${summary.day + 1}`);
    });
  },
} satisfies GameSystem;
