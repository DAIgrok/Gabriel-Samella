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
  HouseConstructionWall,
  HouseFurnitureTransform,
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
  ViewerRole,
} from '../types';
import {
  AQUARIUM_SPECIES_CATALOG,
  COOLDOWN_MS,
  HOUSE_FLOOR_THEMES,
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
import { HOUSE_ROOM_PRICES } from '../data/houseFurnitureCatalog';
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
} from '../services/cloudSync';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
  buildWorldSignature,
  clearSupabaseWorld,
  deleteSupabasePhoto,
  deleteSupabaseSong,
  getLastSavedWorldSignature,
  loadSupabaseMessages,
  loadSupabasePhotos,
  loadSupabaseSongs,
  loadSupabaseWorld,
  markSupabaseMessagesRead,
  saveSupabaseWorld,
  sendSupabaseMessage,
  subscribeChatPresence,
  subscribeSupabaseMessages,
  subscribeSupabasePhotos,
  subscribeSupabaseSongs,
  subscribeSupabaseWorld,
  upsertSupabasePhoto,
  upsertSupabaseSong,
} from '../services/supabaseSync';

export function getCooldownRemaining(cooldowns: Record<string, number> | undefined, key: string): number {
  const until = cooldowns?.[key] || 0;
  return Math.max(0, until - Date.now());
}

export function formatCooldownMs(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.ceil(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const INITIAL_PHOTO_IDS = new Set(INITIAL_PHOTOS.map((p) => p.id));
const INITIAL_SONG_IDS = new Set(INITIAL_SONGS.map((s) => s.id));

const LEGACY_STOCK_PHOTO_IDS = new Set(['photo-1', 'photo-2', 'photo-3', 'photo-4']);

function filterRealCouplePhotos(list: MemoryPhoto[] | undefined | null): MemoryPhoto[] {
  if (!Array.isArray(list)) return [];
  return list.filter((p) => {
    if (!p || !p.url) return false;
    if (p.sourceType === 'drive') return false;
    if (LEGACY_STOCK_PHOTO_IDS.has(p.id) && p.url.startsWith('/assets/img/')) return false;
    if (p.url.startsWith('/assets/img/')) return false;
    return true;
  });
}

const DEFAULT_GAME_RECORDS: GameRecords = {
  bestHearts: 0,
  bestMemoryMoves: 0,
  bestQuizScore: 0,
  ticTacToeWins: 0,
  gamesPlayed: 0,
};

export function getTreeStageName(level: number): string {
  switch (level) {
    case 1:
      return 'Semente do Amor';
    case 2:
      return 'Primeiro Broto';
    case 3:
      return 'Muda Jovem';
    case 4:
      return 'Árvore em Botão';
    case 5:
      return 'Copa Florida';
    case 6:
      return 'Cerejeira Encantada';
    case 7:
      return 'Árvore das Promessas';
    case 8:
      return 'Frutos Sagrados';
    case 9:
      return 'Guardiã Estrelada';
    case 10:
    default:
      return 'Árvore Cósmica da Eternidade';
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
  viewerRole: ViewerRole;
  isSpectator: boolean;
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
  onlinePeers: Record<'Gabriel' | 'Samella', boolean>;
  inAppChatToast: ChatMessage | null;
  dismissInAppChatToast: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
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
  lastMysteryChestAt: number;
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
  isPermissionsModalOpen: boolean;
  setIsPermissionsModalOpen: (open: boolean) => void;
  dismissPermissionsPrompt: () => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  lockApp: () => void;
  unlockWithPasscode: (code: string) => { ok: boolean; role?: ViewerRole };
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
  buyStoreItem: (id: string, customColor?: string) => boolean;
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
  adoptPet: (petType: PetType, customColor?: string) => void;
  setPetColor: (petType: PetType, hex: string) => void;
  setPetPartColor: (petType: PetType, partKey: string, hex: string) => void;
  clearPetPartColors: (petType: PetType) => void;
  setAccessoryColor: (itemId: string, hex: string) => void;
  waterLoveTree: () => boolean;
  sunLoveTree: () => boolean;
  pruneLoveTree: () => boolean;
  addPromiseRibbon: (promiseText: string) => boolean;
  harvestTreeFruit: (index: number) => string | null;
  plantLoveSeed: () => boolean;
  sendChatMessage: (
    textOrPayload:
      | string
      | {
          text: string;
          senderRole?: 'eu' | 'ela';
          msgType?: 'text' | 'audio' | 'image';
          mediaUrl?: string;
          audioDuration?: string;
        },
    senderRole?: 'eu' | 'ela'
  ) => Promise<void>;
  isFloatingChatOpen: boolean;
  setIsFloatingChatOpen: (open: boolean) => void;
  unreadChatCount: number;
  markChatRead: () => void;
  triggerEasterEgg: (id: string) => void;
  closeEasterEggModal: () => void;
  showToast: (text: string, icon?: string, reward?: number) => void;
  updateConfig: (newConfig: Partial<CoupleConfig>) => void;
  updateGameRecord: (partial: Partial<GameRecords>) => void;
  claimGameReward: (
    gameId: string,
    baseDiamonds: number,
    reason: string,
    score?: number
  ) => { rewarded: number; capped: boolean; cooldownSec?: number };
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
  openMysteryChest: () => { ok: boolean; coins?: number; prizeText?: string; remainingMs?: number };
  // Dream House 3D
  setHouseRoom: (room: HouseRoomId) => void;
  unlockHouseRoom: (room: HouseRoomId) => boolean;
  setHouseWallTheme: (theme: HouseWallTheme) => void;
  setHouseFloorTheme: (theme: HouseFloorTheme) => void;
  setHouseCustomWallHex: (hex: string) => void;
  setHouseCustomFloorHex: (hex: string) => void;
  setHouseCustomCeilingHex: (hex: string) => void;
  setHouseDimensions: (width: number, depth: number, wallHeight: number) => void;
  setHouseCustomWalls: (walls: HouseConstructionWall[]) => void;
  setHouseFurnitureColor: (furnitureId: string, hex: string) => void;
  toggleHouseLights: () => void;
  toggleHouseFireplace: () => void;
  toggleHouseFurniturePlacement: (furnitureId: string) => void;
  setHouseFurnitureTransform: (furnitureId: string, transform: HouseFurnitureTransform) => void;
  resetHouseFurnitureTransform: (furnitureId: string) => void;
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const savedData: Record<string, any> | null = null;

  const mergeInitialItems = <T extends { id: string }>(
    savedList: T[] | undefined,
    initialList: T[]
  ): T[] => {
    if (!savedList || savedList.length === 0) return initialList;
    const existingIds = new Set(savedList.map((item) => item.id));
    const newItems = initialList.filter((item) => !existingIds.has(item.id));
    return [...savedList, ...newItems];
  };

  const DEVICE_AUTH_STORAGE_KEY = 'nosso-mundo-device-auth';
  const DEVICE_PERM_PROMPT_KEY = 'nosso-mundo-perm-prompt-v1';
  const CUSTOM_GLB_STORAGE_KEY = 'nosso-mundo-custom-glb-v1';

  const readLocalCustomGlbModels = (): CoupleConfig['customGlbModels'] | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
      const raw = window.localStorage.getItem(CUSTOM_GLB_STORAGE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          pets: parsed.pets && typeof parsed.pets === 'object' ? parsed.pets : {},
          furniture: parsed.furniture && typeof parsed.furniture === 'object' ? parsed.furniture : {},
        };
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  const writeLocalCustomGlbModels = (models?: CoupleConfig['customGlbModels']) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        CUSTOM_GLB_STORAGE_KEY,
        JSON.stringify({
          pets: models?.pets || {},
          furniture: models?.furniture || {},
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  };

  const readDeviceAuth = (): { unlocked: boolean; role: ViewerRole } => {
    if (typeof window === 'undefined') return { unlocked: false, role: 'samella' };
    try {
      const raw = window.localStorage.getItem(DEVICE_AUTH_STORAGE_KEY);
      if (!raw) return { unlocked: false, role: 'samella' };
      const parsed = JSON.parse(raw);
      const role: ViewerRole =
        parsed?.role === 'gabriel_spectator' ? 'gabriel_spectator' : 'samella';
      return { unlocked: Boolean(parsed?.unlocked), role };
    } catch {
      return { unlocked: false, role: 'samella' };
    }
  };

  const initialDeviceAuth = readDeviceAuth();
  const initialLocalGlbModels = readLocalCustomGlbModels();

  const [journeyStarted, setJourneyStarted] = useState<boolean>(
    Boolean(savedData?.journeyStarted)
  );
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [viewerRole, setViewerRole] = useState<ViewerRole>(initialDeviceAuth.role);
  const isSpectator = viewerRole === 'gabriel_spectator';

  const [config, setConfig] = useState<CoupleConfig>(() => {
    const baseCfg = savedData?.config || INITIAL_COUPLE_CONFIG;
    if (!initialLocalGlbModels) return baseCfg;
    return {
      ...baseCfg,
      customGlbModels: {
        pets: {
          ...(baseCfg.customGlbModels?.pets || {}),
          ...(initialLocalGlbModels.pets || {}),
        },
        furniture: {
          ...(baseCfg.customGlbModels?.furniture || {}),
          ...(initialLocalGlbModels.furniture || {}),
        },
      },
    };
  });
  const [coins, setCoins] = useState<number>(savedData?.coins ?? 0);
  const [activeTab, setActiveTabState] = useState<ActiveTab>('inicio');
  const [extendedView, setExtendedViewState] = useState<ExtendedView>('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(initialDeviceAuth.unlocked);
  const [isLoadingDone, setIsLoadingDone] = useState<boolean>(false);
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
    filterRealCouplePhotos(savedData?.photos)
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
  const [dailyWheel, setDailyWheel] = useState<DailyWheelState>(() => ({
    ...INITIAL_DAILY_WHEEL,
  }));
  const [lastMysteryChestAt, setLastMysteryChestAt] = useState<number>(0);
  const [dreamHouse, setDreamHouse] = useState<DreamHouseState>(() => ({
    ...INITIAL_DREAM_HOUSE,
    placedFurniture: {
      ...INITIAL_DREAM_HOUSE.placedFurniture,
    },
    furnitureTransforms: {},
  }));
  const dreamHouseRef = useRef(dreamHouse);
  dreamHouseRef.current = dreamHouse;
  const [aquarium, setAquarium] = useState<AquariumState>(() => ({
    ...INITIAL_AQUARIUM_STATE,
  }));
  const [seasonalState, setSeasonalState] = useState<SeasonalState>(() => ({
    ...INITIAL_SEASONAL_STATE,
  }));
  const [missionsState, setMissionsState] = useState<MissionsState>(() => ({
    ...INITIAL_MISSIONS_STATE,
  }));
  const [isFloatingChatOpen, setIsFloatingChatOpenState] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [onlinePeers, setOnlinePeers] = useState<Record<'Gabriel' | 'Samella', boolean>>({
    Gabriel: false,
    Samella: false,
  });
  const [inAppChatToast, setInAppChatToast] = useState<ChatMessage | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'));
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
  const lastSyncedSignatureRef = useRef<string>('');
  const isFloatingChatOpenRef = useRef(false);
  const extendedViewRef = useRef<ExtendedView>('inicio');
  const isSpectatorRef = useRef<boolean>(false);
  isSpectatorRef.current = isSpectator;
  const isLoggedInRef = useRef<boolean>(false);
  isLoggedInRef.current = isLoggedIn;
  const syncTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const chatPopupTimeoutRef = useRef<number | null>(null);
  const lastMysteryChestRef = useRef<number>(0);
  const allowSpectatorWorldSaveRef = useRef<boolean>(false);
  const invalidSkippedIdsRef = useRef<Set<string>>(new Set());

  // Synchronous idempotency guards against duplicate/spam diamond claims
  const claimedAchievementIdsRef = useRef<Set<string>>(
    new Set(
      INITIAL_ACHIEVEMENTS
        .filter((a: Achievement) => a.unlocked || a.rewardClaimed)
        .map((a: Achievement) => a.id)
    )
  );
  const claimedEasterEggIdsRef = useRef<Set<string>>(
    new Set(
      INITIAL_EASTER_EGGS
        .filter((e: EasterEgg) => e.discovered || e.rewardClaimed)
        .map((e: EasterEgg) => e.id)
    )
  );
  const claimedLetterIdsRef = useRef<Set<string>>(
    new Set(
      INITIAL_LETTERS
        .filter((l: Letter) => l.read || l.rewardClaimed)
        .map((l: Letter) => l.id)
    )
  );
  const claimedGoalIdsRef = useRef<Set<string>>(
    new Set(
      INITIAL_COUPLE_GOALS
        .filter((g: CoupleGoal) => g.completed || g.rewardClaimed)
        .map((g: CoupleGoal) => g.id)
    )
  );
  const lastWheelSpinRef = useRef<number>(0);

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
    if (!cloud) return;

    if (isLiveUpdate) {
      isApplyingRemoteRef.current = true;
    }

    setJourneyStarted(Boolean(cloud.journeyStarted));
    if (cloud.config) {
      const normalizedPasscode =
        !cloud.config.passcode || cloud.config.passcode === '1206'
          ? '120623'
          : cloud.config.passcode;
      const normalizedCreator =
        !cloud.config.creatorPasscode || cloud.config.creatorPasscode === '2023'
          ? '2010'
          : cloud.config.creatorPasscode;
      const localGlb = readLocalCustomGlbModels();
      const cloudPets = cloud.config.customGlbModels?.pets || {};
      const localPets = localGlb?.pets || {};
      const mergedPets: Partial<Record<PetType, string>> = { ...cloudPets };
      // Preserve local idb:// uploads and locally saved custom URLs when cloud still holds default placeholder
      (Object.entries(localPets) as [PetType, string | undefined][]).forEach(([petK, localVal]) => {
        if (!localVal) return;
        const cloudVal = cloudPets[petK];
        if (
          localVal.startsWith('idb://') ||
          !cloudVal ||
          cloudVal === INITIAL_COUPLE_CONFIG.customGlbModels?.pets?.[petK]
        ) {
          mergedPets[petK] = localVal;
        }
      });
      const mergedFurniture = {
        ...(cloud.config.customGlbModels?.furniture || {}),
        ...(localGlb?.furniture || {}),
      };
      setConfig({
        ...INITIAL_COUPLE_CONFIG,
        ...cloud.config,
        passcode: normalizedPasscode,
        creatorPasscode: normalizedCreator,
        customGlbModels: {
          pets: mergedPets,
          furniture: mergedFurniture,
        },
      });
    }
    if (typeof cloud.coins === 'number') setCoins(cloud.coins);
    if (typeof cloud.treeWaterCount === 'number') setTreeWaterCount(cloud.treeWaterCount);
    if (typeof cloud.currentDailyIndex === 'number') setCurrentDailyIndex(cloud.currentDailyIndex);
    if (typeof cloud.lastMysteryChestAt === 'number') {
      const mergedChestAt = Math.max(cloud.lastMysteryChestAt, lastMysteryChestRef.current);
      lastMysteryChestRef.current = mergedChestAt;
      setLastMysteryChestAt(mergedChestAt);
    }
    if (cloud.treeState) setTreeState(cloud.treeState);
    if (cloud.kitten) setKitten(cloud.kitten);
    if (cloud.gameRecords) setGameRecords({ ...DEFAULT_GAME_RECORDS, ...cloud.gameRecords });
    if (cloud.chatMessages && cloud.chatMessages.length > 0) {
      setChatMessages(cloud.chatMessages);
    }

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
      const cleanCustomPhotos = filterRealCouplePhotos(cloud.customPhotos);
      if (cleanCustomPhotos.length > 0) {
        setPhotos((prev) => mergeInitialItems(cleanCustomPhotos, prev));
      }
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
      setCalendarEvents(mergeInitialItems(cloud.calendarEvents, INITIAL_CALENDAR_EVENTS));
    }

    if (cloud.dailyWheelState) {
      const mergedSpinAt = Math.max(
        cloud.dailyWheelState.lastSpinAt || 0,
        lastWheelSpinRef.current
      );
      lastWheelSpinRef.current = mergedSpinAt;
      setDailyWheel({
        ...cloud.dailyWheelState,
        lastSpinAt: mergedSpinAt,
      });
    }

    if (cloud.dreamHouseState) {
      const mergedPlaced = {
        ...INITIAL_DREAM_HOUSE.placedFurniture,
        ...(cloud.dreamHouseState.placedFurniture || {}),
      };
      const unlockedSet = new Set<HouseRoomId>([
        'sala',
        ...(cloud.dreamHouseState.unlockedRooms || []),
      ]);
      (Object.keys(mergedPlaced) as HouseRoomId[]).forEach((roomKey) => {
        if ((mergedPlaced[roomKey] || []).length > 0) {
          unlockedSet.add(roomKey);
        }
      });
      const resolvedUnlocked = Array.from(unlockedSet);
      const safeActive = unlockedSet.has(cloud.dreamHouseState.activeRoom)
        ? cloud.dreamHouseState.activeRoom
        : 'sala';
      setDreamHouse({
        ...INITIAL_DREAM_HOUSE,
        ...cloud.dreamHouseState,
        activeRoom: safeActive,
        unlockedRooms: resolvedUnlocked,
        unlockedFurnitureIds: Array.from(new Set(cloud.dreamHouseState.unlockedFurnitureIds || [])),
        placedFurniture: mergedPlaced,
        furnitureTransforms: {
          ...(cloud.dreamHouseState.furnitureTransforms || {}),
        },
        customColors: {
          ...(cloud.dreamHouseState.customColors || {}),
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

  const triggerChatNotificationAlert = (incomingMsg: ChatMessage) => {
    const myExpectedSender = isSpectatorRef.current ? 'me' : 'partner';
    if (incomingMsg.sender === myExpectedSender) return;

    const viewingChat =
      isFloatingChatOpenRef.current || extendedViewRef.current === 'conversas';

    if (viewingChat) {
      // Auto mark incoming message as read immediately while viewing
      markSupabaseMessagesRead(incomingMsg.sender === 'me' ? 'eu' : 'ela').catch(() => {});
      return;
    }

    setUnreadChatCount((c) => c + 1);
    soundEngine.playHeartPop();

    // Show in-app WhatsApp-style 3s popup if logged in
    if (isLoggedInRef.current) {
      setInAppChatToast(incomingMsg);
      if (chatPopupTimeoutRef.current) window.clearTimeout(chatPopupTimeoutRef.current);
      chatPopupTimeoutRef.current = window.setTimeout(() => {
        setInAppChatToast(null);
        chatPopupTimeoutRef.current = null;
      }, 3000);
    }

    // Fire native browser Notification if granted & tab hidden/not on chat
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const senderTitle = incomingMsg.senderName || (incomingMsg.sender === 'me' ? 'Gabriel' : 'Samella');
        const previewBody =
          incomingMsg.msgType === 'audio'
            ? 'Enviou uma mensagem de voz'
            : incomingMsg.msgType === 'image'
            ? 'Enviou uma fotografia'
            : incomingMsg.text;
        const notif = new Notification(`${senderTitle} — Nosso Mundo`, {
          body: previewBody.slice(0, 110),
        });
        window.setTimeout(() => notif.close(), 4500);
      } catch {
        // Ignore browser notification errors in restricted iframes
      }
    }
  };

  // Hydrate from Supabase on initial boot & subscribe for live Realtime sync between devices
  useEffect(() => {
    let active = true;
    let unsubscribeWorldLive: (() => void) | null = null;
    let unsubscribeMessagesLive: (() => void) | null = null;
    let unsubscribePhotosLive: (() => void) | null = null;
    let unsubscribeSongsLive: (() => void) | null = null;

    const bootstrapCloud = async () => {
      try {
        const [supaWorld, supaMessages, supaPhotos, cloudPhotos, supaSongs] = await Promise.all([
          loadSupabaseWorld(),
          loadSupabaseMessages(),
          loadSupabasePhotos(),
          loadCloudPhotos().catch(() => [] as MemoryPhoto[]),
          loadSupabaseSongs(),
        ]);
        if (!active) return;

        if (supaWorld) {
          applyCloudPayload(supaWorld, true);
        } else {
          const legacyWorld = await loadCloudWorld().catch(() => null);
          if (active && legacyWorld) {
            applyCloudPayload(legacyWorld, false);
          }
        }

        const combinedRealPhotos = filterRealCouplePhotos([
          ...(supaPhotos || []),
          ...(cloudPhotos || []),
        ]);
        if (combinedRealPhotos.length > 0) {
          setPhotos((prev) => mergeInitialItems(combinedRealPhotos, filterRealCouplePhotos(prev)));
        }

        if (supaSongs && supaSongs.length > 0) {
          setSongs((prev) => {
            const merged = mergeInitialItems(supaSongs, prev);
            setCurrentSong((cur) => cur || merged[0] || null);
            return merged;
          });
        }

        if (supaMessages && supaMessages.length > 0) {
          setChatMessages(supaMessages);
        }

        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Sincronização inicial Supabase aguardando:', err);
      } finally {
        cloudHydratedRef.current = true;
        if (active) {
          unsubscribeWorldLive = subscribeSupabaseWorld((remoteWorld) => {
            if (!active || !cloudHydratedRef.current) return;
            applyCloudPayload(remoteWorld, true);
          });
          unsubscribeMessagesLive = subscribeSupabaseMessages(
            (incomingMsg) => {
              if (!active) return;
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === incomingMsg.id)) return prev;
                return [...prev, incomingMsg];
              });
              triggerChatNotificationAlert(incomingMsg);
            },
            (updatedMsg) => {
              if (!active) return;
              setChatMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
              );
            }
          );
          unsubscribePhotosLive = subscribeSupabasePhotos((remotePhotos) => {
            if (!active || !remotePhotos.length) return;
            const cleanRemote = filterRealCouplePhotos(remotePhotos);
            if (!cleanRemote.length) return;
            setPhotos((prev) => mergeInitialItems(cleanRemote, filterRealCouplePhotos(prev)));
          });
          unsubscribeSongsLive = subscribeSupabaseSongs((remoteSongs) => {
            if (!active || !remoteSongs.length) return;
            setSongs((prev) => {
              const merged = mergeInitialItems(remoteSongs, prev);
              setCurrentSong((cur) => cur || merged[0] || null);
              return merged;
            });
          });
        }
      }
    };

    bootstrapCloud();
    return () => {
      active = false;
      if (unsubscribeWorldLive) unsubscribeWorldLive();
      if (unsubscribeMessagesLive) unsubscribeMessagesLive();
      if (unsubscribePhotosLive) unsubscribePhotosLive();
      if (unsubscribeSongsLive) unsubscribeSongsLive();
    };
  }, []);

  // Track Realtime Online Presence after unlock
  useEffect(() => {
    if (!isLoggedIn) return;
    const myPresenceRole = viewerRole === 'gabriel_spectator' ? 'Gabriel' : 'Samella';
    const unsubscribePresence = subscribeChatPresence(myPresenceRole, setOnlinePeers);
    return () => {
      unsubscribePresence();
    };
  }, [isLoggedIn, viewerRole]);

  // Auto-open device permissions prompt once per device when Samella unlocks
  useEffect(() => {
    if (!isLoggedIn || isSpectator || typeof window === 'undefined') return;
    try {
      const dismissed = window.localStorage.getItem(DEVICE_PERM_PROMPT_KEY);
      if (!dismissed) {
        const timer = window.setTimeout(() => {
          setIsPermissionsModalOpen(true);
        }, 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage failures
    }
  }, [isLoggedIn, isSpectator]);

  // Init Google Auth listener (Drive auto-sync intentionally disabled — gallery uses couple photos only)
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
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
        showToast(`${drivePhotos.length} fotos do Drive salvas para vocês dois!`, 'camera', 20);
      } else {
        showToast('Nenhuma imagem encontrada na pasta do Drive.', 'image');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar pasta do Google Drive';
      console.warn('Sync drive folder notice:', err);
      setDriveSyncError(msg);
      showToast('Erro ao sincronizar fotos do Google Drive.', 'bell');
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
        showToast('Google Drive conectado com sucesso! ♡', 'sparkles');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível conectar ao Google Drive';
      console.error('Google drive sign in failed:', err);
      setDriveSyncError(msg);
      showToast('Erro ao conectar Google Drive. Tente novamente.', 'bell');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    await googleLogout();
    setGoogleUser(null);
    setIsGoogleConnected(false);
    showToast('Google Drive desconectado.', 'heart');
  };

  const syncDrivePhotos = async () => {
    const token = await getAccessToken();
    if (!token) {
      await connectGoogleDrive();
      return;
    }
    await syncDrivePhotosWithToken(token);
  };

  // Persist full world state directly to Supabase (world data never uses localStorage)
  useEffect(() => {
    if (!journeyStarted && !allowSpectatorWorldSaveRef.current) return;
    if (isSpectator && !allowSpectatorWorldSaveRef.current) return;
    if (allowSpectatorWorldSaveRef.current) {
      allowSpectatorWorldSaveRef.current = false;
    }

    const saveInput = {
      journeyStarted,
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
      lastMysteryChestAt,
      dreamHouseState: dreamHouse,
      aquariumState: aquarium,
      seasonalState,
      missionsState,
      legacyResetBackup,
      initialPhotoIds: INITIAL_PHOTO_IDS,
      initialSongIds: INITIAL_SONG_IDS,
    };

    const nextSignature = buildWorldSignature(saveInput);

    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      lastSyncedSignatureRef.current = nextSignature;
      return;
    }

    if (
      nextSignature === lastSyncedSignatureRef.current ||
      nextSignature === getLastSavedWorldSignature()
    ) {
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      lastSyncedSignatureRef.current = nextSignature;
      const persistCloud = async () => {
        if (isSupabaseConfigured) {
          const ok = await saveSupabaseWorld(saveInput);
          if (ok) {
            setIsCloudSynced(true);
            return;
          }
        }
        await saveCloudWorld(saveInput);
        setIsCloudSynced(true);
      };
      persistCloud().catch((err) => {
        console.warn('Cloud sync deferred:', err);
      });
    }, 400);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    journeyStarted,
    isSpectator,
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
    lastMysteryChestAt,
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

  // Passive gradual hunger, thirst & hygiene decay for interactive Pet Needs System
  useEffect(() => {
    if (isSpectator || !isLoggedIn) return;
    const hungerTimer = window.setInterval(() => {
      const dh = dreamHouseRef.current;
      const unlocked = dh.unlockedRooms || ['sala'];
      const hasKitchenAndBowl =
        unlocked.includes('cozinha') &&
        (dh.placedFurniture?.cozinha || []).includes('house-pet-bowl');

      setKitten((prev) => {
        if (prev.isSleeping || prev.isEating) return prev;
        const activeType = (prev.petType || 'cat') as PetType;
        const deadList = prev.deadPets || [];
        if (deadList.includes(activeType)) return prev;

        const minFloor = hasKitchenAndBowl ? 12 : 0;
        const nextHunger = Math.max(minFloor, (prev.hunger ?? 70) - 1);
        const nextThirst = Math.max(minFloor, (prev.thirst ?? 70) - 1);
        const nextHygiene = Math.max(10, (prev.hygiene ?? 75) - 1);
        const diedNow = !hasKitchenAndBowl && (nextHunger <= 0 || nextThirst <= 0);
        const nextMood =
          nextHunger <= 30
            ? 'com-fome'
            : nextThirst <= 30
            ? 'com-sede'
            : nextHygiene <= 30
            ? 'sujinho'
            : prev.mood;

        return {
          ...prev,
          hunger: nextHunger,
          thirst: nextThirst,
          hygiene: nextHygiene,
          mood: nextMood,
          deadPets: diedNow ? Array.from(new Set([...deadList, activeType])) : deadList,
        };
      });
    }, 90000);
    return () => clearInterval(hungerTimer);
  }, [isSpectator, isLoggedIn]);

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
        showToast('Nenhuma faixa válida pronta para tocar. Adicione um link do YouTube ou MP3!', 'music');
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

  const showToast = (text: string, icon = 'sparkles', reward?: number) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ text, icon, reward });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const guardSpectator = (): boolean => {
    if (!isSpectator) return false;
    showToast('Modo Espectador: você pode ver tudo, escrever cartas, mandar mensagens e enviar fotos/músicas.', 'heart');
    return true;
  };

  const dismissInAppChatToast = () => {
    setInAppChatToast(null);
    if (chatPopupTimeoutRef.current) {
      window.clearTimeout(chatPopupTimeoutRef.current);
      chatPopupTimeoutRef.current = null;
    }
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return 'unsupported';
    }
    try {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === 'granted') {
        showToast('Notificações do chat ativadas neste aparelho.', 'chat');
      } else {
        showToast('Notificações não permitidas pelo navegador.', 'sparkles');
      }
      return res;
    } catch {
      return Notification.permission;
    }
  };

  const [heartRainTriggerCount, setHeartRainTriggerCount] = useState(0);

  const triggerHeartExplosion = (_x = 0.5, _y = 0.5) => {
    soundEngine.playHeartPop();
    setHeartRainTriggerCount((prev) => prev + 1);
  };

  const persistDeviceAuth = (unlocked: boolean, role: ViewerRole) => {
    if (typeof window === 'undefined') return;
    try {
      if (!unlocked) {
        window.localStorage.removeItem(DEVICE_AUTH_STORAGE_KEY);
      } else {
        window.localStorage.setItem(DEVICE_AUTH_STORAGE_KEY, JSON.stringify({ unlocked, role }));
      }
    } catch {
      // Ignore storage quota errors
    }
  };

  const dismissPermissionsPrompt = () => {
    setIsPermissionsModalOpen(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DEVICE_PERM_PROMPT_KEY, '1');
      } catch {
        // Ignore storage errors
      }
    }
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    if (loggedIn) {
      setIsLoadingDone(true);
      persistDeviceAuth(true, viewerRole);
      if (!journeyStarted && !isSpectator) {
        setJourneyStarted(true);
        setTimeout(() => {
          unlockAchievement('ach-welcome');
        }, 500);
      }
    } else {
      persistDeviceAuth(false, viewerRole);
    }
  };

  const lockApp = () => {
    soundEngine.playHeartPop();
    setIsDrawerOpen(false);
    setIsSettingsOpen(false);
    setIsLoggedInState(false);
    persistDeviceAuth(false, viewerRole);
  };

  const unlockWithPasscode = (code: string): { ok: boolean; role?: ViewerRole } => {
    const clean = code.trim();
    const samellaExpected = config.passcode && config.passcode !== '1206' ? config.passcode : '120623';
    const creatorPin = config.creatorPasscode && config.creatorPasscode !== '2023' ? config.creatorPasscode : '2010';
    if (clean === '2010' || clean === creatorPin) {
      setViewerRole('gabriel_spectator');
      setIsLoggedInState(true);
      setIsLoadingDone(true);
      persistDeviceAuth(true, 'gabriel_spectator');
      return { ok: true, role: 'gabriel_spectator' };
    }
    if (clean === samellaExpected || clean === '120623') {
      setViewerRole('samella');
      setIsLoggedInState(true);
      setIsLoadingDone(true);
      persistDeviceAuth(true, 'samella');
      if (!journeyStarted) {
        setJourneyStarted(true);
        setTimeout(() => {
          unlockAchievement('ach-welcome');
        }, 500);
      }
      return { ok: true, role: 'samella' };
    }
    return { ok: false };
  };

  const markChatRead = () => {
    setUnreadChatCount(0);
    setInAppChatToast(null);
    markSupabaseMessagesRead(isSpectator ? 'ela' : 'eu').catch(() => {});
  };

  const setIsFloatingChatOpen = (open: boolean) => {
    isFloatingChatOpenRef.current = open;
    setIsFloatingChatOpenState(open);
    if (open) {
      markChatRead();
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    soundEngine.playHeartPop();
    setActiveTabState(tab);
    setExtendedViewState(tab);
    extendedViewRef.current = tab;
    if (tab === 'conversas') {
      markChatRead();
    }
  };

  const setExtendedView = (view: ExtendedView) => {
    soundEngine.playHeartPop();
    if (view === 'config') {
      setIsDrawerOpen(false);
      setIsSettingsOpen(true);
      return;
    }
    setExtendedViewState(view);
    extendedViewRef.current = view;
    setIsDrawerOpen(false);
    if (view === 'conversas') {
      markChatRead();
    }
    if (['inicio', 'cartas', 'fotos', 'musica', 'conversas', 'perfil'].includes(view)) {
      setActiveTabState(view as ActiveTab);
    }
  };

  const addCoins = (amount: number, reason?: string) => {
    if (isSpectator || amount <= 0) return;
    soundEngine.playSparkle();
    setCoins((prev) => prev + amount);
    showToast(reason ? `${reason} (+${amount})` : `+${amount} Diamantes`, 'diamond', amount);
  };

  const spendCoins = (amount: number): boolean => {
    if (guardSpectator()) return false;
    if (coins >= amount) {
      soundEngine.playSparkle();
      setCoins((prev) => prev - amount);
      return true;
    }
    showToast('Diamantes insuficientes! Complete momentos ou minigames para ganhar.', 'diamond');
    return false;
  };

  const unlockAchievement = (id: string) => {
    if (isSpectator) return;
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
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const markLetterRead = (id: string) => {
    if (isSpectator) return;
    const target = letters.find((l) => l.id === id);
    if (!target) return;

    const alreadyClaimed =
      target.read || target.rewardClaimed || claimedLetterIdsRef.current.has(id);
    claimedLetterIdsRef.current.add(id);

    const readLettersCount = letters.filter((l) => l.read || l.id === id).length;

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
      addCoins(Math.min(3, target.rewardCoins), `Carta lida: "${target.title}"`);
      unlockAchievement('ach-first-letter');
      setAchievements((prev) =>
        prev.map((a) =>
          (a.id === 'ach-letters-5' || a.id === 'ach-letters-10') && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, readLettersCount) }
            : a
        )
      );
      if (readLettersCount >= 5) unlockAchievement('ach-letters-5');
      if (readLettersCount >= 10) unlockAchievement('ach-letters-10');
    }
  };

  const toggleFavoriteLetter = (id: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setLetters((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  const addCustomLetter = (newLetterData: Omit<Letter, 'id' | 'read' | 'isFavorite'>) => {
    allowSpectatorWorldSaveRef.current = true;
    const newLetter: Letter = {
      ...newLetterData,
      id: `letter-${Date.now()}`,
      read: true,
      isFavorite: false,
      sentAt: newLetterData.sentAt || new Date().toISOString(),
    };
    setLetters((prev) => [newLetter, ...prev]);
    showToast('Nova carta adicionada com sucesso!', 'letter');
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

    const effectiveSender: CouplePerson = isSpectator ? 'Gabriel' : sender;
    const effectiveRecipient: CouplePerson = isSpectator ? 'Samella' : recipient;
    allowSpectatorWorldSaveRef.current = true;

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
      rewardCoins: 2,
      tags,
      authorName: effectiveSender,
      sender: effectiveSender,
      recipient: effectiveRecipient,
      isPrivate,
    };

    const nextCount = (missionsState.twoWayLettersSent || 0) + 1;
    const totalActivity = letters.filter((l) => l.read).length + nextCount;
    setLetters((prev) => [newLetter, ...prev]);
    if (!isSpectator) {
      setMissionsState((prev) => ({
        ...prev,
        twoWayLettersSent: nextCount,
      }));
      setAchievements((prev) =>
        prev.map((a) =>
          (a.id === 'ach-letters-5' || a.id === 'ach-letters-10') && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, totalActivity) }
            : a
        )
      );
      if (totalActivity >= 5) unlockAchievement('ach-letters-5');
      if (totalActivity >= 10) unlockAchievement('ach-letters-10');
    }
    triggerHeartExplosion(0.5, 0.45);
    showToast(`Carta de ${effectiveSender} enviada para ${effectiveRecipient}!`, 'letter');
  };

  const deleteLetter = (id: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setLetters((prev) => prev.filter((l) => l.id !== id));
    setSelectedLetter((cur) => (cur?.id === id ? null : cur));
    showToast('Carta removida da caixa de correspondência.', 'letter');
  };

  const toggleFavoritePhoto = (id: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    let favTotal = 0;
    setPhotos((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, isFavorite: !p.isFavorite };
        upsertSupabasePhoto(updated).catch(() => {});
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      });
      favTotal = next.filter((p) => p.isFavorite).length;
      return next;
    });
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-photos-fav5' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, favTotal) }
          : a
      )
    );
    if (favTotal >= 5) {
      unlockAchievement('ach-photos-fav5');
    }
  };

  const updatePhotoUrl = (id: string, url: string, title?: string) => {
    if (guardSpectator()) return;
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, url, title: title || p.title };
        upsertSupabasePhoto(updated).catch(() => {});
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
    showToast('Foto atualizada com sucesso!', 'camera');
  };

  const editPhoto = (id: string, updates: Partial<MemoryPhoto>) => {
    allowSpectatorWorldSaveRef.current = true;
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        upsertSupabasePhoto(updated).catch(() => {});
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
    showToast('Detalhes da foto atualizados!', 'sparkles');
  };

  const togglePhotoInLoop = (id: string) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playHeartPop();
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, inHomeLoop: !p.inHomeLoop };
        upsertSupabasePhoto(updated).catch(() => {});
        if (!INITIAL_PHOTO_IDS.has(id) && !updated.url.startsWith('idb://')) {
          saveCloudPhoto(updated).catch(() => {});
        }
        return updated;
      })
    );
  };

  const addPhoto = (newPhotoData: Omit<MemoryPhoto, 'id' | 'index'>) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playSparkle();
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);
    const newPhoto: MemoryPhoto = {
      ...newPhotoData,
      title: newPhotoData.title ?? '',
      subtitle: newPhotoData.subtitle ?? '',
      date: newPhotoData.date ?? '',
      id: `photo-${Date.now()}-${uniqueSuffix}`,
      index: photos.length + 1,
      isFavorite: false,
      inHomeLoop: newPhotoData.inHomeLoop ?? true,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    upsertSupabasePhoto(newPhoto).catch(() => {});
    if (newPhoto.url && !newPhoto.url.startsWith('idb://')) {
      saveCloudPhoto(newPhoto).catch(() => {});
    }
    showToast('Nova foto salva na nuvem do casal!', 'camera');
    if (!isSpectator) {
      unlockAchievement('ach-photo-album');
    }
  };

  const removePhoto = (id: string) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playHeartPop();
    const target = photos.find((p) => p.id === id);
    if (target?.url.startsWith('idb://')) {
      deleteMediaBlob(target.url).catch(() => {});
    }
    deleteSupabasePhoto(id).catch(() => {});
    if (!INITIAL_PHOTO_IDS.has(id)) {
      deleteCloudPhoto(id).catch(() => {});
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Foto removida da galeria.', 'image');
  };

  const playSong = (song?: Song) => {
    const target = song || currentSong || songs[0] || null;
    if (!target) {
      showToast('Adicione uma música pelo YouTube ou arquivo para ouvir ♡', 'music');
      return;
    }
    invalidSkippedIdsRef.current.clear();
    setCurrentSong(target);
    setIsPlaying(true);
    realAudio.playSong(target, true);
    if (!isSpectator) {
      unlockAchievement('ach-first-song');
    }
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
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, isFavorite: !s.isFavorite };
        upsertSupabaseSong(updated).catch(() => {});
        return updated;
      })
    );
  };

  const addSong = (newSongData: Omit<Song, 'id'>) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playSparkle();
    invalidSkippedIdsRef.current.clear();
    const newSong: Song = {
      ...newSongData,
      id: `song-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      isFavorite: false,
    };
    const nextTotal = songs.length + 1;
    setSongs((prev) => [...prev, newSong]);
    setCurrentSong((prev) => prev || newSong);
    upsertSupabaseSong(newSong).catch(() => {});
    if (!isSpectator) {
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach-music-collector' && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, nextTotal) }
            : a
        )
      );
      if (nextTotal >= 3) {
        unlockAchievement('ach-music-collector');
      }
    }
    showToast(`Música "${newSong.title}" salva na nuvem para o casal!`, 'music');
  };

  const editSong = (id: string, updates: Partial<Song>) => {
    allowSpectatorWorldSaveRef.current = true;
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        upsertSupabaseSong(updated).catch(() => {});
        return updated;
      })
    );
    setCurrentSong((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
    showToast('Música atualizada!', 'music');
  };

  const removeSong = (id: string) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playHeartPop();
    const target = songs.find((s) => s.id === id);
    if (target?.audioUrl?.startsWith('idb://')) {
      deleteMediaBlob(target.audioUrl).catch(() => {});
    }
    deleteSupabaseSong(id).catch(() => {});
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
    showToast('Música removida da playlist.', 'music');
  };

  const buyStoreItem = (id: string, customColor?: string): boolean => {
    if (guardSpectator()) return false;
    const item = storeItems.find((i) => i.id === id);
    if (!item) return false;
    const isDeadPetRevival =
      item.category === 'pets' &&
      Boolean(item.petTypeTarget) &&
      (kitten.deadPets || []).includes(item.petTypeTarget as PetType);

    if (item.purchased && !isDeadPetRevival) {
      showToast('Item já adquirido e ativo!', 'shop');
      return true;
    }
    if (spendCoins(item.price)) {
      const chosenHex = customColor || item.customColor || item.defaultColor;

      setStoreItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, purchased: true, equipped: true, customColor: chosenHex || i.customColor }
            : i
        )
      );

      // Handle pet adoption / revival + custom color
      if (item.category === 'pets' || (item.petTypeTarget && item.petTypeTarget !== 'all')) {
        const targetType = (item.petTypeTarget || 'cat') as PetType;
        const nextOwnedCount = (kitten.ownedPets || ['cat']).includes(targetType)
          ? (kitten.ownedPets || ['cat']).length
          : (kitten.ownedPets || ['cat']).length + 1;

        setKitten((prev) => {
          const owned = prev.ownedPets || ['cat'];
          const newOwned = owned.includes(targetType) ? owned : [...owned, targetType];
          const existingCustom = prev.customNames?.[targetType] || '';
          const nextDead = (prev.deadPets || []).filter((p) => p !== targetType);
          return {
            ...prev,
            ownedPets: newOwned,
            deadPets: nextDead,
            petType: targetType,
            name: existingCustom,
            hunger: 85,
            thirst: 85,
            hygiene: 85,
            happiness: 85,
            energy: 85,
            mood: 'feliz',
            petColors: chosenHex
              ? { ...(prev.petColors || {}), [targetType]: chosenHex }
              : prev.petColors,
          };
        });

        setAchievements((prev) =>
          prev.map((a) =>
            a.id === 'ach-pet-collector' && !a.unlocked
              ? { ...a, progress: Math.min(a.maxProgress, nextOwnedCount) }
              : a
          )
        );
        if (nextOwnedCount >= 3) {
          unlockAchievement('ach-pet-collector');
        }
      }

      // Handle accessory / hat / outfit custom color
      if (
        item.slotType === 'hat' ||
        item.slotType === 'accessory' ||
        item.slotType === 'outfit' ||
        item.slotType === 'collar' ||
        item.slotType === 'glasses'
      ) {
        setKitten((prev) => ({
          ...prev,
          accessoryColors: chosenHex
            ? { ...(prev.accessoryColors || {}), [item.id]: chosenHex }
            : prev.accessoryColors,
          ...(item.slotType === 'hat' ? { equippedHat: item.id } : {}),
          ...(item.slotType === 'accessory' ? { equippedAccessory: item.id } : {}),
          ...(item.slotType === 'outfit' ? { equippedOutfit: item.id } : {}),
          ...(item.slotType === 'collar' ? { equippedCollar: item.id } : {}),
          ...(item.slotType === 'glasses' ? { equippedGlasses: item.id } : {}),
        }));
        unlockAchievement('ach-pet-dress');
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

      // Handle Dream House 3D furniture, walls & floors
      if (item.slotType === 'house-furniture' && item.targetId) {
        const furnId = item.targetId;
        const furnInfo = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnId);
        const totalAfter = dreamHouse.unlockedFurnitureIds.includes(furnId)
          ? dreamHouse.unlockedFurnitureIds.length
          : dreamHouse.unlockedFurnitureIds.length + 1;

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
            customColors: chosenHex
              ? { ...(prev.customColors || {}), [furnId]: chosenHex }
              : prev.customColors,
            comfortLevel: Math.min(10, totalAfter),
          };
        });

        setAchievements((prev) =>
          prev.map((a) => {
            if (a.unlocked) return a;
            if (
              a.id === 'ach-house-architect' ||
              a.id === 'ach-house-palace' ||
              a.id === 'ach-house-full25'
            ) {
              return { ...a, progress: Math.min(a.maxProgress, totalAfter) };
            }
            return a;
          })
        );
        if (totalAfter >= 1) unlockAchievement('ach-house-first');
        if (totalAfter >= 5) unlockAchievement('ach-house-architect');
        if (totalAfter >= 12) unlockAchievement('ach-house-palace');
        if (totalAfter >= 25) unlockAchievement('ach-house-full25');
      }

      if (item.slotType === 'house-wall' && item.targetId) {
        const wallId = item.targetId as HouseWallTheme;
        setDreamHouse((prev) => ({
          ...prev,
          wallTheme: wallId,
          customWallHex: chosenHex || prev.customWallHex,
        }));
        unlockAchievement('ach-house-wall');
      }

      if (item.slotType === 'house-floor' && item.targetId) {
        const floorId = item.targetId as HouseFloorTheme;
        setDreamHouse((prev) => ({
          ...prev,
          floorTheme: floorId,
          customFloorHex: chosenHex || prev.customFloorHex,
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
        unlockAchievement('ach-aqua-decor');
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
        unlockAchievement('ach-aqua-decor');
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
    if (guardSpectator()) return;
    soundEngine.playSparkle();
    triggerHeartExplosion();
    const redeemedAfter = storeItems.filter(
      (i) => i.category === 'vales' && (i.redeemed || i.id === id)
    ).length;

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
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-voucher-3' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, redeemedAfter) }
          : a
      )
    );
    unlockAchievement('ach-voucher-first');
    if (redeemedAfter >= 3) unlockAchievement('ach-voucher-3');
    showToast('Vale Amoroso resgatado com sucesso! Gabriel já foi notificado.', 'gift');
  };

  const gainKittenXp = (amount: number) => {
    if (isSpectator) return;
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
      addCoins(5, `${displayPet} subiu para o Nível ${leveledUpTo}!`);
      if (leveledUpTo >= 5) {
        unlockAchievement('ach-pet-level5');
      }
    }
  };

  const petKitten = (_part?: 'head' | 'belly' | 'paw') => {
    if (guardSpectator()) return;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return;
    }
    soundEngine.playPurr();
    triggerHeartExplosion(0.5, 0.4);
    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_pet');
    if (rem > 0) {
      showToast(`Carinho retribuído! Próximo bônus em ${formatCooldownMs(rem)}`, 'paw');
      return;
    }

    let reached10 = false;
    let reached50 = false;
    let nextPetCount = 0;
    let petLabel = 'seu mascote';

    setKitten((prev) => {
      nextPetCount = (prev.petCount || 0) + 1;
      petLabel = getSpeciesDisplayName(prev.petType, prev.name);
      if (nextPetCount >= 10) reached10 = true;
      if (nextPetCount >= 50) reached50 = true;

      return {
        ...prev,
        happiness: Math.min(100, (prev.happiness || 50) + 8),
        fun: Math.min(100, (prev.fun || 50) + 6),
        affectionLevel: (prev.affectionLevel || 0) + 1,
        mood: 'ronronando',
        petCount: nextPetCount,
        cooldowns: {
          ...(prev.cooldowns || {}),
          pet_pet: Date.now() + COOLDOWN_MS.pet_pet,
        },
      };
    });

    setAchievements((prev) =>
      prev.map((a) => {
        if (a.unlocked) return a;
        if (a.id === 'ach-pet-cat' || a.id === 'ach-pet-lover50') {
          return { ...a, progress: Math.min(a.maxProgress, nextPetCount) };
        }
        return a;
      })
    );

    if (reached10) unlockAchievement('ach-pet-cat');
    if (reached50) unlockAchievement('ach-pet-lover50');
    addCoins(1, `Carinho em ${petLabel}`);
    gainKittenXp(8);
  };

  const feedKitten = (foodName = 'Comidinha Especial', hungerBoost = 30, happyBoost = 10): boolean => {
    if (guardSpectator()) return false;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return false;
    }
    const unlockedRooms = dreamHouse.unlockedRooms || ['sala'];
    if (!unlockedRooms.includes('cozinha')) {
      showToast('Desbloqueie o cômodo Cozinha na Casa dos Sonhos para alimentar!', 'house');
      return false;
    }
    const kitchenPlaced = dreamHouse.placedFurniture?.cozinha || [];
    if (!kitchenPlaced.includes('house-pet-bowl')) {
      showToast('Compre e coloque o Pote de Ração & Água na Cozinha primeiro!', 'paw');
      return false;
    }

    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_feed');
    if (rem > 0) {
      showToast(`Cheio por agora! Alimente de novo em ${formatCooldownMs(rem)}`, 'paw');
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
      lastFedTimestamp: Date.now(),
      lastFed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cooldowns: {
        ...(prev.cooldowns || {}),
        pet_feed: Date.now() + COOLDOWN_MS.pet_feed,
      },
    }));
    gainKittenXp(12);
    addCoins(1, `${label} saboreou ${foodName}`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isEating: false }));
    }, 1800);
    return true;
  };

  const giveWaterKitten = (): boolean => {
    if (guardSpectator()) return false;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return false;
    }
    const unlockedRooms = dreamHouse.unlockedRooms || ['sala'];
    if (!unlockedRooms.includes('cozinha')) {
      showToast('Desbloqueie o cômodo Cozinha na Casa dos Sonhos para dar água!', 'house');
      return false;
    }
    const kitchenPlaced = dreamHouse.placedFurniture?.cozinha || [];
    if (!kitchenPlaced.includes('house-pet-bowl')) {
      showToast('Compre e coloque o Pote de Ração & Água na Cozinha primeiro!', 'aqua');
      return false;
    }

    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_water');
    if (rem > 0) {
      showToast(`Hidratado! Próxima água em ${formatCooldownMs(rem)}`, 'aqua');
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
      lastFedTimestamp: Date.now(),
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
    if (guardSpectator()) return false;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return false;
    }
    const unlockedRooms = dreamHouse.unlockedRooms || ['sala'];
    if (!unlockedRooms.includes('banheiro')) {
      showToast('Construa o Banheiro na Casa dos Sonhos para dar banho no mascote!', 'bath');
      return false;
    }

    const rem = getCooldownRemaining(kitten.cooldowns, 'pet_bath');
    if (rem > 0) {
      showToast(`Limpinho! Próximo banho em ${formatCooldownMs(rem)}`, 'aqua');
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
    addCoins(1, `${label} tomou um banho cheiroso`);
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isBathing: false }));
    }, 2000);
    return true;
  };

  const toggleSleepKitten = (): boolean => {
    if (guardSpectator()) return false;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return false;
    }
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    if (!kitten.isSleeping) {
      const rem = getCooldownRemaining(kitten.cooldowns, 'pet_sleep');
      if (rem > 0) {
        showToast(`Sem soninho ainda! Descanso disponível em ${formatCooldownMs(rem)}`, 'clock');
        return false;
      }
      soundEngine.playSleepSnore();
      showToast(`${label} apagou o abajur para descansar...`, 'clock');
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
    showToast(`${label} acordou cheio de energia!`, 'sparkles');
    setKitten((prev) => ({
      ...prev,
      isSleeping: false,
      mood: 'feliz',
      energy: Math.min(100, (prev.energy || 50) + 25),
    }));
    return true;
  };

  const playWithKitten = (toyName = 'Novelo de Lã', source: 'toy' | 'dance' = 'toy'): boolean => {
    if (guardSpectator()) return false;
    const activeType = (kitten.petType || 'cat') as PetType;
    if ((kitten.deadPets || []).includes(activeType)) {
      showToast('Este pet virou estrelinha. Adote um novo mascote na Loja ♡', 'paw');
      return false;
    }
    const cdKey = source === 'dance' ? 'pet_dance' : 'pet_play';
    const cdDuration = source === 'dance' ? COOLDOWN_MS.pet_dance : COOLDOWN_MS.pet_play;
    const rem = getCooldownRemaining(kitten.cooldowns, cdKey);
    if (rem > 0) {
      showToast(
        source === 'dance'
          ? `Descansando os passinhos! Nova dança premiada em ${formatCooldownMs(rem)}`
          : `Descansando da brincadeira! Disponível em ${formatCooldownMs(rem)}`,
        'paw'
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
    if (guardSpectator()) return;
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
    showToast('Look do mascote atualizado!', 'sparkles');
  };

  const switchPet = (petType: PetType) => {
    if (guardSpectator()) return;
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
    showToast(`Agora cuidando de ${displayName}!`, 'paw');
  };

  const renamePet = (newName: string) => {
    if (guardSpectator()) return;
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
    showToast(`Nome salvo: "${cleaned}"!`, 'sparkles');
  };

  const adoptPet = (petType: PetType, customColor?: string) => {
    if (guardSpectator()) return;
    const species = PET_SPECIES_CATALOG.find((s) => s.type === petType);
    const nextOwnedCount = (kitten.ownedPets || ['cat']).includes(petType)
      ? (kitten.ownedPets || ['cat']).length
      : (kitten.ownedPets || ['cat']).length + 1;

    setKitten((prev) => {
      const currentOwned = prev.ownedPets || ['cat'];
      const newOwned = currentOwned.includes(petType) ? currentOwned : [...currentOwned, petType];
      const existingName = prev.customNames?.[petType] || '';
      const nextDead = (prev.deadPets || []).filter((p) => p !== petType);
      return {
        ...prev,
        ownedPets: newOwned,
        deadPets: nextDead,
        petType,
        name: existingName,
        hunger: 85,
        thirst: 85,
        hygiene: 85,
        happiness: 85,
        energy: 85,
        petColors: customColor
          ? { ...(prev.petColors || {}), [petType]: customColor }
          : prev.petColors,
      };
    });
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-pet-collector' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextOwnedCount) }
          : a
      )
    );
    if (nextOwnedCount >= 3) {
      unlockAchievement('ach-pet-collector');
    }
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    showToast(`Adotou ${species?.name || 'Novo Mascote'}! Escolha o nome dele(a)!`, 'paw');
  };

  const setPetColor = (petType: PetType, hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setKitten((prev) => {
      const nextPartColors = { ...(prev.petPartColors || {}) };
      delete nextPartColors[petType];
      return {
        ...prev,
        petColors: {
          ...(prev.petColors || {}),
          [petType]: hex,
        },
        petPartColors: nextPartColors,
      };
    });
    showToast('Cor personalizada aplicada ao mascote!', 'sparkles');
  };

  const setPetPartColor = (petType: PetType, partKey: string, hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setKitten((prev) => ({
      ...prev,
      petPartColors: {
        ...(prev.petPartColors || {}),
        [petType]: {
          ...(prev.petPartColors?.[petType] || {}),
          [partKey]: hex,
        },
      },
    }));
  };

  const clearPetPartColors = (petType: PetType) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setKitten((prev) => {
      const nextPartColors = { ...(prev.petPartColors || {}) };
      delete nextPartColors[petType];
      const nextPetColors = { ...(prev.petColors || {}) };
      delete nextPetColors[petType];
      return {
        ...prev,
        petColors: nextPetColors,
        petPartColors: nextPartColors,
      };
    });
    showToast('Cores originais do mascote restauradas!', 'sparkles');
  };

  const setAccessoryColor = (itemId: string, hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setKitten((prev) => ({
      ...prev,
      accessoryColors: {
        ...(prev.accessoryColors || {}),
        [itemId]: hex,
      },
    }));
    showToast('Cor do acessório atualizada!', 'sparkles');
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
      addCoins(5, `Árvore do Amor evoluiu para Nv.${evolvedTo}`);
      if (evolvedTo >= 2) unlockAchievement('ach-tree-lvl2');
      if (evolvedTo >= 5) unlockAchievement('ach-tree-lvl5');
      if (evolvedTo >= 8) unlockAchievement('ach-tree-lvl8');
      if (evolvedTo >= 10) unlockAchievement('ach-tree-lvl10');
    }
  };

  const waterLoveTree = (): boolean => {
    if (guardSpectator()) return false;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_water');
    if (rem > 0) {
      showToast(`Solo bem regado! Próxima rega em ${formatCooldownMs(rem)}`, 'aqua');
      return false;
    }
    soundEngine.playWaterDrop();
    setTreeWaterCount((prev) => prev + 1);
    applyTreeXpGain(25, 'water', 'tree_water', COOLDOWN_MS.tree_water);
    unlockAchievement('ach-tree-water');
    addCoins(1, 'Regou a Árvore do Amor');
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const sunLoveTree = (): boolean => {
    if (guardSpectator()) return false;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_sun');
    if (rem > 0) {
      showToast(`Raios absorvidos! Novo banho de sol em ${formatCooldownMs(rem)}`, 'sparkles');
      return false;
    }
    soundEngine.playSparkle();
    applyTreeXpGain(20, 'sun', 'tree_sun', COOLDOWN_MS.tree_sun);
    triggerHeartExplosion(0.5, 0.3);
    addCoins(1, 'Banho de Sol na Árvore');
    return true;
  };

  const pruneLoveTree = (): boolean => {
    if (guardSpectator()) return false;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_prune');
    if (rem > 0) {
      showToast(`Folhagem cuidada! Nova poda em ${formatCooldownMs(rem)}`, 'tree');
      return false;
    }
    soundEngine.playHeartPop();
    applyTreeXpGain(15, 'prune', 'tree_prune', COOLDOWN_MS.tree_prune);
    triggerHeartExplosion(0.5, 0.35);
    addCoins(1, 'Cuidado de Jardinagem');
    return true;
  };

  const addPromiseRibbon = (promiseText: string): boolean => {
    if (guardSpectator()) return false;
    if (!promiseText.trim()) return false;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_ribbon');
    if (rem > 0) {
      showToast(`Aguarde ${formatCooldownMs(rem)} para amarrar outra fita`, 'clock');
      return false;
    }
    soundEngine.playSparkle();
    const nextRibbonsCount = (treeState.promiseRibbons || []).length + 1;
    setTreeState((prev) => ({
      ...prev,
      promiseRibbons: [...(prev.promiseRibbons || []), promiseText.trim()],
      cooldowns: {
        ...(prev.cooldowns || {}),
        tree_ribbon: Date.now() + COOLDOWN_MS.tree_ribbon,
      },
    }));
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-tree-ribbons5' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextRibbonsCount) }
          : a
      )
    );
    if (nextRibbonsCount >= 5) unlockAchievement('ach-tree-ribbons5');
    addCoins(2, 'Fita de Promessa amarrada nos galhos');
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const harvestTreeFruit = (index: number): string | null => {
    if (guardSpectator()) return null;
    const rem = getCooldownRemaining(treeState.cooldowns, 'tree_fruit');
    if (rem > 0) {
      showToast(`Novos frutos amadurecendo! Volte em ${formatCooldownMs(rem)}`, 'flower');
      return null;
    }
    const fruitMessages = [
      '“Você é o amor mais doce que a vida me deu.” ♡',
      '“Seu riso tem gosto de felicidade plena.” ♡',
      '“Amo a mulher forte e bondosa que você é.” ♡',
      '“Hoje e sempre, meu coração bate no compasso do seu.” ♡',
      '“Obrigado por ser minha melhor companhia de todos os dias.” ♡',
    ];
    soundEngine.playFruitHarvest();
    triggerHeartExplosion(0.5, 0.45);
    const nextFruits = (treeState.fruitsHarvested || 0) + 1;
    setTreeState((prev) => ({
      ...prev,
      fruitsHarvested: nextFruits,
      cooldowns: {
        ...(prev.cooldowns || {}),
        tree_fruit: Date.now() + COOLDOWN_MS.tree_fruit,
      },
    }));
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-tree-fruits5' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextFruits) }
          : a
      )
    );
    if (nextFruits >= 5) unlockAchievement('ach-tree-fruits5');
    addCoins(1, 'Colheu um Fruto do Amor');
    return fruitMessages[index % fruitMessages.length];
  };

  const plantLoveSeed = (): boolean => {
    if (guardSpectator()) return false;
    const level = treeState.level || 1;
    if (level >= 10) {
      showToast('A Árvore do Amor já atingiu a plenitude no Nível 10!', 'tree');
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
    showToast('Nova semente plantada! A Árvore recebeu +50 XP', 'seed');
    return true;
  };

  const sendChatMessage = async (
    textOrPayload:
      | string
      | {
          text: string;
          senderRole?: 'eu' | 'ela';
          msgType?: 'text' | 'audio' | 'image';
          mediaUrl?: string;
          audioDuration?: string;
        },
    explicitRole: 'eu' | 'ela' = 'ela'
  ) => {
    const payload =
      typeof textOrPayload === 'string'
        ? { text: textOrPayload, senderRole: explicitRole }
        : textOrPayload;

    const cleanText = (payload.text || '').trim();
    const msgType = payload.msgType || 'text';
    if (!cleanText && !payload.mediaUrl) return;

    // Gabriel Spectator automatically sends as Gabriel ('eu')
    const senderRole: 'eu' | 'ela' = isSpectator
      ? 'eu'
      : payload.senderRole || explicitRole;

    soundEngine.playHeartPop();
    const senderName = senderRole === 'eu' ? config.myName : config.partnerName;
    const timeLabel = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const optimisticMsg: ChatMessage = {
      id: msgId,
      sender: senderRole === 'eu' ? 'me' : 'partner',
      senderName,
      text: cleanText,
      time: timeLabel,
      createdAt: new Date().toISOString(),
      status: 'sent',
      hasHeart: true,
      msgType,
      mediaUrl: payload.mediaUrl,
      audioDuration: payload.audioDuration,
    };

    const totalSentAfter = chatMessages.filter((m) => m.sender === 'partner').length + 1;

    setChatMessages((prev) =>
      prev.some((m) => m.id === msgId) ? prev : [...prev, optimisticMsg]
    );

    if (!isSpectator) {
      unlockAchievement('ach-chat-first');
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach-chat-10' && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, totalSentAfter) }
            : a
        )
      );
      if (totalSentAfter >= 10) unlockAchievement('ach-chat-10');
      if (msgType === 'audio') {
        unlockAchievement('ach-chat-voice');
      }
      if (msgType === 'image') {
        unlockAchievement('ach-chat-photo');
      }
    }

    const saved = await sendSupabaseMessage({
      id: msgId,
      senderRole,
      senderName,
      text: cleanText,
      timeLabel,
      msgType,
      mediaUrl: payload.mediaUrl,
      audioDuration: payload.audioDuration,
    });

    if (saved) {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...saved, status: m.readAt ? 'read' : 'delivered' } : m))
      );
    }
  };

  const triggerEasterEgg = (id: string) => {
    const egg = easterEggs.find((e) => e.id === id);
    if (!egg) return;

    if (isSpectator) {
      setRecentEasterEgg({ ...egg, discovered: true, rewardClaimed: true, justDiscovered: false });
      soundEngine.playHeartPop();
      return;
    }

    const alreadyClaimed =
      egg.discovered || egg.rewardClaimed || claimedEasterEggIdsRef.current.has(id);

    if (!alreadyClaimed) {
      claimedEasterEggIdsRef.current.add(id);
      const todayLabel = new Date().toLocaleDateString('pt-BR');
      const discoveredCount =
        easterEggs.filter((e) => e.discovered || e.id === id).length;

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
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach-eggs-all' && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, discoveredCount) }
            : a
        )
      );
      addCoins(egg.rewardCoins, `Easter Egg Descoberto!`);
      unlockAchievement('ach-easter-egg');
      if (discoveredCount >= 5) unlockAchievement('ach-eggs-all');
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
    allowSpectatorWorldSaveRef.current = true;
    setConfig((prev) => {
      const next: CoupleConfig = {
        ...prev,
        ...newConfig,
        ...(newConfig.customGlbModels
          ? {
              customGlbModels: {
                pets: { ...(newConfig.customGlbModels.pets || {}) },
                furniture: { ...(newConfig.customGlbModels.furniture || {}) },
              },
            }
          : {}),
      };
      if (newConfig.customGlbModels !== undefined) {
        writeLocalCustomGlbModels(next.customGlbModels);
      }
      return next;
    });
    showToast('Configurações atualizadas!', 'sparkles');
  };

  const updateGameRecord = (partial: Partial<GameRecords>) => {
    if (isSpectator) return;
    const nextGamesCount = partial.gamesPlayed ?? (gameRecords.gamesPlayed || 0) + 1;
    setGameRecords((prev) => ({
      ...prev,
      ...partial,
      gamesPlayed: Math.max(prev.gamesPlayed || 0, nextGamesCount),
    }));
    setAchievements((prev) =>
      prev.map((a) =>
        (a.id === 'ach-arcade-10' || a.id === 'ach-arcade-25') && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextGamesCount) }
          : a
      )
    );
    if (nextGamesCount >= 1) unlockAchievement('ach-memory-game');
    if (nextGamesCount >= 10) unlockAchievement('ach-arcade-10');
    if (nextGamesCount >= 25) unlockAchievement('ach-arcade-25');
  };

  const claimGameReward = (
    gameId: string,
    baseDiamonds: number,
    reason: string,
    score?: number
  ): { rewarded: number; capped: boolean; cooldownSec?: number } => {
    if (isSpectator) {
      return { rewarded: 0, capped: false };
    }

    const now = Date.now();
    const todayKey = new Date().toISOString().split('T')[0];
    const sameDay = gameRecords.dailyPlayDate === todayKey;
    const prevCounts = sameDay ? gameRecords.dailyRewardsCount || {} : {};
    const prevTimestamps = sameDay ? gameRecords.lastRewardAt || {} : {};
    const countToday = prevCounts[gameId] || 0;
    const lastAt = prevTimestamps[gameId] || 0;
    const cooldownMs = 60_000;
    const maxDailyRewardsPerGame = 3;

    const nextGamesCount = (gameRecords.gamesPlayed || 0) + 1;
    const nextHighest = Math.max(gameRecords.highestScore || 0, score ?? 0);

    if (countToday >= maxDailyRewardsPerGame) {
      setGameRecords((prev) => ({
        ...prev,
        dailyPlayDate: todayKey,
        dailyRewardsCount: prevCounts,
        lastRewardAt: prevTimestamps,
        gamesPlayed: nextGamesCount,
        highestScore: nextHighest,
      }));
      showToast(
        'Partida concluída! Limite diário de diamantes neste jogo atingido — continue jogando por diversão!',
        'game'
      );
      return { rewarded: 0, capped: true };
    }

    if (lastAt > 0 && now - lastAt < cooldownMs) {
      const remSec = Math.ceil((cooldownMs - (now - lastAt)) / 1000);
      setGameRecords((prev) => ({
        ...prev,
        dailyPlayDate: todayKey,
        dailyRewardsCount: prevCounts,
        lastRewardAt: prevTimestamps,
        gamesPlayed: nextGamesCount,
        highestScore: nextHighest,
      }));
      showToast(
        `Vitória registrada! Próxima recompensa neste jogo em ${remSec}s.`,
        'clock'
      );
      return { rewarded: 0, capped: true, cooldownSec: remSec };
    }

    const granted = Math.max(1, Math.min(8, Math.round(baseDiamonds)));
    setGameRecords((prev) => ({
      ...prev,
      dailyPlayDate: todayKey,
      dailyRewardsCount: { ...prevCounts, [gameId]: countToday + 1 },
      lastRewardAt: { ...prevTimestamps, [gameId]: now },
      gamesPlayed: nextGamesCount,
      highestScore: nextHighest,
    }));

    setAchievements((prev) =>
      prev.map((a) =>
        (a.id === 'ach-arcade-10' || a.id === 'ach-arcade-25') && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextGamesCount) }
          : a
      )
    );
    unlockAchievement('ach-memory-game');
    if (nextGamesCount >= 10) unlockAchievement('ach-arcade-10');
    if (nextGamesCount >= 25) unlockAchievement('ach-arcade-25');
    addCoins(granted, reason);
    return { rewarded: granted, capped: false };
  };

  const addQuizQuestion = (q: Omit<QuizQuestion, 'id' | 'isCustom'>) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playSparkle();
    const item: QuizQuestion = {
      ...q,
      id: `quiz-custom-${Date.now()}`,
      isCustom: true,
    };
    setCustomQuizQuestions((prev) => [item, ...prev]);
    showToast('Pergunta adicionada ao Mega Quiz!', 'trophy');
  };

  const removeQuizQuestion = (id: string) => {
    allowSpectatorWorldSaveRef.current = true;
    setCustomQuizQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast('Pergunta removida do Quiz.', 'trophy');
  };

  const addTimeCapsule = (capsule: Omit<TimeCapsuleItem, 'id' | 'createdAt'>) => {
    allowSpectatorWorldSaveRef.current = true;
    soundEngine.playSparkle();
    const item: TimeCapsuleItem = {
      ...capsule,
      id: `capsule-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTimeCapsules((prev) => [item, ...prev]);
    showToast('Nova mensagem guardada na Cápsula do Tempo!', 'clock');
  };

  const removeTimeCapsule = (id: string) => {
    allowSpectatorWorldSaveRef.current = true;
    setTimeCapsules((prev) => prev.filter((c) => c.id !== id));
    showToast('Cápsula removida.', 'clock');
  };

  const addCoupleGoal = (goal: Omit<CoupleGoal, 'id' | 'completed'>) => {
    if (guardSpectator()) return;
    soundEngine.playSparkle();
    const item: CoupleGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      completed: false,
      rewardClaimed: false,
    };
    setCoupleGoals((prev) => [item, ...prev]);
    unlockAchievement('ach-goal-first');
    showToast('Novo desejo adicionado à lista do casal!', 'sparkles');
  };

  const updateCoupleGoal = (id: string, updates: Partial<CoupleGoal>) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setCoupleGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Desejo atualizado!', 'sparkles');
  };

  const toggleCoupleGoal = (id: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    const target = coupleGoals.find((g) => g.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const canReward =
      nextCompleted && !target.rewardClaimed && !claimedGoalIdsRef.current.has(id);

    if (canReward) {
      claimedGoalIdsRef.current.add(id);
    }

    const doneAfter = coupleGoals.filter((g) =>
      g.id === id ? nextCompleted : g.completed
    ).length;

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

    if (nextCompleted) {
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach-goal-done3' && !a.unlocked
            ? { ...a, progress: Math.min(a.maxProgress, doneAfter) }
            : a
        )
      );
      if (doneAfter >= 3) unlockAchievement('ach-goal-done3');
    }

    if (canReward) {
      triggerHeartExplosion();
      addCoins(2, 'Desejo do casal realizado!');
    } else if (nextCompleted) {
      showToast('Desejo marcado como realizado!', 'heart');
    }
  };

  const removeCoupleGoal = (id: string) => {
    if (guardSpectator()) return;
    setCoupleGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Item removido da lista de desejos.', 'sparkles');
  };

  const addCalendarEvent = (ev: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (guardSpectator()) return;
    soundEngine.playSparkle();
    const newEvent: CalendarEvent = {
      ...ev,
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
    unlockAchievement('ach-cal-first');
    triggerHeartExplosion();
    showToast(`Evento "${newEvent.title}" salvo no Calendário do Casal!`, 'calendar');
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setCalendarEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev))
    );
    showToast('Evento atualizado no calendário!', 'calendar');
  };

  const removeCalendarEvent = (id: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
    showToast('Evento removido do calendário.', 'calendar');
  };

  const spinDailyWheel = (prizeLabel: string, coinReward: number): boolean => {
    if (guardSpectator()) return false;
    const now = Date.now();
    const effectiveLastSpin = Math.max(
      dailyWheel.lastSpinAt || 0,
      lastWheelSpinRef.current
    );
    const elapsed = now - effectiveLastSpin;
    if (effectiveLastSpin > 0 && elapsed < COOLDOWN_MS.wheel_spin) {
      const remMs = COOLDOWN_MS.wheel_spin - elapsed;
      const hrs = Math.floor(remMs / 3600000);
      const mins = Math.ceil((remMs % 3600000) / 60000);
      showToast(`Recompensa diária já resgatada! Volte em ${hrs}h ${mins}m`, 'clock');
      return false;
    }

    lastWheelSpinRef.current = now;

    setDailyWheel((prev) => ({
      lastSpinAt: now,
      lastPrize: prizeLabel,
      totalSpins: (prev.totalSpins || 0) + 1,
    }));
    const balancedReward = Math.min(8, Math.max(2, coinReward));
    unlockAchievement('ach-wheel-first');
    if (balancedReward > 0) {
      addCoins(balancedReward, `Roleta Diária: ${prizeLabel}`);
    } else {
      soundEngine.playSparkle();
      showToast(`Roleta Diária: ${prizeLabel}`, 'sparkles');
    }
    triggerHeartExplosion();
    return true;
  };

  const openMysteryChest = (): {
    ok: boolean;
    coins?: number;
    prizeText?: string;
    remainingMs?: number;
  } => {
    if (guardSpectator()) return { ok: false };
    const now = Date.now();
    const effectiveLast = Math.max(lastMysteryChestAt || 0, lastMysteryChestRef.current);
    const elapsed = now - effectiveLast;
    if (effectiveLast > 0 && elapsed < COOLDOWN_MS.mystery_chest) {
      const remMs = COOLDOWN_MS.mystery_chest - elapsed;
      showToast(`Baú Misterioso recarregando! Disponível em ${formatCooldownMs(remMs)}`, 'chest');
      return { ok: false, remainingMs: remMs };
    }

    lastMysteryChestRef.current = now;
    setLastMysteryChestAt(now);

    const rewards = [4, 5, 6, 8, 10];
    const roll = rewards[Math.floor(Math.random() * rewards.length)];
    const prizeText = `Tesouro diário de ${roll} diamantes para o casal!`;
    unlockAchievement('ach-chest-first');
    addCoins(roll, 'Baú Misterioso (24h)');
    triggerHeartExplosion(0.5, 0.35);
    return { ok: true, coins: roll, prizeText };
  };

  // --- DREAM HOUSE 3D ACTIONS ---
  const setHouseRoom = (room: HouseRoomId) => {
    const unlocked = dreamHouse.unlockedRooms || ['sala'];
    if (!unlocked.includes(room)) {
      const price = HOUSE_ROOM_PRICES[room] ?? 30;
      showToast(`Cômodo bloqueado! Desbloqueie por ${price} diamantes para construir.`, 'house');
      return;
    }
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, activeRoom: room }));
  };

  const unlockHouseRoom = (room: HouseRoomId): boolean => {
    if (guardSpectator()) return false;
    const unlocked = dreamHouse.unlockedRooms || ['sala'];
    if (unlocked.includes(room)) {
      setDreamHouse((prev) => ({ ...prev, activeRoom: room }));
      return true;
    }
    const price = HOUSE_ROOM_PRICES[room] ?? 30;
    if (!spendCoins(price)) return false;

    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    setDreamHouse((prev) => ({
      ...prev,
      activeRoom: room,
      unlockedRooms: Array.from(new Set([...(prev.unlockedRooms || ['sala']), room])),
    }));
    const roomLabels: Record<HouseRoomId, string> = {
      sala: 'Sala de Estar',
      quarto: 'Quarto Aconchegante',
      cozinha: 'Cozinha Gourmet',
      banheiro: 'Banheiro & Spa',
      varanda: 'Varanda Estrelada',
    };
    showToast(`${roomLabels[room]} desbloqueado! Agora decore do zero ♡`, 'house');
    return true;
  };

  const setHouseWallTheme = (theme: HouseWallTheme) => {
    if (guardSpectator()) return;
    const wallMeta = HOUSE_WALL_THEMES.find((w) => w.id === theme);
    const storeItem = storeItems.find((s) => s.slotType === 'house-wall' && s.targetId === theme);
    if (wallMeta && !wallMeta.unlockedByDefault && storeItem && !storeItem.purchased) {
      showToast(`Desbloqueie "${wallMeta.label}" na Loja ou Missões!`, 'house');
      return;
    }
    soundEngine.playSparkle();
    setDreamHouse((prev) => ({ ...prev, wallTheme: theme, customWallHex: undefined }));
    unlockAchievement('ach-house-wall');
  };

  const setHouseFloorTheme = (theme: HouseFloorTheme) => {
    if (guardSpectator()) return;
    const floorMeta = HOUSE_FLOOR_THEMES.find((f) => f.id === theme);
    const storeItem = storeItems.find((s) => s.slotType === 'house-floor' && s.targetId === theme);
    if (floorMeta && !floorMeta.unlockedByDefault && storeItem && !storeItem.purchased) {
      showToast(`Desbloqueie "${floorMeta.label}" na Loja do Amor!`, 'house');
      return;
    }
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, floorTheme: theme, customFloorHex: undefined }));
  };

  const setHouseCustomWallHex = (hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, customWallHex: hex }));
    unlockAchievement('ach-house-wall');
  };

  const setHouseCustomFloorHex = (hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, customFloorHex: hex }));
  };

  const setHouseDimensions = (width: number, depth: number, wallHeight: number) => {
    if (guardSpectator()) return;
    const snap = (value: number) => Math.round(value / 0.25) * 0.25;
    const safeWidth = Math.max(4, Math.min(12, snap(width)));
    const safeDepth = Math.max(4, Math.min(12, snap(depth)));
    const safeHeight = Math.max(2.2, Math.min(4.5, snap(wallHeight)));
    setDreamHouse((prev) => ({
      ...prev,
      footprintWidth: safeWidth,
      footprintDepth: safeDepth,
      wallHeight: safeHeight,
    }));
  };

  const setHouseCustomWalls = (walls: HouseConstructionWall[]) => {
    if (guardSpectator()) return;
    const safeWalls = walls.slice(0, 80).map((wall) => ({
      ...wall,
      start: {
        x: Math.max(-20, Math.min(20, Math.round(wall.start.x * 4) / 4)),
        z: Math.max(-20, Math.min(20, Math.round(wall.start.z * 4) / 4)),
      },
      end: {
        x: Math.max(-20, Math.min(20, Math.round(wall.end.x * 4) / 4)),
        z: Math.max(-20, Math.min(20, Math.round(wall.end.z * 4) / 4)),
      },
      height: Math.max(2.2, Math.min(4.5, Math.round(wall.height * 4) / 4)),
      thickness: Math.max(0.08, Math.min(0.5, wall.thickness)),
      openings: (wall.openings || []).slice(0, 6).map((opening) => {
        const length = Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
        const safeWidth = Math.max(0.4, Math.min(length - 0.1, opening.width));
        const safeHeight = Math.max(0.4, Math.min(wall.height - 0.1, opening.height));
        const safeSill = Math.max(0, Math.min(wall.height - safeHeight, opening.sillHeight ?? 0));
        return {
          ...opening,
          width: safeWidth,
          height: safeHeight,
          sillHeight: safeSill,
          offset: Math.max(0, Math.min(length - safeWidth, opening.offset)),
        };
      }),
    }));
    setDreamHouse((prev) => ({ ...prev, customWalls: safeWalls }));
  };

  const setHouseCustomCeilingHex = (hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, customCeilingHex: hex }));
  };

  const setHouseFurnitureColor = (furnitureId: string, hex: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({
      ...prev,
      customColors: {
        ...(prev.customColors || {}),
        [furnitureId]: hex,
      },
    }));
  };

  const toggleHouseLights = () => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => ({ ...prev, lightsOn: !prev.lightsOn }));
  };

  const toggleHouseFireplace = () => {
    if (guardSpectator()) return;
    soundEngine.playSparkle();
    setDreamHouse((prev) => ({ ...prev, fireplaceLit: !prev.fireplaceLit }));
  };

  const toggleHouseFurniturePlacement = (furnitureId: string) => {
    if (guardSpectator()) return;
    const item = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnitureId);
    if (!item) return;
    if (!dreamHouse.unlockedFurnitureIds.includes(furnitureId)) {
      showToast(`Adquira "${item.name}" na Loja do Amor primeiro!`, 'shop');
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
        comfortLevel: Math.max(0, Math.min(10, next.length + Object.values(prev.placedFurniture).flat().length)),
      };
    });
  };

  const setHouseFurnitureTransform = (furnitureId: string, transform: HouseFurnitureTransform) => {
    if (guardSpectator()) return;
    setDreamHouse((prev) => ({
      ...prev,
      furnitureTransforms: {
        ...(prev.furnitureTransforms || {}),
        [furnitureId]: transform,
      },
    }));
  };

  const resetHouseFurnitureTransform = (furnitureId: string) => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setDreamHouse((prev) => {
      const next = { ...(prev.furnitureTransforms || {}) };
      delete next[furnitureId];
      return {
        ...prev,
        furnitureTransforms: next,
      };
    });
  };

  const recordHouseVisit = () => {
    if (isSpectator) return;
    setMissionsState((prev) => ({
      ...prev,
      houseVisits: (prev.houseVisits || 0) + 1,
    }));
  };

  const interactHouseFurniture = (furnitureId: string) => {
    soundEngine.playSparkle();
    if (!isSpectator) {
      setDreamHouse((prev) => ({
        ...prev,
        lastInteractedAt: new Date().toISOString(),
        ...(furnitureId === 'house-fireplace' ? { fireplaceLit: !prev.fireplaceLit } : {}),
        ...(furnitureId === 'house-lamp' || furnitureId === 'house-heart-lamp'
          ? { lightsOn: !prev.lightsOn }
          : {}),
        ...(furnitureId === 'house-piano' ? { musicNoteGlow: !prev.musicNoteGlow } : {}),
      }));
    }
    const item = HOUSE_FURNITURE_CATALOG.find((f) => f.id === furnitureId);
    if (item) {
      showToast(`${item.name}: ${item.description}`, 'house');
    }
  };

  // --- AQUARIUM 3D ACTIONS ---
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
    if (guardSpectator()) return false;
    soundEngine.playEat();
    triggerHeartExplosion(0.5, 0.45);
    const nextFeeds = (aquarium.feedCount || 0) + 1;
    setAquarium((prev) => ({
      ...prev,
      fishHunger: Math.min(100, (prev.fishHunger || 60) + 25),
      lastFedAt: new Date().toISOString(),
      feedCount: nextFeeds,
    }));
    setMissionsState((prev) => ({
      ...prev,
      aquariumFeeds: (prev.aquariumFeeds || 0) + 1,
    }));
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-aqua-keeper' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextFeeds) }
          : a
      )
    );
    if (nextFeeds >= 5) unlockAchievement('ach-aqua-keeper');
    addCoins(1, 'Alimentou os peixinhos do Aquário');
    return true;
  };

  const cleanAquarium = (): boolean => {
    if (guardSpectator()) return false;
    soundEngine.playWaterDrop();
    const nextFeeds = (aquarium.feedCount || 0) + 1;
    setAquarium((prev) => ({
      ...prev,
      waterClarity: 100,
      lastCleanedAt: new Date().toISOString(),
      feedCount: nextFeeds,
    }));
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach-aqua-keeper' && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, nextFeeds) }
          : a
      )
    );
    if (nextFeeds >= 5) unlockAchievement('ach-aqua-keeper');
    addCoins(1, 'Água do Aquário cristalina');
    return true;
  };

  const toggleAquariumBubbles = () => {
    if (guardSpectator()) return;
    soundEngine.playHeartPop();
    setAquarium((prev) => ({ ...prev, bubblesActive: !prev.bubblesActive }));
  };

  const setAquariumLightMode = (mode: AquariumLightMode) => {
    if (guardSpectator()) return;
    soundEngine.playSparkle();
    setAquarium((prev) => ({ ...prev, lightMode: mode }));
  };

  const toggleAquariumFish = (fishId: string) => {
    if (guardSpectator()) return;
    if (!aquarium.unlockedFishIds.includes(fishId)) {
      const sp = AQUARIUM_SPECIES_CATALOG.find((f) => f.id === fishId);
      showToast(
        sp?.linkedPetType
          ? `Adote o ${sp.name} na Loja de Mascotes para vê-lo nadando aqui!`
          : `Desbloqueie "${sp?.name || 'Espécie'}" na Loja do Amor!`,
        'aqua'
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
    if (guardSpectator()) return;
    if (!aquarium.unlockedDecorIds.includes(decorId)) {
      showToast('Adquira esta decoração na Loja do Amor!', 'aqua');
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

  // --- SEASONAL EVENTS (STRICTLY AUTOMATIC) & MISSIONS & VIRTUAL CAMERA ---
  const resolvedSeasonal = resolveActiveSeasonalEvent(
    seasonalState,
    config.anniversaryDate,
    calendarEvents
  );

  const setSeasonalMode = (_mode: 'auto' | 'preview', _previewEvent: SeasonalEventId = 'normal') => {
    soundEngine.playHeartPop();
    setSeasonalState((prev) => ({
      ...prev,
      mode: 'auto',
      previewEvent: 'normal',
    }));
    showToast('Eventos sazonais sincronizados automaticamente com o calendário!', 'calendar');
  };

  const claimSeasonalProp = (propId: string, rewardCoins: number, label: string): boolean => {
    if (guardSpectator()) return false;
    if (seasonalState.claimedProps.includes(propId)) {
      soundEngine.playHeartPop();
      showToast(`${label} — mimo já coletado nesta temporada!`, 'sparkles');
      return false;
    }
    setSeasonalState((prev) => ({
      ...prev,
      claimedProps: prev.claimedProps.includes(propId) ? prev.claimedProps : [...prev.claimedProps, propId],
    }));
    triggerHeartExplosion(0.5, 0.3);
    addCoins(Math.min(4, rewardCoins), label);
    return true;
  };

  const claimIntegratedMission = (missionId: string): boolean => {
    if (guardSpectator()) return false;
    if (missionsState.claimedIds.includes(missionId)) return false;
    const mission = INTEGRATED_MISSIONS_CATALOG.find((m) => m.id === missionId);
    if (!mission) return false;

    const claimedAfter = missionsState.claimedIds.length + 1;
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

    setAchievements((prev) =>
      prev.map((a) =>
        (a.id === 'ach-mission-3' || a.id === 'ach-mission-all') && !a.unlocked
          ? { ...a, progress: Math.min(a.maxProgress, claimedAfter) }
          : a
      )
    );
    if (claimedAfter >= 3) unlockAchievement('ach-mission-3');
    if (claimedAfter >= 6) unlockAchievement('ach-mission-all');

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
      showToast('Aguarde a cena 3D carregar para tirar a foto!', 'camera');
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
    if (!isSpectator) {
      setMissionsState((prev) => ({
        ...prev,
        virtualSnapshotsTaken: (prev.virtualSnapshotsTaken || 0) + 1,
      }));
    }
    triggerHeartExplosion(0.5, 0.4);
    return true;
  };

  const resetAllData = async () => {
    setJourneyStarted(false);
    try {
      await clearSupabaseWorld();
      await clearCloudWorld().catch(() => {});
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
        viewerRole,
        isSpectator,
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
        onlinePeers,
        inAppChatToast,
        dismissInAppChatToast,
        notificationPermission,
        requestNotificationPermission,
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
        lastMysteryChestAt,
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
        isPermissionsModalOpen,
        setIsPermissionsModalOpen,
        dismissPermissionsPrompt,
        setIsLoggedIn,
        lockApp,
        unlockWithPasscode,
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
        setPetColor,
        setPetPartColor,
        clearPetPartColors,
        setAccessoryColor,
        waterLoveTree,
        sunLoveTree,
        pruneLoveTree,
        addPromiseRibbon,
        harvestTreeFruit,
        plantLoveSeed,
        sendChatMessage,
        isFloatingChatOpen,
        setIsFloatingChatOpen,
        unreadChatCount,
        markChatRead,
        triggerEasterEgg,
        closeEasterEggModal,
        showToast,
        updateConfig,
        updateGameRecord,
        claimGameReward,
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
        openMysteryChest,
        setHouseRoom,
        unlockHouseRoom,
        setHouseWallTheme,
        setHouseFloorTheme,
        setHouseCustomWallHex,
        setHouseCustomFloorHex,
        setHouseCustomCeilingHex,
        setHouseDimensions,
        setHouseCustomWalls,
        setHouseFurnitureColor,
        toggleHouseLights,
        toggleHouseFireplace,
        toggleHouseFurniturePlacement,
        setHouseFurnitureTransform,
        resetHouseFurnitureTransform,
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
