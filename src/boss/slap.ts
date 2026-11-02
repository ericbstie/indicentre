import "./slap.css";

const SLAP_MS = 700;

/** Cartoon slap: the screen jolts and flashes red, then settles. */
export const slap = () =>
  new Promise<void>((resolve) => {
    const vignette = document.createElement("div");
    vignette.className = "boss-vignette";
    document.body.append(vignette);
    document.body.classList.add("boss-shake");
    setTimeout(() => {
      vignette.remove();
      document.body.classList.remove("boss-shake");
      resolve();
    }, SLAP_MS);
  });
