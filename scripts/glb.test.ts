import { expect, test } from "bun:test";
import { gltfToGlb } from "./glb.ts";

// One 4-byte view per accessor: 0 = mesh, 1-2 = clip A, 3-4 = clip B.
const bin = Buffer.from(Array.from({ length: 20 }, (_, i) => i));
const view = (i: number) => ({ buffer: 0, byteOffset: i * 4, byteLength: 4 });
const gltf = JSON.stringify({
  asset: { version: "2.0" },
  buffers: [
    {
      uri: `data:application/octet-stream;base64,${bin.toString("base64")}`,
      byteLength: 20,
    },
  ],
  bufferViews: [0, 1, 2, 3, 4].map(view),
  accessors: [0, 1, 2, 3, 4].map((bufferView) => ({ bufferView })),
  meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
  animations: [
    { name: "A", samplers: [{ input: 1, output: 2 }] },
    { name: "B", samplers: [{ input: 3, output: 4 }] },
  ],
});

const parse = (glb: Uint8Array) => {
  const dv = new DataView(glb.buffer, glb.byteOffset);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(
    new TextDecoder().decode(glb.subarray(20, 20 + jsonLen)),
  );
  const binStart = 20 + jsonLen + 8;
  return { magic: dv.getUint32(0, true), json, bin: glb.subarray(binStart) };
};

test("keeps only the named clips and the bytes they use", () => {
  const { magic, json, bin: out } = parse(gltfToGlb(gltf, ["B"]));
  expect(magic).toBe(0x46546c67);
  expect(json.animations).toEqual([
    { name: "B", samplers: [{ input: 1, output: 2 }] },
  ]);
  expect(json.accessors).toHaveLength(3);
  expect([...out]).toEqual([0, 1, 2, 3, 12, 13, 14, 15, 16, 17, 18, 19]);
  expect(json.buffers).toEqual([{ byteLength: 12 }]);
});

test("is deterministic", () => {
  expect(gltfToGlb(gltf, ["A"])).toEqual(gltfToGlb(gltf, ["A"]));
});

test("rejects a missing clip", () => {
  expect(() => gltfToGlb(gltf, ["Dance"])).toThrow("no clips: Dance");
});
