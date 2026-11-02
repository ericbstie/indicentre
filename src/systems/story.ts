import { PcOpened } from "../client/desktop.ts";
import { beats } from "../content/story.ts";
import { BossWatching, WatchRequested } from "../core/boss.ts";
import { dialogOpen, openDialog } from "../dialog/dialog.ts";
import { modalOpen } from "../hud/modal.ts";
import { type Call, callDialog } from "../story/call.ts";
import { type LinesContext, linesDialog } from "../story/lines.ts";
import {
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
 * Beats queue up and wait until nothing else is talking: no dialog and
 * no day report.
 */
export default {
  id: "story",
  start({ game, world }) {
    const ctx: LinesContext = {
      vars: () => storyVars(game.state()),
      remember: (key, value) => game.dispatch(chose(key, value)),
    };

    /** Puts the camera at the desk; returns a restore. */
    const sitAtDesk = () => {
      const { camera, office } = world;
      const position = camera.position.clone();
      const quaternion = camera.quaternion.clone();
      camera.position.copy(office.seat.position);
      camera.lookAt(office.seat.lookAt);
      return () => {
        camera.position.copy(position);
        camera.quaternion.copy(quaternion);
      };
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

    const play = (b: Beat) =>
      new Promise<void>((resolve) => {
        game.dispatch(sawBeat(b.id));
        if (b.introduces && b.free)
          game.dispatch({
            type: "buy",
            item: { kind: "scam", id: b.introduces, price: 0 },
          });
        world.player.controls.unlock();
        const stand = b.atDesk ? sitAtDesk() : undefined;
        const learn = b.learn;
        const debrief = learn
          ? () => linesDialog(ctx, [{ speaker: "What to spot", line: learn }])
          : undefined;
        const { call } = b;
        let started = false;
        let won = false;
        const tail = call
          ? () => {
              started = true;
              return callDialog(call, (w) => (won = w), debrief);
            }
          : debrief;
        openDialog(linesDialog(ctx, b.lines, tail), () => {
          stand?.();
          // Settled once the player is done reading, so the boss's verdict
          // doesn't talk over the debrief. Leaving mid-call is a hang-up.
          if (call && started) settle(call, won);
          if (b.watch && dueBeats(beats, game.state(), b.day, "watching")[0]) {
            watchRequested = true;
            game.emit(WatchRequested, {});
          }
          resolve();
        });
      });

    const queue: Beat[] = [];
    const enqueue = (day: number, on: Trigger) => {
      for (const b of dueBeats(beats, game.state(), day, on))
        if (!queue.includes(b)) queue.push(b);
    };
    let playing = false;
    // Only a watch the story asked for plays its "watching" beat.
    let watchRequested = false;
    // The beat for the boss's watch plays once he's behind the player.
    const ready = (b: Beat) =>
      !playing && !modalOpen() && (b.on === "watching" || !dialogOpen());

    const stops = [
      world.onFrame(() => {
        const i = queue.findIndex(ready);
        const next = queue[i];
        if (!next) return;
        queue.splice(i, 1);
        playing = true;
        void play(next).then(() => {
          playing = false;
        });
      }),
      game.on(BossWatching, () => {
        if (watchRequested) enqueue(game.state().day, "watching");
        watchRequested = false;
      }),
      game.on(PcOpened, () => enqueue(game.state().day, "pc")),
      game.on("ScamResolved", () => enqueue(game.state().day, "scam")),
      // DayEnded comes with the rollover, so the next day's start queues here
      // too, after the day that just ended.
      game.on("DayEnded", ({ summary }) => {
        if (game.state().status !== "playing") return;
        enqueue(summary.day, "dayEnd");
        enqueue(summary.day + 1, "dayStart");
      }),
    ];
    enqueue(0, "dayStart");
    enqueue(game.state().day, "dayStart");
    return () => stops.forEach((stop) => stop());
  },
} satisfies GameSystem;
