import { lunchMailId, lunchMailsDue, LUNCH_FROM } from "../content/lunch.ts";
import { receiveMail } from "../content/mail.ts";
import type { GameSystem } from "./system.ts";

/** Angel's lunch mails land on their day; receiveMail keeps each to one copy. */
export default {
  id: "lunch",
  start({ game }) {
    const deliver = () => {
      const s = game.state();
      for (const m of lunchMailsDue(s.day))
        game.dispatch(
          receiveMail({
            id: lunchMailId(m),
            from: LUNCH_FROM,
            subject: m.subject,
            body: m.body(s),
          }),
        );
    };
    deliver();
    game.on("DayAdvanced", deliver);
  },
} satisfies GameSystem;
