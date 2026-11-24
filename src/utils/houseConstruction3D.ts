import * as THREE from 'three';
import type { HouseConstructionWall } from '../types';

/**
 * Building primitives for the free-layout house editor.
 * Coordinates are in metres; each wall is generated as one solid mesh with
 * real door/window cut-outs instead of decorative planes placed on top.
 */

export type HouseOpeningKind = 'door' | 'window';

export interface HouseWallOpening {
  id: string;
  kind: HouseOpeningKind;
  /** Horizontal offset from the wall's left edge, in metres. */
  offset: number;
  /** Opening width, in metres. */
  width: number;
  /** Opening height, in metres. */
  height: number;
  /** Height of the opening's bottom edge from the floor. */
  sillHeight?: number;
}

export type HouseWallSegment = HouseConstructionWall & {
  openings?: HouseWallOpening[];
};

export interface HouseFloorDimensions {
  width: number;
  depth: number;
  thickness?: number;
}

export const HOUSE_BUILD_GRID = 0.25;
export const HOUSE_MIN_WALL_LENGTH = 0.5;
export const HOUSE_MIN_WALL_HEIGHT = 2.2;
export const HOUSE_MAX_WALL_HEIGHT = 4.5;
export const HOUSE_DEFAULT_WALL_HEIGHT = 2.8;
export const HOUSE_DEFAULT_WALL_THICKNESS = 0.16;

export function snapHouseMeasurement(value: number, grid = HOUSE_BUILD_GRID): number {
  if (!Number.isFinite(value) || grid <= 0) return 0;
  return Math.round(value / grid) * grid;
}

export function clampHouseWallHeight(height: number): number {
  return THREE.MathUtils.clamp(
    snapHouseMeasurement(height),
    HOUSE_MIN_WALL_HEIGHT,
    HOUSE_MAX_WALL_HEIGHT
  );
}

export function getHouseWallLength(wall: Pick<HouseWallSegment, 'start' | 'end'>): number {
  return Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
}

function normalizeOpening(opening: HouseWallOpening, wallLength: number, wallHeight: number) {
  const width = THREE.MathUtils.clamp(opening.width, 0.4, Math.max(0.4, wallLength - 0.1));
  const height = THREE.MathUtils.clamp(opening.height, 0.4, wallHeight - 0.1);
  const sillHeight = THREE.MathUtils.clamp(opening.sillHeight ?? 0, 0, wallHeight - height);
  const offset = THREE.MathUtils.clamp(opening.offset, 0, Math.max(0, wallLength - width));
  return { ...opening, offset, width, height, sillHeight };
}

/**
 * Creates a wall extrusion with true rectangular voids for doors/windows.
 * The returned mesh is centred around its local origin and faces local +Z.
 */
export function createHouseWallMesh(
  wall: HouseWallSegment,
  material: THREE.Material
): THREE.Mesh<THREE.ExtrudeGeometry, THREE.Material> {
  const length = getHouseWallLength(wall);
  const height = clampHouseWallHeight(wall.height);
  const thickness = THREE.MathUtils.clamp(wall.thickness, 0.08, 0.5);

  if (length < HOUSE_MIN_WALL_LENGTH) {
    throw new Error('A parede precisa ter pelo menos 0,5 m.');
  }

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.lineTo(0, height);
  shape.closePath();

  for (const rawOpening of wall.openings ?? []) {
    const opening = normalizeOpening(rawOpening, length, height);
    const hole = new THREE.Path();
    hole.moveTo(opening.offset, opening.sillHeight);
    hole.lineTo(opening.offset + opening.width, opening.sillHeight);
    hole.lineTo(opening.offset + opening.width, opening.sillHeight + opening.height);
    hole.lineTo(opening.offset, opening.sillHeight + opening.height);
    hole.closePath();
    shape.holes.push(hole);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 1,
    steps: 1,
  });
  geometry.translate(-length / 2, -height / 2, -thickness / 2);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `house-wall-${wall.id}`;

  // Realistic trim and infill make openings read as usable architectural details.
  for (const rawOpening of wall.openings ?? []) {
    const opening = normalizeOpening(rawOpening, length, height);
    const centerX = opening.offset + opening.width / 2 - length / 2;
    const centerY = opening.sillHeight + opening.height / 2 - height / 2;
    const frontZ = thickness / 2 + 0.018;
    const trimMaterial = new THREE.MeshStandardMaterial({
      color: opening.kind === 'door' ? 0x8b5a3c : 0xe8e1d8,
      roughness: 0.72,
    });
    const trimWidth = 0.055;
    const addTrim = (x: number, y: number, w: number, h: number) => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.075), trimMaterial);
      trim.position.set(x, y, frontZ);
      trim.castShadow = true;
      trim.receiveShadow = true;
      mesh.add(trim);
    };
    addTrim(centerX - opening.width / 2 - trimWidth / 2, centerY, trimWidth, opening.height + trimWidth * 2);
    addTrim(centerX + opening.width / 2 + trimWidth / 2, centerY, trimWidth, opening.height + trimWidth * 2);
    addTrim(centerX, centerY + opening.height / 2 + trimWidth / 2, opening.width + trimWidth * 2, trimWidth);

    if (opening.kind === 'door') {
      const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x986447, roughness: 0.68 });
      const doorLeaf = new THREE.Group();
      // The door is left slightly ajar so the opening connects visually to the outside.
      doorLeaf.position.set(centerX - opening.width / 2 + 0.055, centerY, frontZ - 0.045);
      doorLeaf.rotation.y = -0.62;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(Math.max(0.3, opening.width - 0.12), Math.max(0.3, opening.height - 0.08), 0.045),
        panelMaterial
      );
      panel.position.x = opening.width / 2 - 0.035;
      panel.castShadow = true;
      doorLeaf.add(panel);

      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xd6b56d, metalness: 0.72, roughness: 0.28 })
      );
      knob.position.set(opening.width * 0.32, -0.02, 0.025);
      doorLeaf.add(knob);
      mesh.add(doorLeaf);
    } else {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(Math.max(0.2, opening.width - 0.12), Math.max(0.2, opening.height - 0.12), 0.025),
        new THREE.MeshPhysicalMaterial({
          color: 0x9bd8f5,
          transparent: true,
          opacity: 0.38,
          roughness: 0.12,
          metalness: 0.08,
          transmission: 0.25,
        })
      );
      glass.position.set(centerX, centerY, frontZ - 0.045);
      mesh.add(glass);
      addTrim(centerX, centerY - opening.height / 2 - trimWidth / 2, opening.width + trimWidth * 2, trimWidth);
    }
  }

  mesh.userData = {
    constructionElement: 'wall',
    constructionId: wall.id,
    length,
    height,
    thickness,
    openings: (wall.openings ?? []).map((opening) => ({ ...opening })),
  };

  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  mesh.position.set((wall.start.x + wall.end.x) / 2, height / 2, (wall.start.z + wall.end.z) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A real, resizable floor slab for a room or the complete house footprint. */
export function createHouseFloorMesh(
  dimensions: HouseFloorDimensions,
  material: THREE.Material
): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  const width = THREE.MathUtils.clamp(snapHouseMeasurement(dimensions.width), 1, 40);
  const depth = THREE.MathUtils.clamp(snapHouseMeasurement(dimensions.depth), 1, 40);
  const thickness = THREE.MathUtils.clamp(dimensions.thickness ?? 0.12, 0.04, 0.5);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), material);
  mesh.name = 'house-custom-floor';
  mesh.position.y = -thickness / 2;
  mesh.receiveShadow = true;
  mesh.userData = {
    constructionElement: 'floor',
    width,
    depth,
    thickness,
  };
  return mesh;
}

/** Keeps openings inside the wall and prevents invalid negative dimensions. */
export function validateHouseWall(wall: HouseWallSegment): string[] {
  const issues: string[] = [];
  const length = getHouseWallLength(wall);
  if (length < HOUSE_MIN_WALL_LENGTH) issues.push('Parede muito curta.');
  if (wall.height < HOUSE_MIN_WALL_HEIGHT || wall.height > HOUSE_MAX_WALL_HEIGHT) {
    issues.push('Altura da parede fora do limite permitido.');
  }
  for (const opening of wall.openings ?? []) {
    if (opening.width <= 0 || opening.height <= 0) {
      issues.push(`Abertura "${opening.id}" possui dimensões inválidas.`);
      continue;
    }
    if (opening.offset < 0 || opening.offset + opening.width > length) {
      issues.push(`Abertura "${opening.id}" ultrapassa o comprimento da parede.`);
    }
    const sill = opening.sillHeight ?? 0;
    if (sill < 0 || sill + opening.height > wall.height) {
      issues.push(`Abertura "${opening.id}" ultrapassa a altura da parede.`);
    }
  }
  return issues;
}
