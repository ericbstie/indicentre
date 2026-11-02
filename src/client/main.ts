// Composition root. Only wiring lives here; features are systems
// (src/systems), desktop apps (src/apps) or scams (src/scams).
import { Effect } from "effect";
import { loadRun } from "../core/save.ts";
import { initialState } from "../core/state.ts";
import { makeGameStore } from "../core/store.ts";
import { createHud } from "../hud/hud.ts";
import { systems } from "../systems/index.ts";
import { mountDesktop } from "./desktop.ts";
import { gameFromStore } from "./game.ts";
import { createWorld } from "./scene.ts";

// Resumes the saved run (core/save.ts) or starts fresh; the story hands
// out the first scam.
const game = gameFromStore(
  Effect.runSync(makeGameStore(loadRun(localStorage) ?? initialState())),
);
const world = createWorld();

const hudRoot = document.createElement("div");
hudRoot.className = "hud";
document.body.append(hudRoot);
const hud = createHud(hudRoot);
game.subscribe((s) => hud.render(s));
hud.render(game.state());

const { desktop, sitDown, standUp } = mountDesktop(game, world);

world.onFrame(() => {
  const looking = world.player.controls.isLocked;
  hud.aim(looking, world.interactions.update(looking));
});
for (const system of systems) system.start({ game, world });
world.start();

// Test hook for automated playtests and the smoke test: open with ?debug.
if (new URLSearchParams(location.search).has("debug"))
  Object.assign(window, {
    indicentre: { game, desktop, sitDown, standUp, world },
  });
