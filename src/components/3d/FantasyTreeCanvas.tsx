import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  addCozyThreePointLights,
  detectSoftwareWebGL,
  disposeObject3D,
  setupCozyStudioRenderer,
} from '../../utils/threeCozyHelpers';

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

function createSoftGlowTexture(innerHex: string, outerHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, innerHex);
    grad.addColorStop(0.38, outerHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255, 240, 248, 1)');
    grad.addColorStop(0.55, 'rgba(244, 114, 182, 0.92)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(32, 32, 20, 11, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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
    scene.fog = new THREE.FogExp2(0x1f103d, 0.014);

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 350;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 2.75, 7.35);

    // --- 2. COZY RENDERER & ENVIRONMENT ---
    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    const disposeEnv = setupCozyStudioRenderer(renderer, scene, isSoftwareGl);
    scene.environmentIntensity = 0.72;
    container.appendChild(renderer.domElement);

    // Shared procedural glow textures (disposed cleanly on unmount)
    const auraTexPink = createSoftGlowTexture('rgba(255,220,245,0.9)', 'rgba(236,72,153,0.22)');
    const auraTexViolet = createSoftGlowTexture('rgba(233,213,255,0.85)', 'rgba(139,92,246,0.2)');
    const petalTex = createPetalTexture();

    // Shared GLSL uniform objects (mutated in render loop with zero GC)
    const shaderUniforms = {
      uTime: { value: 0 },
    };

    // --- 3. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 4.0;
    controls.maxDistance = 10.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minPolarAngle = Math.PI / 10;
    controls.target.set(0, 1.9, 0);

    // --- 4. COZY 3-POINT PASTEL LIGHTING ---
    const rig = addCozyThreePointLights(scene, {
      skyColor: 0xdbeafe,
      groundColor: 0xfde68a,
      hemiIntensity: 1.15,
      keyColor: 0xfff7e6,
      keyIntensity: 2.15,
      keyPosition: [4.5, 9.5, 5.5],
      rimColor: 0xf472b6,
      rimIntensity: 1.55,
      rimPosition: [-5.5, 4.8, -5.0],
      fillColor: 0xc4b5fd,
      fillIntensity: 0.72,
      shadowMapSize: isSoftwareGl ? 512 : 1024,
      shadowExtent: 4.5,
      isSoftwareGl,
    });
    const sunLight = rig.keyLight;

    const canopyLight = new THREE.PointLight(0xf9a8d4, 1.75, 12);
    canopyLight.position.set(0, 3.1, 1.5);
    scene.add(canopyLight);

    const poolLight = new THREE.PointLight(0x67e8f9, 1.05, 7);
    poolLight.position.set(0, 0.55, 1.6);
    scene.add(poolLight);

    // --- 5. FLOATING COZY SANCTUARY ISLAND & RUNED LOTUS POOL ---
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    const islandTopGeo = new THREE.CylinderGeometry(2.98, 2.68, 0.44, 44, 3);
    const islandPos = islandTopGeo.attributes.position;
    for (let i = 0; i < islandPos.count; i++) {
      const y = islandPos.getY(i);
      const x = islandPos.getX(i);
      const z = islandPos.getZ(i);
      if (y > 0.1) {
        const dist = Math.sqrt(x * x + z * z);
        islandPos.setY(i, y + Math.max(0, 0.25 - dist * 0.085) + Math.sin(x * 1.4 + z * 0.9) * 0.032);
      }
    }
    islandTopGeo.computeVertexNormals();
    const islandTopMat = new THREE.MeshStandardMaterial({
      color: 0x266f5d,
      roughness: 0.68,
      metalness: 0.04,
    });
    const islandTop = new THREE.Mesh(islandTopGeo, islandTopMat);
    islandTop.position.y = -0.18;
    islandTop.receiveShadow = true;
    terrainGroup.add(islandTop);

    // Sculpted basalt stone underbelly
    const stoneGeo = new THREE.ConeGeometry(2.62, 1.42, 24);
    stoneGeo.rotateX(Math.PI);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1b0b30,
      roughness: 0.78,
      metalness: 0.14,
    });
    const stoneUnder = new THREE.Mesh(stoneGeo, stoneMat);
    stoneUnder.position.y = -1.08;
    terrainGroup.add(stoneUnder);

    // Luminous Irminsul Rune Ring around the sanctuary rim
    const runeRingGeo = new THREE.TorusGeometry(2.58, 0.028, 10, 64);
    runeRingGeo.rotateX(Math.PI / 2);
    const runeRingMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xc026d3,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.4,
    });
    const runeRing = new THREE.Mesh(runeRingGeo, runeRingMat);
    runeRing.position.y = 0.065;
    terrainGroup.add(runeRing);

    const innerRuneGeo = new THREE.TorusGeometry(1.75, 0.018, 8, 56);
    innerRuneGeo.rotateX(Math.PI / 2);
    const innerRuneMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.15,
      roughness: 0.2,
    });
    const innerRune = new THREE.Mesh(innerRuneGeo, innerRuneMat);
    innerRune.position.y = 0.075;
    terrainGroup.add(innerRune);

    // Crystal mirror lotus pool wrapping front roots
    const poolGeo = new THREE.CircleGeometry(1.68, 40);
    poolGeo.rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x164e63,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.86,
    });
    poolMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.fragmentShader = `uniform float uTime;\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `
        #include <emissivemap_fragment>
        float rDist = length(vViewPosition.xz);
        float ripple = sin(rDist * 9.0 - uTime * 2.4) * 0.5 + 0.5;
        totalEmissiveRadiance += vec3(0.18, 0.48, 0.72) * ripple * 0.25;
        `
      );
    };
    const mirrorPool = new THREE.Mesh(poolGeo, poolMat);
    mirrorPool.position.set(0, 0.055, 0.42);
    terrainGroup.add(mirrorPool);

    // Floating glowing lotus blossoms on the mirror pool
    const lotusPetalGeo = new THREE.SphereGeometry(0.08, 10, 8);
    lotusPetalGeo.scale(1.2, 0.35, 0.65);
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      emissive: 0xf472b6,
      emissiveIntensity: 0.8,
      roughness: 0.25,
    });
    [
      [-0.85, 0.08, 1.15],
      [0.92, 0.08, 1.02],
      [0.25, 0.08, 1.55],
    ].forEach(([lx, ly, lz], idx) => {
      const lotus = new THREE.Group();
      lotus.position.set(lx, ly, lz);
      for (let p = 0; p < 6; p++) {
        const ang = (p / 6) * Math.PI * 2;
        const pet = new THREE.Mesh(lotusPetalGeo, lotusMat);
        pet.position.set(Math.cos(ang) * 0.075, 0, Math.sin(ang) * 0.075);
        pet.rotation.y = -ang;
        pet.rotation.z = 0.25;
        lotus.add(pet);
      }
      lotus.rotation.y = idx * 0.7;
      terrainGroup.add(lotus);
    });

    // Sculpted mossy earth mound beneath main trunk
    const moundGeo = new THREE.SphereGeometry(0.96, 28, 18);
    moundGeo.scale(1.2, 0.26, 1.15);
    const moundMat = new THREE.MeshStandardMaterial({
      color: 0x2f6b56,
      roughness: 0.72,
    });
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.y = 0.04;
    mound.receiveShadow = true;
    terrainGroup.add(mound);

    // Smooth rounded river pebbles rimming the island (zero angular dodecahedrons)
    const pebbleGeo = new THREE.SphereGeometry(0.22, 18, 14);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x6b5b95, roughness: 0.62, metalness: 0.05 });
    [
      [1.95, 0.08, 0.95, 1.2],
      [-1.85, 0.08, 1.15, 1.05],
      [1.35, 0.07, -1.75, 1.1],
      [-1.45, 0.07, -1.55, 1.15],
    ].forEach(([px, py, pz, s], i) => {
      const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
      pebble.position.set(px, py, pz);
      pebble.scale.set(s * 1.28, s * 0.62, s);
      pebble.rotation.set(0.12, i * 1.1, 0.08);
      pebble.castShadow = true;
      pebble.receiveShadow = true;
      terrainGroup.add(pebble);
    });

    // Cozy Stylized Glowing Pastel Mushrooms around the base
    const mushStemMat = new THREE.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.65 });
    const mushCapMatPink = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xec4899,
      emissiveIntensity: 0.45,
      roughness: 0.55,
    });
    const mushCapMatMint = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7,
      emissive: 0x10b981,
      emissiveIntensity: 0.4,
      roughness: 0.55,
    });
    [
      [-1.45, 0.08, 0.55, 1.0, true],
      [-1.62, 0.07, 0.35, 0.72, false],
      [1.48, 0.08, 0.45, 0.92, false],
      [0.95, 0.08, -1.25, 0.85, true],
    ].forEach(([mx, my, mz, sc, isPink]) => {
      const mg = new THREE.Group();
      mg.position.set(mx as number, my as number, mz as number);
      mg.scale.setScalar(sc as number);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.048, 0.14, 12), mushStemMat);
      stem.position.y = 0.07;
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
        isPink ? mushCapMatPink : mushCapMatMint
      );
      cap.position.y = 0.12;
      cap.castShadow = true;
      mg.add(stem, cap);
      terrainGroup.add(mg);
    });

    // --- 6. DYNAMIC TREE & ACCESSORY GROUP ---
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);

    const fruitRefs: { mesh: THREE.Object3D; baseY: number; phase: number; index: number }[] = [];
    const fairyLightRefs: { mesh: THREE.Mesh; phase: number }[] = [];
    const lanternRefs: { group: THREE.Group; baseY: number; phase: number }[] = [];
    const ribbonRefs: { mesh: THREE.Object3D; phase: number }[] = [];
    const auraSpriteRefs: { sprite: THREE.Sprite; baseScale: number; phase: number }[] = [];
    let swingPivot: THREE.Group | null = null;
    let butterflyGroup: THREE.Group | null = null;
    let butterflyWingL: THREE.Mesh | null = null;
    let butterflyWingR: THREE.Mesh | null = null;
    let songbirdGroup: THREE.Group | null = null;
    let sproutLeafMeshes: THREE.Object3D[] = [];

    const createTaperedBranch = (
      points: THREE.Vector3[],
      rStart: number,
      rEnd: number,
      mat: THREE.Material,
      radialSegs = 14,
      tubularSegs = 20
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
        const flare = t < 0.18 ? Math.pow(1 - t / 0.18, 2) * rStart * 0.5 : 0;
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

    // Instanced smooth volumetric blossom canopy clusters with GLSL wind sway (Cozy PK XD / Pixar look)
    const buildInstancedBlossomCanopy = (
      clusters: [number, number, number, number][],
      growth: number,
      paletteHex: number[],
      emissiveHex: number,
      emissiveStrength: number
    ) => {
      // Lâminas de folha individuais para uma copa mais orgânica,
      // mantendo o lago, raízes, lanternas, flores e cenário já existentes.
      const puffsPerCluster = isSoftwareGl ? 28 : 44;
      const totalInstances = clusters.length * puffsPerCluster;

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.075, 0.075, 0.018, 0.205);
      leafShape.quadraticCurveTo(-0.012, 0.16, -0.045, 0.105);
      leafShape.quadraticCurveTo(-0.075, 0.045, 0, 0);
      const puffGeo = new THREE.ShapeGeometry(leafShape, 8);
      puffGeo.computeVertexNormals();

      const puffMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: emissiveHex,
        emissiveIntensity: emissiveStrength,
        roughness: 0.58,
        metalness: 0.02,
        side: THREE.DoubleSide,
      });

      puffMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.uTime;
        shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 instOrigin = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 instOrigin = vec3(0.0);
          #endif
          float swayPhase = uTime * 1.65 + instOrigin.x * 1.4 + instOrigin.z * 1.1;
          transformed.x += sin(swayPhase) * 0.045;
          transformed.y += cos(swayPhase * 0.85) * 0.025;
          `
        );
      };

      const instMesh = new THREE.InstancedMesh(puffGeo, puffMat, totalInstances);
      instMesh.castShadow = true;
      instMesh.receiveShadow = true;

      const dummy = new THREE.Object3D();
      const colorObj = new THREE.Color();
      let idx = 0;

      // Deterministic pseudo-random helper so canopy doesn't flicker between rebuilds
      let seed = 1337;
      const nextRand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      clusters.forEach(([cx, cy, cz, rad], cIdx) => {
        const scaledR = rad * growth;
        for (let p = 0; p < puffsPerCluster; p++) {
          const theta = nextRand() * Math.PI * 2;
          const phi = Math.acos(2 * nextRand() - 1);
          const dist = Math.pow(nextRand(), 0.55) * scaledR * 0.92;

          dummy.position.set(
            cx * growth + Math.sin(phi) * Math.cos(theta) * dist * 1.2,
            cy * growth + Math.cos(phi) * dist * 0.65,
            cz * growth + Math.sin(phi) * Math.sin(theta) * dist * 1.2
          );
          dummy.rotation.set(nextRand() * 1.4, nextRand() * Math.PI * 2, nextRand() * 1.4);
          const puffScale = (0.58 + nextRand() * 0.72) * (0.85 + scaledR * 0.35);
          dummy.scale.set(puffScale, puffScale * 0.82, puffScale);
          dummy.updateMatrix();

          instMesh.setMatrixAt(idx, dummy.matrix);
          const hex = paletteHex[(cIdx + p) % paletteHex.length];
          colorObj.setHex(hex);
          // Slight warm lightness variance per puff
          colorObj.offsetHSL((nextRand() - 0.5) * 0.02, (nextRand() - 0.5) * 0.06, (nextRand() - 0.5) * 0.08);
          instMesh.setColorAt(idx, colorObj);
          idx++;
        }

        // Soft glowing volumetric halo sprite inside major canopy clusters
        const auraMat = new THREE.SpriteMaterial({
          map: cIdx % 2 === 0 ? auraTexPink : auraTexViolet,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(auraMat);
        sprite.position.set(cx * growth, cy * growth, cz * growth);
        const baseScale = rad * growth * 2.4;
        sprite.scale.set(baseScale, baseScale * 0.85, 1);
        treeGroup.add(sprite);
        auraSpriteRefs.push({ sprite, baseScale, phase: cIdx * 0.9 });
      });

      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;
      treeGroup.add(instMesh);
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

      while (treeGroup.children.length > 0) {
        const child = treeGroup.children[0];
        treeGroup.remove(child);
        disposeObject3D(child);
      }
      fruitRefs.length = 0;
      fairyLightRefs.length = 0;
      lanternRefs.length = 0;
      ribbonRefs.length = 0;
      auraSpriteRefs.length = 0;
      sproutLeafMeshes = [];
      swingPivot = null;
      butterflyGroup = null;
      butterflyWingL = null;
      butterflyWingR = null;
      songbirdGroup = null;

      // Smooth Cozy Stylized Cinnamon-Violet Bark with glowing Leyline Spirit Veins shader
      const barkMat = new THREE.MeshStandardMaterial({
        color: 0x5c374c,
        roughness: 0.68,
        metalness: 0.03,
      });
      barkMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.uTime;
        shader.vertexShader = `varying vec3 vWorldBarkPos;\n` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `
          #include <worldpos_vertex>
          vWorldBarkPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          `
        );
        shader.fragmentShader =
          `uniform float uTime;\nvarying vec3 vWorldBarkPos;\n` + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <emissivemap_fragment>',
          `
          #include <emissivemap_fragment>
          float veinWave = sin(vWorldBarkPos.y * 7.5 - uTime * 1.9 + sin(vWorldBarkPos.x * 12.0) * 1.8);
          float veinMask = smoothstep(0.86, 0.99, veinWave);
          totalEmissiveRadiance += vec3(0.94, 0.45, 0.76) * veinMask * 0.65;
          `
        );
      };

      const isCelestialMax = curLevel >= 10 && !sakura;
      const showSakura = sakura || curLevel >= 5;

      const paletteHex = sakura || showSakura
        ? [0xf472b6, 0xfbcfe8, 0xf9a8d4, 0xe879f9, 0xfdf2f8]
        : isCelestialMax
        ? [0x5eead4, 0x7dd3fc, 0xc4b5fd, 0x6ee7b7]
        : [0x4ade80, 0x86efac, 0x34d399, 0xf9a8d4];

      const canopyEmissiveHex = isCelestialMax ? 0x0f766e : showSakura ? 0xbe185d : 0x047857;
      const canopyEmissiveStr = showSakura || isCelestialMax ? 0.34 : 0.22;

      if (curLevel <= 1) {
        // --- STAGE 1: LUMINOUS SACRED SPROUT ---
        createTaperedBranch(
          [
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(0.06, 0.45, 0.03),
            new THREE.Vector3(-0.04, 0.88, -0.02),
            new THREE.Vector3(0, 1.18, 0),
          ],
          0.085,
          0.035,
          barkMat,
          12,
          16
        );

        const sproutMat = new THREE.MeshStandardMaterial({
          color: 0x34d399,
          emissive: 0x059669,
          emissiveIntensity: 0.45,
          roughness: 0.35,
        });
        const sproutLeafGeo = new THREE.SphereGeometry(0.26, 18, 14);
        sproutLeafGeo.scale(1.38, 0.26, 0.72);
        [-1, 1].forEach((dir, idx) => {
          const leaf = new THREE.Mesh(sproutLeafGeo, sproutMat);
          leaf.position.set(dir * 0.29, 1.06 + idx * 0.08, 0);
          leaf.rotation.set(0.15, dir * 0.3, dir * -0.45);
          leaf.castShadow = true;
          treeGroup.add(leaf);
          sproutLeafMeshes.push(leaf);
        });

        const budMat = new THREE.MeshStandardMaterial({
          color: 0xf9a8d4,
          emissive: 0xec4899,
          emissiveIntensity: 1.15,
          roughness: 0.2,
        });
        const bud = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), budMat);
        bud.position.set(0, 1.26, 0);
        treeGroup.add(bud);
      } else {
        // --- STAGE 2..10: SACRED SAKURA / IRMINSUL SANCTUARY TREE ---
        const growth = curLevel <= 3 ? 0.82 : curLevel <= 6 ? 1.02 : 1.2;

        // Graceful twisting Sacred S-curve trunk
        createTaperedBranch(
          [
            new THREE.Vector3(0, 0.0, 0),
            new THREE.Vector3(-0.14 * growth, 0.68 * growth, 0.06),
            new THREE.Vector3(0.11 * growth, 1.42 * growth, -0.05),
            new THREE.Vector3(0.0, 2.08 * growth, 0.0),
          ],
          0.32 * growth,
          0.16 * growth,
          barkMat,
          16,
          22
        );

        // Sweeping buttress roots clutching the rune sanctuary
        const rootCount = curLevel <= 3 ? 4 : 6;
        for (let r = 0; r < rootCount; r++) {
          const ang = (r / rootCount) * Math.PI * 2 + 0.35;
          createTaperedBranch(
            [
              new THREE.Vector3(Math.cos(ang) * 0.14 * growth, 0.48 * growth, Math.sin(ang) * 0.14 * growth),
              new THREE.Vector3(Math.cos(ang) * 0.42 * growth, 0.18 * growth, Math.sin(ang) * 0.42 * growth),
              new THREE.Vector3(Math.cos(ang) * 0.78 * growth, 0.02, Math.sin(ang) * 0.78 * growth),
            ],
            0.135 * growth,
            0.032 * growth,
            barkMat,
            10,
            12
          );
        }

        // Wide dramatic Irminsul / Sacred Sakura boughs
        const branchSpecs: { pts: [number, number, number][]; r0: number; r1: number }[] = [
          {
            pts: [
              [-0.02, 1.52, 0.02],
              [-0.78, 1.98, 0.14],
              [-1.55, 2.48, 0.24],
            ],
            r0: 0.145,
            r1: 0.055,
          },
          {
            pts: [
              [0.05, 1.48, -0.02],
              [0.8, 1.94, -0.12],
              [1.58, 2.46, -0.18],
            ],
            r0: 0.145,
            r1: 0.055,
          },
          {
            pts: [
              [0.0, 1.9, 0.0],
              [-0.45, 2.52, -0.42],
              [-0.92, 3.12, -0.72],
            ],
            r0: 0.11,
            r1: 0.048,
          },
          {
            pts: [
              [0.0, 1.92, 0.0],
              [0.48, 2.55, 0.44],
              [0.95, 3.16, 0.74],
            ],
            r0: 0.11,
            r1: 0.048,
          },
          {
            pts: [
              [0.0, 2.02, 0.0],
              [-0.1, 2.75, 0.06],
              [0.04, 3.45, 0.0],
            ],
            r0: 0.115,
            r1: 0.045,
          },
        ];

        if (curLevel >= 4) {
          branchSpecs.push(
            {
              pts: [
                [-0.62, 1.94, 0.12],
                [-1.08, 2.58, -0.48],
                [-1.38, 3.05, -0.85],
              ],
              r0: 0.088,
              r1: 0.036,
            },
            {
              pts: [
                [0.65, 1.88, -0.1],
                [1.12, 2.52, 0.48],
                [1.42, 3.0, 0.84],
              ],
              r0: 0.088,
              r1: 0.036,
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

        // Glowing carved heart sigil in the trunk
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, -0.065);
        heartShape.bezierCurveTo(0.085, 0.02, 0.095, 0.095, 0.042, 0.095);
        heartShape.bezierCurveTo(0.015, 0.095, 0, 0.068, 0, 0.052);
        heartShape.bezierCurveTo(0, 0.068, -0.015, 0.095, -0.042, 0.095);
        heartShape.bezierCurveTo(-0.095, 0.095, -0.085, 0.02, 0, -0.065);
        const carvedGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.03, bevelEnabled: false });
        const carvedMat = new THREE.MeshStandardMaterial({
          color: 0xf9a8d4,
          emissive: 0xf43f5e,
          emissiveIntensity: 1.4,
          roughness: 0.2,
        });
        const carvedHeart = new THREE.Mesh(carvedGeo, carvedMat);
        carvedHeart.position.set(0.03 * growth, 1.08 * growth, 0.22 * growth);
        treeGroup.add(carvedHeart);

        // Luminous layered blossom canopy via InstancedMesh + soft halo sprites
        const canopyNodes: [number, number, number, number][] = [
          [-1.52, 2.62, 0.24, 0.85],
          [1.56, 2.58, -0.2, 0.85],
          [-0.92, 3.22, -0.68, 0.88],
          [0.95, 3.26, 0.68, 0.88],
          [0.02, 3.72, 0.0, 1.05],
          [-0.58, 3.48, 0.62, 0.84],
          [0.6, 3.44, -0.62, 0.84],
        ];

        if (curLevel >= 4) {
          canopyNodes.push(
            [-1.36, 3.1, -0.82, 0.78],
            [1.38, 3.06, 0.8, 0.78],
            [0.0, 2.86, 1.02, 0.8],
            [0.0, 2.9, -1.02, 0.8],
            [-1.08, 2.48, 0.92, 0.72],
            [1.08, 2.45, -0.9, 0.72]
          );
        }

        if (curLevel >= 7) {
          canopyNodes.push(
            [-1.85, 2.38, -0.25, 0.7],
            [1.85, 2.36, 0.25, 0.7],
            [0.0, 4.22, 0.0, 0.82],
            [-0.74, 3.92, -0.36, 0.74],
            [0.74, 3.92, 0.36, 0.74]
          );
        }

        buildInstancedBlossomCanopy(canopyNodes, growth, paletteHex, canopyEmissiveHex, canopyEmissiveStr);

        // Sacred Hanging Fruits (Ruby or Golden Celestial Apples, clickable)
        if (curLevel >= 3 || golden) {
          const fruitGeo = new THREE.SphereGeometry(0.145, 18, 16);
          const fruitMat = new THREE.MeshStandardMaterial({
            color: golden ? 0xfef08a : 0xfb7185,
            emissive: golden ? 0xf59e0b : 0xe11d48,
            emissiveIntensity: golden ? 0.95 : 0.65,
            roughness: 0.18,
            metalness: golden ? 0.75 : 0.15,
          });
          const fruitCoords: [number, number, number][] = [
            [-1.3, 2.1, 0.36],
            [1.34, 2.06, -0.28],
            [0.05, 2.46, 0.98],
            [-0.82, 2.55, -0.74],
            [0.8, 2.58, 0.72],
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

        // Promise Ribbons (Shrine Omikuji / Wishes tied to boughs)
        const activeRibbons = curRibbons.slice(0, 6);
        activeRibbons.forEach((rib, idx) => {
          const rAng = (idx / Math.max(1, activeRibbons.length)) * Math.PI * 2 + 0.4;
          const rx = Math.cos(rAng) * 0.78 * growth;
          const ry = 1.85 * growth;
          const rz = Math.sin(rAng) * 0.78 * growth;

          const rCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(rx, ry + 0.12, rz),
            new THREE.Vector3(rx + 0.04, ry - 0.12, rz + 0.03),
            new THREE.Vector3(rx - 0.03, ry - 0.36, rz + 0.05),
          ]);
          const rGeo = new THREE.TubeGeometry(rCurve, 10, 0.025, 6, false);
          const rMat = new THREE.MeshStandardMaterial({
            color: rib.color || '#ec4899',
            emissive: rib.color || '#ec4899',
            emissiveIntensity: 0.6,
            roughness: 0.35,
          });
          const rMesh = new THREE.Mesh(rGeo, rMat);
          treeGroup.add(rMesh);
          ribbonRefs.push({ mesh: rMesh, phase: idx * 0.8 });
        });

        // Fairy Lights Garland
        if (lights || curLevel >= 7) {
          const lightCount = 18;
          const bulbGeo = new THREE.SphereGeometry(0.058, 10, 8);
          for (let i = 0; i < lightCount; i++) {
            const t = i / lightCount;
            const ang = t * Math.PI * 4.5;
            const rad = (0.8 + Math.sin(t * Math.PI) * 0.7) * growth;
            const ly = (2.15 + t * 1.65) * growth;
            const baseColor = new THREE.Color(i % 2 === 0 ? 0xfef08a : 0xf472b6);
            const bulbMat = new THREE.MeshBasicMaterial({ color: baseColor });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(Math.cos(ang) * rad, ly, Math.sin(ang) * rad);
            treeGroup.add(bulb);
            fairyLightRefs.push({ mesh: bulb, phase: i * 0.55 });
          }
        }

        // Romantic Wooden Swing
        if (swing) {
          const pivot = new THREE.Group();
          pivot.position.set(1.24 * growth, 2.26 * growth, -0.08);
          const ropeMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.75 });
          const ropeGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.42, 6);
          [-0.22, 0.22].forEach((rx) => {
            const rope = new THREE.Mesh(ropeGeo, ropeMat);
            rope.position.set(rx, -0.71, 0);
            pivot.add(rope);
          });
          const seatMat = new THREE.MeshStandardMaterial({ color: 0x7c432b, roughness: 0.62 });
          const seat = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.08, 0.26, 4, 0.03), seatMat);
          seat.position.set(0, -1.42, 0);
          seat.castShadow = true;
          pivot.add(seat);

          const vineFlowerMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xec4899,
            emissiveIntensity: 0.65,
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

        // Floating Xiao Lanterns with warm halo glow
        if (lanterns) {
          const lanternBodyGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.24, 12);
          const lanternCapGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.035, 12);
          const lanternGlowMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.65,
            roughness: 0.2,
          });
          const lanternCapMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

          [
            [-1.48 * growth, 1.92 * growth, 0.42],
            [1.54 * growth, 2.04 * growth, 0.58],
            [-0.66 * growth, 2.24 * growth, -1.0],
          ].forEach(([lx, ly, lz], idx) => {
            const lg = new THREE.Group();
            lg.position.set(lx, ly, lz);
            const body = new THREE.Mesh(lanternBodyGeo, lanternGlowMat);
            const topCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
            topCap.position.y = 0.13;
            const botCap = new THREE.Mesh(lanternCapGeo, lanternCapMat);
            botCap.position.y = -0.13;
            const halo = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: auraTexPink,
                color: 0xfbbf24,
                transparent: true,
                opacity: 0.55,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            );
            halo.scale.set(0.85, 0.85, 1);
            lg.add(body, topCap, botCap, halo);
            treeGroup.add(lg);
            lanternRefs.push({ group: lg, baseY: ly, phase: idx * 1.4 });
          });
        }

        // Perched Songbird
        if (songbird || curLevel >= 8) {
          const bird = new THREE.Group();
          bird.position.set(-1.35 * growth, 2.72 * growth, 0.48);
          const birdBodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.32 });
          const birdBellyMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.42 });
          const beakMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25 });

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

      // Rose Quartz & Electro/Celestial Leyline Root Crystals
      if (crystals || curLevel >= 4) {
        const crystalGeo = new THREE.OctahedronGeometry(0.17, 0);
        crystalGeo.scale(0.55, 1.72, 0.55);
        const pinkCrysMat = new THREE.MeshStandardMaterial({
          color: 0xf472b6,
          emissive: 0xdb2777,
          emissiveIntensity: 0.95,
          roughness: 0.12,
          metalness: 0.25,
          transparent: true,
          opacity: 0.92,
        });
        const tealCrysMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.85,
          roughness: 0.12,
          metalness: 0.25,
          transparent: true,
          opacity: 0.92,
        });
        [
          [1.12, 0.23, 0.68, 0.16, 0],
          [1.3, 0.17, 0.54, 0.44, 1],
          [-1.14, 0.21, 0.74, -0.26, 0],
          [-0.98, 0.16, -0.98, 0.32, 1],
        ].forEach(([cx, cy, cz, rotZ, matIdx]) => {
          const crys = new THREE.Mesh(crystalGeo, matIdx === 0 ? pinkCrysMat : tealCrysMat);
          crys.position.set(cx, cy, cz);
          crys.rotation.set(0.15, cx, rotZ);
          crys.castShadow = true;
          treeGroup.add(crys);
        });
      }

      // Lilac Spirit Butterfly
      if (butterfly || curLevel >= 6) {
        const bfly = new THREE.Group();
        const wingGeo = new THREE.CircleGeometry(0.12, 10);
        wingGeo.scale(1.2, 0.85, 1);
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xe879f9,
          emissive: 0xc026d3,
          emissiveIntensity: 0.95,
          side: THREE.DoubleSide,
          roughness: 0.2,
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

    // --- 7. SACRED SAKURA PETALS + SPIRIT FIREFLIES + WATER DROPLETS ---
    const fireflyCount = isSoftwareGl ? 36 : 72;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);
    const fireflyCol = new Float32Array(fireflyCount * 3);
    const fireflyVel = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const r = 0.65 + Math.random() * 2.45;
      fireflyPos[i * 3] = Math.cos(th) * r;
      fireflyPos[i * 3 + 1] = 0.35 + Math.random() * 4.4;
      fireflyPos[i * 3 + 2] = Math.sin(th) * r;
      fireflyVel[i] = 0.005 + Math.random() * 0.011;

      const mode = i % 3;
      fireflyCol[i * 3] = mode === 0 ? 1.0 : mode === 1 ? 0.96 : 0.45;
      fireflyCol[i * 3 + 1] = mode === 0 ? 0.88 : mode === 1 ? 0.46 : 0.92;
      fireflyCol[i * 3 + 2] = mode === 0 ? 0.45 : mode === 1 ? 0.85 : 1.0;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyCol, 3));
    const fireflyMat = new THREE.PointsMaterial({
      size: 0.11,
      map: auraTexPink,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fireflySystem = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflySystem);

    // Falling glowing Sakura Petals drifting gently downward
    const petalCount = isSoftwareGl ? 28 : 56;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    const petalVel = new Float32Array(petalCount);
    for (let i = 0; i < petalCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 2.4;
      petalPos[i * 3] = Math.cos(th) * r;
      petalPos[i * 3 + 1] = 0.4 + Math.random() * 4.2;
      petalPos[i * 3 + 2] = Math.sin(th) * r;
      petalVel[i] = 0.007 + Math.random() * 0.01;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
    const petalMat = new THREE.PointsMaterial({
      size: 0.16,
      map: petalTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const petalSystem = new THREE.Points(petalGeo, petalMat);
    scene.add(petalSystem);

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
      size: 0.095,
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

    // WebGL Context Loss & Restore Recovery
    let contextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const handleContextRestored = () => {
      contextLost = false;
      rebuildFnRef.current?.();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // --- 9. ANIMATION LOOP (Zero per-frame allocations) ---
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (contextLost) return;

      const t = clock.getElapsedTime();
      const { isWatering: watering, isSunbathing: sun, isPruning: pruning } = propsRef.current;

      if (!prefersReducedMotion) {
        shaderUniforms.uTime.value = t;

        for (let i = 0; i < sproutLeafMeshes.length; i++) {
          sproutLeafMeshes[i].rotation.z = (i === 0 ? 0.45 : -0.45) + Math.sin(t * 1.8 + i) * 0.06;
        }

        // Halo pulse inside canopy
        for (let i = 0; i < auraSpriteRefs.length; i++) {
          const a = auraSpriteRefs[i];
          const pulse = 1.0 + Math.sin(t * 1.8 + a.phase) * 0.1;
          a.sprite.scale.set(a.baseScale * pulse, a.baseScale * 0.85 * pulse, 1);
        }

        // Rune ring subtle glow pulse
        runeRingMat.emissiveIntensity = 1.2 + Math.sin(t * 2.1) * 0.35;
        innerRuneMat.emissiveIntensity = 0.95 + Math.cos(t * 2.4) * 0.3;

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
          ln.group.position.y = ln.baseY + Math.sin(t * 1.7 + ln.phase) * 0.085;
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
            Math.cos(orbitAng) * 1.75,
            2.95 + Math.sin(t * 2.2) * 0.38,
            Math.sin(orbitAng) * 1.75
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

        // Rising spirit motes
        const fArr = fireflyGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < fireflyCount; i++) {
          fArr[i * 3 + 1] += fireflyVel[i];
          fArr[i * 3] += Math.sin(t + i) * 0.003;
          fArr[i * 3 + 2] += Math.cos(t + i) * 0.003;
          if (fArr[i * 3 + 1] > 5.0) {
            fArr[i * 3 + 1] = 0.3;
          }
        }
        fireflyGeo.attributes.position.needsUpdate = true;

        // Falling glowing Sakura petals
        const pArr = petalGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < petalCount; i++) {
          pArr[i * 3 + 1] -= petalVel[i];
          pArr[i * 3] += Math.sin(t * 1.2 + i) * 0.0045;
          pArr[i * 3 + 2] += Math.cos(t * 0.9 + i) * 0.0035;
          if (pArr[i * 3 + 1] < 0.1) {
            pArr[i * 3 + 1] = 3.9 + (i % 5) * 0.2;
          }
        }
        petalGeo.attributes.position.needsUpdate = true;
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
        sunLight.intensity = 3.4 + Math.sin(t * 6) * 0.4;
        canopyLight.color.setHex(0xfde047);
      } else if (pruning) {
        sunLight.intensity = 2.65;
        canopyLight.color.setHex(0x6ee7b7);
      } else {
        sunLight.intensity = 2.15;
        canopyLight.color.setHex(0xf9a8d4);
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
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();

      disposeObject3D(terrainGroup);
      disposeObject3D(treeGroup);
      fireflyGeo.dispose();
      fireflyMat.dispose();
      petalGeo.dispose();
      petalMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      auraTexPink.dispose();
      auraTexViolet.dispose();
      petalTex.dispose();
      disposeEnv();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

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
