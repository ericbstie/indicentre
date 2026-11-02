// Composition root. Only wiring lives here; each piece is its own module.
import { welcomeMail } from "../content/mail.ts";
import { bootGame, exposeDebug } from "./boot.ts";
import { mountDesktop } from "./desktop.ts";
import { mountHud } from "./hud.ts";
import { createWorld } from "./scene.ts";

/** Real seconds per in-game minute. */
const SECONDS_PER_GAME_MINUTE = 1;

const game = bootGame();
const world = createWorld();
const hud = mountHud(game);
const { desktop, sitDown, standUp } = mountDesktop(game, world);

game.dispatch({ type: "mail", mail: welcomeMail });

let gameClock = 0;
world.start((dt) => {
  hud.prompt(world.interactions.update(world.player.controls.isLocked));
  gameClock += dt;
  if (gameClock >= SECONDS_PER_GAME_MINUTE) {
    gameClock -= SECONDS_PER_GAME_MINUTE;
    game.dispatch({ type: "tick", minutes: 1 });
  }
});

exposeDebug({ game, desktop, sitDown, standUp });
