import { type Rng, sample } from "../core/rng.ts";
import type { NewsItem } from "./news.ts";

/**
 * What the TV shows next: breaking items first (in the order pushed), then
 * the ambient list in a shuffled loop that never repeats back to back.
 */
export const createFeed = (rng: Rng, ambient: ReadonlyArray<NewsItem>) => {
  const breaking: NewsItem[] = [];
  let loop: NewsItem[] = [];
  let last: NewsItem | undefined;

  const nextAmbient = () => {
    if (!loop.length) {
      loop = sample(rng, ambient, ambient.length);
      if (loop.length > 1 && loop[0] === last) loop.push(loop.shift()!);
    }
    return loop.shift();
  };

  return {
    push: (item: NewsItem) => void breaking.push(item),
    /** Undefined only when there is no breaking news and no ambient list. */
    next: (): NewsItem | undefined => {
      const item = breaking.shift() ?? nextAmbient();
      last = item;
      return item;
    },
  };
};
