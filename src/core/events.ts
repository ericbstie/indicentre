// Typed game events. Features subscribe to these instead of editing the
// reducer. State-derived events (bucks, heat, day) are emitted by the store
// after every dispatch; others (ScamResolved) are emitted by the code that
// knows about them. Append new variants; don't reorder.

import type { DeskTier } from "../workplace/slice.ts";
import type { DaySummary } from "./economy.ts";
import type { GameState, ScamId } from "./state.ts";

/** Who a scam was run on, as much as the news needs to tell the story. */
export interface VictimProfile {
  readonly name: string;
  readonly age: number;
  readonly occupation: string;
  /** One concrete fact, e.g. "Plays bridge on Thursdays." */
  readonly detail: string;
  /** The habit that beats scams, shown when they catch one. */
  readonly defense: { readonly behavior: string; readonly line: string };
}

export type GameEvent =
  | {
      readonly type: "ScamResolved";
      readonly scam: ScamId;
      readonly target: string;
      readonly success: boolean;
      readonly bucks: number;
      readonly heat: number;
      readonly victim: VictimProfile;
    }
  | {
      readonly type: "BucksChanged";
      readonly from: number;
      readonly to: number;
    }
  | { readonly type: "HeatChanged"; readonly from: number; readonly to: number }
  | { readonly type: "DayAdvanced"; readonly day: number }
  | {
      readonly type: "HintGiven";
      readonly coworker: string;
      readonly scam: ScamId;
      readonly hint: string;
    }
  | {
      readonly type: "BossMoodChanged";
      readonly from: number;
      readonly to: number;
    }
  | { readonly type: "DayEnded"; readonly summary: DaySummary }
  | {
      readonly type: "RunEnded";
      readonly status: Exclude<GameState["status"], "playing">;
    }
  | { readonly type: "DeskUpgraded"; readonly tier: DeskTier };

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
  if (prev.bossMood !== next.bossMood)
    out.push({
      type: "BossMoodChanged",
      from: prev.bossMood,
      to: next.bossMood,
    });
  const ended =
    next.days.length > prev.days.length ? next.days.at(-1) : undefined;
  if (ended) out.push({ type: "DayEnded", summary: ended });
  if (next.workplace.deskTier > prev.workplace.deskTier)
    out.push({ type: "DeskUpgraded", tier: next.workplace.deskTier });
  if (prev.status === "playing" && next.status !== "playing")
    out.push({ type: "RunEnded", status: next.status });
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
