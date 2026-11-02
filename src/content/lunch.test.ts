import { expect, test } from "bun:test";
import { initialState, reduce } from "../core/state.ts";
import { clues } from "./catfisher.ts";
import { inbox, receiveMail } from "./mail.ts";
import { LUNCH_FROM, lunchMails, lunchMailsDue } from "./lunch.ts";

test("lunch mails land on their days, before the day 6 reveal", () => {
  expect(lunchMailsDue(1)).toEqual([]);
  expect(lunchMailsDue(2).map((m) => m.id)).toEqual(["plan"]);
  expect(lunchMailsDue(4).map((m) => m.id)).toEqual(["plan", "table", "gran"]);
  for (const m of lunchMails) expect(m.day).toBeLessThan(6);
});

test("Angel sends at most one mail a day", () => {
  const clueDays = clues
    .filter((c) => c.via.kind === "mail" && c.via.from === LUNCH_FROM)
    .map((c) => c.day);
  const days = [...clueDays, ...lunchMails.map((m) => m.day)];
  expect(new Set(days).size).toBe(days.length);
});

test("the table mail reacts to how yesterday went", () => {
  const table = lunchMails.find((m) => m.id === "table")!;
  const after = (met: boolean) =>
    table.body({
      ...initialState(),
      days: [
        {
          day: 2,
          earned: met ? 99 : 0,
          heatStart: 0,
          heatEnd: 0,
          quota: 62,
          met,
          warned: !met,
        },
      ],
    });
  expect(after(true)).toContain("happy");
  expect(after(false)).toContain("tired");
});

test("a lunch mail is delivered once", () => {
  const m = lunchMails[0]!;
  const mail = {
    id: "lunch-plan",
    from: LUNCH_FROM,
    subject: m.subject,
    body: "",
  };
  const once = reduce(initialState(), receiveMail(mail));
  const twice = reduce(once, receiveMail(mail));
  expect(inbox.get(twice)).toHaveLength(1);
});
