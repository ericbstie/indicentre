// Packs a .gltf with embedded (data: URI) buffers into a .glb, keeping only
// the named animation clips and dropping the bytes nothing references.
// Pure and deterministic: the same input always gives the same bytes, so the
// result can be pinned by sha256 in assets/manifest.json.

interface BufferView {
  buffer: number;
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
  target?: number;
}
interface Accessor {
  bufferView?: number;
  sparse?: unknown;
}
interface Primitive {
  attributes: Record<string, number>;
  indices?: number;
  targets?: Array<Record<string, number>>;
}
interface Gltf {
  buffers: Array<{ uri?: string; byteLength: number }>;
  bufferViews: BufferView[];
  accessors: Accessor[];
  meshes?: Array<{ primitives: Primitive[] }>;
  skins?: Array<{ inverseBindMatrices?: number }>;
  animations?: Array<{
    name?: string;
    samplers: Array<{ input: number; output: number }>;
  }>;
  images?: Array<{ bufferView?: number }>;
}

const DATA_URI = /^data:[^;]*;base64,/;
const pad4 = (n: number) => (n + 3) & ~3;

export const gltfToGlb = (
  source: string,
  clips: ReadonlyArray<string>,
): Uint8Array => {
  const g = JSON.parse(source) as Gltf;
  const buffers = g.buffers.map((b) => {
    if (!b.uri || !DATA_URI.test(b.uri)) {
      throw new Error("only embedded data: URI buffers are supported");
    }
    return Buffer.from(b.uri.replace(DATA_URI, ""), "base64");
  });
  if (g.accessors.some((a) => a.sparse)) {
    throw new Error("sparse accessors are not supported");
  }

  const missing = clips.filter((c) => !g.animations?.some((a) => a.name === c));
  if (missing.length > 0) throw new Error(`no clips: ${missing.join(", ")}`);
  g.animations = (g.animations ?? []).filter((a) =>
    clips.includes(a.name ?? ""),
  );

  // Accessors still referenced, then renumber them densely.
  const used = new Set<number>();
  for (const m of g.meshes ?? []) {
    for (const p of m.primitives) {
      Object.values(p.attributes).forEach((i) => used.add(i));
      if (p.indices !== undefined) used.add(p.indices);
      p.targets?.forEach((t) => Object.values(t).forEach((i) => used.add(i)));
    }
  }
  for (const s of g.skins ?? []) {
    if (s.inverseBindMatrices !== undefined) used.add(s.inverseBindMatrices);
  }
  for (const a of g.animations ?? []) {
    a.samplers.forEach((s) => used.add(s.input).add(s.output));
  }
  const accessorIds = [...used].sort((a, b) => a - b);
  const accessorMap = new Map(accessorIds.map((old, i) => [old, i]));
  const acc = (i: number) => {
    const n = accessorMap.get(i);
    if (n === undefined) throw new Error(`accessor ${i} dropped`);
    return n;
  };
  for (const m of g.meshes ?? []) {
    for (const p of m.primitives) {
      for (const k of Object.keys(p.attributes)) {
        p.attributes[k] = acc(p.attributes[k] ?? -1);
      }
      if (p.indices !== undefined) p.indices = acc(p.indices);
      for (const t of p.targets ?? []) {
        for (const k of Object.keys(t)) t[k] = acc(t[k] ?? -1);
      }
    }
  }
  for (const s of g.skins ?? []) {
    if (s.inverseBindMatrices !== undefined) {
      s.inverseBindMatrices = acc(s.inverseBindMatrices);
    }
  }
  for (const a of g.animations ?? []) {
    for (const s of a.samplers) {
      s.input = acc(s.input);
      s.output = acc(s.output);
    }
  }
  g.accessors = accessorIds.map((i) => g.accessors[i] ?? {});

  // Buffer views still referenced, copied into one 4-byte-aligned BIN chunk.
  const viewIds = [
    ...new Set([
      ...g.accessors.flatMap((a) => a.bufferView ?? []),
      ...(g.images ?? []).flatMap((im) => im.bufferView ?? []),
    ]),
  ].sort((a, b) => a - b);
  const viewMap = new Map(viewIds.map((old, i) => [old, i]));
  const parts: Uint8Array[] = [];
  let offset = 0;
  g.bufferViews = viewIds.map((i) => {
    const v = g.bufferViews[i];
    const src = v && buffers[v.buffer];
    if (!v || !src) throw new Error(`bufferView ${i} missing`);
    const start = v.byteOffset ?? 0;
    const bytes = src.subarray(start, start + v.byteLength);
    const view: BufferView = { ...v, buffer: 0, byteOffset: offset };
    parts.push(bytes, new Uint8Array(pad4(bytes.length) - bytes.length));
    offset += pad4(bytes.length);
    return view;
  });
  const view = (i: number) => viewMap.get(i) ?? -1; // every id is in viewIds
  for (const a of g.accessors) {
    if (a.bufferView !== undefined) a.bufferView = view(a.bufferView);
  }
  for (const im of g.images ?? []) {
    if (im.bufferView !== undefined) im.bufferView = view(im.bufferView);
  }
  g.buffers = [{ byteLength: offset }];

  const json = new TextEncoder().encode(JSON.stringify(g));
  const jsonLen = pad4(json.length);
  const total = 12 + 8 + jsonLen + 8 + offset;
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true); // "glTF"
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonLen, true);
  dv.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.fill(0x20, 20, 20 + jsonLen);
  out.set(json, 20);
  let p = 20 + jsonLen;
  dv.setUint32(p, offset, true);
  dv.setUint32(p + 4, 0x004e4942, true); // "BIN\0"
  p += 8;
  for (const part of parts) {
    out.set(part, p);
    p += part.length;
  }
  return out;
};
