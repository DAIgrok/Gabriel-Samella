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
  DailyMessage,
  EasterEgg,
  ExtendedView,
  KittenState,
  Letter,
  LoveTreeState,
  MemoryPhoto,
  PetType,
  Phrase,
  Song,
  StoreItem,
} from '../types';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_COUPLE_CONFIG,
  INITIAL_DAILY_MESSAGES,
  INITIAL_EASTER_EGGS,
  INITIAL_KITTEN,
  INITIAL_LETTERS,
  INITIAL_PHOTOS,
  INITIAL_PHRASES,
  INITIAL_SONGS,
  INITIAL_STORE_ITEMS,
  INITIAL_TREE_STATE,
  PET_SPECIES_CATALOG,
} from '../data/initialData';
import { soundEngine } from '../utils/audioSynth';
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
  removeSong: (id: string) => void;
  unlockAchievement: (id: string) => void;
  buyStoreItem: (id: string) => boolean;
  redeemVoucher: (id: string) => void;
  petKitten: (part?: 'head' | 'belly' | 'paw') => void;
  feedKitten: (foodName?: string, hungerBoost?: number, happyBoost?: number) => void;
  giveWaterKitten: () => void;
  batheKitten: (boostAmount?: number) => void;
  toggleSleepKitten: () => void;
  playWithKitten: (toyName?: string) => void;
  equipKittenItem: (itemId: string, category: 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses') => void;
  switchPet: (petType: PetType) => void;
  renamePet: (newName: string) => void;
  adoptPet: (petType: PetType) => void;
  waterLoveTree: () => void;
  sunLoveTree: () => void;
  pruneLoveTree: () => void;
  addPromiseRibbon: (promiseText: string) => void;
  harvestTreeFruit: (index: number) => string;
  sendChatMessage: (text: string) => void;
  triggerEasterEgg: (id: string) => void;
  closeEasterEggModal: () => void;
  showToast: (text: string, icon?: string, reward?: number) => void;
  updateConfig: (newConfig: Partial<CoupleConfig>) => void;
  updateGameRecord: (partial: Partial<GameRecords>) => void;
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

  const addPhoto = (newPhotoData: Omit<MemoryPhoto, 'id' | 'index'>) => {
    soundEngine.playSparkle();
    const newPhoto: MemoryPhoto = {
      ...newPhotoData,
      id: `photo-${Date.now()}`,
      index: photos.length + 1,
      isFavorite: false,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    showToast('Nova foto adicionada ao álbum! 📸✨');
    unlockAchievement('ach-photo-album');
  };

  const removePhoto = (id: string) => {
    soundEngine.playHeartPop();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    showToast('Foto removida da galeria.');
  };

  const playSong = (song?: Song) => {
    const target = song || currentSong;
    setCurrentSong(target);
    setIsPlaying(true);
    soundEngine.startSongMelody(target.id);
    unlockAchievement('ach-first-song');
  };

  const pauseSong = () => {
    setIsPlaying(false);
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
      soundEngine.startSongMelody(nextItem.id);
    }
  };

  const prevSong = () => {
    const curIdx = songs.findIndex((s) => s.id === currentSong.id);
    const prevIdx = (curIdx - 1 + songs.length) % songs.length;
    const prevItem = songs[prevIdx];
    setCurrentSong(prevItem);
    setPlaybackTime(0);
    if (isPlaying) {
      soundEngine.startSongMelody(prevItem.id);
    }
  };

  const seekSong = (time: number) => {
    setPlaybackTime(time);
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

  const removeSong = (id: string) => {
    soundEngine.playHeartPop();
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
      addCoins(10, `${displayPet} subiu para o Nível ${leveledUpTo}!`);
    }
  };

  const petKitten = () => {
    soundEngine.playPurr();
    triggerHeartExplosion(0.5, 0.4);
    let reached10 = false;
    let rewardCoin = false;
    let petLabel = 'seu mascote';

    setKitten((prev) => {
      const newPetCount = (prev.petCount || 0) + 1;
      petLabel = getSpeciesDisplayName(prev.petType, prev.name);
      if (newPetCount === 10) reached10 = true;
      if (newPetCount % 6 === 0) rewardCoin = true;

      return {
        ...prev,
        happiness: Math.min(100, (prev.happiness || 50) + 5),
        fun: Math.min(100, (prev.fun || 50) + 5),
        affectionLevel: (prev.affectionLevel || 0) + 1,
        mood: 'ronronando',
        petCount: newPetCount,
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
    if (rewardCoin) addCoins(1, `Carinho em ${petLabel}`);
    gainKittenXp(5);
  };

  const feedKitten = (foodName = 'Comidinha Especial', hungerBoost = 30, happyBoost = 10) => {
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
    }));
    gainKittenXp(12);
    showToast(`${label} saboreou ${foodName}!`, '😋');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isEating: false }));
    }, 1800);
  };

  const giveWaterKitten = () => {
    soundEngine.playDrink();
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      thirst: Math.min(100, (prev.thirst || 50) + 35),
      happiness: Math.min(100, (prev.happiness || 50) + 5),
      mood: 'feliz',
      isDrinking: true,
    }));
    gainKittenXp(8);
    showToast(`${label} bebeu água fresquinha! 💧`, '🥛');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isDrinking: false }));
    }, 1600);
  };

  const batheKitten = (boostAmount = 100) => {
    soundEngine.playBathSplash();
    triggerHeartExplosion(0.5, 0.4);
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      hygiene: boostAmount >= 100 ? 100 : Math.min(100, (prev.hygiene || 50) + boostAmount),
      happiness: Math.min(100, (prev.happiness || 50) + 8),
      mood: 'feliz',
      isBathing: true,
      lastBathed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }));
    gainKittenXp(12);
    if (boostAmount >= 100) {
      showToast(`${label} tomou um banho fresquinho e ficou cheiroso! 🫧`, '🛁');
    }
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isBathing: false }));
    }, 2000);
  };

  const toggleSleepKitten = () => {
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => {
      const willSleep = !prev.isSleeping;
      if (willSleep) {
        soundEngine.playSleepSnore();
        showToast(`${label} apagou o abajur para descansar... 💤`, '🌙');
        return {
          ...prev,
          isSleeping: true,
          mood: 'dormindo',
          energy: Math.min(100, (prev.energy || 50) + 15),
          lastSlept: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        soundEngine.playMeowHappy();
        showToast(`${label} acordou cheio de energia! ☀️`, '✨');
        return {
          ...prev,
          isSleeping: false,
          mood: 'feliz',
          energy: Math.min(100, (prev.energy || 50) + 25),
        };
      }
    });
  };

  const playWithKitten = (toyName = 'Novelo de Lã') => {
    soundEngine.playToyBoing();
    triggerHeartExplosion(0.5, 0.4);
    const label = getSpeciesDisplayName(kitten.petType, kitten.name);
    setKitten((prev) => ({
      ...prev,
      fun: Math.min(100, (prev.fun || 50) + 30),
      energy: Math.max(10, (prev.energy || 80) - 10),
      hygiene: Math.max(15, (prev.hygiene || 70) - 5),
      happiness: Math.min(100, (prev.happiness || 50) + 15),
      mood: 'brincalhao',
      isPlayMode: true,
      lastPlayed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }));
    gainKittenXp(16);
    showToast(`${label} brincou alegremente com ${toyName}!`, '🐾');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isPlayMode: false }));
    }, 2000);
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

  const applyTreeXpGain = (xpGain: number, careType: 'water' | 'sun' | 'prune') => {
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
      };
    });

    if (evolvedTo > 0) {
      addCoins(10, `Árvore do Amor evoluiu para Nv.${evolvedTo} 🌳`);
      if (evolvedTo >= 2) unlockAchievement('ach-tree-lvl2');
      if (evolvedTo >= 5) unlockAchievement('ach-tree-lvl5');
      if (evolvedTo >= 8) unlockAchievement('ach-tree-lvl8');
      if (evolvedTo >= 10) unlockAchievement('ach-tree-lvl10');
    }
  };

  const waterLoveTree = () => {
    soundEngine.playWaterDrop();
    setTreeWaterCount((prev) => prev + 1);
    applyTreeXpGain(25, 'water');
    unlockAchievement('ach-tree-water');
    addCoins(2, 'Regou a Árvore do Amor 🌱');
    triggerHeartExplosion(0.5, 0.4);
  };

  const sunLoveTree = () => {
    soundEngine.playSparkle();
    applyTreeXpGain(20, 'sun');
    triggerHeartExplosion(0.5, 0.3);
    addCoins(1, 'Banho de Sol na Árvore ☀️');
  };

  const pruneLoveTree = () => {
    soundEngine.playHeartPop();
    applyTreeXpGain(15, 'prune');
    triggerHeartExplosion(0.5, 0.35);
    addCoins(1, 'Cuidado de Jardinagem 🌿');
  };

  const addPromiseRibbon = (promiseText: string) => {
    if (!promiseText.trim()) return;
    soundEngine.playSparkle();
    setTreeState((prev) => ({
      ...prev,
      promiseRibbons: [...(prev.promiseRibbons || []), promiseText.trim()],
    }));
    addCoins(5, 'Fita de Promessa amarrada nos galhos 🎀');
    triggerHeartExplosion(0.5, 0.4);
  };

  const harvestTreeFruit = (index: number): string => {
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
    }));
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
