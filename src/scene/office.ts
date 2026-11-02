import * as THREE from "three";

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

/** A desk with a monitor facing +z (the chair side). */
const desk = (x: number, z: number, screenColor = 0x1a2a3a) => {
  const g = new THREE.Group();
  g.add(box(1.6, 0.06, 0.8, 0x8a6a48, 0, 0.75, 0));
  for (const [lx, lz] of [
    [-0.75, -0.35],
    [0.75, -0.35],
    [-0.75, 0.35],
    [0.75, 0.35],
  ] as const) {
    g.add(box(0.05, 0.75, 0.05, 0x555555, lx, 0.375, lz));
  }
  g.add(box(0.7, 0.45, 0.04, 0x222222, 0, 1.08, -0.25));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.39),
    new THREE.MeshBasicMaterial({ color: screenColor }),
  );
  screen.position.set(0, 1.08, -0.228);
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
  for (const x of [-4, 0, 4]) {
    for (const z of [-2.5, 0.5]) {
      if (x === -4 && z === 0.5) continue;
      scene.add(desk(x, z).group);
    }
  }
  const mine = desk(-4, 0.5, 0x2a5a8a);
  scene.add(mine.group);

  return {
    scene,
    pcScreen: mine.screen,
    seat: {
      position: new THREE.Vector3(-4, 1.2, 1.05),
      lookAt: new THREE.Vector3(-4, 1.08, 0.25),
    },
    spawn: new THREE.Vector3(0, 1.6, 3.5),
  };
};
