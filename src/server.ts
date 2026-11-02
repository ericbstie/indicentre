import manifest from "../assets/manifest.json";
import index from "./client/index.html";
import { allowedHosts, hostAllowed, visitor } from "./server/proxy";

// Dev: Bun bundles the HTML import itself, with HMR.
// Production (`mise run app`): serves the prebuilt `bun run build` output in
// dist/, no bundling, watching or HMR.
const development = process.env["NODE_ENV"] !== "production";
const port = Number(process.env["PORT"] ?? (development ? 3000 : 7777));
const hostname = process.env["HOST"] ?? "127.0.0.1";
const dist = `${import.meta.dir}/../dist`;
const allowed = allowedHosts(process.env["ALLOWED_HOSTS"]);

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
  // Refuse DNS-rebinding and misrouted requests. In production every request
  // lands here; in dev the "/" route and HMR bypass it (dev is local only).
  if (!hostAllowed(req.headers.get("host"), allowed))
    return new Response("Unknown host", { status: 421 });
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
  fetch(req, server) {
    const peer = server.requestIP(req)?.address ?? "";
    if (!development) {
      const { ip, scheme } = visitor(req, peer);
      console.log(`${ip} ${scheme} ${req.method} ${new URL(req.url).pathname}`);
    }
    return handle(req);
  },
});

console.log(`IndiCentre running at ${server.url}`);
