import "./mail.css";
import { inbox, readMail, unreadCount } from "../content/mail.ts";
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
    el.innerHTML = `<div class="mail"><ul class="mail-list"></ul><article class="mail-read page"></article></div>`;
    const list = el.querySelector<HTMLElement>(".mail-list")!;
    const reader = el.querySelector<HTMLElement>(".mail-read")!;
    let selected: string | undefined;

    const render = () => {
      const mails = inbox.get(game.state());
      list.innerHTML = mails.length
        ? mails
            .map(
              (m) =>
                `<li data-id="${esc(m.id)}" class="${m.read ? "" : "unread"} ${m.id === selected ? "selected" : ""}">
                  <b>${esc(m.from)}</b><span>${esc(m.subject)}</span></li>`,
            )
            .join("")
        : `<li class="empty">No mail.</li>`;
      const m = mails.find((x) => x.id === selected);
      reader.innerHTML = m
        ? `<h3>${esc(m.subject)}</h3><p class="from">From: ${esc(m.from)}</p><p>${escLines(m.body)}</p>`
        : "";
    };

    const open = (id: string) => {
      selected = id;
      game.dispatch(readMail(id));
    };
    list.onclick = (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>("[data-id]")
        ?.dataset["id"];
      if (id) open(id);
    };

    render();
    const off = game.subscribe(render);
    // Open on the newest unread mail, else the newest.
    const mails = inbox.get(game.state());
    const first = mails.find((m) => !m.read) ?? mails[0];
    if (first) open(first.id);
    return off;
  },
} satisfies DesktopApp;
