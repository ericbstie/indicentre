import "./shop.css";
import { canBuy, owns } from "../core/economy.ts";
import type { GameState } from "../core/state.ts";
import { esc } from "../desktop/html.ts";
import { type CatalogItem, catalog, lessonFor } from "../shop/catalog.ts";
import type { DesktopApp } from "./app.ts";

const row = (s: GameState, item: CatalogItem) => {
  const have = owns(s, item);
  const lesson = have ? lessonFor(item.id) : undefined;
  return `
  <div class="item">
    <div><b>${esc(item.name)}</b><p>${esc(item.blurb)}</p>${
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

/** Buy scams, tools and things for your desk with scam bucks. */
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
        catalog.filter((c) => c.kind !== "upgrade"),
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
