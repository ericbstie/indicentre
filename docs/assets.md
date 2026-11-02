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

To shrink or convert a model (e.g. `.gltf` → `.glb`, drop animation clips),
run [glTF-Transform](https://gltf-transform.dev) through `bunx`. It is a tool,
never a dependency; record the processed file's hash and keep the upstream
file's URL in `url` with a note in the commit message:

```sh
bunx @gltf-transform/cli@4.2.1 copy in.gltf out.glb
bunx @gltf-transform/cli@4.2.1 optimize in.glb out.glb --compress false --texture-compress false
```

A processed file can't be re-fetched by `bun run assets`, so only process
when the size win is large.

## Sources ready to use

| Pack                                                                         | License | Mirror (pin a commit)                                                                                                                                                          |
| ---------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kenney Furniture Kit: desk, chairs, PCs, laptop, plants, trashcan, bookcases | CC0     | `RetroDECK/RetroQUEST` `assets/kenney_furniture-kit/Models/GLTF format/`                                                                                                       |
| KayKit Furniture Bits: shelves, cabinets, lamps, frames, rugs                | CC0     | `KayKit-Game-Assets/KayKit-Furniture-Bits-1.0` (official; glTF + .bin + one atlas png)                                                                                         |
| Quaternius Ultimate Animated Character Pack: Suit, Casual, Worker people     | CC0     | `BMOxOMB/Proyecto_ProgramacionConPatrones` `Assets/Characters/Ultimate Animated Character Pack - Nov 2019/glTF/` (Git LFS: fetch from `media.githubusercontent.com/media/...`) |

## Characters

Recommended: **Quaternius Ultimate Animated Character Pack.** Low-poly,
rigged, 16 clips per character including `Idle`, `Walk`, `SitDown`,
`StandUp`, `Victory` and `Defeat`, which covers coworkers typing, the boss
walking over and reactions to good or bad days. Office looks: `Suit_Male`,
`Suit_Female`, `Casual_*`, `Casual2_*`, `Casual3_*`, `Worker_*`,
`OldClassy_*`. Each is a ~2 MB `.gltf` with an embedded buffer; converted to
`.glb` it is ~1.2 MB (`Suit_Male.gltf` sha256
`d89d245d10c81ee637116b3400657dad2873ec1bbfb7f90579b2f77a8779fa5b`).
The model is about 3.3 units tall, so scale by ~0.5.

Skinned meshes must be cloned with `SkeletonUtils`, not `Object3D.clone`,
and animated with one `AnimationMixer` per instance:

```ts
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";

const gltf = await new GLTFLoader().loadAsync("/assets/models/suit-male.glb");
const npc = clone(gltf.scene);
const mixer = new THREE.AnimationMixer(npc);
const idle = THREE.AnimationClip.findByName(gltf.animations, "Idle");
if (idle) mixer.clipAction(idle).play();
world.onFrame((dt) => mixer.update(dt));
```

When the first NPC lands, extend `loadModel` (or add a sibling
`loadCharacter`) that returns `{ object, clips }` and clones with
`SkeletonUtils.clone`. Fallback if size becomes a problem: a stylized
procedural humanoid (capsule body, sphere head, box arms) with bob and turn
animation in code.
