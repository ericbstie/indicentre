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
  have a `lesson`. The player sees them after every attempt.

## Commands

Tools are pinned in `mise.toml` (`mise install` once). `mise tasks` lists
these; each runs `bun install --frozen-lockfile` first.

| Task             | Does                                               |
| ---------------- | -------------------------------------------------- |
| `mise run dev`   | Dev server with HMR on http://localhost:3000       |
| `mise run check` | Typecheck (strict, doubles as lint) + format check |
| `mise run test`  | Unit tests                                         |
| `mise run build` | Static production bundle in `dist/`                |

Also `bun run start` (no hot reload) and `bun run fmt` (format everything).

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
  client/
    index.html         entry page
    main.ts            composition root: wires store, scene, HUD, desktop
    game.ts            Game: sync facade over the Effect store for UI code
    style.css          all styles (sectioned by component)
  core/                pure logic, no DOM, no three
    state.ts           GameState, Action union, reduce(), selectors
    store.ts           GameStore Effect service (Ref + subscribers)
    rng.ts             seeded Rng, pick/sample/int; never Math.random in logic
  scams/               scam system, pure + data
    types.ts           Lure, Target, ScamTemplate, ScamDef
    registry.ts        list of all scams, starterScams
    phishing.ts        a ScamDef (one file per scam)
    targets.ts         procedural targets from archetypes
    resolve.ts         successChance(), resolveScam() -> Outcome{actions}
  content/             static text content (mails, later dialogue/news)
  desktop/             the in-world PC
    desktop.ts         overlay shell, DesktopApp interface, taskbar
    html.ts            esc()/escLines() for innerHTML templates
    apps/index.ts      app registry (taskbar order)
    apps/*.ts          one file per app
  scene/               three.js
    office.ts          room geometry, desks, PC screen, seat, spawn
    player.ts          WASD + pointer-lock mouse look, wall clamp
    interact.ts        center-ray interaction registry (label + use())
  hud/hud.ts           scam bucks, clock, shutdown meter, prompt, banner
```

**Data flow:** UI/scene code calls `game.dispatch(action)` → `reduce()` in
`core/state.ts` → subscribers re-render. All state changes are `Action`s, so
they are testable and could be saved/replayed. Logic that decides outcomes is
pure and returns `Action`s (see `resolveScam`).

**Effect boundary:** Effect services live in `core/`. UI code receives the
synchronous `Game` facade (`client/game.ts`) and stays Effect-free. New
long-lived services (save/load, audio, NPC scheduler) go in `core/` as
`Context.Service` classes with a `Layer`, exposed to UI the same way.

## How to add…

**A scam:** create `src/scams/<id>.ts` exporting a `ScamDef` (price > 0 to
make it buyable), add it to `scams` in `registry.ts`. Templates need `lures`
and `redFlags`. The data test in `scams.test.ts` validates it. If it needs a
new lure, add it to `LURES` and every archetype in `targets.ts`.

**A desktop app:** create `src/desktop/apps/<id>.ts` exporting a
`DesktopApp` (`mount(el, game)` renders and may return a cleanup; optional
`badge`). Add it to `apps/index.ts`. Use `esc()` for any interpolated text.

**An NPC / interactable prop:** build its mesh in `scene/` (or a new
`scene/<thing>.ts`), then in `client/main.ts` call
`interactions.add({ object, label, use })`. Dialogue text goes in
`content/`; any state it changes goes through a new `Action`.

**State:** add the field to `GameState` and `initialState`, add an `Action`
variant and its `reduce` case, add a test in `state.test.ts`. The `switch`
is exhaustive, so `bun check` tells you what you missed.

## Hot files (coordinate before parallel edits)

These are shared by most features. Keep edits small and additive so merges
stay trivial:

- `core/state.ts`: append new fields/actions; don't reorder existing ones.
- `client/main.ts`: append wiring; move anything big into its own module.
- `client/style.css`: append a new section per component.
- `desktop/apps/index.ts`, `scams/registry.ts`: one line per entry.

## Playtesting

Open `http://localhost:3000/?debug` to expose `window.indicentre`
(`game`, `desktop`, `sitDown()`, `standUp()`) for automation. Pointer lock
does not work headless, so drive the desktop with `sitDown()` and DOM clicks.
Playwright with Chromium is preinstalled in agent containers
(`require("playwright")`); launch with
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL.
