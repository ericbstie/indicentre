import { verdictLine, writtenWarning } from "../content/boss.ts";
import { bossMood } from "../core/boss.ts";
import {
  type DaySummary,
  OVERNIGHT_COOLDOWN,
  quotaFor,
  quotaToday,
} from "../core/economy.ts";
import { esc } from "../desktop/html.ts";
import { showModal } from "../hud/modal.ts";
import type { GameSystem } from "./system.ts";

const warningHtml = (d: DaySummary) => {
  const w = writtenWarning(d);
  return `<div class="warning"><b>${esc(w.title)}</b>${w.lines.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`;
};

/** `next` is tomorrow's quota; a big day raises it above the usual step. */
const reportHtml = (d: DaySummary, mood: number, next: number) => `
  <h2>Day ${esc(d.day)} is over</h2>
  <table>
    <tr><td>Earned</td><td>${esc(d.earned)} / ${esc(d.quota)} bucks quota</td></tr>
    <tr><td>Tomorrow</td><td>${esc(next)} bucks quota${next > quotaFor(d.day + 1) ? " (raised after today)" : ""}</td></tr>
    <tr><td>Heat</td><td>${esc(d.heatStart)} → ${esc(d.heatEnd)} (cools ${esc(OVERNIGHT_COOLDOWN)} overnight)</td></tr>
  </table>
  <p class="${d.met ? "met" : "missed"}">${d.met ? "Quota met." : "Quota missed."}</p>
  <p class="verdict"><b>Boss:</b> "${esc(verdictLine(d, mood))}"</p>
  ${d.warned ? warningHtml(d) : ""}`;

/** End-of-day card: earned vs quota, heat, and the boss's verdict on the spot. */
export default {
  id: "day-report",
  start({ game }) {
    return game.on("DayEnded", ({ summary }) =>
      // After every DayEnded handler, so his mood already counts the quota.
      queueMicrotask(() => {
        // The run-end card replaces the report on the last day.
        if (game.state().status === "playing")
          showModal(
            reportHtml(
              summary,
              bossMood.get(game.state()),
              quotaToday(game.state()),
            ),
            `Start day ${summary.day + 1}`,
          );
      }),
    );
  },
} satisfies GameSystem;
