import "./shop.css";
import { canBuy, owns } from "../core/economy.ts";
import type { GameState } from "../core/state.ts";
import { beats } from "../content/story.ts";
import { esc, tagList } from "../desktop/html.ts";
import { type CatalogItem, catalog, lessonFor } from "../shop/catalog.ts";
import { shopSells } from "../story/story.ts";
import type { DesktopApp } from "./app.ts";

const row = (s: GameState, item: CatalogItem) => {
  const have = owns(s, item);
  const lesson = have ? lessonFor(item.id) : undefined;
  return `
  <div class="item">
    <div><b>${esc(item.name)}</b>${item.tags ? ` ${tagList(item.tags)}` : ""}<p>${esc(item.blurb)}</p>${
      lesson ? `<p class="lesson">${esc(lesson)}</p>` : ""
    }</div>
    ${
      have
        ? `<span class="empty">Owned</span>`
        : `<button class="btn" data-buy="${esc(item.id)}" ${
            canBuy(s, item) ? "" : "disabled"
          }>${esc(item.price)} bucks</button>`
    }
  </div>`;
};

const rows = (s: GameState, items: ReadonlyArray<CatalogItem>) =>
  items.map((item) => row(s, item)).join("");

/** Buy tools, desk upgrades, and scams once the story has introduced them. */
export default {
  id: "shop",
  title: "Shop",
  icon: "$",
  order: 20,
  mount(el, { game }) {
    const render = () => {
      const s = game.state();
      el.innerHTML = `<div class="shop">${rows(
        s,
        catalog.filter(
          (c) =>
            c.kind === "tool" ||
            (c.kind === "scam" &&
              (owns(s, c) || shopSells(beats, c.id, s.day))),
        ),
      )}<h3>Your desk</h3>${rows(
        s,
        catalog.filter((c) => c.kind === "upgrade"),
      )}</div>`;
    };
    el.onclick = (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>("[data-buy]")
        ?.dataset["buy"];
      const item = catalog.find((c) => c.id === id);
      if (item) game.dispatch({ type: "buy", item });
    };
    render();
    return game.subscribe(render);
  },
} satisfies DesktopApp;
