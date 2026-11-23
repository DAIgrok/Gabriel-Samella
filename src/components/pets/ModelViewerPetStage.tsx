import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Heart, Palette, Sparkles, Utensils } from 'lucide-react';
import type { ModelViewerElement, ModelViewerMaterial } from '../../types/model-viewer';
import { formatCooldownMs } from '../../context/AppContext';
import { resolveMediaUrl } from '../../services/localMediaStore';
import type { PetDanceMove } from '../3d/PetCanvas3D';
import {
  findBestAnimationClip,
  formatPaintPartLabel,
  getDesiredGlbClipCandidates,
  type PetAnimationCue,
} from '../../utils/petGlbAnimations';

export const DEFAULT_SKETCHFAB_CAT_URL = 'https://skfb.ly/pQwNL';

export const CAT_GLB_ANIMATIONS = [
  'Idle',
  'Happy',
  'Jump',
  'Eat',
  'Feeding',
  'Sit',
  'SitIdle',
  'SitStandUp',
  'Stand',
  'Walk',
  'Walk_2',
  'Run',
  'Dig',
] as const;

const ANIMATION_STATUS_LABELS: Record<string, string> = {
  Idle: 'Relaxando',
  Happy: 'Super feliz',
  Jump: 'Pulando alegre',
  Eat: 'Comendo gostoso',
  Feeding: 'Lanchando',
  Sit: 'Sentando',
  SitIdle: 'Sentadinho',
  SitStandUp: 'Levantando',
  Stand: 'Observando',
  Walk: 'Passeando',
  Walk_2: 'Explorando',
  Run: 'Correndo feliz',
  Dig: 'Cavando fofo',
};

export interface ModelViewerPetStageProps {
  src?: string;
  alt: string;
  colorHex?: string;
  hasWholeColor?: boolean;
  partColors?: Record<string, string>;
  paintMode?: boolean;
  embedded?: boolean;
  isSpectator?: boolean;
  isDead?: boolean;
  isSleeping?: boolean;
  isEating?: boolean;
  isDrinking?: boolean;
  isBathing?: boolean;
  isPlayMode?: boolean;
  hasSoapFoam?: boolean;
  isShowering?: boolean;
  danceMove?: PetDanceMove;
  actionCue?: PetAnimationCue;
  cdPet?: number;
  cdFeed?: number;
  onColorChange?: (hex: string) => void;
  onPaintPart?: (partKey: string, label?: string) => void;
  onPetTap?: () => void;
  onFeedPet?: () => void;
  fallback: React.ReactNode;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  driftX: number;
  scale: number;
}

interface IndexedGlbMesh {
  mesh: THREE.Mesh;
  partKey: string;
  label: string;
  origHexes: string[];
}

const TALKING_TOM_SWATCHES = [
  { hex: '#ffffff', label: 'Branco Neve' },
  { hex: '#f9a8d4', label: 'Rosa Algodão' },
  { hex: '#c084fc', label: 'Lilás Mágico' },
  { hex: '#fbbf24', label: 'Caramelo Dourado' },
  { hex: '#7dd3fc', label: 'Azul Celeste' },
  { hex: '#334155', label: 'Meia-Noite' },
];

function hexToRgbaFactor(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [1, 1, 1, 1];
  }
  return [r, g, b, 1];
}

function isLikelyHtmlPageUrl(url: string): boolean {
  const lower = url.trim().toLowerCase();
  return (
    lower === 'https://supabase.co' ||
    lower === 'https://supabase.co/' ||
    lower.includes('skfb.ly/') ||
    lower.includes('sketchfab.com/')
  );
}

function sanitizePartToken(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28);
}

function extractInternalThreeNodes(mv: ModelViewerElement): {
  meshes: IndexedGlbMesh[];
  camera: THREE.Camera | null;
} {
  const meshes: IndexedGlbMesh[] = [];
  let foundCamera: THREE.Camera | null = null;
  const visited = new Set<unknown>();

  const scanObject = (root: unknown, depth = 0) => {
    if (!root || typeof root !== 'object' || depth > 4 || visited.has(root)) return;
    visited.add(root);

    const anyRoot = root as Record<string, unknown>;
    if ((anyRoot as { isCamera?: boolean }).isCamera && !foundCamera) {
      foundCamera = root as THREE.Camera;
    }
    if (anyRoot.camera && typeof anyRoot.camera === 'object') {
      const cam = anyRoot.camera as { isCamera?: boolean };
      if (cam.isCamera && !foundCamera) {
        foundCamera = anyRoot.camera as THREE.Camera;
      }
    }

    if (typeof (anyRoot as { traverse?: unknown }).traverse === 'function') {
      (root as THREE.Object3D).traverse((obj) => {
        const cam = obj as unknown as { isCamera?: boolean };
        if (cam.isCamera && !foundCamera) {
          foundCamera = obj as unknown as THREE.Camera;
        }
        const mesh = obj as THREE.Mesh;
        if (mesh?.isMesh && mesh.material) {
          if (!mesh.userData.__mvPartKey) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const clonedMats = mats.map((m) => (m && typeof m.clone === 'function' ? m.clone() : m));
            mesh.material = Array.isArray(mesh.material) ? clonedMats : clonedMats[0];
            const origHexes = clonedMats.map((m) => {
              const std = m as THREE.MeshStandardMaterial;
              return std?.color && typeof std.color.getHexString === 'function'
                ? `#${std.color.getHexString()}`
                : '#ffffff';
            });
            const rawName = mesh.name || mats[0]?.name || `parte_${meshes.length}`;
            const token = sanitizePartToken(rawName) || `parte_${meshes.length}`;
            const partKey = `glb_${token}_${meshes.length}`;
            mesh.userData.__mvPartKey = partKey;
            mesh.userData.__mvOrigHexes = origHexes;
          }
          const partKey = String(mesh.userData.__mvPartKey);
          const origHexes = (mesh.userData.__mvOrigHexes as string[]) || ['#ffffff'];
          meshes.push({
            mesh,
            partKey,
            label: formatPaintPartLabel(partKey),
            origHexes,
          });
        }
      });
    }

    for (const sym of Object.getOwnPropertySymbols(root)) {
      try {
        const val = (root as Record<symbol, unknown>)[sym];
        if (val && typeof val === 'object') {
          scanObject(val, depth + 1);
        }
      } catch {
        // Ignore restricted symbols
      }
    }
  };

  try {
    scanObject(mv, 0);
  } catch {
    // Graceful fallback
  }

  return { meshes, camera: foundCamera };
}

function setSingleMaterialColor(material: ModelViewerMaterial, hex: string) {
  const factor = hexToRgbaFactor(hex);
  const [r, g, b] = factor;
  try {
    if (material.pbrMetallicRoughness?.setBaseColorFactor) {
      material.pbrMetallicRoughness.setBaseColorFactor(factor);
    }
    const matAny = material as unknown as Record<string, any>;
    const specGloss =
      matAny.pbrSpecularGlossiness ||
      matAny.extensions?.KHR_materials_pbrSpecularGlossiness;
    if (specGloss) {
      if (typeof specGloss.setDiffuseFactor === 'function') {
        specGloss.setDiffuseFactor(factor);
      } else if (Array.isArray(specGloss.diffuseFactor)) {
        specGloss.diffuseFactor[0] = r;
        specGloss.diffuseFactor[1] = g;
        specGloss.diffuseFactor[2] = b;
        specGloss.diffuseFactor[3] = 1;
      }
    }
    for (const sym of Object.getOwnPropertySymbols(material)) {
      const symVal = (material as unknown as Record<symbol, any>)[sym];
      if (symVal && typeof symVal === 'object') {
        if (symVal instanceof Set) {
          symVal.forEach((threeMat: any) => {
            if (threeMat?.color && typeof threeMat.color.setRGB === 'function') {
              threeMat.color.setRGB(r, g, b);
              threeMat.needsUpdate = true;
            }
          });
        } else if (symVal.color && typeof symVal.color.setRGB === 'function') {
          symVal.color.setRGB(r, g, b);
          symVal.needsUpdate = true;
        }
      }
    }
  } catch {
    // Ignore read-only slots
  }
}

export const ModelViewerPetStage: React.FC<ModelViewerPetStageProps> = ({
  src = DEFAULT_SKETCHFAB_CAT_URL,
  alt,
  colorHex,
  hasWholeColor = false,
  partColors = {},
  paintMode = false,
  embedded = false,
  isSpectator = false,
  isDead = false,
  isSleeping = false,
  isEating = false,
  isDrinking = false,
  isBathing = false,
  isPlayMode = false,
  hasSoapFoam = false,
  isShowering = false,
  danceMove = 'idle' as PetDanceMove,
  actionCue,
  cdPet = 0,
  cdFeed = 0,
  onColorChange,
  onPaintPart,
  onPetTap,
  onFeedPet,
  fallback,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const mvRef = useRef<ModelViewerElement | null>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const pauseBrainUntilRef = useRef<number>(0);

  const indexedMeshesRef = useRef<IndexedGlbMesh[]>([]);
  const internalCamRef = useRef<THREE.Camera | null>(null);
  const origMaterialFactorsRef = useRef<[number, number, number, number][]>([]);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animations, setAnimations] = useState<string[]>([]);
  const [activeAnim, setActiveAnim] = useState<string>('Idle');
  const [localColor, setLocalColor] = useState<string>(colorHex || '#f7b2c9');
  const [isJumping, setIsJumping] = useState(false);
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  const activeAnimRef = useRef(activeAnim);
  activeAnimRef.current = activeAnim;
  const animationsRef = useRef(animations);
  animationsRef.current = animations;

  useEffect(() => {
    if (colorHex) setLocalColor(colorHex);
  }, [colorHex]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Resolve idb:// local uploads & validate binary .glb assets cleanly
  useEffect(() => {
    let active = true;
    setHasError(false);
    setIsLoaded(false);
    setAnimations([]);
    indexedMeshesRef.current = [];
    internalCamRef.current = null;
    origMaterialFactorsRef.current = [];

    const checkAndResolveAsset = async () => {
      const trimmed = (src || '').trim();
      if (!trimmed || isLikelyHtmlPageUrl(trimmed)) {
        if (active) setHasError(true);
        return;
      }

      if (trimmed.startsWith('idb://')) {
        try {
          const objUrl = await resolveMediaUrl(trimmed);
          if (!active) return;
          if (!objUrl || objUrl.startsWith('idb://')) {
            setHasError(true);
            return;
          }
          setResolvedSrc(objUrl);
          return;
        } catch {
          if (active) setHasError(true);
          return;
        }
      }

      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        if (active) setResolvedSrc(trimmed);
        return;
      }

      try {
        const res = await fetch(trimmed, { method: 'GET', headers: { Range: 'bytes=0-15' } });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          if (active) setHasError(true);
          return;
        }
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const isGlb =
          bytes.length >= 4 &&
          bytes[0] === 0x67 &&
          bytes[1] === 0x6c &&
          bytes[2] === 0x54 &&
          bytes[3] === 0x46;
        const isGltfJson = bytes.length >= 1 && bytes[0] === 0x7b;
        if (!isGlb && !isGltfJson) {
          if (active) setHasError(true);
          return;
        }
        if (active) setResolvedSrc(trimmed);
      } catch {
        if (active) setHasError(true);
      }
    };

    checkAndResolveAsset();
    return () => {
      active = false;
    };
  }, [src]);

  // Apply per-part or whole-pet color WITHOUT washing out original GLB on first load
  const applyPerPartAndWholeColors = () => {
    const mv = mvRef.current;
    if (!mv) return;
    const partKeys = Object.keys(partColors || {});
    const shouldTintWhole = Boolean(hasWholeColor && colorHex);

    if (indexedMeshesRef.current.length > 0) {
      indexedMeshesRef.current.forEach(({ mesh, partKey, origHexes }) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const partHex = partColors?.[partKey];
        const wholeHex = shouldTintWhole ? colorHex : undefined;

        mats.forEach((m, idx) => {
          const std = m as THREE.MeshStandardMaterial;
          if (!std?.color) return;
          const targetHex = partHex || wholeHex || origHexes[idx] || '#ffffff';
          std.color.set(targetHex);
          std.needsUpdate = true;
        });
      });
      return;
    }

    // Fallback using ModelViewerMaterial API if internal Three.js scene isn't exposed
    const materials = mv.model?.materials || [];
    if (materials.length === 0) return;

    if (partKeys.length === 0 && !shouldTintWhole) {
      // Restore recorded original baseColorFactors if previously tinted
      materials.forEach((mat, idx) => {
        const orig = origMaterialFactorsRef.current[idx];
        if (orig && mat.pbrMetallicRoughness?.setBaseColorFactor) {
          mat.pbrMetallicRoughness.setBaseColorFactor(orig);
        }
      });
      return;
    }

    materials.forEach((mat, idx) => {
      const matKey = `glb_mat_${sanitizePartToken(mat.name || `m${idx}`)}_${idx}`;
      const partHex = partColors?.[matKey];
      const targetHex = partHex || (shouldTintWhole ? colorHex : undefined);
      if (targetHex) {
        setSingleMaterialColor(mat, targetHex);
      } else if (origMaterialFactorsRef.current[idx] && mat.pbrMetallicRoughness?.setBaseColorFactor) {
        mat.pbrMetallicRoughness.setBaseColorFactor(origMaterialFactorsRef.current[idx]);
      }
    });
  };

  // Command animation smoothly on <model-viewer>
  const playClipOnViewer = (candidates: string[] | string, pauseBrainMs = 0) => {
    const mv = mvRef.current;
    const avail = Array.isArray(mv?.availableAnimations) ? mv.availableAnimations : animationsRef.current;
    if (!mv || !avail || avail.length === 0) return;
    const list = Array.isArray(candidates) ? candidates : [candidates];
    const matched = findBestAnimationClip(avail, list) || avail[0];
    if (pauseBrainMs > 0) {
      pauseBrainUntilRef.current = Date.now() + pauseBrainMs;
    }
    setActiveAnim(matched);
    mv.animationCrossfadeDuration = 220;
    mv.animationName = matched;
    mv.play?.();
  };

  // Listen to <model-viewer> load & error events
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv || hasError || !resolvedSrc) return;

    const handleLoad = () => {
      setIsLoaded(true);
      const list = Array.isArray(mv.availableAnimations) ? mv.availableAnimations : [];
      setAnimations(list);

      // Snapshot original baseColorFactors before any tinting
      const mats = mv.model?.materials || [];
      origMaterialFactorsRef.current = mats.map((m) => {
        const fac = m.pbrMetallicRoughness?.baseColorFactor;
        return fac ? ([fac[0], fac[1], fac[2], fac[3]] as [number, number, number, number]) : [1, 1, 1, 1];
      });

      const { meshes, camera } = extractInternalThreeNodes(mv);
      indexedMeshesRef.current = meshes;
      internalCamRef.current = camera;

      if (list.length > 0) {
        const desired = getDesiredGlbClipCandidates({
          isSleeping,
          isEating,
          isDrinking,
          isBathing,
          isPlayMode,
          danceMove,
          cueType: actionCue?.type,
        });
        const matched = findBestAnimationClip(list, desired.candidates) || list[0];
        setActiveAnim(matched);
        mv.animationCrossfadeDuration = 220;
        mv.animationName = matched;
        mv.play?.();
      }
      applyPerPartAndWholeColors();
    };

    const handleError = () => {
      setHasError(true);
    };

    mv.addEventListener('load', handleLoad);
    mv.addEventListener('error', handleError);

    if (mv.model) {
      handleLoad();
    }

    return () => {
      mv.removeEventListener('load', handleLoad);
      mv.removeEventListener('error', handleError);
    };
  }, [hasError, resolvedSrc]);

  // Apply colors whenever partColors, hasWholeColor, or colorHex updates
  const partColorsKey = JSON.stringify(partColors || {});
  useEffect(() => {
    if (!isLoaded || hasError) return;
    applyPerPartAndWholeColors();
  }, [partColorsKey, hasWholeColor, colorHex, isLoaded, hasError]);

  // Sync embedded .glb animations whenever Talking Tom state, danceMove, or actionCue updates
  useEffect(() => {
    if (!isLoaded || hasError || isDead) return;
    const avail = animationsRef.current;
    if (!avail || avail.length === 0) return;

    const desired = getDesiredGlbClipCandidates({
      isSleeping,
      isEating,
      isDrinking,
      isBathing,
      isPlayMode,
      danceMove,
      cueType: actionCue?.type,
    });

    const isTransientAction =
      isEating ||
      isDrinking ||
      isBathing ||
      danceMove !== 'idle' ||
      (actionCue && actionCue.type !== 'idle' && actionCue.type !== 'sleep');

    playClipOnViewer(desired.candidates, isTransientAction ? 2800 : 0);
  }, [
    isLoaded,
    hasError,
    isDead,
    isSleeping,
    isEating,
    isDrinking,
    isBathing,
    isPlayMode,
    danceMove,
    actionCue?.tick,
  ]);

  // Autonomous Pet Brain (only when awake & idle, never interrupting Talking Tom actions)
  useEffect(() => {
    if (!isLoaded || hasError || isDead || isSleeping || prefersReducedMotion) return;
    const avail = animationsRef.current;
    if (!avail || avail.length === 0) return;

    const tickBrain = () => {
      if (Date.now() < pauseBrainUntilRef.current) return;
      if (danceMove !== 'idle' || isEating || isDrinking || isBathing || isPlayMode) return;

      const cur = activeAnimRef.current;
      if (/^(happy|eat|feeding)$/i.test(cur)) {
        playClipOnViewer(['Idle', 'Stand']);
        return;
      }

      if (/^sitidle$/i.test(cur)) {
        const standUp = findBestAnimationClip(avail, ['SitStandUp']);
        if (standUp) {
          playClipOnViewer([standUp]);
          transitionTimerRef.current = window.setTimeout(() => {
            if (Date.now() >= pauseBrainUntilRef.current) {
              playClipOnViewer(['Stand', 'Idle']);
            }
          }, 1100);
          return;
        }
      }

      const roll = Math.random();
      if (roll < 0.24) {
        const sit = findBestAnimationClip(avail, ['Sit']);
        if (sit) {
          playClipOnViewer([sit]);
          transitionTimerRef.current = window.setTimeout(() => {
            if (Date.now() >= pauseBrainUntilRef.current) {
              playClipOnViewer(['SitIdle', 'Sit']);
            }
          }, 1050);
          return;
        }
      }

      const autonomousPool = ['Idle', 'Walk', 'Walk_2', 'Stand', 'Dig'];
      const availableAutonomous = autonomousPool
        .map((c) => findBestAnimationClip(avail, [c]))
        .filter((v): v is string => Boolean(v));
      const pool = availableAutonomous.length > 0 ? availableAutonomous : avail;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) playClipOnViewer([pick]);
    };

    const interval = window.setInterval(tickBrain, 4500);
    return () => {
      window.clearInterval(interval);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, [
    isLoaded,
    hasError,
    isDead,
    isSleeping,
    isEating,
    isDrinking,
    isBathing,
    isPlayMode,
    danceMove,
    prefersReducedMotion,
    animations.length,
  ]);

  const spawnHeartsBurst = (count = 6) => {
    const batch: HeartParticle[] = Array.from({ length: count }, (_, idx) => ({
      id: Date.now() + Math.random() + idx,
      x: 30 + Math.random() * 40,
      y: 35 + Math.random() * 25,
      driftX: (Math.random() - 0.5) * 64,
      scale: 0.75 + Math.random() * 0.55,
    }));
    setParticles((prev) => [...prev.slice(-14), ...batch]);
    window.setTimeout(() => {
      const ids = new Set(batch.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 950);
  };

  const triggerJoyJump = () => {
    if (prefersReducedMotion) return;
    if (jumpTimerRef.current) {
      window.clearTimeout(jumpTimerRef.current);
    }
    setIsJumping(true);
    jumpTimerRef.current = window.setTimeout(() => {
      setIsJumping(false);
    }, 620);
  };

  const applyColorHex = (hex: string) => {
    setLocalColor(hex);
    if (!isSpectator) {
      onColorChange?.(hex);
    }
  };

  const handlePaintHitAtPoint = (clientX: number, clientY: number): boolean => {
    const mv = mvRef.current;
    if (!mv || !onPaintPart) return false;

    const cam = internalCamRef.current;
    const indexed = indexedMeshesRef.current;
    if (cam && indexed.length > 0) {
      const rect = mv.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const ndc = new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, cam);
        const hits = raycaster.intersectObjects(
          indexed.map((item) => item.mesh),
          true
        );
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.__mvPartKey) {
            obj = obj.parent;
          }
          const partKey = obj?.userData?.__mvPartKey ? String(obj.userData.__mvPartKey) : indexed[0].partKey;
          onPaintPart(partKey, formatPaintPartLabel(partKey));
          return true;
        }
      }
    }

    const hitMat = mv.materialFromPoint?.(clientX, clientY);
    if (hitMat && mv.model?.materials) {
      const idx = mv.model.materials.indexOf(hitMat);
      const safeIdx = idx >= 0 ? idx : 0;
      const matKey = `glb_mat_${sanitizePartToken(hitMat.name || `m${safeIdx}`)}_${safeIdx}`;
      onPaintPart(matKey, formatPaintPartLabel(matKey));
      return true;
    }

    if (indexed.length > 0) {
      onPaintPart(indexed[0].partKey, indexed[0].label);
      return true;
    }
    return false;
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDead) return;
    const dist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    if (dist > 9) return;

    if (paintMode && onPaintPart && !hasError && isLoaded) {
      e.stopPropagation();
      if (handlePaintHitAtPoint(e.clientX, e.clientY)) {
        return;
      }
    }

    handlePetAction();
  };

  const handlePetAction = () => {
    if (isDead) return;
    spawnHeartsBurst(6);
    triggerJoyJump();
    playClipOnViewer(['Happy', 'Jump', 'Stand'], 2400);
    onPetTap?.();
  };

  const handleFeedAction = () => {
    if (isDead) return;
    spawnHeartsBurst(5);
    triggerJoyJump();
    playClipOnViewer(['Eat', 'Feeding', 'Happy'], 2600);
    onFeedPet?.();
  };

  const statusText = ANIMATION_STATUS_LABELS[activeAnim] || activeAnim || 'Ativo';
  const showColorGlow = hasWholeColor && colorHex && colorHex !== '#ffffff';

  return (
    <div className="w-full space-y-3 text-center">
      <div
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
        className={`relative w-full rounded-[26px] overflow-hidden select-none ${
          embedded
            ? 'bg-transparent'
            : 'border border-pink-300/35 shadow-[0_14px_38px_rgba(236,72,153,0.24)]'
        } ${
          isDead ? 'grayscale opacity-75 cursor-default' : paintMode ? 'cursor-crosshair' : 'cursor-pointer'
        }`}
        style={
          embedded
            ? undefined
            : {
                background:
                  'linear-gradient(155deg, rgba(244,114,182,0.34) 0%, rgba(168,85,247,0.28) 46%, rgba(19,6,36,0.94) 100%)',
              }
        }
      >
        {!embedded && (
          <div
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-3xl opacity-50"
            style={{ background: showColorGlow ? colorHex : '#f472b6' }}
          />
        )}

        {!hasError && isLoaded && !isDead && (
          <div className="pointer-events-none absolute top-2 left-2 z-20 px-2.5 py-1 rounded-full bg-black/55 border border-pink-300/30 text-[10px] font-bold text-pink-100 flex items-center gap-1.5 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-pink-300" />
            <span>{isSleeping ? 'Dormindo' : statusText}</span>
          </div>
        )}

        {/* Soap foam / Shower overlay for Bath room parity */}
        {(hasSoapFoam || isShowering) && !hasError && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            {hasSoapFoam && (
              <div className="w-40 h-28 rounded-full bg-cyan-200/20 blur-md border border-cyan-100/30 animate-pulse" />
            )}
            {isShowering && (
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-transparent to-cyan-300/15 animate-pulse" />
            )}
          </div>
        )}

        {/* Floating Heart Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.95, y: 0, x: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -78, x: p.driftX, scale: p.scale }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.88, ease: 'easeOut' }}
              className="pointer-events-none absolute z-30"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <Heart className="w-5 h-5 fill-pink-400 text-pink-200 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Joyful Jump Wrapper */}
        <motion.div
          animate={
            isJumping && !prefersReducedMotion
              ? { y: [0, -24, 0, -10, 0], scale: [1, 1.05, 0.97, 1.02, 1] }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 0.58, ease: 'easeOut' }}
          className="relative z-10 w-full"
        >
          {!hasError && resolvedSrc ? (
            <model-viewer
              id="gatinhoPet"
              ref={mvRef}
              src={resolvedSrc}
              alt={alt}
              autoplay
              camera-controls
              shadow-intensity="1.2"
              exposure="1.05"
              interaction-prompt="auto"
              touch-action="pan-y"
              style={{
                width: '100%',
                height: embedded ? '270px' : '320px',
                background: 'transparent',
                display: 'block',
              }}
            />
          ) : (
            <div className="py-2 px-2 flex flex-col items-center justify-center min-h-[240px]">
              {fallback}
            </div>
          )}
        </motion.div>
      </div>

      {/* Standalone controls only shown when NOT embedded inside KittenView */}
      {!embedded && !isSpectator && !isDead && (
        <div className="rounded-2xl bg-black/40 border border-pink-400/25 px-3.5 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="seletorCor"
              className="text-xs font-bold text-pink-100 flex items-center gap-2 cursor-pointer"
            >
              <span
                className="w-5 h-5 rounded-full border border-white/40 shadow-inner shrink-0"
                style={{ backgroundColor: localColor }}
              />
              <Palette className="w-4 h-4 text-pink-300 shrink-0" />
              <span>Cor do Mascote</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-purple-200/80">
                {localColor}
              </span>
              <input
                type="color"
                id="seletorCor"
                value={localColor}
                onChange={(e) => applyColorHex(e.target.value)}
                className="w-11 h-8 rounded-xl border border-pink-400/50 bg-transparent cursor-pointer"
                aria-label="Escolha a cor do mascote"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {TALKING_TOM_SWATCHES.map((swatch) => {
              const selected = localColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => applyColorHex(swatch.hex)}
                  title={swatch.label}
                  aria-label={`Aplicar cor ${swatch.label}`}
                  className={`w-7 h-7 rounded-full border-2 transition cursor-pointer active:scale-90 ${
                    selected
                      ? 'border-pink-400 scale-110 shadow-[0_0_12px_rgba(244,114,182,0.85)]'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>
        </div>
      )}

      {!embedded && !isDead && (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handlePetAction}
            className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/85 to-rose-500/85 hover:brightness-110 border border-pink-300/45 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(236,72,153,0.3)] cursor-pointer transition active:scale-95"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{cdPet > 0 ? `Carinho (${formatCooldownMs(cdPet)})` : 'Fazer Carinho'}</span>
          </button>

          <button
            type="button"
            onClick={handleFeedAction}
            disabled={isSpectator || cdFeed > 0}
            className="min-h-[46px] px-3 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/85 to-fuchsia-600/85 hover:brightness-110 border border-purple-300/40 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(168,85,247,0.3)] cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Utensils className="w-4 h-4" />
            <span>{cdFeed > 0 ? formatCooldownMs(cdFeed) : 'Dar Comida'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
