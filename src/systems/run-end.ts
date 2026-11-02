import { endings } from "../content/story.ts";
import { esc } from "../desktop/html.ts";
import { openDialog } from "../dialog/dialog.ts";
import { showModal } from "../hud/modal.ts";
import { linesDialog } from "../story/lines.ts";
import { paid, storyVars } from "../story/story.ts";
import type { GameSystem } from "./system.ts";

/** Top seller, raided or fired: the ending scene, then who paid for it.
 * Restart reloads; the save system has already deleted the finished run. */
export default {
  id: "run-end",
  start({ game }) {
    return game.on("RunEnded", ({ status }) => {
      const end = endings[status];
      const s = game.state();
      const who = paid.get(s);
      const total = who.reduce((sum, p) => sum + p.bucks, 0);
      const ledger = who.length
        ? `<p>${who.length} ${who.length === 1 ? "person" : "people"} paid you ${total} bucks.</p>
           <p class="verdict">${who.map((p) => `${esc(p.name)}, ${p.age}`).join(" · ")}</p>`
        : "<p>Nobody paid you.</p>";
      const card = `<h2>${esc(end.title)}</h2>${ledger}`;
      const ctx = { vars: () => storyVars(s), remember: () => {} };
      openDialog(linesDialog(ctx, end.lines), () =>
        showModal(card, "Restart", () => location.reload()),
      );
    });
  },
} satisfies GameSystem;
