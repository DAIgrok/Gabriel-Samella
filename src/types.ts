export interface CoupleConfig {
  partnerName: string;
  myName: string;
  anniversaryDate: string; // e.g. "2023-06-12T00:00:00"
  subtitle: string;
  passcode: string;
  themeGlowColor: string;
}

export interface Letter {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  read: boolean;
  isFavorite: boolean;
  rewardCoins: number;
  tags: string[];
  hiddenSecret?: string;
  unsealedAt?: string;
  attachedPhotoIndex?: number;
}

export interface Phrase {
  id: string;
  text: string;
  category: 'romantica' | 'carinho' | 'bom-dia' | 'boa-noite' | 'companheirismo' | 'especial' | 'biblica' | 'poema';
  reference?: string;
  isFavorite?: boolean;
}

export interface DailyMessage {
  id: string;
  text: string;
  author: string;
  dateStr?: string;
}

export interface MemoryPhoto {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  date: string;
  url: string; // Local primary url (e.g. /assets/img/1.jpg) or drive url
  localPath?: string;
  driveUrl?: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  isFavorite?: boolean;
  caption?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string;
  coverUrl: string;
  audioUrl?: string; // Path like /assets/audio/Te-Vivo.mp3
  lyrics?: string[];
  isFavorite?: boolean;
  isLocalAvailable?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'memories' | 'music' | 'letters' | 'games' | 'special' | 'secrets' | 'tree' | 'pets';
  rewardCoins: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type StoreCategory =
  | 'vales'
  | 'pets'
  | 'roupas'
  | 'acessorios'
  | 'arvore'
  | 'temas'
  | 'molduras'
  | 'efeitos'
  | 'presentes'
  | 'flores'
  | 'cartas'
  | 'gatinho';

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  icon: string;
  category: StoreCategory;
  purchased: boolean;
  equipped?: boolean;
  voucherCode?: string;
  redeemed?: boolean;
  redeemedAt?: string;
  actionLabel?: string;
  petTypeTarget?: PetType | 'all';
  slotType?: 'hat' | 'outfit' | 'accessory' | 'tree' | 'theme' | 'frame';
}

export type PetType =
  | 'cat'
  | 'dog'
  | 'bunny'
  | 'pig'
  | 'mouse'
  | 'snake'
  | 'shark'
  | 'bee'
  | 'fox'
  | 'panda'
  | 'koala'
  | 'penguin'
  | 'lion'
  | 'tiger'
  | 'bear'
  | 'frog'
  | 'hamster'
  | 'hedgehog'
  | 'parrot'
  | 'turtle'
  | 'dolphin'
  | 'whale';

export interface PetSpeciesInfo {
  type: PetType;
  name: string;
  defaultName: string;
  emoji: string;
  description: string;
  personality: string;
  favFood: string;
  soundType: string;
  rarity: 'comum' | 'raro' | 'lendario' | 'mitico';
}

export interface KittenState {
  name: string;
  petType?: PetType;
  mood: 'feliz' | 'ronronando' | 'dormindo' | 'com-fome' | 'com-sede' | 'sujinho' | 'cansado' | 'brincalhao';
  happiness: number; // 0 to 100
  hunger: number; // 0 to 100 (100 = satisfeito)
  thirst: number; // 0 to 100 (100 = hidratado)
  energy: number; // 0 to 100 (100 = descansado)
  hygiene: number; // 0 to 100 (100 = limpinho)
  fun: number; // 0 to 100 (100 = super divertido)
  affectionLevel: number;
  petCount: number;
  isSleeping: boolean;
  isBathing: boolean;
  isEating: boolean;
  isDrinking: boolean;
  isPlayMode: boolean;
  equippedHat?: string;
  equippedAccessory?: string;
  equippedOutfit?: string;
  lastFed?: string;
  lastSlept?: string;
  lastBathed?: string;
  lastPlayed?: string;
  level: number;
  xp: number;
  maxXp: number;
  ownedPets?: PetType[];
}

export interface TreeDecorationItem {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  position: { x: number; y: number };
}

export interface LoveTreeState {
  level: number;
  xp: number;
  maxXp: number;
  stageName: string;
  waterCount: number;
  sunCount: number;
  pruneCount: number;
  fruitsHarvested: number;
  promiseRibbons: string[];
  lightsEnabled: boolean;
  creaturesUnlocked: string[];
  lastWatered?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'partner' | 'me';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  hasHeart?: boolean;
  replyTo?: string;
  audioDuration?: string;
  isAudio?: boolean;
  attachmentImg?: string;
}

export interface EasterEgg {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  discovered: boolean;
  discoveredAt?: string;
}

export type ActiveTab = 'inicio' | 'cartas' | 'fotos' | 'musica' | 'perfil';
export type ExtendedView = ActiveTab | 'arvore' | 'conquistas' | 'jogos' | 'gatinho' | 'loja' | 'conversas' | 'frases' | 'config';

