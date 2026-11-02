import * as THREE from "three";

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
