import "./modal.css";

let openCount = 0;
/** True while a modal card is up, so other scenes can wait their turn. */
export const modalOpen = () => openCount > 0;

/**
 * A blocking card above everything with one button (day report, run end).
 * Esc presses the button too, and never reaches the stand-up handler.
 * For conversations use dialog/dialog.ts instead.
 */
export const showModal = (
  html: string,
  button: string,
  onClose: () => void = () => {},
) => {
  const root = document.createElement("div");
  root.className = "modal";
  root.innerHTML = `<div class="modal-card">${html}<button class="btn"></button></div>`;
  const b = root.querySelector("button")!;
  b.textContent = button;
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
