import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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

interface AppContextType {
  // State
  config: CoupleConfig;
  coins: number;
  activeTab: ActiveTab;
  extendedView: ExtendedView;
  isDrawerOpen: boolean;
  isLoggedIn: boolean;
  isLoadingDone: boolean;
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
  playSong: (song?: Song) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekSong: (time: number) => void;
  toggleFavoriteSong: (id: string) => void;
  unlockAchievement: (id: string) => void;
  buyStoreItem: (id: string) => boolean;
  redeemVoucher: (id: string) => void;
  petKitten: (part?: 'head' | 'belly' | 'paw') => void;
  feedKitten: (foodName?: string) => void;
  giveWaterKitten: () => void;
  batheKitten: () => void;
  toggleSleepKitten: () => void;
  playWithKitten: (toyName?: string) => void;
  equipKittenItem: (itemId: string, category: 'hat' | 'accessory' | 'outfit') => void;
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
  triggerHeartExplosion: (x?: number, y?: number) => void;
  heartRainTriggerCount: number;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'NOSSO_MUNDO_APP_STATE_V2';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or defaults
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  };

  const savedData = loadSavedState();

  const mergeInitialItems = <T extends { id: string }>(savedList: T[] | undefined, initialList: T[]): T[] => {
    if (!savedList || savedList.length === 0) return initialList;
    const existingIds = new Set(savedList.map((item) => item.id));
    const newItems = initialList.filter((item) => !existingIds.has(item.id));
    return [...savedList, ...newItems];
  };

  const [config, setConfig] = useState<CoupleConfig>(savedData?.config || INITIAL_COUPLE_CONFIG);
  const [coins, setCoins] = useState<number>(savedData?.coins ?? 50); // Starts with 50 💎
  const [activeTab, setActiveTabState] = useState<ActiveTab>('inicio');
  const [extendedView, setExtendedViewState] = useState<ExtendedView>('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingDone, setIsLoadingDone] = useState(false);
  const [hasSeenIntro] = useState(false);

  const [phrases, setPhrases] = useState<Phrase[]>(mergeInitialItems(savedData?.phrases, INITIAL_PHRASES));
  const [dailyMessages] = useState<DailyMessage[]>(INITIAL_DAILY_MESSAGES);
  const [currentDailyIndex, setCurrentDailyIndex] = useState<number>(savedData?.currentDailyIndex ?? 0);

  const [letters, setLetters] = useState<Letter[]>(mergeInitialItems(savedData?.letters, INITIAL_LETTERS));
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  const [photos, setPhotos] = useState<MemoryPhoto[]>(mergeInitialItems(savedData?.photos, INITIAL_PHOTOS));
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);

  const [songs, setSongs] = useState<Song[]>(mergeInitialItems(savedData?.songs, INITIAL_SONGS));
  const [currentSong, setCurrentSong] = useState<Song>(savedData?.songs ? savedData.songs[0] : INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(45);

  const [achievements, setAchievements] = useState<Achievement[]>(mergeInitialItems(savedData?.achievements, INITIAL_ACHIEVEMENTS));
  const [storeItems, setStoreItems] = useState<StoreItem[]>(mergeInitialItems(savedData?.storeItems, INITIAL_STORE_ITEMS));
  const [kitten, setKitten] = useState<KittenState>(savedData?.kitten || INITIAL_KITTEN);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(savedData?.chatMessages || INITIAL_CHAT_MESSAGES);
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(savedData?.easterEggs || INITIAL_EASTER_EGGS);
  const [recentEasterEgg, setRecentEasterEgg] = useState<EasterEgg | null>(null);

  const [treeWaterCount, setTreeWaterCount] = useState<number>(savedData?.treeWaterCount ?? 3);
  const [treeState, setTreeState] = useState<LoveTreeState>(savedData?.treeState || INITIAL_TREE_STATE);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon?: string; reward?: number } | null>(null);

  // Google Drive & Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveSyncError, setDriveSyncError] = useState<string | null>(null);

  // Init Google Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
        if (token) {
          // Attempt auto-sync of photos if connected
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
    } catch (err: any) {
      console.warn('Sync drive folder notice:', err);
      setDriveSyncError(err.message || 'Erro ao sincronizar pasta do Google Drive');
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
    } catch (err: any) {
      console.error('Google drive sign in failed:', err);
      setDriveSyncError(err.message || 'Não foi possível conectar a conta do Google Drive');
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

  // Sync to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
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
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // storage quota or private mode
    }
  }, [config, coins, currentDailyIndex, letters, photos, songs, achievements, storeItems, kitten, chatMessages, easterEggs, treeWaterCount, treeState, phrases]);

  // Audio timer ticker when playing
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= currentSong.duration) {
            // Next song loop
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

  const triggerHeartExplosion = (x = 0.5, y = 0.5) => {
    soundEngine.playHeartPop();
    setHeartRainTriggerCount(prev => prev + 1);
  };

  const setActiveTab = (tab: ActiveTab) => {
    soundEngine.playHeartPop();
    setActiveTabState(tab);
    setExtendedViewState(tab);
  };

  const setExtendedView = (view: ExtendedView) => {
    soundEngine.playHeartPop();
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
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          addCoins(ach.rewardCoins, `Conquista: ${ach.title}`);
          triggerHeartExplosion();
          return {
            ...ach,
            unlocked: true,
            unlockedAt: 'Hoje',
            progress: ach.maxProgress,
          };
        }
        return ach;
      })
    );
  };

  const nextDailyMessage = () => {
    soundEngine.playHeartPop();
    if (dailyMessages.length <= 1) return;
    // Pick randomly from messages, avoiding the current and immediate previous
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

      // Handle pet adoption: immediately activate the new pet and add to inventory
      if (item.category === 'pets' || (item.petTypeTarget && item.petTypeTarget !== 'all')) {
        const targetType = (item.petTypeTarget || 'cat') as PetType;
        const speciesInfo = PET_SPECIES_CATALOG.find((s) => s.type === targetType);
        setKitten((prev) => {
          const owned = prev.ownedPets || ['cat'];
          const newOwned = owned.includes(targetType) ? owned : [...owned, targetType];
          return {
            ...prev,
            ownedPets: newOwned,
            petType: targetType,
            name: speciesInfo ? speciesInfo.defaultName : prev.name,
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
          if (item.id === 'item-tree-magic-butterfly' && !prev.creaturesUnlocked.includes('Borboleta Lilás')) {
            return { ...prev, creaturesUnlocked: [...prev.creaturesUnlocked, 'Borboleta Lilás'] };
          }
          if (item.id === 'item-tree-songbird' && !prev.creaturesUnlocked.includes('Passarinho Cantor')) {
            return { ...prev, creaturesUnlocked: [...prev.creaturesUnlocked, 'Passarinho Cantor'] };
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
    setKitten((prev) => {
      let newXp = (prev.xp || 0) + amount;
      let newLevel = prev.level || 1;
      let newMaxXp = prev.maxXp || 100;
      let leveledUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.round(newMaxXp * 1.35);
        leveledUp = true;
      }

      if (leveledUp) {
        soundEngine.playSparkle();
        triggerHeartExplosion();
        showToast(`Mimi subiu para o Nível ${newLevel}! 🎉`, '👑', 15);
        addCoins(15, `Subiu para o Nível ${newLevel} do Gatinho`);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
      };
    });
  };

  const petKitten = () => {
    soundEngine.playPurr();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => {
      const newPetCount = (prev.petCount || 0) + 1;
      if (newPetCount === 10) {
        unlockAchievement('ach-pet-cat');
      }
      return {
        ...prev,
        happiness: Math.min(100, (prev.happiness || 50) + 5),
        fun: Math.min(100, (prev.fun || 50) + 4),
        mood: 'ronronando',
        petCount: newPetCount,
      };
    });

    gainKittenXp(5);
    // Harder coin economy: 1 diamond every 6 pets
    setKitten((prev) => {
      if (prev.petCount % 6 === 0) {
        addCoins(1, 'Carinho dedicado ao Mimi');
      }
      return prev;
    });
  };

  const feedKitten = (foodName = 'Peixinho Delicioso 🐟') => {
    soundEngine.playEat();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => ({
      ...prev,
      hunger: Math.min(100, (prev.hunger || 50) + 30),
      happiness: Math.min(100, (prev.happiness || 50) + 10),
      mood: 'feliz',
      isEating: true,
      lastFed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }));
    gainKittenXp(12);
    showToast(`Mimi devorou o ${foodName}!`, '😋');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isEating: false }));
    }, 2000);
  };

  const giveWaterKitten = () => {
    soundEngine.playDrink();
    setKitten((prev) => ({
      ...prev,
      thirst: Math.min(100, (prev.thirst || 50) + 35),
      happiness: Math.min(100, (prev.happiness || 50) + 5),
      mood: 'feliz',
      isDrinking: true,
    }));
    gainKittenXp(8);
    showToast('Mimi bebeu água fresquinha e matou a sede! 💧', '🥛');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isDrinking: false }));
    }, 1800);
  };

  const batheKitten = () => {
    soundEngine.playBathSplash();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => ({
      ...prev,
      hygiene: 100,
      happiness: Math.min(100, (prev.happiness || 50) + 8),
      mood: 'feliz',
      isBathing: true,
      lastBathed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }));
    gainKittenXp(15);
    showToast('Mimi tomou banho de espuminha e ficou cheirosinho! 🫧', '🛁');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isBathing: false }));
    }, 2500);
  };

  const toggleSleepKitten = () => {
    setKitten((prev) => {
      const willSleep = !prev.isSleeping;
      if (willSleep) {
        soundEngine.playSleepSnore();
        showToast('Mimi foi tirar um soninho gostoso... 💤', '🌙');
        return {
          ...prev,
          isSleeping: true,
          mood: 'dormindo',
          energy: Math.min(100, (prev.energy || 50) + 20),
          lastSlept: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        soundEngine.playMeowHappy();
        showToast('Mimi acordou cheio de energia! ☀️', '🐱');
        return {
          ...prev,
          isSleeping: false,
          mood: 'feliz',
          energy: Math.min(100, (prev.energy || 50) + 40),
        };
      }
    });
  };

  const playWithKitten = (toyName = 'Novelo de Lã') => {
    soundEngine.playToyBoing();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => ({
      ...prev,
      fun: 100,
      energy: Math.max(10, (prev.energy || 80) - 15),
      happiness: Math.min(100, (prev.happiness || 50) + 15),
      mood: 'brincalhao',
      isPlayMode: true,
      lastPlayed: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }));
    gainKittenXp(18);
    showToast(`Mimi brincou super alegre com o ${toyName}! 🧶`, '🐾');
    setTimeout(() => {
      setKitten((prev) => ({ ...prev, isPlayMode: false }));
    }, 2200);
  };

  const equipKittenItem = (itemId: string, category: 'hat' | 'accessory' | 'outfit') => {
    soundEngine.playHeartPop();
    setKitten((prev) => {
      if (category === 'hat') {
        const isCurrent = prev.equippedHat === itemId;
        return { ...prev, equippedHat: isCurrent ? '' : itemId };
      } else if (category === 'accessory') {
        const isCurrent = prev.equippedAccessory === itemId;
        return { ...prev, equippedAccessory: isCurrent ? '' : itemId };
      } else {
        const isCurrent = prev.equippedOutfit === itemId;
        return { ...prev, equippedOutfit: isCurrent ? '' : itemId };
      }
    });
    showToast('Acessório atualizado no mascote! ✨', '🎀');
  };

  const switchPet = (petType: PetType) => {
    const species = PET_SPECIES_CATALOG.find((s) => s.type === petType);
    const newName = species ? species.defaultName : 'Mimi';
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    setKitten((prev) => ({
      ...prev,
      petType,
      name: newName,
      mood: 'feliz',
    }));
    showToast(`Mascote ativo alterado para ${newName}! ${species?.emoji || '🐾'}`, species?.emoji || '🐾');
  };

  const renamePet = (newName: string) => {
    if (!newName.trim()) return;
    soundEngine.playHeartPop();
    setKitten((prev) => ({
      ...prev,
      name: newName.trim(),
    }));
    showToast(`Nome do mascote alterado para "${newName.trim()}"! 💖`, '✨');
  };

  const adoptPet = (petType: PetType) => {
    const species = PET_SPECIES_CATALOG.find((s) => s.type === petType);
    setKitten((prev) => {
      const currentOwned = prev.ownedPets || ['cat'];
      if (!currentOwned.includes(petType)) {
        return {
          ...prev,
          ownedPets: [...currentOwned, petType],
          petType,
          name: species ? species.defaultName : 'Mascote',
        };
      }
      return {
        ...prev,
        petType,
        name: species ? species.defaultName : 'Mascote',
      };
    });
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.4);
    showToast(`Adotou ${species?.name || 'Novo Mascote'} com sucesso! 🎉`, species?.emoji || '🐾');
  };

  const waterLoveTree = () => {
    soundEngine.playWaterDrop();
    setTreeWaterCount((prev) => prev + 1);
    setTreeState((prev) => {
      const newWater = (prev.waterCount || 0) + 1;
      const newXp = (prev.xp || 0) + 20;
      let newLevel = prev.level || 1;
      let newMaxXp = prev.maxXp || 100;
      if (newXp >= newMaxXp && newLevel < 10) {
        newLevel += 1;
        showToast(`Árvore do Amor evoluiu para o Nível ${newLevel}! 🌳✨`, '🌱', 10);
        addCoins(10, `Evolução da Árvore do Amor Nv.${newLevel}`);
      }
      return {
        ...prev,
        waterCount: newWater,
        xp: newXp,
        level: newLevel,
        lastWatered: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
    });
    unlockAchievement('ach-tree-water');
    addCoins(2, 'Regou a Árvore do Amor 🌱');
    triggerHeartExplosion(0.5, 0.4);
  };

  const sunLoveTree = () => {
    soundEngine.playSparkle();
    setTreeState((prev) => ({
      ...prev,
      sunCount: (prev.sunCount || 0) + 1,
      xp: (prev.xp || 0) + 15,
    }));
    triggerHeartExplosion(0.5, 0.3);
    showToast('O Sol do Amor banhou a árvore com luz e carinho! ☀️');
    addCoins(1, 'Banho de Sol na Árvore ☀️');
  };

  const pruneLoveTree = () => {
    soundEngine.playHeartPop();
    setTreeState((prev) => ({
      ...prev,
      pruneCount: (prev.pruneCount || 0) + 1,
      xp: (prev.xp || 0) + 10,
    }));
    triggerHeartExplosion(0.5, 0.35);
    showToast('Galhos podados com amor e folhas perfumadas! ✂️🌿');
    addCoins(1, 'Cuidado de Jardinagem 🌿');
  };

  const addPromiseRibbon = (promiseText: string) => {
    if (!promiseText.trim()) return;
    soundEngine.playSparkle();
    setTreeState((prev) => ({
      ...prev,
      promiseRibbons: [...(prev.promiseRibbons || []), promiseText.trim()],
    }));
    triggerHeartExplosion(0.5, 0.4);
    showToast('Nova Fita de Promessa amarrada aos galhos da árvore! 🎗️💖');
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
    addCoins(3, 'Colheita de Fruto do Amor');
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

    // Sweet auto reply simulation from Samella
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

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
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
        isLoggedIn,
        isLoadingDone,
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
        playSong,
        pauseSong,
        togglePlay,
        nextSong,
        prevSong,
        seekSong,
        toggleFavoriteSong,
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
