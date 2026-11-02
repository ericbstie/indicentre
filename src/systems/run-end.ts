import { beats, endings } from "../content/story.ts";
import { esc } from "../desktop/html.ts";
import { openDialog } from "../dialog/dialog.ts";
import { showModal } from "../hud/modal.ts";
import { linesDialog } from "../story/lines.ts";
import { learned, storyVars } from "../story/story.ts";
import type { GameSystem } from "./system.ts";

/** Top seller, raided or fired: the ending scene, then what the run taught.
 * Restart reloads; the save system has already deleted the finished run. */
export default {
  id: "run-end",
  start({ game }) {
    return game.on("RunEnded", ({ status }) => {
      const end = endings[status];
      const s = game.state();
      const card = `<h2>${esc(end.title)}</h2>${
        end.note ? `<p class="lesson">${esc(end.note)}</p>` : ""
      }<h4>What to spot</h4><ul>${learned(beats, s)
        .map((l) => `<li>${esc(l)}</li>`)
        .join("")}</ul>`;
      const ctx = { vars: () => storyVars(s), remember: () => {} };
      openDialog(linesDialog(ctx, end.lines), () =>
        showModal(card, "Restart", () => location.reload()),
      );
    });
  },
} satisfies GameSystem;
