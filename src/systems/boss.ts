import * as THREE from "three";
import { buildBoss, createWalker } from "../boss/model.ts";
import { slap } from "../boss/slap.ts";
import { createSpeech } from "../boss/speech.ts";
import { type BossReaction, bossLines } from "../content/boss.ts";
import {
  BIG_WIN,
  FAIL_STREAK,
  moodPool,
  WATCH_BELOW,
  type QuotaResult,
  quotaMood,
  quotaResult,
  scamMood,
} from "../core/boss.ts";
import type { EventOf } from "../core/events.ts";
import type { GameSystem } from "./system.ts";

/** His spot by the front-right wall, overseeing the floor. */
const HOME = new THREE.Vector3(5.6, 0, 3.8);
/** The front aisle, so he doesn't cut through the middle of the floor. */
const AISLE = new THREE.Vector3(4.6, 0, 1.8);
/** Just behind and right of the player's chair. */
const BEHIND_DESK = new THREE.Vector3(-3.3, 0, 1.8);

const QUOTA_REACTION: Readonly<Record<QuotaResult, BossReaction>> = {
  missed: "quotaMissed",
  met: "quotaMet",
  smashed: "quotaSmashed",
};

/** The floor manager: tracks the shift's takings, moves his mood, walks over at day end. */
export default {
  id: "boss",
  start({ game, world }) {
    const { office, interactions } = world;
    const body = buildBoss();
    body.position.copy(HOME);
    office.scene.add(body);
    const walker = createWalker(body);
    walker.face(office.seat.position);
    interactions.add({
      object: body,
      label: "Boss",
      use: () => walker.face(world.camera.position),
    });

    const speech = createSpeech();
    const said = new Map<BossReaction, number>();
    /** Says the next line for `reaction` from the pool his mood picks. */
    const react = (reaction: BossReaction) => {
      const pool = bossLines[reaction][moodPool(game.state().bossMood)];
      const n = said.get(reaction) ?? 0;
      said.set(reaction, n + 1);
      return speech.say(pool[n % pool.length] ?? "");
    };

    /** Walk to stand behind the player's chair, run `scene`, walk back. */
    let busy = false;
    const visitDesk = async (scene: () => Promise<void>) => {
      if (busy) return;
      busy = true;
      await walker.walkTo(AISLE);
      await walker.walkTo(BEHIND_DESK);
      walker.face(office.seat.lookAt);
      await scene();
      await walker.walkTo(AISLE);
      await walker.walkTo(HOME);
      walker.face(office.seat.position);
      busy = false;
    };

    const nextScam = () =>
      new Promise<EventOf<"ScamResolved">>((resolve) => {
        const off = game.on("ScamResolved", (e) => {
          off();
          resolve(e);
        });
      });
    /** "Show me your technique": he waits behind you for one scam and grades it. */
    const watchNextScam = async () => {
      await react("watchStart");
      const e = await nextScam();
      await react(e.success ? "watchSuccess" : "watchFail");
    };
    // Unlocked by the first missed quota. From then on he watches after any
    // missed quota, and on days that end with his mood low.
    let techniqueUnlocked = false;

    let earnedToday = 0;
    let failStreak = 0;
    const offScam = game.on("ScamResolved", (e) => {
      earnedToday += e.bucks;
      failStreak = e.success ? 0 : failStreak + 1;
      game.dispatch({
        type: "bossMood",
        amount: scamMood(e.success, e.bucks, failStreak),
      });
      if (busy) return;
      if (failStreak === FAIL_STREAK) void react("failStreak");
      else if (e.bucks >= BIG_WIN) void react("bigWin");
    });
    const offDay = game.on("DayAdvanced", () => {
      const result = quotaResult(earnedToday);
      earnedToday = 0;
      game.dispatch({ type: "bossMood", amount: quotaMood[result] });
      void visitDesk(async () => {
        const line = react(QUOTA_REACTION[result]);
        if (result === "missed") await slap();
        await line;
        techniqueUnlocked ||= result === "missed";
        const unhappy =
          result === "missed" || game.state().bossMood < WATCH_BELOW;
        if (techniqueUnlocked && unhappy) await watchNextScam();
      });
    });
    const offFrame = world.onFrame((dt) => walker.update(dt));
    return () => {
      offFrame();
      offScam();
      offDay();
    };
  },
} satisfies GameSystem;
