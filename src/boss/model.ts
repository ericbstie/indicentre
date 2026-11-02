import * as THREE from "three";

const mat = (color: number) => new THREE.MeshLambertMaterial({ color });

/** Floor manager: short-sleeve shirt, a tie, a clipboard. Faces +z. */
export const buildBoss = () => {
  const g = new THREE.Group();
  const part = (geo: THREE.BufferGeometry, color: number, y: number) => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.y = y;
    g.add(m);
    return m;
  };
  part(new THREE.BoxGeometry(0.4, 0.85, 0.24), 0x2b2f3a, 0.425); // trousers
  part(new THREE.BoxGeometry(0.52, 0.6, 0.32), 0xe8e4d8, 1.15); // shirt
  part(new THREE.SphereGeometry(0.17, 16, 12), 0xb07850, 1.62); // head
  const tie = part(new THREE.BoxGeometry(0.07, 0.4, 0.02), 0xb02020, 1.15);
  tie.position.z = 0.17;
  const board = part(new THREE.BoxGeometry(0.24, 0.32, 0.02), 0x8a6a48, 1.05);
  board.position.set(0.3, 1.05, 0.2);
  board.rotation.x = -0.5;
  return g;
};

const SPEED = 1.4; // m/s, a manager's purposeful stride

/** Moves an object along straight lines on the floor, facing where it goes. */
export const createWalker = (obj: THREE.Object3D) => {
  let goal: THREE.Vector3 | undefined;
  let arrive: (() => void) | undefined;
  const step = new THREE.Vector3();
  let t = 0;
  const face = (p: THREE.Vector3) => {
    obj.rotation.y = Math.atan2(p.x - obj.position.x, p.z - obj.position.z);
  };

  return {
    get walking() {
      return goal !== undefined;
    },
    /** Resolves on arrival. A new call replaces the current goal. */
    walkTo(to: THREE.Vector3): Promise<void> {
      arrive?.();
      goal = to.clone().setY(obj.position.y);
      return new Promise((resolve) => (arrive = resolve));
    },
    /** Turn to face a point without moving. */
    face,
    update(dt: number) {
      if (!goal) return;
      t += dt;
      step.subVectors(goal, obj.position);
      const dist = step.length();
      const move = SPEED * dt;
      if (dist <= move) {
        obj.position.copy(goal);
        goal = undefined;
        const done = arrive;
        arrive = undefined;
        done?.();
        return;
      }
      face(goal);
      obj.position.addScaledVector(step, move / dist);
      obj.position.y = Math.abs(Math.sin(t * 9)) * 0.04; // bob
    },
  };
};
