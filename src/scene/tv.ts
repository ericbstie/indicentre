import * as THREE from "three";
import { createTextScreen } from "./screenText.ts";

const W = 2.2;
const H = 1.24;

/** A wall-mounted TV facing +z with a text screen. Position the group. */
export const buildTv = () => {
  const group = new THREE.Group();
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.08, H + 0.08, 0.06),
    new THREE.MeshLambertMaterial({ color: 0x111111 }),
  );
  const screen = createTextScreen(W, H);
  screen.mesh.position.z = 0.031;
  group.add(bezel, screen.mesh);
  return { group, screen };
};
