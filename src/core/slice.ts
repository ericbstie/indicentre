// Per-feature state. A feature declares its slice in its own file instead of
// editing state.ts. Actions typed "<key>/<verb>" reach only that slice.
import type { GameState } from "./state.ts";

export interface SliceAction {
  readonly type: `${string}/${string}`;
}

export interface Slice<S, A extends SliceAction> {
  readonly key: string;
  readonly initial: S;
  readonly reduce: (state: S, action: A) => S;
  /** This slice's value in a game state (`initial` until first changed). */
  readonly get: (state: GameState) => S;
}

const registry = new Map<string, Slice<unknown, SliceAction>>();

/**
 * Declares a slice. Registration happens on import, which is always before
 * any of its actions can exist: only the slice's module can create them.
 */
export const defineSlice = <
  K extends string,
  S,
  A extends { readonly type: `${K}/${string}` },
>(
  key: K,
  initial: S,
  reduce: (state: S, action: A) => S,
): Slice<S, A> => {
  const get = (state: GameState) =>
    (key in state.slices ? state.slices[key] : initial) as S;
  const slice: Slice<S, A> = { key, initial, reduce, get };
  registry.set(key, slice as unknown as Slice<unknown, SliceAction>);
  return slice;
};

/** Routes a slice action to its slice. Unknown keys change nothing. */
export const reduceSlices = (
  slices: GameState["slices"],
  action: SliceAction,
): GameState["slices"] => {
  const key = action.type.slice(0, action.type.indexOf("/"));
  const slice = registry.get(key);
  if (!slice) return slices;
  const prev = key in slices ? slices[key] : slice.initial;
  const next = slice.reduce(prev, action);
  return next === prev ? slices : { ...slices, [key]: next };
};
