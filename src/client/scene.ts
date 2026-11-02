import * as THREE from "three";
import { createInteractions } from "../scene/interact.ts";
import { buildOffice } from "../scene/office.ts";
import { createPlayer } from "../scene/player.ts";

/** Renderer, camera, office, player and interactions, plus the frame loop. */
export const createWorld = () => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  document.body.append(renderer.domElement);

  const office = buildOffice();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 50);
  camera.position.copy(office.spawn);
  const player = createPlayer(camera, renderer.domElement);
  const interactions = createInteractions(camera);

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize);
  resize();

  /** Starts rendering; `onFrame` runs once per frame with a clamped dt. */
  const start = (onFrame: (dt: number) => void) => {
    const timer = new THREE.Timer();
    renderer.setAnimationLoop((t) => {
      timer.update(t);
      const dt = Math.min(timer.getDelta(), 0.1);
      player.update(dt);
      onFrame(dt);
      renderer.render(office.scene, camera);
    });
  };

  return { renderer, camera, office, player, interactions, start };
};

export type World = ReturnType<typeof createWorld>;
