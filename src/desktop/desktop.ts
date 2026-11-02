import type { Game } from "../client/game.ts";

/**
 * A desktop app. `mount` renders into `el` and may return a cleanup.
 * Register new apps in src/desktop/apps/index.ts.
 */
export interface DesktopApp {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  /** Optional badge text (e.g. unread count); re-evaluated on state change. */
  readonly badge?: (game: Game) => string;
  readonly mount: (el: HTMLElement, game: Game) => (() => void) | void;
}

/** The in-world PC screen as an HTML overlay with an icon bar and one open window. */
export const createDesktop = (
  root: HTMLElement,
  game: Game,
  apps: ReadonlyArray<DesktopApp>,
) => {
  root.className = "desktop";
  root.hidden = true;
  root.innerHTML = `
    <nav class="taskbar"></nav>
    <section class="window" hidden>
      <header><span data-title></span><button data-close title="Close">×</button></header>
      <div class="window-body"></div>
    </section>
    <footer class="hint">Esc to stand up</footer>`;
  const taskbar = root.querySelector<HTMLElement>(".taskbar")!;
  const win = root.querySelector<HTMLElement>(".window")!;
  const title = root.querySelector<HTMLElement>("[data-title]")!;
  const body = root.querySelector<HTMLElement>(".window-body")!;
  let cleanup: (() => void) | void;

  const icons = apps.map((app) => {
    const b = document.createElement("button");
    b.className = "app-icon";
    b.onclick = () => launch(app.id);
    taskbar.append(b);
    return { app, b };
  });
  const renderIcons = () => {
    for (const { app, b } of icons) {
      const badge = app.badge?.(game) ?? "";
      b.innerHTML = `<span>${app.icon}</span>${app.title}${badge ? `<b>${badge}</b>` : ""}`;
    }
  };
  game.subscribe(renderIcons);
  renderIcons();

  const closeApp = () => {
    cleanup?.();
    cleanup = undefined;
    body.replaceChildren();
    win.hidden = true;
  };

  const launch = (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    closeApp();
    title.textContent = app.title;
    win.hidden = false;
    cleanup = app.mount(body, game);
  };

  root.querySelector<HTMLElement>("[data-close]")!.onclick = closeApp;

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
