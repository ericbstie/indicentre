// Fetches and verifies the 3D assets listed in assets/manifest.json.
// Every file in assets/models/ must be in the manifest with a matching sha256
// and an allowed license; nothing gets committed unverified.
//   bun run assets          download missing/mismatched files, verify hashes
//   bun run assets --check  verify only, no network (used by `bun run check`)
import { mkdirSync, readdirSync } from "node:fs";
import manifest from "../assets/manifest.json";

/** CC-BY would need an in-game credits screen; add it here when one exists. */
const LICENSES: ReadonlySet<string> = new Set(["CC0-1.0"]);
const DIR = "assets/models";

interface Entry {
  readonly url: string;
  readonly sha256: string;
  readonly license: string;
  readonly author: string;
  readonly origin: string;
  readonly licenseUrl: string;
}

const models: Readonly<Record<string, Entry>> = manifest.models;
const check = process.argv.includes("--check");
const sha256 = (bytes: ArrayBuffer | Uint8Array) =>
  new Bun.CryptoHasher("sha256").update(bytes).digest("hex");

const problems: string[] = [];
mkdirSync(DIR, { recursive: true });

for (const [id, e] of Object.entries(models)) {
  if (!LICENSES.has(e.license)) problems.push(`${id}: license ${e.license}`);
  if (!e.url.startsWith("https://")) problems.push(`${id}: url not https`);
  const path = `${DIR}/${id}.glb`;
  const file = Bun.file(path);
  if ((await file.exists()) && sha256(await file.bytes()) === e.sha256) {
    continue;
  }
  if (check) {
    problems.push(`${id}: ${path} missing or hash mismatch (bun run assets)`);
    continue;
  }
  const res = await fetch(e.url);
  if (!res.ok) {
    problems.push(`${id}: HTTP ${res.status} from ${e.url}`);
    continue;
  }
  const bytes = await res.arrayBuffer();
  const got = sha256(bytes);
  if (got !== e.sha256) {
    problems.push(`${id}: downloaded sha256 ${got}, manifest ${e.sha256}`);
    continue;
  }
  await Bun.write(path, bytes);
  console.log(`fetched ${path} (${bytes.byteLength} B)`);
}

for (const f of readdirSync(DIR)) {
  if (!(f.replace(/\.glb$/, "") in models)) {
    problems.push(`${DIR}/${f}: not in assets/manifest.json`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`${Object.keys(models).length} assets verified`);
