import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth } from './firebaseAuth';
import {
  Achievement,
  ChatMessage,
  CoupleConfig,
  EasterEgg,
  KittenState,
  Letter,
  LoveTreeState,
  MemoryPhoto,
  Phrase,
  Song,
  StoreItem,
} from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const COUPLE_WORLD_COLLECTION = 'couple_worlds';
export const COUPLE_WORLD_ID = 'gabriel-samella-1206';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface GameRecords {
  bestHearts: number;
  bestMemoryMoves: number;
  bestQuizScore: number;
  ticTacToeWins: number;
}

export interface CloudWorldPayload {
  worldId: string;
  journeyStarted: boolean;
  coins: number;
  treeWaterCount: number;
  currentDailyIndex: number;
  config: CoupleConfig;
  treeState: LoveTreeState;
  kitten: KittenState;
  lettersState: {
    readIds: string[];
    favoriteIds: string[];
    unsealedMap: Record<string, string>;
    customLetters: Letter[];
  };
  achievementsState: Record<string, { unlocked: boolean; unlockedAt?: string; progress: number }>;
  storeItemsState: Record<string, { purchased: boolean; redeemed?: boolean; redeemedAt?: string; equipped?: boolean }>;
  easterEggsState: Record<string, { discovered: boolean; discoveredAt?: string }>;
  phrasesState: Record<string, boolean>;
  chatMessages: ChatMessage[];
  gameRecords: GameRecords;
  customPhotos: MemoryPhoto[];
  customSongs: Song[];
  createdAt?: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt?: Timestamp | ReturnType<typeof serverTimestamp>;
}

/**
 * Strip undefined values recursively so Firestore never rejects payloads with undefined fields
 */
function stripUndefined<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Timestamp || value instanceof FieldValue) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        cleaned[k] = stripUndefined(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

/**
 * Validate Firestore connectivity on application boot.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  try {
    await getDocFromServer(doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Verifique a configuração do Firebase: cliente offline.');
    }
    return false;
  }
}

export async function loadCloudWorld(): Promise<CloudWorldPayload | null> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  try {
    const snap = await getDoc(doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID));
    if (!snap.exists()) return null;
    return snap.data() as CloudWorldPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface SaveCloudInput {
  journeyStarted: boolean;
  coins: number;
  treeWaterCount: number;
  currentDailyIndex: number;
  config: CoupleConfig;
  treeState: LoveTreeState;
  kitten: KittenState;
  letters: Letter[];
  achievements: Achievement[];
  storeItems: StoreItem[];
  easterEggs: EasterEgg[];
  phrases: Phrase[];
  chatMessages: ChatMessage[];
  gameRecords: GameRecords;
  photos: MemoryPhoto[];
  songs: Song[];
  initialPhotoIds: Set<string>;
  initialSongIds: Set<string>;
}

export async function saveCloudWorld(input: SaveCloudInput): Promise<void> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  const docRef = doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID);

  // Build compact diff-maps to keep Firestore document very light (< 100KB)
  const lettersState = {
    readIds: input.letters.filter((l) => l.read).map((l) => l.id),
    favoriteIds: input.letters.filter((l) => l.isFavorite).map((l) => l.id),
    unsealedMap: input.letters.reduce<Record<string, string>>((acc, l) => {
      if (l.unsealedAt) acc[l.id] = l.unsealedAt;
      return acc;
    }, {}),
    customLetters: input.letters.filter((l) => l.id.startsWith('letter-')),
  };

  const achievementsState: CloudWorldPayload['achievementsState'] = {};
  input.achievements.forEach((a) => {
    if (a.unlocked || a.progress > 0) {
      achievementsState[a.id] = {
        unlocked: a.unlocked,
        progress: a.progress,
        ...(a.unlockedAt ? { unlockedAt: a.unlockedAt } : {}),
      };
    }
  });

  const storeItemsState: CloudWorldPayload['storeItemsState'] = {};
  input.storeItems.forEach((item) => {
    if (item.purchased || item.redeemed || item.equipped) {
      storeItemsState[item.id] = {
        purchased: item.purchased,
        ...(item.redeemed !== undefined ? { redeemed: item.redeemed } : {}),
        ...(item.redeemedAt ? { redeemedAt: item.redeemedAt } : {}),
        ...(item.equipped !== undefined ? { equipped: item.equipped } : {}),
      };
    }
  });

  const easterEggsState: CloudWorldPayload['easterEggsState'] = {};
  input.easterEggs.forEach((e) => {
    if (e.discovered) {
      easterEggsState[e.id] = {
        discovered: true,
        ...(e.discoveredAt ? { discoveredAt: e.discoveredAt } : {}),
      };
    }
  });

  const phrasesState: Record<string, boolean> = {};
  input.phrases.forEach((p) => {
    if (p.isFavorite) phrasesState[p.id] = true;
  });

  // Never upload large inline base64 data URLs to Firestore (stay well under 1MB Firestore limit)
  const customPhotos = input.photos
    .filter((p) => !input.initialPhotoIds.has(p.id) && (!p.url.startsWith('data:') || p.url.length < 40000))
    .slice(0, 50);

  const customSongs = input.songs
    .filter((s) => !input.initialSongIds.has(s.id) && (!s.audioUrl?.startsWith('data:') || s.audioUrl.length < 40000))
    .slice(0, 30);

  try {
    const existingSnap = await getDoc(docRef);

    const cleanedFields = stripUndefined({
      journeyStarted: Boolean(input.journeyStarted),
      coins: Math.max(0, Math.min(500000, Math.round(Number.isFinite(input.coins) ? input.coins : 0))),
      treeWaterCount: Math.max(0, Math.min(500000, Math.round(Number.isFinite(input.treeWaterCount) ? input.treeWaterCount : 0))),
      currentDailyIndex: Math.max(0, Math.min(5000, Math.round(Number.isFinite(input.currentDailyIndex) ? input.currentDailyIndex : 0))),
      config: input.config,
      treeState: input.treeState,
      kitten: input.kitten,
      lettersState,
      achievementsState,
      storeItemsState,
      easterEggsState,
      phrasesState,
      chatMessages: input.chatMessages.slice(-150),
      gameRecords: input.gameRecords,
      customPhotos,
      customSongs,
    });

    const mutableFields = {
      ...cleanedFields,
      updatedAt: serverTimestamp(),
    };

    if (existingSnap.exists()) {
      await updateDoc(docRef, mutableFields);
    } else {
      await setDoc(docRef, {
        worldId: COUPLE_WORLD_ID,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function existingSnapSafeOp(_error: unknown): OperationType {
  return OperationType.WRITE;
}

export async function clearCloudWorld(): Promise<void> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  try {
    await deleteDoc(doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
