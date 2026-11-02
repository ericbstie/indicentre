// Seeded PRNG so procedural content (targets, outcomes) is reproducible in
// tests and replays. Never use Math.random in game logic; take an Rng.

export type Rng = () => number; // [0, 1)

/** mulberry32 */
export const seeded = (seed: number): Rng => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const int = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const pick = <T>(rng: Rng, xs: ReadonlyArray<T>): T => {
  const x = xs[Math.floor(rng() * xs.length)];
  if (x === undefined) throw new Error("pick from empty list");
  return x;
};

/**
 * A `pick` that remembers what it last returned from each pool and never
 * returns it twice in a row (pools of 2+). Keep one per feature, so lines
 * don't repeat back to back across batches.
 */
export const noRepeat = () => {
  const last = new WeakMap<ReadonlyArray<unknown>, unknown>();
  return <T>(rng: Rng, xs: ReadonlyArray<T>): T => {
    const prev = last.get(xs);
    const x = pick(rng, xs.length > 1 ? xs.filter((y) => y !== prev) : xs);
    last.set(xs, x);
    return x;
  };
};

/** k distinct items, order randomized. */
export const sample = <T>(rng: Rng, xs: ReadonlyArray<T>, k: number): T[] => {
  const pool = [...xs];
  const out: T[] = [];
  while (out.length < k && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!);
  }
  return out;
};

/** Float in [min, max). */
export const range = (rng: Rng, min: number, max: number) =>
  min + rng() * (max - min);

/** Pick by weight. Items with weight <= 0 are never picked. */
export const weighted = <T>(
  rng: Rng,
  xs: ReadonlyArray<T>,
  weight: (x: T) => number,
): T => {
  const total = xs.reduce((n, x) => n + Math.max(0, weight(x)), 0);
  if (total <= 0) throw new Error("weighted pick with no positive weights");
  let r = rng() * total;
  for (const x of xs) {
    r -= Math.max(0, weight(x));
    if (r < 0) return x;
  }
  return xs.findLast((x) => weight(x) > 0)!;
};

/** Stable 32-bit seed from a string (FNV-1a), e.g. `?seed=playtest-3`. */
export const seedFrom = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
};
