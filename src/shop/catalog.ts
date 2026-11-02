import type { Purchase } from "../core/economy.ts";
import { scams } from "../scams/registry.ts";
import { upgrades } from "../workplace/upgrades.ts";
import { tools } from "./tools.ts";

const toolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;

export interface CatalogItem extends Purchase {
  readonly name: string;
  readonly blurb: string;
}

/** Everything the Shop sells: paid scams, tools, then workplace upgrades. */
export const catalog: ReadonlyArray<CatalogItem> = [
  ...scams
    .filter((s) => s.price > 0)
    .map((s): CatalogItem => ({
      kind: "scam",
      id: s.id,
      price: s.price,
      name: s.name,
      blurb: `New scam. +${s.payout} bucks · heat +${s.heat.fail} if reported.${
        s.requires ? ` Needs ${toolName(s.requires)}.` : ""
      }`,
      ...(s.requires !== undefined && { requires: s.requires }),
    })),
  ...tools.map((t): CatalogItem => ({
    kind: "tool",
    id: t.id,
    price: t.price,
    name: t.name,
    blurb: t.blurb,
  })),
  ...upgrades.map((u): CatalogItem => ({
    kind: "upgrade",
    id: u.id,
    price: u.price,
    name: u.name,
    blurb: u.blurb,
    ...(u.tier !== undefined && { tier: u.tier }),
  })),
];

/** The Shop's lesson box for an owned item, if it teaches one. */
export const lessonFor = (id: string) =>
  [...tools, ...upgrades].find((t) => t.id === id)?.lesson;
