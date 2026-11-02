import "./dialog.css";
import { hush, speak } from "../audio/speak.ts";
import { modalOpen } from "../hud/modal.ts";

export interface DialogChoice {
  readonly label: string;
  /** Runs when picked, before `next` is shown. */
  readonly pick?: () => void;
  /** Shown after picking; without it the dialog closes. A function is
   * called after `pick`, so the next line can depend on the choice. */
  readonly next?: DialogNode | (() => DialogNode);
}

/** One line of dialog. Pure data so content files can define whole exchanges. */
export interface DialogNode {
  readonly speaker: string;
  readonly line: string;
  /** Up to two replies. None = the player can only leave. */
  readonly choices?: readonly [DialogChoice, DialogChoice?];
  /** A countdown bar; when it runs out, `then` is picked for the player. */
  readonly timeout?: { readonly ms: number; readonly then: DialogChoice };
  /** What Esc does: leave (left out), pick this choice, or nothing (null).
   * Story scenes step one line on Esc, so one key can't skip a whole scene. */
  readonly esc?: DialogChoice | null;
}

let root: HTMLElement | undefined;
let onClose: (() => void) | undefined;
let current: DialogNode | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

const mount = () => {
  const el = document.createElement("div");
  el.className = "dialog-layer";
  el.hidden = true;
  // Clicking outside the box leaves; it also keeps clicks off the canvas
  // so the pointer doesn't re-lock mid-conversation.
  el.addEventListener("click", (e) => {
    if (e.target === el) closeDialog();
  });
  // Capture phase: Esc leaves the dialog only, it never also stands you up.
  window.addEventListener(
    "keydown",
    (e) => {
      if (!current) return;
      if (e.code === "Escape") {
        e.stopImmediatePropagation();
        if (current.esc === undefined) closeDialog();
        else if (current.esc) choose(current.esc);
        return;
      }
      const i = ["Digit1", "Digit2"].indexOf(e.code);
      const choice = i >= 0 ? current?.choices?.[i] : undefined;
      if (choice) choose(choice);
    },
    { capture: true },
  );
  document.body.append(el);
  return el;
};

const render = (node: DialogNode) => {
  root ??= mount();
  const box = document.createElement("div");
  box.className = "dialog";
  const who = document.createElement("b");
  who.textContent = node.speaker;
  const line = document.createElement("p");
  line.textContent = node.line;
  const replies = document.createElement("div");
  replies.className = "dialog-choices";
  node.choices?.forEach((c, i) => {
    if (!c) return;
    const btn = document.createElement("button");
    btn.className = "link";
    btn.textContent = `${i + 1}. ${c.label}`;
    btn.addEventListener("click", () => choose(c));
    replies.append(btn);
  });
  if (node.esc === undefined) {
    const leave = document.createElement("span");
    leave.className = "dialog-leave";
    leave.textContent = "[Esc] Leave";
    replies.append(leave);
  }
  box.append(who, line, replies);
  clearTimeout(timer);
  const t = node.timeout;
  if (t) {
    const bar = document.createElement("div");
    bar.className = "dialog-timer";
    bar.style.animationDuration = `${t.ms}ms`;
    box.append(bar);
    timer = setTimeout(() => current === node && choose(t.then), t.ms);
  }
  root.replaceChildren(box);
  root.hidden = false;
  current = node;
  speak({ speaker: node.speaker, text: node.line });
};

const choose = (c: DialogChoice) => {
  c.pick?.();
  const next = typeof c.next === "function" ? c.next() : c.next;
  if (next) render(next);
  else closeDialog();
};

/**
 * Shows `node`, replacing any open dialog. `closed` runs once when it ends,
 * including when another dialog replaces it.
 */
export const openDialog = (node: DialogNode, closed?: () => void) => {
  const replaced = onClose;
  onClose = closed;
  replaced?.();
  render(node);
};

const closeDialog = () => {
  if (!root || !current) return;
  root.hidden = true;
  current = undefined;
  hush();
  clearTimeout(timer);
  const done = onClose;
  onClose = undefined;
  done?.();
  drain();
};

/** How often a waiting line checks whether a modal card has closed. */
const RETRY_MS = 250;
const queue: Array<() => void> = [];
let retry: ReturnType<typeof setTimeout> | undefined;

const drain = () => {
  clearTimeout(retry);
  retry = undefined;
  if (!queue.length) return;
  if (!current && !modalOpen()) queue.shift()!();
  // Lines don't call drain when a card closes, so keep checking.
  if (queue.length) retry = setTimeout(drain, RETRY_MS);
};

/**
 * Shows `node` once nothing else is up (another dialog or a modal card),
 * in the order queued, instead of talking over it. Resolves when shown.
 * Waits one tick first, so a card opened by the same event goes up first.
 */
/**
 * Shows a modal card (`show` calls hud/modal.ts showModal) once the open
 * dialog closes, ahead of the lines already waiting: the day report goes up
 * before the next day's first line.
 */
export const queueCard = (show: () => void) => {
  queue.unshift(show);
  retry ??= setTimeout(drain);
};

export const queueDialog = (node: DialogNode, closed?: () => void) =>
  new Promise<void>((shown) => {
    queue.push(() => {
      openDialog(node, closed);
      shown();
    });
    retry ??= setTimeout(drain);
  });
