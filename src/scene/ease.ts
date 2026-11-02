import * as THREE from "three";

const SECONDS = 0.35;
const still =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Glides `camera` to a pose over a third of a second (ease-out) instead of
 * cutting. Snaps under reduced motion. A new glide replaces a running one.
 */
export const createCameraEase = (
  camera: THREE.Camera,
  onFrame: (fn: (dt: number) => void) => () => unknown,
) => {
  const fromP = new THREE.Vector3();
  const fromQ = new THREE.Quaternion();
  let stop = () => {};
  return (position: THREE.Vector3, quaternion: THREE.Quaternion) => {
    stop();
    if (still) {
      camera.position.copy(position);
      camera.quaternion.copy(quaternion);
      return;
    }
    fromP.copy(camera.position);
    fromQ.copy(camera.quaternion);
    let t = 0;
    const off = onFrame((dt) => {
      t = Math.min(1, t + dt / SECONDS);
      const k = 1 - (1 - t) ** 3;
      camera.position.lerpVectors(fromP, position, k);
      camera.quaternion.slerpQuaternions(fromQ, quaternion, k);
      if (t === 1) stop();
    });
    stop = () => {
      off();
      stop = () => {};
    };
  };
};
