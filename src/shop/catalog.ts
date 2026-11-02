import type { Purchase } from "../core/economy.ts";
import { scams } from "../scams/registry.ts";
import { tools } from "./tools.ts";

export interface CatalogItem extends Purchase {
  readonly name: string;
  readonly blurb: string;
}

/** Everything the Shop sells: paid scams first, then tools. */
export const catalog: ReadonlyArray<CatalogItem> = [
  ...scams
    .filter((s) => s.price > 0)
    .map((s): CatalogItem => ({
      kind: "scam",
      id: s.id,
      price: s.price,
      name: s.name,
      blurb: `New scam. +${s.payout} bucks · heat +${s.heat.fail} if reported.`,
    })),
  ...tools.map((t): CatalogItem => ({
    kind: "tool",
    id: t.id,
    price: t.price,
    name: t.name,
    blurb: t.blurb,
  })),
];
