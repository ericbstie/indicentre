import manifest from "../assets/manifest.json";
import index from "./client/index.html";

const port = Number(process.env["PORT"] ?? 3000);
const development = process.env["NODE_ENV"] !== "production";

// Bun bundles the HTML import (and every script/style it references) itself.
const server = Bun.serve({
  port,
  development,
  routes: {
    "/": index,
    // Only manifest-listed (hash-verified) models are served.
    "/assets/models/:file": (req) => {
      const id = req.params.file.replace(/\.glb$/, "");
      return Object.hasOwn(manifest.models, id)
        ? new Response(
            Bun.file(`${import.meta.dir}/../assets/models/${id}.glb`),
            { headers: { "content-type": "model/gltf-binary" } },
          )
        : new Response("Not found", { status: 404 });
    },
  },
  fetch: () => new Response("Not found", { status: 404 }),
});

console.log(`IndiCentre running at ${server.url}`);
