import "./shop.css";
import { canBuy, owns } from "../core/economy.ts";
import type { GameState } from "../core/state.ts";
import { beats } from "../content/story.ts";
import { esc, tagList } from "../desktop/html.ts";
import { type CatalogItem, catalog, lessonFor } from "../shop/catalog.ts";
import { modifiersFor } from "../shop/tools.ts";
import { shopSells } from "../story/story.ts";
import type { DesktopApp } from "./app.ts";

const row = (s: GameState, item: CatalogItem) => {
  const have = owns(s, item);
  const lesson = have ? lessonFor(item.id) : undefined;
  return `
  <div class="item panel">
    <div><b>${esc(item.name)}</b>${item.tags ? ` ${tagList(item.tags)}` : ""}<p>${esc(item.blurb(modifiersFor(s.ownedTools)))}</p>${
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

/** A heading and its rows, or nothing when there is nothing to show. */
const section = (
  s: GameState,
  title: string,
  items: ReadonlyArray<CatalogItem>,
) =>
  items.length
    ? `<h3>${esc(title)}</h3>${items.map((item) => row(s, item)).join("")}`
    : "";

/** Buy tools, desk upgrades, and scams once the story has introduced them. */
export default {
  id: "shop",
  title: "Shop",
  icon: "$",
  order: 20,
  mount(el, { game }) {
    const render = () => {
      const s = game.state();
      // Owned scams live in Leads; only new ones are for sale here.
      const of = (kind: CatalogItem["kind"]) =>
        catalog.filter((c) => c.kind === kind);
      el.innerHTML = `<div class="shop page">${section(
        s,
        "Scams",
        of("scam").filter((c) => !owns(s, c) && shopSells(beats, c.id, s.day)),
      )}${section(s, "Tools", of("tool"))}${section(s, "Your desk", of("upgrade"))}</div>`;
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
