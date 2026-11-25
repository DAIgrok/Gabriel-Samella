import * as THREE from 'three';

export type PaintableCatPart = 'body' | 'paws' | 'ears' | 'eyes' | 'nose';

export interface PaintPartOption {
  key: PaintableCatPart;
  label: string;
}

export const PET_PAINT_PARTS: PaintPartOption[] = [
  { key: 'body', label: 'Corpo' },
  { key: 'paws', label: 'Pata' },
  { key: 'ears', label: 'Orelha' },
  { key: 'eyes', label: 'Olho' },
  { key: 'nose', label: 'Nariz' },
];

export type CoatPatternType = 'tabby' | 'tuxedo' | 'siamese' | 'calico' | 'solid';

export interface CatCoatPreset {
  id: string;
  label: string;
  subtitle: string;
  pattern: CoatPatternType;
  parts: {
    body: string;
    head: string;
    paws: string;
    ears: string;
    earInner: string;
    eyes: string;
    nose: string;
    belly: string;
    tail: string;
    cheeks: string;
  };
}

export const CAT_COAT_PRESETS: CatCoatPreset[] = [
  {
    id: 'caramelo',
    label: 'Caramelo Rajado',
    subtitle: 'Natural clássico',
    pattern: 'tabby',
    parts: {
      body: '#de8e43',
      head: '#de8e43',
      paws: '#fff5e9',
      ears: '#b85c1b',
      earInner: '#fbcfe8',
      eyes: '#10b981',
      nose: '#f472b6',
      belly: '#fff5e9',
      tail: '#c86e28',
      cheeks: '#fda4af',
    },
  },
  {
    id: 'frajola',
    label: 'Frajola P&B',
    subtitle: 'Preto & luvas brancas',
    pattern: 'tuxedo',
    parts: {
      body: '#22242d',
      head: '#22242d',
      paws: '#f8fafc',
      ears: '#16171d',
      earInner: '#f9a8d4',
      eyes: '#eab308',
      nose: '#f472b6',
      belly: '#f8fafc',
      tail: '#1c1d24',
      cheeks: '#fda4af',
    },
  },
  {
    id: 'siames',
    label: 'Siamês Real',
    subtitle: 'Creme com pontas café',
    pattern: 'siamese',
    parts: {
      body: '#f2e2ce',
      head: '#ead5bc',
      paws: '#4b3327',
      ears: '#3e291f',
      earInner: '#d8b4a0',
      eyes: '#38bdf8',
      nose: '#5e4033',
      belly: '#fbf2e6',
      tail: '#432d22',
      cheeks: '#fbcfe8',
    },
  },
  {
    id: 'cinza',
    label: 'Cinza Tigrado',
    subtitle: 'Prata rajado suave',
    pattern: 'tabby',
    parts: {
      body: '#8b95a5',
      head: '#8b95a5',
      paws: '#e2e8f0',
      ears: '#475569',
      earInner: '#fbcfe8',
      eyes: '#22c55e',
      nose: '#f472b6',
      belly: '#e2e8f0',
      tail: '#64748b',
      cheeks: '#fda4af',
    },
  },
  {
    id: 'tricolor',
    label: 'Tricolor Cálico',
    subtitle: 'Branco, caramelo e café',
    pattern: 'calico',
    parts: {
      body: '#fcf7f0',
      head: '#fcf7f0',
      paws: '#ffffff',
      ears: '#c96a22',
      earInner: '#fbcfe8',
      eyes: '#d97706',
      nose: '#fb7185',
      belly: '#ffffff',
      tail: '#2e292b',
      cheeks: '#fda4af',
    },
  },
  {
    id: 'pantera',
    label: 'Preto Pantera',
    subtitle: 'Ébano olhos dourados',
    pattern: 'solid',
    parts: {
      body: '#1c1c24',
      head: '#1c1c24',
      paws: '#262632',
      ears: '#14141b',
      earInner: '#4c3b4d',
      eyes: '#f59e0b',
      nose: '#3f3f4a',
      belly: '#23232e',
      tail: '#181820',
      cheeks: '#9f1239',
    },
  },
];

export const DEFAULT_CAT_COAT = CAT_COAT_PRESETS[0];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [222, 142, 67];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHexColors(hexA: string, hexB: string, ratioB = 0.5): string {
  const t = clamp01(ratioB);
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function hslToHex(hDeg: number, sPct: number, lPct: number): string {
  const h = (((hDeg % 360) + 360) % 360) / 360;
  const s = clamp01(sPct / 100);
  const l = clamp01(lPct / 100);

  if (s === 0) {
    const v = Math.round(l * 255);
    return rgbToHex(v, v, v);
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return rgbToHex(
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255
  );
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [rRaw, gRaw, bRaw] = hexToRgb(hex);
  const r = rRaw / 255;
  const g = gRaw / 255;
  const b = bRaw / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function classifyNamedGlbPart(rawName: string): PaintableCatPart | null {
  const lower = rawName.toLowerCase();
  if (/(\bpaw|\bfoot|\bfeet|\bpata|\bpatinha|\btoe|\bclaw|\bhand|\barm)/.test(lower)) {
    return 'paws';
  }
  if (/(\bear|\borelha)/.test(lower)) {
    return 'ears';
  }
  if (/(\beye|\biris|\bpupil|\bolho)/.test(lower)) {
    return 'eyes';
  }
  if (/(\bnose|\bnariz|\bsnout|\bfocinho)/.test(lower)) {
    return 'nose';
  }
  if (/(\bbody|\bhead|\btorso|\btail|\bcabeca|\bcorpo|\brabo)/.test(lower)) {
    return 'body';
  }
  return null;
}

function isNearWhiteHex(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return r >= 224 && g >= 224 && b >= 224;
}

interface AnatomicalProfile {
  minY: number;
  sizeY: number;
  headX: number;
  headZ: number;
  fwdX: number;
  fwdZ: number;
  rightX: number;
  rightZ: number;
  headRadiusXZ: number;
  maxHeadFwdProj: number;
  isQuadruped: boolean;
}

function computeGroupAnatomicalProfile(
  meshes: THREE.Mesh[],
  rootRef?: THREE.Object3D | null
): AnatomicalProfile {
  const box = new THREE.Box3();
  const invRoot = new THREE.Matrix4();
  if (rootRef) {
    rootRef.updateMatrixWorld(true);
    invRoot.copy(rootRef.matrixWorld).invert();
  }
  const relMat = new THREE.Matrix4();
  const v = new THREE.Vector3();

  // Pass 1: Bounds
  meshes.forEach((mesh) => {
    mesh.updateMatrixWorld(true);
    if (rootRef) relMat.multiplyMatrices(invRoot, mesh.matrixWorld);
    else relMat.copy(mesh.matrixWorld);

    const pos = mesh.geometry?.getAttribute('position');
    if (!pos) return;
    const step = Math.max(1, Math.floor(pos.count / 1200));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(relMat);
      box.expandByPoint(v);
    }
  });

  if (box.isEmpty()) {
    return {
      minY: 0,
      sizeY: 1,
      headX: 0,
      headZ: 0,
      fwdX: 0,
      fwdZ: 1,
      rightX: 1,
      rightZ: 0,
      headRadiusXZ: 0.3,
      maxHeadFwdProj: 0.25,
      isQuadruped: false,
    };
  }

  const minY = box.min.y;
  const sizeY = Math.max(0.001, box.max.y - box.min.y);
  const sizeX = Math.max(0.001, box.max.x - box.min.x);
  const sizeZ = Math.max(0.001, box.max.z - box.min.z);

  // Pass 2: Head centroid (ny >= 0.66) vs Body centroid (0.24 <= ny <= 0.58)
  let hSumX = 0, hSumZ = 0, hCount = 0;
  let bSumX = 0, bSumZ = 0, bCount = 0;

  meshes.forEach((mesh) => {
    if (rootRef) relMat.multiplyMatrices(invRoot, mesh.matrixWorld);
    else relMat.copy(mesh.matrixWorld);
    const pos = mesh.geometry?.getAttribute('position');
    if (!pos) return;
    const step = Math.max(1, Math.floor(pos.count / 1500));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(relMat);
      const ny = (v.y - minY) / sizeY;
      if (ny >= 0.66) {
        hSumX += v.x;
        hSumZ += v.z;
        hCount++;
      } else if (ny >= 0.24 && ny <= 0.58) {
        bSumX += v.x;
        bSumZ += v.z;
        bCount++;
      }
    }
  });

  const center = new THREE.Vector3();
  box.getCenter(center);

  const headX = hCount > 0 ? hSumX / hCount : center.x;
  const headZ = hCount > 0 ? hSumZ / hCount : center.z;
  const bodyX = bCount > 0 ? bSumX / bCount : center.x;
  const bodyZ = bCount > 0 ? bSumZ / bCount : center.z;

  const dx = headX - bodyX;
  const dz = headZ - bodyZ;
  const sep = Math.hypot(dx, dz);
  const isQuadruped = sep > sizeY * 0.12 || Math.max(sizeX, sizeZ) > sizeY * 1.08;

  let fwdX = 0;
  let fwdZ = 1;
  if (sep > sizeY * 0.08) {
    fwdX = dx / sep;
    fwdZ = dz / sep;
  }
  const rightX = -fwdZ;
  const rightZ = fwdX;

  // Pass 3: Measure head extent along right & forward axes
  let maxRight = 0.08;
  let maxFwd = 0.08;
  meshes.forEach((mesh) => {
    if (rootRef) relMat.multiplyMatrices(invRoot, mesh.matrixWorld);
    else relMat.copy(mesh.matrixWorld);
    const pos = mesh.geometry?.getAttribute('position');
    if (!pos) return;
    const step = Math.max(1, Math.floor(pos.count / 1200));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(relMat);
      const ny = (v.y - minY) / sizeY;
      if (ny >= 0.56) {
        const rx = v.x - headX;
        const rz = v.z - headZ;
        const rProj = Math.abs(rx * rightX + rz * rightZ);
        const fProj = rx * fwdX + rz * fwdZ;
        if (rProj > maxRight) maxRight = rProj;
        if (fProj > maxFwd) maxFwd = fProj;
      }
    }
  });

  return {
    minY,
    sizeY,
    headX,
    headZ,
    fwdX,
    fwdZ,
    rightX,
    rightZ,
    headRadiusXZ: Math.max(0.08, maxRight),
    maxHeadFwdProj: Math.max(0.08, maxFwd),
    isQuadruped,
  };
}

function paintGeometryVerticesWithCatParts(
  mesh: THREE.Mesh,
  profile: AnatomicalProfile,
  rootRef: THREE.Object3D | null | undefined,
  colors: {
    body: THREE.Color;
    belly: THREE.Color;
    paws: THREE.Color;
    ears: THREE.Color;
    eyes: THREE.Color;
    nose: THREE.Color;
  },
  applyNaturalTabbyShading: boolean,
  pattern: CoatPatternType
) {
  const geo = mesh.geometry;
  if (!geo) return;
  const pos = geo.getAttribute('position');
  if (!pos) return;

  if (!mesh.userData.__origColorBackup && geo.getAttribute('color')) {
    mesh.userData.__origColorBackup = geo.getAttribute('color').clone();
  }

  mesh.updateMatrixWorld(true);
  const relMat = new THREE.Matrix4();
  if (rootRef) {
    const invRoot = new THREE.Matrix4().copy(rootRef.matrixWorld).invert();
    relMat.multiplyMatrices(invRoot, mesh.matrixWorld);
  } else {
    relMat.copy(mesh.matrixWorld);
  }

  const out = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const c = new THREE.Color();
  const stripeDark = colors.body.clone().multiplyScalar(0.72);
  const calicoDark = new THREE.Color('#232026');
  const calicoCaramel = new THREE.Color('#d27528');
  const { minY, sizeY, headX, headZ, fwdX, fwdZ, rightX, rightZ, headRadiusXZ, maxHeadFwdProj, isQuadruped } = profile;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(relMat);
    const ny = (v.y - minY) / sizeY;

    const dxHead = v.x - headX;
    const dzHead = v.z - headZ;
    const projRight = dxHead * rightX + dzHead * rightZ;
    const normRight = projRight / headRadiusXZ;
    const absNormRight = Math.abs(normRight);
    const projFwd = dxHead * fwdX + dzHead * fwdZ;
    const normFwd = projFwd / maxHeadFwdProj;
    const inHeadZoneXZ = Math.hypot(dxHead, dzHead) < headRadiusXZ * 1.45;

    // 1. Default coat color + natural pattern (no flat 1-color plastic!)
    c.copy(colors.body);
    if (applyNaturalTabbyShading) {
      if (pattern === 'calico') {
        const patchVal = Math.sin(v.x * 9.5 + v.z * 7.2) + Math.cos(v.y * 8.4 - v.z * 5.0);
        if (patchVal > 0.72) c.copy(calicoCaramel);
        else if (patchVal < -0.78) c.copy(calicoDark);
      } else if (pattern === 'tuxedo') {
        const chestMask = (ny > 0.25 && ny < 0.62 && normFwd > 0.15 && absNormRight < 0.42);
        const muzzleMask = (inHeadZoneXZ && ny > 0.5 && ny < 0.67 && normFwd > 0.48 && absNormRight < 0.38);
        if (chestMask || muzzleMask) c.copy(colors.belly);
      } else if (pattern === 'siamese') {
        const faceMask = clamp01((normFwd - 0.38) * 2.2) * (inHeadZoneXZ && ny > 0.52 && ny < 0.8 ? 1 : 0);
        if (faceMask > 0.1) c.lerp(colors.ears, faceMask * 0.88);
      } else if (pattern === 'tabby') {
        // Cream underbelly/chest + muzzle highlight + soft dorsal tabby bands
        const bellyT =
          clamp01((0.55 - absNormRight) * 1.8) *
          (ny < 0.58 && normFwd > -0.1 ? 0.58 : inHeadZoneXZ && ny > 0.5 && ny < 0.65 && normFwd > 0.55 ? 0.82 : 0);
        if (bellyT > 0.04) c.lerp(colors.belly, bellyT);
        // Subtle tabby stripes along back & forehead
        if (ny > 0.35 && normFwd < 0.52) {
          const wave = Math.max(0, Math.sin((v.z * fwdZ + v.x * fwdX) * 24 + v.y * 10));
          c.lerp(stripeDark, wave * 0.28);
        }
      }
    }

    // 2. Paws (bottom of feet + upright arm paws)
    const isPaw =
      ny < 0.21 ||
      (!isQuadruped && ny > 0.31 && ny < 0.5 && absNormRight > 0.72);
    if (isPaw) {
      c.copy(colors.paws);
    }

    // 3. Ears (upper left & right triangular regions on head)
    const isEar =
      inHeadZoneXZ &&
      ny > (isQuadruped ? 0.77 : 0.79) &&
      absNormRight > 0.16 &&
      normFwd < 0.68;
    if (isEar) {
      c.copy(colors.ears);
    }

    // 4. Eyes (two symmetrical iris circles on upper front of face)
    const eyeYCenter = isQuadruped ? 0.71 : 0.71;
    const eyeDistY = Math.abs(ny - eyeYCenter);
    const eyeDistX = Math.abs(absNormRight - 0.31);
    const isEye =
      inHeadZoneXZ &&
      normFwd > 0.42 &&
      eyeDistY < 0.075 &&
      eyeDistX < 0.145;
    if (isEye) {
      c.copy(colors.eyes);
    }

    // 5. Nose (center front snout tip)
    const noseYCenter = isQuadruped ? 0.62 : 0.62;
    const isNose =
      inHeadZoneXZ &&
      normFwd > 0.76 &&
      Math.abs(ny - noseYCenter) < 0.068 &&
      absNormRight < 0.16;
    if (isNose) {
      c.copy(colors.nose);
    }

    out[i * 3] = c.r;
    out[i * 3 + 1] = c.g;
    out[i * 3 + 2] = c.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(out, 3));
}

export interface SmartCatCoatMeshEntry {
  mesh: THREE.Mesh;
  partKey: string;
  origHexes: string[];
}

/**
 * Applies natural realistic cat colors OR custom user-painted parts (Corpo, Pata, Orelha, Olho, Nariz)
 * onto loaded .glb Three.js meshes cleanly — including single-mesh white-canvas .glb cats.
 */
export function applySmartCatCoatToMeshes(
  entries: SmartCatCoatMeshEntry[],
  options: {
    wholeColor?: string;
    partColors?: Record<string, string>;
    isCatSpecies?: boolean;
    rootRef?: THREE.Object3D | null;
  }
) {
  if (!entries || entries.length === 0) return;

  const { wholeColor, partColors = {}, isCatSpecies = true, rootRef } = options;
  const partKeys = Object.keys(partColors || {});
  const hasAnyCustom = Boolean(wholeColor) || partKeys.length > 0;

  // Detect if the .glb is a blank white-canvas model (single/uniform near-white untextured look)
  const isWhiteCanvas = entries.every((entry) =>
    entry.origHexes.every((h) => isNearWhiteHex(h))
  );

  // If NOT customized and NOT a white-canvas cat, keep untouched original textures/colors
  if (!hasAnyCustom && (!isWhiteCanvas || !isCatSpecies)) {
    entries.forEach(({ mesh, origHexes }) => {
      if (!mesh.userData.__mvClonedForPaint) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m, idx) => {
        const std = m as THREE.MeshStandardMaterial;
        if (!std) return;
        if (mesh.userData.__origVertexColors !== undefined) {
          std.vertexColors = Boolean(mesh.userData.__origVertexColors);
        }
        if (std.color && origHexes[idx]) {
          std.color.set(origHexes[idx]);
        }
        std.needsUpdate = true;
      });
      if (mesh.userData.__origColorBackup && mesh.geometry) {
        mesh.geometry.setAttribute('color', mesh.userData.__origColorBackup.clone());
      } else if (mesh.geometry?.getAttribute('color') && !mesh.userData.__hadColorAttrOriginally) {
        mesh.geometry.deleteAttribute('color');
      }
    });
    return;
  }

  // Decide resolved anatomical colors: user picks > natural tabby cat defaults
  const baseBody =
    partColors.body || partColors.head || wholeColor || (isCatSpecies ? DEFAULT_CAT_COAT.parts.body : '#ffffff');
  const useNaturalCoatDefaults = isCatSpecies && !wholeColor && isWhiteCanvas;

  const resolvedHex = {
    body: baseBody,
    belly:
      partColors.belly ||
      (partColors.body || wholeColor ? mixHexColors(baseBody, '#fff8f0', 0.62) : DEFAULT_CAT_COAT.parts.belly),
    paws:
      partColors.paws ||
      (wholeColor ? mixHexColors(wholeColor, '#ffffff', 0.25) : useNaturalCoatDefaults ? DEFAULT_CAT_COAT.parts.paws : baseBody),
    ears:
      partColors.ears ||
      (wholeColor ? mixHexColors(wholeColor, '#1c1917', 0.22) : useNaturalCoatDefaults ? DEFAULT_CAT_COAT.parts.ears : baseBody),
    eyes:
      partColors.eyes ||
      (isCatSpecies ? DEFAULT_CAT_COAT.parts.eyes : '#0f172a'),
    nose:
      partColors.nose ||
      (isCatSpecies ? DEFAULT_CAT_COAT.parts.nose : '#f472b6'),
  };

  const resolvedThreeColors = {
    body: new THREE.Color(resolvedHex.body),
    belly: new THREE.Color(resolvedHex.belly),
    paws: new THREE.Color(resolvedHex.paws),
    ears: new THREE.Color(resolvedHex.ears),
    eyes: new THREE.Color(resolvedHex.eyes),
    nose: new THREE.Color(resolvedHex.nose),
  };

  // Detect matched named parts across meshes
  const classifiedList = entries.map((e) => ({
    ...e,
    namedPart: classifyNamedGlbPart(e.partKey),
  }));
  const hasDistinctMultiMeshes =
    entries.length >= 3 &&
    new Set(classifiedList.map((c) => c.namedPart).filter(Boolean)).size >= 2;

  const profile = computeGroupAnatomicalProfile(
    entries.map((e) => e.mesh),
    rootRef
  );

  // Detect pattern: if user specifically has multi-part colors close to a preset, keep tabby micro-shading unless flat custom whole color was selected
  const pattern: CoatPatternType = wholeColor
    ? 'solid'
    : partColors.body && !partColors.belly && partColors.body.toLowerCase() === '#fcf7f0'
    ? 'calico'
    : 'tabby';

  classifiedList.forEach(({ mesh, partKey, namedPart, origHexes }) => {
    if (!mesh.userData.__mvClonedForPaint) {
      mesh.userData.__hadColorAttrOriginally = Boolean(mesh.geometry?.getAttribute('color'));
      const rawMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.userData.__origVertexColors = Boolean(
        (rawMats[0] as THREE.MeshStandardMaterial | undefined)?.vertexColors
      );
      const cloned = rawMats.map((m) => (m && typeof m.clone === 'function' ? m.clone() : m));
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
      mesh.userData.__mvClonedForPaint = true;
    }

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    if (hasDistinctMultiMeshes && namedPart) {
      // Multi-mesh GLB: color each named mesh directly with its anatomical color
      const directPartHex =
        partColors[partKey] ||
        partColors[namedPart] ||
        (wholeColor ? wholeColor : isWhiteCanvas ? resolvedHex[namedPart] : origHexes[0]);
      mats.forEach((m) => {
        const std = m as THREE.MeshStandardMaterial;
        if (!std?.color) return;
        std.vertexColors = Boolean(mesh.userData.__origVertexColors);
        if (directPartHex) std.color.set(directPartHex);
        std.needsUpdate = true;
      });
      return;
    }

    // Unified mesh (like C_Cat_Mixed) OR direct custom click on single mesh:
    // Use per-mesh override ONLY if explicitly set on this glb_* key AND user has no anatomical vertex paint,
    // otherwise paint vertex regions (Corpo, Pata, Orelha, Olho, Nariz) directly on the geometry!
    const exactMeshHex = partColors[partKey];
    const effectiveColors = exactMeshHex
      ? {
          ...resolvedThreeColors,
          body: new THREE.Color(exactMeshHex),
        }
      : resolvedThreeColors;

    paintGeometryVerticesWithCatParts(
      mesh,
      profile,
      rootRef,
      effectiveColors,
      !wholeColor && isCatSpecies,
      pattern
    );

    mats.forEach((m) => {
      const std = m as THREE.MeshStandardMaterial;
      if (!std) return;
      std.vertexColors = true;
      if (std.color) {
        std.color.set('#ffffff');
      }
      std.needsUpdate = true;
    });
  });
}
