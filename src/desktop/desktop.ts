import "./desktop.css";
import type { AppContext, DesktopApp } from "../apps/app.ts";
import type { Game } from "../client/game.ts";

const byOrder = (a: DesktopApp, b: DesktopApp) =>
  (a.order ?? Infinity) - (b.order ?? Infinity) || a.id.localeCompare(b.id);

/** The in-world PC screen as an HTML overlay with an icon bar and one open window. */
export const createDesktop = (
  root: HTMLElement,
  game: Game,
  registry: ReadonlyArray<DesktopApp>,
) => {
  const apps = [...registry].sort(byOrder);
  const ctx: AppContext = { game };
  root.className = "desktop";
  root.hidden = true;
  root.innerHTML = `
    <nav class="taskbar"></nav>
    <section class="window" hidden></section>
    <footer class="hint">[Esc] Stand up</footer>`;
  const taskbar = root.querySelector<HTMLElement>(".taskbar")!;
  const win = root.querySelector<HTMLElement>(".window")!;
  let cleanup: (() => void) | void;
  let current: string | undefined;

  const icons = apps.map((app) => {
    const b = document.createElement("button");
    b.className = "app-icon";
    b.onclick = () => launch(app.id);
    taskbar.append(b);
    return { app, b };
  });
  const renderIcons = () => {
    for (const { app, b } of icons) {
      const badge = app.badge?.(ctx) ?? "";
      b.classList.toggle("active", app.id === current);
      b.innerHTML = `<span>${app.icon}</span>${app.title}${badge ? `<b>${badge}</b>` : ""}`;
    }
  };
  game.subscribe(renderIcons);
  renderIcons();

  const closeApp = () => {
    cleanup?.();
    cleanup = undefined;
    win.replaceChildren();
    win.hidden = true;
    current = undefined;
    renderIcons();
  };

  const launch = (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    closeApp();
    current = id;
    renderIcons();
    win.hidden = false;
    // A fresh element per app, so no handler outlives its app.
    const body = document.createElement("div");
    win.replaceChildren(body);
    cleanup = app.mount(body, ctx);
  };

  return {
    get isOpen() {
      return !root.hidden;
    },
    open() {
      root.hidden = false;
    },
    close() {
      closeApp();
      root.hidden = true;
    },
    launch,
  };
};

export type Desktop = ReturnType<typeof createDesktop>;
