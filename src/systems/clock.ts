import type { GameSystem } from "./system.ts";

/** Real seconds per in-game minute. */
const SECONDS_PER_GAME_MINUTE = 1;

/** Advances the in-game clock while the page runs. */
export const clockSystem: GameSystem = {
  id: "clock",
  start({ game, world }) {
    let acc = 0;
    return world.onFrame((dt) => {
      acc += dt;
      if (acc >= SECONDS_PER_GAME_MINUTE) {
        acc -= SECONDS_PER_GAME_MINUTE;
        game.dispatch({ type: "tick", minutes: 1 });
      }
    });
  },
};
