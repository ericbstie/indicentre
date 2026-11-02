import type { Game } from "../client/game.ts";

/** What an app gets when it opens. */
export interface AppContext {
  readonly game: Game;
}

/**
 * A desktop app: one file in src/apps/ with `export default { ... } satisfies DesktopApp`.
 * `bun run gen` collects it into src/apps/index.ts.
 */
export interface DesktopApp {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  /** Taskbar position, low first. Apps without one go last, by id. */
  readonly order?: number;
  /** Optional badge text (e.g. unread count); re-evaluated on state change. */
  readonly badge?: (ctx: AppContext) => string;
  /** Render into `el`; may return a cleanup that runs when the app closes. */
  readonly mount: (el: HTMLElement, ctx: AppContext) => (() => void) | void;
}
