import "./shop.css";
import { owns } from "../core/economy.ts";
import { esc } from "../desktop/html.ts";
import { catalog } from "../shop/catalog.ts";
import { tools } from "../shop/tools.ts";
import type { DesktopApp } from "./app.ts";

const lessonFor = (id: string) => tools.find((t) => t.id === id)?.lesson;

/** Buy scams and tools with scam bucks. */
export default {
  id: "shop",
  title: "Shop",
  icon: "$",
  order: 20,
  mount(el, { game }) {
    const render = () => {
      const s = game.state();
      el.innerHTML = `<div class="shop">${catalog
        .map((item) => {
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
                    s.scamBucks < item.price ? "disabled" : ""
                  }>${esc(item.price)} bucks</button>`
            }
          </div>`;
        })
        .join("")}</div>`;
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
