// Scaffolds a registry entry and regenerates the indexes.
//   bun run new:app <id>     src/apps/<id>.ts + <id>.css
//   bun run new:scam <id>    src/scams/<id>.ts
//   bun run new:system <id>  src/systems/<id>.ts
import { gen } from "./gen.ts";

const [kind, id] = process.argv.slice(2);
const title = (id ?? "").replace(
  /(^|-)(\w)/g,
  (_, s: string, c: string) => (s ? " " : "") + c.toUpperCase(),
);

const templates: Record<string, Record<string, string>> = {
  app: {
    [`src/apps/${id}.ts`]: `import "./${id}.css";
import { esc } from "../desktop/html.ts";
import type { DesktopApp } from "./app.ts";

export default {
  id: "${id}",
  title: "${title}",
  icon: "□",
  mount(el, { game }) {
    const render = () => {
      el.innerHTML = \`<div class="${id}"><p>\${esc(game.state().scamBucks)} scam bucks</p></div>\`;
    };
    render();
    return game.subscribe(render);
  },
} satisfies DesktopApp;
`,
    [`src/apps/${id}.css`]: `.${id} {
  padding: 16px 24px;
}
`,
  },
  scam: {
    [`src/scams/${id}.ts`]: `import type { ScamDef } from "./types.ts";

export default {
  id: "${id}",
  name: "${title}",
  channel: "mail",
  price: 100,
  minutes: 30,
  payout: 60,
  heat: { success: 3, fail: 10 },
  fitTags: ["bank"],
  successLines: [
    "TODO: what a victim says after falling for it.",
    "TODO: a second one.",
    "TODO: a third one.",
  ],
  templates: [
    {
      id: "first",
      label: "TODO label",
      subject: "TODO subject",
      body: "Hi {name},\\n\\nTODO body.",
      lures: { urgency: 0.5 },
    },
  ],
} satisfies ScamDef;
`,
  },
  system: {
    [`src/systems/${id}.ts`]: `import type { GameSystem } from "./system.ts";

export default {
  id: "${id}",
  start({ game }) {
    game.on("DayAdvanced", () => {});
  },
} satisfies GameSystem;
`,
  },
};

const files = kind ? templates[kind] : undefined;
if (!files || !id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error("usage: bun run new:<app|scam|system> <kebab-id>");
  process.exit(1);
}
for (const path of Object.keys(files)) {
  if (await Bun.file(path).exists()) {
    console.error(`${path} already exists`);
    process.exit(1);
  }
}
for (const [path, body] of Object.entries(files)) {
  await Bun.write(path, body);
  console.log(`created ${path}`);
}
await gen();
