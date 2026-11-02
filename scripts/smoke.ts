// End-to-end smoke test: boots the real server, loads the page in headless
// Chrome (Bun.WebView), sits at the PC, runs one phishing scam and checks
// that it worked, ends the day and checks day 2 unlocks its scheduled scam,
// then reloads and checks the run resumes (Continue) and resets (New run). `bun run smoke`. Set BUN_CHROME_PATH if Chrome is elsewhere.
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
  const page = `${url}?debug&seed=smoke`;
  const load = async () => {
    await view.navigate(page);
    await view.evaluate(
      `void addEventListener("error", (e) => console.error("uncaught", e.message))`,
    );
  };
  await load();
  // The browser profile may keep an earlier run's save.
  await view.evaluate(`localStorage.clear()`);
  await load();
  const hud = () =>
    view.evaluate<string>(
      `document.querySelector(".hud-stats").textContent.replace(/\\s+/g, " ").trim()`,
    );
  if (!(await view.evaluate<boolean>(`!!window.indicentre`)))
    fail("page did not boot (window.indicentre missing)");
  const before = await hud();

  // Story beats (day 0 intro, day 1 briefing, Priya at the PC) and cards
  // (day report) cover the screen; Esc through them like an impatient player.
  const skipStory = async () => {
    let quiet = 0;
    for (let i = 0; i < 40 && quiet < 3; i++) {
      await Bun.sleep(250);
      const open = await view.evaluate<boolean>(
        `!!document.querySelector(".dialog-layer:not([hidden]), .modal")`,
      );
      if (open)
        await view.evaluate(
          `document.body.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }))`,
        );
      quiet = open ? 0 : quiet + 1;
    }
  };
  await skipStory();
  await view.evaluate(`indicentre.sitDown()`);
  await skipStory();
  await view.evaluate(`indicentre.desktop.launch("leads")`);
  await view.click(".leads [data-target]", { timeout: 5000 });
  await view.click(`.leads [data-send^="phishing/"]`, { timeout: 5000 });

  const shown = await view.evaluate<boolean>(
    `!!document.querySelector(".leads .result h3")`,
  );
  if (!shown) fail("no result card after sending a scam");
  if ((await hud()) === before) fail(`HUD unchanged after a scam`);

  // Day rollover: the report card, the boss, then day 2's scheduled scam.
  await view.evaluate(`indicentre.standUp()`);
  await view.evaluate(`indicentre.game.dispatch({ type: "endDay" })`);
  await skipStory();
  const day2 = await view.evaluate<string>(
    `JSON.stringify([indicentre.game.state().day, indicentre.game.state().unlockedScams])`,
  );
  if (day2 !== JSON.stringify([2, ["phishing", "tech-support"]]))
    fail(`day 2 did not start with tech-support: ${day2}`);
  const after = await hud();

  await load();
  const card = await view.evaluate<string>(
    `document.querySelector(".modal-card")?.textContent ?? ""`,
  );
  if (!card.includes("Welcome back")) fail(`no Continue card after reload`);
  await view.click(".modal .btn", { timeout: 5000 });
  if ((await hud()) !== after) fail(`Continue lost the run: ${await hud()}`);

  await load();
  await view.click(".modal .link", { timeout: 5000 });
  // New run reloads the page: wait for the fresh boot.
  const fresh = `!!window.indicentre && !document.querySelector(".modal")`;
  for (let i = 0; i < 50; i++) {
    if (await view.evaluate<boolean>(fresh).catch(() => false)) break;
    await Bun.sleep(100);
  }
  if (!(await view.evaluate<boolean>(fresh))) fail("New run did not reset");
  if ((await hud()) !== before) fail(`New run kept the run: ${await hud()}`);

  if (errors.length) fail(`console errors:\n  ${errors.join("\n  ")}`);
  console.log(`smoke: ok (${before} -> ${after}, resumed and reset)`);
} catch (e) {
  console.error(`smoke: FAIL ${e instanceof Error ? e.message : e}`);
  process.exitCode = 1;
} finally {
  view.close();
  Bun.WebView.closeAll();
  server.kill();
}
