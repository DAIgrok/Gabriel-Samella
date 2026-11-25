import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PetType, KittenState } from '../../types';
import {
  addCozyThreePointLights,
  detectSoftwareWebGL,
  disposeObject3D,
  loadCachedGlbInstance,
  setupCozyStudioRenderer,
} from '../../utils/threeCozyHelpers';
import {
  findBestAnimationClip,
  formatPaintPartLabel,
  getDesiredGlbClipCandidates,
  type PetActionCueType,
  type PetAnimationCue,
} from '../../utils/petGlbAnimations';
import { applySmartCatCoatToMeshes } from '../../utils/petCoatPainter';

export type PetDanceMove = 'idle' | 'dance' | 'spin' | 'jump' | 'wave' | 'kiss';

interface PetCanvas3DProps {
  petType: PetType;
  kitten: KittenState;
  danceMove?: PetDanceMove;
  hasSoapFoam?: boolean;
  isShowering?: boolean;
  customModelUrl?: string;
  paintMode?: boolean;
  actionCue?: PetAnimationCue;
  requestedClip?: { name: string; tick: number } | null;
  onAnimationsDetected?: (clips: string[]) => void;
  onPetTouch?: (part: 'head' | 'belly' | 'paw') => void;
  onPaintPart?: (partKey: string, label?: string) => void;
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
    main: 0xe69f58,
    secondary: 0xfff8ef,
    earOuter: 0xc26e2a,
    earInner: 0xfbcfe8,
    nose: 0xf472b6,
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

// Helpers imported from ../../utils/threeCozyHelpers

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
  customModelUrl,
  paintMode = false,
  actionCue,
  requestedClip,
  onAnimationsDetected,
  onPetTouch,
  onPaintPart,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    petType,
    kitten,
    danceMove,
    hasSoapFoam,
    isShowering,
    customModelUrl,
    paintMode,
    actionCue,
    requestedClip,
    onAnimationsDetected,
    onPetTouch,
    onPaintPart,
  });
  propsRef.current = {
    petType,
    kitten,
    danceMove,
    hasSoapFoam,
    isShowering,
    customModelUrl,
    paintMode,
    actionCue,
    requestedClip,
    onAnimationsDetected,
    onPetTouch,
    onPaintPart,
  };

  const rebuildFnRef = useRef<(() => void) | null>(null);
  const applyGlbColorsFnRef = useRef<(() => void) | null>(null);
  const syncGlbAnimFnRef = useRef<((forceCue?: PetActionCueType) => void) | null>(null);
  const playExplicitGlbClipRef = useRef<((clipName: string) => void) | null>(null);
  const isGlbActiveRef = useRef<boolean>(false);
  const loadedGlbKeyRef = useRef<string>('');

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
    camera.position.set(0, 1.5, 3.85);

    // --- 2. COZY RENDERER & ROOM ENVIRONMENT ---
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
    scene.environmentIntensity = 0.78;
    container.appendChild(renderer.domElement);

    // --- 3. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0.74, 0);

    // --- 4. COZY 3-POINT PASTEL STUDIO LIGHTING ---
    addCozyThreePointLights(scene, {
      skyColor: 0xdbeafe, // Sky-blue / lavender pastel fill
      groundColor: 0xffedd5, // Warm cozy ground bounce
      hemiIntensity: 1.15,
      keyColor: 0xfff8ed,
      keyIntensity: 2.05,
      keyPosition: [3.6, 5.8, 4.4],
      rimColor: 0xf472b6, // Vibrant pink rim highlight
      rimIntensity: 1.45,
      rimPosition: [-3.5, 3.2, -4.0],
      fillColor: 0xe9d5ff,
      fillIntensity: 0.72,
      shadowMapSize: isSoftwareGl ? 512 : 1024,
      shadowExtent: 2.5,
      isSoftwareGl,
    });

    // --- 5. COZY PASTEL PK XD DIORAMA STAGE ---
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.62, 0.22, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x3b1b63,
      roughness: 0.62,
      metalness: 0.06,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.11;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    const rimGeo = new THREE.TorusGeometry(1.5, 0.028, 14, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf9a8d4,
      emissive: 0xec4899,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.2,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    stageGroup.add(rimMesh);

    // Procedural cozy pastel woven rug texture
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 256;
    rugCanvas.height = 256;
    const rCtx = rugCanvas.getContext('2d');
    if (rCtx) {
      const grad = rCtx.createRadialGradient(128, 128, 16, 128, 128, 124);
      grad.addColorStop(0, '#fdf2f8');
      grad.addColorStop(0.45, '#fbcfe8');
      grad.addColorStop(0.75, '#ddd6fe');
      grad.addColorStop(0.92, '#c084fc');
      grad.addColorStop(1, '#f472b6');
      rCtx.fillStyle = grad;
      rCtx.fillRect(0, 0, 256, 256);

      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      rCtx.lineWidth = 3;
      rCtx.setLineDash([7, 5]);
      rCtx.beginPath();
      rCtx.arc(128, 128, 92, 0, Math.PI * 2);
      rCtx.stroke();

      rCtx.strokeStyle = 'rgba(236, 72, 153, 0.42)';
      rCtx.lineWidth = 2.5;
      rCtx.setLineDash([4, 5]);
      rCtx.beginPath();
      rCtx.arc(128, 128, 56, 0, Math.PI * 2);
      rCtx.stroke();
    }
    const rugTex = new THREE.CanvasTexture(rugCanvas);
    rugTex.colorSpace = THREE.SRGBColorSpace;
    rugTex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const rugMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.2, 0.024, 48),
      new THREE.MeshStandardMaterial({
        map: rugTex,
        roughness: 0.74,
        metalness: 0.02,
      })
    );
    rugMesh.position.y = 0.012;
    rugMesh.receiveShadow = true;
    stageGroup.add(rugMesh);

    // Cozy pastel wainscot arch backdrop
    const wallArchGeo = new THREE.CylinderGeometry(
      1.44,
      1.44,
      0.86,
      40,
      1,
      true,
      Math.PI * 0.68,
      Math.PI * 0.64
    );
    const wallArchMat = new THREE.MeshStandardMaterial({
      color: 0x4c2473,
      roughness: 0.68,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    const wallArch = new THREE.Mesh(wallArchGeo, wallArchMat);
    wallArch.position.y = 0.43;
    wallArch.receiveShadow = true;
    stageGroup.add(wallArch);

    const wallTrimGeo = new THREE.TorusGeometry(1.44, 0.032, 10, 40, Math.PI * 0.64);
    const wallTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.4,
      metalness: 0.35,
    });
    const wallTrim = new THREE.Mesh(wallTrimGeo, wallTrimMat);
    wallTrim.rotation.x = Math.PI / 2;
    wallTrim.rotation.z = Math.PI * 0.68 + Math.PI * 0.5;
    wallTrim.position.y = 0.86;
    stageGroup.add(wallTrim);

    // Cozy pastel floor cushion & plush yarn ball props
    const cushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.1, 24),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.72 })
    );
    cushion.position.set(-0.9, 0.065, 0.24);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    const cushionButton = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.55 })
    );
    cushionButton.position.y = 0.055;
    cushion.add(cushionButton);
    stageGroup.add(cushion);

    const yarnBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.68 })
    );
    yarnBall.position.set(0.9, 0.145, 0.32);
    yarnBall.castShadow = true;
    stageGroup.add(yarnBall);

    // Soft contact shadow decal under pet
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, 'rgba(30, 10, 55, 0.42)');
      grad.addColorStop(0.6, 'rgba(30, 10, 55, 0.16)');
      grad.addColorStop(1, 'rgba(30, 10, 55, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.38, 1.38),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.026;
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
    let glbMixer: THREE.AnimationMixer | null = null;
    let glbActions: Map<string, THREE.AnimationAction> = new Map();
    let activeGlbAction: THREE.AnimationAction | null = null;
    let activeGlbClipName = '';
    let glbMeshes: { mesh: THREE.Mesh; partKey: string; origHexes: string[] }[] = [];
    let pauseGlbBrainUntil = 0;
    let nextGlbBrainTick = 0;
    const blinkLids: THREE.Mesh[] = [];
    const snakeSegs: THREE.Object3D[] = [];
    let buildToken = 0;

    const tagPart = <T extends THREE.Object3D>(obj: T, partKey: string): T => {
      obj.traverse((child) => {
        child.userData.paintPart = partKey;
      });
      return obj;
    };

    const sanitizeToken = (raw: string) =>
      raw
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 28);

    const applyGlbPartColors = () => {
      if (!isGlbActiveRef.current || glbMeshes.length === 0) return;
      const { petType: type, kitten: st } = propsRef.current;
      const partMap = st.petPartColors?.[type] || {};
      const wholeHex = st.petColors?.[type];
      applySmartCatCoatToMeshes(glbMeshes, {
        wholeColor: wholeHex,
        partColors: partMap,
        isCatSpecies: type === 'cat',
        rootRef: bodyGroup,
      });
    };
    applyGlbColorsFnRef.current = applyGlbPartColors;

    const playGlbClipByCandidates = (candidates: string[], pauseMs = 0) => {
      if (!glbMixer || glbActions.size === 0) return;
      const avail = Array.from(glbActions.keys());
      const matched = findBestAnimationClip(avail, candidates) || avail[0];
      if (!matched) return;
      if (pauseMs > 0) {
        pauseGlbBrainUntil = performance.now() + pauseMs;
      }
      if (activeGlbClipName === matched && activeGlbAction?.isRunning()) return;
      const nextAction = glbActions.get(matched);
      if (!nextAction) return;
      nextAction.reset();
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);
      nextAction.play();
      if (activeGlbAction && activeGlbAction !== nextAction) {
        activeGlbAction.crossFadeTo(nextAction, 0.24, true);
      }
      activeGlbAction = nextAction;
      activeGlbClipName = matched;
    };
    playExplicitGlbClipRef.current = (clipName: string) => {
      playGlbClipByCandidates([clipName], 3200);
    };

    const syncGlbAnimation = (overrideCue?: PetActionCueType) => {
      if (!isGlbActiveRef.current || !glbMixer) return;
      const { kitten: st, danceMove: move, actionCue: cue } = propsRef.current;
      const activeCue = overrideCue || cue?.type;
      const desired = getDesiredGlbClipCandidates({
        isSleeping: st.isSleeping,
        isBathing: st.isBathing,
        isPlayMode: st.isPlayMode,
        danceMove: move,
        cueType: activeCue,
      });
      const isTransient =
        move !== 'idle' ||
        st.isBathing ||
        (activeCue && activeCue !== 'idle' && activeCue !== 'sleep');
      playGlbClipByCandidates(desired.candidates, isTransient ? 2800 : 0);
    };
    syncGlbAnimFnRef.current = syncGlbAnimation;

    const isDirectGlbUrl = (u?: string): boolean => {
      if (!u) return false;
      const clean = u.trim().toLowerCase();
      if (!clean) return false;
      if (clean === 'https://supabase.co' || clean === 'https://supabase.co/') return false;
      if (clean.includes('skfb.ly/') || clean.includes('sketchfab.com/')) return false;
      return true;
    };

    const rebuildPet = () => {
      const myToken = ++buildToken;
      const { petType: type, kitten: st, hasSoapFoam: foam, customModelUrl: glbUrl } = propsRef.current;
      const spec = SPECIES_SPECS[type] || SPECIES_SPECS.cat;

      if (glbMixer) {
        glbMixer.stopAllAction();
        glbMixer = null;
      }
      glbActions = new Map();
      activeGlbAction = null;
      activeGlbClipName = '';
      glbMeshes = [];
      isGlbActiveRef.current = false;
      loadedGlbKeyRef.current = '';

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
      blinkLids.length = 0;
      snakeSegs.length = 0;

      // Progressive external .glb loader (falls back seamlessly to enhanced procedural pet)
      if (isDirectGlbUrl(glbUrl)) {
        const cleanGlb = glbUrl!.trim();
        const placeholderGroup = new THREE.Group();
        petRoot.add(placeholderGroup);
        loadCachedGlbInstance(cleanGlb, 1.42, true)
          .then(({ group, animations }) => {
            if (myToken !== buildToken) {
              disposeObject3D(group);
              return;
            }
            while (petRoot.children.length > 0) {
              const ch = petRoot.children[0];
              petRoot.remove(ch);
              disposeObject3D(ch);
            }
            petRoot.add(group);
            bodyGroup = group;
            isGlbActiveRef.current = true;
            loadedGlbKeyRef.current = `${type}::${cleanGlb}`;

            const collected: { mesh: THREE.Mesh; partKey: string; origHexes: string[] }[] = [];
            group.traverse((obj) => {
              const mesh = obj as THREE.Mesh;
              if (!mesh.isMesh || !mesh.material) return;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              const cloned = mats.map((m) => {
                const c = m.clone();
                const std = c as THREE.MeshStandardMaterial;
                if (std && typeof std.metalness === 'number' && std.metalness > 0.85 && !std.metalnessMap) {
                  std.metalness = 0.15;
                }
                return c;
              });
              mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
              const origHexes = cloned.map((m) => {
                const std = m as THREE.MeshStandardMaterial;
                return std?.color && typeof std.color.getHexString === 'function'
                  ? `#${std.color.getHexString()}`
                  : '#ffffff';
              });
              const rawName = mesh.name || mats[0]?.name || `parte_${collected.length}`;
              const token = sanitizeToken(rawName) || `parte_${collected.length}`;
              const partKey = `glb_${token}_${collected.length}`;
              mesh.userData.paintPart = partKey;
              collected.push({ mesh, partKey, origHexes });
            });
            glbMeshes = collected;
            applyGlbPartColors();

            const detectedNames: string[] = [];
            if (animations.length > 0) {
              glbMixer = new THREE.AnimationMixer(group);
              animations.forEach((clip) => {
                if (!glbMixer) return;
                glbActions.set(clip.name, glbMixer.clipAction(clip));
                detectedNames.push(clip.name);
              });
              syncGlbAnimation();
            }
            propsRef.current.onAnimationsDetected?.(detectedNames);
          })
          .catch(() => {
            // Silent fallback to procedural model if external GLB fails to load
          });
      }

      // Cozy Stylized Vinyl / Soft Plush PBR Materials (per-part colorable!)
      const customFurHex = st.petColors?.[type];
      const partColors = st.petPartColors?.[type] || {};
      const baseFurColor = customFurHex ? new THREE.Color(customFurHex) : new THREE.Color(spec.main);
      const earShadeColor = customFurHex
        ? baseFurColor.clone().multiplyScalar(0.76)
        : new THREE.Color(spec.earOuter);

      const mainMat = new THREE.MeshStandardMaterial({
        color: partColors.body ? new THREE.Color(partColors.body) : baseFurColor,
        roughness: 0.62,
        metalness: 0.02,
      });
      const headMat = new THREE.MeshStandardMaterial({
        color: (partColors.head || partColors.body) ? new THREE.Color(partColors.head || partColors.body) : baseFurColor,
        roughness: 0.62,
        metalness: 0.02,
      });
      const pawsMat = new THREE.MeshStandardMaterial({
        color: partColors.paws ? new THREE.Color(partColors.paws) : baseFurColor,
        roughness: 0.62,
        metalness: 0.02,
      });
      const tailMat = new THREE.MeshStandardMaterial({
        color: partColors.tail ? new THREE.Color(partColors.tail) : baseFurColor,
        roughness: 0.62,
        metalness: 0.02,
      });
      const secMat = new THREE.MeshStandardMaterial({
        color: partColors.belly ? new THREE.Color(partColors.belly) : new THREE.Color(spec.secondary),
        roughness: 0.66,
        metalness: 0.02,
      });
      const earOuterMat = new THREE.MeshStandardMaterial({
        color: partColors.ears ? new THREE.Color(partColors.ears) : earShadeColor,
        roughness: 0.64,
        metalness: 0.02,
      });
      const earInnerMat = new THREE.MeshStandardMaterial({
        color: partColors.earInner ? new THREE.Color(partColors.earInner) : new THREE.Color(spec.earInner),
        roughness: 0.6,
      });
      const noseMat = new THREE.MeshStandardMaterial({
        color: partColors.nose ? new THREE.Color(partColors.nose) : new THREE.Color(spec.nose),
        roughness: 0.18,
        metalness: 0.08,
      });
      const irisColorHex =
        partColors.eyes ||
        (type === 'cat' ? '#10b981' : type === 'dog' ? '#78350f' : '#4f46e5');
      const eyeIrisMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(irisColorHex),
        roughness: 0.14,
        metalness: 0.08,
      });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x0b0714,
        roughness: 0.08,
        metalness: 0.12,
      });
      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blushMat = new THREE.MeshStandardMaterial({
        color: partColors.cheeks ? new THREE.Color(partColors.cheeks) : new THREE.Color(0xfb7185),
        roughness: 0.65,
        transparent: true,
        opacity: partColors.cheeks ? 0.85 : 0.62,
      });
      const pawPadMat = new THREE.MeshStandardMaterial({
        color: partColors.paws ? new THREE.Color(partColors.paws) : new THREE.Color(0xf9a8d4),
        roughness: 0.58,
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
          const seg = tagPart(
            new THREE.Mesh(
              new THREE.SphereGeometry(r, 18, 16),
              i % 2 === 0 ? mainMat : secMat
            ),
            i % 2 === 0 ? 'body' : 'belly'
          );
          seg.castShadow = true;
          seg.position.set(Math.sin(t * 2.2) * 0.25, r + 0.02, 0.1 - t * 0.7);
          torsoGroup.add(seg);
          snakeSegs.push(seg);
        }
      } else if (spec.bodyLayout === 'aquatic') {
        const body = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 20), mainMat), 'body');
        body.scale.set(0.95, 0.85, 1.32);
        body.position.set(0, 0.56, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        torsoGroup.add(body);

        const belly = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 18), secMat), 'belly');
        belly.scale.set(0.88, 0.65, 1.25);
        belly.position.set(0, 0.45, 0.04);
        torsoGroup.add(belly);

        // Pectoral Flippers
        const flipGeo = new THREE.SphereGeometry(0.16, 14, 12);
        flipGeo.scale(1.4, 0.28, 0.72);
        const lFlip = tagPart(new THREE.Mesh(flipGeo, earOuterMat), 'paws');
        lFlip.position.set(-0.42, 0.48, 0.12);
        lFlip.rotation.set(0.1, -0.35, -0.3);
        torsoGroup.add(lFlip);
        leftArmObj = lFlip;

        const rFlip = tagPart(new THREE.Mesh(flipGeo, earOuterMat), 'paws');
        rFlip.position.set(0.42, 0.48, 0.12);
        rFlip.rotation.set(0.1, 0.35, 0.3);
        torsoGroup.add(rFlip);
        rightArmObj = rFlip;
      } else {
        // Upright adorable seated clay plush
        const torsoMesh = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.36, 26, 22), mainMat), 'body');
        torsoMesh.scale.set(0.95, 1.12, 0.9);
        torsoMesh.position.set(0, 0.44, 0);
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        torsoGroup.add(torsoMesh);

        // Soft chest patch
        const chest = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), secMat), 'belly');
        chest.scale.set(0.92, 1.15, 0.55);
        chest.position.set(0, 0.44, 0.22);
        torsoGroup.add(chest);

        // Bee stripes
        if (spec.hasBeeStripes) {
          const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 });
          [-0.08, 0.08].forEach((sy) => {
            const stRing = tagPart(new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.042, 10, 28), stripeMat), 'body');
            stRing.rotation.x = Math.PI / 2;
            stRing.position.set(0, 0.44 + sy, 0);
            torsoGroup.add(stRing);
          });
        }

        // Turtle shell on back
        if (spec.hasShell) {
          const shellMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.45 });
          const shell = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.38, 22, 16), shellMat), 'body');
          shell.scale.set(1.05, 1.15, 0.65);
          shell.position.set(0, 0.48, -0.2);
          shell.castShadow = true;
          torsoGroup.add(shell);
        }

        // Front arms & seated chubby legs/paws
        const armGeo = new THREE.CapsuleGeometry(0.085, 0.2, 8, 14);
        const lArm = tagPart(new THREE.Mesh(armGeo, pawsMat), 'paws');
        lArm.position.set(-0.3, 0.46, 0.14);
        lArm.rotation.set(-0.35, 0, 0.35);
        lArm.castShadow = true;
        torsoGroup.add(lArm);
        leftArmObj = lArm;

        const rArm = tagPart(new THREE.Mesh(armGeo, pawsMat), 'paws');
        rArm.position.set(0.3, 0.46, 0.14);
        rArm.rotation.set(-0.35, 0, -0.35);
        rArm.castShadow = true;
        torsoGroup.add(rArm);
        rightArmObj = rArm;

        const pawGeo = new THREE.SphereGeometry(0.115, 18, 16);
        pawGeo.scale(0.95, 0.72, 1.32);
        const padGeo = new THREE.SphereGeometry(0.055, 12, 10);
        padGeo.scale(1.1, 0.35, 0.9);
        [-0.2, 0.2].forEach((px) => {
          const paw = tagPart(new THREE.Mesh(pawGeo, secMat), 'paws');
          paw.position.set(px, 0.085, 0.22);
          paw.castShadow = true;
          const pad = tagPart(new THREE.Mesh(padGeo, pawPadMat), 'paws');
          pad.position.set(0, -0.02, 0.11);
          paw.add(pad);
          torsoGroup.add(paw);
        });

        // Bee translucent wings
        if (spec.hasBeeWings) {
          const wMat = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.72,
            roughness: 0.15,
          });
          const wGeo = new THREE.SphereGeometry(0.22, 16, 14);
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

      // --- BUILD HEAD (Chibi Stylized Vinyl Sculpt) ---
      const head = new THREE.Group();
      head.position.set(0, spec.bodyLayout === 'aquatic' ? 0.66 : spec.bodyLayout === 'serpent' ? 0.56 : 0.95, spec.bodyLayout === 'aquatic' ? 0.35 : 0.06);
      petRoot.add(head);
      headGroup = head;

      const headBall = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.445, 32, 26), headMat), 'head');
      headBall.scale.set(1.07, 0.96, 1.02);
      headBall.castShadow = true;
      headBall.receiveShadow = true;
      head.add(headBall);

      // Soft blaze stripe & cute brow dots (dog/fox)
      if (spec.hasBlaze) {
        const blaze = tagPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.25, 8, 14), secMat), 'head');
        blaze.position.set(0, 0.16, 0.39);
        blaze.rotation.x = -0.38;
        blaze.scale.set(1.0, 1.0, 0.35);
        head.add(blaze);

        [-0.145, 0.145].forEach((bx) => {
          const brow = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), secMat), 'head');
          brow.scale.set(1.15, 0.65, 0.45);
          brow.position.set(bx, 0.175, 0.375);
          head.add(brow);
        });
      }

      // Lion mane / Hedgehog spines
      if (spec.hasMane) {
        const maneMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const puff = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 14), maneMat), 'head');
          puff.position.set(Math.cos(ang) * 0.42, Math.sin(ang) * 0.4, -0.06);
          puff.castShadow = true;
          head.add(puff);
        }
      }
      if (spec.hasSpines) {
        const spineMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.68 });
        for (let i = 0; i < 9; i++) {
          const ang = -1.1 + (i / 8) * 2.2;
          const sp = tagPart(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 12), spineMat), 'head');
          sp.position.set(Math.sin(ang) * 0.38, 0.18 + Math.cos(ang) * 0.2, -0.22);
          sp.rotation.z = -ang;
          sp.rotation.x = -0.5;
          head.add(sp);
        }
      }

      // Panda eye patches
      if (spec.hasPandaMask) {
        const patchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        [-0.16, 0.16].forEach((px) => {
          const patch = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), patchMat), 'head');
          patch.scale.set(1.1, 1.22, 0.35);
          patch.position.set(px, 0.045, 0.39);
          patch.rotation.y = px > 0 ? 0.25 : -0.25;
          head.add(patch);
        });
      }

      // --- EYES (Glossy catchlight eyes + animated natural blink eyelids or sleeping lids) ---
      if (st.isSleeping) {
        const lidMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.55 });
        [-0.16, 0.16].forEach((ex) => {
          const lid = tagPart(new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.015, 8, 18, Math.PI), lidMat), 'head');
          lid.position.set(ex, 0.04, 0.415);
          lid.rotation.z = Math.PI;
          head.add(lid);
        });
      } else {
        const eyeGeo = new THREE.SphereGeometry(0.082, 22, 18);
        const pupilGeo = new THREE.SphereGeometry(0.048, 16, 14);
        const rimRingGeo = new THREE.SphereGeometry(0.094, 20, 18);
        const hlBigGeo = new THREE.SphereGeometry(0.026, 12, 12);
        const hlSmallGeo = new THREE.SphereGeometry(0.013, 10, 10);
        const lidGeo = new THREE.SphereGeometry(0.086, 16, 12);

        [-0.16, 0.16].forEach((ex) => {
          const eye = tagPart(new THREE.Mesh(eyeGeo, eyeIrisMat), 'eyes');
          eye.position.set(ex, 0.045, 0.39);
          eye.scale.set(1.0, 1.1, 0.68);

          const pupil = tagPart(new THREE.Mesh(pupilGeo, eyeMat), 'eyes');
          pupil.position.set(0, 0, 0.044);
          pupil.scale.set(0.92, 1.05, 0.68);
          eye.add(pupil);

          const outerRim = tagPart(new THREE.Mesh(rimRingGeo, secMat), 'head');
          outerRim.position.set(0, 0, -0.012);
          outerRim.scale.set(1.0, 1.06, 0.5);
          eye.add(outerRim);

          const hl1 = new THREE.Mesh(hlBigGeo, whiteMat);
          hl1.position.set(0.024, 0.028, 0.072);
          const hl2 = new THREE.Mesh(hlSmallGeo, whiteMat);
          hl2.position.set(-0.022, -0.02, 0.072);
          eye.add(hl1, hl2);

          // Upper eyelid mesh for natural blinking
          const eyelid = tagPart(new THREE.Mesh(lidGeo, headMat), 'head');
          eyelid.position.set(0, 0.03, 0.024);
          eyelid.scale.set(1.12, 0.06, 0.9);
          eye.add(eyelid);
          blinkLids.push(eyelid);

          head.add(eye);
        });
      }

      // Rosy blush cheeks
      [-0.25, 0.25].forEach((cx) => {
        const blush = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), blushMat), 'cheeks');
        blush.scale.set(1.25, 0.72, 0.25);
        blush.position.set(cx, -0.06, 0.35);
        blush.rotation.y = cx > 0 ? 0.5 : -0.5;
        head.add(blush);
      });

      // --- SOFT CLAY MUZZLE / BEAK / SNOUT ---
      if (spec.snoutStyle === 'beak') {
        const beak = tagPart(new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.14, 12), noseMat), 'nose');
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.05, 0.44);
        head.add(beak);
      } else if (spec.snoutStyle === 'pig') {
        const snoutDisc = tagPart(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.09, 20), noseMat), 'nose');
        snoutDisc.rotation.x = Math.PI / 2;
        snoutDisc.position.set(0, -0.06, 0.41);
        head.add(snoutDisc);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x831843 });
        [-0.045, 0.045].forEach((nx) => {
          const hole = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), holeMat), 'nose');
          hole.position.set(nx, 0.045, 0);
          snoutDisc.add(hole);
        });
      } else if (spec.snoutStyle === 'koala') {
        const koalaNose = tagPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.06, 8, 12), noseMat), 'nose');
        koalaNose.position.set(0, -0.03, 0.42);
        koalaNose.scale.set(1, 1.15, 0.7);
        head.add(koalaNose);
      } else {
        const puffScale = spec.snoutStyle === 'long' ? 1.15 : 1.0;
        [-0.062, 0.062].forEach((mx) => {
          const puff = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), secMat), 'head');
          puff.scale.set(1.1, 0.9, puffScale);
          puff.position.set(mx, -0.1, 0.36);
          head.add(puff);
        });
        const chin = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), secMat), 'head');
        chin.scale.set(1.2, 0.65, 0.9);
        chin.position.set(0, -0.15, 0.34);
        head.add(chin);

        const nose = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.056, 16, 14), noseMat), 'nose');
        nose.scale.set(1.2, 0.85, 0.85);
        nose.position.set(0, -0.035, 0.44);
        head.add(nose);

        if (type === 'cat') {
          const stripeMat = new THREE.MeshStandardMaterial({ color: 0x9a4a12, roughness: 0.72 });
          [-0.08, 0, 0.08].forEach((sx, idx) => {
            const stripe = tagPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.095, 6, 8), stripeMat), 'head');
            stripe.position.set(sx, 0.28, 0.34);
            stripe.rotation.z = idx === 0 ? 0.18 : idx === 2 ? -0.18 : 0;
            stripe.rotation.x = -0.35;
            head.add(stripe);
          });
          const whiskMat = new THREE.MeshStandardMaterial({ color: 0xfff8ef, roughness: 0.5 });
          [-1, 1].forEach((side) => {
            [-0.085, -0.115].forEach((wy, idx) => {
              const w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.24, 6), whiskMat);
              w.position.set(side * 0.26, wy, 0.36);
              w.rotation.z = Math.PI / 2 + side * (idx === 0 ? -0.12 : 0.08);
              head.add(w);
            });
          });
        }
      }

      // --- EARS ---
      if (spec.earStyle === 'floppy') {
        const earGroupGeo = new THREE.SphereGeometry(0.145, 22, 18);
        earGroupGeo.scale(0.68, 1.65, 0.42);
        const earInPadGeo = new THREE.SphereGeometry(0.095, 16, 12);
        earInPadGeo.scale(0.6, 1.4, 0.22);

        const buildFloppyEar = (side: -1 | 1) => {
          const earPivot = new THREE.Group();
          earPivot.position.set(side * 0.38, 0.16, 0.04);
          earPivot.rotation.set(0.12, side * 0.2, side * 0.24);
          const outer = tagPart(new THREE.Mesh(earGroupGeo, earOuterMat), 'ears');
          outer.position.set(side * 0.05, -0.18, 0.02);
          outer.castShadow = true;
          const inner = tagPart(new THREE.Mesh(earInPadGeo, earInnerMat), 'earInner');
          inner.position.set(side * 0.03, -0.18, 0.045);
          earPivot.add(outer, inner);
          return earPivot;
        };

        const lEar = buildFloppyEar(-1);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = buildFloppyEar(1);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'cat') {
        const earGeo = new THREE.ConeGeometry(0.145, 0.28, 16);
        const earInGeo = new THREE.ConeGeometry(0.085, 0.18, 12);
        const lEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        lEar.position.set(-0.26, 0.35, 0.02);
        lEar.rotation.set(0.1, 0, 0.36);
        const lIn = tagPart(new THREE.Mesh(earInGeo, earInnerMat), 'earInner');
        lIn.position.set(0, -0.02, 0.045);
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        rEar.position.set(0.26, 0.35, 0.02);
        rEar.rotation.set(0.1, 0, -0.36);
        const rIn = tagPart(new THREE.Mesh(earInGeo, earInnerMat), 'earInner');
        rIn.position.set(0, -0.02, 0.045);
        rEar.add(rIn);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'bunny') {
        const earGeo = new THREE.CapsuleGeometry(0.085, 0.38, 10, 14);
        earGeo.scale(0.9, 1.0, 0.42);
        const earInGeo = new THREE.CapsuleGeometry(0.048, 0.3, 8, 12);
        earInGeo.scale(0.9, 1.0, 0.35);

        const lEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        lEar.position.set(-0.18, 0.48, 0);
        lEar.rotation.set(-0.08, 0, 0.18);
        const lIn = tagPart(new THREE.Mesh(earInGeo, earInnerMat), 'earInner');
        lIn.position.z = 0.025;
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        rEar.position.set(0.18, 0.48, 0);
        rEar.rotation.set(-0.08, 0, -0.18);
        const rIn = tagPart(new THREE.Mesh(earInGeo, earInnerMat), 'earInner');
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

        const lEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        lEar.position.set(-xOff, yOff, 0);
        const lIn = tagPart(new THREE.Mesh(inGeo, earInnerMat), 'earInner');
        lIn.position.z = 0.02;
        lEar.add(lIn);
        head.add(lEar);
        leftEarObj = lEar;

        const rEar = tagPart(new THREE.Mesh(earGeo, earOuterMat), 'ears');
        rEar.position.set(xOff, yOff, 0);
        const rIn = tagPart(new THREE.Mesh(inGeo, earInnerMat), 'earInner');
        rIn.position.z = 0.02;
        rEar.add(rIn);
        head.add(rEar);
        rightEarObj = rEar;
      } else if (spec.earStyle === 'fin') {
        const fin = tagPart(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 12), earOuterMat), 'ears');
        fin.scale.set(0.32, 1.0, 1.1);
        fin.position.set(0, 0.42, -0.05);
        fin.rotation.x = -0.35;
        head.add(fin);
      } else if (spec.earStyle === 'antenna') {
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
        const tipGeo = new THREE.SphereGeometry(0.04, 10, 10);
        [-0.14, 0.14].forEach((ax) => {
          const ant = tagPart(new THREE.Mesh(stemGeo, earOuterMat), 'ears');
          ant.position.set(ax, 0.44, 0.06);
          ant.rotation.z = ax > 0 ? -0.25 : 0.25;
          const tip = tagPart(new THREE.Mesh(tipGeo, earInnerMat), 'earInner');
          tip.position.y = 0.12;
          ant.add(tip);
          head.add(ant);
        });
      } else if (spec.earStyle === 'tuft') {
        const tuft = tagPart(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 10), earInnerMat), 'ears');
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
        const tail = tagPart(new THREE.Mesh(new THREE.TubeGeometry(tCurve, 14, 0.055, 10, false), tailMat), 'tail');
        const tip = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), secMat), 'tail');
        tip.position.set(0.02, 0.68, -0.52);
        tail.add(tip);
        torsoGroup.add(tail);
        tailObj = tail;
      } else if (spec.tailStyle === 'fluffy') {
        const fTail = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), tailMat), 'tail');
        fTail.scale.set(0.85, 1.4, 0.85);
        fTail.position.set(0, 0.38, -0.42);
        fTail.rotation.x = 0.6;
        torsoGroup.add(fTail);
        tailObj = fTail;
      } else if (spec.tailStyle === 'pompom') {
        const pom = tagPart(new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), tailMat), 'tail');
        pom.position.set(0, 0.28, -0.38);
        torsoGroup.add(pom);
        tailObj = pom;
      } else if (spec.tailStyle === 'aquatic') {
        const cTail = tagPart(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 10), tailMat), 'tail');
        cTail.scale.set(0.25, 1.0, 1.1);
        cTail.position.set(0, 0.56, -0.62);
        cTail.rotation.x = -Math.PI / 2;
        torsoGroup.add(cTail);
        tailObj = cTail;
      }

      // ============================================================
      // CLOTHING, HATS, GLASSES, COLLARS, TIES & ACCESSORIES
      // ============================================================

      // 1. OUTFITS (Torso garments)
      if (outfitId && spec.bodyLayout !== 'serpent') {
        let outfitColor: string | number = 0x9333ea;
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
        const customOutfitHex = st.accessoryColors?.[outfitId];
        if (customOutfitHex) {
          outfitColor = customOutfitHex;
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

      // 2. COLLARS & TIES
      if (collarId) {
        const customCollarHex = st.accessoryColors?.[collarId];
        if (collarId === 'item-pet-heart-collar') {
          const redCollar = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.042, 12, 28),
            new THREE.MeshStandardMaterial({ color: customCollarHex || 0xef4444, roughness: 0.35 })
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
          const btMat = new THREE.MeshStandardMaterial({ color: customCollarHex || 0xa855f7, roughness: 0.35 });
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
          const tieMat = new THREE.MeshStandardMaterial({ color: customCollarHex || 0xbe123c, roughness: 0.35 });
          const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), tieMat);
          const blade = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 4), tieMat);
          blade.scale.set(1.0, 1.0, 0.28);
          blade.rotation.z = Math.PI;
          blade.position.y = -0.14;
          tieGroup.add(knot, blade);
          torsoGroup.add(tieGroup);
        } else if (collarId === 'item-pet-scarf') {
          const scMat = new THREE.MeshStandardMaterial({ color: customCollarHex || 0xf472b6, roughness: 0.65 });
          const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.065, 12, 28), scMat);
          wrap.rotation.x = Math.PI / 2;
          wrap.position.set(0, 0.64, 0.03);
          const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.18, 6, 10), scMat);
          tail.position.set(0.14, 0.48, 0.28);
          tail.rotation.z = 0.25;
          torsoGroup.add(wrap, tail);
        } else if (collarId === 'item-pet-pearls') {
          const pearlMat = new THREE.MeshStandardMaterial({ color: customCollarHex || 0xfffbeb, roughness: 0.18, metalness: 0.25 });
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
        const customHatHex = st.accessoryColors?.[hatId];
        if (hatId === 'item-cat-crown') {
          const crownMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0xfbbf24, metalness: 0.78, roughness: 0.2 });
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.15, 8), crownMat);
          crown.position.set(0, 0.44, 0.02);
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.042), new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 0.6 }));
          gem.position.set(0, 0.01, 0.16);
          crown.add(gem);
          head.add(crown);
        } else if (hatId === 'item-cat-ribbon') {
          const bowMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0xf472b6, roughness: 0.3 });
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
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshStandardMaterial({ color: customHatHex || flowerCols[i], roughness: 0.35 }));
            fl.position.set(Math.cos(a) * 0.32, 0.29, Math.sin(a) * 0.32);
            head.add(fl);
          }
        } else if (hatId === 'item-pet-cap') {
          const capMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0xa855f7, roughness: 0.45 });
          const brimMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.37, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), capMat);
          dome.position.y = 0.14;
          const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 16, 1, false, -Math.PI / 2, Math.PI), brimMat);
          visor.position.set(0, 0.22, 0.28);
          visor.rotation.x = 0.2;
          head.add(dome, visor);
        } else if (hatId === 'item-pet-beret') {
          const beretMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0xe11d48, roughness: 0.6 });
          const disc = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), beretMat);
          disc.scale.set(1.1, 0.38, 1.1);
          disc.position.set(0.06, 0.38, 0.02);
          disc.rotation.z = -0.22;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 6), beretMat);
          stem.position.y = 0.13;
          disc.add(stem);
          head.add(disc);
        } else if (hatId === 'item-pet-party-hat') {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 18), new THREE.MeshStandardMaterial({ color: customHatHex || 0xec4899, roughness: 0.35 }));
          cone.position.set(0, 0.54, 0.02);
          const pom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfde047 }));
          pom.position.y = 0.2;
          cone.add(pom);
          head.add(cone);
        } else if (hatId === 'item-pet-cowboy-hat') {
          const hatMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0x78350f, roughness: 0.65 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 24), hatMat);
          brim.position.y = 0.33;
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.22, 16), hatMat);
          crown.position.y = 0.44;
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.23, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
          band.position.y = 0.36;
          head.add(brim, crown, band);
        } else if (hatId === 'item-pet-beanie') {
          const knitMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0xf43f5e, roughness: 0.7 });
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), knitMat);
          dome.position.y = 0.16;
          const pom = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), secMat);
          pom.position.y = 0.54;
          head.add(dome, pom);
        } else if (hatId === 'item-pet-wizard-hat') {
          const wizMat = new THREE.MeshStandardMaterial({ color: customHatHex || 0x4c1d95, roughness: 0.45 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.03, 24), wizMat);
          brim.position.y = 0.32;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 20), wizMat);
          cone.position.y = 0.56;
          cone.rotation.z = -0.1;
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.7 }));
          star.position.set(0, 0.45, 0.22);
          head.add(brim, cone, star);
        } else if (hatId === 'item-pet-santa-hat') {
          const redVelvet = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.48 });
          const whiteFur = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
          const brim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.068, 12, 28), whiteFur);
          brim.rotation.x = Math.PI / 2;
          brim.position.y = 0.3;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.48, 22), redVelvet);
          cone.position.set(-0.04, 0.52, 0);
          cone.rotation.z = 0.24;
          const pom = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), whiteFur);
          pom.position.set(-0.15, 0.74, 0);
          head.add(brim, cone, pom);
        } else if (hatId === 'item-pet-witch-hat') {
          const witchMat = new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.45 });
          const beltMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.32 });
          const buckleMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.03, 28), witchMat);
          brim.position.y = 0.31;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.54, 22), witchMat);
          cone.position.y = 0.57;
          cone.rotation.z = -0.14;
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.055, 20), beltMat);
          band.position.y = 0.35;
          const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), buckleMat);
          buckle.position.set(0, 0.35, 0.22);
          head.add(brim, cone, band, buckle);
        } else if (hatId === 'item-pet-valentine-rose') {
          const petalMat = new THREE.MeshStandardMaterial({
            color: 0xe11d48,
            emissive: 0x9f1239,
            emissiveIntensity: 0.35,
            roughness: 0.3,
          });
          const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
          const roseGroup = new THREE.Group();
          roseGroup.position.set(0.28, 0.31, 0.16);
          roseGroup.rotation.z = -0.35;
          const bud = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 14), petalMat);
          const outerL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), petalMat);
          outerL.position.set(-0.05, 0.02, 0.02);
          const outerR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), petalMat);
          outerR.position.set(0.05, -0.01, 0.02);
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), leafMat);
          leaf.scale.set(1.4, 0.25, 0.7);
          leaf.position.set(0.06, -0.07, -0.02);
          roseGroup.add(bud, outerL, outerR, leaf);
          head.add(roseGroup);
        }
      }

      // 4. GLASSES
      if (glassesId && !st.isSleeping) {
        const gGroup = new THREE.Group();
        gGroup.position.set(0, 0.045, 0.415);
        const frameColor =
          st.accessoryColors?.[glassesId] ||
          (glassesId === 'item-pet-heart-glasses' ? 0xf472b6 : glassesId === 'item-pet-round-glasses' ? 0xfbbf24 : 0xf59e0b);
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
      const customAccHex = accId ? st.accessoryColors?.[accId] : undefined;
      if (accId === 'item-cat-angel-wings') {
        const wingMat = new THREE.MeshStandardMaterial({
          color: customAccHex || 0xffffff,
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
          color: customAccHex || 0xe11d48,
          roughness: 0.5,
          side: THREE.DoubleSide,
        });
        const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.44, 0.56, 16, 1, true, Math.PI * 0.65, Math.PI * 0.7), capeMat);
        cape.position.set(0, 0.38, -0.14);
        cape.rotation.x = 0.22;
        torsoGroup.add(cape);
        capeObj = cape;
      } else if (accId === 'item-pet-heart-backpack') {
        const packMat = new THREE.MeshStandardMaterial({ color: customAccHex || 0xf43f5e, roughness: 0.38 });
        const pack = new THREE.Mesh(createHeartGeometry(0.26), packMat);
        pack.position.set(0, 0.46, -0.38);
        torsoGroup.add(pack);
      } else if (accId === 'item-pet-headphones') {
        const bandMat = new THREE.MeshStandardMaterial({ color: customAccHex || 0xa855f7, roughness: 0.3, metalness: 0.3 });
        const cupMat = new THREE.MeshStandardMaterial({ color: customAccHex || 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.45, roughness: 0.2 });
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
      if (hits.length > 0) {
        if (propsRef.current.paintMode && propsRef.current.onPaintPart) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.paintPart) {
            obj = obj.parent;
          }
          const partKey = obj?.userData?.paintPart ? String(obj.userData.paintPart) : 'body';
          propsRef.current.onPaintPart(partKey, formatPaintPartLabel(partKey));
          return;
        }
        if (propsRef.current.onPetTouch) {
          if (isGlbActiveRef.current) {
            playGlbClipByCandidates(['Happy', 'Jump', 'Stand'], 2400);
          }
          const y = hits[0].point.y;
          if (y > 0.72) propsRef.current.onPetTouch('head');
          else if (y > 0.3) propsRef.current.onPetTouch('belly');
          else propsRef.current.onPetTouch('paw');
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // --- 9. ANIMATION LOOP (Idle, Blinking, Sleeping, Eating, Playing, GLB Mixer & Dances!) ---
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const { kitten: st, danceMove: move, isShowering: shower } = propsRef.current;

      if (glbMixer) {
        glbMixer.update(delta);
      }

      // Autonomous GLB animation cycle when awake & idle
      if (isGlbActiveRef.current && glbMixer && !st.isSleeping && !prefersReducedMotion) {
        const nowPerf = performance.now();
        if (
          nowPerf > pauseGlbBrainUntil &&
          nowPerf > nextGlbBrainTick &&
          move === 'idle' &&
          !st.isBathing &&
          !st.isPlayMode
        ) {
          nextGlbBrainTick = nowPerf + 4600;
          const avail = Array.from(glbActions.keys());
          if (avail.length > 0) {
            const roll = Math.random();
            if (/^sitidle$/i.test(activeGlbClipName)) {
              playGlbClipByCandidates(['SitStandUp', 'Stand', 'Idle']);
            } else if (roll < 0.25 && findBestAnimationClip(avail, ['Sit'])) {
              playGlbClipByCandidates(['Sit', 'SitIdle']);
            } else {
              const pool = ['Idle', 'Walk', 'Walk_2', 'Stand', 'Dig']
                .map((c) => findBestAnimationClip(avail, [c]))
                .filter((v): v is string => Boolean(v));
              const chosen = pool[Math.floor(Math.random() * pool.length)] || avail[0];
              playGlbClipByCandidates([chosen]);
            }
          }
        }
      }

      // Reset default root transform cleanly before applying active kinematics
      petRoot.position.set(0, 0, 0);
      petRoot.rotation.set(0, 0, 0);
      petRoot.scale.set(1, 1, 1);

      if (isGlbActiveRef.current) {
        // Keep rigged .glb proportions undistorted while supporting spin/jump/kiss emphasis
        if (!prefersReducedMotion) {
          if (move === 'spin') {
            petRoot.rotation.y = t * 6.5;
          } else if (move === 'kiss') {
            petRoot.position.z = Math.sin(t * 5) * 0.08 + 0.06;
          } else if (move === 'jump') {
            petRoot.position.y = Math.abs(Math.sin(t * 5.8)) * 0.16;
          }
        }
      } else if (st.isSleeping) {
        const b = Math.sin(t * 1.6) * 0.025;
        petRoot.scale.set(1.04, 0.92 + b, 1.04);
        if (headGroup) {
          headGroup.rotation.x = 0.16;
          headGroup.rotation.z = Math.sin(t * 1.2) * 0.04;
        }
      } else if (!prefersReducedMotion) {
        // Natural blink cycle every ~3.4 seconds
        const blinkCycle = t % 3.4;
        const blinkAmount =
          blinkCycle > 3.24 ? Math.sin(((blinkCycle - 3.24) / 0.16) * Math.PI) : 0;
        for (let i = 0; i < blinkLids.length; i++) {
          blinkLids[i].scale.y = 0.05 + blinkAmount * 1.1;
          blinkLids[i].position.y = 0.034 - blinkAmount * 0.034;
        }

        if (move === 'dance') {
          const beat = t * 7.2;
          petRoot.position.y = Math.abs(Math.sin(beat)) * 0.15;
          petRoot.rotation.z = Math.sin(beat * 0.5) * 0.14;
          petRoot.rotation.y = Math.sin(beat * 0.5) * 0.28;
          if (headGroup) headGroup.rotation.z = -Math.sin(beat * 0.5) * 0.18;
          if (leftArmObj) leftArmObj.rotation.z = 0.5 + Math.sin(beat) * 0.55;
          if (rightArmObj) rightArmObj.rotation.z = -0.5 + Math.sin(beat) * 0.55;
          if (tailObj) tailObj.rotation.z = Math.sin(beat * 1.6) * 0.42;
        } else if (move === 'spin') {
          petRoot.rotation.y = t * 7.5;
          petRoot.position.y = Math.abs(Math.sin(t * 4.5)) * 0.24;
        } else if (move === 'jump') {
          const hop = Math.abs(Math.sin(t * 6.5));
          petRoot.position.y = hop * 0.42;
          const stretch = 1 + hop * 0.12;
          const squash = 1 / Math.sqrt(stretch);
          petRoot.scale.set(squash, stretch, squash);
          if (leftEarObj) leftEarObj.rotation.z = -0.22 + hop * 0.32;
          if (rightEarObj) rightEarObj.rotation.z = 0.22 - hop * 0.32;
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
          if (tailObj) tailObj.rotation.z = Math.sin(t * 9) * 0.42;
        } else {
          // Smooth breathing, head curiosity tilt, ear bounce & joyful tail wag
          const breath = Math.sin(t * 2.3) * 0.022;
          petRoot.scale.set(1 - breath * 0.35, 1 + breath, 1 - breath * 0.35);
          if (headGroup) {
            headGroup.rotation.z = Math.sin(t * 1.3) * 0.055;
            headGroup.rotation.y = Math.sin(t * 0.85) * 0.095;
            headGroup.position.y =
              (specPositionY(propsRef.current.petType)) + Math.sin(t * 2.3) * 0.012;
          }
          if (tailObj) {
            tailObj.rotation.z = Math.sin(t * 6.8) * 0.32;
          }
          if (leftEarObj && rightEarObj) {
            const earBounce = Math.sin(t * 2.3 - 0.5) * 0.065;
            leftEarObj.rotation.x = 0.1 + earBounce;
            rightEarObj.rotation.x = 0.1 - earBounce * 0.75;
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
    const specPositionY = (tType: PetType) => {
      const sp = SPECIES_SPECS[tType] || SPECIES_SPECS.cat;
      return sp.bodyLayout === 'aquatic' ? 0.66 : sp.bodyLayout === 'serpent' ? 0.56 : 0.95;
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
      buildToken++;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      resizeObs?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      glbMixer?.stopAllAction();

      disposeObject3D(stageGroup);
      disposeObject3D(petRoot);
      disposeObject3D(kissHeartsGroup);
      showerGeo.dispose();
      showerMat.dispose();
      shadowTex.dispose();
      rugTex.dispose();
      disposeEnv();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild pet mesh/wardrobe cleanly when appearance state changes (without destroying WebGLRenderer!)
  const petColorsKey = JSON.stringify(kitten.petColors || {});
  const petPartColorsKey = JSON.stringify(kitten.petPartColors || {});
  const accColorsKey = JSON.stringify(kitten.accessoryColors || {});
  useEffect(() => {
    const cleanGlb = (customModelUrl || '').trim();
    const targetKey = `${petType}::${cleanGlb}`;
    if (isGlbActiveRef.current && loadedGlbKeyRef.current === targetKey) {
      applyGlbColorsFnRef.current?.();
      return;
    }
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
    petColorsKey,
    petPartColorsKey,
    accColorsKey,
    hasSoapFoam,
    customModelUrl,
  ]);

  // Sync GLB animation clip whenever Talking Tom state, danceMove or actionCue updates
  useEffect(() => {
    syncGlbAnimFnRef.current?.();
  }, [
    kitten.isSleeping,
    kitten.isBathing,
    kitten.isPlayMode,
    danceMove,
    actionCue?.tick,
  ]);

  // Play explicit clip chosen from Pet Menu (.glb animations bar)
  useEffect(() => {
    if (!requestedClip?.name || !isGlbActiveRef.current) return;
    playExplicitGlbClipRef.current?.(requestedClip.name);
  }, [requestedClip?.tick, requestedClip?.name]);

  return (
    <div
      className={`relative w-full h-64 sm:h-76 rounded-3xl overflow-hidden select-none touch-none flex items-center justify-center ${
        paintMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
