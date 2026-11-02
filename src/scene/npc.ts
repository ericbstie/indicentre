import * as THREE from "three";

/** How close the player must be before an NPC turns to face them. */
const NOTICE = 3;
const TURN_SPEED = 4; // rad/s, roughly

export interface NpcLook {
  readonly shirt: number;
  readonly skin: number;
  readonly hair: number;
}

const part = (geo: THREE.BufferGeometry, color: number, y: number) => {
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
  m.position.y = y;
  return m;
};

/**
 * A low-poly coworker standing at the chair side of a desk (desks face +z).
 * `update` bobs it idly and turns it toward `target` (the player) when near.
 */
export const createNpc = (look: NpcLook, desk: THREE.Vector3) => {
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.add(
    part(new THREE.CapsuleGeometry(0.1, 0.75, 2, 6), 0x33363d, 0.48),
    part(new THREE.CapsuleGeometry(0.2, 0.4, 2, 8), look.shirt, 1.18),
    part(new THREE.IcosahedronGeometry(0.15, 1), look.skin, 1.62),
    part(new THREE.BoxGeometry(0.26, 0.08, 0.26), look.hair, 1.75),
  );
  for (const x of [-0.055, 0.055]) {
    const eye = part(new THREE.BoxGeometry(0.03, 0.03, 0.02), 0x111111, 1.65);
    eye.position.set(x, 1.65, 0.14);
    body.add(eye);
  }
  for (const x of [-0.27, 0.27]) {
    const arm = part(new THREE.BoxGeometry(0.08, 0.55, 0.1), look.shirt, 1.12);
    arm.position.x = x;
    body.add(arm);
  }
  group.add(body);
  group.position.set(desk.x + 0.3, 0, desk.z + 0.7);
  // Rest pose: facing the monitor (-z).
  const restYaw = Math.PI;
  group.rotation.y = restYaw;

  const phase = Math.random() * Math.PI * 2;
  let t = 0;
  const toTarget = new THREE.Vector3();

  return {
    group,
    update(dt: number, target: THREE.Vector3) {
      t += dt;
      body.position.y = Math.sin(t * 2 + phase) * 0.015;
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
