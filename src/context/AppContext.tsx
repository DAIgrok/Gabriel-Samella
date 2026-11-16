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
  ChatMessage,
  CoupleConfig,
  CoupleGoal,
  DailyMessage,
  DailyWheelState,
  EasterEgg,
  ExtendedView,
  KittenState,
  Letter,
  LoveTreeState,
  MemoryPhoto,
  PetType,
  Phrase,
  QuizQuestion,
  Song,
  StoreItem,
  TimeCapsuleItem,
} from '../types';
import {
  COOLDOWN_MS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_COUPLE_CONFIG,
  INITIAL_COUPLE_GOALS,
  INITIAL_DAILY_MESSAGES,
  INITIAL_DAILY_WHEEL,
  INITIAL_EASTER_EGGS,
  INITIAL_KITTEN,
  INITIAL_LETTERS,
  INITIAL_PHOTOS,
  INITIAL_PHRASES,
  INITIAL_SONGS,
  INITIAL_STORE_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_TREE_STATE,
  PET_SPECIES_CATALOG,
} from '../data/initialData';
import { soundEngine } from '../utils/audioSynth';
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
  GameRecords,
  loadCloudWorld,
  saveCloudWorld,
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
  currentSong: Song;
  isPlaying: boolean;
  playbackTime: number;
  achievements: Achievement[];
  storeItems: StoreItem[];
  kitten: KittenState;
  chatMessages: ChatMessage[];
  easterEggs: EasterEgg[];
  recentEasterEgg: EasterEgg | null;
  toastMessage: { text: string; icon?: string; reward?: number } | null;
  treeWaterCount: number;
  treeState: LoveTreeState;
  loveTree: LoveTreeState;
  hasSeenIntro: boolean;
  gameRecords: GameRecords;
  customQuizQuestions: QuizQuestion[];
  timeCapsules: TimeCapsuleItem[];
  coupleGoals: CoupleGoal[];
  dailyWheel: DailyWheelState;

  // Google Drive & Auth
  isGoogleConnected: boolean;
  googleUser: User | null;
  isDriveSyncing: boolean;
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
  toggleCoupleGoal: (id: string) => void;
  removeCoupleGoal: (id: string) => void;
  spinDailyWheel: (prizeLabel: string, coinReward: number) => boolean;
  triggerHeartExplosion: (x?: number, y?: number) => void;
  heartRainTriggerCount: number;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'NOSSO_MUNDO_APP_STATE_V3';
const UNLOCK_STORAGE_KEY = 'NOSSO_MUNDO_UNLOCKED_V3';

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

  const [letters, setLetters] = useState<Letter[]>(
    mergeInitialItems(savedData?.letters, INITIAL_LETTERS)
  );
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const [photos, setPhotos] = useState<MemoryPhoto[]>(
    mergeInitialItems(savedData?.photos, INITIAL_PHOTOS)
  );
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);

  const [songs, setSongs] = useState<Song[]>(
    mergeInitialItems(savedData?.songs, INITIAL_SONGS)
  );
  const [currentSong, setCurrentSong] = useState<Song>(
    savedData?.songs?.[0] || INITIAL_SONGS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
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
  const [recentEasterEgg, setRecentEasterEgg] = useState<EasterEgg | null>(null);

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
  const [coupleGoals, setCoupleGoals] = useState<CoupleGoal[]>(
    mergeInitialItems(savedData?.coupleGoals, INITIAL_COUPLE_GOALS)
  );
  const [dailyWheel, setDailyWheel] = useState<DailyWheelState>(
    savedData?.dailyWheel || INITIAL_DAILY_WHEEL
  );
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    icon?: string;
    reward?: number;
  } | null>(null);

  // Google Drive & Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveSyncError, setDriveSyncError] = useState<string | null>(null);

  const cloudHydratedRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);

  const getSpeciesDisplayName = (petType?: PetType, customName?: string) => {
    if (customName && customName.trim()) return customName.trim();
    const spec = PET_SPECIES_CATALOG.find((s) => s.type === (petType || 'cat'));
    return spec ? spec.name : 'Gatinho';
  };

  // Hydrate from Cloud Firestore on initial boot (when Samella opens QR again on any device)
  useEffect(() => {
    let active = true;
    const bootstrapCloud = async () => {
      try {
        await testFirestoreConnection();
        const cloud: CloudWorldPayload | null = await loadCloudWorld();
        if (!active) return;

        if (cloud && cloud.journeyStarted) {
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

          if (cloud.lettersState) {
            const readSet = new Set(cloud.lettersState.readIds || []);
            const favSet = new Set(cloud.lettersState.favoriteIds || []);
            const unsealedMap = cloud.lettersState.unsealedMap || {};
            const baseLetters = INITIAL_LETTERS.map((l) => ({
              ...l,
              read: readSet.has(l.id),
              isFavorite: favSet.has(l.id),
              unsealedAt: unsealedMap[l.id] || l.unsealedAt,
            }));
            const custom = cloud.lettersState.customLetters || [];
            setLetters([...custom, ...baseLetters]);
          }

          if (cloud.achievementsState) {
            setAchievements(
              INITIAL_ACHIEVEMENTS.map((a) => {
                const st = cloud.achievementsState[a.id];
                if (!st) return a;
                return {
                  ...a,
                  unlocked: Boolean(st.unlocked),
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
                return {
                  ...egg,
                  discovered: Boolean(st.discovered),
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
            setSongs((prev) => mergeInitialItems(prev, cloud.customSongs));
          }

          if (cloud.customQuizQuestions && cloud.customQuizQuestions.length > 0) {
            setCustomQuizQuestions(cloud.customQuizQuestions);
          }

          if (cloud.timeCapsules && cloud.timeCapsules.length > 0) {
            setTimeCapsules((prev) => mergeInitialItems(cloud.timeCapsules, prev));
          }

          if (cloud.coupleGoals && cloud.coupleGoals.length > 0) {
            setCoupleGoals((prev) => mergeInitialItems(cloud.coupleGoals, prev));
          }

          if (cloud.dailyWheelState) {
            setDailyWheel(cloud.dailyWheelState);
          }
        }
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Sincronização inicial em nuvem aguardando:', err);
      } finally {
        cloudHydratedRef.current = true;
      }
    };

    bootstrapCloud();
    return () => {
      active = false;
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
      setDriveSyncError(null);
      const drivePhotos = await fetchDriveFolderPhotos(TARGET_DRIVE_FOLDER_ID, token);
      if (drivePhotos && drivePhotos.length > 0) {
        setPhotos(drivePhotos);
        soundEngine.playSparkle();
        showToast(`${drivePhotos.length} fotos sincronizadas do Google Drive! 📸`, '📸', 20);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao sincronizar pasta do Google Drive';
      console.warn('Sync drive folder notice:', err);
      setDriveSyncError(msg);
    } finally {
      setIsDriveSyncing(false);
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

    try {
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
        dailyWheel,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // storage quota or private mode
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
        dailyWheelState: dailyWheel,
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
    dailyWheel,
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

  // Audio timer ticker when playing
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= currentSong.duration) {
            const curIdx = songs.findIndex((s) => s.id === currentSong.id);
            const nextIdx = (curIdx + 1) % songs.length;
            setCurrentSong(songs[nextIdx]);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong, songs]);

  const showToast = (text: string, icon = '💖', reward?: number) => {
    setToastMessage({ text, icon, reward });
    setTimeout(() => {
      setToastMessage(null);
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
    let rewardToGrant = 0;
    let unlockedTitle = '';

    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          rewardToGrant = ach.rewardCoins;
          unlockedTitle = ach.title;
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toLocaleDateString('pt-BR'),
            progress: ach.maxProgress,
          };
        }
        return ach;
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
    setLetters((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          if (!l.read) {
            addCoins(l.rewardCoins, `Carta lida: "${l.title}"`);
            unlockAchievement('ach-first-letter');
          }
          return { ...l, read: true, unsealedAt: l.unsealedAt || new Date().toLocaleDateString('pt-BR') };
        }
        return l;
      })
    );
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
    };
    setLetters((prev) => [newLetter, ...prev]);
    showToast('Nova carta adicionada com sucesso! 💌');
  };

  const toggleFavoritePhoto = (id: string) => {
    soundEngine.playHeartPop();
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const updatePhotoUrl = (id: string, url: string, title?: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, url, title: title || p.title } : p))
    );
    showToast('Foto atualizada com sucesso! 📸');
  };

  const editPhoto = (id: string, updates: Partial<MemoryPhoto>) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Detalhes da foto atualizados! ✨');
  };

  const togglePhotoInLoop = (id: string) => {
    soundEngine.playHeartPop();
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inHomeLoop: !p.inHomeLoop } : p))
    );
  };

  const addPhoto = (newPhotoData: Omit<MemoryPhoto, 'id' | 'index'>) => {
    soundEngine.playSparkle();
    const newPhoto: MemoryPhoto = {
      ...newPhotoData,
      id: `photo-${Date.now()}`,
      index: photos.length + 1,
      isFavorite: false,
      inHomeLoop: newPhotoData.inHomeLoop ?? true,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    showToast('Nova foto adicionada ao álbum! 📸✨');
    unlockAchievement('ach-photo-album');
  };

  const removePhoto = (id: string) => {
    soundEngine.playHeartPop();
    const target = photos.find((p) => p.id === id);
    if (target?.url.startsWith('idb://')) {
      deleteMediaBlob(target.url).catch(() => {});
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Foto removida da galeria.');
  };

  const playSong = (song?: Song) => {
    const target = song || currentSong;
    setCurrentSong(target);
    setIsPlaying(true);
    realAudio.playSong(target);
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
      playSong(currentSong);
    }
  };

  const nextSong = () => {
    const curIdx = songs.findIndex((s) => s.id === currentSong.id);
    const nextIdx = (curIdx + 1) % songs.length;
    const nextItem = songs[nextIdx];
    setCurrentSong(nextItem);
    setPlaybackTime(0);
    if (isPlaying) {
      realAudio.playSong(nextItem);
    }
  };

  const prevSong = () => {
    const curIdx = songs.findIndex((s) => s.id === currentSong.id);
    const prevIdx = (curIdx - 1 + songs.length) % songs.length;
    const prevItem = songs[prevIdx];
    setCurrentSong(prevItem);
    setPlaybackTime(0);
    if (isPlaying) {
      realAudio.playSong(prevItem);
    }
  };

  const seekSong = (time: number) => {
    setPlaybackTime(time);
    realAudio.seek(time);
  };

  const toggleFavoriteSong = (id: string) => {
    soundEngine.playHeartPop();
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const addSong = (newSongData: Omit<Song, 'id'>) => {
    soundEngine.playSparkle();
    const newSong: Song = {
      ...newSongData,
      id: `song-${Date.now()}`,
      isFavorite: false,
    };
    setSongs((prev) => [...prev, newSong]);
    showToast(`Música "${newSong.title}" adicionada à playlist! 🎵✨`);
  };

  const editSong = (id: string, updates: Partial<Song>) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    setCurrentSong((prev) => (prev.id === id ? { ...prev, ...updates } : prev));
    showToast('Música atualizada! 🎶');
  };

  const removeSong = (id: string) => {
    soundEngine.playHeartPop();
    const target = songs.find((s) => s.id === id);
    if (target?.audioUrl?.startsWith('idb://')) {
      deleteMediaBlob(target.audioUrl).catch(() => {});
    }
    setSongs((prev) => prev.filter((s) => s.id !== id));
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
    if (!egg.discovered) {
      setEasterEggs((prev) =>
        prev.map((e) => (e.id === id ? { ...e, discovered: true, discoveredAt: 'Hoje' } : e))
      );
      addCoins(egg.rewardCoins, `Easter Egg Descoberto!`);
      unlockAchievement('ach-easter-egg');
    }
    setRecentEasterEgg(egg);
    triggerHeartExplosion();
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
      id: `goal-${Date.now()}`,
      completed: false,
    };
    setCoupleGoals((prev) => [item, ...prev]);
    showToast('Novo sonho adicionado à lista do casal! ✨');
  };

  const toggleCoupleGoal = (id: string) => {
    soundEngine.playHeartPop();
    let justCompleted = false;
    setCoupleGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextCompleted = !g.completed;
        if (nextCompleted) justCompleted = true;
        return {
          ...g,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toLocaleDateString('pt-BR') : undefined,
        };
      })
    );
    if (justCompleted) {
      triggerHeartExplosion();
      addCoins(5, 'Meta do casal realizada!');
    }
  };

  const removeCoupleGoal = (id: string) => {
    setCoupleGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Meta removida.');
  };

  const spinDailyWheel = (prizeLabel: string, coinReward: number): boolean => {
    const now = Date.now();
    const elapsed = now - (dailyWheel.lastSpinAt || 0);
    if (dailyWheel.lastSpinAt > 0 && elapsed < COOLDOWN_MS.wheel_spin) {
      return false;
    }
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
        dailyWheel,
        isGoogleConnected,
        googleUser,
        isDriveSyncing,
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
        toggleCoupleGoal,
        removeCoupleGoal,
        spinDailyWheel,
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
