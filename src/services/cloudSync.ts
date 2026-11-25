import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth } from './firebaseAuth';
import {
  Achievement,
  AquariumState,
  CalendarEvent,
  ChatMessage,
  CoupleConfig,
  CoupleGoal,
  DailyWheelState,
  DreamHouseState,
  EasterEgg,
  KittenState,
  LegacyResetBackup,
  Letter,
  LoveTreeState,
  MemoryPhoto,
  MissionsState,
  PetType,
  Phrase,
  QuizQuestion,
  SeasonalState,
  Song,
  StoreItem,
  TimeCapsuleItem,
} from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const COUPLE_WORLD_COLLECTION = 'couple_worlds';
export const COUPLE_WORLD_ID = 'gabriel-samella-1206';
export const PHOTOS_SUBCOLLECTION = 'photos';

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
  gamesPlayed?: number;
  highestScore?: number;
  dailyPlayDate?: string;
  dailyRewardsCount?: Record<string, number>;
  lastRewardAt?: Record<string, number>;
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
  achievementsState: Record<
    string,
    { unlocked: boolean; unlockedAt?: string; rewardClaimed?: boolean; progress: number }
  >;
  storeItemsState: Record<
    string,
    { purchased: boolean; redeemed?: boolean; redeemedAt?: string; equipped?: boolean }
  >;
  easterEggsState: Record<
    string,
    { discovered: boolean; discoveredAt?: string; rewardClaimed?: boolean }
  >;
  phrasesState: Record<string, boolean>;
  chatMessages: ChatMessage[];
  gameRecords: GameRecords;
  customPhotos: MemoryPhoto[];
  customSongs: Song[];
  customQuizQuestions?: QuizQuestion[];
  timeCapsules?: TimeCapsuleItem[];
  coupleGoals?: CoupleGoal[];
  calendarEvents?: CalendarEvent[];
  dailyWheelState?: DailyWheelState;
  dreamHouseState?: DreamHouseState;
  aquariumState?: AquariumState;
  seasonalState?: SeasonalState;
  missionsState?: MissionsState;
  lastMysteryChestAt?: number;
  legacyResetBackup?: LegacyResetBackup;
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

export function subscribeCloudWorld(onUpdate: (data: CloudWorldPayload) => void): () => void {
  const docRef = doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.metadata.hasPendingWrites || !snap.exists()) return;
      onUpdate(snap.data() as CloudWorldPayload);
    },
    (err) => {
      console.warn('Firestore live sync notice:', err);
    }
  );
}

export function sanitizePhotoId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
  return cleaned || `photo-${Date.now()}`;
}

export async function loadCloudPhotos(): Promise<MemoryPhoto[]> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}/${PHOTOS_SUBCOLLECTION}`;
  try {
    const colRef = collection(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID, PHOTOS_SUBCOLLECTION);
    const q = query(colRef, orderBy('index', 'asc'), limit(120));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as MemoryPhoto;
      return {
        id: data.id || d.id,
        index: typeof data.index === 'number' ? data.index : 0,
        title: data.title || 'Memória ♡',
        subtitle: data.subtitle || '',
        date: data.date || '',
        url: data.url,
        ...(data.localPath ? { localPath: data.localPath } : {}),
        ...(data.driveUrl ? { driveUrl: data.driveUrl } : {}),
        ...(data.driveFileId ? { driveFileId: data.driveFileId } : {}),
        ...(data.sourceType ? { sourceType: data.sourceType } : {}),
        ...(data.aspect ? { aspect: data.aspect } : {}),
        ...(data.isFavorite !== undefined ? { isFavorite: data.isFavorite } : {}),
        ...(data.inHomeLoop !== undefined ? { inHomeLoop: data.inHomeLoop } : {}),
        ...(data.caption ? { caption: data.caption } : {}),
      };
    });
  } catch (error) {
    console.warn('Erro ao carregar subcoleção de fotos compartilhadas:', error);
    return [];
  }
}

export async function saveCloudPhoto(photo: MemoryPhoto): Promise<void> {
  if (!photo.url || photo.url.startsWith('idb://') || photo.url.length > 740_000) {
    return;
  }
  const safeId = sanitizePhotoId(photo.id);
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}/${PHOTOS_SUBCOLLECTION}/${safeId}`;
  const docRef = doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID, PHOTOS_SUBCOLLECTION, safeId);

  try {
    const existingSnap = await getDoc(docRef);
    const mutableFields = stripUndefined({
      index: Math.max(0, Math.min(10000, Math.round(Number.isFinite(photo.index) ? photo.index : 0))),
      title: String(photo.title || 'Memória ♡').slice(0, 158),
      subtitle: String(photo.subtitle || '').slice(0, 298),
      date: String(photo.date || '').slice(0, 78),
      url: photo.url,
      ...(photo.localPath ? { localPath: photo.localPath.slice(0, 298) } : {}),
      ...(photo.driveUrl ? { driveUrl: photo.driveUrl.slice(0, 498) } : {}),
      ...(photo.driveFileId ? { driveFileId: photo.driveFileId.slice(0, 126) } : {}),
      ...(photo.sourceType ? { sourceType: photo.sourceType.slice(0, 22) } : {}),
      ...(photo.aspect ? { aspect: photo.aspect.slice(0, 22) } : {}),
      ...(photo.isFavorite !== undefined ? { isFavorite: Boolean(photo.isFavorite) } : {}),
      ...(photo.inHomeLoop !== undefined ? { inHomeLoop: Boolean(photo.inHomeLoop) } : {}),
      ...(photo.caption ? { caption: photo.caption.slice(0, 398) } : {}),
      updatedAt: serverTimestamp(),
    });

    if (existingSnap.exists()) {
      await updateDoc(docRef, mutableFields);
    } else {
      await setDoc(docRef, {
        id: safeId,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCloudPhotosBatch(photos: MemoryPhoto[]): Promise<void> {
  const validPhotos = photos.filter((p) => p.url && !p.url.startsWith('idb://') && p.url.length <= 740_000);
  // Save sequentially in small chunks of 4 to avoid overwhelming mobile network / quota
  for (let i = 0; i < validPhotos.length; i += 4) {
    const chunk = validPhotos.slice(i, i + 4);
    await Promise.allSettled(chunk.map((photo) => saveCloudPhoto(photo)));
  }
}

export async function deleteCloudPhoto(photoId: string): Promise<void> {
  const safeId = sanitizePhotoId(photoId);
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}/${PHOTOS_SUBCOLLECTION}/${safeId}`;
  try {
    await deleteDoc(doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID, PHOTOS_SUBCOLLECTION, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
  customQuizQuestions: QuizQuestion[];
  timeCapsules: TimeCapsuleItem[];
  coupleGoals: CoupleGoal[];
  calendarEvents: CalendarEvent[];
  dailyWheelState: DailyWheelState;
  dreamHouseState: DreamHouseState;
  aquariumState: AquariumState;
  seasonalState: SeasonalState;
  missionsState: MissionsState;
  lastMysteryChestAt?: number;
  legacyResetBackup?: LegacyResetBackup;
  initialPhotoIds: Set<string>;
  initialSongIds: Set<string>;
}

function sanitizeConfigForFirestore(cfg: CoupleConfig): CoupleConfig {
  if (!cfg.customGlbModels) return cfg;
  const cleanPets: Partial<Record<PetType, string>> = {};
  Object.entries(cfg.customGlbModels.pets || {}).forEach(([k, v]) => {
    if (!v) return;
    // Large binary data: URLs live in localStorage + IndexedDB + Supabase full_state to respect Firestore's 1MB doc limit
    cleanPets[k as PetType] = v.startsWith('data:') && v.length > 80_000 ? 'supabase-synced' : v;
  });
  const cleanFurniture: Record<string, string> = {};
  Object.entries(cfg.customGlbModels.furniture || {}).forEach(([k, v]) => {
    if (!v) return;
    cleanFurniture[k] = v.startsWith('data:') && v.length > 80_000 ? 'supabase-synced' : v;
  });
  return {
    ...cfg,
    customGlbModels: {
      pets: cleanPets,
      furniture: cleanFurniture,
    },
  };
}

export async function saveCloudWorld(input: SaveCloudInput): Promise<void> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  const docRef = doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID);

  // Build compact diff-maps to keep Firestore document light (< 150KB)
  const lettersState = {
    readIds: input.letters.filter((l) => l.read).map((l) => l.id),
    favoriteIds: input.letters.filter((l) => l.isFavorite).map((l) => l.id),
    unsealedMap: input.letters.reduce<Record<string, string>>((acc, l) => {
      if (l.unsealedAt) acc[l.id] = l.unsealedAt;
      return acc;
    }, {}),
    customLetters: input.letters.slice(0, 100),
  };

  const achievementsState: CloudWorldPayload['achievementsState'] = {};
  input.achievements.forEach((a) => {
    if (a.unlocked || a.rewardClaimed || a.progress > 0) {
      achievementsState[a.id] = {
        unlocked: a.unlocked,
        progress: a.progress,
        ...(a.unlockedAt ? { unlockedAt: a.unlockedAt } : {}),
        ...(a.unlocked || a.rewardClaimed ? { rewardClaimed: true } : {}),
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
    if (e.discovered || e.rewardClaimed) {
      easterEggsState[e.id] = {
        discovered: true,
        rewardClaimed: true,
        ...(e.discoveredAt ? { discoveredAt: e.discoveredAt } : {}),
      };
    }
  });

  const phrasesState: Record<string, boolean> = {};
  input.phrases.forEach((p) => {
    if (p.isFavorite) phrasesState[p.id] = true;
  });

  // Photos with compressed data URLs live in the dedicated photos subcollection; keep only lightweight URL metadata here
  const customPhotos = input.photos
    .filter((p) => !input.initialPhotoIds.has(p.id) && !p.url.startsWith('idb://') && !p.url.startsWith('data:'))
    .slice(0, 50);

  const customSongs = input.songs
    .filter(
      (s) =>
        !input.initialSongIds.has(s.id) &&
        !s.audioUrl?.startsWith('idb://') &&
        (!s.audioUrl?.startsWith('data:') || s.audioUrl.length < 40000)
    )
    .slice(0, 35);

  try {
    const existingSnap = await getDoc(docRef);

    const cleanedFields = stripUndefined({
      journeyStarted: Boolean(input.journeyStarted),
      coins: Math.max(0, Math.min(500000, Math.round(Number.isFinite(input.coins) ? input.coins : 0))),
      treeWaterCount: Math.max(0, Math.min(500000, Math.round(Number.isFinite(input.treeWaterCount) ? input.treeWaterCount : 0))),
      currentDailyIndex: Math.max(0, Math.min(5000, Math.round(Number.isFinite(input.currentDailyIndex) ? input.currentDailyIndex : 0))),
      config: sanitizeConfigForFirestore(input.config),
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
      customQuizQuestions: input.customQuizQuestions.slice(0, 80),
      timeCapsules: input.timeCapsules.slice(0, 30),
      coupleGoals: input.coupleGoals.slice(0, 90),
      calendarEvents: input.calendarEvents.slice(0, 140),
      dailyWheelState: input.dailyWheelState,
      dreamHouseState: input.dreamHouseState,
      aquariumState: input.aquariumState,
      seasonalState: input.seasonalState,
      missionsState: input.missionsState,
      ...(input.legacyResetBackup ? { legacyResetBackup: input.legacyResetBackup } : {}),
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

export async function clearCloudWorld(
  preservedCustomGlbModels?: CoupleConfig['customGlbModels']
): Promise<void> {
  const path = `${COUPLE_WORLD_COLLECTION}/${COUPLE_WORLD_ID}`;
  try {
    const docRef = doc(db, COUPLE_WORLD_COLLECTION, COUPLE_WORLD_ID);
    let modelsToKeep = preservedCustomGlbModels;
    if (!modelsToKeep) {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as { config?: CoupleConfig };
        modelsToKeep = data.config?.customGlbModels;
      }
    }
    // Mantém a subcoleção de fotos reais e modelos 3D .glb intactos permanentemente mesmo ao zerar o progresso
    await deleteDoc(docRef);
    if (
      modelsToKeep &&
      (Object.keys(modelsToKeep.pets || {}).length > 0 ||
        Object.keys(modelsToKeep.furniture || {}).length > 0)
    ) {
      await setDoc(docRef, {
        worldId: COUPLE_WORLD_ID,
        journeyStarted: false,
        config: sanitizeConfigForFirestore({
          partnerName: 'Samella',
          myName: 'Gabriel',
          anniversaryDate: '2023-06-12T00:00:00',
          subtitle: 'Que bom ter você aqui de novo ♡',
          passcode: '120623',
          creatorPasscode: '2010',
          themeGlowColor: '#c084fc',
          customGlbModels: modelsToKeep,
        }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
