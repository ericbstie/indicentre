import { expect, test } from "bun:test";
import { apps } from "./index.ts";

test("app ids are unique and match their file names", async () => {
  const ids = apps.map((a) => a.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids)
    expect(await Bun.file(`src/apps/${id}.ts`).exists()).toBe(true);
});
