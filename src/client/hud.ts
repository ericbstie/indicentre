import { createHud } from "../hud/hud.ts";
import type { Game } from "./game.ts";

/** Mounts the HUD overlay and keeps it in sync with the game state. */
export const mountHud = (game: Game) => {
  const root = document.createElement("div");
  root.className = "hud";
  document.body.append(root);
  const hud = createHud(root);
  game.subscribe((s) => hud.render(s));
  hud.render(game.state());
  return hud;
};
