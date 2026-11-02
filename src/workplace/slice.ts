// Workplace slice: what the player has bought for their own desk.
// Pure; core/economy.ts `buy` calls `install` for kind "upgrade" purchases.

/** 0 = the starting desk in the middle of the floor; 2 = the quiet corner. */
export type DeskTier = 0 | 1 | 2;

export interface WorkplaceState {
  readonly owned: ReadonlyArray<string>;
  /** The best desk owned. A quieter desk makes calls land more often. */
  readonly deskTier: DeskTier;
}

export const initialWorkplace: WorkplaceState = { owned: [], deskTier: 0 };

/** A workplace upgrade as the purchase reducer sees it. */
export interface Install {
  readonly id: string;
  /** Desk upgrades set the desk tier; cosmetics leave it alone. */
  readonly tier?: DeskTier;
}

/** A desk at or below the current tier counts as owned: no downgrades. */
export const hasUpgrade = (w: WorkplaceState, u: Install) =>
  u.tier !== undefined ? w.deskTier >= u.tier : w.owned.includes(u.id);

export const install = (w: WorkplaceState, u: Install): WorkplaceState => ({
  owned: [...w.owned, u.id],
  deskTier: u.tier !== undefined && u.tier > w.deskTier ? u.tier : w.deskTier,
});
