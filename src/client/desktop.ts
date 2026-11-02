import * as THREE from "three";
import { apps } from "../apps/index.ts";
import { createDesktop } from "../desktop/desktop.ts";
import type { Game } from "./game.ts";
import type { World } from "./scene.ts";

/** Mounts the PC desktop overlay and wires sitting down / standing up. */
export const mountDesktop = (game: Game, world: World) => {
  const root = document.createElement("div");
  document.body.append(root);
  const desktop = createDesktop(root, game, apps);
  const { camera, office, player, interactions, renderer } = world;

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

  return { desktop, sitDown, standUp };
};
