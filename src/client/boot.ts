import { Effect } from "effect";
import { initialState } from "../core/state.ts";
import { makeGameStore } from "../core/store.ts";
import { starterScams } from "../scams/registry.ts";
import { type Game, gameFromStore } from "./game.ts";

/** Creates the game for a fresh run. */
export const bootGame = (): Game =>
  gameFromStore(Effect.runSync(makeGameStore(initialState(starterScams))));

/** Test hook for automated playtests (Playwright): open the page with ?debug. */
export const exposeDebug = (hooks: Record<string, unknown>) => {
  if (new URLSearchParams(location.search).has("debug")) {
    Object.assign(window, { indicentre: hooks });
  }
};
