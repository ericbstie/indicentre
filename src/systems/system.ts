import type { Game } from "../client/game.ts";
import type { World } from "../client/scene.ts";

/** What a system gets at startup: the game (state, actions, events) and the 3D world. */
export interface SystemContext {
  readonly game: Game;
  readonly world: World;
}

/**
 * A self-contained gameplay feature (NPC, clock, news TV, boss...).
 * `start` subscribes to events / frames / interactions and may return a cleanup.
 * One file per system in src/systems/ with `export default { ... } satisfies GameSystem`;
 * `bun run gen` collects it into src/systems/index.ts (started in file-name order).
 */
export interface GameSystem {
  readonly id: string;
  readonly start: (ctx: SystemContext) => (() => void) | void;
}
