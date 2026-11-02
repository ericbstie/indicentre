import { Effect } from "effect";
import * as THREE from "three";
import { welcomeMail } from "../content/mail.ts";
import { initialState } from "../core/state.ts";
import { makeGameStore } from "../core/store.ts";
import { apps } from "../desktop/apps/index.ts";
import { createDesktop } from "../desktop/desktop.ts";
import { createHud } from "../hud/hud.ts";
import { createInteractions } from "../scene/interact.ts";
import { buildOffice } from "../scene/office.ts";
import { createPlayer } from "../scene/player.ts";
import { gameFromStore } from "./game.ts";

/** Real seconds per in-game minute. */
const SECONDS_PER_GAME_MINUTE = 1;

const game = gameFromStore(Effect.runSync(makeGameStore(initialState())));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.append(renderer.domElement);

const hudRoot = document.createElement("div");
hudRoot.className = "hud";
document.body.append(hudRoot);
const hud = createHud(hudRoot);

const desktopRoot = document.createElement("div");
document.body.append(desktopRoot);
const desktop = createDesktop(desktopRoot, game, apps);

const office = buildOffice();
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 50);
camera.position.copy(office.spawn);
const player = createPlayer(camera, renderer.domElement);
const interactions = createInteractions(camera);
renderer.domElement.addEventListener("click", () => {
  if (!desktop.isOpen) player.controls.lock();
});

// Sitting down at the PC: park the camera at the seat and show the desktop.
const standPose = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
};
const sitDown = () => {
  standPose.position.copy(camera.position);
  standPose.quaternion.copy(camera.quaternion);
  player.controls.unlock();
  camera.position.copy(office.seat.position);
  camera.lookAt(office.seat.lookAt);
  desktop.open();
};
const standUp = () => {
  desktop.close();
  camera.position.copy(standPose.position);
  camera.quaternion.copy(standPose.quaternion);
};
interactions.add({ object: office.pcScreen, label: "Use PC", use: sitDown });
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && desktop.isOpen) standUp();
});

const resize = () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resize);
resize();

game.subscribe((s) => hud.render(s));
game.dispatch({ type: "mail", mail: welcomeMail });
hud.render(game.state());

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
    game.dispatch({ type: "tick", minutes: 1 });
  }
  renderer.render(office.scene, camera);
});

// Test hook for automated playtests (Playwright): open the page with ?debug.
if (new URLSearchParams(location.search).has("debug")) {
  Object.assign(window, { indicentre: { game, desktop, sitDown, standUp } });
}
