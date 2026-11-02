import { clearRun, saveRun } from "../core/save.ts";
import type { GameSystem } from "./system.ts";

/** Autosaves the run at every day end, purchase and scam; a finished run
 * deletes its save so Restart starts fresh. */
export default {
  id: "save",
  start({ game }) {
    const save = () => saveRun(localStorage, game.state());
    const offs = [
      game.on("DayEnded", save),
      game.on("ScamResolved", save),
      game.subscribe((_, a) => {
        if (a.type === "buy") save();
      }),
      game.on("RunEnded", () => clearRun(localStorage)),
    ];
    return () => offs.forEach((off) => off());
  },
} satisfies GameSystem;
