import { apps } from "../apps/index.ts";
import { createDesktop } from "../desktop/desktop.ts";
import { defineEvent } from "../core/events.ts";
import type { Game } from "./game.ts";
import type { World } from "./scene.ts";

/** The player sat down at their PC. */
export const PcOpened = defineEvent<Record<never, never>>("PcOpened");

/** Mounts the PC desktop overlay and wires sitting down / standing up. */
export const mountDesktop = (game: Game, world: World) => {
  const root = document.createElement("div");
  document.body.append(root);
  const desktop = createDesktop(root, game, apps);
  const { office, player, interactions, renderer } = world;

  renderer.domElement.addEventListener("click", () => {
    if (!desktop.isOpen) player.controls.lock();
  });

  // Sitting down at the PC: glide to the seat and show the desktop.
  let stand = () => {};
  const sitDown = () => {
    player.controls.unlock();
    stand = world.sitAtDesk();
    desktop.open();
    game.emit(PcOpened, {});
  };
  const standUp = () => {
    desktop.close();
    stand();
  };
  interactions.add({ object: office.pcScreen, label: "Use PC", use: sitDown });
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && desktop.isOpen) standUp();
  });

  return { desktop, sitDown, standUp };
};
