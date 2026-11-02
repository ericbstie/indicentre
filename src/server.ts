import index from "./client/index.html";

const port = Number(process.env["PORT"] ?? 3000);
const development = process.env["NODE_ENV"] !== "production";

// Bun bundles the HTML import (and every script/style it references) itself.
const server = Bun.serve({
  port,
  development,
  routes: {
    "/": index,
  },
  fetch: () => new Response("Not found", { status: 404 }),
});

console.log(`IndiCentre running at ${server.url}`);
