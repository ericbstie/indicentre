import * as THREE from "three";
import { slap } from "../boss/slap.ts";
import { createWalker } from "../boss/walker.ts";
import { type BossReaction, bossLines } from "../content/boss.ts";
import {
  BIG_WIN,
  BossWatching,
  bossMood,
  changeMood,
  FAIL_STREAK,
  moodPool,
  WATCH_BELOW,
  quotaMood,
  quotaResult,
  scamMood,
  WatchRequested,
} from "../core/boss.ts";
import type { EventOf } from "../core/events.ts";
import { queueDialog } from "../dialog/dialog.ts";
import { createNpc } from "../scene/npc.ts";
import type { GameSystem } from "./system.ts";

/** The only one in a suit, so you can tell him from the coworkers. */
const LOOK = {
  shirt: 0xe8e4d8,
  skin: 0xb07850,
  hair: 0x2a2a2a,
  outfit: "suit-male",
} as const;

/** His spot by the front-right wall, overseeing the floor. */
const HOME = new THREE.Vector3(5.6, 0, 3.8);
/** The front aisle, so he doesn't cut through the middle of the floor. */
const AISLE = new THREE.Vector3(4.6, 0, 1.8);
/** Just behind and right of the player's chair. */
const BEHIND_DESK = new THREE.Vector3(-3.3, 0, 1.8);

/** Heat at which he warns you, once a day, that the floor could be raided. */
const HEAT_WARNING = 60;

/** Longest a line holds up a scene if the player never dismisses it. */
const LINE_MS = 6000;

/** The floor manager: moves his mood on scams and DayEnded, reacts to big
 * moments, and walks over to watch you after a bad day. */
export default {
  id: "boss",
  start({ game, world }) {
    const { office, interactions } = world;
    const body = createNpc(LOOK, HOME).group;
    body.position.copy(HOME);
    office.scene.add(body);
    const walker = createWalker(body);
    walker.face(office.seat.position);
    interactions.add({
      object: body,
      label: "Boss",
      use: () => walker.face(world.camera.position),
    });

    /** Queues his line behind any open dialog or card; resolves when
     * dismissed or LINE_MS after it shows. */
    const say = (line: string) =>
      new Promise<void>((resolve) => {
        void queueDialog({ speaker: "Boss", line }, resolve).then(() =>
          setTimeout(resolve, LINE_MS),
        );
      });
    const said = new Map<BossReaction, number>();
    /** Says the next line for `reaction` from the pool his mood picks. */
    const react = (reaction: BossReaction) => {
      const pool = bossLines[reaction][moodPool(bossMood.get(game.state()))];
      const n = said.get(reaction) ?? 0;
      said.set(reaction, n + 1);
      return say(pool[n % pool.length] ?? "");
    };

    const nextScam = () =>
      new Promise<EventOf<"ScamResolved">>((resolve) => {
        const off = game.on("ScamResolved", (e) => {
          off();
          resolve(e);
        });
      });

    /** "Show me your technique": his line waits behind the day report, then
     * he stands behind your chair for one scam, grades it and walks back. */
    let busy = false;
    let watchWanted = false;
    const watchNextScam = async (): Promise<void> => {
      if (busy) {
        watchWanted = true;
        return;
      }
      busy = true;
      const scam = nextScam();
      void react("watchStart");
      await walker.walkTo(AISLE);
      await walker.walkTo(BEHIND_DESK);
      walker.face(office.seat.lookAt);
      game.emit(BossWatching, {});
      const e = await scam;
      await react(e.success ? "watchSuccess" : "watchFail");
      await walker.walkTo(AISLE);
      await walker.walkTo(HOME);
      walker.face(office.seat.position);
      busy = false;
      if (watchWanted) {
        watchWanted = false;
        await watchNextScam();
      }
    };
    // Unlocked by the first missed quota. From then on he watches after any
    // missed quota, and on days that end with his mood low.
    let techniqueUnlocked = false;

    let failStreak = 0;
    let warnedOn = 0;
    const offScam = game.on("ScamResolved", (e) => {
      failStreak = e.success ? 0 : failStreak + 1;
      game.dispatch(changeMood(scamMood(e.success, e.bucks, failStreak)));
      const s = game.state();
      const crossed =
        s.shutdownMeter >= HEAT_WARNING &&
        s.shutdownMeter - e.heat < HEAT_WARNING;
      if (crossed && warnedOn !== s.day && s.status === "playing") {
        warnedOn = s.day;
        void react("heatWarning");
      }
      if (busy) return;
      if (failStreak === FAIL_STREAK) void react("failStreak");
      else if (e.bucks >= BIG_WIN) void react("bigWin");
    });
    const offDay = game.on("DayEnded", ({ summary }) => {
      const result = quotaResult(summary);
      game.dispatch(changeMood(quotaMood[result]));
      // Fired or won: the run-end card has the last word.
      if (game.state().status !== "playing") return;
      // His verdict is on the day report; the slap lands with it.
      if (result === "missed") void slap();
      techniqueUnlocked ||= result === "missed";
      const unhappy =
        result === "missed" || bossMood.get(game.state()) < WATCH_BELOW;
      if (techniqueUnlocked && unhappy) void watchNextScam();
    });
    const offDesk = game.on("DeskUpgraded", () => {
      if (!busy) void react("newDesk");
    });
    const offWatch = game.on(WatchRequested, () => void watchNextScam());
    const offFrame = world.onFrame((dt) => walker.update(dt));
    return () => {
      offFrame();
      offScam();
      offDay();
      offDesk();
      offWatch();
    };
  },
} satisfies GameSystem;
