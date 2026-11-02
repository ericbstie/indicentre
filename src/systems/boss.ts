import * as THREE from "three";
import { slap } from "../boss/slap.ts";
import { createWalker } from "../boss/walker.ts";
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
import { openDialog } from "../dialog/dialog.ts";
import { modalOpen } from "../hud/modal.ts";
import { createNpc } from "../scene/npc.ts";
import type { GameSystem } from "./system.ts";

const LOOK = { shirt: 0xe8e4d8, skin: 0xb07850, hair: 0x2a2a2a };

const mesh = (geo: THREE.BufferGeometry, color: number) =>
  new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
/** Red tie and a clipboard, so you can tell him from the coworkers. */
const tie = () => {
  const m = mesh(new THREE.BoxGeometry(0.07, 0.38, 0.02), 0xb02020);
  m.position.set(0, 1.2, 0.21);
  return m;
};
const clipboard = () => {
  const m = mesh(new THREE.BoxGeometry(0.24, 0.32, 0.02), 0x8a6a48);
  m.position.set(0.32, 1.05, 0.2);
  m.rotation.x = -0.5;
  return m;
};

/** His spot by the front-right wall, overseeing the floor. */
const HOME = new THREE.Vector3(5.6, 0, 3.8);
/** The front aisle, so he doesn't cut through the middle of the floor. */
const AISLE = new THREE.Vector3(4.6, 0, 1.8);
/** Just behind and right of the player's chair. */
const BEHIND_DESK = new THREE.Vector3(-3.3, 0, 1.8);

/** Longest a line holds up a scene if the player never dismisses it. */
const LINE_MS = 6000;

const QUOTA_REACTION: Readonly<Record<QuotaResult, BossReaction>> = {
  missed: "quotaMissed",
  met: "quotaMet",
  smashed: "quotaSmashed",
};

/** The floor manager: moves his mood on scams and DayEnded, walks over with the verdict. */
export default {
  id: "boss",
  start({ game, world }) {
    const { office, interactions } = world;
    const body = createNpc(LOOK, HOME).group;
    body.position.copy(HOME);
    body.add(tie(), clipboard());
    office.scene.add(body);
    const walker = createWalker(body);
    walker.face(office.seat.position);
    interactions.add({
      object: body,
      label: "Boss",
      use: () => walker.face(world.camera.position),
    });

    /** Opens his line in the dialog; resolves when dismissed or after LINE_MS. */
    const say = (line: string) =>
      new Promise<void>((resolve) => {
        openDialog({ speaker: "Boss", line }, resolve);
        setTimeout(resolve, LINE_MS);
      });
    const said = new Map<BossReaction, number>();
    /** Says the next line for `reaction` from the pool his mood picks. */
    const react = (reaction: BossReaction) => {
      const pool = bossLines[reaction][moodPool(game.state().bossMood)];
      const n = said.get(reaction) ?? 0;
      said.set(reaction, n + 1);
      return say(pool[n % pool.length] ?? "");
    };

    /** Resolves on the first frame where `ok()` holds. */
    const until = (ok: () => boolean) =>
      new Promise<void>((resolve) => {
        if (ok()) return resolve();
        const off = world.onFrame(() => {
          if (!ok()) return;
          off();
          resolve();
        });
      });

    /** Walk to stand behind the player's chair, run `scene`, walk back. */
    let busy = false;
    const visitDesk = async (scene: () => Promise<void>) => {
      if (busy) return;
      busy = true;
      await walker.walkTo(AISLE);
      await walker.walkTo(BEHIND_DESK);
      walker.face(office.seat.lookAt);
      await until(() => !modalOpen()); // let the day report go first
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
      const scam = nextScam();
      void react("watchStart");
      const e = await scam;
      await react(e.success ? "watchSuccess" : "watchFail");
    };
    // Unlocked by the first missed quota. From then on he watches after any
    // missed quota, and on days that end with his mood low.
    let techniqueUnlocked = false;

    let failStreak = 0;
    const offScam = game.on("ScamResolved", (e) => {
      failStreak = e.success ? 0 : failStreak + 1;
      game.dispatch({
        type: "bossMood",
        amount: scamMood(e.success, e.bucks, failStreak),
      });
      if (busy) return;
      if (failStreak === FAIL_STREAK) void react("failStreak");
      else if (e.bucks >= BIG_WIN) void react("bigWin");
    });
    const offDay = game.on("DayEnded", ({ summary }) => {
      const result = quotaResult(summary);
      game.dispatch({ type: "bossMood", amount: quotaMood[result] });
      // Fired or won: the run-end card has the last word.
      if (game.state().status !== "playing") return;
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
