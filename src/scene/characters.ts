import * as THREE from "three";
import { type GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import type { ModelId } from "./models.ts";

/** Rigged Quaternius characters in assets/manifest.json (packed with these clips). */
export type CharacterId = Extract<
  ModelId,
  "suit-male" | "casual-female" | "casual2-male" | "casual3-female"
>;
export type Clip = "Idle" | "Walk" | "SitDown" | "StandUp";

/** Quaternius characters are ~3.1 units tall; this makes them ~1.75 m. */
const SCALE = 0.56;

const loader = new GLTFLoader();
const cache = new Map<CharacterId, Promise<GLTF>>();

const load = (id: CharacterId) => {
  let gltf = cache.get(id);
  if (!gltf) {
    gltf = fetch(`/assets/models/${id}.glb`)
      .then((res) => {
        if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buf) => loader.parseAsync(buf, ""));
    gltf.catch(() => cache.delete(id));
    cache.set(id, gltf);
  }
  return gltf;
};

export interface Character {
  /** Feet at the origin, facing +z. */
  readonly object: THREE.Object3D;
  readonly clips: ReadonlyMap<Clip, THREE.AnimationClip>;
}

/**
 * Loads a character once and returns an independent instance per call
 * (own skeleton and own materials, so it can be recolored). Skinned meshes
 * are excluded from raycasts; give the instance a simple hitbox instead.
 */
export const loadCharacter = async (id: CharacterId): Promise<Character> => {
  const gltf = await load(id);
  const object = clone(gltf.scene);
  object.scale.setScalar(SCALE);
  object.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.raycast = () => {};
    o.material = Array.isArray(o.material)
      ? o.material.map((m: THREE.Material) => m.clone())
      : o.material.clone();
  });
  const clips = new Map<Clip, THREE.AnimationClip>();
  for (const c of gltf.animations) clips.set(c.name as Clip, c);
  return { object, clips };
};

/** Sets the color of every material named `name` (e.g. "Shirt", "Hair"). */
export const tint = (object: THREE.Object3D, name: string, color: number) => {
  object.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const mats: THREE.Material[] = Array.isArray(o.material)
      ? o.material
      : [o.material];
    for (const m of mats) {
      if (m.name === name && "color" in m && m.color instanceof THREE.Color) {
        m.color.setHex(color);
      }
    }
  });
};

/** Above this ground speed (m/s) a character plays Walk instead of Idle. */
const WALKING = 0.3;
const FADE = 0.25;

const live = new Set<(dt: number) => void>();

/**
 * Starts animating a character placed under `root` (the object that moves).
 * By default it plays Idle and switches to Walk while `root` moves, so code
 * that only moves `root` gets locomotion for free. `play` runs a one-shot
 * clip (SitDown, StandUp) and holds its last frame; `auto` returns to
 * Idle/Walk. Driven by tickCharacters() in the world's frame loop.
 */
export const animate = (c: Character, root: THREE.Object3D) => {
  const mixer = new THREE.AnimationMixer(c.object);
  let current: THREE.AnimationAction | undefined;
  let playing: Clip | undefined;
  let auto = true;
  const to = (clip: Clip, once = false) => {
    const source = c.clips.get(clip);
    if (!source) return;
    const next = mixer.clipAction(source);
    if (next === current) return;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.play();
    if (current) next.crossFadeFrom(current, FADE, false);
    current = next;
    playing = clip;
  };
  to("Idle");

  const last = root.getWorldPosition(new THREE.Vector3());
  const now = new THREE.Vector3();
  const step = (dt: number) => {
    root.getWorldPosition(now);
    const speed = dt > 0 ? Math.hypot(now.x - last.x, now.z - last.z) / dt : 0;
    last.copy(now);
    if (auto) to(speed > WALKING ? "Walk" : "Idle");
    mixer.update(dt);
  };
  live.add(step);

  return {
    get playing() {
      return playing;
    },
    play(clip: Clip) {
      auto = false;
      to(clip, true);
    },
    auto() {
      auto = true;
    },
    stop() {
      live.delete(step);
    },
  };
};

/** Advances every animated character. Called once per frame by the world. */
export const tickCharacters = (dt: number) => {
  for (const step of live) step(dt);
};
