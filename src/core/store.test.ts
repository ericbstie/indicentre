import { expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { GameStore, makeGameStore } from "./store.ts";

test("GameStore dispatches through the reducer and notifies listeners", () => {
  const seen: number[] = [];
  const program = Effect.gen(function* () {
    const store = yield* GameStore;
    const off = store.subscribe((s) => seen.push(s.scamBucks));
    yield* store.dispatch({ type: "earn", amount: 10 });
    off();
    yield* store.dispatch({ type: "earn", amount: 5 });
    return yield* store.get;
  });
  const final = Effect.runSync(
    program.pipe(Effect.provide(Layer.effect(GameStore, makeGameStore()))),
  );
  expect(final.scamBucks).toBe(15);
  expect(seen).toEqual([10]);
});
