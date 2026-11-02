import "./file.css";
import { clues, FILE_COMPLETE, fileComplete } from "../content/catfisher.ts";
import { esc } from "../desktop/html.ts";
import type { DesktopApp } from "./app.ts";

/** EXTRA: the catfisher file. What you know about Sam, one red flag per clue. */
export default {
  id: "file",
  title: "File",
  icon: "?",
  order: 30,
  mount(el, { game }) {
    const render = () => {
      const s = game.state();
      const rows = clues
        .map((c) =>
          s.clues.includes(c.id)
            ? `<li class="clue"><b>${esc(c.note)}</b><p class="lesson">Red flag: ${esc(c.redFlag)}</p></li>`
            : `<li class="clue empty">?</li>`,
        )
        .join("");
      el.innerHTML = `<div class="file">
        <h3>Sam</h3>
        <p class="empty">${
          fileComplete(s)
            ? "Enough to find Sam."
            : `${esc(s.clues.length)} of ${esc(clues.length)} clues. ${esc(FILE_COMPLETE)} would be enough to find Sam.`
        }</p>
        <ul>${rows}</ul></div>`;
    };
    render();
    return game.subscribe(render);
  },
} satisfies DesktopApp;
