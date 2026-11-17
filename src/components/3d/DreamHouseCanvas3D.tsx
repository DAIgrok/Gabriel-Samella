import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  HouseFloorTheme,
  HouseRoomId,
  HouseWallTheme,
  SeasonalEventId,
} from '../../types';

interface DreamHouseCanvas3DProps {
  activeRoom: HouseRoomId;
  wallTheme: HouseWallTheme;
  floorTheme: HouseFloorTheme;
  lightsOn: boolean;
  fireplaceLit: boolean;
  placedFurnitureIds: string[];
  treeLevel: number;
  activeSeasonalEvent?: SeasonalEventId;
  onInteractFurniture?: (furnitureId: string) => void;
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const disposeMat = (m: THREE.Material) => {
        const std = m as THREE.MeshStandardMaterial;
        if (std.map) std.map.dispose();
        m.dispose();
      };
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMat);
      } else {
        disposeMat(mesh.material);
      }
    }
  });
}

function createFloorTexture(theme: HouseFloorTheme, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (theme === 'wood') {
      ctx.fillStyle = '#5c3419';
      ctx.fillRect(0, 0, 512, 512);
      const plankH = 64;
      for (let y = 0; y < 512; y += plankH) {
        ctx.fillStyle = (y / plankH) % 2 === 0 ? '#693c1e' : '#532d15';
        ctx.fillRect(0, y, 512, plankH - 3);
        ctx.fillStyle = '#381d0c';
        ctx.fillRect(0, y + plankH - 3, 512, 3);
        const offset = ((y / plankH) % 2) * 128;
        ctx.fillRect(128 + offset, y, 3, plankH);
        ctx.fillRect(384 - offset, y, 3, plankH);
      }
    } else if (theme === 'marble') {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#2e1d44');
      grad.addColorStop(0.5, '#3f285e');
      grad.addColorStop(1, '#26173a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.22)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 75, 0);
        ctx.bezierCurveTo(i * 75 + 40, 170, i * 75 - 35, 340, i * 75 + 20, 512);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      for (let g = 0; g <= 512; g += 128) {
        ctx.strokeRect(g, 0, 128, 512);
        ctx.strokeRect(0, g, 512, 128);
      }
    } else if (theme === 'velvet') {
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 320);
      grad.addColorStop(0, '#701a4e');
      grad.addColorStop(1, '#3b0c29');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(251, 207, 232, 0.08)';
      for (let i = 0; i < 400; i++) {
        const x = (i * 73) % 512;
        const y = (i * 137) % 512;
        ctx.fillRect(x, y, 2, 2);
      }
    } else {
      const size = 64;
      for (let x = 0; x < 512; x += size) {
        for (let y = 0; y < 512; y += size) {
          const even = ((x / size) + (y / size)) % 2 === 0;
          ctx.fillStyle = even ? '#311b4e' : '#180c2b';
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

function createWallTexture(theme: HouseWallTheme, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const palette: Record<HouseWallTheme, [string, string, string]> = {
      lavender: ['#3b186f', '#240d48', 'rgba(233, 213, 255, 0.14)'],
      midnight: ['#160c2b', '#0b0518', 'rgba(192, 132, 252, 0.12)'],
      rosewood: ['#58102a', '#350819', 'rgba(251, 182, 206, 0.14)'],
      starlight: ['#1e1b4b', '#0f172a', 'rgba(253, 224, 71, 0.28)'],
      christmas: ['#14532d', '#09301a', 'rgba(251, 191, 36, 0.22)'],
      halloween: ['#3b0d4c', '#1c0526', 'rgba(249, 115, 22, 0.2)'],
    };
    const [topC, botC, stripeC] = palette[theme] || palette.lavender;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, topC);
    grad.addColorStop(0.7, botC);
    grad.addColorStop(1, '#1e1033');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle vertical wallpaper stripes above wainscot
    ctx.fillStyle = stripeC;
    for (let x = 16; x < 512; x += 32) {
      ctx.fillRect(x, 0, 6, 360);
    }

    if (theme === 'starlight') {
      ctx.fillStyle = '#fde68a';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 97 + 23) % 500;
        const sy = (i * 53 + 17) % 330;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3) + 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wainscoting lower paneling
    ctx.fillStyle = 'rgba(20, 8, 36, 0.52)';
    ctx.fillRect(0, 360, 512, 152);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.fillRect(0, 356, 512, 6);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.24)';
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

function buildCompositeFurniture(
  id: string,
  lightsOn: boolean,
  fireplaceLit: boolean
): { group: THREE.Group; emberMeshes: THREE.Mesh[]; flameLight?: THREE.PointLight; swingGroup?: THREE.Group } {
  const g = new THREE.Group();
  g.userData.furnitureId = id;
  const emberMeshes: THREE.Mesh[] = [];
  let flameLight: THREE.PointLight | undefined;
  let swingGroup: THREE.Group | undefined;

  const velvetPink = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.78 });
  const velvetLilac = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.75 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45, metalness: 0.08 });
  const woodWarm = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.48, metalness: 0.05 });
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.82 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.6 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });

  if (id === 'house-sofa') {
    g.position.set(-0.3, 0, -1.05);
    // Base & legs
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.24, 0.88), woodDark);
    base.position.y = 0.22;
    base.castShadow = true;
    g.add(base);
    [
      [-0.92, 0.06, -0.34],
      [0.92, 0.06, -0.34],
      [-0.92, 0.06, 0.34],
      [0.92, 0.06, 0.34],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.12, 10), goldTrim);
      leg.position.set(lx, ly, lz);
      g.add(leg);
    });
    // Seat cushions
    for (let i = -1; i <= 1; i++) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.78), velvetPink);
      seat.position.set(i * 0.64, 0.42, 0.02);
      seat.castShadow = true;
      g.add(seat);
    }
    // Backrest + armrests + throw pillows
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.62, 0.22), velvetPink);
    back.position.set(0, 0.68, -0.34);
    back.castShadow = true;
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.86), velvetPink);
    armL.position.set(-0.98, 0.48, 0);
    const armR = armL.clone();
    armR.position.x = 0.98;
    const pillL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.14), creamMat);
    pillL.position.set(-0.68, 0.62, -0.14);
    pillL.rotation.set(-0.2, 0.3, 0.12);
    const pillR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.14), velvetLilac);
    pillR.position.set(0.68, 0.62, -0.14);
    pillR.rotation.set(-0.2, -0.3, -0.12);
    g.add(back, armL, armR, pillL, pillR);
  } else if (id === 'house-rug') {
    g.position.set(0, 0.018, 0.25);
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.2, 0.024, 36),
      new THREE.MeshStandardMaterial({ color: 0x9d174d, roughness: 0.9 })
    );
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.84, 0.85, 0.028, 36),
      new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.85 })
    );
    const center = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.43, 0.032, 32),
      new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.82 })
    );
    outer.receiveShadow = true;
    inner.receiveShadow = true;
    g.add(outer, inner, center);
  } else if (id === 'house-lamp') {
    g.position.set(1.2, 0, -1.25);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 20), goldTrim);
    foot.position.y = 0.03;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.38, 12), goldTrim);
    pole.position.y = 0.72;
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: lightsOn ? 0xfbbf24 : 0x000000,
      emissiveIntensity: lightsOn ? 0.95 : 0,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.34, 20, 1, true), shadeMat);
    shade.position.y = 1.42;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), goldTrim);
    cap.position.y = 1.6;
    if (lightsOn) {
      const lampLight = new THREE.PointLight(0xfde68a, 1.15, 4.5);
      lampLight.position.y = 1.38;
      g.add(lampLight);
    }
    g.add(foot, pole, shade, cap);
  } else if (id === 'house-fireplace') {
    g.position.set(-1.72, 0, 0.15);
    g.rotation.y = Math.PI / 2;
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.12, 0.56), stoneMat);
    hearth.position.y = 0.06;
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.44), stoneMat);
    pillarL.position.set(-0.5, 0.55, 0);
    const pillarR = pillarL.clone();
    pillarR.position.x = 0.5;
    const mantel = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.14, 0.52), woodDark);
    mantel.position.y = 1.06;
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 0.38), stoneMat);
    chimney.position.y = 1.54;
    const firebox = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.76, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    firebox.position.set(0, 0.5, -0.05);
    const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 8), woodWarm);
    log1.rotation.z = Math.PI / 2;
    log1.position.set(0, 0.18, 0.02);
    g.add(hearth, pillarL, pillarR, mantel, chimney, firebox, log1);
    if (fireplaceLit) {
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0xf97316,
        emissiveIntensity: 1.6,
        roughness: 0.2,
      });
      for (let f = 0; f < 3; f++) {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09 - f * 0.015, 0.28 + f * 0.05, 8), flameMat);
        flame.position.set((f - 1) * 0.14, 0.32, 0.05);
        g.add(flame);
        emberMeshes.push(flame);
      }
      flameLight = new THREE.PointLight(0xfb923c, 1.5, 4.8);
      flameLight.position.set(0, 0.45, 0.25);
      g.add(flameLight);
    }
  } else if (id === 'house-piano') {
    g.position.set(1.22, 0, 0.45);
    g.rotation.y = -0.65;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 0.76), woodDark);
    body.position.y = 0.72;
    body.castShadow = true;
    const keys = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.22), creamMat);
    keys.position.set(0, 0.7, 0.42);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.05, 0.72), woodDark);
    lid.position.set(0, 1.06, -0.15);
    lid.rotation.x = -0.45;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.04), goldTrim);
    stand.position.set(0.35, 0.96, 0.05);
    [
      [-0.46, 0.27, -0.28],
      [0.46, 0.27, -0.28],
      [-0.46, 0.27, 0.28],
      [0.46, 0.27, 0.28],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.54, 10), woodDark);
      leg.position.set(lx, ly, lz);
      g.add(leg);
    });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.28), velvetPink);
    bench.position.set(0, 0.42, 0.78);
    g.add(body, keys, lid, stand, bench);
  } else if (id === 'house-bookshelf') {
    g.position.set(-1.55, 0, -1.25);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.65, 0.36), woodWarm);
    frame.position.y = 0.825;
    frame.castShadow = true;
    g.add(frame);
    const bookColors = [0xf43f5e, 0x38bdf8, 0xfbbf24, 0xa855f7, 0x34d399];
    [0.35, 0.78, 1.2].forEach((sy, sIdx) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.04, 0.38), woodDark);
      shelf.position.set(0, sy, 0.02);
      g.add(shelf);
      for (let b = 0; b < 5; b++) {
        const bk = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.26 + ((b + sIdx) % 2) * 0.06, 0.24),
          new THREE.MeshStandardMaterial({ color: bookColors[(b + sIdx) % bookColors.length], roughness: 0.5 })
        );
        bk.position.set(-0.32 + b * 0.15, sy + 0.16, 0.04);
        g.add(bk);
      }
    });
  } else if (id === 'house-cozy-bed' || id === 'house-canopy-bed') {
    const isCanopy = id === 'house-canopy-bed';
    g.position.set(isCanopy ? 0.1 : -0.25, 0, -0.78);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.26, 2.05), woodDark);
    frame.position.y = 0.22;
    frame.castShadow = true;
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.22, 1.92), creamMat);
    mattress.position.y = 0.44;
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.24, 1.28), isCanopy ? velvetPink : velvetLilac);
    blanket.position.set(0, 0.46, 0.34);
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.85, 0.14), woodWarm);
    headboard.position.set(0, 0.65, -0.98);
    const pilL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.36), creamMat);
    pilL.position.set(-0.42, 0.6, -0.68);
    const pilR = pilL.clone();
    pilR.position.x = 0.42;
    g.add(frame, mattress, blanket, headboard, pilL, pilR);
    if (isCanopy) {
      [
        [-0.82, 0.96, -0.96],
        [0.82, 0.96, -0.96],
        [-0.82, 0.96, 0.96],
        [0.82, 0.96, 0.96],
      ].forEach(([px, py, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.88, 10), woodDark);
        post.position.set(px, py, pz);
        g.add(post);
      });
      const canopyTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.72, 0.08, 1.98),
        new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.4, transparent: true, opacity: 0.85 })
      );
      canopyTop.position.y = 1.9;
      g.add(canopyTop);
    }
  } else if (id === 'house-vanity') {
    g.position.set(1.38, 0, -1.15);
    g.rotation.y = -0.35;
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.48), creamMat);
    table.position.y = 0.72;
    table.castShadow = true;
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 24),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.9, roughness: 0.08 })
    );
    mirror.position.set(0, 1.16, -0.16);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 10, 28), goldTrim);
    rim.position.set(0, 1.16, -0.16);
    [
      [-0.4, 0.35, -0.18],
      [0.4, 0.35, -0.18],
      [-0.4, 0.35, 0.18],
      [0.4, 0.35, 0.18],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.7, 8), goldTrim);
      leg.position.set(lx, ly, lz);
      g.add(leg);
    });
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 16), velvetPink);
    stool.position.set(0, 0.21, 0.54);
    g.add(table, mirror, rim, stool);
  } else if (id === 'house-balcony-bench') {
    g.position.set(-0.75, 0, -0.7);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.09, 0.48), woodWarm);
    seat.position.y = 0.42;
    seat.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.45, 0.08), woodWarm);
    back.position.set(0, 0.72, -0.22);
    back.rotation.x = -0.15;
    [-0.56, 0.56].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.46), woodDark);
      leg.position.set(lx, 0.21, 0);
      g.add(leg);
    });
    g.add(seat, back);
  } else if (id === 'house-balcony-swing') {
    g.position.set(1.0, 0, 0.15);
    g.rotation.y = -0.45;
    const standL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.85, 10), woodDark);
    standL.position.set(-0.62, 0.92, 0);
    const standR = standL.clone();
    standR.position.x = 0.62;
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 10), woodDark);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.y = 1.82;
    const pivot = new THREE.Group();
    pivot.position.y = 1.82;
    [-0.36, 0.36].forEach((rx) => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.25, 6), goldTrim);
      rope.position.set(rx, -0.62, 0);
      pivot.add(rope);
    });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.09, 0.42), velvetPink);
    bench.position.y = -1.24;
    pivot.add(bench);
    swingGroup = pivot;
    g.add(standL, standR, topBar, pivot);
  } else if (id === 'house-kitchen-island') {
    g.position.set(-0.35, 0, -0.82);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.85, 0.78), woodDark);
    body.position.y = 0.425;
    body.castShadow = true;
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(1.88, 0.09, 0.88),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.16, metalness: 0.1 })
    );
    counter.position.y = 0.89;
    const mug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 12), velvetPink);
    mug1.position.set(-0.3, 1.0, 0.1);
    const mug2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.13, 12), velvetLilac);
    mug2.position.set(-0.1, 1.0, 0.12);
    g.add(body, counter, mug1, mug2);
  } else if (id === 'house-tea-table') {
    g.position.set(0.95, 0, 0.52);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.65, 14), goldTrim);
    ped.position.y = 0.325;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24), creamMat);
    top.position.y = 0.68;
    top.castShadow = true;
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.14, 18), velvetPink);
    cake.position.set(0, 0.78, 0);
    const icing = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.04, 18), creamMat);
    icing.position.set(0, 0.85, 0);
    const berry = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.2 })
    );
    berry.position.set(0, 0.9, 0);
    g.add(ped, top, cake, icing, berry);
  }

  // Stamp furnitureId cleanly onto all descendant meshes so raycasting hits accurately
  g.traverse((ch) => {
    ch.userData.furnitureId = id;
  });

  return { group: g, emberMeshes, flameLight, swingGroup };
}

export const DreamHouseCanvas3D: React.FC<DreamHouseCanvas3DProps> = ({
  activeRoom,
  wallTheme,
  floorTheme,
  lightsOn,
  fireplaceLit,
  placedFurnitureIds,
  treeLevel,
  activeSeasonalEvent = 'normal',
  onInteractFurniture,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  const propsRef = useRef({
    activeRoom,
    wallTheme,
    floorTheme,
    lightsOn,
    fireplaceLit,
    placedFurnitureIds,
    treeLevel,
    activeSeasonalEvent,
    onInteractFurniture,
  });
  propsRef.current = {
    activeRoom,
    wallTheme,
    floorTheme,
    lightsOn,
    fireplaceLit,
    placedFurnitureIds,
    treeLevel,
    activeSeasonalEvent,
    onInteractFurniture,
  };

  const rebuildFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090314');
    scene.fog = new THREE.FogExp2(0x090314, 0.035);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(3.8, 3.3, 4.4);

    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    let isSoftwareGl = false;
    if (probeGl) {
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const gpu = String(probeGl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER));
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    } else {
      isSoftwareGl = true;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.58;
    roomEnv.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 8.4;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0.85, 0);

    // Warm/cool studio rig
    const hemiLight = new THREE.HemisphereLight(0xfbcfe8, 0x1e0b36, 0.72);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1db, 1.85);
    keyLight.position.set(4.5, 6.8, 5.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.8;
    keyLight.shadow.camera.bottom = -2.5;
    scene.add(keyLight);

    const roomLight = new THREE.PointLight(0xfde68a, 1.4, 9.5);
    roomLight.position.set(0, 2.35, 0.2);
    scene.add(roomLight);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    let emberMeshes: THREE.Mesh[] = [];
    let flameLights: THREE.PointLight[] = [];
    let swingGroups: THREE.Group[] = [];
    let balconyTreeGroup: THREE.Group | null = null;

    const rebuildRoom = () => {
      const {
        activeRoom: room,
        wallTheme: wTheme,
        floorTheme: fTheme,
        lightsOn: lOn,
        fireplaceLit: fLit,
        placedFurnitureIds: fIds,
        treeLevel: tLevel,
        activeSeasonalEvent: seasonal,
      } = propsRef.current;

      while (roomGroup.children.length > 0) {
        const ch = roomGroup.children[0];
        roomGroup.remove(ch);
        disposeObject3D(ch);
      }
      emberMeshes = [];
      flameLights = [];
      swingGroups = [];
      balconyTreeGroup = null;

      roomLight.intensity = lOn ? 1.45 : 0.28;
      hemiLight.intensity = lOn ? 0.78 : 0.36;
      keyLight.intensity = lOn ? 1.85 : 0.8;

      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const floorTex = createFloorTexture(fTheme, maxAniso);
      const wallTex = createWallTexture(wTheme, maxAniso);

      // Dollhouse foundation plinth
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(4.48, 0.24, 3.88),
        new THREE.MeshStandardMaterial({ color: 0x16072b, roughness: 0.55, metalness: 0.18 })
      );
      plinth.position.y = -0.12;
      plinth.receiveShadow = true;
      roomGroup.add(plinth);

      // Floor surface
      const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.04, 3.6),
        new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.58, metalness: 0.05 })
      );
      floorMesh.position.y = -0.02;
      floorMesh.receiveShadow = true;
      roomGroup.add(floorMesh);

      const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.72,
        metalness: 0.04,
      });

      if (room === 'varanda') {
        // Cozy glass & wood railing overlooking Sacred Love Tree
        const railMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45 });
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xa5f3fc,
          roughness: 0.1,
          metalness: 0.2,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        });
        const backRailTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.09, 0.12), railMat);
        backRailTop.position.set(0, 0.92, -1.72);
        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.85, 0.04), glassMat);
        backGlass.position.set(0, 0.46, -1.72);
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 3.5), railMat);
        leftRail.position.set(-2.04, 0.92, 0);
        roomGroup.add(backRailTop, backGlass, leftRail);

        // Distant glowing Sanctuary Love Tree scaled by treeLevel
        const miniTree = new THREE.Group();
        const scaleT = 0.55 + (tLevel / 10) * 0.75;
        miniTree.position.set(0, -0.3, -3.5);
        miniTree.scale.setScalar(scaleT);
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.24, 1.5, 10),
          new THREE.MeshStandardMaterial({ color: 0x3b1947, roughness: 0.65 })
        );
        trunk.position.y = 0.75;
        const canopy = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.88, 1),
          new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xdb2777,
            emissiveIntensity: 0.75,
            roughness: 0.38,
          })
        );
        canopy.position.y = 1.85;
        canopy.scale.set(1.3, 0.85, 1.2);
        miniTree.add(trunk, canopy);
        roomGroup.add(miniTree);
        balconyTreeGroup = miniTree;
      } else {
        // Diorama Cutaway Corner Walls (back + left)
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 0.14), wallMat);
        backWall.position.set(0, 1.2, -1.75);
        backWall.receiveShadow = true;
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.4, 3.6), wallMat);
        leftWall.position.set(-2.05, 1.2, -0.02);
        leftWall.receiveShadow = true;
        roomGroup.add(backWall, leftWall);

        // Glowing Starry Window on Back Wall
        const winFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.16, 1.06, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45 })
        );
        winFrame.position.set(0.85, 1.42, -1.66);
        const winGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(0.98, 0.88),
          new THREE.MeshStandardMaterial({
            color: seasonal === 'natal' ? 0x93c5fd : seasonal === 'halloween' ? 0x7e22ce : 0x312e81,
            emissive: seasonal === 'halloween' ? 0xf97316 : 0x818cf8,
            emissiveIntensity: 0.6,
            roughness: 0.15,
          })
        );
        winGlass.position.set(0.85, 1.42, -1.61);
        roomGroup.add(winFrame, winGlass);

        // Couple Heart Wall Frame on Left Wall
        const frameOuter = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.64, 0.84),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.78 })
        );
        frameOuter.position.set(-1.96, 1.48, -0.58);
        const frameArt = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, 0.5, 0.7),
          new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xbe185d,
            emissiveIntensity: 0.35,
            roughness: 0.4,
          })
        );
        frameArt.position.set(-1.955, 1.48, -0.58);
        roomGroup.add(frameOuter, frameArt);
      }

      // Seasonal miniature detail inside the room
      if (seasonal === 'natal') {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(1.62, 0, -1.32);
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.14, 0.22, 12),
          new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 })
        );
        pot.position.y = 0.11;
        const pine = new THREE.Mesh(
          new THREE.ConeGeometry(0.36, 0.92, 12),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })
        );
        pine.position.y = 0.66;
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.08),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 1.2 })
        );
        star.position.y = 1.18;
        treeGroup.add(pot, pine, star);
        roomGroup.add(treeGroup);
      } else if (seasonal === 'halloween') {
        const pump = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 12),
          new THREE.MeshStandardMaterial({
            color: 0xf97316,
            emissive: 0xea580c,
            emissiveIntensity: 0.85,
            roughness: 0.4,
          })
        );
        pump.scale.set(1.2, 0.88, 1.2);
        pump.position.set(1.62, 0.16, 1.12);
        roomGroup.add(pump);
      }

      // Render Placed Furniture in this Room
      fIds.forEach((fId) => {
        const built = buildCompositeFurniture(fId, lOn, fLit);
        roomGroup.add(built.group);
        emberMeshes.push(...built.emberMeshes);
        if (built.flameLight) flameLights.push(built.flameLight);
        if (built.swingGroup) swingGroups.push(built.swingGroup);
      });
    };

    rebuildFnRef.current = rebuildRoom;
    rebuildRoom();

    // Pointer Raycasting for clicking furniture
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(roomGroup.children, true);
      const hit = hits.find((h) => h.object.userData?.furnitureId);
      if (hit && propsRef.current.onInteractFurniture) {
        propsRef.current.onInteractFurniture(String(hit.object.userData.furnitureId));
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

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
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        for (let i = 0; i < emberMeshes.length; i++) {
          const s = 0.88 + Math.sin(t * 7.5 + i * 1.4) * 0.22;
          emberMeshes[i].scale.set(1, s, 1);
        }
        for (let i = 0; i < flameLights.length; i++) {
          flameLights[i].intensity = 1.35 + Math.sin(t * 9.0 + i) * 0.3;
        }
        for (let i = 0; i < swingGroups.length; i++) {
          swingGroups[i].rotation.x = Math.sin(t * 1.8) * 0.1;
        }
        if (balconyTreeGroup) {
          balconyTreeGroup.rotation.y = Math.sin(t * 0.35) * 0.08;
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
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      disposeObject3D(roomGroup);
      envTarget.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const placedKey = placedFurnitureIds.join(',');
  useEffect(() => {
    rebuildFnRef.current?.();
  }, [activeRoom, wallTheme, floorTheme, lightsOn, fireplaceLit, placedKey, treeLevel, activeSeasonalEvent]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none bg-[#090314]">
      <div ref={containerRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0318]/90 text-xs text-pink-200 font-semibold p-4 text-center">
          Restaurando cena 3D da Casa dos Sonhos...
        </div>
      )}
    </div>
  );
};
