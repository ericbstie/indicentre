// Composition root. Only wiring lives here; features are systems
// (src/systems), desktop apps (src/desktop/apps) or scams (src/scams).
import { systems } from "../systems/index.ts";
import { bootGame, exposeDebug } from "./boot.ts";
import { mountDesktop } from "./desktop.ts";
import { mountHud } from "./hud.ts";
import { createWorld } from "./scene.ts";

const game = bootGame();
const world = createWorld();
const hud = mountHud(game);
const { desktop, sitDown, standUp } = mountDesktop(game, world);

world.onFrame(() =>
  hud.prompt(world.interactions.update(world.player.controls.isLocked)),
);
for (const system of systems) system.start({ game, world });
world.start();

exposeDebug({ game, desktop, sitDown, standUp, world });
