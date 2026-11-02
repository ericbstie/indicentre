import { beats } from "../content/story.ts";
import { PcOpened } from "../client/desktop.ts";
import { BossWatching, WatchRequested } from "../core/boss.ts";
import { queueDialog } from "../dialog/dialog.ts";
import { type Call, callDialog } from "../story/call.ts";
import { type LinesContext, linesDialog } from "../story/lines.ts";
import {
  addPaid,
  type Beat,
  chose,
  dueBeats,
  sawBeat,
  storyVars,
  type Trigger,
} from "../story/story.ts";
import type { GameSystem } from "./system.ts";

/**
 * Plays story beats (src/content/story.ts) in the shared dialog overlay.
 * Beats queue behind whatever is talking (dialog.ts queueDialog), in order.
 */
export default {
  id: "story",
  start({ game, world }) {
    const ctx: LinesContext = {
      vars: () => storyVars(game.state()),
      remember: (key, value) => game.dispatch(chose(key, value)),
    };

    /** The call's result, applied like any other scam attempt. */
    const settle = (call: Call, won: boolean) => {
      const bucks = won ? call.payout : 0;
      const heat = won ? call.heat.success : call.heat.fail;
      game.dispatch({ type: "tick", minutes: call.minutes });
      game.dispatch({ type: "earn", amount: bucks });
      game.dispatch({ type: "heat", amount: heat });
      game.emit({
        type: "ScamResolved",
        scam: call.scam,
        target: call.victim.name,
        victim: call.victim,
        success: won,
        bucks,
        heat,
      });
    };

    // Only a watch the story asked for plays its "watching" beat.
    let watchRequested = false;

    /** Queues `b` behind any open dialog or card (dialog.ts queueDialog). */
    const play = (b: Beat) => {
      const { call, learn } = b;
      let started = false;
      let won = false;
      const dial = call
        ? () => {
            started = true;
            return callDialog(call, (w) => (won = w));
          }
        : undefined;
      // The lesson comes with the intro, never after a pitch (CONTRIBUTING.md).
      const tail = learn
        ? () =>
            linesDialog(ctx, [{ speaker: "What to spot", line: learn }], dial)
        : dial;
      let stand: (() => void) | undefined;
      void queueDialog(linesDialog(ctx, b.lines, tail), () => {
        stand?.();
        // Settled once the player is done reading, so the boss's verdict
        // doesn't talk over the call's last line. Leaving mid-call is a hang-up.
        if (call && started) settle(call, won);
        if (b.watch && dueBeats(beats, game.state(), b.day, "watching")[0]) {
          watchRequested = true;
          game.emit(WatchRequested, {});
        }
      }).then(() => {
        game.dispatch(sawBeat(b.id));
        if (b.introduces && b.free)
          game.dispatch({
            type: "buy",
            item: { kind: "scam", id: b.introduces, price: 0 },
          });
        world.player.controls.unlock();
        if (b.atDesk) stand = world.sitAtDesk();
      });
    };

    const queued = new Set<string>();
    const enqueue = (day: number, on: Trigger) => {
      for (const b of dueBeats(beats, game.state(), day, on))
        if (!queued.has(b.id)) {
          queued.add(b.id);
          play(b);
        }
    };

    game.on(BossWatching, () => {
      if (watchRequested) enqueue(game.state().day, "watching");
      watchRequested = false;
    });
    game.on(PcOpened, () => enqueue(game.state().day, "pc"));
    game.on("ScamResolved", ({ success, bucks, victim }) => {
      if (success && bucks > 0)
        game.dispatch(addPaid({ name: victim.name, age: victim.age, bucks }));
      enqueue(game.state().day, "scam");
    });
    // DayEnded comes with the rollover, so the next day's start queues here
    // too, after the day that just ended.
    game.on("DayEnded", ({ summary }) => {
      if (game.state().status !== "playing") return;
      enqueue(summary.day, "dayEnd");
      enqueue(summary.day + 1, "dayStart");
    });
    enqueue(0, "dayStart");
    enqueue(game.state().day, "dayStart");
  },
} satisfies GameSystem;
