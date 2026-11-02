import "./speech.css";
import { esc } from "../desktop/html.ts";

/** A subtitle line for the boss, shown above the desktop and HUD. */
export const createSpeech = () => {
  const el = document.createElement("div");
  el.className = "boss-say";
  el.hidden = true;
  document.body.append(el);
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Shows `line`; resolves when it is hidden again. */
  const say = (line: string, ms = 3500) =>
    new Promise<void>((resolve) => {
      clearTimeout(timer);
      el.innerHTML = `<b>Boss:</b>${esc(line)}`;
      el.hidden = false;
      timer = setTimeout(() => {
        el.hidden = true;
        resolve();
      }, ms);
    });
  return { say };
};
