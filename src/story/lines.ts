import type { DialogChoice, DialogNode } from "../dialog/dialog.ts";
import { fill } from "../core/text.ts";
import type { Line } from "./story.ts";

export interface LinesContext {
  /** Values for `{key}` placeholders, read when each line is shown. */
  readonly vars: () => Readonly<Record<string, string>>;
  /** Stores a `choose` pick. */
  readonly remember: (key: string, value: string) => void;
}

/** Lines `i`.. as one dialog chain, then `after`. A `choose` line remembers the pick. */
export const linesDialog = (
  ctx: LinesContext,
  lines: ReadonlyArray<Line>,
  after?: () => DialogNode,
  i = 0,
): DialogNode => {
  const l = lines[i]!;
  const last = i + 1 >= lines.length;
  const reply = (label: string, pick?: () => void): DialogChoice => ({
    label,
    ...(pick && { pick }),
    ...(last
      ? after && { next: after }
      : { next: () => linesDialog(ctx, lines, after, i + 1) }),
  });
  const remember = (key: string, value: string) =>
    reply(value, () => ctx.remember(key, value));
  if (l.choose)
    return {
      speaker: l.speaker,
      line: fill(l.line, ctx.vars()),
      choices: [
        remember(l.choose.key, l.choose.options[0]),
        remember(l.choose.key, l.choose.options[1]),
      ],
      esc: null,
    };
  const next = reply("Go on");
  return {
    speaker: l.speaker,
    line: fill(l.line, ctx.vars()),
    choices: [next],
    esc: next,
  };
};
