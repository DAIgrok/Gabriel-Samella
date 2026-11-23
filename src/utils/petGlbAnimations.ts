import type { PetDanceMove } from '../components/3d/PetCanvas3D';

export type PetActionCueType =
  | 'idle'
  | 'pet'
  | 'feed'
  | 'water'
  | 'bath'
  | 'play'
  | 'sleep'
  | 'dance'
  | 'spin'
  | 'jump'
  | 'wave'
  | 'kiss';

export interface PetAnimationCue {
  type: PetActionCueType;
  tick: number;
}

export const PET_PAINT_SWATCHES = [
  { hex: '#ffffff', label: 'Branco Neve' },
  { hex: '#f472b6', label: 'Rosa Doce' },
  { hex: '#a855f7', label: 'Roxo Mágico' },
  { hex: '#fde047', label: 'Creme Solar' },
  { hex: '#f59e0b', label: 'Caramelo' },
  { hex: '#38bdf8', label: 'Azul Celeste' },
  { hex: '#34d399', label: 'Menta' },
  { hex: '#1e1b2e', label: 'Preto Noite' },
];

export const PAINT_PART_LABELS: Record<string, string> = {
  head: 'Cabeça',
  ears: 'Orelhas',
  earInner: 'Dentro das Orelhas',
  body: 'Corpo',
  belly: 'Barriguinha',
  paws: 'Patinhas',
  tail: 'Rabinho',
  cheeks: 'Bochechas',
  nose: 'Narizinho',
};

export function formatPaintPartLabel(partKey: string): string {
  if (PAINT_PART_LABELS[partKey]) return PAINT_PART_LABELS[partKey];
  const cleaned = partKey
    .replace(/^glb_/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\d+\b/g, '')
    .trim();
  if (!cleaned) return 'Parte do Pet';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Case-insensitive exact-then-substring matching across candidate clip names.
 */
export function findBestAnimationClip(
  availableNames: string[],
  candidates: string[]
): string | undefined {
  if (!availableNames || availableNames.length === 0) return undefined;
  const lowerMap = availableNames.map((name) => ({
    raw: name,
    lower: name.toLowerCase(),
    tail: name.split('|').pop()?.toLowerCase() || name.toLowerCase(),
  }));

  for (const cand of candidates) {
    const c = cand.toLowerCase();
    const exact = lowerMap.find((m) => m.lower === c || m.tail === c);
    if (exact) return exact.raw;
  }

  for (const cand of candidates) {
    const c = cand.toLowerCase();
    const partial = lowerMap.find((m) => m.tail.includes(c) || m.lower.includes(c));
    if (partial) return partial.raw;
  }

  return undefined;
}

export interface DesiredClipResult {
  candidates: string[];
  loopOnce?: boolean;
  fallbackClip?: string;
}

/**
 * Maps Talking Tom states & dance moves cleanly to embedded .glb animations:
 * Idle, Happy, Jump, Eat, Feeding, Sit, SitIdle, SitStandUp, Stand, Walk, Walk_2, Run, Dig
 */
export function getDesiredGlbClipCandidates(params: {
  isSleeping?: boolean;
  isEating?: boolean;
  isDrinking?: boolean;
  isBathing?: boolean;
  isPlayMode?: boolean;
  danceMove?: PetDanceMove;
  cueType?: PetActionCueType;
}): DesiredClipResult {
  const {
    isSleeping,
    isEating,
    isDrinking,
    isBathing,
    isPlayMode,
    danceMove = 'idle',
    cueType = 'idle',
  } = params;

  if (isSleeping) {
    return {
      candidates: ['SitIdle', 'Sleep', 'Sleeping', 'Sit', 'Rest', 'Idle'],
    };
  }

  if (isEating || cueType === 'feed') {
    return {
      candidates: ['Eat', 'Feeding', 'Eating', 'Feed', 'Happy', 'Idle'],
    };
  }

  if (isDrinking || cueType === 'water') {
    return {
      candidates: ['Feeding', 'Eat', 'Drink', 'Drinking', 'Happy', 'Idle'],
    };
  }

  if (isBathing || cueType === 'bath') {
    return {
      candidates: ['Happy', 'Dig', 'Jump', 'Shake', 'Stand', 'Idle'],
    };
  }

  if (danceMove === 'jump' || cueType === 'jump') {
    return {
      candidates: ['Jump', 'Happy', 'Run', 'Idle'],
    };
  }

  if (danceMove === 'dance' || cueType === 'dance') {
    return {
      candidates: ['Happy', 'Run', 'Walk_2', 'Jump', 'Dance', 'Idle'],
    };
  }

  if (danceMove === 'spin' || cueType === 'spin') {
    return {
      candidates: ['Run', 'Walk_2', 'Jump', 'Happy', 'Idle'],
    };
  }

  if (danceMove === 'wave' || cueType === 'wave') {
    return {
      candidates: ['Stand', 'Happy', 'SitStandUp', 'Idle'],
    };
  }

  if (danceMove === 'kiss' || cueType === 'kiss' || cueType === 'pet') {
    return {
      candidates: ['Happy', 'Jump', 'Stand', 'Idle'],
    };
  }

  if (isPlayMode || cueType === 'play') {
    return {
      candidates: ['Jump', 'Run', 'Dig', 'Walk_2', 'Happy', 'Idle'],
    };
  }

  return {
    candidates: ['Idle', 'Stand', 'SitIdle', 'Walk'],
  };
}
