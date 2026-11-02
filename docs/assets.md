# 3D assets

Why these sources and this approach: [3d-research.md](3d-research.md).

## Rules

- **CC0 only** (`CC0-1.0`). `scripts/assets.ts` rejects anything else. CC-BY
  needs an in-game credits screen first.
- Every file in `assets/models/` is listed in `assets/manifest.json` with a
  pinned source URL and sha256. `bun run check` (and CI) fails on an unlisted
  file or a hash mismatch.
- Source URLs are immutable: a GitHub raw URL pinned to a **commit SHA**, never
  a branch. Prefer the publisher's own repo; for a third-party mirror, confirm
  the hash against a second mirror and link the pack's `License.txt` at the
  same commit in `licenseUrl`.
- Small files: props under ~50 KB, characters under ~1.5 MB. Prefer GLB with
  flat colors or one small atlas.
- Procedural (three primitives) for the room shell, partitions, screens and
  anything sized to the room. Models for furniture, props, people.

## Add a model

1. Add an entry to `assets/manifest.json` (the key is the id and file name):

   ```json
   "plant": {
     "url": "https://raw.githubusercontent.com/<owner>/<repo>/<commit-sha>/path/pottedPlant.glb",
     "sha256": "<sha256 of the file>",
     "license": "CC0-1.0",
     "author": "Kenney",
     "origin": "https://kenney.nl/assets/furniture-kit",
     "licenseUrl": "https://raw.githubusercontent.com/<owner>/<repo>/<commit-sha>/path/License.txt"
   }
   ```

   Get the hash with `curl -sL <url> | sha256sum`.

2. `bun run assets` downloads it to `assets/models/plant.glb` and verifies
   the hash. Commit the manifest and the file together.
3. Use it from a system or the scene:

   ```ts
   import { loadModel } from "../scene/models.ts";

   const plant = await loadModel("plant"); // fresh clone, bottom-centered
   plant.scale.setScalar(2); // Kenney Furniture Kit is ~half real size
   plant.position.set(6, 0, -4);
   world.office.scene.add(plant);
   ```

   `loadModel` loads each file once; clones share geometry and materials.
   The id is type-checked against the manifest.

**Embedded `.gltf` with animations** (the Quaternius characters): add
`"pack": { "sha256": "<sha256 of the downloaded .gltf>", "clips": ["Idle", "Walk"] }`
and set `sha256` to the hash of the packed `.glb`. `bun run assets` checks
the download against `pack.sha256`, packs it with only those clips
(`scripts/glb.ts`, deterministic) and checks the result against `sha256`.
To get the packed hash the first time, put any value in `sha256`, run
`bun run assets` and copy the "packed sha256" it reports.

For heavier processing (mesh quantization, texture resizing) use
[glTF-Transform](https://gltf-transform.dev) through `bunx`, as a tool,
never a dependency. Its output can't be re-fetched by `bun run assets`, so
only do it when the size win is large.

## Sources ready to use

| Pack                                                                              | License | Mirror (pin a commit)                                                                                                                                                          |
| --------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kenney Furniture Kit: desk, chairs, PCs, laptop, plants, trashcan, bookcases      | CC0     | `RetroDECK/RetroQUEST` `assets/kenney_furniture-kit/Models/GLTF format/`                                                                                                       |
| KayKit Furniture Bits: shelves, cabinets, lamps, frames, rugs                     | CC0     | `KayKit-Game-Assets/KayKit-Furniture-Bits-1.0` (official; glTF + .bin + one atlas png)                                                                                         |
| Quaternius Ultimate Animated Character Pack: Suit, Casual, Worker people (in use) | CC0     | `BMOxOMB/Proyecto_ProgramacionConPatrones` `Assets/Characters/Ultimate Animated Character Pack - Nov 2019/glTF/` (Git LFS: fetch from `media.githubusercontent.com/media/...`) |

## Characters

Coworkers and the boss are **Quaternius Ultimate Animated Character Pack**
models (CC0), packed with `Idle`, `Walk`, `SitDown` and `StandUp`
(0.5 to 0.8 MB each). In the manifest: `suit-male` (the boss),
`casual-female`, `casual2-male`, `casual3-female`. The pack has more office
looks (`Suit_Female`, `Casual_Male`, `Casual2_Female`, `Casual3_Male`,
`Worker_*`, `OldClassy_*`) at the same mirror; budget about 0.7 MB each.

An NPC is `createNpc(look, desk)` from `src/scene/npc.ts`. `look.outfit`
picks the model; `shirt`, `skin` and `hair` recolor its `Shirt`, `Skin` and
`Hair` materials, so one outfit can be several people.

Lower level, in `src/scene/characters.ts`:

```ts
import { animate, loadCharacter, tint } from "../scene/characters.ts";

const c = await loadCharacter("casual2-male"); // own skeleton + materials
tint(c.object, "Shirt", 0x3b6e8f);
group.add(c.object); // feet at origin, faces +z, ~1.75 m
animate(c, group); // Idle; Walk while `group` moves
```

`animate` registers with `tickCharacters(dt)`, which the world's frame loop
already calls; don't update mixers yourself. Skinned meshes skip raycasts,
so give anything interactive a hitbox (see `createNpc`). The pack's `Face`
material (eyes, brows) ships near-white; `createNpc` draws it dark.
