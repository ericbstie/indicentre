import {
  type Clue,
  clueMailId,
  clues,
  cluesDue,
} from "../content/catfisher.ts";
import { coworkers } from "../content/coworkers.ts";
import { dialogOpen, openDialog } from "../dialog/dialog.ts";
import { modalOpen } from "../hud/modal.ts";
import type { GameSystem } from "./system.ts";

/** Seconds after a scam resolves before a coworker leans over with a clue. */
const LEAN_OVER_DELAY = 4;

/**
 * EXTRA: drops the day's catfisher clue. Mail clues land in the inbox and
 * count once read; coworker clues are said after a scam, when nothing else
 * is on screen. The File app lists what was found.
 */
export default {
  id: "catfisher",
  start({ game, world }) {
    const sendMail = (c: Clue) => {
      if (c.via.kind === "mail")
        game.dispatch({
          type: "mail",
          mail: {
            id: clueMailId(c),
            from: c.via.from,
            subject: c.via.subject,
            body: c.text,
          },
        });
    };
    const due = () => cluesDue(game.state().day, game.state().clues);

    const leanOver = () => {
      const c = due().find((x) => x.via.kind === "coworker");
      if (c?.via.kind !== "coworker") return;
      const id = c.via.coworker;
      const name = coworkers.find((w) => w.id === id)?.name ?? id;
      game.dispatch({ type: "findClue", id: c.id });
      world.player.controls.unlock();
      openDialog({ speaker: name, line: c.text });
    };

    let wait: number | undefined;
    const stops = [
      game.subscribe((_, action) => {
        if (action.type !== "readMail") return;
        const c = clues.find((x) => clueMailId(x) === action.id);
        if (c) game.dispatch({ type: "findClue", id: c.id });
      }),
      game.on("DayAdvanced", () => due().forEach(sendMail)),
      game.on("ScamResolved", () => {
        wait ??= LEAN_OVER_DELAY;
      }),
      world.onFrame((dt) => {
        if (wait === undefined) return;
        wait -= dt;
        if (wait > 0 || dialogOpen() || modalOpen()) return;
        wait = undefined;
        leanOver();
      }),
    ];
    due().forEach(sendMail);
    return () => stops.forEach((stop) => stop());
  },
} satisfies GameSystem;
