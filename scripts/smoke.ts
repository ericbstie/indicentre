// End-to-end smoke test: boots the real server, loads the page in headless
// Chrome (Bun.WebView), sits at the PC, runs one phishing scam and checks
// that it worked. `bun run smoke`. Set BUN_CHROME_PATH if Chrome is elsewhere.
export {};
const fail = (msg: string): never => {
  throw new Error(msg);
};

const server = Bun.spawn(["bun", "src/server.ts"], {
  env: { ...process.env, PORT: "0" },
  stdout: "pipe",
  stderr: "inherit",
});
let url = "";
const reader = server.stdout.getReader();
while (!url) {
  const { value, done } = await reader.read();
  if (done) fail("server exited before printing its URL");
  url = /https?:\/\/\S+/.exec(new TextDecoder().decode(value))?.[0] ?? "";
}

const errors: string[] = [];
const view = new Bun.WebView({
  backend: {
    type: "chrome",
    url: false,
    argv: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  },
  width: 1280,
  height: 800,
  console: (type, ...args) => {
    if (type === "error") errors.push(args.map(String).join(" "));
  },
});

try {
  await view.navigate(`${url}?debug&seed=smoke`);
  await view.evaluate(
    `void addEventListener("error", (e) => console.error("uncaught", e.message))`,
  );
  const hud = () =>
    view.evaluate<string>(
      `document.querySelector(".hud-stats").textContent.replace(/\\s+/g, " ").trim()`,
    );
  if (!(await view.evaluate<boolean>(`!!window.indicentre`)))
    fail("page did not boot (window.indicentre missing)");
  const before = await hud();

  await view.evaluate(`indicentre.sitDown()`);
  await view.evaluate(`indicentre.desktop.launch("leads")`);
  await view.click(".leads [data-target]", { timeout: 5000 });
  await view.click(`.leads [data-send^="phishing/"]`, { timeout: 5000 });

  const shown = await view.evaluate<boolean>(
    `!!document.querySelector(".leads .result h3")`,
  );
  if (!shown) fail("no result card after sending a scam");
  const after = await hud();
  if (after === before) fail(`HUD unchanged after a scam: ${after}`);
  if (errors.length) fail(`console errors:\n  ${errors.join("\n  ")}`);
  console.log(`smoke: ok (${before} -> ${after})`);
} catch (e) {
  console.error(`smoke: FAIL ${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
} finally {
  view.close();
  Bun.WebView.closeAll();
  server.kill();
}
