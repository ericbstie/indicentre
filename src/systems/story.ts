import { PcOpened } from "../client/desktop.ts";
import { beats } from "../content/story.ts";
import { quotaFor } from "../core/economy.ts";
import {
  type DialogChoice,
  type DialogNode,
  dialogOpen,
  openDialog,
} from "../dialog/dialog.ts";
import { modalOpen } from "../hud/modal.ts";
import {
  type Beat,
  chose,
  dueBeats,
  fill,
  type Line,
  sawBeat,
  story,
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
    const vars = () => {
      const s = game.state();
      return {
        nick: story.get(s).choices["nick"] ?? "you",
        quota: String(quotaFor(s.day)),
        earned: String(s.earnedToday),
      };
    };

    /** Lines `i`.. as one dialog chain; a line with `choose` remembers the pick. */
    const chain = (lines: ReadonlyArray<Line>, i: number): DialogNode => {
      const l = lines[i]!;
      const next = i + 1 < lines.length ? chain(lines, i + 1) : undefined;
      const reply = (label: string, pick?: () => void): DialogChoice => ({
        label,
        ...(pick && { pick }),
        ...(next && { next }),
      });
      const remember = (key: string, value: string) =>
        reply(value, () => game.dispatch(chose(key, value)));
      const choices: DialogNode["choices"] = l.choose
        ? [
            remember(l.choose.key, l.choose.options[0]),
            remember(l.choose.key, l.choose.options[1]),
          ]
        : next && [reply("Go on")];
      return {
        speaker: l.speaker,
        line: fill(l.line, vars()),
        ...(choices && { choices }),
      };
    };

    const play = (b: Beat) =>
      new Promise<void>((resolve) => {
        game.dispatch(sawBeat(b.id));
        const lines = b.learn
          ? [...b.lines, { speaker: "What to spot", line: b.learn }]
          : b.lines;
        world.player.controls.unlock();
        openDialog(chain(lines, 0), resolve);
      });

    const queue: Beat[] = [];
    const enqueue = (day: number, on: Trigger) => {
      for (const b of dueBeats(beats, game.state(), day, on))
        if (!queue.includes(b)) queue.push(b);
    };
    let playing = false;
    const idle = () => !playing && !dialogOpen() && !modalOpen();

    const stops = [
      world.onFrame(() => {
        const next = queue[0];
        if (!next || !idle()) return;
        queue.shift();
        playing = true;
        void play(next).then(() => {
          playing = false;
        });
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
