import { verdictLine, writtenWarning } from "../content/boss.ts";
import { bossMood } from "../core/boss.ts";
import {
  type DaySummary,
  OVERNIGHT_COOLDOWN,
  quotaFor,
  quotaToday,
} from "../core/economy.ts";
import { esc } from "../desktop/html.ts";
import { queueCard } from "../dialog/dialog.ts";
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
    <tr><td>Earned</td><td class="${d.met ? "met" : "missed"}">${esc(d.earned)} / ${esc(d.quota)} bucks quota</td></tr>
    <tr><td>Tomorrow</td><td>${esc(next)} bucks quota${next > quotaFor(d.day + 1) ? " (raised after today)" : ""}</td></tr>
    <tr><td>Heat</td><td>${esc(d.heatStart)} → ${esc(d.heatEnd)} (cools ${esc(OVERNIGHT_COOLDOWN)} overnight)</td></tr>
  </table>
  <p class="verdict"><b>Boss:</b> "${esc(verdictLine(d, mood))}"</p>
  ${d.warned ? warningHtml(d) : ""}`;

/** End-of-day card: earned vs quota, heat, and the boss's verdict on the spot. */
export default {
  id: "day-report",
  start({ game }) {
    return game.on("DayEnded", ({ summary }) =>
      // After every DayEnded handler, so his mood already counts the quota
      // and the card goes ahead of the lines they queued.
      queueMicrotask(() => {
        // The run-end card replaces the report on the last day.
        const s = game.state();
        if (s.status !== "playing") return;
        const html = reportHtml(summary, bossMood.get(s), quotaToday(s));
        queueCard(() => showModal(html, `Start day ${summary.day + 1}`));
      }),
    );
  },
} satisfies GameSystem;
