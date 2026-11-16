import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PetType, KittenState } from '../../types';

export type PetDanceMove = 'idle' | 'dance' | 'spin' | 'jump' | 'wave' | 'kiss';

interface PetCanvas3DProps {
  petType: PetType;
  kitten: KittenState;
  danceMove?: PetDanceMove;
  hasSoapFoam?: boolean;
  isShowering?: boolean;
  onPetTouch?: (part: 'head' | 'belly' | 'paw') => void;
}

interface SpeciesVisualSpec {
  main: number;
  secondary: number; // belly / muzzle / patches
  earOuter: number;
  earInner: number;
  nose: number;
  earStyle: 'cat' | 'floppy' | 'bunny' | 'round' | 'bigRound' | 'pig' | 'fin' | 'antenna' | 'tuft' | 'none';
  tailStyle: 'cat' | 'wag' | 'pompom' | 'curly' | 'long' | 'fluffy' | 'aquatic' | 'none';
  snoutStyle: 'soft' | 'long' | 'pig' | 'beak' | 'koala';
  bodyLayout: 'quadruped' | 'upright' | 'aquatic' | 'serpent' | 'bee';
  hasBlaze?: boolean;
  hasPandaMask?: boolean;
  hasMane?: boolean;
  hasShell?: boolean;
  hasSpines?: boolean;
  hasBeeStripes?: boolean;
  hasBeeWings?: boolean;
}

const SPECIES_SPECS: Record<PetType, SpeciesVisualSpec> = {
  cat: {
    main: 0xf7b2c9,
    secondary: 0xfff5f8,
    earOuter: 0xf472b6,
    earInner: 0xffe4e6,
    nose: 0xe11d48,
    earStyle: 'cat',
    tailStyle: 'cat',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  dog: {
    main: 0xc8742b, // Rich warm caramel clay like reference puppy
    secondary: 0xfff3e0,
    earOuter: 0x8f4914,
    earInner: 0xfde68a,
    nose: 0x1e1410,
    earStyle: 'floppy',
    tailStyle: 'wag',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
    hasBlaze: true,
  },
  bunny: {
    main: 0xfdf2f8,
    secondary: 0xffffff,
    earOuter: 0xf9a8d4,
    earInner: 0xfce7f3,
    nose: 0xf43f5e,
    earStyle: 'bunny',
    tailStyle: 'pompom',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  pig: {
    main: 0xfca5b9,
    secondary: 0xffe4e8,
    earOuter: 0xf472b6,
    earInner: 0xfbcfe8,
    nose: 0xf472b6,
    earStyle: 'pig',
    tailStyle: 'curly',
    snoutStyle: 'pig',
    bodyLayout: 'upright',
  },
  mouse: {
    main: 0x94a3b8,
    secondary: 0xf8fafc,
    earOuter: 0x64748b,
    earInner: 0xfbcfe8,
    nose: 0xf43f5e,
    earStyle: 'bigRound',
    tailStyle: 'long',
    snoutStyle: 'long',
    bodyLayout: 'upright',
  },
  snake: {
    main: 0x22c55e,
    secondary: 0xdcfce7,
    earOuter: 0x16a34a,
    earInner: 0x86efac,
    nose: 0xdc2626,
    earStyle: 'none',
    tailStyle: 'none',
    snoutStyle: 'soft',
    bodyLayout: 'serpent',
  },
  shark: {
    main: 0x38bdf8,
    secondary: 0xf8fafc,
    earOuter: 0x0284c7,
    earInner: 0xbae6fd,
    nose: 0x0369a1,
    earStyle: 'fin',
    tailStyle: 'aquatic',
    snoutStyle: 'long',
    bodyLayout: 'aquatic',
  },
  dolphin: {
    main: 0x22d3ee,
    secondary: 0xf0fdfa,
    earOuter: 0x0891b2,
    earInner: 0xa5f3fc,
    nose: 0x0e7490,
    earStyle: 'fin',
    tailStyle: 'aquatic',
    snoutStyle: 'long',
    bodyLayout: 'aquatic',
  },
  whale: {
    main: 0x60a5fa,
    secondary: 0xf8fafc,
    earOuter: 0x2563eb,
    earInner: 0xbfdbfe,
    nose: 0x1d4ed8,
    earStyle: 'none',
    tailStyle: 'aquatic',
    snoutStyle: 'soft',
    bodyLayout: 'aquatic',
  },
  bee: {
    main: 0xfacc15,
    secondary: 0xfefce8,
    earOuter: 0x1c1917,
    earInner: 0xfde047,
    nose: 0x1c1917,
    earStyle: 'antenna',
    tailStyle: 'none',
    snoutStyle: 'soft',
    bodyLayout: 'bee',
    hasBeeStripes: true,
    hasBeeWings: true,
  },
  fox: {
    main: 0xf97316,
    secondary: 0xfff7ed,
    earOuter: 0xc2410c,
    earInner: 0xfed7aa,
    nose: 0x1c1917,
    earStyle: 'cat',
    tailStyle: 'fluffy',
    snoutStyle: 'long',
    bodyLayout: 'upright',
    hasBlaze: true,
  },
  panda: {
    main: 0xf8fafc,
    secondary: 0xffffff,
    earOuter: 0x1e293b,
    earInner: 0x334155,
    nose: 0x0f172a,
    earStyle: 'round',
    tailStyle: 'pompom',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
    hasPandaMask: true,
  },
  koala: {
    main: 0x94a3b8,
    secondary: 0xf8fafc,
    earOuter: 0x64748b,
    earInner: 0xfce7f3,
    nose: 0x1e293b,
    earStyle: 'bigRound',
    tailStyle: 'pompom',
    snoutStyle: 'koala',
    bodyLayout: 'upright',
  },
  penguin: {
    main: 0x334155,
    secondary: 0xffffff,
    earOuter: 0x1e293b,
    earInner: 0x94a3b8,
    nose: 0xf59e0b,
    earStyle: 'tuft',
    tailStyle: 'pompom',
    snoutStyle: 'beak',
    bodyLayout: 'upright',
  },
  bear: {
    main: 0xb45309,
    secondary: 0xfef3c7,
    earOuter: 0x78350f,
    earInner: 0xfde68a,
    nose: 0x292524,
    earStyle: 'round',
    tailStyle: 'pompom',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  hamster: {
    main: 0xfdba74,
    secondary: 0xfff7ed,
    earOuter: 0xea580c,
    earInner: 0xffedd5,
    nose: 0xf43f5e,
    earStyle: 'round',
    tailStyle: 'pompom',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  lion: {
    main: 0xfbbf24,
    secondary: 0xfffbeb,
    earOuter: 0xd97706,
    earInner: 0xfde68a,
    nose: 0x78350f,
    earStyle: 'round',
    tailStyle: 'cat',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
    hasMane: true,
  },
  tiger: {
    main: 0xf97316,
    secondary: 0xfffbeb,
    earOuter: 0xea580c,
    earInner: 0xfed7aa,
    nose: 0xe11d48,
    earStyle: 'cat',
    tailStyle: 'cat',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  frog: {
    main: 0x84cc16,
    secondary: 0xfef9c3,
    earOuter: 0x65a30d,
    earInner: 0xd9f99d,
    nose: 0x365314,
    earStyle: 'round',
    tailStyle: 'none',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
  },
  hedgehog: {
    main: 0xd6d3d1,
    secondary: 0xfffbeb,
    earOuter: 0xa8a29e,
    earInner: 0xfecdd3,
    nose: 0x292524,
    earStyle: 'round',
    tailStyle: 'pompom',
    snoutStyle: 'long',
    bodyLayout: 'upright',
    hasSpines: true,
  },
  parrot: {
    main: 0xf43f5e,
    secondary: 0xfde047,
    earOuter: 0x10b981,
    earInner: 0x38bdf8,
    nose: 0xf59e0b,
    earStyle: 'tuft',
    tailStyle: 'fluffy',
    snoutStyle: 'beak',
    bodyLayout: 'upright',
  },
  turtle: {
    main: 0x4ade80,
    secondary: 0xfef08a,
    earOuter: 0x854d0e,
    earInner: 0xca8a04,
    nose: 0x15803d,
    earStyle: 'none',
    tailStyle: 'pompom',
    snoutStyle: 'soft',
    bodyLayout: 'upright',
    hasShell: true,
  },
};

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

function createHeartGeometry(scale = 0.08): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5 * scale);
  s.bezierCurveTo(0.65 * scale, 0.1 * scale, 0.72 * scale, 0.72 * scale, 0.34 * scale, 0.72 * scale);
  s.bezierCurveTo(0.12 * scale, 0.72 * scale, 0, 0.52 * scale, 0, 0.42 * scale);
  s.bezierCurveTo(0, 0.52 * scale, -0.12 * scale, 0.72 * scale, -0.34 * scale, 0.72 * scale);
  s.bezierCurveTo(-0.72 * scale, 0.72 * scale, -0.65 * scale, 0.1 * scale, 0, -0.5 * scale);
  return new THREE.ExtrudeGeometry(s, { depth: 0.25 * scale, bevelEnabled: true, bevelThickness: 0.05 * scale, bevelSize: 0.04 * scale, bevelSegments: 2 });
}

export const PetCanvas3D: React.FC<PetCanvas3DProps> = ({
  petType,
  kitten,
  danceMove = 'idle',
  hasSoapFoam = false,
  isShowering = false,
  onPetTouch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    petType,
    kitten,
    danceMove,
    hasSoapFoam,
    isShowering,
    onPetTouch,
  });
  propsRef.current = {
    petType,
    kitten,
    danceMove,
    hasSoapFoam,
    isShowering,
    onPetTouch,
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
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 310;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 60);
    camera.position.set(0, 1.45, 3.85);

    // --- 2. RENDERER & ROOM ENVIRONMENT ---
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
    scene.environmentIntensity = 0.65;
    roomEnv.dispose();
    pmrem.dispose();

    // --- 3. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0.72, 0);

    // --- 4. STUDIO CLAY LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xfff1f2, 0x240b44, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.25);
    keyLight.position.set(3.5, 5.5, 4.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.mapSize.height = isSoftwareGl ? 512 : 1024;
    keyLight.shadow.bias = -0.0008;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.2;
    keyLight.shadow.camera.right = 2.2;
    keyLight.shadow.camera.top = 2.8;
    keyLight.shadow.camera.bottom = -1;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 1.15);
    rimLight.position.set(-3.5, 2.5, -3.5);
    scene.add(rimLight);

    // --- 5. PEDESTAL STAGE ---
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const pedestalGeo = new THREE.CylinderGeometry(1.38, 1.48, 0.22, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1a0933,
      roughness: 0.45,
      metalness: 0.15,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.11;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    const rimGeo = new THREE.TorusGeometry(1.39, 0.022, 12, 64);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    stageGroup.add(rimMesh);

    // Soft contact shadow decal under pet
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, 'rgba(0,0,0,0.62)');
      grad.addColorStop(0.6, 'rgba(0,0,0,0.22)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 1.35),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    stageGroup.add(contactShadow);

    // --- 6. PET CHARACTER ROOT ---
    const petRoot = new THREE.Group();
    scene.add(petRoot);

    let headGroup: THREE.Group | null = null;
    let bodyGroup: THREE.Group | null = null;
    let tailObj: THREE.Object3D | null = null;
    let leftEarObj: THREE.Object3D | null = null;
    let rightEarObj: THREE.Object3D | null = null;
    let leftArmObj: THREE.Object3D | null = null;
    let rightArmObj: THREE.Object3D | null = null;
    let angelWingsObj: THREE.Group | null = null;
    let capeObj: THREE.Object3D | null = null;
    const snakeSegs: THREE.Object3D[] = [];

    const rebuildPet = () => {
      const { petType: type, kitten: st, hasSoapFoam: foam } = propsRef.current;
      const spec = SPECIES_SPECS[type] || SPECIES_SPECS.cat;

      while (petRoot.children.length > 0) {
        const ch = petRoot.children[0];
        petRoot.remove(ch);
        disposeObject3D(ch);
      }

      headGroup = null;
      bodyGroup = null;
      tailObj = null;
      leftEarObj = null;
      rightEarObj = null;
      leftArmObj = null;
      rightArmObj = null;
      angelWingsObj = null;
      capeObj = null;
      snakeSegs.length = 0;

      // Clay PBR Materials
      const mainMat = new THREE.MeshStandardMaterial({
        color: spec.main,
        roughness: 0.44,
        metalness: 0.04,
      });
      const secMat = new THREE.MeshStandardMaterial({
        color: spec.secondary,
        roughness: 0.46,
        metalness: 0.03,
      });
      const earOuterMat = new THREE.MeshStandardMaterial({
        color: spec.earOuter,
        roughness: 0.48,
        metalness: 0.03,
      });
      const earInnerMat = new THREE.MeshStandardMaterial({
        color: spec.earInner,
        roughness: 0.45,
      });
      const noseMat = new THREE.MeshStandardMaterial({
        color: spec.nose,
        roughness: 0.2,
        metalness: 0.1,
      });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x0b0714,
        roughness: 0.08,
        metalness: 0.15,
      });
      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blushMat = new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        roughness: 0.5,
        transparent: true,
        opacity: 0.58,
      });

      const hatId = st.equippedHat || '';
      const outfitId = st.equippedOutfit || '';
      const collarId = st.equippedCollar || '';
      const glassesId = st.equippedGlasses || '';
      const accId = st.equippedAccessory || '';

      // --- BUILD BODY BY SPECIES LAYOUT ---
      const torsoGroup = new THREE.Group();
      petRoot.add(torsoGroup);
      bodyGroup = torsoGroup;

      if (spec.bodyLayout === 'serpent') {
        // Coiled sculpted serpent body
        for (let i = 0; i < 10; i++) {
          const t = i / 9;
          const r = 0.17 * (1 - t * 0.5);
          const seg = new THREE.Mesh(
            new THREE.SphereGeometry(r, 18, 16),
            i % 2 === 0 ? mainMat : secMat
          );
          seg.castShadow = true;
          seg.position.set(Math.sin(t * 2.2) * 0.25, r + 0.02, 0.1 - t * 0.7);
          torsoGroup.add(seg);
          snakeSegs.push(seg);
        }
      } else if (spec.bodyLayout === 'aquatic') {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 20), mainMat);
        body.scale.set(0.95, 0.85, 1.32);
        body.position.set(0, 0.56, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        torsoGroup.add(body);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), secMat);
        belly.scale.set(0.88, 0.65, 1.25);
        belly.position.set(0, 0.45, 0.04);
        torsoGroup.add(belly);

        // Pectoral Flippers
        const flipGeo = new THREE.SphereGeometry(0.16, 14, 12);
        flipGeo.scale(1.4, 0.28, 0.72);
        const lFlip = new THREE.Mesh(flipGeo, earOuterMat);
        lFlip.position.set(-0.42, 0.48, 0.12);
        lFlip.rotation.set(0.1, -0.35, -0.3);
        torsoGroup.add(lFlip);
        leftArmObj = lFlip;

        const rFlip = new THREE.Mesh(flipGeo, earOuterMat);
        rFlip.position.set(0.42, 0.48, 0.12);
        rFlip.rotation.set(0.1, 0.35, 0.3);
        torsoGroup.add(rFlip);
        rightArmObj = rFlip;
      } else {
        // Upright adorable seated clay plush (matches reference puppy!)
        const torsoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 26, 22), mainMat);
        torsoMesh.scale.set(0.95, 1.12, 0.9);
        torsoMesh.position.set(0, 0.44, 0);
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        torsoGroup.add(torsoMesh);

        // Soft chest patch
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), secMat);
        chest.scale.set(0.92, 1.15, 0.55);
        chest.position.set(0, 0.44, 0.22);
        torsoGroup.add(chest);

        // Bee stripes
        if (spec.hasBeeStripes) {
          const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
          [-0.08, 0.08].forEach((sy) => {
            const stRing = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.042, 10, 28), stripeMat);
            stRing.rotation.x = Math.PI / 2;
            stRing.position.set(0, 0.44 + sy, 0);
            torsoGroup.add(stRing);
          });
        }

        // Turtle shell on back
        if (spec.hasShell) {
          const shellMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.45 });
          const shell = new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 16), shellMat);
          shell.scale.set(1.05, 1.15, 0.65);
          shell.position.set(0, 0.48, -0.2);
          shell.castShadow = true;
          torsoGroup.add(shell);
        }

        // Front arms & seated chubby legs/paws
        const armGeo = new THREE.CapsuleGeometry(0.085, 0.2, 8, 14);
        const lArm = new THREE.Mesh(armGeo, mainMat);
        lArm.position.set(-0.3, 0.46, 0.14);
        lArm.rotation.set(-0.35, 0, 0.35);
        lArm.castShadow = true;
        torsoGroup.add(lArm);
        leftArmObj = lArm;

        const rArm = new THREE.Mesh(armGeo, mainMat);
        rArm.position.set(0.3, 0.46, 0.14);
        rArm.rotation.set(-0.35, 0, -0.35);
        rArm.castShadow = true;
        torsoGroup.add(rArm);
        rightArmObj = rArm;

        const pawGeo = new THREE.SphereGeometry(0.115, 16, 14);
        pawGeo.scale(0.95, 0.72, 1.32);
        [-0.2, 0.2].forEach((px) => {
          const paw = new THREE.Mesh(pawGeo, secMat);
          paw.position.set(px, 0.085, 0.22);
          paw.castShadow = true;
          torsoGroup.add(paw);
        });

        // Bee translucent wings
        if (spec.hasBeeWings) {
          const wMat = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
          });
          const wGeo = new THREE.SphereGeometry(0.22, 14, 12);
          wGeo.scale(1.3, 0.12, 0.75);
          const lW = new THREE.Mesh(wGeo, wMat);
          lW.position.set(-0.32, 0.62, -0.22);
          lW.rotation.z = 0.4;
          const rW = new THREE.Mesh(wGeo, wMat);
          rW.position.set(0.32, 0.62, -0.22);
          rW.rotation.z = -0.4;
          torsoGroup.add(lW, rW);
        }
      }

      // --- BUILD HEAD (Smooth Clay Rounded Sculpt) ---
      const head = new THREE.Group();
      head.position.set(0, spec.bodyLayout === 'aquatic' ? 0.66 : spec.bodyLayout === 'serpent' ? 0.56 : 0.96, spec.bodyLayout === 'aquatic' ? 0.35 : 0.06);
      petRoot.add(head);
      headGroup = head;

      const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.41, 28, 22), mainMat);
      headBall.scale.set(1.06, 0.96, 1.0);
      headBall.castShadow = true;
      headBall.receiveShadow = true;
      head.add(headBall);

      // Soft blaze stripe (dog/fox)
      if (spec.hasBlaze) {
        const blaze = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.24, 6, 12), secMat);
        blaze.position.set(0, 0.16, 0.37);
        blaze.rotation.x = -0.38;
        blaze.scale.set(1.0, 1.0, 0.35);
        head.add(blaze);
      }

      // Lion mane / Hedgehog spines
      if (spec.hasMane) {
        const maneMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), maneMat);
          puff.position.set(Math.cos(ang) * 0.39, Math.sin(ang) * 0.37, -0.06);
          puff.castShadow = true;
          head.add(puff);
        }
      }
      if (spec.hasSpines) {
        const spineMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.65 });
        for (let i = 0; i < 9; i++) {
          const ang = -1.1 + (i / 8) * 2.2;
          const sp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), spineMat);
          sp.position.set(Math.sin(ang) * 0.36, 0.18 + Math.cos(ang) * 0.2, -0.22);
          sp.rotation.z = -ang;
          sp.rotation.x = -0.5;
          head.add(sp);
        }
      }

      // Panda eye patches
      if (spec.hasPandaMask) {
        const patchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        [-0.15, 0.15].forEach((px) => {
          const patch = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 14), patchMat);
          patch.scale.set(1.1, 1.2, 0.35);
          patch.position.set(px, 0.04, 0.36);
          patch.rotation.y = px > 0 ? 0.25 : -0.25;
          head.add(patch);
        });
      }

      // --- EYES (Glossy clay eyes + catchlights or sleeping lids) ---
      if (st.isSleeping) {
        const lidMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
        [-0.155, 0.155].forEach((ex) => {
          const lid = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.015, 8, 16, Math.PI), lidMat);
          lid.position.set(ex, 0.04, 0.38);
          lid.rotation.z = Math.PI;
          head.add(lid);
        });
      } else {
        const eyeGeo = new THREE.SphereGeometry(0.072, 18, 16);
        const rimRingGeo = new THREE.SphereGeometry(0.084, 18, 16);
        const hlBigGeo = new THREE.SphereGeometry(0.025, 10, 10);
        const hlSmallGeo = new THREE.SphereGeometry(0.012, 8, 8);

        [-0.155, 0.155].forEach((ex) => {
          const eye = new THREE.Mesh(eyeGeo, eyeMat);
          eye.position.set(ex, 0.045, 0.36);
          eye.scale.set(1.0, 1.08, 0.65);

          const outerRim = new THREE.Mesh(rimRingGeo, secMat);
          outerRim.position.set(0, 0, -0.012);
          outerRim.scale.set(1.0, 1.05, 0.5);
          eye.add(outerRim);

          const hl1 = new THREE.Mesh(hlBigGeo, whiteMat);
          hl1.position.set(0.022, 0.025, 0.056);
          const hl2 = new THREE.Mesh(hlSmallGeo, whiteMat);
          hl2.position.set(-0.02, -0.02, 0.058);
          eye.add(hl1, hl2);

          head.add(eye);
        });
      }

      // Rosy blush cheeks
      [-0.25, 0.25].forEach((cx) => {
        const blush = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), blushMat);
        blush.scale.set(1.25, 0.72, 0.25);
        blush.position.set(cx, -0.06, 0.35);
        blush.rotation.y = cx > 0 ? 0.5 : -0.5;
        head.add(blush);
      });

      // --- SOFT CLAY MUZZLE / BEAK / SNOUT (NO blocky cubes!) ---
      if (spec.snoutStyle === 'beak') {
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.14, 12), noseMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.05, 0.44);
        head.add(beak);
      } else if (spec.snoutStyle === 'pig') {
        const snoutDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.09, 20), noseMat);
        snoutDisc.rotation.x = Math.PI / 2;
        snoutDisc.position.set(0, -0.06, 0.41);
        head.add(snoutDisc);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x831843 });
        [-0.045, 0.045].forEach((nx) => {
          const hole = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), holeMat);
          hole.position.set(nx, 0.045, 0);
          snoutDisc.add(hole);
        });
      } else if (spec.snoutStyle === 'koala') {
        const koalaNose = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.06, 8, 12), noseMat);
        koalaNose.position.set(0, -0.03, 0.42);
        koalaNose.scale.set(1, 1.15, 0.7);
        head.add(koalaNose);
      } else {
        // Twin soft puffy muzzle cheeks like the reference puppy
        const puffScale = spec.snoutStyle === 'long' ? 1.15 : 1.0;
        [-0.062, 0.062].forEach((mx) => {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), secMat);
          puff.scale.set(1.1, 0.9, puffScale);
          puff.position.set(mx, -0.1, 0.36);
          head.add(puff);
        });
        const chin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), secMat);
        chin.scale.set(1.2, 0.65, 0.9);
        chin.position.set(0, -0.15, 0.34);
        head.add(chin);

        // Smooth rounded glossy nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 14), noseMat);
        nose.scale.set(1.2, 0.85, 0.85);
        nose.position.set(0, -0.035, 0.44);
        head.add(nose);
      }

      // --- EARS ---
      if (spec.earStyle === 'floppy') {
        const earGeo = new THREE.CapsuleGeometry(0.1, 0.25, 10, 14);
        earGeo.scale(0.85, 1.0, 0.38);
        const lEar = new THREE.Mesh(earGeo, earOuterMat);
        lEar.position.set(-0.4, -0.03, 0.02);
        lEar.rotation.set(0.08, 0.15, -0.26);
        lEar.castShadow = true;
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = new THREE.Mesh(earGeo, earOuterMat);
        rEar.position.set(0.4, -0.03, 0.02);
        rEar.rotation.set(0.08, -0.15, 0.26);
        rEar.castShadow = true;
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'cat') {
        const earGeo = new THREE.ConeGeometry(0.145, 0.28, 16);
        const earInGeo = new THREE.ConeGeometry(0.085, 0.18, 12);
        const lEar = new THREE.Mesh(earGeo, earOuterMat);
        lEar.position.set(-0.26, 0.35, 0.02);
        lEar.rotation.set(0.1, 0, 0.36);
        const lIn = new THREE.Mesh(earInGeo, earInnerMat);
        lIn.position.set(0, -0.02, 0.045);
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = new THREE.Mesh(earGeo, earOuterMat);
        rEar.position.set(0.26, 0.35, 0.02);
        rEar.rotation.set(0.1, 0, -0.36);
        const rIn = new THREE.Mesh(earInGeo, earInnerMat);
        rIn.position.set(0, -0.02, 0.045);
        rEar.add(rIn);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'bunny') {
        const earGeo = new THREE.CapsuleGeometry(0.085, 0.38, 10, 14);
        earGeo.scale(0.9, 1.0, 0.42);
        const earInGeo = new THREE.CapsuleGeometry(0.048, 0.3, 8, 12);
        earInGeo.scale(0.9, 1.0, 0.35);

        const lEar = new THREE.Mesh(earGeo, mainMat);
        lEar.position.set(-0.18, 0.48, 0);
        lEar.rotation.set(-0.08, 0, 0.18);
        const lIn = new THREE.Mesh(earInGeo, earInnerMat);
        lIn.position.z = 0.025;
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = new THREE.Mesh(earGeo, mainMat);
        rEar.position.set(0.18, 0.48, 0);
        rEar.rotation.set(-0.08, 0, -0.18);
        const rIn = new THREE.Mesh(earInGeo, earInnerMat);
        rIn.position.z = 0.025;
        rEar.add(rIn);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'round' || spec.earStyle === 'bigRound' || spec.earStyle === 'pig') {
        const rad = spec.earStyle === 'bigRound' ? 0.18 : 0.13;
        const earGeo = new THREE.SphereGeometry(rad, 16, 14);
        earGeo.scale(1.0, 1.0, 0.42);
        const inGeo = new THREE.SphereGeometry(rad * 0.62, 12, 10);
        inGeo.scale(1.0, 1.0, 0.45);
        const xOff = spec.earStyle === 'bigRound' ? 0.38 : 0.3;
        const yOff = spec.earStyle === 'bigRound' ? 0.24 : 0.31;

        const lEar = new THREE.Mesh(earGeo, earOuterMat);
        lEar.position.set(-xOff, yOff, 0);
        const lIn = new THREE.Mesh(inGeo, earInnerMat);
        lIn.position.z = 0.02;
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = new THREE.Mesh(earGeo, earOuterMat);
        rEar.position.set(xOff, yOff, 0);
        const rIn = new THREE.Mesh(inGeo, earInnerMat);
        rIn.position.z = 0.02;
        rEar.add(rIn);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'fin') {
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 12), earOuterMat);
        fin.scale.set(0.32, 1.0, 1.1);
        fin.position.set(0, 0.42, -0.05);
        fin.rotation.x = -0.35;
        head.add(fin);
      } else if (spec.earStyle === 'antenna') {
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
        const tipGeo = new THREE.SphereGeometry(0.04, 10, 10);
        [-0.14, 0.14].forEach((ax) => {
          const ant = new THREE.Mesh(stemGeo, earOuterMat);
          ant.position.set(ax, 0.44, 0.06);
          ant.rotation.z = ax > 0 ? -0.25 : 0.25;
          const tip = new THREE.Mesh(tipGeo, mainMat);
          tip.position.y = 0.12;
          ant.add(tip);
          head.add(ant);
        });
      } else if (spec.earStyle === 'tuft') {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 10), earInnerMat);
        tuft.position.set(0, 0.42, 0.04);
        head.add(tuft);
      }

      // --- TAIL ---
      if (spec.tailStyle === 'cat' || spec.tailStyle === 'wag') {
        const tCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.32, -0.3),
          new THREE.Vector3(0.08, 0.46, -0.46),
          new THREE.Vector3(0.02, 0.68, -0.52),
        ]);
        const tail = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 14, 0.055, 10, false), mainMat);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), secMat);
        tip.position.set(0.02, 0.68, -0.52);
        tail.add(tip);
        torsoGroup.add(tail);
        tailObj = tail;
      } else if (spec.tailStyle === 'fluffy') {
        const fTail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), mainMat);
        fTail.scale.set(0.85, 1.4, 0.85);
        fTail.position.set(0, 0.38, -0.42);
        fTail.rotation.x = 0.6;
        torsoGroup.add(fTail);
        tailObj = fTail;
      } else if (spec.tailStyle === 'pompom') {
        const pom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), secMat);
        pom.position.set(0, 0.28, -0.38);
        torsoGroup.add(pom);
        tailObj = pom;
      } else if (spec.tailStyle === 'aquatic') {
        const cTail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 10), earOuterMat);
        cTail.scale.set(0.25, 1.0, 1.1);
        cTail.position.set(0, 0.56, -0.62);
        cTail.rotation.x = -Math.PI / 2;
        torsoGroup.add(cTail);
        tailObj = cTail;
      }

      // ============================================================
      // 👕 CLOTHING, HATS, GLASSES, COLLARS, TIES & ACCESSORIES
      // ============================================================

      // 1. OUTFITS (Torso garments)
      if (outfitId && spec.bodyLayout !== 'serpent') {
        let outfitColor = 0x9333ea;
        let accentColor = 0xf472b6;
        if (outfitId === 'item-pet-dress') {
          outfitColor = 0xec4899;
          accentColor = 0xfbcfe8;
        } else if (outfitId === 'item-pet-tuxedo') {
          outfitColor = 0x0f172a;
          accentColor = 0xfbbf24;
        } else if (outfitId === 'item-pet-pajamas') {
          outfitColor = 0x312e81;
          accentColor = 0xfef08a;
        } else if (outfitId === 'item-pet-jacket') {
          outfitColor = 0x6d28d9;
          accentColor = 0xec4899;
        } else if (outfitId === 'item-pet-sweater') {
          outfitColor = 0xfef3c7;
          accentColor = 0xf43f5e;
        } else if (outfitId === 'item-pet-tshirt') {
          outfitColor = 0xf9a8d4;
          accentColor = 0xffffff;
        }

        const outMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.55 });
        const accMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.35, metalness: outfitId === 'item-pet-tuxedo' ? 0.6 : 0.1 });

        const shirt = new THREE.Mesh(new THREE.SphereGeometry(0.375, 24, 18), outMat);
        shirt.scale.set(0.98, 1.05, 0.94);
        shirt.position.set(0, 0.44, 0);
        torsoGroup.add(shirt);

        if (outfitId === 'item-pet-dress') {
          // Flared ruffled skirt cone
          const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.36, 24, 1, true), outMat);
          skirt.position.set(0, 0.25, 0);
          torsoGroup.add(skirt);
          const belt = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 8, 24), accMat);
          belt.rotation.x = Math.PI / 2;
          belt.position.set(0, 0.4, 0);
          torsoGroup.add(belt);
        } else if (outfitId === 'item-pet-tuxedo') {
          // Gold buttons down chest
          [0.52, 0.42, 0.32].forEach((by) => {
            const btn = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), accMat);
            btn.position.set(0, by, 0.36);
            torsoGroup.add(btn);
          });
        } else {
          // Heart badge on chest
          const heartBadge = new THREE.Mesh(createHeartGeometry(0.085), accMat);
          heartBadge.position.set(0, 0.46, 0.355);
          torsoGroup.add(heartBadge);
        }
      }

      // 2. COLLARS & TIES (Default cute collar if dog and nothing selected? Keep clean: only show what is equipped OR soft collar if item-pet-heart-collar)
      if (collarId) {
        if (collarId === 'item-pet-heart-collar') {
          const redCollar = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.042, 12, 28),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
          );
          redCollar.rotation.x = Math.PI / 2;
          redCollar.position.set(0, 0.64, 0.03);
          torsoGroup.add(redCollar);

          const goldHeart = new THREE.Mesh(
            createHeartGeometry(0.075),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.75, roughness: 0.2 })
          );
          goldHeart.position.set(0, 0.57, 0.31);
          torsoGroup.add(goldHeart);
        } else if (collarId === 'item-cat-bowtie') {
          const btMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.35 });
          const bt = new THREE.Group();
          bt.position.set(0, 0.62, 0.3);
          const lW = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 8), btMat);
          lW.rotation.z = -Math.PI / 2;
          lW.position.x = -0.075;
          const rW = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 8), btMat);
          rW.rotation.z = Math.PI / 2;
          rW.position.x = 0.075;
          const knot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
          bt.add(lW, rW, knot);
          torsoGroup.add(bt);
        } else if (collarId === 'item-pet-necktie') {
          const tieGroup = new THREE.Group();
          tieGroup.position.set(0, 0.62, 0.3);
          const tieMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35 });
          const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), tieMat);
          const blade = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 4), tieMat);
          blade.scale.set(1.0, 1.0, 0.28);
          blade.rotation.z = Math.PI;
          blade.position.y = -0.14;
          tieGroup.add(knot, blade);
          torsoGroup.add(tieGroup);
        } else if (collarId === 'item-pet-scarf') {
          const scMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.65 });
          const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.065, 12, 28), scMat);
          wrap.rotation.x = Math.PI / 2;
          wrap.position.set(0, 0.64, 0.03);
          const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 10), scMat);
          tail.position.set(0.14, 0.48, 0.28);
          tail.rotation.z = 0.25;
          torsoGroup.add(wrap, tail);
        } else if (collarId === 'item-pet-pearls') {
          const pearlMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.18, metalness: 0.25 });
          const pGeo = new THREE.SphereGeometry(0.036, 10, 10);
          for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2;
            const p = new THREE.Mesh(pGeo, pearlMat);
            p.position.set(Math.cos(a) * 0.29, 0.64, 0.03 + Math.sin(a) * 0.29);
            torsoGroup.add(p);
          }
        }
      }

      // 3. HATS (Mounted cleanly on top of headGroup)
      if (hatId) {
        if (hatId === 'item-cat-crown') {
          const crownMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.78, roughness: 0.2 });
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.15, 8), crownMat);
          crown.position.set(0, 0.44, 0.02);
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.042), new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.6 }));
          gem.position.set(0, 0.01, 0.16);
          crown.add(gem);
          head.add(crown);
        } else if (hatId === 'item-cat-ribbon') {
          const bowMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
          const bow = new THREE.Group();
          bow.position.set(0.24, 0.34, 0.14);
          bow.rotation.set(0.2, 0.3, -0.4);
          const lw = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.12, 10), bowMat);
          lw.rotation.z = -Math.PI / 2;
          lw.position.x = -0.07;
          const rw = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.12, 10), bowMat);
          rw.rotation.z = Math.PI / 2;
          rw.position.x = 0.07;
          const center = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), bowMat);
          bow.add(lw, rw, center);
          head.add(bow);
        } else if (hatId === 'item-pet-flower-crown') {
          const vine = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 28), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
          vine.rotation.x = Math.PI / 2;
          vine.position.y = 0.28;
          head.add(vine);
          const flowerCols = [0xf472b6, 0xfde047, 0xfb7185, 0xc084fc, 0xfff1f2, 0xf472b6];
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshStandardMaterial({ color: flowerCols[i], roughness: 0.35 }));
            fl.position.set(Math.cos(a) * 0.32, 0.29, Math.sin(a) * 0.32);
            head.add(fl);
          }
        } else if (hatId === 'item-pet-cap') {
          const capMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.45 });
          const brimMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.37, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), capMat);
          dome.position.y = 0.14;
          const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 16, 1, false, -Math.PI / 2, Math.PI), brimMat);
          visor.position.set(0, 0.22, 0.28);
          visor.rotation.x = 0.2;
          head.add(dome, visor);
        } else if (hatId === 'item-pet-beret') {
          const beretMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 });
          const disc = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), beretMat);
          disc.scale.set(1.1, 0.38, 1.1);
          disc.position.set(0.06, 0.38, 0.02);
          disc.rotation.z = -0.22;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 6), beretMat);
          stem.position.y = 0.13;
          disc.add(stem);
          head.add(disc);
        } else if (hatId === 'item-pet-party-hat') {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 18), new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.35 }));
          cone.position.set(0, 0.54, 0.02);
          const pom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
          pom.position.y = 0.2;
          cone.add(pom);
          head.add(cone);
        } else if (hatId === 'item-pet-cowboy-hat') {
          const hatMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 24), hatMat);
          brim.position.y = 0.33;
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.22, 16), hatMat);
          crown.position.y = 0.44;
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.23, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
          band.position.y = 0.36;
          head.add(brim, crown, band);
        } else if (hatId === 'item-pet-beanie') {
          const knitMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), knitMat);
          dome.position.y = 0.16;
          const pom = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), secMat);
          pom.position.y = 0.54;
          head.add(dome, pom);
        } else if (hatId === 'item-pet-wizard-hat') {
          const wizMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.45 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.03, 24), wizMat);
          brim.position.y = 0.32;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 20), wizMat);
          cone.position.y = 0.56;
          cone.rotation.z = -0.1;
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.7 }));
          star.position.set(0, 0.45, 0.22);
          head.add(brim, cone, star);
        }
      }

      // 4. GLASSES
      if (glassesId && !st.isSleeping) {
        const gGroup = new THREE.Group();
        gGroup.position.set(0, 0.045, 0.415);
        const frameColor = glassesId === 'item-pet-heart-glasses' ? 0xf472b6 : glassesId === 'item-pet-round-glasses' ? 0xfbbf24 : 0xf59e0b;
        const lensColor = glassesId === 'item-pet-round-glasses' ? 0xbae6fd : 0x0f172a;
        const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.65, roughness: 0.2 });
        const lensMat = new THREE.MeshStandardMaterial({
          color: lensColor,
          roughness: 0.1,
          metalness: 0.85,
          transparent: glassesId === 'item-pet-round-glasses',
          opacity: glassesId === 'item-pet-round-glasses' ? 0.35 : 0.95,
        });

        [-0.155, 0.155].forEach((lx) => {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.015, 10, 20), frameMat);
          rim.position.x = lx;
          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.088, 18), lensMat);
          lens.position.set(lx, 0, 0.004);
          gGroup.add(rim, lens);
        });
        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8), frameMat);
        bridge.rotation.z = Math.PI / 2;
        gGroup.add(bridge);
        head.add(gGroup);
      }

      // 5. BACK & HEAD ACCESSORIES (Wings, Cape, Heart Backpack, Headphones)
      if (accId === 'item-cat-angel-wings') {
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xe0e7ff,
          emissiveIntensity: 0.35,
          roughness: 0.28,
        });
        const wGeo = new THREE.SphereGeometry(0.24, 14, 12);
        wGeo.scale(1.4, 0.72, 0.14);
        const aGroup = new THREE.Group();
        aGroup.position.set(0, 0.55, -0.34);
        const lw = new THREE.Mesh(wGeo, wingMat);
        lw.position.set(-0.28, 0, 0);
        lw.rotation.set(0.15, 0.25, 0.35);
        const rw = new THREE.Mesh(wGeo, wingMat);
        rw.position.set(0.28, 0, 0);
        rw.rotation.set(0.15, -0.25, -0.35);
        aGroup.add(lw, rw);
        torsoGroup.add(aGroup);
        angelWingsObj = aGroup;
      } else if (accId === 'item-pet-cape') {
        const capeMat = new THREE.MeshStandardMaterial({
          color: 0xe11d48,
          roughness: 0.5,
          side: THREE.DoubleSide,
        });
        const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.44, 0.56, 16, 1, true, Math.PI * 0.65, Math.PI * 0.7), capeMat);
        cape.position.set(0, 0.38, -0.14);
        cape.rotation.x = 0.22;
        torsoGroup.add(cape);
        capeObj = cape;
      } else if (accId === 'item-pet-heart-backpack') {
        const packMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.38 });
        const pack = new THREE.Mesh(createHeartGeometry(0.26), packMat);
        pack.position.set(0, 0.46, -0.38);
        torsoGroup.add(pack);
      } else if (accId === 'item-pet-headphones') {
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3, metalness: 0.3 });
        const cupMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.45, roughness: 0.2 });
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.032, 10, 28, Math.PI), bandMat);
        band.position.y = 0.06;
        head.add(band);
        [-0.43, 0.43].forEach((hx) => {
          const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.075, 16), cupMat);
          cup.rotation.z = Math.PI / 2;
          cup.position.set(hx, 0.04, 0.02);
          head.add(cup);
        });
      }

      // 6. BATH SOAP FOAM BUBBLES ON PET
      if (foam || st.isBathing) {
        const foamMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          roughness: 0.1,
          transparent: true,
          opacity: 0.85,
        });
        [
          [-0.18, 0.36, 0.08, 0.1],
          [0.14, 0.32, 0.15, 0.11],
          [0, 0.56, 0.26, 0.09],
          [-0.22, 0.55, 0.2, 0.08],
        ].forEach(([fx, fy, fz, fr]) => {
          const bub = new THREE.Mesh(new THREE.SphereGeometry(fr, 12, 12), foamMat);
          bub.position.set(fx, fy, fz);
          head.add(bub);
        });
      }
    };

    rebuildFnRef.current = rebuildPet;
    rebuildPet();

    // --- 7. SHOWER & KISS HEART VFX PARTICLES ---
    const showerCount = 42;
    const showerGeo = new THREE.BufferGeometry();
    const showerPos = new Float32Array(showerCount * 3);
    for (let i = 0; i < showerCount; i++) {
      showerPos[i * 3] = (Math.random() - 0.5) * 1.4;
      showerPos[i * 3 + 1] = 0.6 + Math.random() * 1.6;
      showerPos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    showerGeo.setAttribute('position', new THREE.BufferAttribute(showerPos, 3));
    const showerMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.075,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const showerPoints = new THREE.Points(showerGeo, showerMat);
    scene.add(showerPoints);

    // Floating hearts/sparkles for Kiss & Dance VFX
    const kissHeartsGroup = new THREE.Group();
    scene.add(kissHeartsGroup);
    const kissHeartGeo = createHeartGeometry(0.11);
    const kissHeartMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xec4899,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    });
    const floatingHearts: { mesh: THREE.Mesh; offset: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(kissHeartGeo, kissHeartMat);
      m.visible = false;
      kissHeartsGroup.add(m);
      floatingHearts.push({ mesh: m, offset: i * 1.05 });
    }

    // --- 8. POINTER RAYCASTING ---
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

      const hits = raycaster.intersectObjects(petRoot.children, true);
      if (hits.length > 0 && propsRef.current.onPetTouch) {
        const y = hits[0].point.y;
        if (y > 0.72) propsRef.current.onPetTouch('head');
        else if (y > 0.3) propsRef.current.onPetTouch('belly');
        else propsRef.current.onPetTouch('paw');
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // --- 9. ANIMATION LOOP (Idle, Sleeping, Eating, Playing, Dances!) ---
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const { kitten: st, danceMove: move, isShowering: shower } = propsRef.current;

      // Reset default root transform cleanly before applying active kinematics
      petRoot.position.set(0, 0, 0);
      petRoot.rotation.set(0, 0, 0);
      petRoot.scale.set(1, 1, 1);

      if (st.isSleeping) {
        // Gentle breathing curl
        const b = Math.sin(t * 1.6) * 0.025;
        petRoot.scale.set(1.04, 0.92 + b, 1.04);
        if (headGroup) {
          headGroup.rotation.x = 0.16;
          headGroup.rotation.z = Math.sin(t * 1.2) * 0.04;
        }
      } else if (!prefersReducedMotion) {
        if (move === 'dance') {
          const beat = t * 7.2;
          petRoot.position.y = Math.abs(Math.sin(beat)) * 0.14;
          petRoot.rotation.z = Math.sin(beat * 0.5) * 0.14;
          petRoot.rotation.y = Math.sin(beat * 0.5) * 0.28;
          if (headGroup) headGroup.rotation.z = -Math.sin(beat * 0.5) * 0.18;
          if (leftArmObj) leftArmObj.rotation.z = 0.5 + Math.sin(beat) * 0.55;
          if (rightArmObj) rightArmObj.rotation.z = -0.5 + Math.sin(beat) * 0.55;
        } else if (move === 'spin') {
          petRoot.rotation.y = t * 7.5;
          petRoot.position.y = Math.abs(Math.sin(t * 4.5)) * 0.24;
        } else if (move === 'jump') {
          const hop = Math.abs(Math.sin(t * 6.5));
          petRoot.position.y = hop * 0.42;
          const stretch = 1 + hop * 0.12;
          const squash = 1 / Math.sqrt(stretch);
          petRoot.scale.set(squash, stretch, squash);
          if (leftEarObj) leftEarObj.rotation.z = -0.25 + hop * 0.35;
          if (rightEarObj) rightEarObj.rotation.z = 0.25 - hop * 0.35;
        } else if (move === 'wave') {
          if (headGroup) {
            headGroup.rotation.z = 0.18;
            headGroup.rotation.y = Math.sin(t * 3) * 0.12;
          }
          if (rightArmObj) {
            rightArmObj.rotation.z = -2.1 + Math.sin(t * 10) * 0.45;
          }
        } else if (move === 'kiss') {
          petRoot.position.z = Math.sin(t * 5) * 0.12 + 0.08;
          if (headGroup) headGroup.rotation.x = Math.sin(t * 5) * 0.14;
        } else if (st.isPlayMode) {
          petRoot.position.y = Math.abs(Math.sin(t * 5.8)) * 0.18;
          petRoot.rotation.z = Math.sin(t * 3) * 0.07;
        } else {
          // Calm natural breathing & cheerful sway
          const breath = Math.sin(t * 2.4) * 0.02;
          petRoot.scale.set(1, 1 + breath, 1);
          if (headGroup) {
            headGroup.rotation.z = Math.sin(t * 1.4) * 0.045;
            headGroup.rotation.y = Math.sin(t * 0.9) * 0.08;
          }
          if (tailObj) {
            tailObj.rotation.z = Math.sin(t * 6.5) * 0.28;
          }
          if (leftEarObj && rightEarObj) {
            const earSway = Math.sin(t * 2.6) * 0.05;
            leftEarObj.rotation.x = 0.08 + earSway;
            rightEarObj.rotation.x = 0.08 - earSway;
          }
        }

        // Serpentine wave for snake
        for (let i = 0; i < snakeSegs.length; i++) {
          snakeSegs[i].position.x = Math.sin(t * 3.4 - i * 0.5) * (0.2 + i * 0.018);
        }

        // Angel wings & cape flutter
        if (angelWingsObj) {
          const w = Math.sin(t * 4.2) * 0.25;
          if (angelWingsObj.children[0]) angelWingsObj.children[0].rotation.y = 0.25 + w;
          if (angelWingsObj.children[1]) angelWingsObj.children[1].rotation.y = -0.25 - w;
        }
        if (capeObj) {
          capeObj.rotation.x = 0.22 + Math.sin(t * 3.5) * 0.07;
        }
      }

      // Kiss / Dance floating hearts
      const showHearts = move === 'kiss' || move === 'dance';
      for (let i = 0; i < floatingHearts.length; i++) {
        const fh = floatingHearts[i];
        fh.mesh.visible = showHearts;
        if (showHearts) {
          const phase = (t * 1.4 + fh.offset) % 2.0;
          fh.mesh.position.set(
            Math.sin(t * 3 + i) * 0.45,
            0.85 + phase * 0.65,
            0.4 + Math.cos(t * 2 + i) * 0.2
          );
          fh.mesh.rotation.y = t * 2 + i;
          const s = Math.sin((phase / 2.0) * Math.PI);
          fh.mesh.scale.setScalar(0.6 + s * 0.6);
        }
      }

      // Shower droplet stream
      if (shower) {
        showerMat.opacity = Math.min(0.95, showerMat.opacity + 0.14);
        const sArr = showerGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < showerCount; i++) {
          sArr[i * 3 + 1] -= 0.11;
          if (sArr[i * 3 + 1] < 0.05) {
            sArr[i * 3 + 1] = 1.9 + Math.random() * 0.5;
          }
        }
        showerGeo.attributes.position.needsUpdate = true;
      } else if (showerMat.opacity > 0) {
        showerMat.opacity = Math.max(0, showerMat.opacity - 0.08);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- 10. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 310;
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

      disposeObject3D(stageGroup);
      disposeObject3D(petRoot);
      disposeObject3D(kissHeartsGroup);
      showerGeo.dispose();
      showerMat.dispose();
      shadowTex.dispose();
      envTarget.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild pet mesh/wardrobe cleanly when appearance state changes (without destroying WebGLRenderer!)
  useEffect(() => {
    rebuildFnRef.current?.();
  }, [
    petType,
    kitten.isSleeping,
    kitten.isBathing,
    kitten.equippedHat,
    kitten.equippedOutfit,
    kitten.equippedCollar,
    kitten.equippedGlasses,
    kitten.equippedAccessory,
    hasSoapFoam,
  ]);

  return (
    <div className="relative w-full h-64 sm:h-76 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0d051d]/90 border border-white/15 text-[10px] text-pink-100 pointer-events-none flex items-center gap-1.5 shadow-md whitespace-nowrap">
        <span>Arraste 360° • Toque no pet para carinho 🐾</span>
      </div>
    </div>
  );
};
