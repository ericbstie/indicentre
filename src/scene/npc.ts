import * as THREE from "three";
import {
  animate,
  type CharacterId,
  loadCharacter,
  tint,
} from "./characters.ts";

/** How close the player must be before an NPC turns to face them. */
const NOTICE = 3;
const TURN_SPEED = 4; // rad/s, roughly

export interface NpcLook {
  readonly shirt: number;
  readonly skin: number;
  readonly hair: number;
  /** Which character model to wear. */
  readonly outfit: CharacterId;
}

/**
 * A coworker standing at the chair side of a desk (desks face +z). The
 * animated character streams in; the invisible hitbox exists at once for
 * interactions. `update` turns it toward `target` (the player) when near.
 */
export const createNpc = (look: NpcLook, desk: THREE.Vector3) => {
  const group = new THREE.Group();
  const hitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.8, 0.5),
    new THREE.MeshBasicMaterial(),
  );
  hitbox.position.y = 0.9;
  hitbox.visible = false;
  group.add(hitbox);
  loadCharacter(look.outfit).then(
    (c) => {
      tint(c.object, "Shirt", look.shirt);
      tint(c.object, "Skin", look.skin);
      tint(c.object, "Hair", look.hair);
      // The pack ships eyes and brows ("Face") near-white; draw them dark.
      tint(c.object, "Face", 0x111111);
      group.add(c.object);
      animate(c, group);
    },
    (err: unknown) => console.error("NPC character failed to load", err),
  );
  group.position.set(desk.x + 0.3, 0, desk.z + 0.7);
  // Rest pose: facing the monitor (-z).
  const restYaw = Math.PI;
  group.rotation.y = restYaw;

  const toTarget = new THREE.Vector3();

  return {
    group,
    update(dt: number, target: THREE.Vector3) {
      toTarget.subVectors(target, group.position).setY(0);
      const want =
        toTarget.length() < NOTICE
          ? Math.atan2(toTarget.x, toTarget.z)
          : restYaw;
      const diff = Math.atan2(
        Math.sin(want - group.rotation.y),
        Math.cos(want - group.rotation.y),
      );
      group.rotation.y += diff * Math.min(1, TURN_SPEED * dt);
    },
  };
};
