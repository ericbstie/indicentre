# 3D models: sources and approach

Research for how IndiCentre gets office furniture and characters without new
dependencies. How-to lives in [assets.md](assets.md).

## Sources

Licenses checked on the publisher's page and in the `License.txt` shipped
inside each pack (2026-11-02).

| Source                                                                                                      | License                  | Formats                     | Office fit                                                                                                       | Notes                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit)                                              | CC0 (page + License.txt) | GLB, OBJ, FBX, DAE          | **Best.** desk, deskCorner, chairDesk, computerScreen, keyboard, mouse, laptop, trashcan, pottedPlant, bookcases | 140 files, 3–40 KB each, flat material colors (no textures). Origin at a corner; scale ≈ 0.5 (desk is 0.38 high). |
| [KayKit Furniture Bits](https://kaylousberg.itch.io/furniture-bits) (Kay Lousberg)                          | CC0 (page + License.txt) | glTF+bin, OBJ, FBX          | Good for decor: chairs, shelves, cabinets, frames, lamps, rugs, cactus. No desk or PC.                           | Official mirror on GitHub (`KayKit-Game-Assets/KayKit-Furniture-Bits-1.0`). One 1024² gradient atlas.             |
| [Quaternius Ultimate Animated Character Pack](https://quaternius.com/packs/ultimatedanimatedcharacter.html) | CC0 (page + License.txt) | glTF (embedded), FBX, Blend | **Best characters.** Suit_Male/Female, Casual*, Worker__, OldClassy__                                            | Rigged, 16 clips each incl. Idle, Walk, SitDown, StandUp, Victory, Defeat. ~2 MB .gltf → 1.2 MB .glb.             |
| KayKit Character Packs (Adventurers, Skeletons)                                                             | CC0                      | glTF, FBX                   | Poor (fantasy)                                                                                                   | Rigged/animated, but knights and mages.                                                                           |
| [Poly Pizza](https://poly.pizza)                                                                            | Per model: CC0 or CC-BY  | GLB                         | Mixed                                                                                                            | Aggregator (Quaternius, Google Poly). Check each model; CC-BY needs in-game credit.                               |
| Sketchfab                                                                                                   | Per model, mostly CC-BY  | glTF                        | Mixed                                                                                                            | Download needs an account or API token; not scriptable for a lean pipeline.                                       |
| three.js examples (`RobotExpressive.glb`)                                                                   | CC0                      | GLB                         | Mascot at most                                                                                                   | Already battle-tested with three's AnimationMixer.                                                                |

Container note: kenney.nl, quaternius.com and poly.pizza are blocked from the
agent container; GitHub is not. Files are fetched from GitHub mirrors pinned
to a commit SHA. The Kenney files were cross-checked: three unrelated mirrors
(`RetroDECK/RetroQUEST`, `zees-games/mg-look-at-me`, `rzuf79/experiment-world`)
serve byte-identical `desk.glb`, `computerScreen.glb`, `chairDesk.glb`.

## Approaches

**(a) glTF via three's `GLTFLoader`.** Ships inside `three`
(`three/addons/loaders/GLTFLoader.js`): zero new deps. Gets real silhouettes
for free and animations through `AnimationMixer`. Cost: binary files in the
repo, so they need provenance (manifest + sha256).

**(b) Procedural/kitbash in code.** Boxes and cylinders, like the current
`desk()`. Zero bytes, trivially recolorable, perfect for walls, partitions,
ceiling lights, whiteboards, screens and anything that must be sized to the
room. Looks like programmer art for anything organic (chairs, plants, people).

**(c) A helper library.** Options looked at: `@gltf-transform/*` (asset
optimization), `three-stdlib`, `@react-three/drei`, CSG libraries. None is
worth a runtime dependency: GLTFLoader, `SkeletonUtils` and `AnimationMixer`
are already in `three`, and drei needs React. `@gltf-transform/cli` is useful
as an offline tool through `bunx` (convert .gltf → .glb, prune clips,
quantize) and never becomes a dependency.

## Recommendation

**(a) + (b), zero new dependencies.**

- Furniture and props: Kenney Furniture Kit GLBs (CC0, a few KB each), scaled
  ×2. KayKit Furniture Bits for extra decor.
- Room shell, partitions, screens, signage: procedural, as today.
- Characters: Quaternius Ultimate Animated Character Pack (Suit, Casual,
  Worker variants). One GLB per look, clone instances with
  `SkeletonUtils.clone`, play `Idle`/`SitDown` with `AnimationMixer`.
  Fallback if size matters: a stylized procedural humanoid (capsule body,
  sphere head, box arms) with bob/turn animation in code.
- Only CC0 for now. CC-BY would need a credits screen, which we don't have.
