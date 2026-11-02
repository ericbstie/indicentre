import "./mail.css";
import { unreadCount } from "../core/state.ts";
import { esc, escLines } from "../desktop/html.ts";
import type { DesktopApp } from "./app.ts";

export default {
  id: "mail",
  title: "Mail",
  icon: "✉",
  order: 0,
  badge: ({ game }) => {
    const n = unreadCount(game.state());
    return n ? String(n) : "";
  },
  mount(el, { game }) {
    el.innerHTML = `<div class="mail"><ul class="mail-list"></ul><article class="mail-read"></article></div>`;
    const list = el.querySelector<HTMLElement>(".mail-list")!;
    const reader = el.querySelector<HTMLElement>(".mail-read")!;
    let selected: string | undefined;

    const render = () => {
      const { inbox } = game.state();
      list.innerHTML = inbox.length
        ? inbox
            .map(
              (m) =>
                `<li data-id="${esc(m.id)}" class="${m.read ? "" : "unread"} ${m.id === selected ? "selected" : ""}">
                  <b>${esc(m.from)}</b><span>${esc(m.subject)}</span></li>`,
            )
            .join("")
        : `<li class="empty">No mail.</li>`;
      const m = inbox.find((x) => x.id === selected);
      reader.innerHTML = m
        ? `<h3>${esc(m.subject)}</h3><p class="from">From: ${esc(m.from)}</p><p>${escLines(m.body)}</p>`
        : `<p class="empty">Select a message.</p>`;
    };

    list.onclick = (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>("[data-id]")
        ?.dataset["id"];
      if (!id) return;
      selected = id;
      game.dispatch({ type: "readMail", id });
    };

    render();
    return game.subscribe(render);
  },
} satisfies DesktopApp;
