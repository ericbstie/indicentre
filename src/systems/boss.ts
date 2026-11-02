import * as THREE from "three";
import { buildBoss, createWalker } from "../boss/model.ts";
import { createSpeech } from "../boss/speech.ts";
import { type BossReaction, bossLines } from "../content/boss.ts";
import {
  BIG_WIN,
  FAIL_STREAK,
  moodPool,
  type QuotaResult,
  quotaMood,
  quotaResult,
  scamMood,
} from "../core/boss.ts";
import type { GameSystem } from "./system.ts";

/** His spot by the front-right wall, overseeing the floor. */
const HOME = new THREE.Vector3(5.6, 0, 3.8);
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
    const visitDesk = async (scene: () => Promise<void>) => {
      if (walker.walking) return;
      await walker.walkTo(BEHIND_DESK);
      walker.face(office.seat.lookAt);
      await scene();
      await walker.walkTo(HOME);
      walker.face(office.seat.position);
    };

    let earnedToday = 0;
    let failStreak = 0;
    const offScam = game.on("ScamResolved", (e) => {
      earnedToday += e.bucks;
      failStreak = e.success ? 0 : failStreak + 1;
      game.dispatch({
        type: "bossMood",
        amount: scamMood(e.success, e.bucks, failStreak),
      });
      if (walker.walking) return;
      if (failStreak === FAIL_STREAK) void react("failStreak");
      else if (e.bucks >= BIG_WIN) void react("bigWin");
    });
    const offDay = game.on("DayAdvanced", () => {
      const result = quotaResult(earnedToday);
      earnedToday = 0;
      game.dispatch({ type: "bossMood", amount: quotaMood[result] });
      void visitDesk(() => react(QUOTA_REACTION[result]));
    });
    const offFrame = world.onFrame((dt) => walker.update(dt));
    return () => {
      offFrame();
      offScam();
      offDay();
    };
  },
} satisfies GameSystem;
