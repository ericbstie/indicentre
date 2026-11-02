import {
  type Coworker,
  coworkers,
  idleLine,
  unlockedHints,
} from "../content/coworkers.ts";
import { hintsHeard } from "../core/state.ts";
import { type DialogNode, openDialog } from "../dialog/dialog.ts";
import { createNpc } from "../scene/npc.ts";
import type { GameSystem } from "./system.ts";

/** Coworkers at their desks. Talk to one (E) for the next hint they'll share. */
export default {
  id: "coworkers",
  start({ game, world }) {
    const give = (c: Coworker, i: number) => {
      game.dispatch({ type: "heardHint", coworker: c.id });
      game.emit({
        type: "HintGiven",
        coworker: c.id,
        scam: c.specialty,
        hint: c.hints[i] ?? "",
      });
    };

    // Hints `from`..`to`-1 as a chain of "Anything else?" replies.
    const chain = (c: Coworker, from: number, to: number): DialogNode => ({
      speaker: c.name,
      line: c.hints[from] ?? idleLine(c, game.state()),
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
      if (heard >= open)
        return openDialog({ speaker: c.name, line: idleLine(c, game.state()) });
      give(c, heard);
      openDialog(chain(c, heard, open));
    };

    const stops = [
      game.on("ScamResolved", (e) => {
        if (!e.success) game.dispatch({ type: "scamFailed", scam: e.scam });
      }),
    ];
    for (const c of coworkers) {
      const desk = world.office.desks[c.desk];
      if (!desk) continue;
      const npc = createNpc(c.look, desk);
      world.office.scene.add(npc.group);
      stops.push(world.onFrame((dt) => npc.update(dt, world.camera.position)));
      world.interactions.add({
        object: npc.group,
        label: `Talk to ${c.name}`,
        use: () => talk(c),
      });
    }

    return () => stops.forEach((stop) => stop());
  },
} satisfies GameSystem;
