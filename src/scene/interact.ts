import * as THREE from "three";

const REACH = 2.2;

export interface Interactable {
  readonly object: THREE.Object3D;
  readonly label: string;
  readonly use: () => void;
}

/**
 * Center-of-screen raycast against registered objects. NPCs, the news TV,
 * the boss's office door etc. all register here with a label and a callback.
 */
export const createInteractions = (camera: THREE.Camera) => {
  const items: Interactable[] = [];
  const ray = new THREE.Raycaster(undefined, undefined, 0, REACH);
  const center = new THREE.Vector2(0, 0);
  let focused: Interactable | undefined;

  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyE" && focused) focused.use();
  });

  return {
    add(item: Interactable) {
      items.push(item);
    },
    /** Returns the label of whatever is under the crosshair, if anything. */
    update(active: boolean): string | undefined {
      focused = undefined;
      if (!active) return undefined;
      ray.setFromCamera(center, camera);
      const hit = ray.intersectObjects(
        items.map((i) => i.object),
        true,
      )[0];
      focused =
        hit &&
        items.find(
          (i) =>
            i.object === hit.object || i.object.getObjectById(hit.object.id),
        );
      return focused?.label;
    },
  };
};
