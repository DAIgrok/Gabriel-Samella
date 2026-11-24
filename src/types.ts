export type ViewerRole = 'samella' | 'gabriel_spectator';

export interface CustomGlbModelsConfig {
  pets?: Partial<Record<PetType, string>>;
  furniture?: Record<string, string>;
}

export interface CoupleConfig {
  partnerName: string;
  myName: string;
  anniversaryDate: string; // e.g. "2023-06-12T00:00:00"
  subtitle: string;
  passcode: string;
  creatorPasscode?: string;
  themeGlowColor: string;
  customGlbModels?: CustomGlbModelsConfig;
}

export type CouplePerson = 'Gabriel' | 'Samella';

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
  authorName?: string;
  sender?: CouplePerson;
  recipient?: CouplePerson;
  sentAt?: string;
  isPrivate?: boolean;
  rewardClaimed?: boolean;
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
  url: string; // Compressed data URL, idb:// local blob, or external URL
  localPath?: string;
  driveUrl?: string;
  driveFileId?: string;
  sourceType?: 'local' | 'drive' | 'upload' | 'url';
  aspect?: 'portrait' | 'landscape' | 'square';
  isFavorite?: boolean;
  inHomeLoop?: boolean;
  caption?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string;
  coverUrl: string;
  audioUrl?: string; // YouTube link or direct audio URL
  sourceType?: 'youtube' | 'audio' | 'idb';
  youtubeId?: string;
  lyrics?: string[];
  isFavorite?: boolean;
  isLocalAvailable?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'memories' | 'music' | 'letters' | 'games' | 'special' | 'secrets' | 'tree' | 'pets' | 'house' | 'chat';
  rewardCoins: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardClaimed?: boolean;
  progress: number;
  maxProgress: number;
}

export type StoreCategory =
  | 'vales'
  | 'pets'
  | 'roupas'
  | 'acessorios'
  | 'arvore'
  | 'casa'
  | 'aquario'
  | 'sazonal'
  | 'temas'
  | 'molduras'
  | 'efeitos'
  | 'presentes'
  | 'flores'
  | 'cartas'
  | 'gatinho';

export type HouseFurnitureCategory =
  | 'sofas'
  | 'mesas'
  | 'cadeiras'
  | 'tvs'
  | 'pcs'
  | 'camas'
  | 'cozinha'
  | 'banheiro'
  | 'decoracao'
  | 'iluminacao'
  | 'plantas'
  | 'varanda'
  | 'paredes'
  | 'pisos';

export interface StoreItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  icon: string;
  category: StoreCategory;
  houseCategory?: HouseFurnitureCategory;
  supportsCustomColor?: boolean;
  defaultColor?: string;
  customColor?: string;
  purchased: boolean;
  equipped?: boolean;
  voucherCode?: string;
  redeemed?: boolean;
  redeemedAt?: string;
  actionLabel?: string;
  petTypeTarget?: PetType | 'all';
  targetId?: string;
  slotType?:
    | 'hat'
    | 'outfit'
    | 'collar'
    | 'glasses'
    | 'accessory'
    | 'tree'
    | 'theme'
    | 'frame'
    | 'house-furniture'
    | 'house-wall'
    | 'house-floor'
    | 'aquarium-fish'
    | 'aquarium-decor'
    | 'pet-seasonal';
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
  equippedCollar?: string;
  equippedGlasses?: string;
  lastFed?: string;
  lastFedTimestamp?: number;
  lastSlept?: string;
  lastBathed?: string;
  lastPlayed?: string;
  cooldowns?: Record<string, number>;
  level: number;
  xp: number;
  maxXp: number;
  ownedPets?: PetType[];
  deadPets?: PetType[];
  customNames?: Partial<Record<PetType, string>>;
  petColors?: Partial<Record<PetType, string>>;
  petPartColors?: Partial<Record<PetType, Record<string, string>>>;
  accessoryColors?: Record<string, string>;
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
  cooldowns?: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  sender: 'partner' | 'me';
  senderName?: string;
  text: string;
  msgType?: 'text' | 'audio' | 'image';
  mediaUrl?: string;
  time: string;
  createdAt?: string;
  readAt?: string | null;
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
  rewardClaimed?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  isCustom?: boolean;
}

export interface TimeCapsuleItem {
  id: string;
  title: string;
  message: string;
  unlockDate: string; // YYYY-MM-DD
  author: string;
  createdAt: string;
}

export type GoalPriority = 'alta' | 'media' | 'suave';

export interface CoupleGoal {
  id: string;
  title: string;
  category: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
  targetDate?: string;
  priority?: GoalPriority;
  notes?: string;
  addedBy?: 'Samella' | 'Gabriel';
  createdAt?: string;
  rewardClaimed?: boolean;
}

export type CalendarEventCategory =
  | 'encontro'
  | 'especial'
  | 'lembrete'
  | 'viagem'
  | 'aniversario'
  | 'outro';

export type CalendarEventColor =
  | 'pink'
  | 'purple'
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'rose';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: CalendarEventCategory;
  color: CalendarEventColor;
  location?: string;
  notes?: string;
  isAnnualRecurring?: boolean;
  createdBy?: 'Samella' | 'Gabriel';
  createdAt: string;
}

export interface DailyWheelState {
  lastSpinAt: number;
  lastPrize?: string;
  totalSpins: number;
}

export type HouseRoomId = 'sala' | 'quarto' | 'varanda' | 'cozinha' | 'banheiro';
export type HouseWallTheme = 'lavender' | 'midnight' | 'rosewood' | 'starlight' | 'christmas' | 'halloween';
export type HouseFloorTheme = 'wood' | 'marble' | 'velvet' | 'checkered';

export interface HouseFurnitureCatalogItem {
  id: string;
  name: string;
  room: HouseRoomId;
  category: HouseFurnitureCategory;
  description: string;
  unlockedByDefault?: boolean;
  price?: number;
  accentHex: string;
  modelVariant?: string;
}

export interface HouseFurnitureTransform {
  x: number;
  z: number;
  rotY: number;
}

export interface DreamHouseState {
  activeRoom: HouseRoomId;
  unlockedRooms?: HouseRoomId[];
  wallTheme: HouseWallTheme;
  floorTheme: HouseFloorTheme;
  customWallHex?: string;
  customFloorHex?: string;
  customCeilingHex?: string;
  customColors?: Record<string, string>;
  lightsOn: boolean;
  fireplaceLit: boolean;
  musicNoteGlow: boolean;
  unlockedFurnitureIds: string[];
  placedFurniture: Record<HouseRoomId, string[]>;
  furnitureTransforms?: Record<string, HouseFurnitureTransform>;
  comfortLevel: number;
  lastInteractedAt?: string;
}

export type AquariumLightMode = 'bioluminescent' | 'sunlight' | 'moonlight' | 'coral';

export interface AquariumSpeciesInfo {
  id: string;
  name: string;
  rarity: 'comum' | 'raro' | 'lendario' | 'mitico';
  colorHex: string;
  accentHex: string;
  scale: number;
  linkedPetType?: PetType;
  unlockedByDefault?: boolean;
  description: string;
}

export interface AquariumDecorInfo {
  id: string;
  name: string;
  description: string;
  unlockedByDefault?: boolean;
  accentHex: string;
}

export interface AquariumState {
  waterClarity: number;
  fishHunger: number;
  lightMode: AquariumLightMode;
  bubblesActive: boolean;
  unlockedFishIds: string[];
  activeFishIds: string[];
  unlockedDecorIds: string[];
  activeDecorIds: string[];
  lastFedAt?: string;
  lastCleanedAt?: string;
  feedCount: number;
}

export type SeasonalEventId = 'normal' | 'halloween' | 'natal' | 'namorados' | 'aniversario';

export interface SeasonalState {
  mode: 'auto' | 'preview';
  previewEvent: SeasonalEventId;
  claimedProps: string[];
  memoriesSeen: SeasonalEventId[];
}

export interface IntegratedMission {
  id: string;
  title: string;
  description: string;
  category: 'casa' | 'aquario' | 'casal' | 'sazonal';
  rewardCoins: number;
  rewardUnlockLabel?: string;
  targetCount: number;
  seasonalOnly?: SeasonalEventId;
}

export interface MissionsState {
  claimedIds: string[];
  virtualSnapshotsTaken: number;
  houseVisits: number;
  aquariumFeeds: number;
  twoWayLettersSent: number;
}

export interface LegacyResetBackup {
  version: number;
  backedUpAt: string;
  letters: Letter[];
  coupleGoals: CoupleGoal[];
}

export type ActiveTab = 'inicio' | 'cartas' | 'fotos' | 'musica' | 'conversas' | 'perfil';
export type ExtendedView =
  | ActiveTab
  | 'arvore'
  | 'casa'
  | 'aquario'
  | 'missoes'
  | 'conquistas'
  | 'jogos'
  | 'gatinho'
  | 'loja'
  | 'frases'
  | 'metas'
  | 'calendario'
  | 'config';




