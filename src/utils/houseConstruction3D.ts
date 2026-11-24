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
