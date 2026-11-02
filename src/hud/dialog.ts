import "./dialog.css";

/** A modal card above everything with one button (day report, run end). */
export const showDialog = (
  html: string,
  button: string,
  onClose: () => void = () => {},
) => {
  const root = document.createElement("div");
  root.className = "dialog";
  root.innerHTML = `<div class="dialog-card">${html}<button class="btn"></button></div>`;
  const b = root.querySelector("button")!;
  b.textContent = button;
  b.onclick = () => {
    root.remove();
    onClose();
  };
  document.exitPointerLock();
  document.body.append(root);
  b.focus();
};
