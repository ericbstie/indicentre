import { Effect } from "effect";
import * as THREE from "three";
import { initialState } from "../core/state.ts";
import { makeGameStore } from "../core/store.ts";
import { createHud } from "../hud/hud.ts";
import { createInteractions } from "../scene/interact.ts";
import { buildOffice } from "../scene/office.ts";
import { createPlayer } from "../scene/player.ts";

/** Real seconds per in-game minute. */
const SECONDS_PER_GAME_MINUTE = 1;

const store = Effect.runSync(makeGameStore(initialState()));
const dispatch = (a: Parameters<typeof store.dispatch>[0]) =>
  Effect.runSync(store.dispatch(a));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.append(renderer.domElement);

const hudRoot = document.createElement("div");
hudRoot.className = "hud";
document.body.append(hudRoot);
const hud = createHud(hudRoot);

const office = buildOffice();
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 50);
camera.position.copy(office.spawn);
const player = createPlayer(camera, renderer.domElement);
const interactions = createInteractions(camera);
renderer.domElement.addEventListener("click", () => player.controls.lock());

const resize = () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resize);
resize();

store.subscribe((s) => hud.render(s));
hud.render(Effect.runSync(store.get));

const timer = new THREE.Timer();
let gameClock = 0;
renderer.setAnimationLoop((t) => {
  timer.update(t);
  const dt = Math.min(timer.getDelta(), 0.1);
  player.update(dt);
  hud.prompt(interactions.update(player.controls.isLocked));
  gameClock += dt;
  if (gameClock >= SECONDS_PER_GAME_MINUTE) {
    gameClock -= SECONDS_PER_GAME_MINUTE;
    dispatch({ type: "tick", minutes: 1 });
  }
  renderer.render(office.scene, camera);
});
