import * as THREE from "three";
import { loadModel, type ModelId } from "./models.ts";

export const ROOM = { width: 14, depth: 10, height: 3 } as const;

export interface Office {
  readonly scene: THREE.Scene;
  /** The player's monitor; interacting with it opens the desktop. */
  readonly pcScreen: THREE.Mesh;
  /** Where the camera sits when the player is at the PC. */
  readonly seat: {
    readonly position: THREE.Vector3;
    readonly lookAt: THREE.Vector3;
  };
  readonly spawn: THREE.Vector3;
  /** Coworker desk centers (not the player's), for NPCs and props. */
  readonly desks: ReadonlyArray<THREE.Vector3>;
}

const mat = (color: number) => new THREE.MeshLambertMaterial({ color });

const box = (
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
};

/** Kenney Furniture Kit models are about half real size. */
const FURNITURE_SCALE = 2;
export const DESK_TOP = 0.768;

/** Adds a scaled model to `parent` once it has loaded. */
export const place = (
  parent: THREE.Object3D,
  id: ModelId,
  x: number,
  y: number,
  z: number,
  rotY = 0,
) => {
  loadModel(id).then(
    (m) => {
      m.scale.setScalar(FURNITURE_SCALE);
      m.position.set(x, y, z);
      m.rotation.y = rotY;
      parent.add(m);
    },
    (err: unknown) => console.error(`model ${id} failed to load`, err),
  );
};

/**
 * A desk with a monitor facing +z (the chair side). Models stream in;
 * the screen plane exists immediately so interactions work from frame one.
 */
const desk = (x: number, z: number, mine = false) => {
  const g = new THREE.Group();
  place(g, "desk", 0, 0, 0);
  place(g, "monitor", 0, DESK_TOP, -0.15);
  place(g, "keyboard", 0, DESK_TOP, 0.15);
  place(g, "mouse", 0.32, DESK_TOP, 0.15);
  // Coworkers stand at +x (scene/npc.ts), so their chair is pushed aside.
  if (mine) place(g, "chair", 0, 0, 0.7, Math.PI);
  else place(g, "chair", -0.38, 0, 0.75, Math.PI + 0.3);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.42),
    new THREE.MeshBasicMaterial({ color: mine ? 0x2a5a8a : 0x1a2a3a }),
  );
  // Sits just in front of the Kenney monitor's panel, which leans back ~8°.
  screen.position.set(0, DESK_TOP + 0.335, -0.135);
  screen.rotation.x = -0.145;
  g.add(screen);
  g.position.set(x, 0, z);
  return { group: g, screen };
};

export const buildOffice = (): Office => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202024);
  scene.fog = new THREE.Fog(0x202024, 8, 22);

  const { width: W, depth: D, height: H } = ROOM;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(0x6b6458));
  floor.rotation.x = -Math.PI / 2;
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(0xd8d4c8));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = H;
  scene.add(
    floor,
    ceiling,
    box(W, H, 0.1, 0xb8b09a, 0, H / 2, -D / 2),
    box(W, H, 0.1, 0xb8b09a, 0, H / 2, D / 2),
    box(0.1, H, D, 0xa8a08a, -W / 2, H / 2, 0),
    box(0.1, H, D, 0xa8a08a, W / 2, H / 2, 0),
  );

  scene.add(new THREE.HemisphereLight(0xfff6e0, 0x404040, 1.6));
  for (const x of [-4, 0, 4]) {
    const tube = new THREE.PointLight(0xfff2d0, 6, 9);
    tube.position.set(x, H - 0.2, 0);
    scene.add(tube, box(1.2, 0.05, 0.2, 0xffffff, x, H - 0.03, 0));
  }

  // Rows of coworker desks; the player's desk is front-left.
  const desks: THREE.Vector3[] = [];
  for (const x of [-4, 0, 4]) {
    for (const z of [-2.5, 0.5]) {
      if (x === -4 && z === 0.5) continue;
      scene.add(desk(x, z).group);
      desks.push(new THREE.Vector3(x, 0, z));
    }
  }
  const mine = desk(-4, 0.5, true);
  scene.add(mine.group);

  return {
    scene,
    pcScreen: mine.screen,
    seat: {
      position: new THREE.Vector3(-4, 1.3, 1.25),
      lookAt: new THREE.Vector3(-4, 1.1, 0.46),
    },
    spawn: new THREE.Vector3(0, 1.6, 3.5),
    desks,
  };
};
