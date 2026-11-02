// Typed game events. Features subscribe to these instead of editing the
// reducer. State-derived events (bucks, heat, day) are emitted by the store
// after every dispatch; others (ScamResolved) are emitted by the code that
// knows about them. Append new variants; don't reorder.

import type { GameState, ScamId } from "./state.ts";

export type GameEvent =
  | {
      readonly type: "ScamResolved";
      readonly scam: ScamId;
      readonly target: string;
      readonly success: boolean;
      readonly bucks: number;
      readonly heat: number;
    }
  | {
      readonly type: "BucksChanged";
      readonly from: number;
      readonly to: number;
    }
  | { readonly type: "HeatChanged"; readonly from: number; readonly to: number }
  | { readonly type: "DayAdvanced"; readonly day: number };

export type EventType = GameEvent["type"];
export type EventOf<T extends EventType> = Extract<GameEvent, { type: T }>;

/** Events implied by a state transition. Pure. */
export const diffEvents = (prev: GameState, next: GameState): GameEvent[] => {
  const out: GameEvent[] = [];
  if (prev.scamBucks !== next.scamBucks)
    out.push({
      type: "BucksChanged",
      from: prev.scamBucks,
      to: next.scamBucks,
    });
  if (prev.shutdownMeter !== next.shutdownMeter)
    out.push({
      type: "HeatChanged",
      from: prev.shutdownMeter,
      to: next.shutdownMeter,
    });
  if (prev.day !== next.day) out.push({ type: "DayAdvanced", day: next.day });
  return out;
};

export interface EventBus {
  /** Subscribe to one event type. Returns an unsubscribe. */
  readonly on: <T extends EventType>(
    type: T,
    handler: (event: EventOf<T>) => void,
  ) => () => void;
  /** Deliver an event synchronously to its subscribers. */
  readonly emit: (event: GameEvent) => void;
}

export const createBus = (): EventBus => {
  const handlers = new Map<EventType, Set<(e: GameEvent) => void>>();
  return {
    on: (type, handler) => {
      const set = handlers.get(type) ?? new Set();
      handlers.set(type, set);
      const h = handler as (e: GameEvent) => void;
      set.add(h);
      return () => set.delete(h);
    },
    emit: (event) => handlers.get(event.type)?.forEach((h) => h(event)),
  };
};
