import { Context, Effect, Layer, Ref } from "effect";
import { createBus, diffEvents, type EventBus } from "./events.ts";
import { type Action, type GameState, initialState, reduce } from "./state.ts";

type Listener = (state: GameState, action: Action) => void;

export interface GameStoreShape extends EventBus {
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
    const bus = createBus();
    return GameStore.of({
      ...bus,
      get: Ref.get(ref),
      dispatch: (action) =>
        Ref.modify(ref, (prev) => {
          const next = reduce(prev, action);
          return [[prev, next] as const, next];
        }).pipe(
          Effect.map(([prev, next]) => {
            listeners.forEach((l) => l(next, action));
            diffEvents(prev, next).forEach(bus.emit);
            return next;
          }),
        ),
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    });
  });

export const GameStoreLive = (initial?: GameState) =>
  Layer.effect(GameStore, makeGameStore(initial));
