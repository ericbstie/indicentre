import "./modal.css";

let openCount = 0;
/** True while a modal card is up, so other scenes can wait their turn. */
export const modalOpen = () => openCount > 0;

/** A quieter second way out of a card, e.g. "New run" next to "Continue". */
interface AltButton {
  readonly label: string;
  readonly onClick: () => void;
}

/**
 * A blocking card above everything with one button (day report, run end),
 * plus an optional link-style alternative. Esc presses the main button
 * and never reaches the stand-up handler.
 * For conversations use dialog/dialog.ts instead.
 */
export const showModal = (
  html: string,
  button: string,
  onClose: () => void = () => {},
  alt?: AltButton,
) => {
  const root = document.createElement("div");
  root.className = "modal";
  root.innerHTML = `<div class="modal-card">${html}<div class="modal-actions"><button class="btn"></button></div></div>`;
  const b = root.querySelector("button")!;
  b.textContent = button;
  if (alt) {
    const a = document.createElement("button");
    a.className = "link";
    a.textContent = alt.label;
    a.onclick = alt.onClick;
    b.after(a);
  }
  const close = () => {
    window.removeEventListener("keydown", onKey, { capture: true });
    root.remove();
    openCount--;
    onClose();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.code !== "Escape") return;
    e.stopImmediatePropagation();
    close();
  };
  b.onclick = close;
  window.addEventListener("keydown", onKey, { capture: true });
  document.exitPointerLock();
  document.body.append(root);
  openCount++;
  b.focus();
};
