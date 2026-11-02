# Contributing

Written for parallel workers (human or agent). Read this, then the file you
are about to touch. Nothing else is required.

## Ground rules

- **Stack:** Bun (runtime, server, bundler, tests, `bun check` typecheck,
  `bun fmt`), `effect` for state services, `three` for 3D. **No other runtime
  dependencies.** Adding any dependency needs a reason in the commit message,
  an exact version (`bunfig.toml` enforces `exact`), and a committed
  `bun.lock`. Lifecycle scripts never run.
- **Green every commit:** `bun run check && bun run test` before each commit.
  `check` = rebuild generated indexes (`bun run gen`), asset manifest, typecheck, format,
  `scripts/lint.ts` (no unused exported values), and the content contract
  (`src/content/contract.test.ts`: no real brands, no triads, known slots).
  `test` also rebuilds the indexes first.
  CI runs the same with `--frozen-lockfile` plus `bun audit`, a build and
  the smoke test.
- **Lint = the compiler.** `tsconfig.json` is maximally strict (unused
  locals/params, exact optional props, unchecked index access). Don't loosen it.
- **Lean:** no menus, settings screens or abstractions until a feature needs
  them. Delete dead code in the same change that makes it dead.
- **Content tone:** satirical and educational. Punch at the scam industry,
  never at an ethnicity, accent or nationality. Scam mechanics stay abstract
  and game-like: no real operational instructions, no real brands (use
  BankCo-style fakes).
- **The game teaches by showing, not by debrief.** No generic feedback after
  a pitch (no red-flag lists, no odds reveal): the result card shows the
  outcome and the victim's own line, and the TV news tells what a victim
  who caught you did right.

## Before you open (and before you merge) a PR

```sh
bun run check && bun run test && bun run smoke
```

`smoke` boots the server, plays one phishing scam in headless Chrome and
reloads to check Continue and New run
(`Bun.WebView`); set `BUN_CHROME_PATH` if Chrome isn't found. Right before
merging, rebase on `origin/main` and wait for green: CI's `fresh` job fails
a PR that doesn't contain the latest main, because two PRs that were each
green alone have broken main together.

## Commit plans

Every feature branch lands an explicit, pre-agreed list of commits, systems
first, feature last. Example for "phone scams":

1. `feat(core): add <state/actions> needed by calls` (+ reducer tests)
2. `feat(scams): add <types/resolver support>` (+ tests)
3. `feat(content): add <data>`
4. `feat(desktop): add <app/UI>` (the feature itself)

Conventional commit prefixes: `feat(scope)`, `fix`, `chore`, `ci`, `docs`,
`test`, `refactor`. Scope = top-level folder under `src/`.

## Architecture

```
src/
  server.ts            Bun.serve; dev: HTML import + HMR, prod: serves dist/
  server/proxy.ts      host check, trusted X-Forwarded-* (docs/hosting.md)
  css.d.ts             lets .ts files `import "./x.css"`
  client/              composition root: wiring only, no features
    index.html         entry page (links tokens.css)
    tokens.css         color tokens + base/.btn/.link/.empty/.lesson
    main.ts            boots game, world, HUD, desktop; starts systems
    boot.ts            fresh-run game + ?debug hook
    scene.ts           renderer, camera, player, interactions, onFrame loop
    desktop.ts         mounts the PC overlay, sit down / stand up
    hud.ts             mounts the HUD
    game.ts            Game: sync facade over the Effect store (+ event bus)
  core/                pure logic, no DOM, no three
    state.ts           economy GameState, CoreAction, reduce(), selectors
    slice.ts           defineSlice(): feature state declared in its own file
    economy.ts         shift clock, DayEnded log, quota, buy, win/lose
    events.ts          cross-cutting GameEvent, defineEvent(), createBus()
    store.ts           GameStore Effect service (Ref + listeners + bus)
    save.ts            one saved run in localStorage; SAVE_VERSION guards
                       core GameState's shape (save.test.ts lists its keys)
    rng.ts             seeded Rng; never Math.random in logic
  apps/                REGISTRY: one desktop app per file
    app.ts             DesktopApp, AppContext
    index.ts           generated, gitignored
    <id>.ts, <id>.css  an app and its styles
  scams/               REGISTRY: one scam per file, plus the scam system
    types.ts           Lure, ScamTemplate, ScamDef
    index.ts           generated, gitignored
    registry.ts        scams (shop order), starterScams, availableScams
    resolve.ts         fitTags(), resolveScam(victim) -> Outcome{actions}
    <id>.ts            a scam
  victims/             procedural victims: tables, generator, hints,
                       resistance (odds), reveal(level) view, angles
                       (Persondata dossier lines)
  shop/                tools.ts (tools as data + Modifiers), catalog.ts
  workplace/           desk upgrades: slice.ts (owned, desk tier, call odds), upgrades.ts
  systems/             REGISTRY: one gameplay system per file
    system.ts          GameSystem, SystemContext {game, world}
    index.ts           generated, gitignored
    <id>.ts            clock.ts, welcome.ts, NPCs, news TV, boss...
  content/             static text and data (mails, coworkers, news)
  dialog/              openDialog({ speaker, line, choices }) overlay
  audio/               Web Audio, browser-only: engine (buses, mute),
                       babble (gibberish voices), speak, music, sfx
  desktop/             PC overlay shell (desktop.ts/.css), html.ts esc()
  scene/               three.js: office, player, npc, interact registry, tv,
                       screenText (text on a canvas-textured plane),
                       models.ts loadModel(id)
  news/                pure news model, story generator, feed queue
  hud/                 HUD overlay (hud.ts/.css), modal.ts one-button blocking card
assets/
  manifest.json        every model: pinned URL, sha256, CC0 license
  models/<id>.glb      verified by `bun run check`
scripts/
  gen.ts               writes the three generated index.ts files
  assets.ts            fetches + verifies assets (`bun run assets`)
  new.ts               scaffolds an app / scam / system
  doctor.ts            files your branch shares with other open branches
```

**Registries.** A registry entry is any `.ts` file in `src/apps/`,
`src/scams/` or `src/systems/` with a `default` export
(`export default { ... } satisfies DesktopApp | ScamDef | GameSystem`).
`bun run gen` writes that folder's `index.ts`. The indexes are gitignored
and every script (`dev`, `start`, `build`, `check`, `test`) rebuilds them,
so never commit or edit one.

**Data flow:** code calls `game.dispatch(action)` → `reduce()` →
listeners re-render → the store emits events for what changed
(`BucksChanged`, `HeatChanged`, `DayAdvanced`). Code that knows about a
domain event emits it itself (`game.emit({ type: "ScamResolved", ... })`).
Features react with `game.on(type, handler)` instead of editing the reducer
or another feature. Outcome logic stays pure and returns `Action`s.

**Feature state and events live in the feature's file** (see
`content/mail.ts`, `core/boss.ts`, `content/coworkers.ts`):

```ts
export const inbox = defineSlice("inbox", [] as ReadonlyArray<Mail>, (mails, a: InboxAction) => ...);
export const readMail = (id: string) => ({ type: "inbox/read", id }) as const;
inbox.get(game.state());          // typed read, `initial` until changed
game.dispatch(readMail(id));      // "<key>/<verb>" goes only to that slice

export const HintGiven = defineEvent<{ coworker: string; hint: string }>("HintGiven");
game.emit(HintGiven, { coworker, hint });
game.on(HintGiven, ({ hint }) => ...);
```

A slice reacts only to its own actions; to respond to money, heat or a
finished day, a system listens with `game.on(...)` and dispatches. Slices
are saved with the run; if a slice's value changes shape, give it a new key
(`"inbox"` → `"inbox2"`) so old saves don't load stale data into it.

**Effect boundary:** Effect services live in `core/`. UI code gets the
synchronous `Game` facade and stays Effect-free. New long-lived services
(save/load) go in `core/` as `Context.Service` classes with a `Layer`.

## Which file do I touch for X?

| I want to add…                         | Touch                                                           |
| -------------------------------------- | --------------------------------------------------------------- |
| a desktop app                          | `bun run new:app <id>` → `src/apps/<id>.ts` + `.css`            |
| a scam type                            | `bun run new:scam <id>` → `src/scams/<id>.ts`                   |
| an NPC, prop, TV, timer, boss reaction | `bun run new:system <id>` → `src/systems/<id>.ts`               |
| text (mails, dialogue, news)           | `src/content/<topic>.ts`                                        |
| a reaction to money/heat/day/scams     | a system that calls `game.on(...)`                              |
| a new kind of event                    | `defineEvent` in the file that emits it                         |
| new persistent state                   | `defineSlice` + action creators + test, in the owning file      |
| a shop tool                            | `src/shop/tools.ts` (+ `Modifiers` field if a new effect)       |
| a new lure                             | `LURES` in `scams/types.ts` + `TAGS` in `victims/types.ts`      |
| a Persondata dossier fact or angle     | `HOBBIES`/`RECENT_EVENTS` in `victims/tables.ts`, `ANGLES`      |
| a multi-contact scam                   | `warmups` on the `ScamDef` (see `scams/catfish.ts`)             |
| shared colors                          | `client/tokens.css` (rarely; prefer your own `.css`)            |
| a voice for a new speaker              | nothing (derived from the name); tune in `content/voices.ts`    |
| a catfisher file clue (EXTRA)          | `src/content/catfisher.ts` (one per day, one red flag each)     |
| a sound effect                         | `audio/sfx.ts`, played from a system on a `game.on(...)`        |
| a 3D model                             | `assets/manifest.json` + `bun run assets` (`docs/assets.md`)    |
| a desk upgrade or cosmetic             | `src/workplace/upgrades.ts` + `PROPS` in `systems/workplace.ts` |

A system gets `{ game, world }`: add meshes with
`world.office.scene.add(...)`, make them usable with
`world.interactions.add({ object, label, use })`, run per-frame logic with
`world.onFrame(dt => ...)`, react to events with `game.on(...)`. Return a
cleanup if you subscribed to anything.

## Shared seams

A feature branch adds files; it does not edit another feature's files.
These are the only files two open branches may both touch:

| File                                                            | Rule                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `core/state.ts`, `core/events.ts`                               | economy and cross-cutting events only; features never edit   |
| `client/*`, `desktop/desktop.ts`, `scene/*`, `scams/resolve.ts` | core change: own commit, first in the plan, say so in the PR |
| `client/tokens.css`                                             | append only, one hunk                                        |
| `CONTRIBUTING.md`, `docs/*.md`                                  | append only, one hunk                                        |
| `src/*/index.ts`                                                | generated and gitignored; never commit                       |

Run `bun run doctor` before you push: it lists files your branch shares
with other open branches. A name clash (two branches creating
`content/boss.ts`) means pick a more specific name now.

**Never write a fallback for work in an open PR.** If you need a dialog,
counter or system that another branch is adding, build on that branch's
interface (rebase onto it once merged, or base your branch on it) or wait.
A temporary copy always ends up deleted in someone else's PR.

## Playtesting

Open `http://localhost:3000/?debug` to expose `window.indicentre`
(`game`, `world`, `desktop`, `sitDown()`, `standUp()`) for automation.
Pointer lock does not work headless, so drive the desktop with `sitDown()`
and DOM clicks. To use an `[E]` interaction, aim `world.camera` at it and
fake the lock: `Object.defineProperty(world.player.controls, "isLocked", { value: true })`.
Playwright with Chromium is preinstalled in agent containers
(`require("playwright")`); launch with
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL.
