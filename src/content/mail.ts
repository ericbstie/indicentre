import { quotaFor } from "../core/economy.ts";
import { defineSlice } from "../core/slice.ts";
import type { GameState } from "../core/state.ts";

export interface Mail {
  readonly id: string;
  readonly from: string;
  readonly subject: string;
  readonly body: string;
  readonly read: boolean;
}
type NewMail = Omit<Mail, "read">;

type InboxAction =
  | { readonly type: "inbox/receive"; readonly mail: NewMail }
  | { readonly type: "inbox/read"; readonly id: string };

/** The player's inbox, newest first. */
export const inbox = defineSlice(
  "inbox",
  [] as ReadonlyArray<Mail>,
  (mails, a: InboxAction) => {
    switch (a.type) {
      case "inbox/receive":
        return mails.some((m) => m.id === a.mail.id)
          ? mails
          : [{ ...a.mail, read: false }, ...mails];
      case "inbox/read":
        return mails.map((m) => (m.id === a.id ? { ...m, read: true } : m));
    }
  },
);
/** Delivers a mail once per id. */
export const receiveMail = (mail: NewMail) =>
  ({ type: "inbox/receive", mail }) as const;
export const readMail = (id: string) => ({ type: "inbox/read", id }) as const;
export const unreadCount = (s: GameState) =>
  inbox.get(s).filter((m) => !m.read).length;

export const welcomeMail: NewMail = {
  id: "welcome",
  from: "The Boss",
  subject: "Welcome to the team!!",
  body: `Welcome aboard, junior.

We are a legitimate customer care company. Legitimately.

Your desk is the one with the blue screen. Your quota today is ${quotaFor(1)} bucks. It goes up every day. Also "more than Tommy".
Miss it and I come over to your desk. You do not want me to come over to your desk.
Do not let the heat meter fill up. If it does, we all go to jail and I personally will be very disappointed in you.

Start with email. Email is cheap, email is fast, and people still click things.

- The Boss`,
};
