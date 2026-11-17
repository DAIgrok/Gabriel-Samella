import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import {
  Achievement,
  ActiveTab,
  AquariumLightMode,
  AquariumState,
  CalendarEvent,
  ChatMessage,
  CoupleConfig,
  CoupleGoal,
  CouplePerson,
  DailyMessage,
  DailyWheelState,
  DreamHouseState,
  EasterEgg,
  ExtendedView,
  HouseFloorTheme,
  HouseRoomId,
  HouseWallTheme,
  KittenState,
  LegacyResetBackup,
  Letter,
  LoveTreeState,
  MemoryPhoto,
  MissionsState,
  PetType,
  Phrase,
  QuizQuestion,
  SeasonalEventId,
  SeasonalState,
  Song,
  StoreItem,
  TimeCapsuleItem,
} from '../types';
import {
  AQUARIUM_SPECIES_CATALOG,
  COOLDOWN_MS,
  HOUSE_FURNITURE_CATALOG,
  HOUSE_WALL_THEMES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_AQUARIUM_STATE,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_COUPLE_CONFIG,
  INITIAL_COUPLE_GOALS,
  INITIAL_DAILY_MESSAGES,
  INITIAL_DAILY_WHEEL,
  INITIAL_DREAM_HOUSE,
  INITIAL_EASTER_EGGS,
  INITIAL_KITTEN,
  INITIAL_LETTERS,
  INITIAL_MISSIONS_STATE,
  INITIAL_PHOTOS,
  INITIAL_PHRASES,
  INITIAL_SEASONAL_STATE,
  INITIAL_SONGS,
  INITIAL_STORE_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_TREE_STATE,
  INTEGRATED_MISSIONS_CATALOG,
  LEGACY_ARCHIVE_GOALS,
  LEGACY_ARCHIVE_LETTERS,
  PET_SPECIES_CATALOG,
} from '../data/initialData';
import { soundEngine } from '../utils/audioSynth';
import { resolveActiveSeasonalEvent, SeasonalThemeMeta } from '../utils/seasonalEngine';
import { captureCanvasSnapshotWithFrame } from '../utils/virtualCamera';
import { realAudio } from '../services/realAudio';
import { deleteMediaBlob } from '../services/localMediaStore';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
} from '../services/firebaseAuth';
import { fetchDriveFolderPhotos, TARGET_DRIVE_FOLDER_ID } from '../services/googleDrive';
import {
  clearCloudWorld,
  CloudWorldPayload,
  deleteCloudPhoto,
  GameRecords,
  loadCloudPhotos,
  loadCloudWorld,
  saveCloudPhoto,
  saveCloudPhotosBatch,
  saveCloudWorld,
  subscribeCloudWorld,
  testFirestoreConnection,
} from '../services/cloudSync';

export function getCooldownRemaining(cooldowns: Record<string, number> | undefined, key: string): number {
  const until = cooldowns?.[key] || 0;
  return Math.max(0, until - Date.now());
}

export function formatCooldownMs(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.ceil(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const INITIAL_PHOTO_IDS = new Set(INITIAL_PHOTOS.map((p) => p.id));
const INITIAL_SONG_IDS = new Set(INITIAL_SONGS.map((s) => s.id));

const DEFAULT_GAME_RECORDS: GameRecords = {
  bestHearts: 0,
  bestMemoryMoves: 0,
  bestQuizScore: 0,
  ticTacToeWins: 0,
};

export function getTreeStageName(level: number): string {
  switch (level) {
    case 1:
      return 'Semente do Amor 🌱';
    case 2:
      return 'Primeiro Broto 🌿';
    case 3:
      return 'Muda Jovem 🌸';
    case 4:
      return 'Árvore em Botão 🌷';
    case 5:
      return 'Copa Florida 🌳';
    case 6:
      return 'Cerejeira Encantada 🌸✨';
    case 7:
      return 'Árvore das Promessas 🎀';
    case 8:
      return 'Frutos Sagrados 🍎';
    case 9:
      return 'Guardiã Estrelada 🕯️';
    case 10:
    default:
      return 'Árvore Cósmica da Eternidade 🌌👑';
  }
}

interface AppContextType {
  // State
  config: CoupleConfig;
  coins: number;
  activeTab: ActiveTab;
  extendedView: ExtendedView;
  isDrawerOpen: boolean;
  isSettingsOpen: boolean;
  isLoggedIn: boolean;
  isLoadingDone: boolean;
  isLoading: boolean;
  isLocked: boolean;
  journeyStarted: boolean;
  isCloudSynced: boolean;
  phrases: Phrase[];
  dailyMessages: DailyMessage[];
  currentDailyIndex: number;
  letters: Letter[];
  selectedLetter: Letter | null;
  photos: MemoryPhoto[];
  selectedPhoto: MemoryPhoto | null;
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isLoop: boolean;
  playbackTime: number;
  achievements: Achievement[];
  storeItems: StoreItem[];
  kitten: KittenState;
  chatMessages: ChatMessage[];
  easterEggs: EasterEgg[];
  recentEasterEgg: (EasterEgg & { justDiscovered?: boolean }) | null;
  toastMessage: { text: string; icon?: string; reward?: number } | null;
  treeWaterCount: number;
  treeState: LoveTreeState;
  loveTree: LoveTreeState;
  hasSeenIntro: boolean;
  gameRecords: GameRecords;
  customQuizQuestions: QuizQuestion[];
  timeCapsules: TimeCapsuleItem[];
  coupleGoals: CoupleGoal[];
  calendarEvents: CalendarEvent[];
  dailyWheel: DailyWheelState;
  dreamHouse: DreamHouseState;
  aquarium: AquariumState;
  seasonalState: SeasonalState;
  missionsState: MissionsState;
  legacyResetBackup?: LegacyResetBackup;
  activeSeasonalEvent: SeasonalEventId;
  activeSeasonalMeta: SeasonalThemeMeta;
  isSeasonalPreview: boolean;

  // Google Drive & Auth
  isGoogleConnected: boolean;
  googleUser: User | null;
  isDriveSyncing: boolean;
  driveSyncProgress: { current: number; total: number } | null;
  driveSyncError: string | null;
  connectGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => Promise<void>;
  syncDrivePhotos: () => Promise<void>;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setExtendedView: (view: ExtendedView) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setIsLoadingDone: (done: boolean) => void;
  addCoins: (amount: number, reason?: string) => void;
  spendCoins: (amount: number) => boolean;
  nextDailyMessage: () => void;
  prevDailyMessage: () => void;
  toggleFavoritePhrase: (id: string) => void;
  markLetterRead: (id: string) => void;
  toggleFavoriteLetter: (id: string) => void;
  setSelectedLetter: (letter: Letter | null) => void;
  addCustomLetter: (letter: Omit<Letter, 'id' | 'read' | 'isFavorite'>) => void;
  sendTwoWayLetter: (payload: {
    sender: CouplePerson;
    recipient: CouplePerson;
    title: string;
    excerpt?: string;
    content: string;
    isPrivate?: boolean;
    tags?: string[];
  }) => void;
  deleteLetter: (id: string) => void;
  toggleFavoritePhoto: (id: string) => void;
  setSelectedPhoto: (photo: MemoryPhoto | null) => void;
  updatePhotoUrl: (id: string, url: string, title?: string) => void;
  editPhoto: (id: string, updates: Partial<MemoryPhoto>) => void;
  togglePhotoInLoop: (id: string) => void;
  addPhoto: (photo: Omit<MemoryPhoto, 'id' | 'index'>) => void;
  removePhoto: (id: string) => void;
  playSong: (song?: Song) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekSong: (time: number) => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  toggleFavoriteSong: (id: string) => void;
  addSong: (song: Omit<Song, 'id'>) => void;
  editSong: (id: string, updates: Partial<Song>) => void;
  removeSong: (id: string) => void;
  unlockAchievement: (id: string) => void;
  buyStoreItem: (id: string) => boolean;
  redeemVoucher: (id: string) => void;
  petKitten: (part?: 'head' | 'belly' | 'paw') => void;
  feedKitten: (foodName?: string, hungerBoost?: number, happyBoost?: number) => boolean;
  giveWaterKitten: () => boolean;
  batheKitten: (boostAmount?: number) => boolean;
  toggleSleepKitten: () => boolean;
  playWithKitten: (toyName?: string, source?: 'toy' | 'dance') => boolean;
  equipKittenItem: (itemId: string, category: 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses') => void;
  switchPet: (petType: PetType) => void;
  renamePet: (newName: string) => void;
  adoptPet: (petType: PetType) => void;
  waterLoveTree: () => boolean;
  sunLoveTree: () => boolean;
  pruneLoveTree: () => boolean;
  addPromiseRibbon: (promiseText: string) => boolean;
  harvestTreeFruit: (index: number) => string | null;
  plantLoveSeed: () => boolean;
  sendChatMessage: (text: string) => void;
  triggerEasterEgg: (id: string) => void;
  closeEasterEggModal: () => void;
  showToast: (text: string, icon?: string, reward?: number) => void;
  updateConfig: (newConfig: Partial<CoupleConfig>) => void;
  updateGameRecord: (partial: Partial<GameRecords>) => void;
  addQuizQuestion: (q: Omit<QuizQuestion, 'id' | 'isCustom'>) => void;
  removeQuizQuestion: (id: string) => void;
  addTimeCapsule: (capsule: Omit<TimeCapsuleItem, 'id' | 'createdAt'>) => void;
  removeTimeCapsule: (id: string) => void;
  addCoupleGoal: (goal: Omit<CoupleGoal, 'id' | 'completed'>) => void;
  updateCoupleGoal: (id: string, updates: Partial<CoupleGoal>) => void;
  toggleCoupleGoal: (id: string) => void;
  removeCoupleGoal: (id: string) => void;
  addCalendarEvent: (ev: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (id: string) => void;
  spinDailyWheel: (prizeLabel: string, coinReward: number) => boolean;
  // Dream House 3D
  setHouseRoom: (room: HouseRoomId) => void;
  setHouseWallTheme: (theme: HouseWallTheme) => void;
  setHouseFloorTheme: (theme: HouseFloorTheme) => void;
  toggleHouseLights: () => void;
  toggleHouseFireplace: () => void;
  toggleHouseFurniturePlacement: (furnitureId: string) => void;
  recordHouseVisit: () => void;
  interactHouseFurniture: (furnitureId: string) => void;
  // Aquarium 3D
  feedAquarium: () => boolean;
  cleanAquarium: () => boolean;
  toggleAquariumBubbles: () => void;
  setAquariumLightMode: (mode: AquariumLightMode) => void;
  toggleAquariumFish: (fishId: string) => void;
  toggleAquariumDecor: (decorId: string) => void;
  // Seasonal & Missions & Virtual Camera
  setSeasonalMode: (mode: 'auto' | 'preview', previewEvent?: SeasonalEventId) => void;
  claimSeasonalProp: (propId: string, rewardCoins: number, label: string) => boolean;
  claimIntegratedMission: (missionId: string) => boolean;
  captureVirtualPhoto: (containerEl: HTMLElement | null, sceneTitle: string, subtitle: string) => boolean;
  triggerHeartExplosion: (x?: number, y?: number) => void;
  heartRainTriggerCount: number;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'NOSSO_MUNDO_APP_STATE_V3';
const UNLOCK_STORAGE_KEY = 'NOSSO_MUNDO_UNLOCKED_V3';
const WHEEL_FLOOR_STORAGE_KEY = 'NOSSO_MUNDO_LAST_WHEEL_SPIN_AT';

const readWheelSpinFloor = (): number => {
  try {
    const raw = localStorage.getItem(WHEEL_FLOOR_STORAGE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

const writeWheelSpinFloor = (ts: number) => {
  try {
    const current = readWheelSpinFloor();
    if (ts > current) {
      localStorage.setItem(WHEEL_FLOOR_STORAGE_KEY, String(ts));
    }
  } catch {
    // ignore storage quota errors
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.journeyStarted === true) {
          return parsed;
        }
      }
    } catch {
      // ignore invalid storage
    }
    return null;
  };

  const loadUnlockedSession = (): boolean => {
    try {
      return localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  };

  const savedData = loadSavedState();

  const mergeInitialItems = <T extends { id: string }>(
    savedList: T[] | undefined,
    initialList: T[]
  ): T[] => {
    if (!savedList || savedList.length === 0) return initialList;
    const existingIds = new Set(savedList.map((item) => item.id));
    const newItems = initialList.filter((item) => !existingIds.has(item.id));
    return [...savedList, ...newItems];
  };

  const [journeyStarted, setJourneyStarted] = useState<boolean>(
    Boolean(savedData?.journeyStarted)
  );
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  const [config, setConfig] = useState<CoupleConfig>(
    savedData?.config || INITIAL_COUPLE_CONFIG
  );
  const [coins, setCoins] = useState<number>(savedData?.coins ?? 0);
  const [activeTab, setActiveTabState] = useState<ActiveTab>('inicio');
  const [extendedView, setExtendedViewState] = useState<ExtendedView>('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => loadUnlockedSession());
  const [isLoadingDone, setIsLoadingDone] = useState<boolean>(() => loadUnlockedSession());
  const [hasSeenIntro] = useState(false);

  const [phrases, setPhrases] = useState<Phrase[]>(
    mergeInitialItems(savedData?.phrases, INITIAL_PHRASES)
  );
  const [dailyMessages] = useState<DailyMessage[]>(INITIAL_DAILY_MESSAGES);
  const [currentDailyIndex, setCurrentDailyIndex] = useState<number>(
    savedData?.currentDailyIndex ?? 0
  );

  // One-time idempotent backup & controlled reset for pre-existing local data
  const initialLegacyBackup: LegacyResetBackup | undefined = (() => {
    if (savedData?.legacyResetBackup) {
      return savedData.legacyResetBackup as LegacyResetBackup;
    }
    if (savedData && (Array.isArray(savedData.letters) || Array.isArray(savedData.coupleGoals))) {
      return {
        version: 1,
        backedUpAt: new Date().toISOString(),
        letters: Array.isArray(savedData.letters) ? savedData.letters : LEGACY_ARCHIVE_LETTERS,
        coupleGoals: Array.isArray(savedData.coupleGoals) ? savedData.coupleGoals : LEGACY_ARCHIVE_GOALS,
      };
    }
    return undefined;
  })();

  const shouldRunInitialLocalReset = Boolean(savedData && !savedData.legacyResetBackup);

  const [legacyResetBackup, setLegacyResetBackup] = useState<LegacyResetBackup | undefined>(
    initialLegacyBackup
  );

  const [letters, setLetters] = useState<Letter[]>(() =>
    shouldRunInitialLocalReset ? INITIAL_LETTERS : (savedData?.letters || INITIAL_LETTERS)
  );
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const [photos, setPhotos] = useState<MemoryPhoto[]>(
    mergeInitialItems(savedData?.photos, INITIAL_PHOTOS)
  );
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);

  const [songs, setSongs] = useState<Song[]>(
    mergeInitialItems(savedData?.songs, INITIAL_SONGS)
  );
  const [currentSong, setCurrentSong] = useState<Song | null>(
    savedData?.songs?.[0] || INITIAL_SONGS[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const [achievements, setAchievements] = useState<Achievement[]>(
    mergeInitialItems(savedData?.achievements, INITIAL_ACHIEVEMENTS)
  );
  const [storeItems, setStoreItems] = useState<StoreItem[]>(
    mergeInitialItems(savedData?.storeItems, INITIAL_STORE_ITEMS)
  );
  const [kitten, setKitten] = useState<KittenState>(savedData?.kitten || INITIAL_KITTEN);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    savedData?.chatMessages || INITIAL_CHAT_MESSAGES
  );
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(
    mergeInitialItems(savedData?.easterEggs, INITIAL_EASTER_EGGS)
  );
  const [recentEasterEgg, setRecentEasterEgg] = useState<(EasterEgg & { justDiscovered?: boolean }) | null>(null);

  const [treeWaterCount, setTreeWaterCount] = useState<number>(
    savedData?.treeWaterCount ?? 0
  );
  const [treeState, setTreeState] = useState<LoveTreeState>(
    savedData?.treeState || INITIAL_TREE_STATE
  );
  const [gameRecords, setGameRecords] = useState<GameRecords>(
    savedData?.gameRecords || DEFAULT_GAME_RECORDS
  );
  const [customQuizQuestions, setCustomQuizQuestions] = useState<QuizQuestion[]>(
    savedData?.customQuizQuestions || []
  );
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsuleItem[]>(
    mergeInitialItems(savedData?.timeCapsules, INITIAL_TIME_CAPSULES)
  );
  const [coupleGoals, setCoupleGoals] = useState<CoupleGoal[]>(() =>
    shouldRunInitialLocalReset ? INITIAL_COUPLE_GOALS : (savedData?.coupleGoals || INITIAL_COUPLE_GOALS)
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(
    mergeInitialItems(savedData?.calendarEvents, INITIAL_CALENDAR_EVENTS)
  );
  const [dailyWheel, setDailyWheel] = useState<DailyWheelState>(() => {
    const base = savedData?.dailyWheel || INITIAL_DAILY_WHEEL;
    const floor = readWheelSpinFloor();
    return {
      ...base,
      lastSpinAt: Math.max(base.lastSpinAt || 0, floor),
    };
  });
  const [dreamHouse, setDreamHouse] = useState<DreamHouseState>(() => ({
    ...INITIAL_DREAM_HOUSE,
    ...(savedData?.dreamHouse || {}),
    placedFurniture: {
      ...INITIAL_DREAM_HOUSE.placedFurniture,
      ...(savedData?.dreamHouse?.placedFurniture || {}),
    },
  }));
  const [aquarium, setAquarium] = useState<AquariumState>(() => ({
    ...INITIAL_AQUARIUM_STATE,
    ...(savedData?.aquarium || {}),
  }));
  const [seasonalState, setSeasonalState] = useState<SeasonalState>(() => ({
    ...INITIAL_SEASONAL_STATE,
    ...(savedData?.seasonalState || {}),
  }));
  const [missionsState, setMissionsState] = useState<MissionsState>(() => ({
    ...INITIAL_MISSIONS_STATE,
    ...(savedData?.missionsState || {}),
  }));
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    icon?: string;
    reward?: number;
  } | null>(null);

  // Google Drive & Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveSyncProgress, setDriveSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [driveSyncError, setDriveSyncError] = useState<string | null>(null);

  const cloudHydratedRef = useRef(false);
  const isApplyingRemoteRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const invalidSkippedIdsRef = useRef<Set<string>>(new Set());

  // Synchronous idempotency guards against duplicate/spam diamond claims
  const claimedAchievementIdsRef = useRef<Set<string>>(
    new Set(
      (savedData?.achievements || INITIAL_ACHIEVEMENTS)
        .filter((a: Achievement) => a.unlocked || a.rewardClaimed)
        .map((a: Achievement) => a.id)
    )
  );
  const claimedEasterEggIdsRef = useRef<Set<string>>(
    new Set(
      (savedData?.easterEggs || INITIAL_EASTER_EGGS)
        .filter((e: EasterEgg) => e.discovered || e.rewardClaimed)
        .map((e: EasterEgg) => e.id)
    )
  );
  const claimedLetterIdsRef = useRef<Set<string>>(
    new Set(
      (savedData?.letters || INITIAL_LETTERS)
        .filter((l: Letter) => l.read || l.rewardClaimed)
        .map((l: Letter) => l.id)
    )
  );
  const claimedGoalIdsRef = useRef<Set<string>>(
    new Set(
      (savedData?.coupleGoals || INITIAL_COUPLE_GOALS)
        .filter((g: CoupleGoal) => g.completed || g.rewardClaimed)
        .map((g: CoupleGoal) => g.id)
    )
  );
  const lastWheelSpinRef = useRef<number>(
    Math.max(savedData?.dailyWheel?.lastSpinAt || 0, readWheelSpinFloor())
  );

  const songsRef = useRef<Song[]>(songs);
  songsRef.current = songs;
  const currentSongRef = useRef<Song | null>(currentSong);
  currentSongRef.current = currentSong;
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;
  const isLoopRef = useRef<boolean>(isLoop);
  isLoopRef.current = isLoop;

  const getSpeciesDisplayName = (petType?: PetType, customName?: string) => {
    if (customName && customName.trim()) return customName.trim();
    const spec = PET_SPECIES_CATALOG.find((s) => s.type === (petType || 'cat'));
    return spec ? spec.name : 'Gatinho';
  };

  const applyCloudPayload = (cloud: CloudWorldPayload, isLiveUpdate = false) => {
    if (!cloud || !cloud.journeyStarted) return;

    if (isLiveUpdate) {
      isApplyingRemoteRef.current = true;
    }

    setJourneyStarted(true);
    if (cloud.config) setConfig(cloud.config);
    if (typeof cloud.coins === 'number') setCoins(cloud.coins);
    if (typeof cloud.treeWaterCount === 'number') setTreeWaterCount(cloud.treeWaterCount);
    if (typeof cloud.currentDailyIndex === 'number') setCurrentDailyIndex(cloud.currentDailyIndex);
    if (cloud.treeState) setTreeState(cloud.treeState);
    if (cloud.kitten) setKitten(cloud.kitten);
    if (cloud.gameRecords) setGameRecords({ ...DEFAULT_GAME_RECORDS, ...cloud.gameRecords });
    if (cloud.chatMessages && cloud.chatMessages.length > 0) {
      setChatMessages(cloud.chatMessages);
    }

    // One-time controlled reset & backup of legacy cloud data
    if (cloud.legacyResetBackup) {
      setLegacyResetBackup(cloud.legacyResetBackup);
      const nextLetters = (cloud.lettersState?.customLetters || []).map((l) => {
        if (l.read || l.rewardClaimed) claimedLetterIdsRef.current.add(l.id);
        return l;
      });
      setLetters(nextLetters);

      if (Array.isArray(cloud.coupleGoals)) {
        cloud.coupleGoals.forEach((g) => {
          if (g.completed || g.rewardClaimed) claimedGoalIdsRef.current.add(g.id);
        });
        setCoupleGoals(cloud.coupleGoals);
      }
    } else {
      // Cloud doc predates v4 reset: archive pre-existing letters & goals once and start clean
      const readSet = new Set(cloud.lettersState?.readIds || []);
      const favSet = new Set(cloud.lettersState?.favoriteIds || []);
      const unsealedMap = cloud.lettersState?.unsealedMap || {};
      const archivedClassic = LEGACY_ARCHIVE_LETTERS.map((l) => ({
        ...l,
        read: readSet.has(l.id),
        rewardClaimed: readSet.has(l.id) || l.rewardClaimed,
        isFavorite: favSet.has(l.id),
        unsealedAt: unsealedMap[l.id] || l.unsealedAt,
      }));
      const archivedLetters = [
        ...(cloud.lettersState?.customLetters || []),
        ...archivedClassic,
      ];
      const archivedGoals =
        cloud.coupleGoals && cloud.coupleGoals.length > 0
          ? cloud.coupleGoals
          : LEGACY_ARCHIVE_GOALS;

      const migrationBackup: LegacyResetBackup = {
        version: 1,
        backedUpAt: new Date().toISOString(),
        letters: archivedLetters,
        coupleGoals: archivedGoals,
      };
      setLegacyResetBackup(migrationBackup);
      claimedLetterIdsRef.current.clear();
      claimedGoalIdsRef.current.clear();
      setLetters([]);
      setCoupleGoals([]);
    }

    if (cloud.achievementsState) {
      setAchievements(
        INITIAL_ACHIEVEMENTS.map((a) => {
          const st = cloud.achievementsState[a.id];
          if (!st) return a;
          const isClaimed = Boolean(st.unlocked || st.rewardClaimed);
          if (isClaimed) claimedAchievementIdsRef.current.add(a.id);
          return {
            ...a,
            unlocked: Boolean(st.unlocked),
            rewardClaimed: isClaimed,
            unlockedAt: st.unlockedAt,
            progress: st.progress ?? a.progress,
          };
        })
      );
    }

    if (cloud.storeItemsState) {
      setStoreItems(
        INITIAL_STORE_ITEMS.map((item) => {
          const st = cloud.storeItemsState[item.id];
          if (!st) return item;
          return {
            ...item,
            purchased: Boolean(st.purchased),
            redeemed: st.redeemed ?? item.redeemed,
            redeemedAt: st.redeemedAt ?? item.redeemedAt,
            equipped: st.equipped ?? item.equipped,
          };
        })
      );
    }

    if (cloud.easterEggsState) {
      setEasterEggs(
        INITIAL_EASTER_EGGS.map((egg) => {
          const st = cloud.easterEggsState[egg.id];
          if (!st) return egg;
          const isClaimed = Boolean(st.discovered || st.rewardClaimed);
          if (isClaimed) claimedEasterEggIdsRef.current.add(egg.id);
          return {
            ...egg,
            discovered: Boolean(st.discovered),
            rewardClaimed: isClaimed,
            discoveredAt: st.discoveredAt,
          };
        })
      );
    }

    if (cloud.phrasesState) {
      setPhrases(
        INITIAL_PHRASES.map((p) => ({
          ...p,
          isFavorite: Boolean(cloud.phrasesState[p.id]),
        }))
      );
    }

    if (cloud.customPhotos && cloud.customPhotos.length > 0) {
      setPhotos((prev) => mergeInitialItems(cloud.customPhotos, prev));
    }

    if (cloud.customSongs && cloud.customSongs.length > 0) {
      setSongs((prev) => {
        const merged = mergeInitialItems(prev, cloud.customSongs);
        setCurrentSong((cur) => cur || merged[0] || null);
        return merged;
      });
    }

    if (cloud.customQuizQuestions && cloud.customQuizQuestions.length > 0) {
      setCustomQuizQuestions(cloud.customQuizQuestions);
    }

    if (cloud.timeCapsules && cloud.timeCapsules.length > 0) {
      setTimeCapsules((prev) => mergeInitialItems(cloud.timeCapsules, prev));
    }

    if (cloud.calendarEvents && cloud.calendarEvents.length > 0) {
      setCalendarEvents(cloud.calendarEvents);
    }

    if (cloud.dailyWheelState) {
      const mergedSpinAt = Math.max(
        cloud.dailyWheelState.lastSpinAt || 0,
        lastWheelSpinRef.current,
        readWheelSpinFloor()
      );
      lastWheelSpinRef.current = mergedSpinAt;
      writeWheelSpinFloor(mergedSpinAt);
      setDailyWheel({
        ...cloud.dailyWheelState,
        lastSpinAt: mergedSpinAt,
      });
    }

    if (cloud.dreamHouseState) {
      setDreamHouse({
        ...INITIAL_DREAM_HOUSE,
        ...cloud.dreamHouseState,
        placedFurniture: {
          ...INITIAL_DREAM_HOUSE.placedFurniture,
          ...(cloud.dreamHouseState.placedFurniture || {}),
        },
      });
    }

    if (cloud.aquariumState) {
      setAquarium({
        ...INITIAL_AQUARIUM_STATE,
        ...cloud.aquariumState,
      });
    }

    if (cloud.seasonalState) {
      setSeasonalState({
        ...INITIAL_SEASONAL_STATE,
        ...cloud.seasonalState,
      });
    }

    if (cloud.missionsState) {
      setMissionsState({
        ...INITIAL_MISSIONS_STATE,
        ...cloud.missionsState,
      });
    }
  };

  // Hydrate from Cloud Firestore on initial boot & subscribe for live sync between devices
  useEffect(() => {
    let active = true;
    let unsubscribeLive: (() => void) | null = null;

    const bootstrapCloud = async () => {
      try {
        await testFirestoreConnection();
        const [cloud, cloudSubPhotos] = await Promise.all([
          loadCloudWorld() as Promise<CloudWorldPayload | null>,
          loadCloudPhotos(),
        ]);
        if (!active) return;

        if (cloudSubPhotos && cloudSubPhotos.length > 0) {
          setPhotos((prev) => mergeInitialItems(cloudSubPhotos, prev));
        }

        if (cloud && cloud.journeyStarted) {
          applyCloudPayload(cloud, false);
        }
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Sincronização inicial em nuvem aguardando:', err);
      } finally {
        cloudHydratedRef.current = true;
        if (active) {
          unsubscribeLive = subscribeCloudWorld((remoteCloud) => {
            if (!active || !cloudHydratedRef.current) return;
            applyCloudPayload(remoteCloud, true);
          });
        }
      }
    };

    bootstrapCloud();
    return () => {
      active = false;
      if (unsubscribeLive) unsubscribeLive();
    };
  }, []);

  // Init Google Auth listener (Drive backup integration)
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
        if (token) {
          syncDrivePhotosWithToken(token).catch(() => {});
        }
      },
      () => {
        setGoogleUser(null);
        setIsGoogleConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const syncDrivePhotosWithToken = async (token: string) => {
    try {
      setIsDriveSyncing(true);
      setDriveSyncProgress(null);
      setDriveSyncError(null);
      const drivePhotos = await fetchDriveFolderPhotos(
        TARGET_DRIVE_FOLDER_ID,
        token,
        (current, total) => setDriveSyncProgress({ current, total })
      );
      if (drivePhotos && drivePhotos.length > 0) {
        setPhotos((prev) => {
          const nonDrive = prev.filter((p) => !p.id.startsWith('drive-') && p.sourceType !== 'drive');
          return mergeInitialItems(drivePhotos, nonDrive);
        });
        await saveCloudPhotosBatch(drivePhotos);
        soundEngine.playSparkle();
        showToast(`${drivePhotos.length} fotos do Drive salvas para vocês dois! 📸✨`, '📸', 20);
      } else {
        showToast('Nenhuma imagem encontrada na pasta do Drive.', '📂');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar pasta do Google Drive';
      console.warn('Sync drive folder notice:', err);
      setDriveSyncError(msg);
      showToast('Erro ao sincronizar fotos do Google Drive.', '⚠️');
    } finally {
      setIsDriveSyncing(false);
      setDriveSyncProgress(null);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      setIsDriveSyncing(true);
      setDriveSyncError(null);
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setIsGoogleConnected(true);
        await syncDrivePhotosWithToken(result.accessToken);
        soundEngine.playSparkle();
        showToast('Google Drive conectado com sucesso! 💖', '✨');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível conectar ao Google Drive';
      console.error('Google drive sign in failed:', err);
      setDriveSyncError(msg);
      showToast('Erro ao conectar Google Drive. Tente novamente.', '⚠️');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    await googleLogout();
    setGoogleUser(null);
    setIsGoogleConnected(false);
    showToast('Google Drive desconectado.', '👋');
  };

  const syncDrivePhotos = async () => {
    const token = await getAccessToken();
    if (!token) {
      await connectGoogleDrive();
      return;
    }
    await syncDrivePhotosWithToken(token);
  };

  // Save ONLY after Samella has scanned/unlocked the world (journeyStarted === true)
  useEffect(() => {
    if (!journeyStarted) return;

    const stateToSave = {
      journeyStarted: true,
      config,
      coins,
      currentDailyIndex,
      letters,
      photos,
      songs,
      achievements,
      storeItems,
      kitten,
      chatMessages,
      easterEggs,
      treeWaterCount,
      treeState,
      phrases,
      gameRecords,
      customQuizQuestions,
      timeCapsules,
      coupleGoals,
      calendarEvents,
      dailyWheel,
      dreamHouse,
      aquarium,
      seasonalState,
      missionsState,
      legacyResetBackup,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      try {
        const compactPhotos = photos.filter((p) => !p.url.startsWith('data:') || p.url.length < 25000);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stateToSave, photos: compactPhotos }));
      } catch {
        // storage quota or private mode
      }
    }

    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      saveCloudWorld({
        journeyStarted: true,
        coins,
        treeWaterCount,
        currentDailyIndex,
        config,
        treeState,
        kitten,
        letters,
        achievements,
        storeItems,
        easterEggs,
        phrases,
        chatMessages,
        gameRecords,
        photos,
        songs,
        customQuizQuestions,
        timeCapsules,
        coupleGoals,
        calendarEvents,
        dailyWheelState: dailyWheel,
        dreamHouseState: dreamHouse,
        aquariumState: aquarium,
        seasonalState,
        missionsState,
        legacyResetBackup,
        initialPhotoIds: INITIAL_PHOTO_IDS,
        initialSongIds: INITIAL_SONG_IDS,
      })
        .then(() => setIsCloudSynced(true))
        .catch((err) => {
          console.warn('Cloud sync deferred:', err);
        });
    }, 900);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    journeyStarted,
    config,
    coins,
    currentDailyIndex,
    letters,
    photos,
    songs,
    achievements,
    storeItems,
    kitten,
    chatMessages,
    easterEggs,
    treeWaterCount,
    treeState,
    phrases,
    gameRecords,
    customQuizQuestions,
    timeCapsules,
    coupleGoals,
    calendarEvents,
    dailyWheel,
    dreamHouse,
    aquarium,
    seasonalState,
    missionsState,
    legacyResetBackup,
  ]);

  // Passive gentle energy recharge while pet sleeps in Quarto
  useEffect(() => {
    if (!kitten.isSleeping) return;
    const sleepTimer = window.setInterval(() => {
      setKitten((prev) => {
        if (!prev.isSleeping || prev.energy >= 100) return prev;
        return {
          ...prev,
          energy: Math.min(100, prev.energy + 3),
        };
      });
    }, 2500);
    return () => clearInterval(sleepTimer);
  }, [kitten.isSleeping]);

  // Sync realAudio engine state (YouTube IFrame + HTML5 audio) & auto-advance / auto-skip invalid
  useEffect(() => {
    const unsubscribe = realAudio.subscribe(() => {
      const st = realAudio.getState();
      setPlaybackTime(st.currentTime);
      setIsPlaying(st.isPlaying);
      if (st.duration > 0 && currentSongRef.current && Math.abs(st.duration - (currentSongRef.current.duration || 0)) > 1.5) {
        const trueDur = Math.round(st.duration);
        const mins = Math.floor(trueDur / 60);
        const secs = trueDur % 60;
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        const songId = currentSongRef.current.id;
        setCurrentSong((prev) => (prev && prev.id === songId ? { ...prev, duration: trueDur, durationFormatted: formatted } : prev));
        setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, duration: trueDur, durationFormatted: formatted } : s)));
      }
    });

    const handleEnded = () => {
      const list = songsRef.current;
      const cur = currentSongRef.current;
      if (!cur || list.length === 0) {
        setIsPlaying(false);
        return;
      }
      if (isLoopRef.current) {
        realAudio.seek(0);
        realAudio.play();
        return;
      }
      if (list.length === 1) {
        setIsPlaying(false);
        setPlaybackTime(0);
        return;
      }
      const curIdx = list.findIndex((s) => s.id === cur.id);
      let nextIdx = (curIdx + 1) % list.length;
      if (isShuffleRef.current && list.length > 1) {
        let pick = Math.floor(Math.random() * list.length);
        if (pick === curIdx) pick = (pick + 1) % list.length;
        nextIdx = pick;
      }
      const nextItem = list[nextIdx];
      setCurrentSong(nextItem);
      setPlaybackTime(0);
      setIsPlaying(true);
      realAudio.playSong(nextItem, true);
    };

    const handleInvalid = (ev: Event) => {
      const customEv = ev as CustomEvent<{ songId?: string }>;
      const badId = customEv.detail?.songId || currentSongRef.current?.id;
      if (badId) {
        invalidSkippedIdsRef.current.add(badId);
      }
      const list = songsRef.current;
      const cur = currentSongRef.current;
      const curIdx = cur ? list.findIndex((s) => s.id === cur.id) : -1;

      let candidate: Song | null = null;
      for (let offset = 1; offset <= list.length; offset++) {
        const idx = (curIdx + offset + list.length) % list.length;
        const item = list[idx];
        if (item && !invalidSkippedIdsRef.current.has(item.id)) {
          candidate = item;
          break;
        }
      }

      if (candidate) {
        setCurrentSong(candidate);
        setPlaybackTime(0);
        realAudio.playSong(candidate, true);
      } else {
        setIsPlaying(false);
        realAudio.pause();
        invalidSkippedIdsRef.current.clear();
        showToast('Nenhuma faixa válida pronta para tocar. Adicione um link do YouTube ou MP3!', '🎵');
      }
    };

    window.addEventListener('realaudio:ended', handleEnded);
    window.addEventListener('realaudio:invalid', handleInvalid as EventListener);
    return () => {
      unsubscribe();
      window.removeEventListener('realaudio:ended', handleEnded);
      window.removeEventListener('realaudio:invalid', handleInvalid as EventListener);
    };
  }, []);

  const showToast = (text: string, icon = '💖', reward?: number) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ text, icon, reward });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const [heartRainTriggerCount, setHeartRainTriggerCount] = useState(0);

  const triggerHeartExplosion = (_x = 0.5, _y = 0.5) => {
    soundEngine.playHeartPop();
    setHeartRainTriggerCount((prev) => prev + 1);
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    try {
      if (loggedIn) {
        localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(UNLOCK_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
    if (loggedIn) {
      setIsLoadingDone(true);
      if (!journeyStarted) {
        setJourneyStarted(true);
        // Unlock first welcome achievement when Samella scans & unlocks for the very first time
        setTimeout(() => {
          unlockAchievement('ach-welcome');
        }, 500);
      }
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    soundEngine.playHeartPop();
    setActiveTabState(tab);
    setExtendedViewState(tab);
  };

  const setExtendedView = (view: ExtendedView) => {
    soundEngine.playHeartPop();
    if (view === 'config') {
      setIsDrawerOpen(false);
      setIsSettingsOpen(true);
      return;
    }
    setExtendedViewState(view);
    setIsDrawerOpen(false);
    if (['inicio', 'cartas', 'fotos', 'musica', 'perfil'].includes(view)) {
      setActiveTabState(view as ActiveTab);
    }
  };

  const addCoins = (amount: number, reason?: string) => {
    soundEngine.playSparkle();
    setCoins((prev) => prev + amount);
    showToast(reason ? `${reason} (+${amount} 💎)` : `+${amount} Diamantes!`, '💎', amount);
  };

  const spendCoins = (amount: number): boolean => {
    if (coins >= amount) {
      soundEngine.playSparkle();
      setCoins((prev) => prev - amount);
      return true;
    }
    showToast('Diamantes insuficientes! Complete mais momentos juntos para ganhar.', '💎');
    return false;
  };

  const unlockAchievement = (id: string) => {
    if (claimedAchievementIdsRef.current.has(id)) return;
    const target = achievements.find((a) => a.id === id);
    if (!target || target.unlocked || target.rewardClaimed) {
      claimedAchievementIdsRef.current.add(id);
      return;
    }

    claimedAchievementIdsRef.current.add(id);
    const rewardToGrant = target.rewardCoins;
    const unlockedTitle = target.title;

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id !== id) return ach;
        if (ach.unlocked || ach.rewardClaimed) return ach;
        return {
          ...ach,
          unlocked: true,
          rewardClaimed: true,
          unlockedAt: ach.unlockedAt || new Date().toLocaleDateString('pt-BR'),
          progress: ach.maxProgress,
        };
      })
    );

    if (rewardToGrant > 0) {
      addCoins(rewardToGrant, `Conquista: ${unlockedTitle}`);
      triggerHeartExplosion();
    }
  };

  const nextDailyMessage = () => {
    soundEngine.playHeartPop();
    if (dailyMessages.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * dailyMessages.length);
    let attempts = 0;
    while (nextIdx === currentDailyIndex && attempts < 10) {
      nextIdx = Math.floor(Math.random() * dailyMessages.length);
      attempts++;
    }
    setCurrentDailyIndex(nextIdx);
  };

  const prevDailyMessage = () => {
    soundEngine.playHeartPop();
    setCurrentDailyIndex((prev) => (prev - 1 + dailyMessages.length) % dailyMessages.length);
  };

  const toggleFavoritePhrase = (id: string) => {
    soundEngine.playHeartPop();
    setPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const markLetterRead = (id: string) => {
    const target = letters.find((l) => l.id === id);
    if (!target) return;

    const alreadyClaimed =
      target.read || target.rewardClaimed || claimedLetterIdsRef.current.has(id);
    claimedLetterIdsRef.current.add(id);

    setLetters((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          read: true,
          rewardClaimed: true,
          unsealedAt: l.unsealedAt || new Date().toLocaleDateString('pt-BR'),
        };
      })
    );

    if (!alreadyClaimed && target.rewardCoins > 0) {
      addCoins(target.rewardCoins, `Carta lida: "${target.title}"`);
      unlockAchievement('ach-first-letter');
    }
  };

  const toggleFavoriteLetter = (id: string) => {
    soundEngine.playHeartPop();
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  const addCustomLetter = (newLetterData: Omit<Letter, 'id' | 'read' | 'isFavorite'>) => {
    const newLetter: Letter = {
      ...newLetterData,
      id: `letter-${Date.now()}`,
      read: true,
      isFavorite: false,
      sentAt: newLetterData.sentAt || new Date().toISOString(),
    };
    setLetters((prev) => [newLetter, ...prev]);
    showToast('Nova carta adicionada com sucesso! 💌');
  };

  const sendTwoWayLetter = ({
    sender,
    recipient,
    title,
    excerpt,
    content,
    isPrivate = false,
    tags = ['Com Amor'],
  }: {
    sender: CouplePerson;
    recipient: CouplePerson;
    title: string;
    excerpt?: string;
    content: string;
    isPrivate?: boolean;
    tags?: string[];
  }) => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) return;

    soundEngine.playSparkle();
    const now = new Date();
    const formattedDate = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const autoExcerpt =
      excerpt && excerpt.trim()
        ? excerpt.trim()
        : cleanContent.slice(0, 110) + (cleanContent.length > 110 ? '...' : '');

    const newLetter: Letter = {
      id: `letter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      date: formattedDate,
      sentAt: now.toISOString(),
      excerpt: autoExcerpt,
      content: cleanContent,
      read: false,
      isFavorite: false,
      rewardCoins: 5,
      tags,
      authorName: sender,
      sender,
      recipient,
      isPrivate,
    };

    setLetters((prev) => [newLetter, ...prev]);
    setMissionsState((prev) => ({
      ...prev,
      twoWayLettersSent: (prev.twoWayLettersSent || 0) + 1,
    }));
    triggerHeartExplosion(0.5, 0.45);
    showToast(`Carta de ${sender} enviada para ${recipient}!`, '💌');
  };

  const deleteLetter = (id: string) => {
    soundEngine.playHeartPop();
    setLetters((prev) => prev.filter((l) => l.id !== id));
    setSelectedLetter((cur) => (cur?.id === id ? null : cur));
    showToast('Carta removida da caixa de correspondência.');
  };

  const toggleFavoritePhoto = (id: string) => {
    soundEngine.playHeartPop();
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, isFavorite: !p.isFavorite };
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
  };

  const updatePhotoUrl = (id: string, url: string, title?: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, url, title: title || p.title };
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
    showToast('Foto atualizada com sucesso! 📸');
  };

  const editPhoto = (id: string, updates: Partial<MemoryPhoto>) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
    showToast('Detalhes da foto atualizados! ✨');
  };

  const togglePhotoInLoop = (id: string) => {
    soundEngine.playHeartPop();
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, inHomeLoop: !p.inHomeLoop };
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
  };

  const addPhoto = (newPhotoData: Omit<MemoryPhoto, 'id' | 'index'>) => {
    soundEngine.playSparkle();
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);
    const newPhoto: MemoryPhoto = {
      ...newPhotoData,
      id: `photo-${Date.now()}-${uniqueSuffix}`,
      index: photos.length + 1,
      isFavorite: false,
      inHomeLoop: newPhotoData.inHomeLoop ?? true,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    if (newPhoto.url && !newPhoto.url.startsWith('idb://')) {
      saveCloudPhoto(newPhoto).catch(() => {});
    }
    showToast('Nova foto adicionada ao álbum! 📸✨');
    unlockAchievement('ach-photo-album');
  };

  const removePhoto = (id: string) => {
    soundEngine.playHeartPop();
    const target = photos.find((p) => p.id === id);
    if (target?.url.startsWith('idb://')) {
      deleteMediaBlob(target.url).catch(() => {});
    }
    if (!INITIAL_PHOTO_IDS.has(id)) {
      deleteCloudPhoto(id).catch(() => {});
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Foto removida da galeria.');
  };

  const playSong = (song?: Song) => {
    const target = song || currentSong || songs[0] || null;
    if (!target) {
      showToast('Adicione uma música pelo YouTube ou arquivo para ouvir ♡', '🎵');
      return;
    }
    invalidSkippedIdsRef.current.clear();
    setCurrentSong(target);
    setIsPlaying(true);
    realAudio.playSong(target, true);
    unlockAchievement('ach-first-song');
  };

  const pauseSong = () => {
    setIsPlaying(false);
    realAudio.pause();
    soundEngine.pauseCustomAudio();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong(currentSong || songs[0]);
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    const curIdx = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;
    let nextIdx = (curIdx + 1) % songs.length;
    if (isShuffle && songs.length > 1) {
      let pick = Math.floor(Math.random() * songs.length);
      if (pick === curIdx) pick = (pick + 1) % songs.length;
      nextIdx = pick;
    }
    const nextItem = songs[nextIdx];
    setCurrentSong(nextItem);
    setPlaybackTime(0);
    if (isPlaying) {
      realAudio.playSong(nextItem, true);
    }
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    const curIdx = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : 0;
    const prevIdx = (curIdx - 1 + songs.length) % songs.length;
    const prevItem = songs[prevIdx];
    setCurrentSong(prevItem);
    setPlaybackTime(0);
    if (isPlaying) {
      realAudio.playSong(prevItem, true);
    }
  };

  const seekSong = (time: number) => {
    setPlaybackTime(time);
    realAudio.seek(time);
  };

  const toggleShuffle = () => {
    soundEngine.playHeartPop();
    setIsShuffle((prev) => !prev);
  };

  const toggleLoop = () => {
    soundEngine.playHeartPop();
    setIsLoop((prev) => !prev);
  };

  const toggleFavoriteSong = (id: string) => {
    soundEngine.playHeartPop();
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const addSong = (newSongData: Omit<Song, 'id'>) => {
    soundEngine.playSparkle();
    invalidSkippedIdsRef.current.clear();
    const newSong: Song = {
      ...newSongData,
      id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      isFavorite: false,
    };
    setSongs((prev) => [...prev, newSong]);
    setCurrentSong((prev) => prev || newSong);
    showToast(`Música "${newSong.title}" adicionada e salva para o casal! 🎵✨`);
  };

  const editSong = (id: string, updates: Partial<Song>) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    setCurrentSong((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    showToast('Música atualizada! 🎶');
  };

  const removeSong = (id: string) => {
    soundEngine.playHeartPop();
    const target = songs.find((s) => s.id === id);
    if (target?.audioUrl?.startsWith('idb://')) {
      deleteMediaBlob(target.audioUrl).catch(() => {});
    }
    const remaining = songs.filter((s) => s.id !== id);
    setSongs(remaining);
    if (currentSong?.id === id) {
      const next = remaining[0] || null;
      setCurrentSong(next);
      setPlaybackTime(0);
      if (!next) {
        setIsPlaying(false);
        realAudio.stopAll();
      } else if (isPlaying) {
        realAudio.playSong(next, true);
      }
    }
    showToast('Música removida da playlist.');
  };

  const buyStoreItem = (id: string): boolean => {
    const item = storeItems.find((i) => i.id === id);
    if (!item) return false;
    if (item.purchased) {
      showToast('Item já adquirido e ativo! ✨', '🛍️');
      return true;
    }
    if (spendCoins(item.price)) {
      setStoreItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, purchased: true, equipped: true } : i))
      );

      // Handle pet adoption: keep name empty/custom so user names it themselves
      if (item.category === 'pets' || (item.petTypeTarget && item.petTypeTarget !== 'all')) {
        const targetType = (item.petTypeTarget || 'cat') as PetType;
        setKitten((prev) => {
          const owned = prev.ownedPets || ['cat'];
          const newOwned = owned.includes(targetType) ? owned : [...owned, targetType];
          const existingCustom = prev.customNames?.[targetType] || '';
          return {
            ...prev,
            ownedPets: newOwned,
            petType: targetType,
            name: existingCustom,
            mood: 'feliz',
          };
        });
      }

      // Handle tree unlocks
      if (item.slotType === 'tree') {
        setTreeState((prev) => {
          if (item.id === 'item-tree-fairy-lights') {
            return { ...prev, lightsEnabled: true };
          }
          if (
            item.id === 'item-tree-magic-butterfly' &&
            !prev.creaturesUnlocked.includes('Borboleta Lilás')
          ) {
            return {
              ...prev,
              creaturesUnlocked: [...prev.creaturesUnlocked, 'Borboleta Lilás'],
            };
          }
          if (
            item.id === 'item-tree-songbird' &&
            !prev.creaturesUnlocked.includes('Passarinho Cantor')
          ) {
            return {
              ...prev,
              creaturesUnlocked: [...prev.creaturesUnlocked, 'Passarinho Cantor'],
            };
          }
          return prev;
        });
      }

      // Handle Dream House 3D furniture & wall unlocks
      if (item.slotType === 'house-furniture' && item.targetId) {
        const furnId = item.targetId;
        const furnInfo = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnId);
        setDreamHouse((prev) => {
          const unlocked = prev.unlockedFurnitureIds.includes(furnId)
            ? prev.unlockedFurnitureIds
            : [...prev.unlockedFurnitureIds, furnId];
          const room = furnInfo?.room || 'sala';
          const currentRoomPlaced = prev.placedFurniture[room] || [];
          const nextRoomPlaced = currentRoomPlaced.includes(furnId)
            ? currentRoomPlaced
            : [...currentRoomPlaced, furnId];
          return {
            ...prev,
            unlockedFurnitureIds: unlocked,
            placedFurniture: {
              ...prev.placedFurniture,
              [room]: nextRoomPlaced,
            },
            comfortLevel: Math.min(10, prev.comfortLevel + 1),
          };
        });
      }

      if (item.slotType === 'house-wall' && item.targetId) {
        const wallId = item.targetId as HouseWallTheme;
        setDreamHouse((prev) => ({
          ...prev,
          wallTheme: wallId,
        }));
      }

      // Handle Aquarium 3D fish & decor unlocks
      if (item.slotType === 'aquarium-fish' && item.targetId) {
        const fishId = item.targetId;
        setAquarium((prev) => ({
          ...prev,
          unlockedFishIds: prev.unlockedFishIds.includes(fishId)
            ? prev.unlockedFishIds
            : [...prev.unlockedFishIds, fishId],
          activeFishIds: prev.activeFishIds.includes(fishId)
            ? prev.activeFishIds
            : [...prev.activeFishIds, fishId],
        }));
      }

      if (item.slotType === 'aquarium-decor' && item.targetId) {
        const decorId = item.targetId;
        setAquarium((prev) => ({
          ...prev,
          unlockedDecorIds: prev.unlockedDecorIds.includes(decorId)
            ? prev.unlockedDecorIds
            : [...prev.unlockedDecorIds, decorId],
          activeDecorIds: prev.activeDecorIds.includes(decorId)
            ? prev.activeDecorIds
            : [...prev.activeDecorIds, decorId],
        }));
      }

      soundEngine.playSparkle();
      unlockAchievement('ach-first-purchase');
      triggerHeartExplosion();
      showToast(`Adquiriu "${item.title}"!`, item.icon);
      return true;
    }
    return false;
  };

  const redeemVoucher = (id: string) => {
    soundEngine.playSparkle();
    triggerHeartExplosion();
    setStoreItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              redeemed: true,
              redeemedAt: new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : item
      )
    );
    showToast('Vale Amoroso resgatado com sucesso! Gabriel já foi notificado ❤️', '🎉');
  };

  const gainKittenXp = (amount: number) => {
    let leveledUpTo = 0;
    let displayPet = '';

    setKitten((prev) => {
      let newXp = (prev.xp || 0) + amount;
      let newLevel = prev.level || 1;
      let newMaxXp = prev.maxXp || 100;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.35);
        leveledUpTo = newLevel;
      }

      displayPet = getSpeciesDisplayName(prev.petType, prev.name);

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
      };
    });

    if (leveledUpTo > 0) {
      soundEngine.playSparkle();
      triggerHeartExplosion();
      addCoins(8, `${displayPet} subiu para o Nível ${leveledUpTo}!`);
    }
  };

  const petKitten = () => {
    soundEngine.playPurr();
    triggerHeartExplosion(0.5, 0.4);
    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_pet');
    if (rem > 0) {
      showToast(`Carinho retribuído! Próximo bônus em ${formatCooldownMs(rem)} ⏳`, '🐾');
      return;
    }

    let reached10 = false;
    let petLabel = 'seu mascote';

    setKitten((prev) => {
      const newPetCount = (prev.petCount || 0) + 1;
      petLabel = getSpeciesDisplayName(prev.petType, prev.name);
      if (newPetCount === 10) reached10 = true;

      return {
        ...prev,
        happiness: Math.min(100, (prev.happiness || 50) + 8),
        fun: Math.min(100, (prev.fun || 50) + 6),
        affectionLevel: (prev.affectionLevel || 0) + 1,
        mood: 'ronronando',
        petCount: newPetCount,
        cooldowns: {
          ...(prev.cooldowns || {}),
          pet_pet: Date.now() + COOLDOWN_MS.pet_pet,
        },
      };
    });

    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-pet-cat' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, a.progress + 1) }
          : a
      )
    );

    if (reached10) unlockAchievement('ach-pet-cat');
    addCoins(1, `Carinho em ${petLabel}`);
    gainKittenXp(8);
  };

  const feedKitten = (foodName = 'Comidinha Especial', hungerBoost = 30, happyBoost = 10): boolean => {
    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_feed');
    if (rem > 0) {
      showToast(`Cheio por agora! Alimente de novo em ${formatCooldownMs(rem)} ⏳`, '🍽️');
      return false;
    }

    soundEngine.playEat();
    triggerHeartExplosion(0.5, 0.4);
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      hunger: Math.min(100, (prev.hunger || 50) + hungerBoost),
      happiness: Math.min(100, (prev.happiness || 50) + happyBoost),
      mood: 'feliz',
      isEating: true,
      lastFed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cooldowns: {
        ...(prev.cooldowns || {}),
        pet_feed: Date.now() + COOLDOWN_MS.pet_feed,
      },
    }));
    gainKittenXp(12);
    addCoins(2, `${label} saboreou ${foodName}`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isEating: false }));
    }, 1800);
    return true;
  };

  const giveWaterKitten = (): boolean => {
    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_water');
    if (rem > 0) {
      showToast(`Hidratado! Próxima água em ${formatCooldownMs(rem)} ⏳`, '💧');
      return false;
    }

    soundEngine.playDrink();
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      thirst: Math.min(100, (prev.thirst || 50) + 35),
      happiness: Math.min(100, (prev.happiness || 50) + 6),
      mood: 'feliz',
      isDrinking: true,
      cooldowns: {
        ...(prev.cooldowns || {}),
        pet_water: Date.now() + COOLDOWN_MS.pet_water,
      },
    }));
    gainKittenXp(8);
    addCoins(1, `${label} bebeu água fresquinha`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isDrinking: false }));
    }, 1600);
    return true;
  };

  const batheKitten = (boostAmount = 100): boolean => {
    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_bath');
    if (rem > 0) {
      showToast(`Limpinho! Próximo banho em ${formatCooldownMs(rem)} ⏳`, '🛁');
      return false;
    }

    soundEngine.playBathSplash();
    triggerHeartExplosion(0.5, 0.4);
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      hygiene: boostAmount >= 100 ? 100 : Math.min(100, (prev.hygiene || 50) + boostAmount),
      happiness: Math.min(100, (prev.happiness || 50) + 10),
      mood: 'feliz',
      isBathing: true,
      lastBathed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cooldowns: {
        ...(prev.cooldowns || {}),
        pet_bath: Date.now() + COOLDOWN_MS.pet_bath,
      },
    }));
    gainKittenXp(14);
    addCoins(2, `${label} tomou um banho cheiroso`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isBathing: false }));
    }, 2000);
    return true;
  };

  const toggleSleepKitten = (): boolean => {
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    if (!kitten.isSleeping) {
      const rem = getCooldownRemaining(kitten.cooldowns, 'pet_sleep');
      if (rem > 0) {
        showToast(`Sem soninho ainda! Descanso disponível em ${formatCooldownMs(rem)} ⏳`, '🌙');
        return false;
      }
      soundEngine.playSleepSnore();
      showToast(`${label} apagou o abajur para descansar... 💤`, '🌙');
      setKitten((prev) => ({
        ...prev,
        isSleeping: true,
        mood: 'dormindo',
        energy: Math.min(100, (prev.energy || 50) + 15),
        lastSlept: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        cooldowns: {
          ...(prev.cooldowns || {}),
          pet_sleep: Date.now() + COOLDOWN_MS.pet_sleep,
        },
      }));
      return true;
    }

    soundEngine.playMeowHappy();
    showToast(`${label} acordou cheio de energia! ☀️`, '✨');
    setKitten((prev) => ({
      ...prev,
      isSleeping: false,
      mood: 'feliz',
      energy: Math.min(100, (prev.energy || 50) + 25),
    }));
    return true;
  };

  const playWithKitten = (toyName = 'Novelo de Lã', source: 'toy' | 'dance' = 'toy'): boolean => {
    const cdKey = source === 'dance' ? 'pet_dance' : 'pet_play';
    const cdDuration = source === 'dance' ? COOLDOWN_MS.pet_dance : COOLDOWN_MS.pet_play;
    const rem = getCooldownRemaining(kitten.cooldowns, cdKey);
    if (rem > 0) {
      showToast(
        source === 'dance'
          ? `Descansando os passinhos! Nova dança premiada em ${formatCooldownMs(rem)} ⏳`
          : `Descansando da brincadeira! Disponível em ${formatCooldownMs(rem)} ⏳`,
        source === 'dance' ? '💃' : '🐾'
      );
      return false;
    }

    soundEngine.playToyBoing();
    triggerHeartExplosion(0.5, 0.4);
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      fun: Math.min(100, (prev.fun || 50) + 30),
      energy: Math.max(10, (prev.energy || 80) - 8),
      hygiene: Math.max(15, (prev.hygiene || 70) - 4),
      happiness: Math.min(100, (prev.happiness || 50) + 15),
      mood: 'brincalhao',
      isPlayMode: true,
      lastPlayed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cooldowns: {
        ...(prev.cooldowns || {}),
        [cdKey]: Date.now() + cdDuration,
      },
    }));
    gainKittenXp(15);
    addCoins(2, source === 'dance' ? `${label} arrasou na dança` : `${label} brincou com ${toyName}`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isPlayMode: false }));
    }, 2000);
    return true;
  };

  const equipKittenItem = (
    itemId: string,
    category: 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses'
  ) => {
    soundEngine.playHeartPop();
    setKitten((prev) => {
      if (category === 'hat') {
        const isCurrent = prev.equippedHat === itemId;
        return { ...prev, equippedHat: isCurrent ? '' : itemId };
      } else if (category === 'collar') {
        const isCurrent = prev.equippedCollar === itemId;
        return { ...prev, equippedCollar: isCurrent ? '' : itemId };
      } else if (category === 'glasses') {
        const isCurrent = prev.equippedGlasses === itemId;
        return { ...prev, equippedGlasses: isCurrent ? '' : itemId };
      } else if (category === 'accessory') {
        const isCurrent = prev.equippedAccessory === itemId;
        return { ...prev, equippedAccessory: isCurrent ? '' : itemId };
      } else {
        const isCurrent = prev.equippedOutfit === itemId;
        return { ...prev, equippedOutfit: isCurrent ? '' : itemId };
      }
    });
    showToast('Look do mascote atualizado! ✨', '🎀');
  };

  const switchPet = (petType: PetType) => {
    const species = PET_SPECIES_CATALOG.find((s) => s.type === petType);
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => {
      const savedName = prev.customNames?.[petType] || '';
      return {
        ...prev,
        petType,
        name: savedName,
        mood: 'feliz',
      };
    });
    const displayName = kitten.customNames?.[petType] || species?.name || 'Mascote';
    showToast(`Agora cuidando de ${displayName}! ${species?.emoji || '🐾'}`, species?.emoji || '🐾');
  };

  const renamePet = (newName: string) => {
    const cleaned = newName.trim();
    if (!cleaned) return;
    soundEngine.playHeartPop();
    setKitten((prev) => {
      const typeKey = (prev.petType || 'cat') as PetType;
      return {
        ...prev,
        name: cleaned,
        customNames: {
          ...(prev.customNames || {}),
          [typeKey]: cleaned,
        },
      };
    });
    showToast(`Nome salvo: "${cleaned}"! 💖`, '✨');
  };

  const adoptPet = (petType: PetType) => {
    const species = PET_SPECIES_CATALOG.find((s) => s.type === petType);
    setKitten((prev) => {
      const currentOwned = prev.ownedPets || ['cat'];
      const newOwned = currentOwned.includes(petType) ? currentOwned : [...currentOwned, petType];
      const existingName = prev.customNames?.[petType] || '';
      return {
        ...prev,
        ownedPets: newOwned,
        petType,
        name: existingName,
      };
    });
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    showToast(`Adotou ${species?.name || 'Novo Mascote'}! Escolha o nome dele(a)! 🎉`, species?.emoji || '🐾');
  };

  const applyTreeXpGain = (xpGain: number, careType: 'water' | 'sun' | 'prune', cdKey: string, cdDuration: number) => {
    let evolvedTo = 0;

    setTreeState((prev) => {
      let newXp = (prev.xp || 0) + xpGain;
      let newLevel = prev.level || 1;
      let newMaxXp = prev.maxXp || 100;

      while (newXp >= newMaxXp && newLevel < 10) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.25);
        evolvedTo = newLevel;
      }

      if (newLevel >= 10) {
        newXp = Math.min(newXp, newMaxXp);
      }

      return {
        ...prev,
        waterCount: careType === 'water' ? (prev.waterCount || 0) + 1 : prev.waterCount || 0,
        sunCount: careType === 'sun' ? (prev.sunCount || 0) + 1 : prev.sunCount || 0,
        pruneCount: careType === 'prune' ? (prev.pruneCount || 0) + 1 : prev.pruneCount || 0,
        xp: newXp,
        maxXp: newMaxXp,
        level: newLevel,
        stageName: getTreeStageName(newLevel),
        lastWatered:
          careType === 'water'
            ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : prev.lastWatered,
        cooldowns: {
          ...(prev.cooldowns || {}),
          [cdKey]: Date.now() + cdDuration,
        },
      };
    });

    if (evolvedTo > 0) {
      addCoins(8, `Árvore do Amor evoluiu para Nv.${evolvedTo} 🌳`);
      if (evolvedTo >= 2) unlockAchievement('ach-tree-lvl2');
      if (evolvedTo >= 5) unlockAchievement('ach-tree-lvl5');
      if (evolvedTo >= 8) unlockAchievement('ach-tree-lvl8');
      if (evolvedTo >= 10) unlockAchievement('ach-tree-lvl10');
    }
  };

  const waterLoveTree = (): boolean => {
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_water');
    if (rem > 0) {
      showToast(`Solo bem regado! Próxima rega em ${formatCooldownMs(rem)} ⏳`, '💧');
      return false;
    }
    soundEngine.playWaterDrop();
    setTreeWaterCount((prev) => prev + 1);
    applyTreeXpGain(25, 'water', 'tree_water', COOLDOWN_MS.tree_water);
    unlockAchievement('ach-tree-water');
    addCoins(2, 'Regou a Árvore do Amor 🌱');
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const sunLoveTree = (): boolean => {
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_sun');
    if (rem > 0) {
      showToast(`Raios absorvidos! Novo banho de sol em ${formatCooldownMs(rem)} ⏳`, '☀️');
      return false;
    }
    soundEngine.playSparkle();
    applyTreeXpGain(20, 'sun', 'tree_sun', COOLDOWN_MS.tree_sun);
    triggerHeartExplosion(0.5, 0.3);
    addCoins(1, 'Banho de Sol na Árvore ☀️');
    return true;
  };

  const pruneLoveTree = (): boolean => {
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_prune');
    if (rem > 0) {
      showToast(`Folhagem cuidada! Nova poda em ${formatCooldownMs(rem)} ⏳`, '🌿');
      return false;
    }
    soundEngine.playHeartPop();
    applyTreeXpGain(15, 'prune', 'tree_prune', COOLDOWN_MS.tree_prune);
    triggerHeartExplosion(0.5, 0.35);
    addCoins(1, 'Cuidado de Jardinagem 🌿');
    return true;
  };

  const addPromiseRibbon = (promiseText: string): boolean => {
    if (!promiseText.trim()) return false;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_ribbon');
    if (rem > 0) {
      showToast(`Aguarde ${formatCooldownMs(rem)} para amarrar outra fita 🎀`, '⏳');
      return false;
    }
    soundEngine.playSparkle();
    setTreeState((prev) => ({
      ...prev,
      promiseRibbons: [...(prev.promiseRibbons || []), promiseText.trim()],
      cooldowns: {
        ...(prev.cooldowns || {}),
        tree_ribbon: Date.now() + COOLDOWN_MS.tree_ribbon,
      },
    }));
    addCoins(3, 'Fita de Promessa amarrada nos galhos 🎀');
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const harvestTreeFruit = (index: number): string | null => {
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_fruit');
    if (rem > 0) {
      showToast(`Novos frutos amadurecendo! Volte em ${formatCooldownMs(rem)} ⏳`, '🍎');
      return null;
    }
    const fruitMessages = [
      '“Você é o amor mais doce que a vida me deu.” 💖',
      '“Seu riso tem gosto de felicidade plena.” ✨',
      '“Amo a mulher forte e bondosa que você é.” 🌹',
      '“Hoje e sempre, meu coração bate no compasso do seu.” 🍎',
      '“Obrigado por ser minha melhor companhia de todos os dias.” 🍓',
    ];
    soundEngine.playFruitHarvest();
    triggerHeartExplosion(0.5, 0.45);
    setTreeState((prev) => ({
      ...prev,
      fruitsHarvested: (prev.fruitsHarvested || 0) + 1,
      cooldowns: {
        ...(prev.cooldowns || {}),
        tree_fruit: Date.now() + COOLDOWN_MS.tree_fruit,
      },
    }));
    addCoins(2, 'Colheu um Fruto do Amor');
    return fruitMessages[index % fruitMessages.length];
  };

  const plantLoveSeed = (): boolean => {
    const level = treeState.level || 1;
    if (level >= 10) {
      showToast('A Árvore do Amor já atingiu a plenitude no Nível 10! 🌌✨', '🌳');
      return false;
    }
    const seedCost = 100;
    if (!spendCoins(seedCost)) {
      return false;
    }
    soundEngine.playSparkle();
    applyTreeXpGain(50, 'water', 'tree_seed', 0);
    unlockAchievement('ach-tree-water');
    triggerHeartExplosion(0.5, 0.4);
    showToast('Nova semente plantada! A Árvore recebeu +50 XP ✨', '🌱');
    return true;
  };

  const sendChatMessage = (text: string) => {
    soundEngine.playHeartPop();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      hasHeart: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const partnerReplies = [
        'Você é o amor da minha vida inteira! 💖',
        'Meu coração fica quentinho quando você me manda mensagem ♡',
        'Te amo tanto tanto tanto!',
        'Mal posso esperar para te ver e te dar um abraço bem apertado!',
        'Você é tudo pra mim, sabia? 🥰',
      ];
      const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'partner',
        text: randomReply,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        hasHeart: true,
      };
      setChatMessages((p) => [...p, replyMsg]);
      soundEngine.playSparkle();
    }, 1800);
  };

  const triggerEasterEgg = (id: string) => {
    const egg = easterEggs.find((e) => e.id === id);
    if (!egg) return;

    const alreadyClaimed =
      egg.discovered || egg.rewardClaimed || claimedEasterEggIdsRef.current.has(id);

    if (!alreadyClaimed) {
      claimedEasterEggIdsRef.current.add(id);
      const todayLabel = new Date().toLocaleDateString('pt-BR');
      setEasterEggs((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                discovered: true,
                rewardClaimed: true,
                discoveredAt: e.discoveredAt || todayLabel,
              }
            : e
        )
      );
      addCoins(egg.rewardCoins, `Easter Egg Descoberto!`);
      unlockAchievement('ach-easter-egg');
      setRecentEasterEgg({ ...egg, discovered: true, rewardClaimed: true, justDiscovered: true });
      triggerHeartExplosion();
    } else {
      setRecentEasterEgg({ ...egg, discovered: true, rewardClaimed: true, justDiscovered: false });
      soundEngine.playHeartPop();
    }
  };

  const closeEasterEggModal = () => {
    setRecentEasterEgg(null);
  };

  const updateConfig = (newConfig: Partial<CoupleConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    showToast('Configurações atualizadas! 💖');
  };

  const updateGameRecord = (partial: Partial<GameRecords>) => {
    setGameRecords((prev) => ({ ...prev, ...partial }));
  };

  const addQuizQuestion = (q: Omit<QuizQuestion, 'id' | 'isCustom'>) => {
    soundEngine.playSparkle();
    const item: QuizQuestion = {
      ...q,
      id: `quiz-custom-${Date.now()}`,
      isCustom: true,
    };
    setCustomQuizQuestions((prev) => [item, ...prev]);
    showToast('Pergunta adicionada ao Mega Quiz! 🎯');
  };

  const removeQuizQuestion = (id: string) => {
    setCustomQuizQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast('Pergunta removida do Quiz.');
  };

  const addTimeCapsule = (capsule: Omit<TimeCapsuleItem, 'id' | 'createdAt'>) => {
    soundEngine.playSparkle();
    const item: TimeCapsuleItem = {
      ...capsule,
      id: `capsule-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTimeCapsules((prev) => [item, ...prev]);
    showToast('Nova mensagem guardada na Cápsula do Tempo! ⏳💖');
  };

  const removeTimeCapsule = (id: string) => {
    setTimeCapsules((prev) => prev.filter((c) => c.id !== id));
    showToast('Cápsula removida.');
  };

  const addCoupleGoal = (goal: Omit<CoupleGoal, 'id' | 'completed'>) => {
    soundEngine.playSparkle();
    const item: CoupleGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      completed: false,
      rewardClaimed: false,
    };
    setCoupleGoals((prev) => [item, ...prev]);
    showToast('Novo desejo adicionado à lista do casal! ✨');
  };

  const updateCoupleGoal = (id: string, updates: Partial<CoupleGoal>) => {
    soundEngine.playHeartPop();
    setCoupleGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Desejo atualizado! ✨');
  };

  const toggleCoupleGoal = (id: string) => {
    soundEngine.playHeartPop();
    const target = coupleGoals.find((g) => g.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const canReward =
      nextCompleted && !target.rewardClaimed && !claimedGoalIdsRef.current.has(id);

    if (canReward) {
      claimedGoalIdsRef.current.add(id);
    }

    setCoupleGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toLocaleDateString('pt-BR') : undefined,
          rewardClaimed: g.rewardClaimed || canReward,
        };
      })
    );

    if (canReward) {
      triggerHeartExplosion();
      addCoins(5, 'Desejo do casal realizado!');
    } else if (nextCompleted) {
      showToast('Desejo marcado como realizado! (Recompensa única já resgatada)', '✅');
    }
  };

  const removeCoupleGoal = (id: string) => {
    setCoupleGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Item removido da lista de desejos.');
  };

  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    soundEngine.playSparkle();
    const newEvent: CalendarEvent = {
      ...ev,
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
    triggerHeartExplosion();
    showToast(`Evento "${newEvent.title}" salvo no Calendário do Casal! 📅💖`, '📅');
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    soundEngine.playHeartPop();
    setCalendarEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev))
    );
    showToast('Evento atualizado no calendário! 📅');
  };

  const removeCalendarEvent = (id: string) => {
    soundEngine.playHeartPop();
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
    showToast('Evento removido do calendário.');
  };

  const spinDailyWheel = (prizeLabel: string, coinReward: number): boolean => {
    const now = Date.now();
    const effectiveLastSpin = Math.max(
      dailyWheel.lastSpinAt || 0,
      lastWheelSpinRef.current,
      readWheelSpinFloor()
    );
    const elapsed = now - effectiveLastSpin;
    if (effectiveLastSpin > 0 && elapsed < COOLDOWN_MS.wheel_spin) {
      const remMs = COOLDOWN_MS.wheel_spin - elapsed;
      const hrs = Math.floor(remMs / 3600000);
      const mins = Math.ceil((remMs % 3600000) / 60000);
      showToast(`Recompensa diária já resgatada! Volte em ${hrs}h ${mins}m ⏳`, '⏳');
      return false;
    }

    lastWheelSpinRef.current = now;
    writeWheelSpinFloor(now);

    setDailyWheel((prev) => ({
      lastSpinAt: now,
      lastPrize: prizeLabel,
      totalSpins: (prev.totalSpins || 0) + 1,
    }));
    if (coinReward > 0) {
      addCoins(coinReward, `Roleta Diária: ${prizeLabel}`);
    } else {
      soundEngine.playSparkle();
      showToast(`Roleta Diária: ${prizeLabel}`, '🎡');
    }
    triggerHeartExplosion();
    return true;
  };

  // --- DREAM HOUSE 3D ACTIONS ---
  const setHouseRoom = (room: HouseRoomId) => {
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, activeRoom: room }));
  };

  const setHouseWallTheme = (theme: HouseWallTheme) => {
    const wallMeta = HOUSE_WALL_THEMES.find((w) => w.id === theme);
    const storeItem = storeItems.find((s) => s.slotType === 'house-wall' && s.targetId === theme);
    if (wallMeta && !wallMeta.unlockedByDefault && storeItem && !storeItem.purchased) {
      showToast(`Desbloqueie "${wallMeta.label}" na Loja ou Missões!`, '🏠');
      return;
    }
    soundEngine.playSparkle();
    setDreamHouse((prev) => ({ ...prev, wallTheme: theme }));
  };

  const setHouseFloorTheme = (theme: HouseFloorTheme) => {
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, floorTheme: theme }));
  };

  const toggleHouseLights = () => {
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, lightsOn: !prev.lightsOn }));
  };

  const toggleHouseFireplace = () => {
    soundEngine.playSparkle();
    setDreamHouse((prev) => ({ ...prev, fireplaceLit: !prev.fireplaceLit }));
  };

  const toggleHouseFurniturePlacement = (furnitureId: string) => {
    const item = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnitureId);
    if (!item) return;
    if (!dreamHouse.unlockedFurnitureIds.includes(furnitureId)) {
      showToast(`Adquira "${item.name}" na Loja do Amor primeiro!`, '✨');
      return;
    }
    soundEngine.playHeartPop();
    setDreamHouse((prev) => {
      const current = prev.placedFurniture[item.room] || [];
      const exists = current.includes(furnitureId);
      const next = exists ? current.filter((id) => id !== furnitureId) : [...current, furnitureId];
      return {
        ...prev,
        placedFurniture: {
          ...prev.placedFurniture,
          [item.room]: next,
        },
        comfortLevel: Math.max(1, Math.min(10, next.length + Object.values(prev.placedFurniture).flat().length)),
      };
    });
  };

  const recordHouseVisit = () => {
    setMissionsState((prev) => ({
      ...prev,
      houseVisits: (prev.houseVisits || 0) + 1,
    }));
  };

  const interactHouseFurniture = (furnitureId: string) => {
    soundEngine.playSparkle();
    setDreamHouse((prev) => ({
      ...prev,
      lastInteractedAt: new Date().toISOString(),
      ...(furnitureId === 'house-fireplace' ? { fireplaceLit: !prev.fireplaceLit } : {}),
      ...(furnitureId === 'house-lamp' ? { lightsOn: !prev.lightsOn } : {}),
      ...(furnitureId === 'house-piano' ? { musicNoteGlow: !prev.musicNoteGlow } : {}),
    }));
    const item = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnitureId);
    if (item) {
      showToast(`${item.name}: ${item.description}`, '🏠');
    }
  };

  // --- AQUARIUM 3D ACTIONS ---
  // Auto-sync owned aquatic pets into aquarium species
  useEffect(() => {
    const owned = kitten.ownedPets || [];
    const linked = AQUARIUM_SPECIES_CATALOG.filter(
      (f) => f.linkedPetType && owned.includes(f.linkedPetType)
    ).map((f) => f.id);
    if (linked.length === 0) return;

    setAquarium((prev) => {
      const missingUnlock = linked.filter((id) => !prev.unlockedFishIds.includes(id));
      const missingActive = linked.filter((id) => !prev.activeFishIds.includes(id));
      if (missingUnlock.length === 0 && missingActive.length === 0) return prev;
      return {
        ...prev,
        unlockedFishIds: [...prev.unlockedFishIds, ...missingUnlock],
        activeFishIds: [...prev.activeFishIds, ...missingActive],
      };
    });
  }, [kitten.ownedPets]);

  const feedAquarium = (): boolean => {
    soundEngine.playEat();
    triggerHeartExplosion(0.5, 0.45);
    setAquarium((prev) => ({
      ...prev,
      fishHunger: Math.min(100, (prev.fishHunger || 60) + 25),
      lastFedAt: new Date().toISOString(),
      feedCount: (prev.feedCount || 0) + 1,
    }));
    setMissionsState((prev) => ({
      ...prev,
      aquariumFeeds: (prev.aquariumFeeds || 0) + 1,
    }));
    addCoins(2, 'Alimentou os peixinhos do Aquário');
    return true;
  };

  const cleanAquarium = (): boolean => {
    soundEngine.playWaterDrop();
    setAquarium((prev) => ({
      ...prev,
      waterClarity: 100,
      lastCleanedAt: new Date().toISOString(),
    }));
    addCoins(2, 'Água do Aquário cristalina');
    return true;
  };

  const toggleAquariumBubbles = () => {
    soundEngine.playHeartPop();
    setAquarium((prev) => ({ ...prev, bubblesActive: !prev.bubblesActive }));
  };

  const setAquariumLightMode = (mode: AquariumLightMode) => {
    soundEngine.playSparkle();
    setAquarium((prev) => ({ ...prev, lightMode: mode }));
  };

  const toggleAquariumFish = (fishId: string) => {
    if (!aquarium.unlockedFishIds.includes(fishId)) {
      const sp = AQUARIUM_SPECIES_CATALOG.find((f) => f.id === fishId);
      showToast(
        sp?.linkedPetType
          ? `Adote o ${sp.name} na Loja de Mascotes para vê-lo nadando aqui!`
          : `Desbloqueie "${sp?.name || 'Espécie'}" na Loja do Amor!`,
        '🐠'
      );
      return;
    }
    soundEngine.playHeartPop();
    setAquarium((prev) => {
      const active = prev.activeFishIds.includes(fishId);
      return {
        ...prev,
        activeFishIds: active
          ? prev.activeFishIds.filter((id) => id !== fishId)
          : [...prev.activeFishIds, fishId],
      };
    });
  };

  const toggleAquariumDecor = (decorId: string) => {
    if (!aquarium.unlockedDecorIds.includes(decorId)) {
      showToast('Adquira esta decoração na Loja do Amor!', '🪸');
      return;
    }
    soundEngine.playHeartPop();
    setAquarium((prev) => {
      const active = prev.activeDecorIds.includes(decorId);
      return {
        ...prev,
        activeDecorIds: active
          ? prev.activeDecorIds.filter((id) => id !== decorId)
          : [...prev.activeDecorIds, decorId],
      };
    });
  };

  // --- SEASONAL EVENTS, MISSIONS & VIRTUAL CAMERA ---
  const resolvedSeasonal = resolveActiveSeasonalEvent(
    seasonalState,
    config.anniversaryDate,
    calendarEvents
  );

  const setSeasonalMode = (mode: 'auto' | 'preview', previewEvent: SeasonalEventId = 'normal') => {
    soundEngine.playHeartPop();
    setSeasonalState((prev) => ({
      ...prev,
      mode,
      previewEvent,
      memoriesSeen:
        mode === 'preview' && !prev.memoriesSeen.includes(previewEvent)
          ? [...prev.memoriesSeen, previewEvent]
          : prev.memoriesSeen,
    }));
    showToast(
      mode === 'auto'
        ? 'Eventos sazonais no modo Automático!'
        : `Prévia ativada: ${resolveActiveSeasonalEvent({ ...seasonalState, mode, previewEvent }, config.anniversaryDate, calendarEvents).meta.label}`,
      '✨'
    );
  };

  const claimSeasonalProp = (propId: string, rewardCoins: number, label: string): boolean => {
    if (seasonalState.claimedProps.includes(propId)) {
      soundEngine.playHeartPop();
      showToast(`${label} — mimo já coletado nesta temporada!`, '✨');
      return false;
    }
    setSeasonalState((prev) => ({
      ...prev,
      claimedProps: prev.claimedProps.includes(propId) ? prev.claimedProps : [...prev.claimedProps, propId],
    }));
    triggerHeartExplosion(0.5, 0.3);
    addCoins(rewardCoins, label);
    return true;
  };

  const claimIntegratedMission = (missionId: string): boolean => {
    if (missionsState.claimedIds.includes(missionId)) return false;
    const mission = INTEGRATED_MISSIONS_CATALOG.find((m) => m.id === missionId);
    if (!mission) return false;

    setMissionsState((prev) => ({
      ...prev,
      claimedIds: [...prev.claimedIds, missionId],
    }));

    if (missionId === 'mis-house-decorator') {
      setDreamHouse((prev) => ({
        ...prev,
        unlockedFurnitureIds: prev.unlockedFurnitureIds.includes('house-bookshelf')
          ? prev.unlockedFurnitureIds
          : [...prev.unlockedFurnitureIds, 'house-bookshelf'],
      }));
    }

    if (missionId === 'mis-aquarium-keeper') {
      setAquarium((prev) => ({
        ...prev,
        waterClarity: 100,
      }));
    }

    triggerHeartExplosion(0.5, 0.4);
    addCoins(mission.rewardCoins, `Missão: ${mission.title}`);
    return true;
  };

  const captureVirtualPhoto = (
    containerEl: HTMLElement | null,
    sceneTitle: string,
    subtitle: string
  ): boolean => {
    const shot = captureCanvasSnapshotWithFrame(containerEl, sceneTitle, subtitle);
    if (!shot) {
      showToast('Aguarde a cena 3D carregar para tirar a foto!', '📸');
      return false;
    }
    addPhoto({
      title: `${sceneTitle} ♡`,
      subtitle,
      date: new Date().toLocaleDateString('pt-BR'),
      url: shot.dataUrl,
      sourceType: 'upload',
      aspect: shot.aspect,
      inHomeLoop: true,
      caption: `Registro do nosso universo 3D — ${sceneTitle} ♡`,
    });
    setMissionsState((prev) => ({
      ...prev,
      virtualSnapshotsTaken: (prev.virtualSnapshotsTaken || 0) + 1,
    }));
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const resetAllData = async () => {
    setJourneyStarted(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UNLOCK_STORAGE_KEY);
    localStorage.removeItem('NOSSO_MUNDO_APP_STATE_V2');
    try {
      await clearCloudWorld();
    } catch (e) {
      console.warn('Erro ao limpar nuvem:', e);
    }
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        config,
        coins,
        activeTab,
        extendedView,
        isDrawerOpen,
        isSettingsOpen,
        isLoggedIn,
        isLoadingDone,
        isLoading: !isLoadingDone,
        isLocked: !isLoggedIn,
        journeyStarted,
        isCloudSynced,
        phrases,
        dailyMessages,
        currentDailyIndex,
        letters,
        selectedLetter,
        photos,
        selectedPhoto,
        songs,
        currentSong,
        isPlaying,
        isShuffle,
        isLoop,
        playbackTime,
        achievements,
        storeItems,
        kitten,
        chatMessages,
        easterEggs,
        recentEasterEgg,
        toastMessage,
        treeWaterCount,
        treeState,
        loveTree: treeState,
        hasSeenIntro,
        gameRecords,
        customQuizQuestions,
        timeCapsules,
        coupleGoals,
        calendarEvents,
        dailyWheel,
        dreamHouse,
        aquarium,
        seasonalState,
        missionsState,
        legacyResetBackup,
        activeSeasonalEvent: resolvedSeasonal.activeEvent,
        activeSeasonalMeta: resolvedSeasonal.meta,
        isSeasonalPreview: resolvedSeasonal.isPreview,
        isGoogleConnected,
        googleUser,
        isDriveSyncing,
        driveSyncProgress,
        driveSyncError,
        connectGoogleDrive,
        disconnectGoogleDrive,
        syncDrivePhotos,
        setActiveTab,
        setExtendedView,
        setIsDrawerOpen,
        setIsSettingsOpen,
        setIsLoggedIn,
        setIsLoadingDone,
        addCoins,
        spendCoins,
        nextDailyMessage,
        prevDailyMessage,
        toggleFavoritePhrase,
        markLetterRead,
        toggleFavoriteLetter,
        setSelectedLetter,
        addCustomLetter,
        sendTwoWayLetter,
        deleteLetter,
        toggleFavoritePhoto,
        setSelectedPhoto,
        updatePhotoUrl,
        editPhoto,
        togglePhotoInLoop,
        addPhoto,
        removePhoto,
        playSong,
        pauseSong,
        togglePlay,
        nextSong,
        prevSong,
        seekSong,
        toggleShuffle,
        toggleLoop,
        toggleFavoriteSong,
        addSong,
        editSong,
        removeSong,
        unlockAchievement,
        buyStoreItem,
        redeemVoucher,
        petKitten,
        feedKitten,
        giveWaterKitten,
        batheKitten,
        toggleSleepKitten,
        playWithKitten,
        equipKittenItem,
        switchPet,
        renamePet,
        adoptPet,
        waterLoveTree,
        sunLoveTree,
        pruneLoveTree,
        addPromiseRibbon,
        harvestTreeFruit,
        plantLoveSeed,
        sendChatMessage,
        triggerEasterEgg,
        closeEasterEggModal,
        showToast,
        updateConfig,
        updateGameRecord,
        addQuizQuestion,
        removeQuizQuestion,
        addTimeCapsule,
        removeTimeCapsule,
        addCoupleGoal,
        updateCoupleGoal,
        toggleCoupleGoal,
        removeCoupleGoal,
        addCalendarEvent,
        updateCalendarEvent,
        removeCalendarEvent,
        spinDailyWheel,
        setHouseRoom,
        setHouseWallTheme,
        setHouseFloorTheme,
        toggleHouseLights,
        toggleHouseFireplace,
        toggleHouseFurniturePlacement,
        recordHouseVisit,
        interactHouseFurniture,
        feedAquarium,
        cleanAquarium,
        toggleAquariumBubbles,
        setAquariumLightMode,
        toggleAquariumFish,
        toggleAquariumDecor,
        setSeasonalMode,
        claimSeasonalProp,
        claimIntegratedMission,
        captureVirtualPhoto,
        triggerHeartExplosion,
        heartRainTriggerCount,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
