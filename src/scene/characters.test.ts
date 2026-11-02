import { afterAll, expect, test } from "bun:test";
import * as THREE from "three";
import { animate, loadCharacter, tickCharacters, tint } from "./characters.ts";

// Serve /assets/models/<id>.glb from disk, as the server does.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = String(input instanceof Request ? input.url : input);
  const id = /\/assets\/models\/([\w-]+)\.glb$/.exec(url)?.[1];
  return id
    ? new Response(Bun.file(`assets/models/${id}.glb`))
    : new Response("Not found", { status: 404 });
}) as typeof fetch;
afterAll(() => {
  globalThis.fetch = realFetch;
});

const colorOf = (o: THREE.Object3D, name: string) => {
  let hex: number | undefined;
  o.traverse((m) => {
    if (!(m instanceof THREE.Mesh)) return;
    for (const mat of [m.material].flat() as THREE.MeshStandardMaterial[]) {
      if (mat.name === name) hex = mat.color.getHex();
    }
  });
  return hex;
};

test("loads the packed clips", async () => {
  const c = await loadCharacter("casual2-male");
  expect([...c.clips.keys()].sort()).toEqual([
    "Idle",
    "SitDown",
    "StandUp",
    "Walk",
  ]);
});

test("instances get their own materials, so tint is per NPC", async () => {
  const a = await loadCharacter("casual2-male");
  const b = await loadCharacter("casual2-male");
  tint(a.object, "Shirt", 0xff0000);
  expect(colorOf(a.object, "Shirt")).toBe(0xff0000);
  expect(colorOf(b.object, "Shirt")).not.toBe(0xff0000);
});

test("plays Walk while its root moves and Idle when it stops", async () => {
  const c = await loadCharacter("casual2-male");
  const root = new THREE.Group().add(c.object);
  const anim = animate(c, root);
  expect(anim.playing).toBe("Idle");
  root.position.x += 0.05; // 3 m/s at 60 fps
  tickCharacters(1 / 60);
  expect(anim.playing).toBe("Walk");
  tickCharacters(1 / 60);
  expect(anim.playing).toBe("Idle");
  anim.play("SitDown");
  root.position.x += 0.05;
  tickCharacters(1 / 60);
  expect(anim.playing).toBe("SitDown");
  anim.auto();
  tickCharacters(1 / 60);
  expect(anim.playing).toBe("Idle");
  anim.stop();
});
