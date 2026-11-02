import "./dialog.css";

export interface DialogChoice {
  readonly label: string;
  /** Runs when picked, before `next` is shown. */
  readonly pick?: () => void;
  /** Shown after picking; without it the dialog closes. */
  readonly next?: DialogNode;
}

/** One line of dialog. Pure data so content files can define whole exchanges. */
export interface DialogNode {
  readonly speaker: string;
  readonly line: string;
  /** Up to two replies. None = the player can only leave. */
  readonly choices?: readonly [DialogChoice, DialogChoice?];
}

let root: HTMLElement | undefined;
let onClose: (() => void) | undefined;
let current: DialogNode | undefined;

const mount = () => {
  const el = document.createElement("div");
  el.className = "dialog-layer";
  el.hidden = true;
  // Clicking outside the box leaves; it also keeps clicks off the canvas
  // so the pointer doesn't re-lock mid-conversation.
  el.addEventListener("click", (e) => {
    if (e.target === el) closeDialog();
  });
  window.addEventListener("keydown", (e) => {
    if (!current) return;
    if (e.code === "Escape") closeDialog();
    const i = ["Digit1", "Digit2"].indexOf(e.code);
    const choice = i >= 0 ? current.choices?.[i] : undefined;
    if (choice) choose(choice);
  });
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
  const leave = document.createElement("span");
  leave.className = "dialog-leave";
  leave.textContent = "[Esc] Leave";
  replies.append(leave);
  box.append(who, line, replies);
  root.replaceChildren(box);
  root.hidden = false;
  current = node;
};

const choose = (c: DialogChoice) => {
  c.pick?.();
  if (c.next) render(c.next);
  else closeDialog();
};

/** Shows `node`, replacing any open dialog. `closed` runs once when it ends. */
export const openDialog = (node: DialogNode, closed?: () => void) => {
  onClose = closed;
  render(node);
};

export const closeDialog = () => {
  if (!root || !current) return;
  root.hidden = true;
  current = undefined;
  const done = onClose;
  onClose = undefined;
  done?.();
};

export const isDialogOpen = () => current !== undefined;
