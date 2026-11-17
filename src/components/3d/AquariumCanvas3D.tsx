import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AQUARIUM_SPECIES_CATALOG } from '../../data/initialData';
import { AquariumLightMode } from '../../types';

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
  fishName: string;
  baseY: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  boostTimer: number;
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const disposeMat = (m: THREE.Material) => {
        const std = m as THREE.MeshStandardMaterial;
        if (std.map) std.map.dispose();
        m.dispose();
      };
      if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMat);
      else disposeMat(mesh.material);
    }
  });
}

function createSandTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#c2a67a');
    grad.addColorStop(0.5, '#d6ba8e');
    grad.addColorStop(1, '#b39468');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(255, 245, 225, 0.28)';
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

function buildFishMesh(fishId: string): { group: THREE.Group; tailObj: THREE.Object3D; fishName: string } {
  const spec = AQUARIUM_SPECIES_CATALOG.find((f) => f.id === fishId) || AQUARIUM_SPECIES_CATALOG[0];
  const g = new THREE.Group();
  const s = spec.scale || 1;
  g.scale.setScalar(s);

  const mainMat = new THREE.MeshStandardMaterial({
    color: spec.colorHex,
    roughness: 0.25,
    metalness: 0.12,
  });
  const accMat = new THREE.MeshStandardMaterial({
    color: spec.accentHex,
    emissive: fishId === 'jellyfish' ? spec.accentHex : 0x000000,
    emissiveIntensity: fishId === 'jellyfish' ? 0.8 : 0,
    roughness: 0.3,
  });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

  let tailObj: THREE.Object3D;

  if (fishId === 'jellyfish') {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({
        color: spec.colorHex,
        emissive: spec.colorHex,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.8,
        roughness: 0.15,
      })
    );
    const tentacles = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.34, 6), accMat);
      tent.position.set(Math.cos(a) * 0.08, -0.17, Math.sin(a) * 0.08);
      tentacles.add(tent);
    }
    g.add(dome, tentacles);
    tailObj = tentacles;
  } else if (fishId === 'seahorse') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 8, 12), mainMat);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.12, 8), mainMat);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(0.11, 0.12, 0);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 16, Math.PI * 1.4), accMat);
    tail.position.set(-0.04, -0.18, 0);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.02), accMat);
    fin.position.set(-0.08, 0.02, 0);
    g.add(body, snout, tail, fin);
    tailObj = fin;
  } else {
    // Sleek composite swimmer (Clownfish, Betta, Angel, Koi, Shark, Dolphin, Whale)
    const bodyGeo = new THREE.SphereGeometry(0.16, 16, 12);
    bodyGeo.scale(1.55, fishId === 'angelfish' ? 1.32 : 0.9, 0.72);
    const body = new THREE.Mesh(bodyGeo, mainMat);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), accMat);
    belly.scale.set(1.2, 0.55, 0.65);
    belly.position.set(0.02, -0.05, 0);

    const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 8), accMat);
    dorsal.position.set(-0.02, 0.15, 0);
    dorsal.rotation.z = 0.35;

    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.22, 0, 0);
    const tailFin = new THREE.Mesh(
      new THREE.ConeGeometry(fishId === 'betta' ? 0.18 : 0.12, 0.22, 10),
      accMat
    );
    tailFin.rotation.z = -Math.PI / 2;
    tailFin.scale.set(1, 1, 0.32);
    tailFin.position.x = -0.08;
    tailGroup.add(tailFin);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), eyeMat);
    eyeL.position.set(0.16, 0.04, 0.082);
    const eyeR = eyeL.clone();
    eyeR.position.z = -0.082;

    g.add(body, belly, dorsal, tailGroup, eyeL, eyeR);
    tailObj = tailGroup;
  }

  g.traverse((ch) => {
    ch.userData.fishName = spec.name;
  });

  return { group: g, tailObj, fishName: spec.name };
}

function buildDecorMesh(decorId: string): THREE.Group {
  const g = new THREE.Group();
  if (decorId === 'coral') {
    g.position.set(-1.32, 0.05, -0.55);
    const coralPink = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.45 });
    const coralTeal = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.45 });
    [
      [0, 0.28, 0, 0.1, 0.55, 0, coralPink],
      [-0.14, 0.2, 0.08, 0.075, 0.4, 0.35, coralTeal],
      [0.14, 0.22, -0.06, 0.075, 0.44, -0.35, coralPink],
    ].forEach(([px, py, pz, r, h, rz, mat]) => {
      const branch = new THREE.Mesh(
        new THREE.CapsuleGeometry(r as number, h as number, 6, 10),
        mat as THREE.Material
      );
      branch.position.set(px as number, py as number, pz as number);
      branch.rotation.z = rz as number;
      g.add(branch);
    });
  } else if (decorId === 'castle') {
    g.position.set(1.22, 0.05, -0.42);
    const stone = new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.7 });
    const roof = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.38 });
    const pearl = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });
    const keep = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.54, 0.48), stone);
    keep.position.y = 0.27;
    const towerL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.78, 12), stone);
    towerL.position.set(-0.28, 0.39, 0.2);
    const coneL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.26, 12), roof);
    coneL.position.set(-0.28, 0.9, 0.2);
    const towerR = towerL.clone();
    towerR.position.set(0.28, 0.39, -0.2);
    const coneR = coneL.clone();
    coneR.position.set(0.28, 0.9, -0.2);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), pearl);
    orb.position.set(0, 0.66, 0);
    g.add(keep, towerL, coneL, towerR, coneR, orb);
  } else if (decorId === 'ship') {
    g.position.set(-0.2, 0.05, 0.48);
    g.rotation.set(0.08, 0.4, -0.12);
    const wood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
    const sail = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7, side: THREE.DoubleSide });
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.85, 10), wood);
    hull.rotation.z = Math.PI / 2;
    hull.scale.set(0.8, 1, 1.3);
    hull.position.y = 0.16;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.72, 8), wood);
    mast.position.y = 0.52;
    const sailMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.42), sail);
    sailMesh.position.set(0, 0.56, 0.03);
    g.add(hull, mast, sailMesh);
  } else if (decorId === 'crystal') {
    g.position.set(0.45, 0.05, 0.58);
    const cMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.0,
      roughness: 0.14,
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
    scene.background = new THREE.Color('#040c1f');
    scene.fog = new THREE.FogExp2(0x040c1f, 0.025);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 1.95, 5.25);

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
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.62;
    roomEnv.dispose();
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 3.4;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minPolarAngle = Math.PI / 7;
    controls.target.set(0, 1.05, 0);

    const hemiLight = new THREE.HemisphereLight(0x67e8f9, 0x0f172a, 0.95);
    scene.add(hemiLight);

    const tankTopLight = new THREE.PointLight(0x38bdf8, 2.2, 10);
    tankTopLight.position.set(0, 2.6, 0.4);
    scene.add(tankTopLight);

    const rimLight = new THREE.DirectionalLight(0xe879f9, 1.25);
    rimLight.position.set(-4, 3.2, -3);
    scene.add(rimLight);

    // Tank Base & Pedestal + Sand Floor
    const tankStaticGroup = new THREE.Group();
    scene.add(tankStaticGroup);

    const tankBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.28, 0.24, 2.68),
      new THREE.MeshStandardMaterial({ color: 0x16092e, roughness: 0.45, metalness: 0.25 })
    );
    tankBase.position.y = -0.12;
    tankStaticGroup.add(tankBase);

    const sandTex = createSandTexture(renderer.capabilities.getMaxAnisotropy());
    const sandFloor = new THREE.Mesh(
      new THREE.BoxGeometry(4.06, 0.14, 2.46),
      new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.88 })
    );
    sandFloor.position.y = 0.05;
    tankStaticGroup.add(sandFloor);

    // Outer Aquarium Glass Walls (depthWrite: false to preserve fish & coral sorting)
    const waterVolumeMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.12,
      metalness: 0.18,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const waterBox = new THREE.Mesh(new THREE.BoxGeometry(4.08, 2.18, 2.48), waterVolumeMat);
    waterBox.position.y = 1.15;
    waterBox.renderOrder = 10;
    tankStaticGroup.add(waterBox);

    // Tank Top Frame Rim
    const topRim = new THREE.Mesh(
      new THREE.BoxGeometry(4.24, 0.09, 2.64),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.55 })
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

      // Fish
      fishes.forEach((fId, idx) => {
        const built = buildFishMesh(fId);
        dynamicGroup.add(built.group);
        swimActors.push({
          group: built.group,
          tailObj: built.tailObj,
          fishName: built.fishName,
          baseY: 0.48 + ((idx % 4) * 0.34),
          radiusX: 1.0 + ((idx % 3) * 0.35),
          radiusZ: 0.55 + ((idx % 2) * 0.28),
          speed: 0.45 + (idx % 4) * 0.14,
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
        // Swim path
        for (let i = 0; i < swimActors.length; i++) {
          const a = swimActors[i];
          if (a.boostTimer > 0) a.boostTimer = Math.max(0, a.boostTimer - dt);
          const boostMult = a.boostTimer > 0 ? 2.1 : 1.0;
          const ang = t * a.speed * boostMult + a.phase;
          const nx = Math.cos(ang) * a.radiusX;
          const nz = Math.sin(ang * 1.3) * a.radiusZ;
          const ny = a.baseY + Math.sin(t * 2.1 + a.phase) * 0.14;

          const dx = -Math.sin(ang) * a.radiusX * a.speed;
          const dz = Math.cos(ang * 1.3) * a.radiusZ * a.speed * 1.3;
          a.group.position.set(nx, ny, nz);
          a.group.rotation.y = Math.atan2(-dz, dx);
          a.tailObj.rotation.y = Math.sin(t * 9.5 * boostMult + a.phase) * 0.42;
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
      envTarget.dispose();
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
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none bg-[#040c1f]">
      <div ref={containerRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#040c1f]/90 text-xs text-cyan-200 font-semibold p-4 text-center">
          Restaurando Aquário Mágico 3D...
        </div>
      )}
    </div>
  );
};
