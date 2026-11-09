import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface FantasyTreeCanvasProps {
  level: number;
  isWatering?: boolean;
  isSunbathing?: boolean;
  isPruning?: boolean;
  hasSakuraTheme?: boolean;
  hasGoldenApples?: boolean;
  hasFairyLights?: boolean;
  ribbons?: { id: string; title: string; color: string }[];
  onTreeInteract?: () => void;
}

export const FantasyTreeCanvas: React.FC<FantasyTreeCanvasProps> = ({
  level,
  isWatering = false,
  isSunbathing = false,
  isPruning = false,
  hasSakuraTheme = false,
  hasGoldenApples = false,
  hasFairyLights = false,
  ribbons = [],
  onTreeInteract,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0316, 0.035);

    // --- 2. CAMERA ---
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);

    // --- 3. RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- 4. CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 11;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent viewing from under ground
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 1.8, 0);

    // --- 5. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x6b46c1, 0.9); // mystical purple ambient
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf472b6, 0x1e1035, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.2);
    sunLight.position.set(5, 10, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -2;
    scene.add(sunLight);

    // Soft rim back light for Genshin-like fantasy glow
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Ground warm bounce light
    const bounceLight = new THREE.PointLight(0xa855f7, 1.2, 8);
    bounceLight.position.set(0, 0.8, 1.5);
    scene.add(bounceLight);

    // --- 6. PROCEDURAL BARK & LEAF TEXTURES ---
    const createBarkTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#3a1a0d';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 600; i++) {
          ctx.strokeStyle = i % 2 === 0 ? '#4e2311' : '#260f06';
          ctx.lineWidth = Math.random() * 2 + 0.5;
          ctx.beginPath();
          const x = Math.random() * 256;
          ctx.moveTo(x, 0);
          ctx.lineTo(x + (Math.random() - 0.5) * 20, 256);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 3);
      return tex;
    };

    const barkTexture = createBarkTexture();

    // --- 7. TERRAIN & ENVIRONMENT ---
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Floating fantasy island / mossy mound
    const groundGeo = new THREE.CylinderGeometry(3.2, 1.8, 1.2, 32);
    // Deform ground vertices for natural organic hill shape
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0.4) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        pos.setY(i, y + Math.sin(x * 1.5) * 0.15 + Math.cos(z * 1.5) * 0.15 - (dist * 0.08));
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f3d24,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.6;
    groundMesh.receiveShadow = true;
    terrainGroup.add(groundMesh);

    // Stone decorative rocks around base
    const rockGeo = new THREE.DodecahedronGeometry(0.35, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3d354a,
      roughness: 0.9,
      flatShading: true,
    });
    const rockPositions = [
      [1.8, -0.1, 0.8],
      [-1.6, -0.15, 1.1],
      [0.9, -0.1, -1.7],
      [-1.3, -0.1, -1.2],
      [1.4, -0.2, 1.6],
    ];
    rockPositions.forEach(([rx, ry, rz], idx) => {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, ry, rz);
      rock.scale.set(1 + (idx % 3) * 0.2, 0.7 + (idx % 2) * 0.4, 1 + (idx % 2) * 0.3);
      rock.rotation.set(idx, idx * 2, idx * 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      terrainGroup.add(rock);
    });

    // Glowing fantasy mushrooms
    const shroomCapGeo = new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const shroomStemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.2, 8);
    const shroomCapMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const shroomStemMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.6 });

    [
      [1.2, 0.05, 1.1],
      [1.35, 0.02, 1.25],
      [-1.1, 0.02, 1.4],
      [-1.7, -0.05, -0.4],
    ].forEach(([sx, sy, sz]) => {
      const stem = new THREE.Mesh(shroomStemGeo, shroomStemMat);
      stem.position.set(sx, sy + 0.1, sz);
      const cap = new THREE.Mesh(shroomCapGeo, shroomCapMat);
      cap.position.set(sx, sy + 0.2, sz);
      terrainGroup.add(stem);
      terrainGroup.add(cap);
    });

    // --- 8. TREE ARCHITECTURE GROUP ---
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // References for animations
    const foliageClusters: THREE.Mesh[] = [];
    const fruits: THREE.Mesh[] = [];
    const ribbonMeshes: THREE.Mesh[] = [];
    const blossoms: THREE.Mesh[] = [];

    // Materials
    const barkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2211,
      map: barkTexture,
      roughness: 0.85,
      metalness: 0.05,
    });

    const leafColorBase = hasSakuraTheme ? 0xf472b6 : 0x22c55e;
    const leafColorHighlight = hasSakuraTheme ? 0xfbcfe8 : 0x86efac;
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: leafColorBase,
      roughness: 0.55,
      metalness: 0.1,
      flatShading: true,
    });

    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd1dc,
      emissive: 0xff85a1,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });

    const fruitMaterial = new THREE.MeshStandardMaterial({
      color: hasGoldenApples ? 0xfbbf24 : 0xef4444,
      emissive: hasGoldenApples ? 0xf59e0b : 0xdc2626,
      emissiveIntensity: hasGoldenApples ? 0.6 : 0.25,
      roughness: 0.25,
      metalness: hasGoldenApples ? 0.6 : 0.1,
    });

    // Build tree by stage
    const buildTree = (stageLevel: number) => {
      // Clear previous tree parts
      while (treeGroup.children.length > 0) {
        const obj = treeGroup.children[0];
        treeGroup.remove(obj);
      }
      foliageClusters.length = 0;
      fruits.length = 0;
      ribbonMeshes.length = 0;
      blossoms.length = 0;

      if (stageLevel === 1) {
        // --- STAGE 1: BROTO SAGRADO (Sprout) ---
        // Curved little green stem
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.08, 0.4, 0.02),
          new THREE.Vector3(-0.05, 0.8, -0.02),
          new THREE.Vector3(0, 1.1, 0),
        ]);
        const stemGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
        const sproutStem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 }));
        sproutStem.castShadow = true;
        treeGroup.add(sproutStem);

        // 3 Cute Sprout Leaves
        const leafGeo = new THREE.SphereGeometry(0.2, 12, 12);
        leafGeo.scale(1.5, 0.3, 0.7);
        for (let i = 0; i < 3; i++) {
          const leaf = new THREE.Mesh(leafGeo, leafMaterial);
          const angle = (i * Math.PI * 2) / 3;
          leaf.position.set(Math.cos(angle) * 0.25, 1.15, Math.sin(angle) * 0.25);
          leaf.rotation.set(0.4, angle, -0.4);
          leaf.castShadow = true;
          treeGroup.add(leaf);
          foliageClusters.push(leaf);
        }

        // Tiny glowing aura bud on top
        const budGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const budMat = new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xf472b6,
          emissiveIntensity: 0.8,
        });
        const bud = new THREE.Mesh(budGeo, budMat);
        bud.position.set(0, 1.3, 0);
        treeGroup.add(bud);

      } else if (stageLevel === 2) {
        // --- STAGE 2: JOVEM BONSAI DO AMOR ---
        // Organic curved trunk
        const trunkCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.2, 0.6, 0.1),
          new THREE.Vector3(-0.15, 1.3, -0.1),
          new THREE.Vector3(0.1, 2.0, 0.05),
        ]);
        const trunkGeo = new THREE.TubeGeometry(trunkCurve, 24, 0.18, 12, false);
        const trunk = new THREE.Mesh(trunkGeo, barkMaterial);
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Roots
        const root1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.02, 0.8, 8), barkMaterial);
        root1.position.set(0.3, 0.1, 0.3);
        root1.rotation.set(0.8, 0.4, -0.6);
        treeGroup.add(root1);

        // Foliage clumps
        const clusterGeo = new THREE.IcosahedronGeometry(0.55, 2);
        const clusterPositions = [
          [0.1, 2.1, 0.05, 1.0],
          [-0.6, 1.8, 0.3, 0.8],
          [0.7, 1.7, -0.3, 0.75],
          [0.2, 2.5, 0.1, 0.7],
        ];

        clusterPositions.forEach(([cx, cy, cz, cscale]) => {
          const cluster = new THREE.Mesh(clusterGeo, leafMaterial);
          cluster.position.set(cx, cy, cz);
          cluster.scale.set(cscale, cscale * 0.75, cscale);
          cluster.castShadow = true;
          cluster.receiveShadow = true;
          treeGroup.add(cluster);
          foliageClusters.push(cluster);
        });

      } else {
        // --- STAGE 3+: ÁRVORE FRONDOSA / MÍSTICA / CELESTIAL ---
        const scaleMult = stageLevel >= 5 ? 1.25 : stageLevel === 4 ? 1.15 : 1.0;

        // Thick, majestic organic trunk with root flares
        const trunkCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.15, 0.8 * scaleMult, 0.08),
          new THREE.Vector3(-0.2, 1.6 * scaleMult, -0.1),
          new THREE.Vector3(0.05, 2.4 * scaleMult, 0.05),
          new THREE.Vector3(0, 3.1 * scaleMult, 0),
        ]);
        const trunkRadius = (stageLevel >= 5 ? 0.36 : stageLevel === 4 ? 0.32 : 0.28);
        const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, trunkRadius, 14, false);
        const trunk = new THREE.Mesh(trunkGeo, barkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        // Buttress roots sprawling out
        const rootAngles = [0.2, 1.8, 3.4, 4.8];
        rootAngles.forEach((ang) => {
          const rootCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(Math.cos(ang) * 0.25, 0.5, Math.sin(ang) * 0.25),
            new THREE.Vector3(Math.cos(ang) * 0.7, 0.15, Math.sin(ang) * 0.7),
            new THREE.Vector3(Math.cos(ang) * 1.3, -0.05, Math.sin(ang) * 1.3),
          ]);
          const rootGeo = new THREE.TubeGeometry(rootCurve, 12, 0.14, 8, false);
          const rootMesh = new THREE.Mesh(rootGeo, barkMaterial);
          rootMesh.castShadow = true;
          treeGroup.add(rootMesh);
        });

        // 5 Primary Branches radiating outwards
        const branchConfigs = [
          { start: [0.05, 2.0 * scaleMult, 0.05], end: [1.3 * scaleMult, 2.8 * scaleMult, 0.6 * scaleMult], r: 0.16 },
          { start: [-0.1, 2.2 * scaleMult, -0.05], end: [-1.4 * scaleMult, 2.9 * scaleMult, -0.5 * scaleMult], r: 0.15 },
          { start: [0.0, 2.4 * scaleMult, 0.08], end: [0.5 * scaleMult, 3.1 * scaleMult, -1.2 * scaleMult], r: 0.14 },
          { start: [0.02, 2.5 * scaleMult, -0.06], end: [-0.6 * scaleMult, 3.2 * scaleMult, 1.1 * scaleMult], r: 0.14 },
          { start: [0.0, 2.8 * scaleMult, 0.0], end: [0.1 * scaleMult, 3.7 * scaleMult, 0.1 * scaleMult], r: 0.13 },
        ];

        branchConfigs.forEach((cfg) => {
          const bCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(...cfg.start),
            new THREE.Vector3(
              (cfg.start[0] + cfg.end[0]) * 0.5 + 0.1,
              (cfg.start[1] + cfg.end[1]) * 0.5 + 0.1,
              (cfg.start[2] + cfg.end[2]) * 0.5
            ),
            new THREE.Vector3(...cfg.end),
          ]);
          const bGeo = new THREE.TubeGeometry(bCurve, 16, cfg.r, 8, false);
          const bMesh = new THREE.Mesh(bGeo, barkMaterial);
          bMesh.castShadow = true;
          treeGroup.add(bMesh);
        });

        // Volumetric layered canopy clusters
        const foliageGeo = new THREE.IcosahedronGeometry(0.75, 2);
        const clusterData = [
          // Center main dome
          [0, 3.8 * scaleMult, 0, 1.45],
          [0.2, 4.3 * scaleMult, 0.1, 1.1],
          // Branch ends
          [1.4 * scaleMult, 2.9 * scaleMult, 0.7 * scaleMult, 1.15],
          [-1.5 * scaleMult, 3.0 * scaleMult, -0.6 * scaleMult, 1.2],
          [0.6 * scaleMult, 3.2 * scaleMult, -1.3 * scaleMult, 1.1],
          [-0.7 * scaleMult, 3.3 * scaleMult, 1.2 * scaleMult, 1.15],
          // Secondary fillers for density and depth
          [0.8 * scaleMult, 3.6 * scaleMult, 0.4 * scaleMult, 0.95],
          [-0.9 * scaleMult, 3.7 * scaleMult, -0.3 * scaleMult, 0.95],
          [-0.4 * scaleMult, 3.8 * scaleMult, 0.8 * scaleMult, 0.9],
          [0.5 * scaleMult, 3.9 * scaleMult, -0.7 * scaleMult, 0.9],
          [0.0, 3.1 * scaleMult, 0.8 * scaleMult, 0.85],
          [-0.3 * scaleMult, 3.0 * scaleMult, -0.9 * scaleMult, 0.85],
        ];

        if (stageLevel >= 5) {
          clusterData.push(
            [0, 4.8 * scaleMult, 0, 0.9],
            [1.8 * scaleMult, 2.6 * scaleMult, 0, 0.85],
            [-1.8 * scaleMult, 2.7 * scaleMult, 0, 0.85],
            [0, 2.8 * scaleMult, 1.8 * scaleMult, 0.85]
          );
        }

        clusterData.forEach(([cx, cy, cz, cscale], idx) => {
          const cluster = new THREE.Mesh(foliageGeo, leafMaterial);
          cluster.position.set(cx, cy, cz);
          cluster.scale.set(cscale, cscale * 0.78, cscale);
          cluster.rotation.set(idx * 0.4, idx * 0.8, idx * 0.2);
          cluster.castShadow = true;
          cluster.receiveShadow = true;
          treeGroup.add(cluster);
          foliageClusters.push(cluster);

          // Add sweet flower blossoms on random clusters
          if (idx % 2 === 0 || stageLevel >= 4) {
            const flowerGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const flw = new THREE.Mesh(flowerGeo, flowerMaterial);
            flw.position.set(
              cx + (Math.random() - 0.5) * cscale * 0.8,
              cy - cscale * 0.35,
              cz + (Math.random() - 0.5) * cscale * 0.8
            );
            treeGroup.add(flw);
            blossoms.push(flw);
          }
        });

        // Sacred Fruits hanging from branches (Stages 3+)
        const fruitCount = Math.min(8, 2 + stageLevel);
        const fruitGeo = new THREE.SphereGeometry(0.12, 16, 16);
        for (let i = 0; i < fruitCount; i++) {
          const fruit = new THREE.Mesh(fruitGeo, fruitMaterial);
          const angle = (i * Math.PI * 2) / fruitCount;
          const rDist = 1.0 + (i % 3) * 0.3;
          fruit.position.set(
            Math.cos(angle) * rDist * scaleMult,
            (2.4 + (i % 2) * 0.4) * scaleMult,
            Math.sin(angle) * rDist * scaleMult
          );
          fruit.castShadow = true;
          treeGroup.add(fruit);
          fruits.push(fruit);

          // Stem
          const fStem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6),
            barkMaterial
          );
          fStem.position.set(fruit.position.x, fruit.position.y + 0.1, fruit.position.z);
          treeGroup.add(fStem);
        }

        // Hanging Promise Ribbons (Stage 3+)
        const ribbonList = ribbons.length > 0 ? ribbons : [
          { id: 'def-1', title: 'Lealdade', color: '#f43f5e' },
          { id: 'def-2', title: 'Sonhos', color: '#eab308' },
          { id: 'def-3', title: 'Calmaria', color: '#ec4899' },
          { id: 'def-4', title: 'Eternidade', color: '#a855f7' },
        ];

        ribbonList.slice(0, 6).forEach((rib, idx) => {
          const ribAng = (idx * Math.PI * 2) / ribbonList.length + 0.3;
          const rx = Math.cos(ribAng) * 1.1 * scaleMult;
          const ry = 2.2 * scaleMult;
          const rz = Math.sin(ribAng) * 1.1 * scaleMult;

          const ribCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(rx, ry + 0.4, rz),
            new THREE.Vector3(rx + 0.04, ry + 0.15, rz + 0.02),
            new THREE.Vector3(rx - 0.03, ry - 0.1, rz + 0.04),
            new THREE.Vector3(rx + 0.02, ry - 0.35, rz + 0.01),
          ]);
          const ribGeo = new THREE.TubeGeometry(ribCurve, 12, 0.025, 6, false);
          const ribMat = new THREE.MeshStandardMaterial({
            color: rib.color,
            emissive: rib.color,
            emissiveIntensity: 0.3,
            roughness: 0.4,
          });
          const ribMesh = new THREE.Mesh(ribGeo, ribMat);
          treeGroup.add(ribMesh);
          ribbonMeshes.push(ribMesh);
        });

        // Fairy lights garland if unlocked in store
        if (hasFairyLights) {
          const lightCount = 18;
          const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
          for (let i = 0; i < lightCount; i++) {
            const lAng = (i / lightCount) * Math.PI * 4;
            const lRad = 0.6 + (i / lightCount) * 0.8;
            const lY = 1.8 + (i / lightCount) * 1.8;
            const lColor = i % 2 === 0 ? 0xfef08a : 0xf472b6;
            const lMat = new THREE.MeshBasicMaterial({ color: lColor });
            const lMesh = new THREE.Mesh(lightGeo, lMat);
            lMesh.position.set(Math.cos(lAng) * lRad, lY, Math.sin(lAng) * lRad);
            treeGroup.add(lMesh);
          }
        }
      }
    };

    buildTree(level);

    // --- 9. MAGIC PARTICLES & FIREFLIES ---
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.6 + Math.random() * 2.4;
      particlePos[i * 3] = Math.cos(theta) * radius;
      particlePos[i * 3 + 1] = 0.4 + Math.random() * 4.2;
      particlePos[i * 3 + 2] = Math.sin(theta) * radius;

      particleVel[i * 3] = (Math.random() - 0.5) * 0.01;
      particleVel[i * 3 + 1] = 0.006 + Math.random() * 0.012; // float upwards
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Golden and soft teal/magenta fantasy firefly colors
      const isGold = i % 3 === 0;
      particleCol[i * 3] = isGold ? 1.0 : 0.35;
      particleCol[i * 3 + 1] = isGold ? 0.85 : 0.9;
      particleCol[i * 3 + 2] = isGold ? 0.3 : 0.85;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleCol, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 10. SPECIAL INTERACTION PARTICLES (Rain / Sun / Prune) ---
    // Water drop stream
    const rainCount = 60;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 2.5;
      rainPos[i * 3 + 1] = 3.5 + Math.random() * 3;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    // --- 11. RAYCASTING INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(treeGroup.children, true);
      if (intersects.length > 0 && onTreeInteract) {
        onTreeInteract();
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // --- 12. ANIMATION LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle organic wind sway on canopy clusters
      foliageClusters.forEach((cluster, idx) => {
        const freq = 1.4 + (idx % 3) * 0.2;
        const amp = 0.035;
        cluster.rotation.z = Math.sin(elapsedTime * freq + idx) * amp;
        cluster.rotation.x = Math.cos(elapsedTime * (freq * 0.8) + idx) * (amp * 0.6);
      });

      // Ribbon fluttering
      ribbonMeshes.forEach((rib, idx) => {
        rib.rotation.y = Math.sin(elapsedTime * 2.5 + idx) * 0.08;
      });

      // Sacred fruit gentle breathing glow
      fruits.forEach((frt, idx) => {
        const pulse = 1 + Math.sin(elapsedTime * 3 + idx) * 0.04;
        frt.scale.set(pulse, pulse, pulse);
      });

      // Fireflies floating & swirling
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += particleVel[i * 3 + 1];
        posArr[i * 3] += Math.sin(elapsedTime + i) * 0.005;
        posArr[i * 3 + 2] += Math.cos(elapsedTime + i) * 0.005;

        // Reset if float too high
        if (posArr[i * 3 + 1] > 5.5) {
          posArr[i * 3 + 1] = 0.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Handle caring particle effects
      if (isWatering) {
        rainMat.opacity = Math.min(1, rainMat.opacity + 0.1);
        const rPos = rainGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          rPos[i * 3 + 1] -= 0.18;
          if (rPos[i * 3 + 1] < 0) {
            rPos[i * 3 + 1] = 5 + Math.random() * 2;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else {
        rainMat.opacity = Math.max(0, rainMat.opacity - 0.05);
      }

      if (isSunbathing) {
        sunLight.intensity = 3.6 + Math.sin(elapsedTime * 8) * 0.6;
        ambientLight.intensity = 1.3;
      } else {
        sunLight.intensity = 2.2;
        ambientLight.intensity = 0.9;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // --- 13. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // --- 14. CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();

      // Dispose geometries & materials
      groundGeo.dispose();
      groundMat.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      shroomCapGeo.dispose();
      shroomCapMat.dispose();
      shroomStemGeo.dispose();
      shroomStemMat.dispose();
      barkTexture.dispose();
      barkMaterial.dispose();
      leafMaterial.dispose();
      flowerMaterial.dispose();
      fruitMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [level, hasSakuraTheme, hasGoldenApples, hasFairyLights, ribbons, isWatering, isSunbathing, isPruning]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 3D Controls Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-purple-200/80 pointer-events-none flex items-center gap-1.5 shadow-md">
        <span>Arraste para girar em 360° • Pinça para zoom 🔍</span>
      </div>
    </div>
  );
};
