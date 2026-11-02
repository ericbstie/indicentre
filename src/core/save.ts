// Save service: one run in localStorage, so a 10-day run survives a reload.
// Pure apart from the Storage you pass in (tests use a Map-backed fake).
import { type GameState, initialState } from "./state.ts";

/** Bump whenever GameState's shape changes (save.test.ts checks the keys).
 * A save with any other version is dropped and a fresh run starts. */
export const SAVE_VERSION = 1;

const KEY = "indicentre/run";

type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

interface SaveFile {
  readonly version: number;
  readonly state: GameState;
}

/** Same keys and value kinds as a fresh state; arrays stay arrays. */
const sameShape = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(b)) return Array.isArray(a);
  if (typeof b !== "object" || b === null) return typeof a === typeof b;
  if (typeof a !== "object" || a === null || Array.isArray(a)) return false;
  const want = b as Record<string, unknown>;
  const got = a as Record<string, unknown>;
  // Record-like fields ({} at start) may hold any keys.
  if (Object.keys(want).length === 0) return true;
  return Object.keys(want).every((k) => k in got && sameShape(got[k], want[k]));
};

export const encodeRun = (state: GameState) =>
  JSON.stringify({ version: SAVE_VERSION, state } satisfies SaveFile);

/** The saved run, or undefined if missing, corrupt, finished or another version. */
export const decodeRun = (raw: string | null): GameState | undefined => {
  if (raw === null) return undefined;
  try {
    const file = JSON.parse(raw) as Partial<SaveFile>;
    if (file.version !== SAVE_VERSION) return undefined;
    if (!sameShape(file.state, initialState())) return undefined;
    return file.state!.status === "playing" ? file.state : undefined;
  } catch {
    return undefined;
  }
};

// Storage can throw (private mode, quota, blocked site data): a failed
// save never breaks the game, it just means no Continue next time.
export const saveRun = (storage: SaveStorage, state: GameState) => {
  try {
    storage.setItem(KEY, encodeRun(state));
  } catch {}
};

export const loadRun = (storage: SaveStorage) => {
  try {
    return decodeRun(storage.getItem(KEY));
  } catch {
    return undefined;
  }
};

export const clearRun = (storage: SaveStorage) => {
  try {
    storage.removeItem(KEY);
  } catch {}
};
