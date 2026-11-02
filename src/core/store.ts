import { Context, Effect, Layer, Ref } from "effect";
import { type Action, type GameState, initialState, reduce } from "./state.ts";

type Listener = (state: GameState, action: Action) => void;

export interface GameStoreShape {
  readonly get: Effect.Effect<GameState>;
  readonly dispatch: (action: Action) => Effect.Effect<GameState>;
  /** Called synchronously after every dispatch. Returns an unsubscribe. */
  readonly subscribe: (listener: Listener) => () => void;
}

export class GameStore extends Context.Service<GameStore, GameStoreShape>()(
  "indicentre/GameStore",
) {}

export const makeGameStore = (initial: GameState = initialState()) =>
  Effect.gen(function* () {
    const ref = yield* Ref.make(initial);
    const listeners = new Set<Listener>();
    return GameStore.of({
      get: Ref.get(ref),
      dispatch: (action) =>
        Ref.updateAndGet(ref, (s) => reduce(s, action)).pipe(
          Effect.tap((s) =>
            Effect.sync(() => listeners.forEach((l) => l(s, action))),
          ),
        ),
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    });
  });

export const GameStoreLive = (initial?: GameState) =>
  Layer.effect(GameStore, makeGameStore(initial));
