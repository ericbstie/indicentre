import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type manifest from "../../assets/manifest.json";

/** A model listed in assets/manifest.json (served at /assets/models/<id>.glb). */
export type ModelId = keyof typeof manifest.models;

const loader = new GLTFLoader();
const cache = new Map<ModelId, Promise<THREE.Object3D>>();

/** Wraps `scene` so its bounding box is centered on x/z and rests on y = 0. */
const grounded = (scene: THREE.Object3D) => {
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  scene.position.set(-center.x, -box.min.y, -center.z);
  return new THREE.Group().add(scene);
};

/**
 * Loads a model once and returns a fresh clone per call. Clones share
 * geometry and materials, so many desks cost one upload. The model is
 * bottom-centered on its origin. Skinned models need SkeletonUtils.clone
 * instead (see docs/assets.md).
 */
export const loadModel = (id: ModelId): Promise<THREE.Object3D> => {
  let model = cache.get(id);
  if (!model) {
    model = loader
      .loadAsync(`/assets/models/${id}.glb`)
      .then((gltf) => grounded(gltf.scene));
    model.catch(() => cache.delete(id));
    cache.set(id, model);
  }
  return model.then((m) => m.clone());
};
