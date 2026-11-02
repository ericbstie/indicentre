import { expect, test } from "bun:test";
import { inbox, readMail, receiveMail, unreadCount } from "../content/mail.ts";
import { defineSlice } from "./slice.ts";
import { initialState, reduce } from "./state.ts";

const s0 = initialState();

test("a slice reads its initial value until its first action", () => {
  const counter = defineSlice(
    "test-counter",
    0,
    (n, a: { readonly type: "test-counter/add"; readonly by: number }) =>
      n + a.by,
  );
  const add = (by: number) => ({ type: "test-counter/add", by }) as const;
  expect(counter.get(s0)).toBe(0);
  const s1 = reduce(s0, add(2));
  expect(counter.get(s1)).toBe(2);
  expect(s1.scamBucks).toBe(s0.scamBucks);
});

test("an action for an unknown slice changes nothing", () => {
  expect(reduce(s0, { type: "nobody/home" })).toBe(s0);
});

test("mail arrives newest first, unread, once per id; reading marks it", () => {
  const mail = { id: "m1", from: "Boss", subject: "Hi", body: "Work." };
  const s1 = reduce(s0, receiveMail(mail));
  expect(reduce(s1, receiveMail(mail))).toBe(s1);
  expect(unreadCount(s1)).toBe(1);
  const s2 = reduce(s1, readMail("m1"));
  expect(unreadCount(s2)).toBe(0);
  expect(inbox.get(s2)).toHaveLength(1);
});
