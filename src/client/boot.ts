import { Effect } from "effect";
import { loadRun } from "../core/save.ts";
import { initialState } from "../core/state.ts";
import { makeGameStore } from "../core/store.ts";
import { starterScams } from "../scams/registry.ts";
import { type Game, gameFromStore } from "./game.ts";

/** Resumes the saved run (core/save.ts), or creates a fresh one. */
export const bootGame = (): Game =>
  gameFromStore(
    Effect.runSync(
      makeGameStore(loadRun(localStorage) ?? initialState(starterScams)),
    ),
  );

/** Test hook for automated playtests (Playwright): open the page with ?debug. */
export const exposeDebug = (hooks: Record<string, unknown>) => {
  if (new URLSearchParams(location.search).has("debug")) {
    Object.assign(window, { indicentre: hooks });
  }
};
