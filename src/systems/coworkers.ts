import {
  type Coworker,
  coworkers,
  HintGiven,
  heardHint,
  hintsHeard,
  idleLine,
  scamFailed,
  unlockedHints,
} from "../content/coworkers.ts";
import { type DialogNode, openDialog } from "../dialog/dialog.ts";
import { createNpc } from "../scene/npc.ts";
import type { GameSystem } from "./system.ts";

/** Coworkers at their desks. Talk to one (E) for the next hint they'll share. */
export default {
  id: "coworkers",
  start({ game, world }) {
    const idled = new Map<string, number>();
    /** Their next idle line, in turn, so it doesn't repeat back to back. */
    const idle = (c: Coworker) => {
      const n = idled.get(c.id) ?? 0;
      idled.set(c.id, n + 1);
      return idleLine(c, game.state(), n);
    };

    const give = (c: Coworker, i: number) => {
      game.dispatch(heardHint(c.id));
      game.emit(HintGiven, {
        coworker: c.id,
        scam: c.specialty,
        hint: c.hints[i] ?? "",
      });
    };

    // Hints `from`..`to`-1 as a chain of "Anything else?" replies.
    const chain = (c: Coworker, from: number, to: number): DialogNode => ({
      speaker: c.name,
      line: c.hints[from] ?? idle(c),
      ...(from + 1 < to && {
        choices: [
          {
            label: "Anything else?",
            pick: () => give(c, from + 1),
            next: chain(c, from + 1, to),
          },
        ],
      }),
    });

    const talk = (c: Coworker) => {
      world.player.controls.unlock();
      const heard = hintsHeard(game.state(), c.id);
      const open = unlockedHints(c, game.state()).length;
      if (heard >= open) return openDialog({ speaker: c.name, line: idle(c) });
      give(c, heard);
      openDialog(chain(c, heard, open));
    };

    game.on("ScamResolved", (e) => {
      if (!e.success) game.dispatch(scamFailed(e.scam));
    });
    for (const c of coworkers) {
      const desk = world.office.desks[c.desk];
      if (!desk) continue;
      const npc = createNpc(c.look, desk);
      world.office.scene.add(npc.group);
      world.onFrame((dt) => npc.update(dt, world.camera.position));
      world.interactions.add({
        object: npc.group,
        label: `Talk to ${c.name}`,
        use: () => talk(c),
      });
    }
  },
} satisfies GameSystem;
