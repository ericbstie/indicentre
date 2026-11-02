import { DAILY_QUOTA } from "../core/boss.ts";
import type { Mail } from "../core/state.ts";

type NewMail = Omit<Mail, "read">;

export const welcomeMail: NewMail = {
  id: "welcome",
  from: "The Boss",
  subject: "Welcome to the team!!",
  body: `Welcome aboard, junior.

We are a legitimate customer care company. Legitimately.

Your desk is the one with the blue screen. Your quota is ${DAILY_QUOTA} scam bucks a day. Also "more than Tommy".
Miss it and I come over to your desk. You do not want me to come over to your desk.
Do not let the shutdown meter fill up. If it does, we all go to jail and I personally will be very disappointed in you.

Start with email. Email is cheap, email is fast, and people still click things.

- The Boss`,
};
