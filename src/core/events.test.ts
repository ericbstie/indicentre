import { expect, test } from "bun:test";
import { Effect } from "effect";
import {
  createBus,
  defineEvent,
  diffEvents,
  type GameEvent,
} from "./events.ts";
import { SHIFT_MINUTES } from "./economy.ts";
import { initialState, reduce } from "./state.ts";
import { makeGameStore } from "./store.ts";

test("diffEvents reports bucks, heat and day changes only", () => {
  const s0 = initialState();
  expect(diffEvents(s0, s0)).toEqual([]);
  const s1 = reduce(reduce(s0, { type: "earn", amount: 5 }), {
    type: "heat",
    amount: 10,
  });
  expect(diffEvents(s0, s1)).toEqual([
    { type: "BucksChanged", from: 0, to: 5 },
    { type: "HeatChanged", from: 0, to: 10 },
  ]);
  const s2 = reduce(s0, { type: "tick", minutes: SHIFT_MINUTES });
  expect(diffEvents(s0, s2)).toContainEqual({ type: "DayAdvanced", day: 2 });
  expect(diffEvents(s0, s2)).toContainEqual({
    type: "DayEnded",
    summary: s2.days[0]!,
  });
});

test("bus delivers only the subscribed type and unsubscribes", () => {
  const bus = createBus();
  const seen: number[] = [];
  const off = bus.on("DayAdvanced", (e) => seen.push(e.day));
  bus.emit({ type: "BucksChanged", from: 0, to: 1 });
  bus.emit({ type: "DayAdvanced", day: 2 });
  off();
  bus.emit({ type: "DayAdvanced", day: 3 });
  expect(seen).toEqual([2]);
});

test("feature events are keyed by their def, not their name", () => {
  const bus = createBus();
  const Ping = defineEvent<{ readonly n: number }>("Ping");
  const OtherPing = defineEvent<{ readonly n: number }>("Ping");
  const seen: number[] = [];
  bus.on(Ping, ({ n }) => seen.push(n));
  bus.emit(Ping, { n: 1 });
  bus.emit(OtherPing, { n: 2 });
  expect(seen).toEqual([1]);
});

test("store emits derived events after dispatch", () => {
  const store = Effect.runSync(makeGameStore());
  const seen: GameEvent[] = [];
  store.on("BucksChanged", (e) => seen.push(e));
  Effect.runSync(store.dispatch({ type: "earn", amount: 7 }));
  Effect.runSync(store.dispatch({ type: "earn", amount: -1 }));
  expect(seen).toEqual([{ type: "BucksChanged", from: 0, to: 7 }]);
});
