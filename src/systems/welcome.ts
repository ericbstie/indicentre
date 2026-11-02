import { receiveMail, welcomeMail } from "../content/mail.ts";
import type { GameSystem } from "./system.ts";

/** The boss's first mail on a fresh run. */
export default {
  id: "welcome",
  start({ game }) {
    game.dispatch(receiveMail(welcomeMail));
  },
} satisfies GameSystem;
