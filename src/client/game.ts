import { Effect } from "effect";
import type { EventBus } from "../core/events.ts";
import type { Action, GameState } from "../core/state.ts";
import type { GameStoreShape } from "../core/store.ts";

/**
 * Synchronous facade over the Effect GameStore for DOM/three.js code.
 * UI modules take a `Game`, never the store, so they stay Effect-free.
 */
export interface Game extends EventBus {
  readonly state: () => GameState;
  readonly dispatch: (action: Action) => GameState;
  readonly subscribe: GameStoreShape["subscribe"];
}

export const gameFromStore = (store: GameStoreShape): Game => ({
  state: () => Effect.runSync(store.get),
  dispatch: (action) => Effect.runSync(store.dispatch(action)),
  subscribe: store.subscribe,
  on: store.on,
  emit: store.emit,
});
