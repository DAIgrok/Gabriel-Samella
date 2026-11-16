import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface FantasyTreeCanvasProps {
  level: number;
  isWatering?: boolean;
  isSunbathing?: boolean;
  isPruning?: boolean;
  hasSakuraTheme?: boolean;
  hasGoldenApples?: boolean;
  hasFairyLights?: boolean;
  hasSwing?: boolean;
  hasLanterns?: boolean;
  hasCrystals?: boolean;
  hasButterfly?: boolean;
  hasSongbird?: boolean;
  ribbons?: { id: string; title: string; color: string }[];
  harvestedFruits?: number[];
  onHarvestFruit?: (index: number) => void;
  onTreeInteract?: () => void;
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}

export const FantasyTreeCanvas: React.FC<FantasyTreeCanvasProps> = ({
  level,
  isWatering = false,
  isSunbathing = false,
  isPruning = false,
  hasSakuraTheme = false,
  hasGoldenApples = false,
  hasFairyLights = false,
  hasSwing = false,
  hasLanterns = false,
  hasCrystals = false,
  hasButterfly = false,
  hasSongbird = false,
  ribbons = [],
  harvestedFruits = [],
  onHarvestFruit,
  onTreeInteract,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Latest reactive props for persistent render loop & raycaster
  const propsRef = useRef({
    level,
    isWatering,
    isSunbathing,
    isPruning,
    hasSakuraTheme,
    hasGoldenApples,
    hasFairyLights,
    hasSwing,
    hasLanterns,
    hasCrystals,
    hasButterfly,
    hasSongbird,
    ribbons,
    harvestedFruits,
    onHarvestFruit,
    onTreeInteract,
  });
  propsRef.current = {
    level,
    isWatering,
    isSunbathing,
    isPruning,
    hasSakuraTheme,
    hasGoldenApples,
    hasFairyLights,
    hasSwing,
    hasLanterns,
    hasCrystals,
    hasButterfly,
    hasSongbird,
    ribbons,
    harvestedFruits,
    onHarvestFruit,
    onTreeInteract,
  };

  const rebuildFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // --- 1. SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c041c, 0.028);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 350;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 2.7, 7.2);

    // --- 2. RENDERER & ENVIRONMENT ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software Rasterizer/i.test(rendererStr);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.55;
    roomEnv.dispose();
    pmrem.dispose();

    // --- 3. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 4.0;
    controls.maxDistance = 10.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minPolarAngle = Math.PI / 10;
    controls.target.set(0, 1.85, 0);

    // --- 4. STUDIO + FANTASY LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xfce7f3, 0x24103f, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.3);
    sunLight.position.set(4.5, 9.5, 5.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = isSoftwareGl ? 512 : 1024;
    sunLight.shadow.mapSize.height = isSoftwareGl ? 512 : 1024;
    sunLight.shadow.bias = -0.0008;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 24;
    sunLight.shadow.camera.left = -4.2;
    sunLight.shadow.camera.right = 4.2;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -2;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 1.1);
    rimLight.position.set(-5.5, 4.5, -5.0);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf472b6, 1.0, 10);
    fillLight.position.set(0, 1.2, 2.6);
    scene.add(fillLight);

    // --- 5. FLOATING SANCTUARY ISLAND (BASE) ---
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Sculpted mossy island hill
    const islandTopGeo = new THREE.CylinderGeometry(2.85, 2.6, 0.42, 32, 2);
    const islandPos = islandTopGeo.attributes.position;
    for (let i = 0; i < islandPos.count; i++) {
      const y = islandPos.getY(i);
      const x = islandPos.getX(i);
      const z = islandPos.getZ(i);
      if (y > 0.1) {
        const dist = Math.sqrt(x * x + z * z);
        islandPos.setY(i, y + Math.max(0, 0.22 - dist * 0.08) + Math.sin(x * 1.4) * 0.04);
      }
    }
    islandTopGeo.computeVertexNormals();
    const islandTopMat = new THREE.MeshStandardMaterial({
      color: 0x2f6f3e,
      roughness: 0.72,
      metalness: 0.04,
    });
    const islandTop = new THREE.Mesh(islandTopGeo, islandTopMat);
    islandTop.position.y = -0.18;
    islandTop.receiveShadow = true;
    terrainGroup.add(islandTop);

    // Sculpted floating stone underbelly
    const stoneGeo = new THREE.ConeGeometry(2.58, 1.35, 24);
    stoneGeo.rotateX(Math.PI);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x24103e,
      roughness: 0.8,
      metalness: 0.08,
    });
    const stoneUnder = new THREE.Mesh(stoneGeo, stoneMat);
    stoneUnder.position.y = -1.04;
    terrainGroup.add(stoneUnder);

    // Soft glowing soil mound directly beneath trunk
    const moundGeo = new THREE.SphereGeometry(0.9, 24, 14);
    moundGeo.scale(1.15, 0.22, 1.15);
    const moundMat = new THREE.MeshStandardMaterial({
      color: 0x3b2116,
      roughness: 0.85,
    });
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.y = 0.04;
    mound.receiveShadow = true;
    terrainGroup.add(mound);

    // Subtle decorative pebbles & tiny daisies on island
    const pebbleGeo = new THREE.SphereGeometry(0.18, 14, 12);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x4b3f63, roughness: 0.75 });
    [
      [1.65, 0.05, 0.85, 1.2],
      [-1.55, 0.05, 1.05, 1.0],
      [1.1, 0.04, -1.5, 0.9],
      [-1.25, 0.04, -1.25, 1.1],
    ].forEach(([px, py, pz, s], i) => {
      const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
      pebble.position.set(px, py, pz);
      pebble.scale.set(s * 1.2, s * 0.65, s);
      pebble.rotation.y = i * 1.1;
      pebble.castShadow = true;
      pebble.receiveShadow = true;
      terrainGroup.add(pebble);
    });

    // --- 6. DYNAMIC TREE & ACCESSORY GROUP ---
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // Animated node registries
    interface CloudRef {
      mesh: THREE.Object3D;
      basePos: THREE.Vector3;
      phase: number;
    }
    const cloudRefs: CloudRef[] = [];
    const fruitRefs: { mesh: THREE.Object3D; baseY: number; phase: number; index: number }[] = [];
    const fairyLightRefs: { mesh: THREE.Mesh; phase: number; baseColor: THREE.Color }[] = [];
    const lanternRefs: { group: THREE.Group; baseY: number; phase: number }[] = [];
    const ribbonRefs: { mesh: THREE.Object3D; phase: number }[] = [];
    let swingPivot: THREE.Group | null = null;
    let butterflyGroup: THREE.Group | null = null;
    let butterflyWingL: THREE.Mesh | null = null;
    let butterflyWingR: THREE.Mesh | null = null;
    let songbirdGroup: THREE.Group | null = null;

    // Helper: builds a sculpted smooth clay foliage cloud bunch (like the reference image)
    const createClayFoliageBunch = (
      x: number,
      y: number,
      z: number,
      radius: number,
      mat: THREE.Material,
      phase: number
    ) => {
      const bunch = new THREE.Group();
      bunch.position.set(x, y, z);

      // Central core + 4 pillowy surrounding lobes for sculpted cloud silhouette
      const lobeOffsets = [
        [0, 0.05, 0, 1.0],
        [-0.42, -0.06, 0.16, 0.72],
        [0.44, -0.04, 0.14, 0.74],
        [0.02, -0.08, -0.38, 0.72],
        [0.06, 0.34, 0.04, 0.68],
      ];
      const lobeGeo = new THREE.SphereGeometry(radius * 0.62, 20, 16);

      lobeOffsets.forEach(([ox, oy, oz, sc]) => {
        const lobe = new THREE.Mesh(lobeGeo, mat);
        lobe.position.set(ox * radius, oy * radius, oz * radius);
        lobe.scale.set(sc * 1.08, sc * 0.88, sc * 1.04);
        lobe.castShadow = true;
        lobe.receiveShadow = true;
        bunch.add(lobe);
      });

      treeGroup.add(bunch);
      cloudRefs.push({ mesh: bunch, basePos: bunch.position.clone(), phase });
      return bunch;
    };

    // Helper: creates a smooth tapered clay branch/trunk along a curve
    const createTaperedBranch = (
      points: THREE.Vector3[],
      rStart: number,
      rEnd: number,
      mat: THREE.Material,
      radialSegs = 14,
      tubularSegs = 18
    ) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, tubularSegs, 1, radialSegs, false);
      const pos = geo.attributes.position;
      const center = new THREE.Vector3();
      const vertex = new THREE.Vector3();
      const offset = new THREE.Vector3();

      for (let tIdx = 0; tIdx <= tubularSegs; tIdx++) {
        const t = tIdx / tubularSegs;
        curve.getPointAt(t, center);
        // Smooth organic flare at base + gentle taper to tip
        const flare = t < 0.18 ? Math.pow(1 - t / 0.18, 2) * rStart * 0.45 : 0;
        const radius = rStart * (1 - t) + rEnd * t + flare;

        for (let rIdx = 0; rIdx <= radialSegs; rIdx++) {
          const i = tIdx * (radialSegs + 1) + rIdx;
          vertex.fromBufferAttribute(pos, i);
          offset.subVectors(vertex, center).multiplyScalar(radius);
          vertex.copy(center).add(offset);
          pos.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      treeGroup.add(mesh);
      return mesh;
    };

    const rebuildTree = () => {
      const {
        level: curLevel,
        hasSakuraTheme: sakura,
        hasGoldenApples: golden,
        hasFairyLights: lights,
        hasSwing: swing,
        hasLanterns: lanterns,
        hasCrystals: crystals,
        hasButterfly: butterfly,
        hasSongbird: songbird,
        ribbons: curRibbons,
        harvestedFruits: harvested,
      } = propsRef.current;

      // Cleanly clear & dispose previous tree meshes
      while (treeGroup.children.length > 0) {
        const child = treeGroup.children[0];
        treeGroup.remove(child);
        disposeObject3D(child);
      }
      cloudRefs.length = 0;
      fruitRefs.length = 0;
      fairyLightRefs.length = 0;
      lanternRefs.length = 0;
      ribbonRefs.length = 0;
      swingPivot = null;
      butterflyGroup = null;
      butterflyWingL = null;
      butterflyWingR = null;
      songbirdGroup = null;

      // Clay-smooth materials matching the attached tree image
      const barkMat = new THREE.MeshStandardMaterial({
        color: 0x9b5a2c,
        roughness: 0.48,
        metalness: 0.04,
      });

      const showSakura = sakura || curLevel >= 6;
      const leafPalette = sakura
        ? [0xf472b6, 0xf9a8d4, 0xec4899]
        : curLevel >= 10
        ? [0x34d399, 0x6ee7b7, 0x10b981]
        : [0x65b849, 0x7ed348, 0x4da034];

      const leafMats = leafPalette.map(
        (hex) =>
          new THREE.MeshStandardMaterial({
            color: hex,
            roughness: 0.45,
            metalness: 0.04,
          })
      );

      // --- STAGE 1: SPROUT (Level 1) ---
      if (curLevel <= 1) {
        createTaperedBranch(
          [
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(0.05, 0.45, 0.02),
            new THREE.Vector3(-0.04, 0.85, -0.02),
            new THREE.Vector3(0, 1.15, 0),
          ],
          0.08,
          0.035,
          leafMats[0],
          12,
          16
        );

        const sproutLeafGeo = new THREE.SphereGeometry(0.24, 18, 14);
        sproutLeafGeo.scale(1.35, 0.28, 0.72);
        [-1, 1].forEach((dir, idx) => {
          const leaf = new THREE.Mesh(sproutLeafGeo, leafMats[idx % leafMats.length]);
          leaf.position.set(dir * 0.28, 1.05 + idx * 0.08, 0);
          leaf.rotation.set(0.15, dir * 0.3, dir * -0.45);
          leaf.castShadow = true;
          treeGroup.add(leaf);
          cloudRefs.push({ mesh: leaf, basePos: leaf.position.clone(), phase: idx * 1.4 });
        });

        const budMat = new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xec4899,
          emissiveIntensity: 0.65,
          roughness: 0.25,
        });
        const bud = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), budMat);
        bud.position.set(0, 1.24, 0);
        treeGroup.add(bud);
      } else {
        // --- STAGE 2..10: SCULPTED CLAY BRANCHED TREE (Matches Reference Image) ---
        const growth = curLevel <= 3 ? 0.78 : curLevel <= 6 ? 1.0 : 1.18;

        // 1. Main tapered smooth trunk with flared roots at bottom
        createTaperedBranch(
          [
            new THREE.Vector3(0, 0.0, 0),
            new THREE.Vector3(0.04 * growth, 0.7 * growth, 0.02),
            new THREE.Vector3(-0.03 * growth, 1.45 * growth, -0.02),
            new THREE.Vector3(0.0, 2.05 * growth, 0.0),
          ],
          0.31 * growth,
          0.16 * growth,
          barkMat,
          16,
          20
        );

        // 5 Smooth buttress root flares hugging ground
        const rootCount = curLevel <= 3 ? 3 : 5;
        for (let r = 0; r < rootCount; r++) {
          const ang = (r / rootCount) * Math.PI * 2 + 0.35;
          createTaperedBranch(
            [
              new THREE.Vector3(Math.cos(ang) * 0.14 * growth, 0.45 * growth, Math.sin(ang) * 0.14 * growth),
              new THREE.Vector3(Math.cos(ang) * 0.36 * growth, 0.16 * growth, Math.sin(ang) * 0.36 * growth),
              new THREE.Vector3(Math.cos(ang) * 0.64 * growth, 0.02, Math.sin(ang) * 0.64 * growth),
            ],
            0.13 * growth,
            0.035 * growth,
            barkMat,
            10,
            10
          );
        }

        // 2. Smooth spreading Y-branches matching the reference silhouette
        const branchSpecs: { pts: [number, number, number][]; r0: number; r1: number }[] = [
          // Left sweeping bough
          {
            pts: [
              [-0.04, 1.55, 0.0],
              [-0.65, 1.95, 0.12],
              [-1.32, 2.52, 0.2],
            ],
            r0: 0.14,
            r1: 0.06,
          },
          // Right sweeping bough
          {
            pts: [
              [0.04, 1.5, 0.0],
              [0.68, 1.92, -0.1],
              [1.35, 2.48, -0.15],
            ],
            r0: 0.14,
            r1: 0.06,
          },
          // Upper center-left fork
          {
            pts: [
              [0.0, 1.9, 0.0],
              [-0.38, 2.45, -0.35],
              [-0.78, 3.05, -0.62],
            ],
            r0: 0.11,
            r1: 0.05,
          },
          // Upper center-right fork
          {
            pts: [
              [0.0, 1.92, 0.0],
              [0.42, 2.5, 0.38],
              [0.82, 3.12, 0.62],
            ],
            r0: 0.11,
            r1: 0.05,
          },
          // Top crown spire branch
          {
            pts: [
              [0.0, 2.0, 0.0],
              [-0.08, 2.68, 0.05],
              [0.02, 3.35, 0.0],
            ],
            r0: 0.11,
            r1: 0.05,
          },
        ];

        if (curLevel >= 4) {
          branchSpecs.push(
            {
              pts: [
                [-0.55, 1.92, 0.1],
                [-0.92, 2.55, -0.45],
                [-1.18, 2.98, -0.78],
              ],
              r0: 0.085,
              r1: 0.04,
            },
            {
              pts: [
                [0.62, 1.88, -0.08],
                [0.98, 2.48, 0.45],
                [1.24, 2.94, 0.78],
              ],
              r0: 0.085,
              r1: 0.04,
            }
          );
        }

        branchSpecs.forEach((b) => {
          createTaperedBranch(
            b.pts.map(([px, py, pz]) => new THREE.Vector3(px * growth, py * growth, pz * growth)),
            b.r0 * growth,
            b.r1 * growth,
            barkMat,
            12,
            14
          );
        });

        // Carved tiny glowing heart emblem on front of trunk
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, -0.06);
        heartShape.bezierCurveTo(0.08, 0.02, 0.09, 0.09, 0.04, 0.09);
        heartShape.bezierCurveTo(0.015, 0.09, 0, 0.065, 0, 0.05);
        heartShape.bezierCurveTo(0, 0.065, -0.015, 0.09, -0.04, 0.09);
        heartShape.bezierCurveTo(-0.09, 0.09, -0.08, 0.02, 0, -0.06);
        const carvedGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.025, bevelEnabled: false });
        const carvedMat = new THREE.MeshStandardMaterial({
          color: 0xfb7185,
          emissive: 0xf43f5e,
          emissiveIntensity: 0.5,
          roughness: 0.3,
        });
        const carvedHeart = new THREE.Mesh(carvedGeo, carvedMat);
        carvedHeart.position.set(0, 1.05 * growth, 0.2 * growth);
        treeGroup.add(carvedHeart);

        // 3. Smooth Pillowy Canopy Clouds (Matches Reference Photo's Clustered Smooth Green Lobes)
        const canopyNodes: [number, number, number, number][] = [
          [-1.35, 2.65, 0.22, 0.78],
          [1.38, 2.62, -0.18, 0.78],
          [-0.82, 3.18, -0.62, 0.82],
          [0.85, 3.22, 0.62, 0.82],
          [0.0, 3.65, 0.0, 0.96],
          [-0.52, 3.45, 0.56, 0.78],
          [0.54, 3.42, -0.56, 0.78],
        ];

        if (curLevel >= 4) {
          canopyNodes.push(
            [-1.22, 3.08, -0.78, 0.72],
            [1.24, 3.04, 0.76, 0.72],
            [0.0, 2.85, 0.96, 0.74],
            [0.0, 2.88, -0.96, 0.74],
            [-0.95, 2.48, 0.86, 0.66],
            [0.95, 2.45, -0.84, 0.66]
          );
        }

        if (curLevel >= 7) {
          canopyNodes.push(
            [-1.68, 2.42, -0.24, 0.64],
            [1.68, 2.4, 0.24, 0.64],
            [0.0, 4.15, 0.0, 0.75],
            [-0.68, 3.85, -0.35, 0.68],
            [0.68, 3.85, 0.35, 0.68]
          );
        }

        canopyNodes.forEach(([cx, cy, cz, rad], idx) => {
          createClayFoliageBunch(
            cx * growth,
            cy * growth,
            cz * growth,
            rad * growth,
            leafMats[idx % leafMats.length],
            idx * 0.7
          );
        });

        // 4. Blossoms dotting the canopy
        if (showSakura || curLevel >= 3) {
          const petalGeo = new THREE.SphereGeometry(0.055, 10, 8);
          petalGeo.scale(1, 0.45, 1.35);
          const petalMat = new THREE.MeshStandardMaterial({
            color: sakura ? 0xfff1f2 : 0xfbcfe8,
            emissive: 0xf472b6,
            emissiveIntensity: 0.25,
            roughness: 0.35,
          });
          const centerMat = new THREE.MeshStandardMaterial({
            color: 0xfde047,
            emissive: 0xfacc15,
            emissiveIntensity: 0.4,
          });
          const centerGeo = new THREE.SphereGeometry(0.028, 8, 8);

          const blossomCount = curLevel >= 7 ? 14 : 8;
          for (let i = 0; i < blossomCount; i++) {
            const node = canopyNodes[i % canopyNodes.length];
            const flw = new THREE.Group();
            const theta = i * 2.1;
            flw.position.set(
              (node[0] + Math.cos(theta) * node[3] * 0.62) * growth,
              (node[1] + 0.18 * node[3]) * growth,
              (node[2] + Math.sin(theta) * node[3] * 0.62) * growth
            );
            for (let p = 0; p < 5; p++) {
              const pAng = (p / 5) * Math.PI * 2;
              const pet = new THREE.Mesh(petalGeo, petalMat);
              pet.position.set(Math.cos(pAng) * 0.045, 0, Math.sin(pAng) * 0.045);
              pet.rotation.y = -pAng;
              flw.add(pet);
            }
            flw.add(new THREE.Mesh(centerGeo, centerMat));
            flw.lookAt(flw.position.x * 2, flw.position.y + 1, flw.position.z * 2);
            treeGroup.add(flw);
          }
        }

        // 5. Sacred Hanging Fruits (Ruby or Golden Apples, clickable)
        if (curLevel >= 3 || golden) {
          const fruitGeo = new THREE.SphereGeometry(0.145, 18, 16);
          const fruitMat = new THREE.MeshStandardMaterial({
            color: golden ? 0xfacc15 : 0xf43f5e,
            emissive: golden ? 0xd97706 : 0xbe123c,
            emissiveIntensity: golden ? 0.55 : 0.28,
            roughness: 0.22,
            metalness: golden ? 0.72 : 0.08,
          });
          const fruitCoords: [number, number, number][] = [
            [-1.15, 2.12, 0.35],
            [1.18, 2.08, -0.25],
            [0.05, 2.48, 0.92],
            [-0.75, 2.55, -0.68],
            [0.72, 2.6, 0.68],
          ];
          fruitCoords.forEach(([fx, fy, fz], idx) => {
            if (harvested.includes(idx)) return;
            const appleGroup = new THREE.Group();
            appleGroup.position.set(fx * growth, fy * growth, fz * growth);
            appleGroup.userData.fruitIndex = idx;

            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.014, 0.014, 0.14, 6),
              barkMat
            );
            stem.position.y = 0.15;
            appleGroup.add(stem);

            const apple = new THREE.Mesh(fruitGeo, fruitMat);
            apple.castShadow = true;
            apple.userData.fruitIndex = idx;
            appleGroup.add(apple);

            treeGroup.add(appleGroup);
            fruitRefs.push({
              mesh: appleGroup,
              baseY: appleGroup.position.y,
              phase: idx * 1.1,
              index: idx,
            });
          });
        }

        // 6. Promise Ribbons tied cleanly onto lower boughs
        const activeRibbons = curRibbons.slice(0, 6);
        activeRibbons.forEach((rib, idx) => {
          const rAng = (idx / Math.max(1, activeRibbons.length)) * Math.PI * 2 + 0.4;
          const rx = Math.cos(rAng) * 0.72 * growth;
          const ry = 1.85 * growth;
          const rz = Math.sin(rAng) * 0.72 * growth;

          const rCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(rx, ry + 0.12, rz),
            new THREE.Vector3(rx + 0.04, ry - 0.12, rz + 0.03),
            new THREE.Vector3(rx - 0.03, ry - 0.34, rz + 0.05),
          ]);
          const rGeo = new THREE.TubeGeometry(rCurve, 10, 0.024, 6, false);
          const rMat = new THREE.MeshStandardMaterial({
            color: rib.color || '#ec4899',
            emissive: rib.color || '#ec4899',
            emissiveIntensity: 0.35,
            roughness: 0.38,
          });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          treeGroup.add(rMesh);
          ribbonRefs.push({ mesh: rMesh, phase: idx * 0.8 });
        });

        // 7. Fairy Lights Garland
        if (lights || curLevel >= 7) {
          const lightCount = 16;
          const bulbGeo = new THREE.SphereGeometry(0.058, 10, 8);
          for (let i = 0; i < lightCount; i++) {
            const t = i / lightCount;
            const ang = t * Math.PI * 4.5;
            const rad = (0.75 + Math.sin(t * Math.PI) * 0.65) * growth;
            const ly = (2.15 + t * 1.55) * growth;
            const baseColor = new THREE.Color(i % 2 === 0 ? 0xfef08a : 0xf9a8d4);
            const bulbMat = new THREE.MeshBasicMaterial({ color: baseColor });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(Math.cos(ang) * rad, ly, Math.sin(ang) * rad);
            treeGroup.add(bulb);
            fairyLightRefs.push({ mesh: bulb, phase: i * 0.55, baseColor });
          }
        }

        // 8. Romantic Wooden Swing (Store Item: item-tree-swing)
        if (swing) {
          const pivot = new THREE.Group();
          pivot.position.set(1.12 * growth, 2.28 * growth, -0.05);
          const ropeMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8 });
          const ropeGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.42, 6);
          [-0.22, 0.22].forEach((rx) => {
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            rope.position.set(rx, -0.71, 0);
            pivot.add(rope);
          });
          const seatMat = new THREE.MeshStandardMaterial({ color: 0x7c3f18, roughness: 0.5 });
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.24), seatMat);
          seat.position.set(0, -1.42, 0);
          seat.castShadow = true;
          pivot.add(seat);

          // Tiny pink flowers decorating the ropes
          const vineFlowerMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xec4899,
            emissiveIntensity: 0.35,
          });
          const vineFlowerGeo = new THREE.SphereGeometry(0.045, 8, 8);
          [-0.22, 0.22].forEach((rx) => {
            [-0.45, -0.95].forEach((ry) => {
              const vf = new THREE.Mesh(vineFlowerGeo, vineFlowerMat);
              vf.position.set(rx, ry, 0.02);
              pivot.add(vf);
            });
          });

          treeGroup.add(pivot);
          swingPivot = pivot;
        }

        // 9. Magic Floating Lanterns (Store Item: item-tree-lanterns)
        if (lanterns) {
          const lanternBodyGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.24, 12);
          const lanternCapGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.035, 12);
          const lanternGlowMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.35,
            roughness: 0.25,
          });
          const lanternCapMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

          [
            [-1.35 * growth, 1.95 * growth, 0.4],
            [1.42 * growth, 2.05 * growth, 0.55],
            [-0.6 * growth, 2.25 * growth, -0.95],
          ].forEach(([lx, ly, lz], idx) => {
            const lg = new THREE.Group();
            lg.position.set(lx, ly, lz);
            const body = new THREE.Mesh(lanternBodyGeo, lanternGlowMat);
            const topCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
            topCap.position.y = 0.13;
            const botCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
            botCap.position.y = -0.13;
            lg.add(body, topCap, botCap);
            treeGroup.add(lg);
            lanternRefs.push({ group: lg, baseY: ly, phase: idx * 1.4 });
          });
        }

        // 10. Songbird Perched on Right Bough (Store Item: item-tree-songbird or Level >= 8)
        if (songbird || curLevel >= 8) {
          const bird = new THREE.Group();
          bird.position.set(-1.18 * growth, 2.75 * growth, 0.45);
          const birdBodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35 });
          const birdBellyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.45 });
          const beakMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

          const torso = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), birdBodyMat);
          torso.scale.set(1.25, 0.95, 0.9);
          bird.add(torso);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), birdBellyMat);
          head.position.set(0.09, 0.08, 0);
          bird.add(head);

          const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 6), beakMat);
          beak.rotation.z = -Math.PI / 2;
          beak.position.set(0.18, 0.075, 0);
          bird.add(beak);

          treeGroup.add(bird);
          songbirdGroup = bird;
        }
      }

      // 11. Rose Quartz Root Crystals (Store Item: item-tree-crystals or Level >= 5)
      if (crystals || curLevel >= 5) {
        const crystalGeo = new THREE.OctahedronGeometry(0.16, 0);
        crystalGeo.scale(0.55, 1.65, 0.55);
        const pinkCrysMat = new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.55,
          roughness: 0.15,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        });
        const tealCrysMat = new THREE.MeshStandardMaterial({
          color: 0x2dd4bf,
          emissive: 0x0d9488,
          emissiveIntensity: 0.5,
          roughness: 0.15,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9,
        });
        [
          [1.05, 0.22, 0.65, 0.15, 0],
          [1.22, 0.16, 0.52, 0.42, 1],
          [-1.08, 0.2, 0.72, -0.25, 0],
          [-0.95, 0.15, -0.95, 0.3, 1],
        ].forEach(([cx, cy, cz, rotZ, matIdx]) => {
          const crys = new THREE.Mesh(crystalGeo, matIdx === 0 ? pinkCrysMat : tealCrysMat);
          crys.position.set(cx, cy, cz);
          crys.rotation.set(0.15, cx, rotZ);
          crys.castShadow = true;
          treeGroup.add(crys);
        });
      }

      // 12. Lilac Enchanted Butterfly (Store Item: item-tree-magic-butterfly or Level >= 6)
      if (butterfly || curLevel >= 6) {
        const bfly = new THREE.Group();
        const wingGeo = new THREE.CircleGeometry(0.12, 10);
        wingGeo.scale(1.2, 0.85, 1);
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xe879f9,
          emissive: 0xc026d3,
          emissiveIntensity: 0.65,
          side: THREE.DoubleSide,
          roughness: 0.25,
        });
        const wL = new THREE.Mesh(wingGeo, wingMat);
        wL.position.x = -0.09;
        const wR = new THREE.Mesh(wingGeo, wingMat);
        wR.position.x = 0.09;
        bfly.add(wL, wR);
        treeGroup.add(bfly);
        butterflyGroup = bfly;
        butterflyWingL = wL;
        butterflyWingR = wR;
      }
    };

    rebuildFnRef.current = rebuildTree;
    rebuildTree();

    // --- 7. OPTIMIZED VFX: FIREFLIES + WATER DROPLETS ---
    const fireflyCount = isSoftwareGl ? 36 : 64;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyCol = new Float32Array(fireflyCount * 3);
    const fireflyVel = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 2.3;
      fireflyPos[i * 3] = Math.cos(th) * r;
      fireflyPos[i * 3 + 1] = 0.4 + Math.random() * 4.2;
      fireflyPos[i * 3 + 2] = Math.sin(th) * r;
      fireflyVel[i] = 0.005 + Math.random() * 0.01;

      const isGold = i % 3 === 0;
      fireflyCol[i * 3] = isGold ? 1.0 : 0.88;
      fireflyCol[i * 3 + 1] = isGold ? 0.85 : 0.48;
      fireflyCol[i * 3 + 2] = isGold ? 0.35 : 0.95;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyCol, 3));
    const fireflyMat = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fireflySystem = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflySystem);

    // Rain droplets for watering care
    const rainCount = 48;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 2.8;
      rainPos[i * 3 + 1] = 1.5 + Math.random() * 4.0;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.09,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    // --- 8. POINTER RAYCASTING (Fruits + Tree tap) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
      // Ignore orbit drags
      const dist = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (dist > 8) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(treeGroup.children, true);
      if (hits.length > 0) {
        const fruitHit = hits.find((h) => h.object.userData?.fruitIndex !== undefined);
        if (fruitHit && propsRef.current.onHarvestFruit) {
          propsRef.current.onHarvestFruit(fruitHit.object.userData.fruitIndex);
          return;
        }
        propsRef.current.onTreeInteract?.();
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // --- 9. ANIMATION LOOP (Zero per-frame allocations) ---
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const { isWatering: watering, isSunbathing: sun, isPruning: pruning } = propsRef.current;

      if (!prefersReducedMotion) {
        // Gentle canopy breathing & sway
        for (let i = 0; i < cloudRefs.length; i++) {
          const c = cloudRefs[i];
          c.mesh.rotation.z = Math.sin(t * 1.4 + c.phase) * 0.032;
          c.mesh.rotation.x = Math.cos(t * 1.1 + c.phase) * 0.022;
        }

        // Ribbons fluttering
        for (let i = 0; i < ribbonRefs.length; i++) {
          ribbonRefs[i].mesh.rotation.y = Math.sin(t * 2.4 + ribbonRefs[i].phase) * 0.1;
        }

        // Sacred fruits bobbing
        for (let i = 0; i < fruitRefs.length; i++) {
          const f = fruitRefs[i];
          f.mesh.position.y = f.baseY + Math.sin(t * 2.6 + f.phase) * 0.035;
        }

        // Twinkling fairy lights
        for (let i = 0; i < fairyLightRefs.length; i++) {
          const fl = fairyLightRefs[i];
          const s = 0.78 + Math.sin(t * 4.2 + fl.phase) * 0.28;
          fl.mesh.scale.setScalar(s);
        }

        // Floating lanterns gentle drift
        for (let i = 0; i < lanternRefs.length; i++) {
          const ln = lanternRefs[i];
          ln.group.position.y = ln.baseY + Math.sin(t * 1.7 + ln.phase) * 0.08;
          ln.group.rotation.y = t * 0.35 + ln.phase;
        }

        // Swing gentle oscillation
        if (swingPivot) {
          swingPivot.rotation.z = Math.sin(t * 1.9) * 0.14;
        }

        // Butterfly orbit & wing flap
        if (butterflyGroup) {
          const orbitAng = t * 0.75;
          butterflyGroup.position.set(
            Math.cos(orbitAng) * 1.65,
            2.9 + Math.sin(t * 2.2) * 0.38,
            Math.sin(orbitAng) * 1.65
          );
          butterflyGroup.rotation.y = -orbitAng;
          const flap = Math.sin(t * 16) * 0.75;
          if (butterflyWingL) butterflyWingL.rotation.y = flap;
          if (butterflyWingR) butterflyWingR.rotation.y = -flap;
        }

        // Songbird cheerful head/body bob
        if (songbirdGroup) {
          songbirdGroup.rotation.z = Math.sin(t * 3.8) * 0.08;
        }

        // Ambient fireflies
        const fArr = fireflyGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < fireflyCount; i++) {
          fArr[i * 3 + 1] += fireflyVel[i];
          fArr[i * 3] += Math.sin(t + i) * 0.003;
          fArr[i * 3 + 2] += Math.cos(t + i) * 0.003;
          if (fArr[i * 3 + 1] > 5.0) {
            fArr[i * 3 + 1] = 0.35;
          }
        }
        fireflyGeo.attributes.position.needsUpdate = true;
      }

      // Watering droplet shower
      if (watering) {
        rainMat.opacity = Math.min(0.95, rainMat.opacity + 0.12);
        const rArr = rainGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          rArr[i * 3 + 1] -= 0.14;
          if (rArr[i * 3 + 1] < 0.1) {
            rArr[i * 3 + 1] = 4.6 + Math.random() * 1.4;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else if (rainMat.opacity > 0) {
        rainMat.opacity = Math.max(0, rainMat.opacity - 0.08);
      }

      // Sunbathing / Pruning lighting feedback
      if (sun) {
        sunLight.intensity = 3.6 + Math.sin(t * 6) * 0.45;
        fillLight.color.setHex(0xfde047);
      } else if (pruning) {
        sunLight.intensity = 2.7;
        fillLight.color.setHex(0x34d399);
      } else {
        sunLight.intensity = 2.3;
        fillLight.color.setHex(0xf472b6);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- 10. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 350;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);
    const resizeObs =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObs?.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();

      disposeObject3D(terrainGroup);
      disposeObject3D(treeGroup);
      fireflyGeo.dispose();
      fireflyMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      envTarget.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Trigger lightweight tree geometry rebuild only when model-affecting props change
  const harvestedKey = harvestedFruits.join(',');
  useEffect(() => {
    rebuildFnRef.current?.();
  }, [
    level,
    hasSakuraTheme,
    hasGoldenApples,
    hasFairyLights,
    hasSwing,
    hasLanterns,
    hasCrystals,
    hasButterfly,
    hasSongbird,
    ribbons.length,
    harvestedKey,
  ]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
