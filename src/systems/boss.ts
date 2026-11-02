import { quotaMood, quotaResult, scamMood } from "../core/boss.ts";
import type { GameSystem } from "./system.ts";

/** The floor manager: tracks the shift's takings and moves his mood. */
export default {
  id: "boss",
  start({ game }) {
    let earnedToday = 0;
    let failStreak = 0;
    const offScam = game.on("ScamResolved", (e) => {
      earnedToday += e.bucks;
      failStreak = e.success ? 0 : failStreak + 1;
      game.dispatch({
        type: "bossMood",
        amount: scamMood(e.success, e.bucks, failStreak),
      });
    });
    const offDay = game.on("DayAdvanced", () => {
      const result = quotaResult(earnedToday);
      earnedToday = 0;
      game.dispatch({ type: "bossMood", amount: quotaMood[result] });
    });
    return () => {
      offScam();
      offDay();
    };
  },
} satisfies GameSystem;
