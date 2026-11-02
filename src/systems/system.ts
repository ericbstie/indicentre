import type { Game } from "../client/game.ts";
import type { World } from "../client/scene.ts";

/**
 * A self-contained gameplay feature (NPC, clock, news TV, boss...).
 * `start` gets the game (state, actions, events) and the 3D world, and
 * subscribes to events / frames / interactions. Systems live for the page.
 * One file per system in src/systems/ with `export default { ... } satisfies GameSystem`;
 * `bun run gen` collects it into src/systems/index.ts (started in file-name order).
 */
export interface GameSystem {
  readonly id: string;
  readonly start: (ctx: { readonly game: Game; readonly world: World }) => void;
}
