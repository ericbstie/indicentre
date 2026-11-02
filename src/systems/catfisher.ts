import {
  type Clue,
  clueMailId,
  clues,
  cluesDue,
  fileComplete,
  fileCompleteMail,
  findClue,
  foundClues,
} from "../content/catfisher.ts";
import { inbox, receiveMail } from "../content/mail.ts";
import { WIN_DAY } from "../core/economy.ts";
import { coworkers } from "../content/coworkers.ts";
import { queueDialog } from "../dialog/dialog.ts";
import type { GameSystem } from "./system.ts";

/** Seconds after a scam resolves before a coworker leans over with a clue. */
const LEAN_OVER_DELAY = 4;

/**
 * EXTRA: drops the day's catfisher clue. Mail clues land in the inbox and
 * count once read; coworker clues are said after a scam, queued behind
 * whatever is on screen (dialog.ts queueDialog). The File app lists what was found;
 * a complete file gets a mail from the Boss on the last day.
 */
export default {
  id: "catfisher",
  start({ game, world }) {
    const sendMail = (c: Clue) => {
      if (c.via.kind === "mail")
        game.dispatch(
          receiveMail({
            id: clueMailId(c),
            from: c.via.from,
            subject: c.via.subject,
            body: c.text,
          }),
        );
    };
    const due = () => cluesDue(game.state().day, foundClues.get(game.state()));

    const leanOver = () => {
      const c = due().find((x) => x.via.kind === "coworker");
      if (c?.via.kind !== "coworker") return;
      const id = c.via.coworker;
      const name = coworkers.find((w) => w.id === id)?.name ?? id;
      game.dispatch(findClue(c.id));
      void queueDialog({ speaker: name, line: c.text }).then(() =>
        world.player.controls.unlock(),
      );
    };

    let wait: number | undefined;
    // A mail clue counts once its mail has been read.
    game.subscribe((s) => {
      const read = inbox.get(s).filter((m) => m.read);
      const found = foundClues.get(s);
      for (const c of clues)
        if (!found.includes(c.id) && read.some((m) => m.id === clueMailId(c)))
          game.dispatch(findClue(c.id));
    });
    game.on("DayAdvanced", ({ day }) => {
      due().forEach(sendMail);
      if (day === WIN_DAY && fileComplete(game.state()))
        game.dispatch(receiveMail(fileCompleteMail));
    });
    game.on("ScamResolved", () => {
      wait ??= LEAN_OVER_DELAY;
    });
    world.onFrame((dt) => {
      if (wait === undefined) return;
      wait -= dt;
      if (wait > 0) return;
      wait = undefined;
      leanOver();
    });
    due().forEach(sendMail);
  },
} satisfies GameSystem;
