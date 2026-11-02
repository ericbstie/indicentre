import { clearRun, loadRun, saveRun } from "../core/save.ts";
import { clock } from "../core/state.ts";
import { esc } from "../desktop/html.ts";
import { showModal } from "../hud/modal.ts";
import type { GameSystem } from "./system.ts";

/**
 * Autosaves the run at every day end, purchase and scam; a finished run
 * deletes its save so Restart starts fresh. When the page booted from a
 * save, the first card offers Continue or New run.
 */
export default {
  id: "save",
  start({ game }) {
    if (loadRun(localStorage)) {
      const s = game.state();
      showModal(
        `<h2>Welcome back</h2>
        <p>Day ${esc(s.day)}, ${esc(clock(s))} · ${esc(s.scamBucks)} bucks · heat ${esc(s.shutdownMeter)}</p>`,
        `Continue day ${s.day}`,
        () => {},
        {
          label: "New run",
          onClick: () => {
            clearRun(localStorage);
            location.reload();
          },
        },
      );
    }
    const save = () => saveRun(localStorage, game.state());
    game.on("DayEnded", save);
    game.on("ScamResolved", save);
    game.subscribe((_, a) => {
      if (a.type === "buy") save();
    });
    game.on("RunEnded", () => clearRun(localStorage));
  },
} satisfies GameSystem;
