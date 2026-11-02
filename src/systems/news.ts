import { receiveMail } from "../content/mail.ts";
import { AMBIENT } from "../content/news.ts";
import { seeded } from "../core/rng.ts";
import { createFeed } from "../news/feed.ts";
import { type NewsItem, storyFor } from "../news/news.ts";
import { ROOM } from "../scene/office.ts";
import { buildTv } from "../scene/tv.ts";
import type { GameSystem } from "./system.ts";

/** Seconds an ambient item stays up. */
const AMBIENT_SECONDS = 10;
/** Seconds a story about the player's own work stays up. */
const STORY_SECONDS = 18;
/** "Breaking" lag after a scam resolves, so it feels like the world noticed. */
const BREAKING_DELAY = 3;

const BANNERS: Record<NewsItem["kind"], { text: string; color: string }> = {
  victim: { text: "BREAKING", color: "#b8322a" },
  spotted: { text: "GOOD NEWS", color: "#2e7d4f" },
  ambient: { text: "OFFICE NEWS 24/7", color: "#2a4f7a" },
};

/**
 * The wall TV: cycles world news, runs the player's victims as breaking
 * news, and runs targets who caught the scam as good news.
 */
export default {
  id: "news",
  start({ game, world }) {
    const tv = buildTv();
    tv.group.position.set(0, 2.2, -ROOM.depth / 2 + 0.06);
    world.office.scene.add(tv.group);

    const feed = createFeed(seeded(game.state().day), AMBIENT);
    let timer = 0;
    let lastMailDay = 0;

    const show = (item: NewsItem) =>
      tv.screen.show(
        [
          { text: item.headline, size: 26, bold: true, color: "#fff" },
          ...(item.profile
            ? [{ text: item.profile, size: 20, color: "#a8b0bc" }]
            : []),
          ...(item.quote
            ? [{ text: item.quote, size: 22, color: "#f2d38a" }]
            : []),
        ],
        { banner: BANNERS[item.kind] },
      );

    const mailAbout = (item: NewsItem) => {
      const { day, minute } = game.state();
      if (day === lastMailDay) return;
      lastMailDay = day;
      game.dispatch(
        receiveMail({
          id: `news-${day}-${minute}`,
          from: "Tommy",
          subject: "Did you see the news?",
          body: `Did you see the TV?

"${item.headline}"

That one yours? The boss says if it makes the news it counts double. It doesn't. I asked.

- Tommy`,
        }),
      );
    };

    game.on("ScamResolved", (e) => {
      const { day, minute } = game.state();
      const story = storyFor(seeded(day * 10_000 + minute + 101), e);
      feed.push(story);
      timer = Math.min(timer, BREAKING_DELAY);
    });

    world.onFrame((dt) => {
      timer -= dt;
      if (timer > 0) return;
      const item = feed.next();
      if (!item) return;
      show(item);
      if (item.kind === "victim") mailAbout(item);
      timer = item.kind === "ambient" ? AMBIENT_SECONDS : STORY_SECONDS;
    });
  },
} satisfies GameSystem;
