import manifest from "../assets/manifest.json";
import index from "./client/index.html";

// Dev: Bun bundles the HTML import itself, with HMR.
// Production (`mise run app`): serves the prebuilt `bun run build` output in
// dist/, no bundling, watching or HMR.
const development = process.env["NODE_ENV"] !== "production";
const port = Number(process.env["PORT"] ?? (development ? 3000 : 7777));
const hostname = process.env["HOST"] ?? "127.0.0.1";
const dist = `${import.meta.dir}/../dist`;

// Only manifest-listed (hash-verified) models are served.
const model = (file: string) => {
  const id = file.replace(/\.glb$/, "");
  return Object.hasOwn(manifest.models, id)
    ? new Response(Bun.file(`${import.meta.dir}/../assets/models/${id}.glb`), {
        headers: { "content-type": "model/gltf-binary" },
      })
    : notFound();
};
const notFound = () => new Response("Not found", { status: 404 });

// URL parsing has already resolved any `..`, so the path stays under dist/.
const built = async (pathname: string) => {
  const file = Bun.file(dist + (pathname === "/" ? "/index.html" : pathname));
  return (await file.exists()) ? new Response(file) : notFound();
};

const handle = (req: Request) => {
  const { pathname } = new URL(req.url);
  if (pathname.startsWith("/assets/models/"))
    return model(pathname.slice("/assets/models/".length));
  return development ? notFound() : built(pathname);
};

if (!development && !(await Bun.file(`${dist}/index.html`).exists()))
  throw new Error("dist/ is missing: run `bun run build` first");

const server = Bun.serve({
  port,
  hostname,
  development,
  ...(development ? { routes: { "/": index } } : {}),
  fetch: handle,
});

console.log(`IndiCentre running at ${server.url}`);
