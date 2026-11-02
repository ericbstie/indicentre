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
  `check` also verifies the generated registry indexes (`bun run gen`).
  CI runs the same with `--frozen-lockfile` plus `bun audit` and a build.
- **Lint = the compiler.** `tsconfig.json` is maximally strict (unused
  locals/params, exact optional props, unchecked index access). Don't loosen it.
- **Lean:** no menus, settings screens or abstractions until a feature needs
  them. Delete dead code in the same change that makes it dead.
- **Content tone:** satirical and educational. Punch at the scam industry,
  never at an ethnicity, accent or nationality. Scam mechanics stay abstract
  and game-like: no real operational instructions, no real brands (use
  BankCo-style fakes).
- **Every scam teaches.** A scam template must list `redFlags`; a scam must
  have a 3-line `whatToSpot` card. The player sees them after every attempt,
  under the victim's defense when they lose.

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
  server.ts            Bun.serve; HTML import bundles the client
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
    state.ts           GameState, Action union, reduce(), selectors
    economy.ts         shift clock, DayEnded log, quota, buy, win/lose
    events.ts          GameEvent union, diffEvents(), createBus()
    store.ts           GameStore Effect service (Ref + listeners + bus)
    rng.ts             seeded Rng; never Math.random in logic
  apps/                REGISTRY: one desktop app per file
    app.ts             DesktopApp, AppContext
    index.ts           generated
    <id>.ts, <id>.css  an app and its styles
  scams/               REGISTRY: one scam per file, plus the scam system
    types.ts           Lure, ScamTemplate, ScamDef
    index.ts           generated
    registry.ts        scams (shop order), starterScams, availableScams
    resolve.ts         fitTags(), resolveScam(victim) -> Outcome{actions}
    <id>.ts            a scam
  victims/             procedural victims: tables, generator, hints,
                       resistance (odds), reveal(level) view
  shop/                tools.ts (tools as data + Modifiers), catalog.ts
  systems/             REGISTRY: one gameplay system per file
    system.ts          GameSystem, SystemContext {game, world}
    index.ts           generated
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
```

**Registries.** A registry entry is any `.ts` file in `src/apps/`,
`src/scams/` or `src/systems/` with a `default` export
(`export default { ... } satisfies DesktopApp | ScamDef | GameSystem`).
`bun run gen` rewrites that folder's `index.ts`; `bun run check` fails if an
index is stale. Never edit an `index.ts` by hand. On a rebase conflict in
one, take either side and run `bun run gen`.

**Data flow:** code calls `game.dispatch(action)` → `reduce()` →
listeners re-render → the store emits events for what changed
(`BucksChanged`, `HeatChanged`, `DayAdvanced`). Code that knows about a
domain event emits it itself (`game.emit({ type: "ScamResolved", ... })`).
Features react with `game.on(type, handler)` instead of editing the reducer
or another feature. Outcome logic stays pure and returns `Action`s.

**Effect boundary:** Effect services live in `core/`. UI code gets the
synchronous `Game` facade and stays Effect-free. New long-lived services
(save/load) go in `core/` as `Context.Service` classes with a `Layer`.

## Which file do I touch for X?

| I want to add…                         | Touch                                                        |
| -------------------------------------- | ------------------------------------------------------------ |
| a desktop app                          | `bun run new:app <id>` → `src/apps/<id>.ts` + `.css`         |
| a scam type                            | `bun run new:scam <id>` → `src/scams/<id>.ts`                |
| an NPC, prop, TV, timer, boss reaction | `bun run new:system <id>` → `src/systems/<id>.ts`            |
| text (mails, dialogue, news)           | `src/content/<topic>.ts`                                     |
| a reaction to money/heat/day/scams     | a system that calls `game.on(...)`                           |
| a new kind of event                    | append a variant to `core/events.ts`                         |
| new persistent state                   | append field + `Action` + `reduce` case + test in `state.ts` |
| a shop tool                            | `src/shop/tools.ts` (+ `Modifiers` field if a new effect)    |
| a new lure                             | `LURES` in `scams/types.ts` + `TAGS` in `victims/types.ts`   |
| a multi-contact scam                   | `warmups` on the `ScamDef` (see `scams/catfish.ts`)          |
| shared colors                          | `client/tokens.css` (rarely; prefer your own `.css`)         |
| a voice for a new speaker              | nothing (derived from the name); tune in `content/voices.ts` |
| a catfisher file clue (EXTRA)          | `src/content/catfisher.ts` (one per day, one red flag each)  |
| a sound effect                         | `audio/sfx.ts`, played from a system on a `game.on(...)`     |
| a 3D model                             | `assets/manifest.json` + `bun run assets` (`docs/assets.md`) |

A system gets `{ game, world }`: add meshes with
`world.office.scene.add(...)`, make them usable with
`world.interactions.add({ object, label, use })`, run per-frame logic with
`world.onFrame(dt => ...)`, react to events with `game.on(...)`. Return a
cleanup if you subscribed to anything.

## The no-shared-file rule

A feature branch adds files; it does not edit another feature's files.
The only shared files are append-only and should get one small hunk each:

- `core/state.ts`: append fields/actions; don't reorder existing ones.
- `core/events.ts`: append event variants.

If you need to change `client/*`, `desktop/desktop.ts`, `scene/*` or
`scams/resolve.ts`, that is a core change: say so in the PR, keep it
separate from the feature commits, and expect it to land first.
Generated `index.ts` files never count as shared (regenerate them).

## Playtesting

Open `http://localhost:3000/?debug` to expose `window.indicentre`
(`game`, `world`, `desktop`, `sitDown()`, `standUp()`) for automation.
Pointer lock does not work headless, so drive the desktop with `sitDown()`
and DOM clicks. To use an `[E]` interaction, aim `world.camera` at it and
fake the lock: `Object.defineProperty(world.player.controls, "isLocked", { value: true })`.
Playwright with Chromium is preinstalled in agent containers
(`require("playwright")`); launch with
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL.
