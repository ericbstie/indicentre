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

/** k distinct items, order randomized. */
export const sample = <T>(rng: Rng, xs: ReadonlyArray<T>, k: number): T[] => {
  const pool = [...xs];
  const out: T[] = [];
  while (out.length < k && pool.length) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!);
  }
  return out;
};
