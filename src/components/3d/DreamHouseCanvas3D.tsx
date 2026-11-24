import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  AquariumLightMode,
  HouseFloorTheme,
  HouseConstructionWall,
  HouseFurnitureTransform,
  HouseRoomId,
  HouseWallTheme,
  PetType,
  SeasonalEventId,
} from '../../types';
import { HOUSE_FURNITURE_CATALOG } from '../../data/houseFurnitureCatalog';
import { AQUARIUM_SPECIES_CATALOG } from '../../data/initialData';
import { buildCompactRoamingPet, RoamingPetInstance } from '../../utils/petMesh3D';
import { createHouseWallMesh } from '../../utils/houseConstruction3D';
import {
  addCozyThreePointLights,
  detectSoftwareWebGL,
  disposeObject3D,
  loadCachedGlbInstance,
  setupCozyStudioRenderer,
} from '../../utils/threeCozyHelpers';

export type DreamHouseSkyMode = 'auto' | 'eclipse';

type ClimaticPhase = 'dawn' | 'day' | 'sunset' | 'night' | 'eclipse';

function resolveClimaticPhase(skyMode: DreamHouseSkyMode): ClimaticPhase {
  if (skyMode === 'eclipse') return 'eclipse';
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'sunset';
  return 'night';
}

function shadeHex(hex: string, factor: number): string {
  const c = new THREE.Color(hex || '#ec4899');
  if (factor >= 0) {
    c.lerp(new THREE.Color('#ffffff'), Math.min(0.85, factor));
  } else {
    c.lerp(new THREE.Color('#130726'), Math.min(0.85, -factor));
  }
  return `#${c.getHexString()}`;
}

export const DEFAULT_FURNITURE_TRANSFORMS: Record<string, HouseFurnitureTransform> = {
  // Sofas & Puffs
  'house-sofa': { x: -0.25, z: -0.95, rotY: 0 },
  'house-sofa-lshape': { x: -0.45, z: -0.9, rotY: 0 },
  'house-loveseat': { x: 0.4, z: -0.85, rotY: -0.2 },
  'house-beanbag': { x: 1.05, z: 0.55, rotY: 0.4 },
  'house-chaise': { x: 0.85, z: -0.55, rotY: -0.35 },
  // Mesas
  'house-coffee-table': { x: -0.2, z: 0.15, rotY: 0 },
  'house-dining-table': { x: -0.2, z: 0.1, rotY: 0 },
  'house-round-table': { x: 0.75, z: 0.25, rotY: 0 },
  'house-desk-study': { x: -1.15, z: -1.1, rotY: 0 },
  'house-nightstand': { x: 0.95, z: -1.15, rotY: 0 },
  'house-tea-table': { x: 0.95, z: 0.52, rotY: 0 },
  // Cadeiras
  'house-armchair-velvet': { x: 1.15, z: -0.2, rotY: -0.65 },
  'house-gamer-chair': { x: -1.1, z: -0.35, rotY: Math.PI },
  'house-dining-chair': { x: -0.2, z: 0.78, rotY: Math.PI },
  'house-bar-stool': { x: -0.35, z: -0.15, rotY: Math.PI },
  'house-rocking-chair': { x: 0.9, z: 0.45, rotY: -0.5 },
  // TVs & Cinema
  'house-tv-stand': { x: -0.28, z: -1.42, rotY: 0 },
  'house-tv-retro': { x: 1.15, z: -1.15, rotY: -0.3 },
  'house-projector': { x: 0.1, z: -1.45, rotY: 0 },
  // PCs & Setup
  'house-pc-gamer': { x: -1.1, z: -1.15, rotY: 0 },
  'house-pc-dual': { x: 0.55, z: -1.25, rotY: 0 },
  'house-laptop-station': { x: 1.05, z: -1.05, rotY: -0.25 },
  // Camas & Armarios
  'house-cozy-bed': { x: -0.25, z: -0.78, rotY: 0 },
  'house-canopy-bed': { x: 0.1, z: -0.78, rotY: 0 },
  'house-heart-bed': { x: -0.2, z: -0.78, rotY: 0 },
  'house-wardrobe': { x: -1.52, z: -0.75, rotY: Math.PI / 2 },
  'house-vanity': { x: 1.32, z: -1.1, rotY: -0.35 },
  // Cozinha
  'house-kitchen-island': { x: -0.35, z: -0.82, rotY: 0 },
  'house-fridge': { x: -1.45, z: -1.2, rotY: 0 },
  'house-stove': { x: 0.4, z: -1.28, rotY: 0 },
  'house-sink-cabinet': { x: -0.45, z: -1.28, rotY: 0 },
  'house-coffee-bar': { x: 1.15, z: -1.22, rotY: -0.2 },
  'house-pet-bowl': { x: 1.45, z: 0.55, rotY: 0 },
  // Banheiro & Spa
  'house-bathtub': { x: -0.95, z: 0.35, rotY: Math.PI / 2 },
  'house-jacuzzi': { x: -0.75, z: 0.25, rotY: 0 },
  'house-bathroom-vanity': { x: 1.25, z: 0.15, rotY: -Math.PI / 2 },
  // Decoracao
  'house-rug': { x: 0, z: 0.25, rotY: 0 },
  'house-rug-heart': { x: 0, z: 0.45, rotY: 0 },
  'house-fireplace': { x: -1.65, z: 0.15, rotY: Math.PI / 2 },
  'house-piano': { x: 1.22, z: 0.45, rotY: -0.65 },
  'house-bookshelf': { x: -1.52, z: -1.25, rotY: 0 },
  'house-mini-aquarium': { x: 1.28, z: -0.95, rotY: -0.45 },
  // Iluminacao
  'house-lamp': { x: 1.2, z: -1.25, rotY: 0 },
  'house-heart-lamp': { x: -1.25, z: -1.32, rotY: 0.25 },
  'house-moon-lamp': { x: 1.25, z: 0.85, rotY: -0.2 },
  // Plantas
  'house-plant': { x: -1.62, z: -1.32, rotY: 0.2 },
  'house-bonsai-sakura': { x: 1.4, z: -0.4, rotY: 0 },
  'house-cactus': { x: -1.5, z: 0.85, rotY: 0 },
  // Varanda
  'house-balcony-bench': { x: -0.75, z: -0.7, rotY: 0 },
  'house-balcony-swing': { x: 1.0, z: 0.15, rotY: -0.45 },
  'house-telescope': { x: 1.15, z: -1.18, rotY: -0.55 },
  'house-bbq-grill': { x: -1.35, z: -0.75, rotY: 0.35 },
};

const FURNITURE_TARGET_HEIGHTS: Record<string, number> = {
  'house-sofa': 0.95,
  'house-sofa-lshape': 0.95,
  'house-loveseat': 0.92,
  'house-beanbag': 0.62,
  'house-chaise': 0.85,
  'house-coffee-table': 0.5,
  'house-dining-table': 0.78,
  'house-round-table': 0.76,
  'house-desk-study': 0.82,
  'house-nightstand': 0.62,
  'house-tea-table': 0.92,
  'house-armchair-velvet': 0.9,
  'house-gamer-chair': 1.18,
  'house-dining-chair': 0.88,
  'house-bar-stool': 0.86,
  'house-rocking-chair': 1.02,
  'house-tv-stand': 1.28,
  'house-tv-retro': 0.95,
  'house-projector': 1.65,
  'house-pc-gamer': 1.28,
  'house-pc-dual': 1.28,
  'house-laptop-station': 1.04,
  'house-cozy-bed': 1.05,
  'house-canopy-bed': 1.9,
  'house-heart-bed': 1.18,
  'house-wardrobe': 1.78,
  'house-vanity': 1.45,
  'house-kitchen-island': 1.05,
  'house-fridge': 1.72,
  'house-stove': 1.02,
  'house-sink-cabinet': 1.05,
  'house-coffee-bar': 1.05,
  'house-pet-bowl': 0.38,
  'house-bathtub': 0.72,
  'house-jacuzzi': 0.75,
  'house-bathroom-vanity': 1.38,
  'house-rug': 0.08,
  'house-rug-heart': 0.08,
  'house-fireplace': 1.75,
  'house-piano': 1.15,
  'house-bookshelf': 1.65,
  'house-mini-aquarium': 1.22,
  'house-lamp': 1.55,
  'house-heart-lamp': 0.95,
  'house-moon-lamp': 0.9,
  'house-plant': 1.12,
  'house-bonsai-sakura': 0.92,
  'house-cactus': 0.72,
  'house-balcony-bench': 0.9,
  'house-balcony-swing': 1.85,
  'house-telescope': 1.25,
  'house-bbq-grill': 1.15,
};

interface DreamHouseCanvas3DProps {
  activeRoom: HouseRoomId;
  wallTheme: HouseWallTheme;
  floorTheme: HouseFloorTheme;
  customWallHex?: string;
  customFloorHex?: string;
  customCeilingHex?: string;
  footprintWidth?: number;
  footprintDepth?: number;
  wallHeight?: number;
  customWalls?: HouseConstructionWall[];
  showCeiling?: boolean;
  furnitureColors?: Record<string, string>;
  skyMode?: DreamHouseSkyMode;
  viewMode?: 'interior' | 'exterior';
  lightsOn: boolean;
  fireplaceLit: boolean;
  placedFurnitureIds: string[];
  treeLevel: number;
  activeSeasonalEvent?: SeasonalEventId;
  furnitureTransforms?: Record<string, HouseFurnitureTransform>;
  isEditMode?: boolean;
  wallBuildMode?: boolean;
  selectedFurnitureId?: string | null;
  furnitureGlbUrls?: Record<string, string>;
  ownedPets?: PetType[];
  deadPets?: PetType[];
  petColors?: Partial<Record<PetType, string>>;
  petGlbUrl?: string;
  petHunger?: number;
  petThirst?: number;
  petLastFedTimestamp?: number;
  aquarium?: {
    activeFishIds: string[];
    lightMode: AquariumLightMode;
    bubblesActive: boolean;
  };
  onTapAquarium?: () => void;
  onInteractFurniture?: (furnitureId: string) => void;
  onSelectFurniture?: (furnitureId: string | null) => void;
  onMoveFurniture?: (furnitureId: string, transform: HouseFurnitureTransform) => void;
  onCreateWall?: (wall: HouseConstructionWall) => void;
}

function createFloorTexture(
  theme: HouseFloorTheme,
  maxAniso: number,
  customFloorHex?: string,
  isBathroomSpa?: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (isBathroomSpa && !customFloorHex) {
      const size = 64;
      for (let x = 0; x < 512; x += size) {
        for (let y = 0; y < 512; y += size) {
          const even = (x / size + y / size) % 2 === 0;
          ctx.fillStyle = even ? '#d8f3ff' : '#c7d2fe';
          ctx.fillRect(x, y, size, size);
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, size, size);
        }
      }
    } else if (customFloorHex) {
      const base = customFloorHex;
      const lighter = shadeHex(base, 0.16);
      const darker = shadeHex(base, -0.28);
      if (theme === 'checkered') {
        const size = 64;
        for (let x = 0; x < 512; x += size) {
          for (let y = 0; y < 512; y += size) {
            const even = (x / size + y / size) % 2 === 0;
            ctx.fillStyle = even ? lighter : darker;
            ctx.fillRect(x, y, size, size);
          }
        }
      } else {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 512, 512);
        const plankH = 64;
        for (let y = 0; y < 512; y += plankH) {
          ctx.fillStyle = (y / plankH) % 2 === 0 ? lighter : base;
          ctx.fillRect(0, y, 512, plankH - 3);
          ctx.fillStyle = darker;
          ctx.fillRect(0, y + plankH - 3, 512, 3);
        }
      }
    } else if (theme === 'wood') {
      ctx.fillStyle = '#8b5a3c';
      ctx.fillRect(0, 0, 512, 512);
      const plankH = 64;
      for (let y = 0; y < 512; y += plankH) {
        ctx.fillStyle = (y / plankH) % 2 === 0 ? '#9c6848' : '#835438';
        ctx.fillRect(0, y, 512, plankH - 3);
        ctx.fillStyle = 'rgba(255, 228, 200, 0.1)';
        ctx.fillRect(0, y + 6, 512, 4);
        ctx.fillStyle = '#5e3924';
        ctx.fillRect(0, y + plankH - 3, 512, 3);
        const offset = ((y / plankH) % 2) * 128;
        ctx.fillRect(128 + offset, y, 3, plankH);
        ctx.fillRect(384 - offset, y, 3, plankH);
      }
    } else if (theme === 'marble') {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#53387a');
      grad.addColorStop(0.5, '#6a4999');
      grad.addColorStop(1, '#472f6b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(249, 168, 212, 0.34)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 75, 0);
        ctx.bezierCurveTo(i * 75 + 40, 170, i * 75 - 35, 340, i * 75 + 20, 512);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 2;
      for (let g = 0; g <= 512; g += 128) {
        ctx.strokeRect(g, 0, 128, 512);
        ctx.strokeRect(0, g, 512, 128);
      }
    } else if (theme === 'velvet') {
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 320);
      grad.addColorStop(0, '#9d2c6d');
      grad.addColorStop(1, '#5d1841');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(253, 242, 248, 0.14)';
      for (let i = 0; i < 360; i++) {
        const x = (i * 73) % 512;
        const y = (i * 137) % 512;
        ctx.fillRect(x, y, 2, 2);
      }
    } else {
      const size = 64;
      for (let x = 0; x < 512; x += size) {
        for (let y = 0; y < 512; y += size) {
          const even = x / size + y / size;
          ctx.fillStyle = even % 2 === 0 ? '#6b439e' : '#3a225e';
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAniso);
  return tex;
}

function createWallTexture(
  theme: HouseWallTheme,
  maxAniso: number,
  customWallHex?: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const palette: Record<HouseWallTheme, [string, string, string]> = {
      lavender: ['#6f42b5', '#4c2887', 'rgba(250, 232, 255, 0.18)'],
      midnight: ['#38266b', '#221447', 'rgba(216, 180, 254, 0.18)'],
      rosewood: ['#9d2859', '#6e193d', 'rgba(253, 207, 232, 0.22)'],
      starlight: ['#393680', '#242159', 'rgba(253, 224, 71, 0.28)'],
      christmas: ['#227646', '#165230', 'rgba(253, 224, 71, 0.24)'],
      halloween: ['#6e258c', '#451359', 'rgba(251, 146, 60, 0.24)'],
    };
    const [topC, botC, stripeC] = customWallHex
      ? [shadeHex(customWallHex, 0.12), shadeHex(customWallHex, -0.18), 'rgba(255, 245, 252, 0.16)']
      : palette[theme] || palette.lavender;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, topC);
    grad.addColorStop(0.7, botC);
    grad.addColorStop(1, customWallHex ? shadeHex(customWallHex, -0.3) : '#3b2163');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = stripeC;
    for (let x = 16; x < 512; x += 32) {
      ctx.fillRect(x, 0, 7, 360);
    }

    if (theme === 'starlight' && !customWallHex) {
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 97 + 23) % 500;
        const sy = (i * 53 + 17) % 330;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3) + 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(255, 245, 250, 0.16)';
    ctx.fillRect(0, 360, 512, 152);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.55)';
    ctx.fillRect(0, 355, 512, 7);
    ctx.strokeStyle = 'rgba(251, 207, 232, 0.34)';
    ctx.lineWidth = 3;
    for (let px = 24; px < 512; px += 120) {
      ctx.strokeRect(px, 380, 92, 108);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAniso);
  return tex;
}

function tagFurnitureRecursive(root: THREE.Object3D, furnitureId: string) {
  root.userData.furnitureId = furnitureId;
  root.traverse((ch) => {
    ch.userData.furnitureId = furnitureId;
  });
}

function buildSkyDomeGradientTexture(phase: ClimaticPhase): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (phase === 'day') {
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.45, '#93c5fd');
      grad.addColorStop(0.72, '#ddd6fe');
      grad.addColorStop(1, '#fce7f3');
    } else if (phase === 'dawn') {
      grad.addColorStop(0, '#4338ca');
      grad.addColorStop(0.4, '#c084fc');
      grad.addColorStop(0.68, '#fb7185');
      grad.addColorStop(1, '#fed7aa');
    } else if (phase === 'sunset') {
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.35, '#9333ea');
      grad.addColorStop(0.62, '#f43f5e');
      grad.addColorStop(0.84, '#fb923c');
      grad.addColorStop(1, '#fde68a');
    } else if (phase === 'eclipse') {
      grad.addColorStop(0, '#090318');
      grad.addColorStop(0.45, '#2e1065');
      grad.addColorStop(0.75, '#701a75');
      grad.addColorStop(1, '#be185d');
    } else {
      // night
      grad.addColorStop(0, '#0f0729');
      grad.addColorStop(0.45, '#261459');
      grad.addColorStop(0.78, '#4c1d95');
      grad.addColorStop(1, '#701a75');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildClimaticSkyBackdrop(phase: ClimaticPhase) {
  const skyGroup = new THREE.Group();
  const clouds: { mesh: THREE.Group; speed: number; baseX: number }[] = [];
  const birds: { group: THREE.Group; wingL: THREE.Mesh; wingR: THREE.Mesh; phaseOffset: number; radius: number; speed: number; y: number }[] = [];
  let starPoints: THREE.Points | null = null;
  let eclipseHalo: THREE.Mesh | null = null;

  const skyTex = buildSkyDomeGradientTexture(phase);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(26, 32, 24),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false })
  );
  skyGroup.add(dome);

  // Soft Ground Horizon Mist Ring below dollhouse
  const horizonColor =
    phase === 'day'
      ? 0xf3e8ff
      : phase === 'sunset'
      ? 0xfbcfe8
      : phase === 'dawn'
      ? 0xfde68a
      : 0x3b1c6d;
  const horizonPlane = new THREE.Mesh(
    new THREE.CircleGeometry(24, 48),
    new THREE.MeshBasicMaterial({
      color: horizonColor,
      transparent: true,
      opacity: phase === 'day' ? 0.38 : 0.22,
      depthWrite: false,
    })
  );
  horizonPlane.rotation.x = -Math.PI / 2;
  horizonPlane.position.y = -3.4;
  skyGroup.add(horizonPlane);

  // Sun, Moon or Solar Eclipse Celestial Body
  if (phase === 'day' || phase === 'dawn' || phase === 'sunset') {
    const sunColor = phase === 'day' ? 0xfef08a : phase === 'dawn' ? 0xfdba74 : 0xfb7185;
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 24, 24),
      new THREE.MeshBasicMaterial({ color: sunColor })
    );
    sun.position.set(phase === 'day' ? 6.8 : -7.5, phase === 'day' ? 8.2 : 4.2, -13);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.75, 24, 24),
      new THREE.MeshBasicMaterial({ color: sunColor, transparent: true, opacity: 0.24, depthWrite: false })
    );
    sun.add(halo);
    skyGroup.add(sun);
  } else if (phase === 'eclipse') {
    const disc = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 28, 28),
      new THREE.MeshBasicMaterial({ color: 0x090214 })
    );
    disc.position.set(-4.2, 6.2, -13);
    eclipseHalo = new THREE.Mesh(
      new THREE.RingGeometry(1.26, 2.05, 48),
      new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      })
    );
    eclipseHalo.position.set(-4.2, 6.2, -13.08);
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 2.8, 48),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    outerRing.position.set(-4.2, 6.2, -13.12);
    skyGroup.add(disc, eclipseHalo, outerRing);
  } else {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
    );
    moon.position.set(6.2, 7.6, -13);
    const moonGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xe9d5ff, transparent: true, opacity: 0.22, depthWrite: false })
    );
    moon.add(moonGlow);
    skyGroup.add(moon);
  }

  // Stars during night / eclipse / dawn
  if (phase === 'night' || phase === 'eclipse' || phase === 'dawn') {
    const count = phase === 'night' ? 140 : 85;
    const starPos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.48;
      const r = 20 + Math.random() * 3;
      starPos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      starPos[i * 3 + 1] = Math.cos(phi) * r * 0.8 + 1.2;
      starPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfef9c3,
      size: 0.24,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    starPoints = new THREE.Points(geo, mat);
    skyGroup.add(starPoints);
  }

  // Stylized Fluffy Puffy 3D Clouds
  const cloudColor =
    phase === 'day'
      ? 0xffffff
      : phase === 'sunset'
      ? 0xfecdd3
      : phase === 'dawn'
      ? 0xfde68a
      : 0x6d28d9;
  const cloudMat = new THREE.MeshStandardMaterial({
    color: cloudColor,
    emissive: cloudColor,
    emissiveIntensity: phase === 'night' || phase === 'eclipse' ? 0.16 : 0.32,
    roughness: 0.72,
    transparent: true,
    opacity: phase === 'night' || phase === 'eclipse' ? 0.55 : 0.92,
  });

  const cloudDefs = [
    { x: -7.5, y: 5.5, z: -10.5, scale: 1.0, speed: 0.16 },
    { x: 1.5, y: 6.4, z: -12.0, scale: 1.25, speed: 0.12 },
    { x: 8.0, y: 4.8, z: -9.5, scale: 0.9, speed: 0.2 },
    { x: -3.2, y: 3.9, z: -13.5, scale: 1.1, speed: 0.14 },
  ];
  cloudDefs.forEach((cd) => {
    const cg = new THREE.Group();
    const puffs: [number, number, number, number][] = [
      [0, 0, 0, 0.75],
      [-0.65, -0.1, 0.08, 0.54],
      [0.68, -0.08, -0.05, 0.58],
      [0.18, 0.35, 0, 0.48],
    ];
    puffs.forEach(([px, py, pz, pr]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(pr, 16, 14), cloudMat);
      m.position.set(px, py, pz);
      cg.add(m);
    });
    cg.position.set(cd.x, cd.y, cd.z);
    cg.scale.setScalar(cd.scale);
    skyGroup.add(cg);
    clouds.push({ mesh: cg, speed: cd.speed, baseX: cd.x });
  });

  // Gliding 3D Birds during Day, Dawn, Sunset
  if (phase === 'day' || phase === 'dawn' || phase === 'sunset') {
    const birdMat = new THREE.MeshBasicMaterial({
      color: phase === 'day' ? 0x312e81 : 0x4c1d95,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 4; i++) {
      const bg = new THREE.Group();
      const wingGeo = new THREE.BoxGeometry(0.28, 0.02, 0.09);
      const wingL = new THREE.Mesh(wingGeo, birdMat);
      wingL.position.x = -0.13;
      const wingR = new THREE.Mesh(wingGeo, birdMat);
      wingR.position.x = 0.13;
      bg.add(wingL, wingR);
      skyGroup.add(bg);
      birds.push({
        group: bg,
        wingL,
        wingR,
        phaseOffset: i * 1.6,
        radius: 6.5 + i * 1.4,
        speed: 0.22 + i * 0.04,
        y: 3.4 + (i % 2) * 1.1,
      });
    }
  }

  return { skyGroup, clouds, birds, starPoints, eclipseHalo, skyTex };
}

function buildCozyFurniture(
  id: string,
  lightsOn: boolean,
  fireplaceLit: boolean,
  customColorHex?: string
): {
  group: THREE.Group;
  emberMeshes: THREE.Mesh[];
  glowMeshes: THREE.Mesh[];
  flameLight?: THREE.PointLight;
  swingGroup?: THREE.Group;
  baseY: number;
} {
  const g = new THREE.Group();
  const emberMeshes: THREE.Mesh[] = [];
  const glowMeshes: THREE.Mesh[] = [];
  let flameLight: THREE.PointLight | undefined;
  let swingGroup: THREE.Group | undefined;

  const catalogItem = HOUSE_FURNITURE_CATALOG.find((c) => c.id === id);
  const chosenHex = customColorHex || catalogItem?.accentHex || '#f472b6';

  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(chosenHex),
    roughness: 0.62,
    metalness: 0.04,
  });
  const primaryLightMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shadeHex(chosenHex, 0.25)),
    roughness: 0.6,
    metalness: 0.04,
  });
  const velvetLilac = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    roughness: 0.66,
    metalness: 0.04,
  });
  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x7c4a2d,
    roughness: 0.58,
    metalness: 0.05,
  });
  const woodWarm = new THREE.MeshStandardMaterial({
    color: 0xb07248,
    roughness: 0.58,
    metalness: 0.04,
  });
  const goldTrim = new THREE.MeshStandardMaterial({
    color: 0xfcd34d,
    roughness: 0.28,
    metalness: 0.78,
  });
  const creamMat = new THREE.MeshStandardMaterial({
    color: 0xfff5fa,
    roughness: 0.62,
    metalness: 0.03,
  });
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.68,
    metalness: 0.04,
  });

  const def = DEFAULT_FURNITURE_TRANSFORMS[id] || { x: 0, z: 0, rotY: 0 };
  let baseY = 0;

  // --- SOFAS & PUFFS ---
  if (id === 'house-sofa' || id === 'house-loveseat') {
    const isLove = id === 'house-loveseat';
    const w = isLove ? 1.52 : 2.05;
    const base = new THREE.Mesh(new RoundedBoxGeometry(w, 0.24, 0.88, 4, 0.07), woodDark);
    base.position.y = 0.22;
    base.castShadow = true;
    g.add(base);
    [
      [-w * 0.43, 0.06, -0.32],
      [w * 0.43, 0.06, -0.32],
      [-w * 0.43, 0.06, 0.32],
      [w * 0.43, 0.06, 0.32],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.028, 0.12, 14), goldTrim);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      g.add(leg);
    });
    const seats = isLove ? [-0.34, 0.34] : [-0.63, 0, 0.63];
    seats.forEach((sx) => {
      const seat = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.2, 0.78, 4, 0.07), primaryMat);
      seat.position.set(sx, 0.42, 0.02);
      seat.castShadow = true;
      g.add(seat);
    });
    const back = new THREE.Mesh(new RoundedBoxGeometry(w - 0.04, 0.64, 0.24, 4, 0.08), primaryMat);
    back.position.set(0, 0.68, -0.34);
    back.castShadow = true;
    const armL = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.46, 0.86, 4, 0.08), primaryMat);
    armL.position.set(-(w / 2 - 0.06), 0.48, 0);
    armL.castShadow = true;
    const armR = armL.clone();
    armR.position.x = w / 2 - 0.06;
    const pillL = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.28, 0.16, 4, 0.06), creamMat);
    pillL.position.set(-(w * 0.32), 0.63, -0.14);
    pillL.rotation.set(-0.22, 0.32, 0.14);
    const pillR = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.28, 0.16, 4, 0.06), primaryLightMat);
    pillR.position.set(w * 0.32, 0.63, -0.14);
    pillR.rotation.set(-0.22, -0.32, -0.14);
    g.add(back, armL, armR, pillL, pillR);
  } else if (id === 'house-sofa-lshape') {
    const mainSeat = new THREE.Mesh(new RoundedBoxGeometry(2.05, 0.34, 0.84, 4, 0.08), primaryMat);
    mainSeat.position.set(0, 0.28, -0.32);
    mainSeat.castShadow = true;
    const chaiseSeat = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.34, 1.56, 4, 0.08), primaryMat);
    chaiseSeat.position.set(-0.6, 0.28, 0.04);
    chaiseSeat.castShadow = true;
    const back = new THREE.Mesh(new RoundedBoxGeometry(2.05, 0.64, 0.24, 4, 0.08), primaryMat);
    back.position.set(0, 0.64, -0.66);
    back.castShadow = true;
    const armR = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.46, 0.84, 4, 0.08), primaryMat);
    armR.position.set(0.95, 0.44, -0.32);
    const p1 = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.28, 0.16, 4, 0.06), creamMat);
    p1.position.set(0.55, 0.56, -0.45);
    const p2 = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.28, 0.16, 4, 0.06), primaryLightMat);
    p2.position.set(-0.55, 0.56, -0.45);
    g.add(mainSeat, chaiseSeat, back, armR, p1, p2);
  } else if (id === 'house-beanbag') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 26, 22), primaryMat);
    body.scale.set(1.15, 0.72, 1.15);
    body.position.y = 0.28;
    body.castShadow = true;
    const topPuff = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), primaryLightMat);
    topPuff.scale.set(1.1, 0.65, 1.1);
    topPuff.position.set(0, 0.48, -0.14);
    g.add(body, topPuff);
  } else if (id === 'house-chaise') {
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.26, 1.62, 4, 0.08), primaryMat);
    seat.position.set(0, 0.34, 0);
    seat.castShadow = true;
    const backCurve = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.62, 0.26, 4, 0.09), primaryMat);
    backCurve.position.set(0, 0.62, -0.68);
    backCurve.rotation.x = -0.25;
    backCurve.castShadow = true;
    const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.66, 16), creamMat);
    bolster.rotation.z = Math.PI / 2;
    bolster.position.set(0, 0.52, -0.48);
    [[-0.32, 0.11, -0.66], [0.32, 0.11, -0.66], [-0.32, 0.11, 0.66], [0.32, 0.11, 0.66]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.22, 12), goldTrim);
      leg.position.set(x, y, z);
      g.add(leg);
    });
    g.add(seat, backCurve, bolster);

  // --- MESAS ---
  } else if (id === 'house-coffee-table') {
    const top = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.07, 0.68, 4, 0.03), primaryLightMat);
    top.position.y = 0.42;
    top.castShadow = true;
    const shelf = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.04, 0.54, 3, 0.02), woodWarm);
    shelf.position.y = 0.18;
    [[-0.48, 0.21, -0.24], [0.48, 0.21, -0.24], [-0.48, 0.21, 0.24], [0.48, 0.21, 0.24]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.42, 12), woodDark);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      g.add(leg);
    });
    const book = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.05, 0.18, 2, 0.01), primaryMat);
    book.position.set(-0.22, 0.48, 0.06);
    g.add(top, shelf, book);
  } else if (id === 'house-dining-table' || id === 'house-desk-study') {
    const isDesk = id === 'house-desk-study';
    const w = isDesk ? 1.38 : 1.56;
    const d = isDesk ? 0.68 : 0.96;
    const top = new THREE.Mesh(new RoundedBoxGeometry(w, 0.08, d, 4, 0.03), primaryLightMat);
    top.position.y = 0.74;
    top.castShadow = true;
    [[-w * 0.42, 0.36, -d * 0.38], [w * 0.42, 0.36, -d * 0.38], [-w * 0.42, 0.36, d * 0.38], [w * 0.42, 0.36, d * 0.38]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.028, 0.72, 12), woodDark);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      g.add(leg);
    });
    if (isDesk) {
      const drawers = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.46, d - 0.1, 3, 0.03), primaryMat);
      drawers.position.set(w * 0.28, 0.48, 0);
      drawers.castShadow = true;
      g.add(drawers);
    } else {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.18, 16), primaryMat);
      vase.position.y = 0.87;
      g.add(vase);
    }
    g.add(top);
  } else if (id === 'house-round-table') {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.72, 20), goldTrim);
    ped.position.y = 0.36;
    ped.castShadow = true;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.07, 32), primaryLightMat);
    top.position.y = 0.74;
    top.castShadow = true;
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.03, 20), creamMat);
    plate.position.set(0.14, 0.79, 0.08);
    g.add(ped, top, plate);
  } else if (id === 'house-nightstand') {
    const box = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.56, 0.48, 4, 0.05), primaryMat);
    box.position.y = 0.3;
    box.castShadow = true;
    const d1 = new THREE.Mesh(new RoundedBoxGeometry(0.48, 0.18, 0.04, 2, 0.02), creamMat);
    d1.position.set(0, 0.41, 0.24);
    const d2 = d1.clone();
    d2.position.y = 0.2;
    const k1 = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), goldTrim);
    k1.position.set(0, 0.41, 0.27);
    const k2 = k1.clone();
    k2.position.y = 0.2;
    g.add(box, d1, d2, k1, k2);
  } else if (id === 'house-tea-table') {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.65, 20), goldTrim);
    ped.position.y = 0.325;
    ped.castShadow = true;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.065, 36), creamMat);
    top.position.y = 0.68;
    top.castShadow = true;
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.14, 24), primaryMat);
    cake.position.set(0, 0.78, 0);
    const icing = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.04, 24), creamMat);
    icing.position.set(0, 0.85, 0);
    const berry = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 14), primaryLightMat);
    berry.position.set(0, 0.9, 0);
    g.add(ped, top, cake, icing, berry);

  // --- CADEIRAS ---
  } else if (id === 'house-armchair-velvet') {
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.22, 24), primaryMat);
    seat.position.y = 0.36;
    seat.castShadow = true;
    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.42, 0.54, 24, 1, false, -Math.PI * 0.7, Math.PI * 1.4),
      primaryMat
    );
    shell.position.y = 0.64;
    shell.rotation.y = Math.PI;
    shell.castShadow = true;
    [[-0.24, 0.13, -0.2], [0.24, 0.13, -0.2], [-0.24, 0.13, 0.2], [0.24, 0.13, 0.2]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.018, 0.26, 10), goldTrim);
      leg.position.set(x, y, z);
      g.add(leg);
    });
    g.add(seat, shell);
  } else if (id === 'house-gamer-chair') {
    const starBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 6), stoneMat);
    starBase.position.y = 0.06;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.34, 12), stoneMat);
    stem.position.y = 0.23;
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.14, 0.54, 4, 0.04), primaryMat);
    seat.position.y = 0.44;
    seat.castShadow = true;
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.78, 0.12, 4, 0.05), primaryMat);
    back.position.set(0, 0.84, -0.22);
    back.rotation.x = -0.12;
    back.castShadow = true;
    const pillow = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.16, 0.09, 3, 0.04), creamMat);
    pillow.position.set(0, 1.08, -0.16);
    g.add(starBase, stem, seat, back, pillow);
  } else if (id === 'house-dining-chair') {
    [-0.34, 0.34].forEach((offsetX) => {
      const ch = new THREE.Group();
      ch.position.x = offsetX;
      const seat = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.09, 0.46, 3, 0.03), primaryMat);
      seat.position.y = 0.44;
      seat.castShadow = true;
      const back = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.48, 0.08, 3, 0.03), primaryMat);
      back.position.set(0, 0.7, -0.2);
      back.castShadow = true;
      [[-0.18, 0.21, -0.18], [0.18, 0.21, -0.18], [-0.18, 0.21, 0.18], [0.18, 0.21, 0.18]].forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.018, 0.42, 10), woodDark);
        leg.position.set(x, y, z);
        ch.add(leg);
      });
      ch.add(seat, back);
      g.add(ch);
    });
  } else if (id === 'house-bar-stool') {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.04, 24), goldTrim);
    foot.position.y = 0.02;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.68, 14), goldTrim);
    pole.position.y = 0.36;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 10, 24), goldTrim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.26;
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.12, 24), primaryMat);
    seat.position.y = 0.74;
    seat.castShadow = true;
    g.add(foot, pole, ring, seat);
  } else if (id === 'house-rocking-chair') {
    [-0.28, 0.28].forEach((rx) => {
      const runner = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 10, 24, Math.PI * 0.45), woodDark);
      runner.position.set(rx, 0.56, 0);
      runner.rotation.set(0, Math.PI / 2, Math.PI * 1.27);
      g.add(runner);
    });
    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.12, 0.56, 4, 0.04), primaryMat);
    seat.position.y = 0.42;
    seat.castShadow = true;
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.64, 0.1, 4, 0.04), primaryMat);
    back.position.set(0, 0.76, -0.26);
    back.rotation.x = -0.18;
    back.castShadow = true;
    g.add(seat, back);

  // --- TVS & CINEMA ---
  } else if (id === 'house-tv-stand') {
    const consoleBody = new THREE.Mesh(new RoundedBoxGeometry(1.58, 0.42, 0.46, 4, 0.05), woodWarm);
    consoleBody.position.y = 0.24;
    consoleBody.castShadow = true;
    const drawerL = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.26, 0.04, 3, 0.02), primaryMat);
    drawerL.position.set(-0.38, 0.24, 0.23);
    const drawerR = drawerL.clone();
    drawerR.position.x = 0.38;
    const tvFrame = new THREE.Mesh(
      new RoundedBoxGeometry(1.24, 0.72, 0.07, 3, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.56 })
    );
    tvFrame.position.set(0, 0.86, 0.02);
    tvFrame.castShadow = true;
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.12, 0.6),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(chosenHex),
        emissive: new THREE.Color(chosenHex),
        emissiveIntensity: lightsOn ? 0.85 : 0.45,
        roughness: 0.55,
      })
    );
    screen.position.set(0, 0.86, 0.058);
    glowMeshes.push(screen);
    const tvStand = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.08, 0.22, 2, 0.02), goldTrim);
    tvStand.position.set(0, 0.48, 0.02);
    g.add(consoleBody, drawerL, drawerR, tvFrame, screen, tvStand);
  } else if (id === 'house-tv-retro') {
    const stand = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.36, 0.46, 3, 0.04), woodWarm);
    stand.position.y = 0.2;
    const box = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.54, 0.44, 4, 0.08), primaryMat);
    box.position.y = 0.65;
    box.castShadow = true;
    const crt = new THREE.Mesh(
      new RoundedBoxGeometry(0.5, 0.38, 0.05, 3, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x7dd3fc, emissiveIntensity: lightsOn ? 0.7 : 0.3, roughness: 0.45 })
    );
    crt.position.set(-0.05, 0.66, 0.21);
    glowMeshes.push(crt);
    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.26, 8), goldTrim);
    antL.position.set(-0.1, 1.0, 0);
    antL.rotation.z = 0.4;
    const antR = antL.clone();
    antR.position.x = 0.1;
    antR.rotation.z = -0.4;
    g.add(stand, box, crt, antL, antR);
  } else if (id === 'house-projector') {
    const bar = new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.1, 0.12, 3, 0.03), primaryMat);
    bar.position.set(0, 1.68, -0.1);
    const canvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.62, 1.04),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: new THREE.Color(chosenHex),
        emissiveIntensity: lightsOn ? 0.55 : 0.35,
        roughness: 0.55,
      })
    );
    canvasMesh.position.set(0, 1.12, -0.06);
    glowMeshes.push(canvasMesh);
    const proj = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.14, 0.28, 3, 0.04), creamMat);
    proj.position.set(0, 0.36, 0.68);
    const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.18, 0.34, 12), stoneMat);
    tripod.position.set(0, 0.17, 0.68);
    g.add(bar, canvasMesh, proj, tripod);

  // --- PCS & SETUP ---
  } else if (id === 'house-pc-gamer' || id === 'house-pc-dual' || id === 'house-laptop-station') {
    const isDual = id === 'house-pc-dual';
    const isLaptop = id === 'house-laptop-station';
    const deskW = isDual ? 1.65 : isLaptop ? 1.12 : 1.42;
    const deskTop = new THREE.Mesh(new RoundedBoxGeometry(deskW, 0.07, 0.68, 4, 0.03), woodDark);
    deskTop.position.y = 0.74;
    deskTop.castShadow = true;
    [[-deskW * 0.44, 0.36, -0.26], [deskW * 0.44, 0.36, -0.26], [-deskW * 0.44, 0.36, 0.26], [deskW * 0.44, 0.36, 0.26]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.025, 0.72, 12), stoneMat);
      leg.position.set(x, y, z);
      g.add(leg);
    });
    if (isLaptop) {
      const baseLap = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.03, 0.28, 2, 0.01), creamMat);
      baseLap.position.set(0, 0.79, 0.06);
      const lidLap = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.28, 0.025, 2, 0.01),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), emissive: new THREE.Color(chosenHex), emissiveIntensity: 0.65, roughness: 0.5 })
      );
      lidLap.position.set(0, 0.92, -0.07);
      lidLap.rotation.x = -0.15;
      glowMeshes.push(lidLap);
      g.add(baseLap, lidLap);
    } else {
      const screenOffsets = isDual ? [-0.36, 0.36] : [-0.12];
      screenOffsets.forEach((sx) => {
        const mon = new THREE.Mesh(
          new RoundedBoxGeometry(isDual ? 0.62 : 0.78, 0.42, 0.04, 3, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
        );
        mon.position.set(sx, 1.02, -0.14);
        const scr = new THREE.Mesh(
          new THREE.PlaneGeometry(isDual ? 0.56 : 0.72, 0.36),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), emissive: new THREE.Color(chosenHex), emissiveIntensity: 0.85, roughness: 0.5 })
        );
        scr.position.set(sx, 1.02, -0.118);
        glowMeshes.push(scr);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.14, 10), stoneMat);
        neck.position.set(sx, 0.81, -0.16);
        g.add(mon, scr, neck);
      });
      const tower = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.46, 0.44, 3, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b, emissive: new THREE.Color(chosenHex), emissiveIntensity: 0.42, roughness: 0.45 })
      );
      tower.position.set(deskW * 0.36, 1.0, -0.04);
      tower.castShadow = true;
      glowMeshes.push(tower);
      const kb = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.03, 0.16, 2, 0.01), primaryMat);
      kb.position.set(-0.1, 0.79, 0.14);
      g.add(tower, kb);
    }
    g.add(deskTop);

  // --- CAMAS & ARMARIOS ---
  } else if (id === 'house-cozy-bed' || id === 'house-canopy-bed' || id === 'house-heart-bed') {
    const isCanopy = id === 'house-canopy-bed';
    const isHeart = id === 'house-heart-bed';
    const frame = new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.26, 2.05, 4, 0.06), woodDark);
    frame.position.y = 0.22;
    frame.castShadow = true;
    const mattress = new THREE.Mesh(new RoundedBoxGeometry(1.62, 0.22, 1.92, 4, 0.07), creamMat);
    mattress.position.y = 0.44;
    const blanket = new THREE.Mesh(new RoundedBoxGeometry(1.66, 0.24, 1.28, 4, 0.08), primaryMat);
    blanket.position.set(0, 0.46, 0.34);
    blanket.castShadow = true;
    const headboard = new THREE.Mesh(
      new RoundedBoxGeometry(1.75, isHeart ? 0.96 : 0.85, 0.14, 4, 0.06),
      isHeart ? primaryMat : woodWarm
    );
    headboard.position.set(0, 0.65, -0.98);
    headboard.castShadow = true;
    const pilL = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.16, 0.36, 4, 0.07), creamMat);
    pilL.position.set(-0.42, 0.6, -0.68);
    const pilR = pilL.clone();
    pilR.position.x = 0.42;
    g.add(frame, mattress, blanket, headboard, pilL, pilR);
    if (isHeart) {
      const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), primaryLightMat);
      lobeL.scale.set(1, 1, 0.35);
      lobeL.position.set(-0.22, 1.12, -0.96);
      const lobeR = lobeL.clone();
      lobeR.position.x = 0.22;
      g.add(lobeL, lobeR);
    }
    if (isCanopy) {
      [[-0.82, 0.96, -0.96], [0.82, 0.96, -0.96], [-0.82, 0.96, 0.96], [0.82, 0.96, 0.96]].forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.88, 14), woodDark);
        post.position.set(px, py, pz);
        post.castShadow = true;
        g.add(post);
      });
      const canopyTop = new THREE.Mesh(
        new RoundedBoxGeometry(1.74, 0.09, 2.0, 3, 0.04),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(shadeHex(chosenHex, 0.3)), roughness: 0.56, transparent: true, opacity: 0.86 })
      );
      canopyTop.position.y = 1.9;
      g.add(canopyTop);
    }
  } else if (id === 'house-wardrobe') {
    const cabinet = new THREE.Mesh(new RoundedBoxGeometry(1.06, 1.72, 0.52, 4, 0.05), primaryMat);
    cabinet.position.y = 0.9;
    cabinet.castShadow = true;
    const topCrown = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.1, 0.58, 3, 0.03), creamMat);
    topCrown.position.y = 1.78;
    const doorL = new THREE.Mesh(new RoundedBoxGeometry(0.46, 1.44, 0.04, 3, 0.02), creamMat);
    doorL.position.set(-0.25, 0.9, 0.26);
    const doorR = doorL.clone();
    doorR.position.x = 0.25;
    const handleL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), goldTrim);
    handleL.position.set(-0.07, 0.92, 0.3);
    const handleR = handleL.clone();
    handleR.position.x = 0.07;
    g.add(cabinet, topCrown, doorL, doorR, handleL, handleR);
  } else if (id === 'house-vanity') {
    const table = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.11, 0.48, 4, 0.04), creamMat);
    table.position.y = 0.72;
    table.castShadow = true;
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 32),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.85, roughness: 0.14 })
    );
    mirror.position.set(0, 1.16, -0.16);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.032, 14, 32), goldTrim);
    rim.position.set(0, 1.16, -0.16);
    [[-0.4, 0.35, -0.18], [0.4, 0.35, -0.18], [-0.4, 0.35, 0.18], [0.4, 0.35, 0.18]].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.022, 0.7, 12), goldTrim);
      leg.position.set(lx, ly, lz);
      g.add(leg);
    });
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 24), primaryMat);
    stool.position.set(0, 0.21, 0.54);
    stool.castShadow = true;
    g.add(table, mirror, rim, stool);

  // --- COZINHA ---
  } else if (id === 'house-kitchen-island') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.85, 0.78, 4, 0.06), woodDark);
    body.position.y = 0.425;
    body.castShadow = true;
    const counter = new THREE.Mesh(new RoundedBoxGeometry(1.88, 0.1, 0.88, 4, 0.04), primaryLightMat);
    counter.position.y = 0.89;
    counter.castShadow = true;
    const mug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 18), primaryMat);
    mug1.position.set(-0.3, 1.0, 0.1);
    const mug2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 18), velvetLilac);
    mug2.position.set(-0.1, 1.0, 0.12);
    g.add(body, counter, mug1, mug2);
  } else if (id === 'house-fridge') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.76, 1.66, 0.68, 5, 0.09), primaryMat);
    body.position.y = 0.86;
    body.castShadow = true;
    const split = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.03, 0.04, 2, 0.01), creamMat);
    split.position.set(0, 1.06, 0.34);
    const h1 = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.34, 0.05, 2, 0.02), goldTrim);
    h1.position.set(0.24, 1.32, 0.36);
    const h2 = h1.clone();
    h2.position.y = 0.72;
    g.add(body, split, h1, h2);
  } else if (id === 'house-stove') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.88, 0.66, 4, 0.05), primaryMat);
    body.position.y = 0.44;
    body.castShadow = true;
    const top = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.05, 0.66, 3, 0.02), stoneMat);
    top.position.y = 0.9;
    const ovenWin = new THREE.Mesh(
      new RoundedBoxGeometry(0.54, 0.38, 0.04, 2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0xf97316, emissiveIntensity: lightsOn ? 0.4 : 0.1, roughness: 0.4 })
    );
    ovenWin.position.set(0, 0.42, 0.33);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.13, 0.14, 18), goldTrim);
    pot.position.set(-0.16, 1.0, 0.08);
    g.add(body, top, ovenWin, pot);
  } else if (id === 'house-sink-cabinet') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.84, 0.64, 4, 0.05), primaryMat);
    body.position.y = 0.42;
    body.castShadow = true;
    const counter = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.06, 0.68, 3, 0.02), creamMat);
    counter.position.y = 0.86;
    const faucet = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 10, 20, Math.PI), goldTrim);
    faucet.position.set(0, 0.96, -0.18);
    g.add(body, counter, faucet);
  } else if (id === 'house-coffee-bar') {
    const counter = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.78, 0.48, 4, 0.05), creamMat);
    counter.position.y = 0.39;
    counter.castShadow = true;
    const topBoard = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.07, 0.52, 3, 0.025), woodWarm);
    topBoard.position.y = 0.8;
    const espressoBody = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.32, 0.24, 3, 0.04), primaryMat);
    espressoBody.position.set(-0.18, 0.99, -0.05);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.11, 16), creamMat);
    cup.position.set(-0.18, 0.89, 0.11);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 16), velvetLilac);
    jar.position.set(0.22, 0.92, 0);
    g.add(counter, topBoard, espressoBody, cup, jar);
  } else if (id === 'house-pet-bowl') {
    baseY = 0.014;
    const mat = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.024, 0.42, 3, 0.02), creamMat);
    mat.receiveShadow = true;
    const bowlFood = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 20), primaryMat);
    bowlFood.position.set(-0.19, 0.055, 0);
    bowlFood.castShadow = true;
    const kibble = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 })
    );
    kibble.position.set(-0.19, 0.085, 0);
    const bowlWater = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.09, 20), primaryLightMat);
    bowlWater.position.set(0.19, 0.055, 0);
    bowlWater.castShadow = true;
    const waterDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.118, 0.118, 0.015, 20),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.16,
        transparent: true,
        opacity: 0.88,
      })
    );
    waterDisc.position.set(0.19, 0.095, 0);
    glowMeshes.push(waterDisc);
    g.add(mat, bowlFood, kibble, bowlWater, waterDisc);

  // --- BANHEIRO & SPA ---
  } else if (id === 'house-bathtub' || id === 'house-jacuzzi') {
    const isJac = id === 'house-jacuzzi';
    const outer = new THREE.Mesh(
      isJac ? new THREE.CylinderGeometry(0.82, 0.78, 0.66, 28) : new RoundedBoxGeometry(1.42, 0.58, 0.78, 5, 0.14),
      isJac ? primaryMat : creamMat
    );
    outer.position.y = 0.34;
    outer.castShadow = true;
    const water = new THREE.Mesh(
      isJac ? new THREE.CylinderGeometry(0.7, 0.7, 0.06, 28) : new RoundedBoxGeometry(1.22, 0.08, 0.6, 3, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: isJac ? new THREE.Color(chosenHex) : 0x38bdf8,
        emissiveIntensity: lightsOn ? 0.55 : 0.25,
        roughness: 0.18,
        transparent: true,
        opacity: 0.86,
      })
    );
    water.position.y = 0.62;
    glowMeshes.push(water);
    const duck = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), goldTrim);
    duck.position.set(0.2, 0.68, 0);
    g.add(outer, water, duck);
  } else if (id === 'house-bathroom-vanity') {
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.76, 0.48, 4, 0.05), primaryMat);
    cab.position.y = 0.38;
    cab.castShadow = true;
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.14, 24), creamMat);
    basin.position.y = 0.82;
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(0.28, 28),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.85, roughness: 0.14 })
    );
    mirror.position.set(0, 1.24, -0.18);
    g.add(cab, basin, mirror);

  // --- DECORACAO ---
  } else if (id === 'house-rug' || id === 'house-rug-heart') {
    baseY = 0.018;
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.2, 0.024, 48),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), roughness: 0.72 })
    );
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.84, 0.85, 0.028, 48),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(shadeHex(chosenHex, 0.28)), roughness: 0.7 })
    );
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.43, 0.032, 40),
      new THREE.MeshStandardMaterial({ color: 0xfff5fa, roughness: 0.68 })
    );
    outer.receiveShadow = true;
    inner.receiveShadow = true;
    center.receiveShadow = true;
    g.add(outer, inner, center);
  } else if (id === 'house-fireplace') {
    const hearth = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.13, 0.58, 3, 0.04), stoneMat);
    hearth.position.y = 0.065;
    const pillarL = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.95, 0.44, 3, 0.04), stoneMat);
    pillarL.position.set(-0.5, 0.55, 0);
    const pillarR = pillarL.clone();
    pillarR.position.x = 0.5;
    const mantel = new THREE.Mesh(new RoundedBoxGeometry(1.44, 0.15, 0.54, 4, 0.05), woodDark);
    mantel.position.y = 1.06;
    const chimney = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.85, 0.4, 3, 0.05), primaryMat);
    chimney.position.y = 1.54;
    const firebox = new THREE.Mesh(
      new RoundedBoxGeometry(0.76, 0.76, 0.34, 2, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72 })
    );
    firebox.position.set(0, 0.5, -0.05);
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 14), woodWarm);
    log1.rotation.z = Math.PI / 2;
    log1.position.set(0, 0.18, 0.02);
    g.add(hearth, pillarL, pillarR, mantel, chimney, firebox, log1);
    if (fireplaceLit) {
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0xf97316,
        emissiveIntensity: 1.5,
        roughness: 0.55,
      });
      for (let f = 0; f < 3; f++) {
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.085 - f * 0.01, 14, 14), flameMat);
        flame.scale.set(0.85, 1.85 + f * 0.2, 0.85);
        flame.position.set((f - 1) * 0.14, 0.32, 0.05);
        g.add(flame);
        emberMeshes.push(flame);
      }
      flameLight = new THREE.PointLight(0xfb923c, 1.55, 5.0);
      flameLight.position.set(0, 0.45, 0.25);
      g.add(flameLight);
    }
  } else if (id === 'house-piano') {
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.38, 0.76, 4, 0.06), primaryMat);
    body.position.y = 0.72;
    body.castShadow = true;
    const keys = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.08, 0.22, 3, 0.02), creamMat);
    keys.position.set(0, 0.7, 0.42);
    const lid = new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.05, 0.72, 3, 0.02), primaryMat);
    lid.position.set(0, 1.06, -0.15);
    lid.rotation.x = -0.45;
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 12), goldTrim);
    stand.position.set(0.35, 0.96, 0.05);
    [[-0.46, 0.27, -0.28], [0.46, 0.27, -0.28], [-0.46, 0.27, 0.28], [0.46, 0.27, 0.28]].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.026, 0.54, 14), woodDark);
      leg.position.set(lx, ly, lz);
      g.add(leg);
    });
    const bench = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.09, 0.28, 3, 0.03), primaryLightMat);
    bench.position.set(0, 0.42, 0.78);
    g.add(body, keys, lid, stand, bench);
  } else if (id === 'house-bookshelf') {
    const frame = new THREE.Mesh(new RoundedBoxGeometry(0.95, 1.65, 0.36, 4, 0.05), primaryMat);
    frame.position.y = 0.825;
    frame.castShadow = true;
    g.add(frame);
    const bookColors = [0xf43f5e, 0x38bdf8, 0xfbbf24, 0xc084fc, 0x34d399];
    [0.35, 0.78, 1.2].forEach((sy, sIdx) => {
      const shelf = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.045, 0.38, 2, 0.015), woodDark);
      shelf.position.set(0, sy, 0.02);
      g.add(shelf);
      for (let b = 0; b < 5; b++) {
        const bk = new THREE.Mesh(
          new RoundedBoxGeometry(0.1, 0.26 + ((b + sIdx) % 2) * 0.06, 0.24, 2, 0.02),
          new THREE.MeshStandardMaterial({ color: bookColors[(b + sIdx) % bookColors.length], roughness: 0.58 })
        );
        bk.position.set(-0.32 + b * 0.15, sy + 0.16, 0.04);
        g.add(bk);
      }
    });
  } else if (id === 'house-mini-aquarium') {
    const stand = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.66, 0.46, 4, 0.05), primaryMat);
    stand.position.y = 0.33;
    stand.castShadow = true;
    const tank = new THREE.Mesh(
      new RoundedBoxGeometry(0.84, 0.52, 0.38, 3, 0.03),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: lightsOn ? 0.58 : 0.25,
        roughness: 0.2,
        transparent: true,
        opacity: 0.78,
      })
    );
    tank.position.y = 0.92;
    glowMeshes.push(tank);
    g.add(stand, tank);

  // --- ILUMINACAO ---
  } else if (id === 'house-lamp') {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 24), goldTrim);
    foot.position.y = 0.03;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 1.38, 16), goldTrim);
    pole.position.y = 0.72;
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.3, 0.34, 28, 1, true),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(chosenHex),
        emissive: lightsOn ? new THREE.Color(chosenHex) : new THREE.Color(0x000000),
        emissiveIntensity: lightsOn ? 0.95 : 0,
        roughness: 0.55,
        side: THREE.DoubleSide,
      })
    );
    shade.position.y = 1.42;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), goldTrim);
    cap.position.y = 1.6;
    if (lightsOn) {
      const lampLight = new THREE.PointLight(0xfde68a, 1.25, 4.8);
      lampLight.position.y = 1.38;
      g.add(lampLight);
    }
    g.add(foot, pole, shade, cap);
  } else if (id === 'house-heart-lamp') {
    const nightTable = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.54, 0.44, 4, 0.05), creamMat);
    nightTable.position.y = 0.27;
    const baseStand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.06, 18), goldTrim);
    baseStand.position.y = 0.57;
    const neonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(chosenHex),
      emissive: new THREE.Color(chosenHex),
      emissiveIntensity: lightsOn ? 1.2 : 0.55,
      roughness: 0.55,
    });
    const lobeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 18), neonMat);
    lobeL.position.set(-0.075, 0.82, 0);
    const lobeR = lobeL.clone();
    lobeR.position.x = 0.075;
    const bottomHeart = new THREE.Mesh(new THREE.ConeGeometry(0.175, 0.24, 18), neonMat);
    bottomHeart.rotation.z = Math.PI;
    bottomHeart.position.set(0, 0.71, 0);
    glowMeshes.push(lobeL, lobeR, bottomHeart);
    if (lightsOn) {
      const heartGlow = new THREE.PointLight(new THREE.Color(chosenHex), 0.95, 3.2);
      heartGlow.position.set(0, 0.82, 0.18);
      g.add(heartGlow);
    }
    g.add(nightTable, baseStand, lobeL, lobeR, bottomHeart);
  } else if (id === 'house-moon-lamp') {
    const stand = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.44, 0.42, 3, 0.04), woodWarm);
    stand.position.y = 0.22;
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 16), goldTrim);
    cradle.position.y = 0.48;
    const moonBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 24, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(chosenHex),
        emissive: new THREE.Color(chosenHex),
        emissiveIntensity: lightsOn ? 1.15 : 0.4,
        roughness: 0.5,
      })
    );
    moonBall.position.y = 0.72;
    glowMeshes.push(moonBall);
    g.add(stand, cradle, moonBall);

  // --- PLANTAS ---
  } else if (id === 'house-plant' || id === 'house-bonsai-sakura' || id === 'house-cactus') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.34, 24), creamMat);
    pot.position.y = 0.17;
    pot.castShadow = true;
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 20), woodDark);
    soil.position.y = 0.33;
    g.add(pot, soil);
    if (id === 'house-cactus') {
      [-0.08, 0, 0.09].forEach((cx, i) => {
        const cac = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.065, 0.18 + i * 0.06, 8, 12),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), roughness: 0.62 })
        );
        cac.position.set(cx, 0.45 + i * 0.03, (i - 1) * 0.04);
        cac.castShadow = true;
        g.add(cac);
      });
    } else if (id === 'house-bonsai-sakura') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.38, 12), woodDark);
      trunk.position.y = 0.5;
      trunk.rotation.z = 0.15;
      const sakuraMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), roughness: 0.58 });
      [[0, 0.74, 0, 0.24], [-0.16, 0.68, 0.08, 0.17], [0.16, 0.7, -0.06, 0.18]].forEach(([x, y, z, r]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 14), sakuraMat);
        puff.position.set(x, y, z);
        puff.castShadow = true;
        g.add(puff);
      });
      g.add(trunk);
    } else {
      const leafMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(chosenHex), roughness: 0.58 });
      const leafConfigs: [number, number, number, number, number, number][] = [
        [0, 0.62, 0.04, -0.3, 0, 0],
        [-0.14, 0.56, -0.06, -0.5, 0.55, 0.3],
        [0.16, 0.58, 0.08, -0.42, -0.6, -0.25],
        [0.02, 0.72, -0.1, 0.35, 0.2, 0],
        [-0.08, 0.48, 0.14, -0.65, 0.25, 0.15],
      ];
      leafConfigs.forEach(([lx, ly, lz, rx, ry, rz]) => {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.34, 8), woodDark);
        stem.position.set(lx * 0.5, ly - 0.14, lz * 0.5);
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), leafMat);
        leaf.scale.set(1.1, 0.28, 1.35);
        leaf.position.set(lx, ly, lz);
        leaf.rotation.set(rx, ry, rz);
        leaf.castShadow = true;
        g.add(stem, leaf);
      });
    }

  // --- VARANDA ---
  } else if (id === 'house-balcony-bench') {
    const seat = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.1, 0.48, 3, 0.04), primaryMat);
    seat.position.y = 0.42;
    seat.castShadow = true;
    const back = new THREE.Mesh(new RoundedBoxGeometry(1.28, 0.45, 0.09, 3, 0.04), primaryMat);
    back.position.set(0, 0.72, -0.22);
    back.rotation.x = -0.15;
    [-0.56, 0.56].forEach((lx) => {
      const leg = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.42, 0.46, 3, 0.03), woodDark);
      leg.position.set(lx, 0.21, 0);
      g.add(leg);
    });
    g.add(seat, back);
  } else if (id === 'house-balcony-swing') {
    const standL = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.052, 1.85, 14), woodDark);
    standL.position.set(-0.62, 0.92, 0);
    const standR = standL.clone();
    standR.position.x = 0.62;
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 14), woodDark);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.y = 1.82;
    const pivot = new THREE.Group();
    pivot.position.y = 1.82;
    [-0.36, 0.36].forEach((rx) => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.25, 10), goldTrim);
      rope.position.set(rx, -0.62, 0);
      pivot.add(rope);
    });
    const bench = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.1, 0.42, 4, 0.045), primaryMat);
    bench.position.y = -1.24;
    bench.castShadow = true;
    pivot.add(bench);
    swingGroup = pivot;
    g.add(standL, standR, topBar, pivot);
  } else if (id === 'house-telescope') {
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), goldTrim);
    hub.position.y = 0.82;
    [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].forEach((ang) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.88, 10), woodDark);
      leg.position.set(Math.cos(ang) * 0.16, 0.42, Math.sin(ang) * 0.16);
      leg.rotation.z = Math.cos(ang) * 0.24;
      leg.rotation.x = -Math.sin(ang) * 0.24;
      g.add(leg);
    });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.095, 0.76, 18), primaryMat);
    tube.position.set(0, 0.98, 0);
    tube.rotation.x = 1.08;
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.088, 0.04, 18),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7, roughness: 0.55 })
    );
    lens.position.set(0, 1.15, -0.31);
    lens.rotation.x = 1.08;
    g.add(hub, tube, lens);
  } else if (id === 'house-bbq-grill') {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), primaryMat);
    bowl.position.y = 0.88;
    bowl.castShadow = true;
    const grate = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 20), stoneMat);
    grate.position.y = 0.88;
    const ember = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.1, roughness: 0.6 })
    );
    ember.position.y = 0.85;
    emberMeshes.push(ember);
    [[-0.22, 0.38, -0.16], [0.22, 0.38, -0.16], [0, 0.38, 0.22]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.76, 10), stoneMat);
      leg.position.set(x, y, z);
      g.add(leg);
    });
    g.add(bowl, grate, ember);
  } else {
    // Generic fallback stylized cozy pedestal + heart crystal if ever unmapped
    const fallback = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.65, 0.65, 4, 0.08), primaryMat);
    fallback.position.y = 0.325;
    fallback.castShadow = true;
    g.add(fallback);
  }

  g.position.set(def.x, baseY, def.z);
  g.rotation.y = def.rotY;
  tagFurnitureRecursive(g, id);

  return { group: g, emberMeshes, glowMeshes, flameLight, swingGroup, baseY };
}

function isUnsupportedGlbUrl(url?: string): boolean {
  const clean = (url || '').trim().toLowerCase();
  if (!clean) return true;
  return (
    clean === 'https://supabase.co' ||
    clean === 'https://supabase.co/' ||
    clean.includes('skfb.ly/') ||
    clean.includes('sketchfab.com/')
  );
}

function buildEmbeddedSalaAquarium(
  aquarium: { activeFishIds: string[]; lightMode: AquariumLightMode; bubblesActive: boolean } | undefined,
  lightsOn: boolean
) {
  const aqGroup = new THREE.Group();
  aqGroup.position.set(-2.12, 0, -2.06);

  const stand = new THREE.Mesh(
    new RoundedBoxGeometry(1.52, 0.58, 0.56, 4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x3b1c6d, roughness: 0.55, metalness: 0.1 })
  );
  stand.position.y = 0.29;
  stand.castShadow = true;
  stand.receiveShadow = true;
  aqGroup.add(stand);

  const trim = new THREE.Mesh(
    new RoundedBoxGeometry(1.56, 0.05, 0.6, 3, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.3, metalness: 0.72 })
  );
  trim.position.y = 0.59;
  aqGroup.add(trim);

  const mode = aquarium?.lightMode || 'bioluminescent';
  const waterHex =
    mode === 'coral'
      ? 0xf472b6
      : mode === 'moonlight'
      ? 0x6366f1
      : mode === 'sunlight'
      ? 0x38bdf8
      : 0x2dd4bf;

  const tankBox = new THREE.Mesh(
    new RoundedBoxGeometry(1.42, 0.74, 0.48, 3, 0.03),
    new THREE.MeshStandardMaterial({
      color: waterHex,
      emissive: waterHex,
      emissiveIntensity: lightsOn ? 0.38 : 0.22,
      roughness: 0.16,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    })
  );
  tankBox.position.y = 0.99;
  aqGroup.add(tankBox);

  const sandBed = new THREE.Mesh(
    new RoundedBoxGeometry(1.34, 0.06, 0.4, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8 })
  );
  sandBed.position.y = 0.65;
  aqGroup.add(sandBed);

  // Corais decorativos no fundo
  [[-0.45, 0.75, -0.06, 0xf472b6], [0.42, 0.76, 0.05, 0xc084fc]].forEach(([cx, cy, cz, cHex]) => {
    const coral = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: cHex as number, roughness: 0.58 })
    );
    coral.position.set(cx as number, cy as number, cz as number);
    aqGroup.add(coral);
  });

  const activeIds = (aquarium?.activeFishIds || ['clownfish', 'betta', 'angelfish']).slice(0, 8);
  const fishNodes: { mesh: THREE.Group; phase: number; speed: number; radiusX: number; baseY: number }[] = [];

  activeIds.forEach((fId, idx) => {
    const spec = AQUARIUM_SPECIES_CATALOG.find((s) => s.id === fId) || AQUARIUM_SPECIES_CATALOG[0];
    const fishGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.colorHex || '#f97316'),
      roughness: 0.4,
      metalness: 0.1,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentHex || '#ffffff'),
      roughness: 0.45,
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), bodyMat);
    body.scale.set(1.55, 0.95, 0.7);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.06, 6), accentMat);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.075;
    fishGroup.add(body, tail);
    fishGroup.scale.setScalar(Math.min(1.15, Math.max(0.75, spec.scale * 0.85)));

    const baseY = 0.78 + (idx % 4) * 0.1;
    fishGroup.position.set((idx % 2 === 0 ? -0.2 : 0.2), baseY, (idx % 3 - 1) * 0.08);
    aqGroup.add(fishGroup);
    fishNodes.push({
      mesh: fishGroup,
      phase: idx * 1.3,
      speed: 0.65 + (idx % 3) * 0.22,
      radiusX: 0.46 - (idx % 2) * 0.12,
      baseY,
    });
  });

  const bubbleNodes: { mesh: THREE.Mesh; offset: number; x: number; z: number }[] = [];
  if (aquarium?.bubblesActive !== false) {
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0xbae6fd,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.72,
    });
    const bubbleGeo = new THREE.SphereGeometry(0.016, 8, 8);
    for (let b = 0; b < 8; b++) {
      const bm = new THREE.Mesh(bubbleGeo, bubbleMat);
      const bx = -0.5 + (b % 4) * 0.32;
      const bz = (b % 2 === 0 ? -0.06 : 0.06);
      bm.position.set(bx, 0.7, bz);
      aqGroup.add(bm);
      bubbleNodes.push({ mesh: bm, offset: b * 0.14, x: bx, z: bz });
    }
  }

  aqGroup.traverse((obj) => {
    obj.userData.aquariumHit = true;
  });

  return { aqGroup, fishNodes, bubbleNodes };
}

export const DreamHouseCanvas3D: React.FC<DreamHouseCanvas3DProps> = ({
  activeRoom,
  wallTheme,
  floorTheme,
  customWallHex,
  customFloorHex,
  customCeilingHex,
  footprintWidth = 6.4,
  footprintDepth = 5.4,
  wallHeight = 2.75,
  customWalls = [],
  showCeiling = false,
  furnitureColors,
  skyMode = 'auto',
  viewMode = 'interior',
  lightsOn,
  fireplaceLit,
  placedFurnitureIds,
  treeLevel,
  activeSeasonalEvent = 'normal',
  furnitureTransforms,
  isEditMode = false,
  selectedFurnitureId = null,
  furnitureGlbUrls,
  ownedPets,
  deadPets,
  petColors,
  petGlbUrl,
  petHunger = 80,
  petThirst = 80,
  petLastFedTimestamp = 0,
  aquarium,
  onTapAquarium,
  onInteractFurniture,
  onSelectFurniture,
  onMoveFurniture,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  const propsRef = useRef({
    activeRoom,
    wallTheme,
    floorTheme,
    customWallHex,
    customFloorHex,
    customCeilingHex,
    footprintWidth,
    footprintDepth,
    wallHeight,
    customWalls,
    showCeiling,
    furnitureColors,
    skyMode,
    viewMode,
    lightsOn,
    fireplaceLit,
    placedFurnitureIds,
    treeLevel,
    activeSeasonalEvent,
    furnitureTransforms,
    isEditMode,
    wallBuildMode,
    selectedFurnitureId,
    furnitureGlbUrls,
    ownedPets,
    deadPets,
    petColors,
    petGlbUrl,
    petHunger,
    petThirst,
    petLastFedTimestamp,
    aquarium,
    onTapAquarium,
    onInteractFurniture,
    onSelectFurniture,
    onMoveFurniture,
    onCreateWall,
  });
  propsRef.current = {
    activeRoom,
    wallTheme,
    floorTheme,
    customWallHex,
    customFloorHex,
    customCeilingHex,
    footprintWidth,
    footprintDepth,
    wallHeight,
    customWalls,
    furnitureColors,
    skyMode,
    viewMode,
    lightsOn,
    fireplaceLit,
    placedFurnitureIds,
    treeLevel,
    activeSeasonalEvent,
    furnitureTransforms,
    isEditMode,
    wallBuildMode,
    selectedFurnitureId,
    furnitureGlbUrls,
    ownedPets,
    deadPets,
    petColors,
    petGlbUrl,
    petHunger,
    petThirst,
    petLastFedTimestamp,
    aquarium,
    onTapAquarium,
    onInteractFurniture,
    onSelectFurniture,
    onMoveFurniture,
    onCreateWall,
  };

  const rebuildFnRef = useRef<(() => void) | null>(null);
  const syncTransformsFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x7c3aed, 0.012);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(5.2, 4.4, 5.8);

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const disposeStudio = setupCozyStudioRenderer(renderer, scene, isSoftwareGl);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.8;
    controls.maxDistance = 12.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0.9, 0);

    const { hemiLight, keyLight, rimLight, fillLight } = addCozyThreePointLights(scene, {
      skyColor: 0xdbeafe,
      groundColor: 0xfde2e4,
      hemiIntensity: 1.08,
      keyColor: 0xfff8eb,
      keyIntensity: 1.9,
      keyPosition: [5.5, 7.6, 6.2],
      rimColor: 0xf472b6,
      rimIntensity: 1.3,
      rimPosition: [-5.2, 5.0, -5.8],
      fillColor: 0xe9d5ff,
      fillIntensity: 0.72,
      shadowMapSize: 1024,
      shadowExtent: 5.0,
      isSoftwareGl,
    });

    const roomLight = new THREE.PointLight(0xfef08a, 1.45, 14.0);
    roomLight.position.set(0, 2.65, 0.25);
    scene.add(roomLight);

    const skyContainer = new THREE.Group();
    scene.add(skyContainer);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Exterior 360° neighborhood: lightweight surroundings plus the generated architectural GLB.
    const exteriorGroup = new THREE.Group();
    exteriorGroup.visible = false;
    scene.add(exteriorGroup);

    const exteriorGrass = new THREE.Mesh(
      new THREE.PlaneGeometry(54, 54),
      new THREE.MeshStandardMaterial({ color: 0x4f7650, roughness: 1.0 })
    );
    exteriorGrass.rotation.x = -Math.PI / 2;
    exteriorGrass.position.y = -0.32;
    exteriorGrass.receiveShadow = true;
    exteriorGroup.add(exteriorGrass);

    const pathMat = new THREE.MeshStandardMaterial({ color: 0xb7a58e, roughness: 0.92 });
    const frontPath = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.045, 10.5), pathMat);
    frontPath.position.set(0, -0.285, 7.0);
    exteriorGroup.add(frontPath);
    const gardenPath = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.04, 1.15), pathMat);
    gardenPath.position.set(0, -0.29, 1.0);
    exteriorGroup.add(gardenPath);

    const createGardenTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13 * scale, 0.22 * scale, 2.1 * scale, 9),
        new THREE.MeshStandardMaterial({ color: 0x68442f, roughness: 0.95 })
      );
      trunk.position.y = 1.05 * scale;
      tree.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x47764d, roughness: 0.92 });
      const leafMatLight = new THREE.MeshStandardMaterial({ color: 0x6e965b, roughness: 0.94 });
      const crowns: [number, number, number, number][] = [
        [0, 2.55, 0, 1.0], [-0.55, 2.35, 0.18, 0.72], [0.58, 2.38, -0.12, 0.78],
        [0.08, 3.05, 0.08, 0.72], [-0.2, 2.72, -0.55, 0.62],
      ];
      crowns.forEach(([cx, cy, cz, radius], index) => {
        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * scale, 1), index % 2 ? leafMatLight : leafMat);
        crown.position.set(cx * scale, cy * scale, cz * scale);
        tree.add(crown);
      });
      tree.position.set(x, 0, z);
      exteriorGroup.add(tree);
    };

    const createNeighborHouse = (x: number, z: number, wallColor: number, roofColor: number, rotation = 0) => {
      const home = new THREE.Group();
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(5.0, 2.65, 4.2),
        new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.88 })
      );
      walls.position.y = 1.325;
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.65, 1.75, 4),
        new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.86 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 3.35;
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 1.9, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x80543c, roughness: 0.72 })
      );
      door.position.set(0, 0.95, 2.14);
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x8cc9dc, roughness: 0.22, metalness: 0.08, emissive: 0x24445a, emissiveIntensity: 0.16 });
      [-1.45, 1.45].forEach((wx) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.07), windowMat);
        win.position.set(wx, 1.55, 2.15);
        home.add(win);
      });
      home.add(walls, roof, door);
      home.position.set(x, 0, z);
      home.rotation.y = rotation;
      exteriorGroup.add(home);
    };

    createNeighborHouse(-14, -12, 0xe3d6c2, 0x754b3c, 0.25);
    createNeighborHouse(14, -13, 0xc9d7d4, 0x4c536f, -0.35);
    createNeighborHouse(-15, 13, 0xd7c8b5, 0x8a5a42, -0.2);
    createNeighborHouse(15, 13, 0xd8d1e7, 0x5e557b, 0.35);
    createNeighborHouse(0, -19, 0xe2d6c9, 0x66566d, 0);

    [
      [-8, -8, 1.1], [8, -8, 1.0], [-9, 5, 0.92], [9, 6, 1.08],
      [-17, 0, 1.15], [17, 1, 1.12], [-6, 16, 0.92], [7, 17, 1.0],
      [-18, -15, 0.82], [18, -15, 0.86],
    ].forEach(([x, z, scale]) => createGardenTree(x, z, scale));

    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x355f43, roughness: 1 });
    [[-5.1, 0.52, 0.42, 5.2], [5.1, 0.52, 0.42, 5.2], [0, 0.52, 10.5, 0.42]].forEach(([x, y, z, depth]) => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, depth), hedgeMat);
      hedge.position.set(x, y, z);
      exteriorGroup.add(hedge);
    });

    const porchLampMat = new THREE.MeshStandardMaterial({ color: 0xf9d78b, emissive: 0xf6c66a, emissiveIntensity: 1.1, roughness: 0.45 });
    [-1.3, 1.3].forEach((x) => {
      const lamp = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 1.55, 8), new THREE.MeshStandardMaterial({ color: 0x4d4a59, metalness: 0.55, roughness: 0.42 }));
      post.position.y = 0.78;
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), porchLampMat);
      glow.position.y = 1.58;
      lamp.add(post, glow);
      lamp.position.set(x, 0, 4.2);
      exteriorGroup.add(lamp);
    });

    loadCachedGlbInstance('https://res.cloudinary.com/r3vmqjwx/raw/upload/v1795516155/nosso-mundo/models/nosso-mundo/models/cozy-home-exterior.glb', 4.0, true)
      .then(({ group: houseModel }) => {
        const bounds = new THREE.Box3().setFromObject(houseModel);
        const center = bounds.getCenter(new THREE.Vector3());
        houseModel.position.x -= center.x;
        houseModel.position.z -= center.z;
        houseModel.position.y -= bounds.min.y;
        exteriorGroup.add(houseModel);
      })
      .catch(() => {
        // Keep the neighborhood available if the remote architectural model is unavailable.
      });

    const gridHelper = new THREE.GridHelper(6.0, 24, 0xf472b6, 0xd8b4fe);
    gridHelper.position.set(0, 0.008, 0.02);
    const gridMats = Array.isArray(gridHelper.material) ? gridHelper.material : [gridHelper.material];
    gridMats.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.38;
    });
    gridHelper.visible = Boolean(propsRef.current.isEditMode);
    scene.add(gridHelper);

    const selectionRingMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xec4899,
      emissiveIntensity: 1.1,
      roughness: 0.55,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const selectionRing = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.6, 40), selectionRingMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.set(0, 0.016, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);

    interface RoamingPetSlot {
      instance: RoamingPetInstance;
      mixer?: THREE.AnimationMixer;
      actions: Record<string, THREE.AnimationAction>;
      currentActionName?: string;
      aiTimer: number;
      aiMode: 'walk' | 'idle' | 'sit' | 'eat';
    }

    const furnitureRootMap = new Map<string, { group: THREE.Group; baseY: number }>();
    let petObstacleRects: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
    let emberMeshes: THREE.Mesh[] = [];
    let glowMeshes: THREE.Mesh[] = [];
    let flameLights: THREE.PointLight[] = [];
    let swingGroups: THREE.Group[] = [];
    let balconyTreeGroup: THREE.Group | null = null;
    let aquariumFishNodes: { mesh: THREE.Group; phase: number; speed: number; radiusX: number; baseY: number }[] = [];
    let aquariumBubbleNodes: { mesh: THREE.Mesh; offset: number; x: number; z: number }[] = [];
    let roamingPetSlots: RoamingPetSlot[] = [];
    let skyClouds: { mesh: THREE.Group; speed: number; baseX: number }[] = [];
    let skyBirds: { group: THREE.Group; wingL: THREE.Mesh; wingR: THREE.Mesh; phaseOffset: number; radius: number; speed: number; y: number }[] = [];
    let skyStars: THREE.Points | null = null;
    let skyEclipseHalo: THREE.Mesh | null = null;
    let skyDomeTex: THREE.CanvasTexture | null = null;
    let rebuildToken = 0;

    const playSlotAnimation = (slot: RoamingPetSlot, candidates: string[]) => {
      const nextName = candidates.find((c) => Boolean(slot.actions[c]));
      if (!nextName || slot.currentActionName === nextName) return;
      const prev = slot.currentActionName ? slot.actions[slot.currentActionName] : undefined;
      const next = slot.actions[nextName];
      if (!next) return;
      if (prev && prev !== next) {
        prev.fadeOut(0.25);
      }
      next.reset().fadeIn(0.25).play();
      slot.currentActionName = nextName;
    };

    let appliedViewMode: 'interior' | 'exterior' | null = null;
    const syncTransformsAndOverlay = () => {
      const nextViewMode = propsRef.current.viewMode || 'interior';
      const exteriorActive = nextViewMode === 'exterior';
      roomGroup.visible = !exteriorActive;
      exteriorGroup.visible = exteriorActive;
      if (appliedViewMode !== nextViewMode) {
        if (exteriorActive) {
          camera.position.set(14, 10, 14);
          controls.minDistance = 8;
          controls.maxDistance = 26;
          controls.target.set(0, 1.0, 0);
        } else {
          camera.position.set(5.2, 4.4, 5.8);
          controls.minDistance = 3.8;
          controls.maxDistance = 12.0;
          controls.target.set(0, 0.9, 0);
        }
        controls.update();
        appliedViewMode = nextViewMode;
      }
      const {
        furnitureTransforms: savedMap,
        isEditMode: editActive,
        selectedFurnitureId: selId,
      } = propsRef.current;

      gridHelper.visible = !exteriorActive && Boolean(editActive);

      furnitureRootMap.forEach(({ group, baseY }, fId) => {
        const def = DEFAULT_FURNITURE_TRANSFORMS[fId] || { x: 0, z: 0, rotY: 0 };
        const tr = savedMap?.[fId];
        group.position.set(tr ? tr.x : def.x, baseY, tr ? tr.z : def.z);
        group.rotation.y = tr ? tr.rotY : def.rotY;
      });

      if (editActive && selId && furnitureRootMap.has(selId)) {
        const target = furnitureRootMap.get(selId)!;
        selectionRing.position.set(target.group.position.x, 0.016, target.group.position.z);
        selectionRing.visible = true;
      } else {
        selectionRing.visible = false;
      }
    };

    const canPetOccupy = (x: number, z: number, radius = 0.34) => {
      return !petObstacleRects.some((box) =>
        x + radius > box.minX &&
        x - radius < box.maxX &&
        z + radius > box.minZ &&
        z - radius < box.maxZ
      );
    };

    const movePetSafely = (pet: RoamingPetInstance, stepX: number, stepZ: number) => {
      const nextX = pet.root.position.x + stepX;
      const nextZ = pet.root.position.z + stepZ;
      if (canPetOccupy(nextX, nextZ)) {
        pet.root.position.set(nextX, pet.root.position.y, nextZ);
        return true;
      }
      if (Math.abs(stepX) > 0.0001 && canPetOccupy(nextX, pet.root.position.z)) {
        pet.root.position.x = nextX;
        return true;
      }
      if (Math.abs(stepZ) > 0.0001 && canPetOccupy(pet.root.position.x, nextZ)) {
        pet.root.position.z = nextZ;
        return true;
      }
      return false;
    };

    const rebuildRoom = () => {
      rebuildToken += 1;
      const myToken = rebuildToken;

      roamingPetSlots.forEach((slot) => {
        slot.mixer?.stopAllAction();
      });
      roamingPetSlots = [];

      const {
        activeRoom: room,
        wallTheme: wTheme,
        floorTheme: fTheme,
        customWallHex: cWallHex,
        customFloorHex: cFloorHex,
        customCeilingHex: cCeilingHex,
        customWalls: savedCustomWalls,
        showCeiling: ceilingVisible,
        furnitureColors: fColors,
        skyMode: sMode,
        lightsOn: lOn,
        fireplaceLit: fLit,
        placedFurnitureIds: fIds,
        treeLevel: tLevel,
        activeSeasonalEvent: seasonal,
        furnitureGlbUrls: glbMap,
        ownedPets: oPets,
        deadPets: dPets,
        petColors: pColors,
        petGlbUrl: pGlbUrl,
        aquarium: aqState,
      } = propsRef.current;

      // Rebuild Real-Time Climatic Sky Backdrop
      while (skyContainer.children.length > 0) {
        const ch = skyContainer.children[0];
        skyContainer.remove(ch);
        disposeObject3D(ch);
      }
      if (skyDomeTex) {
        skyDomeTex.dispose();
        skyDomeTex = null;
      }
      const skyPhase = resolveClimaticPhase(sMode || 'auto');
      const builtSky = buildClimaticSkyBackdrop(skyPhase);
      skyContainer.add(builtSky.skyGroup);
      skyClouds = builtSky.clouds;
      skyBirds = builtSky.birds;
      skyStars = builtSky.starPoints;
      skyEclipseHalo = builtSky.eclipseHalo;
      skyDomeTex = builtSky.skyTex;

      const fogHex =
        skyPhase === 'day'
          ? 0xc4b5fd
          : skyPhase === 'dawn'
          ? 0xf5d0fe
          : skyPhase === 'sunset'
          ? 0xa855f7
          : 0x311859;
      scene.fog = new THREE.FogExp2(fogHex, 0.011);

      while (roomGroup.children.length > 0) {
        const ch = roomGroup.children[0];
        roomGroup.remove(ch);
        disposeObject3D(ch);
      }
      furnitureRootMap.clear();
      emberMeshes = [];
      glowMeshes = [];
      flameLights = [];
      swingGroups = [];
      balconyTreeGroup = null;
      aquariumFishNodes = [];
      aquariumBubbleNodes = [];

      roomLight.intensity = lOn ? 1.45 : 0.45;
      hemiLight.intensity = lOn ? 1.12 : 0.65;
      keyLight.intensity = lOn ? 1.9 : 1.05;
      rimLight.intensity = lOn ? 1.3 : 0.9;
      fillLight.intensity = lOn ? 0.72 : 0.45;

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const floorTex = createFloorTexture(fTheme, maxAniso, cFloorHex, room === 'banheiro');
      const wallTex = createWallTexture(wTheme, maxAniso, cWallHex);

      const buildWidth = THREE.MathUtils.clamp(footprintWidth, 4, 12);
      const buildDepth = THREE.MathUtils.clamp(footprintDepth, 4, 12);
      const buildWallHeight = THREE.MathUtils.clamp(wallHeight, 2.2, 4.5);
      const plinth = new THREE.Mesh(
        new RoundedBoxGeometry(buildWidth + 0.35, 0.28, buildDepth + 0.35, 4, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x4a2284, roughness: 0.6, metalness: 0.08 })
      );
      plinth.position.y = -0.14;
      plinth.receiveShadow = true;
      roomGroup.add(plinth);

      const floorMesh = new THREE.Mesh(
        new RoundedBoxGeometry(buildWidth, 0.05, buildDepth, 3, 0.02),
        new THREE.MeshStandardMaterial({ map: floorTex, roughness: room === 'banheiro' ? 0.36 : 0.62, metalness: 0.04 })
      );
      floorMesh.position.y = -0.022;
      floorMesh.receiveShadow = true;
      floorMesh.userData = { constructionElement: 'floor', width: buildWidth, depth: buildDepth };
      roomGroup.add(floorMesh);

      const ceilingMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(buildWidth, buildDepth),
        new THREE.MeshStandardMaterial({
          color: cCeilingHex || '#eee7f5',
          roughness: 0.86,
          side: THREE.DoubleSide,
        })
      );
      ceilingMesh.rotation.x = -Math.PI / 2;
      ceilingMesh.position.y = buildWallHeight + 0.25;
      ceilingMesh.visible = Boolean(ceilingVisible);
      roomGroup.add(ceilingMesh);

      const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.68,
        metalness: 0.04,
      });

      if (room === 'varanda') {
        const railMat = new THREE.MeshStandardMaterial({ color: 0x8b5a3c, roughness: 0.58 });
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xcffafe,
          roughness: 0.2,
          metalness: 0.1,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
        });
        const backRailTop = new THREE.Mesh(new RoundedBoxGeometry(6.4, 0.09, 0.12, 3, 0.03), railMat);
        backRailTop.position.set(0, 0.92, -2.62);
        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.85, 0.04), glassMat);
        backGlass.position.set(0, 0.46, -2.62);
        const leftRail = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.09, 5.3, 3, 0.03), railMat);
        leftRail.position.set(-3.14, 0.92, 0);
        roomGroup.add(backRailTop, backGlass, leftRail);

        const miniTree = new THREE.Group();
        const scaleT = 0.58 + (tLevel / 10) * 0.72;
        miniTree.position.set(0, -0.3, -4.5);
        miniTree.scale.setScalar(scaleT);
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.25, 1.5, 18),
          new THREE.MeshStandardMaterial({ color: 0x6b3e6e, roughness: 0.66 })
        );
        trunk.position.y = 0.75;
        miniTree.add(trunk);

        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.52,
          roughness: 0.58,
        });
        const puffs: [number, number, number, number][] = [
          [0, 1.85, 0, 0.72],
          [-0.48, 1.72, 0.18, 0.5],
          [0.48, 1.75, -0.15, 0.52],
          [0, 2.15, 0.12, 0.48],
        ];
        puffs.forEach(([px, py, pz, pr]) => {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 24, 24), canopyMat);
          puff.position.set(px, py, pz);
          miniTree.add(puff);
        });
        roomGroup.add(miniTree);
        balconyTreeGroup = miniTree;
      } else {
        // Solid architectural walls with real openings, not window/door decals.
        const backWall = createHouseWallMesh(
          {
            id: `${room}-back`,
            start: { x: -buildWidth / 2, z: -buildDepth / 2 },
            end: { x: buildWidth / 2, z: -buildDepth / 2 },
            height: buildWallHeight,
            thickness: 0.14,
            openings: [
              { id: `${room}-window`, kind: 'window', offset: buildWidth - 2.825, width: 1.55, height: 1.24, sillHeight: 0.94 },
            ],
          },
          wallMat
        );
        const leftWall = createHouseWallMesh(
          {
            id: `${room}-left`,
            start: { x: -buildWidth / 2, z: -buildDepth / 2 },
            end: { x: -buildWidth / 2, z: buildDepth / 2 },
            height: 2.75,
            thickness: 0.14,
            openings: [
              { id: `${room}-door`, kind: 'door', offset: 0.72, width: 0.92, height: 2.12, sillHeight: 0 },
            ],
          },
          wallMat
        );
        roomGroup.add(backWall, leftWall);

        // Warm timber trim gives the real doorway a finished architectural edge.
        const doorTrimMat = new THREE.MeshStandardMaterial({
          color: 0x80502f,
          roughness: 0.58,
          metalness: 0.02,
        });
        const doorCenterZ = -buildDepth / 2 + 0.72 + 0.92 / 2;
        const doorTrimLeft = new THREE.Mesh(
          new RoundedBoxGeometry(0.12, 2.16, 0.09, 3, 0.018),
          doorTrimMat
        );
        doorTrimLeft.position.set(-buildWidth / 2, 1.08, doorCenterZ - 0.49);
        const doorTrimRight = new THREE.Mesh(
          new RoundedBoxGeometry(0.12, 2.16, 0.09, 3, 0.018),
          doorTrimMat
        );
        doorTrimRight.position.set(-buildWidth / 2, 1.08, doorCenterZ + 0.49);
        const doorTrimTop = new THREE.Mesh(
          new RoundedBoxGeometry(0.12, 0.11, 1.07, 3, 0.018),
          doorTrimMat
        );
        doorTrimTop.position.set(-buildWidth / 2, 2.16, doorCenterZ);
        roomGroup.add(doorTrimLeft, doorTrimRight, doorTrimTop);

        const winFrame = new THREE.Mesh(
          new RoundedBoxGeometry(1.55, 1.24, 0.09, 3, 0.03),
          new THREE.MeshStandardMaterial({ color: 0xfff5fa, roughness: 0.58 })
        );
        winFrame.position.set(buildWidth / 2 - 2.05, 1.56, -buildDepth / 2 + 0.09);
        const winGlassColor =
          skyPhase === 'day'
            ? 0x7dd3fc
            : skyPhase === 'sunset'
            ? 0xfb7185
            : skyPhase === 'eclipse'
            ? 0x9333ea
            : 0x818cf8;
        const winGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(1.32, 1.02),
          new THREE.MeshStandardMaterial({
            color: seasonal === 'natal' ? 0xbae6fd : seasonal === 'halloween' ? 0xc084fc : winGlassColor,
            emissive: seasonal === 'halloween' ? 0xf97316 : winGlassColor,
            emissiveIntensity: 0.65,
            roughness: 0.45,
          })
        );
        winGlass.position.set(1.15, 1.56, -2.505);
        roomGroup.add(winFrame, winGlass);
      }

      // User-built wall segments are persisted and rendered as solid 3D geometry.
      (savedCustomWalls || []).filter((wall) => !wall.roomId || wall.roomId === room).forEach((wall) => {
        try {
          const customWall = createHouseWallMesh(
            {
              id: wall.id,
              start: wall.start,
              end: wall.end,
              height: wall.height,
              thickness: wall.thickness,
              openings: wall.openings || [],
            },
            wallMat
          );
          customWall.userData.isUserBuiltWall = true;
          roomGroup.add(customWall);
        } catch (error) {
          console.warn('Parede personalizada ignorada por geometria inválida:', wall.id, error);
        }
      });

      // Aquário Vivo Integrado na Sala de Estar
      if (room === 'sala') {
        const builtAq = buildEmbeddedSalaAquarium(aqState, lOn);
        roomGroup.add(builtAq.aqGroup);
        aquariumFishNodes = builtAq.fishNodes;
        aquariumBubbleNodes = builtAq.bubbleNodes;
      }

      if (seasonal === 'natal') {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(2.45, 0, -2.05);
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.14, 0.22, 18),
          new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.58 })
        );
        pot.position.y = 0.11;
        const pine = new THREE.Mesh(
          new THREE.ConeGeometry(0.36, 0.92, 20),
          new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.62 })
        );
        pine.position.y = 0.66;
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.2, roughness: 0.55 })
        );
        star.position.y = 1.18;
        treeGroup.add(pot, pine, star);
        roomGroup.add(treeGroup);
      } else if (seasonal === 'halloween') {
        const pump = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 22, 18),
          new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xf97316, emissiveIntensity: 0.85, roughness: 0.58 })
        );
        pump.scale.set(1.2, 0.88, 1.2);
        pump.position.set(2.4, 0.16, 1.75);
        roomGroup.add(pump);
      }

      fIds.forEach((fId) => {
        const built = buildCozyFurniture(fId, lOn, fLit, fColors?.[fId]);
        roomGroup.add(built.group);
        furnitureRootMap.set(fId, { group: built.group, baseY: built.baseY });
        emberMeshes.push(...built.emberMeshes);
        glowMeshes.push(...built.glowMeshes);
        if (built.flameLight) flameLights.push(built.flameLight);
        if (built.swingGroup) swingGroups.push(built.swingGroup);

        const customUrl = glbMap?.[fId]?.trim();
        if (customUrl && !isUnsupportedGlbUrl(customUrl)) {
          const targetH = FURNITURE_TARGET_HEIGHTS[fId] || 1.0;
          loadCachedGlbInstance(customUrl, targetH, true)
            .then(({ group: glbGroup }) => {
              if (myToken !== rebuildToken || !built.group.parent) {
                disposeObject3D(glbGroup);
                return;
              }
              while (built.group.children.length > 0) {
                const c = built.group.children[0];
                built.group.remove(c);
                disposeObject3D(c);
              }
              tagFurnitureRecursive(glbGroup, fId);
              built.group.add(glbGroup);
            })
            .catch(() => {
              // Keep Cozy procedural furniture on invalid GLB URL
            });
        }
      });

      // Cache de colisões do mobiliário: os pets contornam móveis em vez de atravessá-los.
      syncTransformsAndOverlay();
      petObstacleRects = [];
      furnitureRootMap.forEach(({ group }) => {
        group.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(group);
        if (Number.isFinite(bounds.min.x) && Number.isFinite(bounds.max.x)) {
          petObstacleRects.push({
            minX: bounds.min.x - 0.08,
            maxX: bounds.max.x + 0.08,
            minZ: bounds.min.z - 0.08,
            maxZ: bounds.max.z + 0.08,
          });
        }
      });

      // Mascotes vivos andando livremente pelo cômodo
      const deadSet = new Set(dPets || []);
      const basePets: PetType[] = (oPets && oPets.length > 0 ? oPets : ['cat']).filter(
        (p) => !deadSet.has(p)
      );
      const visiblePets = basePets.slice(0, 5);
      visiblePets.forEach((petType, idx) => {
        const inst = buildCompactRoamingPet(petType, pColors?.[petType]);
        const startX = -1.35 + (idx % 3) * 1.25;
        const startZ = -0.6 + Math.floor(idx / 3) * 1.15;
        inst.root.position.set(startX, 0, startZ);
        inst.targetX = Math.max(-2.2, Math.min(2.2, startX + 0.8));
        inst.targetZ = Math.max(-1.8, Math.min(1.8, startZ + 0.4));
        roomGroup.add(inst.root);

        const slot: RoamingPetSlot = {
          instance: inst,
          actions: {},
          aiTimer: 1.5 + idx * 0.9,
          aiMode: idx === 0 ? 'walk' : 'idle',
        };
        roamingPetSlots.push(slot);

        if (petType === 'cat' && pGlbUrl && !isUnsupportedGlbUrl(pGlbUrl)) {
          loadCachedGlbInstance(pGlbUrl, 0.46, true)
            .then(({ group: glbGroup, animations }) => {
              if (myToken !== rebuildToken || !inst.root.parent) {
                disposeObject3D(glbGroup);
                return;
              }
              const catColor = pColors?.cat;
              if (catColor) {
                const col = new THREE.Color(catColor);
                glbGroup.traverse((obj) => {
                  if ((obj as THREE.Mesh).isMesh) {
                    const mesh = obj as THREE.Mesh;
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    mats.forEach((m) => {
                      if (!m) return;
                      const matName = (m.name || '').toLowerCase();
                      const hasCatMat = matName.includes('c_cat_mixed');
                      if ((hasCatMat || mats.length === 1) && 'color' in m && m.color instanceof THREE.Color) {
                        m.color.copy(col);
                        m.needsUpdate = true;
                      }
                    });
                  }
                });
              }
              inst.bodyGroup.visible = false;
              inst.root.add(glbGroup);

              if (animations && animations.length > 0) {
                const mixer = new THREE.AnimationMixer(glbGroup);
                animations.forEach((clip) => {
                  slot.actions[clip.name] = mixer.clipAction(clip);
                });
                slot.mixer = mixer;
                playSlotAnimation(slot, ['Walk', 'Walk_2', 'Idle', 'Stand']);
              }
            })
            .catch(() => {
              // Mantém o pet 3D compacto caso falhe o carregamento do .glb
            });
        }
      });

      syncTransformsAndOverlay();
    };

    rebuildFnRef.current = rebuildRoom;
    syncTransformsFnRef.current = syncTransformsAndOverlay;
    rebuildRoom();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPt = new THREE.Vector3();

    let downX = 0;
    let downY = 0;
    let draggingId: string | null = null;
    let didDrag = false;
    let dragOffsetX = 0;
    let dragOffsetZ = 0;
    let activePointerId: number | null = null;
    let drawingWallStart: THREE.Vector3 | null = null;
    let wallDraftLine: THREE.Line | null = null;

    const updateMouseFromEvent = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      didDrag = false;

      if (propsRef.current.wallBuildMode) {
        updateMouseFromEvent(e);
        raycaster.setFromCamera(mouse, camera);
        if (!raycaster.ray.intersectPlane(floorPlane, intersectPt)) return;
        const sx = Math.round(intersectPt.x / 0.25) * 0.25;
        const sz = Math.round(intersectPt.z / 0.25) * 0.25;
        drawingWallStart = new THREE.Vector3(sx, 0.04, sz);
        const draftGeometry = new THREE.BufferGeometry().setFromPoints([drawingWallStart, drawingWallStart]);
        wallDraftLine = new THREE.Line(
          draftGeometry,
          new THREE.LineBasicMaterial({ color: 0xf472b6, linewidth: 3 })
        );
        scene.add(wallDraftLine);
        activePointerId = e.pointerId;
        controls.enabled = false;
        try {
          renderer.domElement.setPointerCapture?.(e.pointerId);
        } catch {
          // Safe fallback
        }
        return;
      }

      if (!propsRef.current.isEditMode) return;

      updateMouseFromEvent(e);
      raycaster.setFromCamera(mouse, camera);
      const targets = Array.from(furnitureRootMap.values()).map((v) => v.group);
      const hits = raycaster.intersectObjects(targets, true);
      const hit = hits.find((h) => h.object.userData?.furnitureId);

      if (hit) {
        const fId = String(hit.object.userData.furnitureId);
        const entry = furnitureRootMap.get(fId);
        if (!entry) return;

        draggingId = fId;
        activePointerId = e.pointerId;
        controls.enabled = false;
        propsRef.current.onSelectFurniture?.(fId);

        if (raycaster.ray.intersectPlane(floorPlane, intersectPt)) {
          dragOffsetX = intersectPt.x - entry.group.position.x;
          dragOffsetZ = intersectPt.z - entry.group.position.z;
        } else {
          dragOffsetX = 0;
          dragOffsetZ = 0;
        }

        try {
          renderer.domElement.setPointerCapture?.(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (drawingWallStart && wallDraftLine) {
        updateMouseFromEvent(e);
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(floorPlane, intersectPt)) {
          const ex = Math.round(intersectPt.x / 0.25) * 0.25;
          const ez = Math.round(intersectPt.z / 0.25) * 0.25;
          wallDraftLine.geometry.setFromPoints([
            drawingWallStart,
            new THREE.Vector3(ex, 0.04, ez),
          ]);
        }
        return;
      }
      if (!draggingId || !propsRef.current.isEditMode) return;
      const entry = furnitureRootMap.get(draggingId);
      if (!entry) return;

      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) {
        didDrag = true;
      }

      updateMouseFromEvent(e);
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(floorPlane, intersectPt)) {
        const rawX = intersectPt.x - dragOffsetX;
        const rawZ = intersectPt.z - dragOffsetZ;
        const snappedX = Math.max(-2.6, Math.min(2.6, Math.round(rawX / 0.25) * 0.25));
        const snappedZ = Math.max(-2.1, Math.min(2.1, Math.round(rawZ / 0.25) * 0.25));

        entry.group.position.x = snappedX;
        entry.group.position.z = snappedZ;
        selectionRing.position.set(snappedX, 0.016, snappedZ);
        selectionRing.visible = true;
      }
    };

    const finishPointer = (e: PointerEvent) => {
      if (drawingWallStart) {
        updateMouseFromEvent(e);
        raycaster.setFromCamera(mouse, camera);
        const hasEnd = raycaster.ray.intersectPlane(floorPlane, intersectPt);
        if (hasEnd) {
          const endX = Math.round(intersectPt.x / 0.25) * 0.25;
          const endZ = Math.round(intersectPt.z / 0.25) * 0.25;
          const startX = drawingWallStart.x;
          const startZ = drawingWallStart.z;
          if (Math.hypot(endX - startX, endZ - startZ) >= 0.5) {
            propsRef.current.onCreateWall?.({
              id: `custom-wall-${Date.now()}`,
              roomId: propsRef.current.activeRoom,
              start: { x: startX, z: startZ },
              end: { x: endX, z: endZ },
              height: propsRef.current.wallHeight || 2.75,
              thickness: 0.14,
            });
          }
        }
        drawingWallStart = null;
        if (wallDraftLine) {
          scene.remove(wallDraftLine);
          wallDraftLine.geometry.dispose();
          (wallDraftLine.material as THREE.Material).dispose();
          wallDraftLine = null;
        }
        if (activePointerId !== null) {
          try {
            renderer.domElement.releasePointerCapture?.(activePointerId);
          } catch {
            // Ignore
          }
          activePointerId = null;
        }
        controls.enabled = true;
        return;
      }

      if (!controls.enabled) controls.enabled = true;

      if (activePointerId !== null) {
        try {
          renderer.domElement.releasePointerCapture?.(activePointerId);
        } catch {
          // Ignore
        }
        activePointerId = null;
      }

      if (draggingId) {
        const fId = draggingId;
        draggingId = null;
        const entry = furnitureRootMap.get(fId);
        if (entry && didDrag) {
          propsRef.current.onMoveFurniture?.(fId, {
            x: Number(entry.group.position.x.toFixed(2)),
            z: Number(entry.group.position.z.toFixed(2)),
            rotY: Number(entry.group.rotation.y.toFixed(4)),
          });
        }
        return;
      }

      if (e.type === 'pointercancel') return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;

      updateMouseFromEvent(e);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(roomGroup.children, true);

      if (!propsRef.current.isEditMode) {
        const aqHit = hits.find((h) => h.object.userData?.aquariumHit);
        if (aqHit) {
          propsRef.current.onTapAquarium?.();
          return;
        }
      }

      const hit = hits.find((h) => h.object.userData?.furnitureId);

      if (propsRef.current.isEditMode) {
        if (hit) propsRef.current.onSelectFurniture?.(String(hit.object.userData.furnitureId));
        else propsRef.current.onSelectFurniture?.(null);
      } else if (hit && propsRef.current.onInteractFurniture) {
        propsRef.current.onInteractFurniture(String(hit.object.userData.furnitureId));
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', finishPointer);
    renderer.domElement.addEventListener('pointercancel', finishPointer);
    window.addEventListener('pointerup', finishPointer);
    window.addEventListener('pointercancel', finishPointer);

    let lost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      setContextLost(true);
    };
    const handleContextRestored = () => {
      lost = false;
      setContextLost(false);
      rebuildFnRef.current?.();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    let animId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl2 = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl2.fenceSync === 'function') {
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl2.flush();
        const poll = () => {
          const st = sync ? gl2.getSyncParameter(sync, gl2.SYNC_STATUS) : gl2.ALREADY_SIGNALED;
          if (st === gl2.UNSIGNALED) {
            animId = window.setTimeout(poll, 6);
          } else {
            if (sync) gl2.deleteSync(sync);
            animId = window.setTimeout(cb, 80);
          }
        };
        animId = window.setTimeout(poll, 6);
      } else {
        animId = window.setTimeout(cb, 80);
      }
    }

    const tick = () => {
      if (lost) return;
      const dt = Math.min(0.1, clock.getDelta());
      const t = clock.elapsedTime;

      if (!prefersReducedMotion) {
        for (let i = 0; i < emberMeshes.length; i++) {
          const s = 0.88 + Math.sin(t * 7.5 + i * 1.4) * 0.22;
          emberMeshes[i].scale.set(0.85, (1.85 + (i % 3) * 0.2) * s, 0.85);
        }
        for (let i = 0; i < flameLights.length; i++) {
          flameLights[i].intensity = 1.4 + Math.sin(t * 9.0 + i) * 0.3;
        }
        for (let i = 0; i < swingGroups.length; i++) {
          swingGroups[i].rotation.x = Math.sin(t * 1.8) * 0.1;
        }
        for (let i = 0; i < glowMeshes.length; i++) {
          const mat = glowMeshes[i].material as THREE.MeshStandardMaterial;
          if (mat && typeof mat.emissiveIntensity === 'number') {
            mat.emissiveIntensity = 0.72 + Math.sin(t * 2.4 + i * 0.9) * 0.25;
          }
        }
        if (balconyTreeGroup) {
          balconyTreeGroup.rotation.y = Math.sin(t * 0.35) * 0.08;
        }
        if (selectionRing.visible) {
          const pulse = 1 + Math.sin(t * 4.2) * 0.08;
          selectionRing.scale.set(pulse, pulse, 1);
          selectionRingMat.opacity = 0.68 + Math.sin(t * 4.2) * 0.22;
        }
        for (let i = 0; i < skyClouds.length; i++) {
          const c = skyClouds[i];
          c.mesh.position.x = ((c.baseX + t * c.speed + 12) % 24) - 12;
        }
        for (let i = 0; i < skyBirds.length; i++) {
          const b = skyBirds[i];
          const ang = t * b.speed + b.phaseOffset;
          b.group.position.set(Math.cos(ang) * b.radius, b.y + Math.sin(t * 1.2 + i) * 0.25, -8 - Math.sin(ang) * 2.5);
          b.group.rotation.y = -ang;
          const flap = Math.sin(t * 7.5 + b.phaseOffset) * 0.45;
          b.wingL.rotation.z = flap;
          b.wingR.rotation.z = -flap;
        }
        if (skyStars) {
          const mat = skyStars.material as THREE.PointsMaterial;
          mat.opacity = 0.65 + Math.sin(t * 1.8) * 0.25;
        }
        if (skyEclipseHalo) {
          const sc = 1 + Math.sin(t * 1.6) * 0.05;
          skyEclipseHalo.scale.set(sc, sc, 1);
        }

        // Peixes e bolhas animados no Aquário da Sala
        for (let i = 0; i < aquariumFishNodes.length; i++) {
          const fn = aquariumFishNodes[i];
          const ang = t * fn.speed + fn.phase;
          const nx = Math.sin(ang) * fn.radiusX;
          const nz = Math.cos(ang * 1.3) * 0.11;
          const ny = fn.baseY + Math.sin(ang * 2) * 0.035;
          const dirX = Math.cos(ang) * fn.radiusX * fn.speed;
          fn.mesh.position.set(nx, ny, nz);
          fn.mesh.rotation.y = dirX >= 0 ? 0 : Math.PI;
        }
        for (let i = 0; i < aquariumBubbleNodes.length; i++) {
          const bn = aquariumBubbleNodes[i];
          const progress = (t * 0.35 + bn.offset) % 1;
          bn.mesh.position.set(bn.x + Math.sin(t * 3 + i) * 0.02, 0.68 + progress * 0.62, bn.z);
        }

        // Mascotes andando autonomamente pelo cômodo e indo comer/beber na tigela da Cozinha
        const {
          activeRoom: curRoom,
          petHunger: curHunger = 80,
          petThirst: curThirst = 80,
          petLastFedTimestamp: lastFed = 0,
        } = propsRef.current;
        const bowlEntry = curRoom === 'cozinha' ? furnitureRootMap.get('house-pet-bowl') : undefined;
        const shouldEatAtBowl =
          Boolean(bowlEntry) &&
          (curHunger < 45 || curThirst < 45 || Date.now() - lastFed < 12000);

        for (let i = 0; i < roamingPetSlots.length; i++) {
          const slot = roamingPetSlots[i];
          const pet = slot.instance;
          slot.mixer?.update(dt);

          if (shouldEatAtBowl && bowlEntry) {
            const bx = bowlEntry.group.position.x + (i % 2 === 0 ? -0.18 : 0.18);
            const bz = bowlEntry.group.position.z + 0.34;
            pet.targetX = bx;
            pet.targetZ = bz;
            const dx = pet.targetX - pet.root.position.x;
            const dz = pet.targetZ - pet.root.position.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.12) {
              slot.aiMode = 'walk';
              const step = Math.min(dist, pet.speed * 1.15 * dt);
              const moved = movePetSafely(pet, (dx / dist) * step, (dz / dist) * step);
              if (!moved) {
                pet.targetX = pet.root.position.x;
                pet.targetZ = pet.root.position.z;
                slot.aiTimer = 0.35;
              }
              pet.root.rotation.y = Math.atan2(dx, dz);
              pet.walkPhase += dt * 11;
              pet.legs.forEach((leg, li) => {
                leg.rotation.x = Math.sin(pet.walkPhase + (li % 2 === 0 ? 0 : Math.PI)) * 0.45;
              });
              playSlotAnimation(slot, ['Walk', 'Run', 'Walk_2']);
            } else {
              slot.aiMode = 'eat';
              pet.root.rotation.y = Math.atan2(
                bowlEntry.group.position.x - pet.root.position.x,
                bowlEntry.group.position.z - pet.root.position.z
              );
              pet.legs.forEach((leg) => {
                leg.rotation.x *= 0.85;
              });
              pet.headGroup.rotation.x = 0.42 + Math.sin(t * 7.5 + i) * 0.14;
              playSlotAnimation(slot, ['Eat', 'Feeding', 'SitIdle', 'Idle']);
            }
            continue;
          }

          pet.headGroup.rotation.x *= 0.85;
          slot.aiTimer -= dt;
          if (slot.aiTimer <= 0) {
            const roll = Math.random();
            if (roll < 0.58) {
              slot.aiMode = 'walk';
              pet.targetX = (Math.random() - 0.5) * 4.4;
              pet.targetZ = (Math.random() - 0.5) * 3.6;
              slot.aiTimer = 3.0 + Math.random() * 2.5;
            } else if (roll < 0.82) {
              slot.aiMode = 'sit';
              slot.aiTimer = 2.2 + Math.random() * 2.0;
            } else {
              slot.aiMode = 'idle';
              slot.aiTimer = 1.8 + Math.random() * 1.8;
            }
          }

          if (slot.aiMode === 'walk') {
            const dx = pet.targetX - pet.root.position.x;
            const dz = pet.targetZ - pet.root.position.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.1) {
              const step = Math.min(dist, pet.speed * dt);
              const moved = movePetSafely(pet, (dx / dist) * step, (dz / dist) * step);
              if (!moved) {
                pet.targetX = pet.root.position.x;
                pet.targetZ = pet.root.position.z;
                slot.aiTimer = 0.35;
              }
              pet.root.rotation.y = Math.atan2(dx, dz);
              pet.walkPhase += dt * 9.5;
              pet.legs.forEach((leg, li) => {
                leg.rotation.x = Math.sin(pet.walkPhase + (li % 2 === 0 ? 0 : Math.PI)) * 0.4;
              });
              pet.bodyGroup.position.y = Math.abs(Math.sin(pet.walkPhase)) * 0.018;
              playSlotAnimation(slot, ['Walk', 'Walk_2', 'Run']);
            } else {
              slot.aiMode = 'idle';
              slot.aiTimer = 1.5;
            }
          } else {
            pet.legs.forEach((leg) => {
              leg.rotation.x *= 0.85;
            });
            pet.bodyGroup.position.y = slot.aiMode === 'sit' ? -0.025 : Math.sin(t * 2.5 + i) * 0.008;
            if (slot.aiMode === 'sit') {
              playSlotAnimation(slot, ['SitIdle', 'Sit', 'Idle']);
            } else {
              playSlotAnimation(slot, ['Idle', 'Stand']);
            }
          }
          if (pet.tail) {
            pet.tail.rotation.y = Math.sin(t * 5.2 + i) * 0.28;
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };
    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    const resizeObs =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObs?.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      roamingPetSlots.forEach((slot) => {
        slot.mixer?.stopAllAction();
      });
      roamingPetSlots = [];
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', finishPointer);
      renderer.domElement.removeEventListener('pointercancel', finishPointer);
      window.removeEventListener('pointerup', finishPointer);
      window.removeEventListener('pointercancel', finishPointer);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      disposeObject3D(roomGroup);
      disposeObject3D(skyContainer);
      if (skyDomeTex) skyDomeTex.dispose();
      selectionRing.geometry.dispose();
      selectionRingMat.dispose();
      gridHelper.geometry.dispose();
      gridMats.forEach((m) => m.dispose());
      disposeStudio();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const placedKey = placedFurnitureIds.join(',');
  const glbUrlsKey = JSON.stringify(furnitureGlbUrls || {});
  const colorsKey = JSON.stringify(furnitureColors || {});
  const ownedPetsKey = (ownedPets || []).join(',');
  const deadPetsKey = (deadPets || []).join(',');
  const petColorsKey = JSON.stringify(petColors || {});
  const aqFishKey = (aquarium?.activeFishIds || []).join(',');
  const aqModeKey = `${aquarium?.lightMode || 'day'}:${aquarium?.bubblesActive !== false}`;
  useEffect(() => {
    rebuildFnRef.current?.();
  }, [
    activeRoom,
    wallTheme,
    floorTheme,
    customWallHex,
    customFloorHex,
    customCeilingHex,
    showCeiling,
    colorsKey,
    skyMode,
    viewMode,
    lightsOn,
    fireplaceLit,
    placedKey,
    treeLevel,
    activeSeasonalEvent,
    glbUrlsKey,
    ownedPetsKey,
    deadPetsKey,
    petColorsKey,
    petGlbUrl,
    aqFishKey,
    aqModeKey,
    footprintWidth,
    footprintDepth,
    wallHeight,
    JSON.stringify(customWalls || []),
  ]);

  const transformsKey = JSON.stringify(furnitureTransforms || {});
  useEffect(() => {
    syncTransformsFnRef.current?.();
  }, [transformsKey, isEditMode, selectedFurnitureId]);

  return (
    <div className="relative w-full h-96 sm:h-[26rem] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none">
      <div ref={containerRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e0b36]/92 text-xs text-pink-200 font-semibold p-4 text-center">
          Restaurando cena 3D da Casa dos Sonhos...
        </div>
      )}
    </div>
  );
};
