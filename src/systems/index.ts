import { clockSystem } from "./clock.ts";
import type { GameSystem } from "./system.ts";
import { welcomeSystem } from "./welcome.ts";

/** Started in this order after the world and UI are up. */
export const systems: ReadonlyArray<GameSystem> = [clockSystem, welcomeSystem];
