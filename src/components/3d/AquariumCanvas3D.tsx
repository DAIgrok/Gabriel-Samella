import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AQUARIUM_SPECIES_CATALOG } from '../../data/initialData';
import { AquariumLightMode } from '../../types';
import {
  addCozyThreePointLights,
  detectSoftwareWebGL,
  disposeObject3D,
  setupCozyStudioRenderer,
} from '../../utils/threeCozyHelpers';

interface AquariumCanvas3DProps {
  lightMode: AquariumLightMode;
  waterClarity: number;
  bubblesActive: boolean;
  activeFishIds: string[];
  activeDecorIds: string[];
  feedPulseCount: number;
  onTapFish?: (fishName: string) => void;
}

interface SwimActor {
  group: THREE.Group;
  tailObj: THREE.Object3D;
  finL?: THREE.Object3D;
  finR?: THREE.Object3D;
  fishName: string;
  baseY: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  boostTimer: number;
}

function createSandTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#f3d5a5');
    grad.addColorStop(0.5, '#fae3be');
    grad.addColorStop(1, '#e8c28c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(255, 252, 240, 0.35)';
    ctx.lineWidth = 4;
    for (let y = 18; y < 256; y += 34) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y - 10, 170, y + 10, 256, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, maxAniso);
  return tex;
}

function createCausticsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    for (let i = 0; i < 18; i++) {
      const cx = (Math.sin(i * 2.4) * 0.4 + 0.5) * 256;
      const cy = (Math.cos(i * 1.9) * 0.4 + 0.5) * 256;
      const rad = 28 + (i % 4) * 14;
      const grad = ctx.createRadialGradient(cx, cy, rad * 0.35, cx, cy, rad);
      grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
      grad.addColorStop(0.75, 'rgba(125, 211, 252, 0.48)');
      grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildFishMesh(fishId: string): {
  group: THREE.Group;
  tailObj: THREE.Object3D;
  finL?: THREE.Object3D;
  finR?: THREE.Object3D;
  fishName: string;
} {
  const spec = AQUARIUM_SPECIES_CATALOG.find((f) => f.id === fishId) || AQUARIUM_SPECIES_CATALOG[0];
  const g = new THREE.Group();
  const s = spec.scale || 1;
  g.scale.setScalar(s);

  const mainMat = new THREE.MeshStandardMaterial({
    color: spec.colorHex,
    roughness: 0.55,
    metalness: 0.05,
  });
  const accMat = new THREE.MeshStandardMaterial({
    color: spec.accentHex,
    emissive: fishId === 'jellyfish' ? spec.accentHex : 0x000000,
    emissiveIntensity: fishId === 'jellyfish' ? 0.85 : 0,
    roughness: 0.52,
  });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.08 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  let tailObj: THREE.Object3D;
  let finL: THREE.Object3D | undefined;
  let finR: THREE.Object3D | undefined;

  if (fishId === 'jellyfish') {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new THREE.MeshStandardMaterial({
        color: spec.colorHex,
        emissive: spec.colorHex,
        emissiveIntensity: 0.72,
        transparent: true,
        opacity: 0.84,
        roughness: 0.3,
      })
    );
    const tentacles = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const tent = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.3, 6, 8), accMat);
      tent.position.set(Math.cos(a) * 0.08, -0.17, Math.sin(a) * 0.08);
      tentacles.add(tent);
    }
    g.add(dome, tentacles);
    tailObj = tentacles;
  } else if (fishId === 'seahorse') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.078, 0.22, 10, 16), mainMat);
    const snout = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.09, 6, 10), mainMat);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(0.11, 0.12, 0);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.024, 10, 18, Math.PI * 1.4), accMat);
    tail.position.set(-0.04, -0.18, 0);
    const finGeo = new THREE.SphereGeometry(0.065, 12, 10);
    finGeo.scale(1.1, 1.35, 0.25);
    const fin = new THREE.Mesh(finGeo, accMat);
    fin.position.set(-0.085, 0.02, 0);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), eyeMat);
    eyeL.position.set(0.06, 0.14, 0.06);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), catchlightMat);
    hl.position.set(0.008, 0.008, 0.018);
    eyeL.add(hl);
    const eyeR = eyeL.clone();
    eyeR.position.z = -0.06;
    g.add(body, snout, tail, fin, eyeL, eyeR);
    tailObj = fin;
  } else {
    // Cozy Stylized Chibi Swimmer with articulated pectoral & caudal fins + catchlight eyes
    const bodyGeo = new THREE.SphereGeometry(0.17, 22, 16);
    bodyGeo.scale(1.55, fishId === 'angelfish' ? 1.34 : 0.94, 0.74);
    const body = new THREE.Mesh(bodyGeo, mainMat);
    body.castShadow = true;

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 12), accMat);
    belly.scale.set(1.22, 0.56, 0.68);
    belly.position.set(0.02, -0.055, 0);

    const dorsalGeo = new THREE.SphereGeometry(0.095, 14, 12);
    dorsalGeo.scale(1.25, 0.9, 0.25);
    const dorsal = new THREE.Mesh(dorsalGeo, accMat);
    dorsal.position.set(-0.02, 0.14, 0);
    dorsal.rotation.z = -0.35;

    // Articulated Pectoral Fins
    const pectGeo = new THREE.SphereGeometry(0.075, 12, 10);
    pectGeo.scale(1.3, 0.65, 0.18);
    const lFinPivot = new THREE.Group();
    lFinPivot.position.set(0.04, -0.02, 0.11);
    const lFin = new THREE.Mesh(pectGeo, accMat);
    lFin.position.set(-0.04, 0, 0.03);
    lFin.rotation.y = 0.45;
    lFinPivot.add(lFin);
    finL = lFinPivot;

    const rFinPivot = new THREE.Group();
    rFinPivot.position.set(0.04, -0.02, -0.11);
    const rFin = new THREE.Mesh(pectGeo, accMat);
    rFin.position.set(-0.04, 0, -0.03);
    rFin.rotation.y = -0.45;
    rFinPivot.add(rFin);
    finR = rFinPivot;

    // Articulated Flowing Caudal Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.22, 0, 0);
    const tailGeo = new THREE.SphereGeometry(fishId === 'betta' ? 0.155 : 0.115, 14, 12);
    tailGeo.scale(1.35, 1.1, 0.24);
    const tailFin = new THREE.Mesh(tailGeo, accMat);
    tailFin.position.x = -0.08;
    tailGroup.add(tailFin);

    // Glossy eyes with white catchlight
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), eyeMat);
    eyeL.position.set(0.16, 0.042, 0.085);
    const hlL = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), catchlightMat);
    hlL.position.set(0.01, 0.01, 0.022);
    eyeL.add(hlL);
    const eyeR = eyeL.clone();
    eyeR.position.z = -0.085;

    g.add(body, belly, dorsal, lFinPivot, rFinPivot, tailGroup, eyeL, eyeR);
    tailObj = tailGroup;
  }

  g.traverse((ch) => {
    ch.userData.fishName = spec.name;
  });

  return { group: g, tailObj, finL, finR, fishName: spec.name };
}

function buildDecorMesh(decorId: string): THREE.Group {
  const g = new THREE.Group();
  if (decorId === 'coral') {
    g.position.set(-1.32, 0.06, -0.55);
    const coralPink = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 });
    const coralTeal = new THREE.MeshStandardMaterial({ color: 0x5eead4, roughness: 0.6 });
    const coralPeach = new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.6 });
    [
      [0, 0.28, 0, 0.105, 0.55, 0, coralPink],
      [-0.15, 0.2, 0.08, 0.08, 0.4, 0.35, coralTeal],
      [0.15, 0.22, -0.06, 0.08, 0.44, -0.35, coralPink],
      [-0.06, 0.15, 0.15, 0.065, 0.28, 0.18, coralPeach],
    ].forEach(([px, py, pz, r, h, rz, mat]) => {
      const branch = new THREE.Mesh(
        new THREE.CapsuleGeometry(r as number, h as number, 8, 14),
        mat as THREE.Material
      );
      branch.position.set(px as number, py as number, pz as number);
      branch.rotation.z = rz as number;
      branch.castShadow = true;
      g.add(branch);
    });
  } else if (decorId === 'castle') {
    g.position.set(1.22, 0.06, -0.42);
    const stone = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.66 });
    const roof = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.55 });
    const pearl = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const keep = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.54, 0.5, 4, 0.06), stone);
    keep.position.y = 0.27;
    keep.castShadow = true;
    const towerL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.78, 18), stone);
    towerL.position.set(-0.28, 0.39, 0.2);
    const coneL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.26, 18), roof);
    coneL.position.set(-0.28, 0.9, 0.2);
    const towerR = towerL.clone();
    towerR.position.set(0.28, 0.39, -0.2);
    const coneR = coneL.clone();
    coneR.position.set(0.28, 0.9, -0.2);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), pearl);
    orb.position.set(0, 0.66, 0);
    g.add(keep, towerL, coneL, towerR, coneR, orb);
  } else if (decorId === 'ship') {
    g.position.set(-0.2, 0.06, 0.48);
    g.rotation.set(0.08, 0.4, -0.12);
    const wood = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.68 });
    const sail = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.65, side: THREE.DoubleSide });
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.52, 10, 14), wood);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.85, 1, 1.25);
    hull.position.y = 0.16;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.72, 10), wood);
    mast.position.y = 0.52;
    const sailMesh = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.42, 0.03, 2, 0.015), sail);
    sailMesh.position.set(0, 0.56, 0.03);
    g.add(hull, mast, sailMesh);
  } else if (decorId === 'crystal') {
    g.position.set(0.45, 0.06, 0.58);
    const cMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const c1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), cMat);
    c1.scale.set(0.65, 1.8, 0.65);
    c1.position.y = 0.28;
    const c2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), cMat);
    c2.scale.set(0.65, 1.6, 0.65);
    c2.position.set(0.18, 0.18, 0.06);
    c2.rotation.z = -0.35;
    g.add(c1, c2);
  }
  return g;
}

export const AquariumCanvas3D: React.FC<AquariumCanvas3DProps> = ({
  lightMode,
  waterClarity,
  bubblesActive,
  activeFishIds,
  activeDecorIds,
  feedPulseCount,
  onTapFish,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  const propsRef = useRef({
    lightMode,
    waterClarity,
    bubblesActive,
    activeFishIds,
    activeDecorIds,
    onTapFish,
  });
  propsRef.current = {
    lightMode,
    waterClarity,
    bubblesActive,
    activeFishIds,
    activeDecorIds,
    onTapFish,
  };

  const rebuildFnRef = useRef<(() => void) | null>(null);
  const spawnFoodFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0c1f42');
    scene.fog = new THREE.FogExp2(0x0c1f42, 0.018);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 1.95, 5.25);

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    const disposeEnv = setupCozyStudioRenderer(renderer, scene, isSoftwareGl);
    scene.environmentIntensity = 0.78;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 3.4;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minPolarAngle = Math.PI / 7;
    controls.target.set(0, 1.05, 0);

    addCozyThreePointLights(scene, {
      skyColor: 0xbae6fd,
      groundColor: 0xfde68a,
      hemiIntensity: 1.15,
      keyColor: 0xfff8eb,
      keyIntensity: 2.0,
      keyPosition: [3.2, 6.2, 4.0],
      rimColor: 0xe879f9,
      rimIntensity: 1.35,
      rimPosition: [-4.0, 3.2, -3.5],
      fillColor: 0x67e8f9,
      fillIntensity: 0.72,
      shadowMapSize: isSoftwareGl ? 512 : 1024,
      shadowExtent: 3.4,
      isSoftwareGl,
    });

    const tankTopLight = new THREE.PointLight(0x7dd3fc, 2.1, 11);
    tankTopLight.position.set(0, 2.6, 0.4);
    scene.add(tankTopLight);

    // Tank Base & Pedestal + Warm Sand Floor + Animated Caustics
    const tankStaticGroup = new THREE.Group();
    scene.add(tankStaticGroup);

    const tankBase = new THREE.Mesh(
      new RoundedBoxGeometry(4.32, 0.26, 2.72, 4, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x2a144a, roughness: 0.62, metalness: 0.12 })
    );
    tankBase.position.y = -0.12;
    tankBase.receiveShadow = true;
    tankStaticGroup.add(tankBase);

    const sandTex = createSandTexture(renderer.capabilities.getMaxAnisotropy());
    const sandFloor = new THREE.Mesh(
      new RoundedBoxGeometry(4.06, 0.14, 2.46, 3, 0.04),
      new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.74 })
    );
    sandFloor.position.y = 0.05;
    sandFloor.receiveShadow = true;
    tankStaticGroup.add(sandFloor);

    // Smooth rounded ocean pebbles on seabed
    const oceanPebbleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.62 });
    const oceanPebbleGeo = new THREE.SphereGeometry(0.11, 14, 10);
    [
      [-0.85, 0.12, 0.55, 1.2],
      [0.95, 0.12, 0.32, 0.9],
      [-0.35, 0.12, -0.62, 1.05],
      [0.25, 0.12, 0.8, 0.8],
    ].forEach(([px, py, pz, sc]) => {
      const pb = new THREE.Mesh(oceanPebbleGeo, oceanPebbleMat);
      pb.position.set(px, py, pz);
      pb.scale.set(sc * 1.25, sc * 0.55, sc);
      tankStaticGroup.add(pb);
    });

    // Animated Caustics Glow Overlay on Sandbed
    const causticsTex = createCausticsTexture();
    const causticsMat = new THREE.MeshBasicMaterial({
      map: causticsTex,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const causticsPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.96, 2.36), causticsMat);
    causticsPlane.rotation.x = -Math.PI / 2;
    causticsPlane.position.y = 0.128;
    tankStaticGroup.add(causticsPlane);

    // Outer Aquarium Physical Crystal Glass Walls (clearcoat + IOR, depthWrite: false)
    const waterVolumeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.45,
      reflectivity: 0.92,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const waterBox = new THREE.Mesh(new THREE.BoxGeometry(4.08, 2.18, 2.48), waterVolumeMat);
    waterBox.position.y = 1.15;
    waterBox.renderOrder = 10;
    tankStaticGroup.add(waterBox);

    // Volumetric Underwater Light Ray Shafts
    const rayShaftMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.085,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const rayShafts: THREE.Mesh[] = [];
    [
      [-0.85, 1.35, -0.15, -0.22],
      [0.05, 1.38, 0.1, 0.08],
      [0.95, 1.32, -0.12, 0.24],
    ].forEach(([rx, ry, rz, rotZ]) => {
      const shaft = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.9, 16, 1, true), rayShaftMat);
      shaft.position.set(rx, ry, rz);
      shaft.rotation.z = rotZ;
      tankStaticGroup.add(shaft);
      rayShafts.push(shaft);
    });

    // Tank Top Frame Rim (Cozy Beveled Cap)
    const topRim = new THREE.Mesh(
      new RoundedBoxGeometry(4.28, 0.1, 2.68, 3, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x3b1f66, roughness: 0.52, metalness: 0.25 })
    );
    topRim.position.y = 2.26;
    tankStaticGroup.add(topRim);

    // Rising Bubbles System
    const bubbleCount = isSoftwareGl ? 32 : 56;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    const bubbleVel = new Float32Array(bubbleCount);
    for (let i = 0; i < bubbleCount; i++) {
      bubblePos[i * 3] = (Math.random() - 0.5) * 3.5;
      bubblePos[i * 3 + 1] = 0.2 + Math.random() * 1.9;
      bubblePos[i * 3 + 2] = (Math.random() - 0.5) * 1.9;
      bubbleVel[i] = 0.008 + Math.random() * 0.014;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.085,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubblePoints);

    // Food pellets falling on feed
    const foodGroup = new THREE.Group();
    scene.add(foodGroup);
    const activePellets: { mesh: THREE.Mesh; speed: number }[] = [];
    const pelletGeo = new THREE.SphereGeometry(0.036, 8, 8);
    const pelletMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      roughness: 0.4,
    });
    spawnFoodFnRef.current = () => {
      for (let i = 0; i < 12; i++) {
        const p = new THREE.Mesh(pelletGeo, pelletMat);
        p.position.set((Math.random() - 0.5) * 2.8, 2.05 + Math.random() * 0.15, (Math.random() - 0.5) * 1.6);
        foodGroup.add(p);
        activePellets.push({ mesh: p, speed: 0.012 + Math.random() * 0.01 });
      }
    };

    // Dynamic Fish & Decor Group
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    const swimActors: SwimActor[] = [];

    const rebuildAquarium = () => {
      const { activeFishIds: fishes, activeDecorIds: decors, lightMode: lMode, waterClarity: clarity } =
        propsRef.current;

      while (dynamicGroup.children.length > 0) {
        const ch = dynamicGroup.children[0];
        dynamicGroup.remove(ch);
        disposeObject3D(ch);
      }
      swimActors.length = 0;

      // Apply light mode colors
      if (lMode === 'bioluminescent') {
        tankTopLight.color.setHex(0xc084fc);
        waterVolumeMat.color.setHex(0x6d28d9);
      } else if (lMode === 'sunlight') {
        tankTopLight.color.setHex(0xfef08a);
        waterVolumeMat.color.setHex(0x38bdf8);
      } else if (lMode === 'moonlight') {
        tankTopLight.color.setHex(0x818cf8);
        waterVolumeMat.color.setHex(0x1e3a8a);
      } else {
        tankTopLight.color.setHex(0xf472b6);
        waterVolumeMat.color.setHex(0x0d9488);
      }
      const murkyFactor = Math.max(0, (100 - clarity) / 100);
      waterVolumeMat.opacity = 0.13 + murkyFactor * 0.25;

      // Decor
      decors.forEach((dId) => {
        const dec = buildDecorMesh(dId);
        dynamicGroup.add(dec);
      });

      // Fish with articulated pectoral & caudal fins
      fishes.forEach((fId, idx) => {
        const built = buildFishMesh(fId);
        dynamicGroup.add(built.group);
        swimActors.push({
          group: built.group,
          tailObj: built.tailObj,
          finL: built.finL,
          finR: built.finR,
          fishName: built.fishName,
          baseY: 0.52 + ((idx % 4) * 0.34),
          radiusX: 1.05 + ((idx % 3) * 0.32),
          radiusZ: 0.56 + ((idx % 2) * 0.28),
          speed: 0.42 + (idx % 4) * 0.13,
          phase: idx * 1.45,
          boostTimer: 0,
        });
      });
    };

    rebuildFnRef.current = rebuildAquarium;
    rebuildAquarium();

    // Pointer raycasting for tapping fish
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
      const hits = raycaster.intersectObjects(dynamicGroup.children, true);
      const hit = hits.find((h) => h.object.userData?.fishName);
      if (hit) {
        const fName = String(hit.object.userData.fishName);
        const actor = swimActors.find((a) => a.fishName === fName);
        if (actor) actor.boostTimer = 1.6;
        propsRef.current.onTapFish?.(fName);
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
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      if (!prefersReducedMotion) {
        // Animate caustics ripple & volumetric ray pulse
        causticsTex.offset.x = (t * 0.03) % 1;
        causticsTex.offset.y = (t * 0.022) % 1;
        rayShaftMat.opacity = 0.07 + Math.sin(t * 1.3) * 0.025;

        // Smooth curved figure-8 swim paths + pectoral & caudal fin undulation
        for (let i = 0; i < swimActors.length; i++) {
          const a = swimActors[i];
          if (a.boostTimer > 0) a.boostTimer = Math.max(0, a.boostTimer - dt);
          const boostMult = a.boostTimer > 0 ? 2.1 : 1.0;
          const ang = t * a.speed * boostMult + a.phase;
          const nx = Math.cos(ang) * a.radiusX;
          const nz = Math.sin(ang * 1.6) * a.radiusZ;
          const ny = a.baseY + Math.sin(t * 1.9 + a.phase) * 0.14;

          const dx = -Math.sin(ang) * a.radiusX * a.speed * boostMult;
          const dz = Math.cos(ang * 1.6) * a.radiusZ * a.speed * boostMult * 1.6;
          const dy = Math.cos(t * 1.9 + a.phase) * 0.14 * 1.9;
          a.group.position.set(nx, ny, nz);
          a.group.rotation.y = Math.atan2(-dz, dx);
          a.group.rotation.x = Math.sin(ang * 1.6) * 0.08;
          a.group.rotation.z = Math.max(-0.22, Math.min(0.22, dy * 0.45));

          a.tailObj.rotation.y = Math.sin(t * 10.2 * boostMult + a.phase) * 0.44;
          const finFlutter = Math.sin(t * 8.5 * boostMult + a.phase) * 0.36;
          if (a.finL) a.finL.rotation.y = 0.35 + finFlutter;
          if (a.finR) a.finR.rotation.y = -0.35 - finFlutter;
        }

        // Bubbles
        bubblePoints.visible = propsRef.current.bubblesActive;
        if (propsRef.current.bubblesActive) {
          const bArr = bubbleGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < bubbleCount; i++) {
            bArr[i * 3 + 1] += bubbleVel[i];
            bArr[i * 3] += Math.sin(t * 2 + i) * 0.002;
            if (bArr[i * 3 + 1] > 2.12) {
              bArr[i * 3 + 1] = 0.18;
            }
          }
          bubbleGeo.attributes.position.needsUpdate = true;
        }

        // Falling food pellets
        for (let i = activePellets.length - 1; i >= 0; i--) {
          const p = activePellets[i];
          p.mesh.position.y -= p.speed;
          if (p.mesh.position.y <= 0.14) {
            foodGroup.remove(p.mesh);
            activePellets.splice(i, 1);
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else animId = requestAnimationFrame(tick);
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
      disposeObject3D(tankStaticGroup);
      disposeObject3D(dynamicGroup);
      bubbleGeo.dispose();
      bubbleMat.dispose();
      pelletGeo.dispose();
      pelletMat.dispose();
      causticsTex.dispose();
      disposeEnv();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const fishKey = activeFishIds.join(',');
  const decorKey = activeDecorIds.join(',');
  useEffect(() => {
    rebuildFnRef.current?.();
  }, [lightMode, waterClarity, fishKey, decorKey]);

  useEffect(() => {
    if (feedPulseCount > 0) {
      spawnFoodFnRef.current?.();
    }
  }, [feedPulseCount]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none bg-[#0c1f42]">
      <div ref={containerRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0c1f42]/90 text-xs text-cyan-200 font-semibold p-4 text-center">
          Restaurando Aquário Mágico 3D...
        </div>
      )}
    </div>
  );
};
