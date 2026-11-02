import { endings } from "../content/endings.ts";
import { esc } from "../desktop/html.ts";
import { showModal } from "../hud/modal.ts";
import type { GameSystem } from "./system.ts";

/** Raided, fired or top seller: one line and Restart (a fresh page; no save yet). */
export default {
  id: "run-end",
  start({ game }) {
    return game.on("RunEnded", ({ status }) =>
      showModal(`<p>${esc(endings[status])}</p>`, "Restart", () =>
        location.reload(),
      ),
    );
  },
} satisfies GameSystem;
