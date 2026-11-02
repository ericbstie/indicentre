import * as THREE from "three";
import { apps } from "../apps/index.ts";
import { createDesktop } from "../desktop/desktop.ts";
import { defineEvent } from "../core/events.ts";
import { createCameraEase } from "../scene/ease.ts";
import type { Game } from "./game.ts";
import type { World } from "./scene.ts";

/** The player sat down at their PC. */
export const PcOpened = defineEvent<Record<never, never>>("PcOpened");

/** Mounts the PC desktop overlay and wires sitting down / standing up. */
export const mountDesktop = (game: Game, world: World) => {
  const root = document.createElement("div");
  document.body.append(root);
  const desktop = createDesktop(root, game, apps);
  const { camera, office, player, interactions, renderer } = world;

  renderer.domElement.addEventListener("click", () => {
    if (!desktop.isOpen) player.controls.lock();
  });

  // Sitting down at the PC: glide the camera to the seat and show the desktop.
  const ease = createCameraEase(camera, world.onFrame);
  const seatQuat = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(
      office.seat.position,
      office.seat.lookAt,
      camera.up,
    ),
  );
  const standPose = {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  };
  const sitDown = () => {
    standPose.position.copy(camera.position);
    standPose.quaternion.copy(camera.quaternion);
    player.controls.unlock();
    ease(office.seat.position, seatQuat);
    desktop.open();
    game.emit(PcOpened, {});
  };
  const standUp = () => {
    desktop.close();
    ease(standPose.position, standPose.quaternion);
  };
  interactions.add({ object: office.pcScreen, label: "Use PC", use: sitDown });
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && desktop.isOpen) standUp();
  });

  return { desktop, sitDown, standUp };
};
