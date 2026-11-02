import { expect, test } from "bun:test";
import {
  clearRun,
  decodeRun,
  encodeRun,
  loadRun,
  SAVE_VERSION,
  saveRun,
} from "./save.ts";
import { initialState, reduce } from "./state.ts";

const memory = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};

const midRun = () =>
  [
    { type: "earn", amount: 120 },
    { type: "heat", amount: 12 },
    { type: "tick", minutes: 30 },
    { type: "scamFailed", scam: "phishing" },
    { type: "heardHint", coworker: "priya" },
    {
      type: "mail",
      mail: { id: "m1", from: "Boss", subject: "Hi", body: "." },
    },
    { type: "findClue", id: "c1" },
    { type: "buy", item: { kind: "tool", id: "persondata", price: 80 } },
    { type: "endDay" },
  ].reduce(
    (s, a) => reduce(s, a as Parameters<typeof reduce>[1]),
    initialState(["phishing"]),
  );

test("a run round-trips through storage", () => {
  const storage = memory();
  const s = midRun();
  expect(s.day).toBe(2);
  saveRun(storage, s);
  expect(loadRun(storage)).toEqual(s);
  clearRun(storage);
  expect(loadRun(storage)).toBeUndefined();
});

test("another save version starts a fresh run", () => {
  const raw = JSON.parse(encodeRun(midRun()));
  expect(decodeRun(JSON.stringify(raw))).toBeDefined();
  raw.version = SAVE_VERSION + 1;
  expect(decodeRun(JSON.stringify(raw))).toBeUndefined();
});

test("missing, corrupt, misshapen or finished saves are ignored", () => {
  expect(decodeRun(null)).toBeUndefined();
  expect(decodeRun("{nope")).toBeUndefined();
  const { inbox: _, ...partial } = midRun();
  expect(
    decodeRun(JSON.stringify({ version: SAVE_VERSION, state: partial })),
  ).toBeUndefined();
  const over = { ...midRun(), status: "fired" as const };
  expect(decodeRun(encodeRun(over))).toBeUndefined();
});

test("storage that throws never breaks the game", () => {
  const broken = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  expect(() => saveRun(broken, midRun())).not.toThrow();
  expect(loadRun(broken)).toBeUndefined();
  expect(() => clearRun(broken)).not.toThrow();
});
