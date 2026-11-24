import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  Utensils,
  Droplets,
  Moon,
  Sun,
  Bath,
  Volume2,
  Edit2,
  Check,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Shirt,
  Lamp,
  ShowerHead,
  X,
  Orbit,
  Camera,
  PawPrint,
  Sparkles,
  Sofa,
  BedDouble,
  Lock,
  Home,
} from 'lucide-react';
import {
  useApp,
  getCooldownRemaining,
  formatCooldownMs,
} from '../../context/AppContext';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { PetCharacter } from '../pets/PetCharacter';
import { ModelViewerPetStage } from '../pets/ModelViewerPetStage';
import { PetPaintBucketButton } from '../pets/PetPaintBucketButton';
import { PetCanvas3D, PetDanceMove } from '../3d/PetCanvas3D';
import { PET_SPECIES_CATALOG, resolvePetGlbUrl } from '../../data/initialData';
import { getPetDialogue } from '../../data/petPersonalities';
import { PetType } from '../../types';
import { uploadPetModel } from '../../services/supabaseSync';
import { DiamondGemIcon, VectorGlyphIcon } from '../icons/CustomIcons';
import {
  formatPaintPartLabel,
  type PetActionCueType,
  type PetAnimationCue,
} from '../../utils/petGlbAnimations';

type PetRoom = 'sala' | 'cozinha' | 'banheiro' | 'quarto';

const ROOM_ORDER: PetRoom[] = ['sala', 'cozinha', 'banheiro', 'quarto'];

const ROOM_META: Record<PetRoom, { label: string; title: string; iconKey: string }> = {
  sala: { label: 'Sala', title: 'Sala de Estar', iconKey: 'sofa' },
  cozinha: { label: 'Cozinha', title: 'Cozinha', iconKey: 'utensils' },
  banheiro: { label: 'Banho', title: 'Banheiro', iconKey: 'bath' },
  quarto: { label: 'Quarto', title: 'Quarto', iconKey: 'bed' },
};

export const KittenView: React.FC = () => {
  const {
    isSpectator,
    config,
    coins,
    kitten,
    dreamHouse,
    petKitten,
    feedKitten,
    giveWaterKitten,
    batheKitten,
    toggleSleepKitten,
    playWithKitten,
    switchPet,
    renamePet,
    setPetColor,
    setPetPartColor,
    clearPetPartColors,
    setAccessoryColor,
    storeItems,
    equipKittenItem,
    triggerEasterEgg,
    triggerHeartExplosion,
    setActiveTab: setNavTab,
    setExtendedView,
    captureVirtualPhoto,
    updateConfig,
    showToast,
  } = useApp();

  const prefersReducedMotion = useReducedMotion();
  const petGlbInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPetGlb, setIsUploadingPetGlb] = useState(false);

  const [currentRoom, setCurrentRoom] = useState<PetRoom>('sala');
  const [drawerModal, setDrawerModal] = useState<'none' | 'armario' | 'mascotes'>('none');
  const [petViewMode] = useState<'design' | '3d' | '2d'>('design');
  const [danceMove, setDanceMove] = useState<PetDanceMove>('idle');
  const [isActionWheelOpen, setIsActionWheelOpen] = useState(false);
  const [actionCue, setActionCue] = useState<PetAnimationCue>({ type: 'idle', tick: 0 });
  const danceTimerRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [wardrobeSlotFilter, setWardrobeSlotFilter] = useState<
    'all' | 'hat' | 'glasses' | 'collar' | 'outfit' | 'accessory'
  >('all');

  const [paintMode, setPaintMode] = useState(false);
  const [paintHex, setPaintHex] = useState('#d6b56d');

  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(kitten.name || '');

  const [petReaction, setPetReaction] = useState<string>('Oi! Que saudade de você ♡');
  const [flyingFood, setFlyingFood] = useState<{ iconKey: string; key: number } | null>(null);
  const [activeToyIcon, setActiveToyIcon] = useState<string>('game');

  const [spongeMode, setSpongeMode] = useState(false);
  const [soapFoamActive, setSoapFoamActive] = useState(false);
  const [isShowering, setIsShowering] = useState(false);
  const [floatingBubbles, setFloatingBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastScrubTimeRef = useRef<number>(0);

  const [farewellPetTarget, setFarewellPetTarget] = useState<typeof PET_SPECIES_CATALOG[0] | null>(null);
  const [switchPetName, setSwitchPetName] = useState<string>('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cdPet = getCooldownRemaining(kitten.cooldowns, 'pet_pet');
  const cdFeed = getCooldownRemaining(kitten.cooldowns, 'pet_feed');
  const cdWater = getCooldownRemaining(kitten.cooldowns, 'pet_water');
  const cdBath = getCooldownRemaining(kitten.cooldowns, 'pet_bath');
  const cdSleep = getCooldownRemaining(kitten.cooldowns, 'pet_sleep');
  const cdPlay = getCooldownRemaining(kitten.cooldowns, 'pet_play');
  const cdDance = getCooldownRemaining(kitten.cooldowns, 'pet_dance');

  const currentPetType: PetType = (kitten.petType as PetType) || 'cat';
  const currentSpecies =
    PET_SPECIES_CATALOG.find((s) => s.type === currentPetType) || PET_SPECIES_CATALOG[0];
  const ownedPets: PetType[] = kitten.ownedPets || ['cat'];
  const isPetDead = (kitten.deadPets || []).includes(currentPetType);
  const unlockedHouseRooms = dreamHouse.unlockedRooms || ['sala'];
  const hasKitchenAndBowl =
    unlockedHouseRooms.includes('cozinha') &&
    (dreamHouse.placedFurniture?.cozinha || []).includes('house-pet-bowl');
  const hasBathroomUnlocked = unlockedHouseRooms.includes('banheiro');
  const displayName = kitten.name?.trim() || currentSpecies.name;
  const needsNaming = !kitten.name || !kitten.name.trim();

  const wearableSlots = new Set(['hat', 'glasses', 'collar', 'outfit', 'accessory']);
  const wardrobeItems = storeItems.filter(
    (item) => item.slotType && wearableSlots.has(item.slotType)
  );
  const filteredWardrobeItems =
    wardrobeSlotFilter === 'all'
      ? wardrobeItems
      : wardrobeItems.filter((item) => item.slotType === wardrobeSlotFilter);

  const isItemEquipped = (itemId: string) =>
    kitten.equippedHat === itemId ||
    kitten.equippedAccessory === itemId ||
    kitten.equippedOutfit === itemId ||
    kitten.equippedCollar === itemId ||
    kitten.equippedGlasses === itemId;

  const playSpeciesSound = () => {
    switch (currentPetType) {
      case 'dog':
        soundEngine.playBark();
        break;
      case 'bunny':
      case 'hamster':
      case 'mouse':
        soundEngine.playSqueak();
        break;
      case 'fox':
        soundEngine.playFoxSound();
        break;
      case 'penguin':
      case 'parrot':
      case 'bee':
        soundEngine.playChirp();
        break;
      case 'shark':
      case 'dolphin':
      case 'whale':
        soundEngine.playBathSplash();
        break;
      case 'cat':
      default:
        soundEngine.playMeowHappy();
        break;
    }
  };

  const handleRoomCycle = (dir: -1 | 1) => {
    const idx = ROOM_ORDER.indexOf(currentRoom);
    const nextIdx = (idx + dir + ROOM_ORDER.length) % ROOM_ORDER.length;
    setCurrentRoom(ROOM_ORDER[nextIdx]);
    setSpongeMode(false);
    soundEngine.playHeartPop();
  };

  const petDialogueStats = {
    hunger: kitten.hunger ?? 80,
    energy: kitten.energy ?? 80,
    hygiene: kitten.hygiene ?? 80,
    isSleeping: Boolean(kitten.isSleeping),
  };

  useEffect(() => {
    setPetReaction(getPetDialogue(currentPetType, displayName, 'idle', petDialogueStats));
  }, [currentPetType]);

  const triggerCue = (type: PetActionCueType) => {
    setActionCue({ type, tick: Date.now() });
  };

  const handlePaintPart = (partKey: string, label?: string) => {
    if (isSpectator || isPetDead) return;
    setPetPartColor(currentPetType, partKey, paintHex);
    const niceLabel = label || formatPaintPartLabel(partKey);
    setPetReaction(`${niceLabel} com cor nova! ♡`);
    triggerHeartExplosion(0.5, 0.45);
  };

  const handleNoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (paintMode) {
      handlePaintPart('nose', 'Narizinho');
      return;
    }
    playSpeciesSound();
    triggerHeartExplosion();
    triggerCue('pet');
    if (!isSpectator) triggerEasterEgg('egg-kitten-nose');
    setPetReaction(getPetDialogue(currentPetType, displayName, 'pet_nose', petDialogueStats));
  };

  const handleBodyClick = (part: 'head' | 'belly' | 'paw') => {
    if (paintMode) return;
    if (isSpectator) {
      playSpeciesSound();
      triggerCue('pet');
      setPetReaction(getPetDialogue(currentPetType, displayName, 'sound', petDialogueStats));
      return;
    }
    if (kitten.isSleeping) {
      soundEngine.playSleepSnore();
      setPetReaction(getPetDialogue(currentPetType, displayName, 'sleep', petDialogueStats));
      return;
    }
    if (currentRoom === 'banheiro' && spongeMode) return;

    triggerCue('pet');
    if (part === 'head') {
      playSpeciesSound();
      setPetReaction(getPetDialogue(currentPetType, displayName, 'pet_head', petDialogueStats));
      petKitten('head');
    } else if (part === 'belly') {
      soundEngine.playPurr();
      setPetReaction(getPetDialogue(currentPetType, displayName, 'pet_belly', petDialogueStats));
      petKitten('belly');
    } else {
      soundEngine.playToyBoing();
      setPetReaction(getPetDialogue(currentPetType, displayName, 'pet_paw', petDialogueStats));
      petKitten('paw');
    }
  };

  const handleFeed = (foodName: string, iconKey: string, hungerBoost: number, happyBoost: number) => {
    if (isSpectator) return;
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto primeiro`);
      return;
    }
    if (feedKitten(foodName, hungerBoost, happyBoost)) {
      triggerCue('feed');
      setFlyingFood({ iconKey, key: Date.now() });
      setPetReaction(getPetDialogue(currentPetType, displayName, 'feed', petDialogueStats));
      setTimeout(() => setFlyingFood(null), 950);
    }
  };

  const handleDrinkWater = () => {
    if (isSpectator) return;
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto primeiro`);
      return;
    }
    if (giveWaterKitten()) {
      triggerCue('water');
      setFlyingFood({ iconKey: 'fish', key: Date.now() });
      setPetReaction(getPetDialogue(currentPetType, displayName, 'water', petDialogueStats));
      setTimeout(() => setFlyingFood(null), 950);
    }
  };

  const handlePlayToy = (toyName: string, iconKey: string) => {
    if (isSpectator) return;
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto para brincar`);
      return;
    }
    if (playWithKitten(toyName, 'toy')) {
      triggerCue('play');
      setActiveToyIcon(iconKey);
      setPetReaction(getPetDialogue(currentPetType, displayName, 'play', petDialogueStats));
    }
  };

  const triggerDanceMove = (move: Exclude<PetDanceMove, 'idle'>, label: string, msg: string) => {
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto para dançar`);
      return;
    }
    if (danceTimerRef.current) {
      window.clearTimeout(danceTimerRef.current);
    }
    setDanceMove(move);
    triggerCue(move);
    if (!isSpectator) playWithKitten(label, 'dance');
    if (move === 'kiss' || move === 'dance') {
      triggerHeartExplosion(0.5, 0.45);
      soundEngine.playSparkle();
    } else {
      soundEngine.playToyBoing();
    }
    setPetReaction(msg);
    danceTimerRef.current = window.setTimeout(() => {
      setDanceMove('idle');
    }, 2600);
  };

  const handleStageSoapInteract = (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
    if (isSpectator || paintMode || currentRoom !== 'banheiro' || !spongeMode) return;
    const now = Date.now();
    if (now - lastScrubTimeRef.current < 260) return;
    lastScrubTimeRef.current = now;

    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setFloatingBubbles((prev) => [...prev.slice(-14), { id: now + Math.random(), x, y }]);
    setSoapFoamActive(true);
    soundEngine.playBathSplash();
    setPetReaction(`Espuma cheirosinha!`);
  };

  const handleShower = () => {
    if (isSpectator) return;
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} antes do chuveiro`);
      return;
    }
    if (batheKitten(100)) {
      triggerCue('bath');
      setSpongeMode(false);
      setIsShowering(true);
      setSoapFoamActive(false);
      setFloatingBubbles([]);
      setPetReaction(`Limpinho e cheiroso ♡`);
      setTimeout(() => setIsShowering(false), 1800);
    }
  };

  const popBubble = (id: number) => {
    soundEngine.playBathSplash();
    setFloatingBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSpectator) return;
    if (customNameInput.trim()) {
      renamePet(customNameInput.trim());
      setIsEditingName(false);
      setPetReaction(`Amei meu novo nome: ${customNameInput.trim()}! ♡`);
    }
  };

  const getNeedColor = (value: number) => {
    if (value >= 65) return 'text-emerald-300 border-emerald-400/35 bg-emerald-500/10';
    if (value >= 35) return 'text-amber-300 border-amber-400/35 bg-amber-500/10';
    return 'text-amber-300 border-amber-500/50 bg-amber-500/20 animate-pulse';
  };

  const getNeedBarFill = (value: number) => {
    if (value >= 65) return 'from-emerald-400 to-teal-400';
    if (value >= 35) return 'from-amber-400 to-yellow-400';
    return 'from-amber-500 to-sky-500';
  };

  const getFoodMenu = () => {
    switch (currentPetType) {
      case 'dog':
        return [
          { name: 'Osso Doce', iconKey: 'utensils', hunger: 30, happy: 18 },
          { name: 'Bife', iconKey: 'utensils', hunger: 45, happy: 24 },
          { name: 'Petisco', iconKey: 'heart', hunger: 35, happy: 26 },
        ];
      case 'bunny':
      case 'hamster':
      case 'turtle':
        return [
          { name: 'Cenoura', iconKey: 'seed', hunger: 35, happy: 22 },
          { name: 'Folhas', iconKey: 'tree', hunger: 30, happy: 18 },
          { name: 'Morango', iconKey: 'heart', hunger: 38, happy: 30 },
        ];
      case 'fox':
      case 'bear':
      case 'hedgehog':
        return [
          { name: 'Mel', iconKey: 'sparkles', hunger: 40, happy: 32 },
          { name: 'Frutas', iconKey: 'flower', hunger: 32, happy: 24 },
          { name: 'Maçã', iconKey: 'utensils', hunger: 34, happy: 20 },
        ];
      case 'panda':
        return [
          { name: 'Bambu', iconKey: 'tree', hunger: 42, happy: 28 },
          { name: 'Melancia', iconKey: 'utensils', hunger: 30, happy: 26 },
          { name: 'Bolinho', iconKey: 'cake', hunger: 38, happy: 24 },
        ];
      case 'penguin':
      case 'shark':
      case 'dolphin':
      case 'whale':
        return [
          { name: 'Peixe', iconKey: 'fish', hunger: 38, happy: 26 },
          { name: 'Camarão', iconKey: 'fish', hunger: 42, happy: 30 },
          { name: 'Algas', iconKey: 'coral', hunger: 35, happy: 22 },
        ];
      case 'bee':
        return [
          { name: 'Néctar', iconKey: 'flower', hunger: 35, happy: 28 },
          { name: 'Mel', iconKey: 'sparkles', hunger: 42, happy: 32 },
          { name: 'Morango', iconKey: 'heart', hunger: 30, happy: 22 },
        ];
      case 'cat':
      default:
        return [
          { name: 'Sardinha', iconKey: 'fish', hunger: 36, happy: 24 },
          { name: 'Bife', iconKey: 'utensils', hunger: 44, happy: 28 },
          { name: 'Morango', iconKey: 'heart', hunger: 30, happy: 32 },
        ];
    }
  };

  const getRoomBackdropClass = () => {
    if (currentRoom === 'quarto' && kitten.isSleeping) {
      return 'from-[#060314] via-[#0b0724] to-[#04010d] border-indigo-500/40';
    }
    switch (currentRoom) {
      case 'cozinha':
        return 'from-[#17264c] via-[#111d3d] to-[#0b1730] border-amber-300/30';
      case 'banheiro':
        return 'from-[#102a43] via-[#151d40] to-[#0b1730] border-sky-300/30';
      case 'quarto':
        return 'from-[#1c1948] via-[#101936] to-[#0b1730] border-violet-300/30';
      case 'sala':
      default:
        return 'from-[#142a4b] via-[#171c43] to-[#0b1730] border-sky-300/25';
    }
  };

  const hungerVal = kitten.hunger ?? 80;
  const thirstVal = kitten.thirst ?? 80;
  const hygieneVal = kitten.hygiene ?? 80;
  const energyVal = kitten.energy ?? 80;
  const funVal = kitten.fun ?? 80;
  const handlePetGlbUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || isSpectator || currentPetType !== 'cat') return;
    setIsUploadingPetGlb(true);
    try {
      const publicUrl = await uploadPetModel(file);
      updateConfig({
        customGlbModels: {
          pets: { ...(config.customGlbModels?.pets || {}), cat: publicUrl },
          furniture: { ...(config.customGlbModels?.furniture || {}) },
        },
      });
      showToast('Novo gatinho 3D carregado com sucesso!', 'sparkles');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Não foi possível carregar o GLB.', 'chat');
    } finally {
      setIsUploadingPetGlb(false);
    }
  };
  const resolvedGlbUrl = resolvePetGlbUrl(currentPetType, config);
  const currentWholeColor = kitten.petColors?.[currentPetType];
  const currentPartColors = kitten.petPartColors?.[currentPetType] || {};
  const hasCustomColors = Boolean(
    currentWholeColor || Object.keys(currentPartColors).length > 0
  );

  const drawersPortal = (
    <AnimatePresence>
      {drawerModal === 'armario' && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setDrawerModal('none')}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 bg-gradient-to-b from-[#1e0c36] to-[#0a0317] border border-sky-400/35 shadow-2xl max-h-[82vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-sky-400" />
                  Armário de {displayName}
                </h3>
                <p className="text-[11px] text-purple-200/75">
                  Combine chapéus, óculos, gravatas e roupas em qualquer cor
                </p>
              </div>
              <button
                onClick={() => setDrawerModal('none')}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all' as const, label: 'Tudo' },
                { id: 'hat' as const, label: 'Chapéus' },
                { id: 'glasses' as const, label: 'Óculos' },
                { id: 'collar' as const, label: 'Gravatas' },
                { id: 'outfit' as const, label: 'Roupas' },
                { id: 'accessory' as const, label: 'Acessórios' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setWardrobeSlotFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 border transition cursor-pointer ${
                    wardrobeSlotFilter === f.id
                      ? 'bg-sky-500 text-white border-sky-300 shadow'
                      : 'bg-purple-950/60 text-purple-200/80 border-purple-500/30 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {filteredWardrobeItems.map((item) => {
                const equipped = isItemEquipped(item.id);
                const slot =
                  (item.slotType as 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses') ||
                  'accessory';
                const itemHex =
                  kitten.accessoryColors?.[item.id] || item.defaultColor || '#ec4899';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                      !item.purchased
                        ? 'bg-purple-950/30 border-white/5 opacity-60'
                        : equipped
                        ? 'bg-sky-500/25 border-sky-400 shadow-md'
                        : 'glass-panel-interactive border-purple-500/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-sky-400/25 flex items-center justify-center text-sky-300">
                      <VectorGlyphIcon name={item.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>

                    {item.purchased && !isSpectator && (
                      <label className="w-full px-2 py-1 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between text-[10px] text-purple-200 cursor-pointer">
                        <span>Cor</span>
                        <input
                          type="color"
                          value={itemHex}
                          onChange={(e) => setAccessoryColor(item.id, e.target.value)}
                          className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"
                          aria-label={`Cor de ${item.title}`}
                        />
                      </label>
                    )}

                    <button
                      type="button"
                      disabled={!item.purchased || isSpectator}
                      onClick={() => item.purchased && equipKittenItem(item.id, slot)}
                      className="w-full min-h-[32px] rounded-xl bg-purple-900/70 border border-sky-400/25 text-[10px] font-bold text-sky-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {item.purchased ? (
                        equipped ? (
                          'Equipado'
                        ) : (
                          'Equipar'
                        )
                      ) : (
                        <>
                          <span>{item.price}</span>
                          <DiamondGemIcon className="w-3 h-3" />
                          <span>na Loja</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setDrawerModal('none');
                setNavTab('loja');
              }}
              className="w-full min-h-[44px] py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-sky-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Ir para a Loja
            </button>
          </motion.div>
        </div>
      )}

      {drawerModal === 'mascotes' && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setDrawerModal('none')}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 bg-gradient-to-b from-[#1e0c36] to-[#0a0317] border border-sky-400/35 shadow-2xl max-h-[82vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Seus Mascotes ({ownedPets.length}/{PET_SPECIES_CATALOG.length})
              </h3>
              <button
                onClick={() => setDrawerModal('none')}
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {PET_SPECIES_CATALOG.map((species) => {
                const isOwned = ownedPets.includes(species.type);
                const isActive = currentPetType === species.type;
                const savedCustomName = kitten.customNames?.[species.type] || '';

                return (
                  <div
                    key={species.type}
                    onClick={() => {
                      if (!isOwned || isActive || isSpectator) return;
                      setDrawerModal('none');
                      setFarewellPetTarget(species);
                      setSwitchPetName(savedCustomName);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/30 to-purple-500/30 border-sky-400'
                        : isOwned
                        ? 'glass-panel-interactive border-purple-500/30 cursor-pointer'
                        : 'bg-purple-950/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-sky-300 shrink-0">
                        <VectorGlyphIcon name={species.emoji} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">
                            {savedCustomName || species.name}
                          </span>
                          {isActive && (
                            <span className="bg-sky-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-200/70 truncate">{species.personality}</p>
                      </div>
                    </div>

                    {!isOwned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerModal('none');
                          setNavTab('loja');
                        }}
                        className="min-h-[36px] px-3 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Adotar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {farewellPetTarget && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setFarewellPetTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-[#1b0a2f] via-[#120622] to-[#080214] border border-sky-400/40 shadow-2xl space-y-4 text-center"
          >
            <div className="flex justify-center gap-3 pt-1">
              <span className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 shadow-md flex items-center justify-center text-purple-200">
                <VectorGlyphIcon name={currentSpecies.emoji} className="w-6 h-6" />
              </span>
              <span className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-500/30 shadow-md flex items-center justify-center text-sky-300">
                <VectorGlyphIcon name={farewellPetTarget.emoji} className="w-6 h-6" />
              </span>
            </div>

            <h3 className="text-base font-bold text-white font-display">
              Trocar para {farewellPetTarget.name}?
            </h3>

            <input
              type="text"
              value={switchPetName}
              onChange={(e) => setSwitchPetName(e.target.value)}
              placeholder={`Nome para ${farewellPetTarget.name.toLowerCase()} (opcional)`}
              maxLength={18}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-sky-500/40 text-white text-xs font-semibold focus:outline-none focus:border-sky-400 placeholder-purple-400/50"
            />

            <div className="flex gap-2.5">
              <button
                onClick={() => setFarewellPetTarget(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const target = farewellPetTarget;
                  const typed = switchPetName.trim();
                  setFarewellPetTarget(null);
                  switchPet(target.type);
                  if (typed) {
                    renamePet(typed);
                    setPetReaction(`Oi! Sou ${typed} ♡`);
                  }
                  soundEngine.playSparkle();
                  triggerHeartExplosion(0.5, 0.4);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-sky-600 to-purple-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Trocar ♡
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3 pb-32 sm:pb-24 max-w-xl mx-auto"
    >
      {/* Compact Unified Talking Tom Header */}
      <div className="glass-panel px-3.5 py-2.5 rounded-2xl border border-sky-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white shadow relative shrink-0">
            <VectorGlyphIcon name={currentSpecies.emoji} className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-purple-950 font-black text-[9px] px-1 py-0.2 rounded-full border border-purple-950">
              {kitten.level || 1}
            </span>
          </div>

          <div className="min-w-0">
            {isEditingName && !isSpectator ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1">
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="Nome do pet..."
                  maxLength={18}
                  autoFocus
                  className="bg-purple-950/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-400/60 outline-none w-28"
                />
                <button
                  type="submit"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500 text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">{displayName}</h2>
                {!isSpectator && (
                  <button
                    onClick={() => {
                      setCustomNameInput(kitten.name || '');
                      setIsEditingName(true);
                    }}
                    className="p-1 text-sky-300/75 hover:text-white cursor-pointer"
                    title="Renomear"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-20 bg-purple-950/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, ((kitten.xp || 0) / (kitten.maxXp || 100)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-200/75 font-mono">
                {kitten.xp || 0}/{kitten.maxXp || 100}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/35 border border-amber-400/25 text-amber-200 text-[11px] font-bold">
            <DiamondGemIcon className="w-3.5 h-3.5" />
            <span>{coins}</span>
          </div>
          <button
            onClick={() => setDrawerModal('armario')}
            className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl glass-panel border border-sky-500/25 text-sky-200 hover:text-white flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
            title="Armário"
          >
            <Shirt className="w-4 h-4" />
            <span className="hidden sm:inline">Armário</span>
          </button>
          <button
            onClick={() => setDrawerModal('mascotes')}
            className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl glass-panel border border-purple-500/25 text-purple-200 hover:text-white flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
            title="Mascotes"
          >
            <PawPrint className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              playSpeciesSound();
              triggerCue('pet');
              setPetReaction(`${displayName} mandou um som fofo ♡`);
            }}
            className="min-w-[40px] min-h-[40px] rounded-xl glass-panel border border-sky-500/25 text-sky-300 hover:text-white flex items-center justify-center cursor-pointer"
            title="Ouvir Som"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSpectator && (
        <div className="px-3.5 py-2 rounded-2xl bg-purple-950/60 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-amber-300" />
          <span>Modo Espectador: você pode girar o pet 3D e tirar fotos virtuais.</span>
        </div>
      )}

      {isPetDead && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-400/40 text-center space-y-2">
          <p className="text-sm font-bold text-white">{displayName} virou uma estrelinha ♡</p>
          <p className="text-xs text-purple-200/80">
            Adote um novo mascote na Loja para cuidar novamente com a Cozinha e o Pote!
          </p>
          {!isSpectator && (
            <button
              type="button"
              onClick={() => setExtendedView('loja')}
              className="min-h-[38px] px-4 rounded-xl bg-gradient-to-r from-sky-600 to-purple-600 text-white text-xs font-bold cursor-pointer"
            >
              Ir para a Loja ♡
            </button>
          )}
        </div>
      )}

      {needsNaming && !isEditingName && !isSpectator && (
        <form
          onSubmit={handleSaveName}
          className="flex items-center gap-2 p-2 rounded-2xl bg-sky-500/15 border border-sky-400/35"
        >
          <input
            type="text"
            value={customNameInput}
            onChange={(e) => setCustomNameInput(e.target.value)}
            placeholder={`Dê um nome para ${currentSpecies.name.toLowerCase()} ♡`}
            maxLength={18}
            className="flex-1 bg-purple-950/70 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-sky-400/35 outline-none"
          />
          <button
            type="submit"
            className="min-h-[36px] px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 text-white text-xs font-bold cursor-pointer"
          >
            Salvar
          </button>
        </form>
      )}

      {/* Compact 5 Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Fome', value: hungerVal, icon: Utensils, targetRoom: 'cozinha' as PetRoom },
          { label: 'Sede', value: thirstVal, icon: Droplets, targetRoom: 'cozinha' as PetRoom },
          { label: 'Higiene', value: hygieneVal, icon: Bath, targetRoom: 'banheiro' as PetRoom },
          { label: 'Energia', value: energyVal, icon: Moon, targetRoom: 'quarto' as PetRoom },
          { label: 'Diversão', value: funVal, icon: Heart, targetRoom: 'sala' as PetRoom },
        ].map((meter) => {
          const Icon = meter.icon;
          const isRoomActive = currentRoom === meter.targetRoom;
          return (
            <button
              key={meter.label}
              onClick={() => {
                setCurrentRoom(meter.targetRoom);
                setSpongeMode(false);
                soundEngine.playHeartPop();
              }}
              className={`min-h-[68px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${getNeedColor(
                meter.value
              )} ${isRoomActive ? 'ring-1 ring-sky-400/80' : 'opacity-85 hover:opacity-100'}`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <Icon className="w-3 h-3" />
                <span>{meter.label}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getNeedBarFill(meter.value)} transition-all duration-500`}
                  style={{ width: `${meter.value}%` }}
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-white/90">{meter.value}%</span>
            </button>
          );
        })}
      </div>

      {/* Main Clean Room Stage */}
      <div
        onMouseMove={(e) => {
          if (e.buttons === 1) handleStageSoapInteract(e.clientX, e.clientY, e.currentTarget);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) handleStageSoapInteract(touch.clientX, touch.clientY, e.currentTarget);
        }}
        onClick={(e) => handleStageSoapInteract(e.clientX, e.clientY, e.currentTarget)}
        className={`relative rounded-3xl p-3.5 sm:p-4 border bg-gradient-to-b transition-all duration-500 overflow-hidden select-none min-h-[370px] flex flex-col justify-between ${getRoomBackdropClass()}`}
      >
        <div className="relative z-20 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRoomCycle(-1);
            }}
            className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer shrink-0"
            aria-label="Cômodo anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 rounded-full bg-black/45 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
            <VectorGlyphIcon name={ROOM_META[currentRoom].iconKey} className="w-3.5 h-3.5 text-sky-300" />
            <span>{ROOM_META[currentRoom].title}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">


            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRoomCycle(1);
              }}
              className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
              aria-label="Próximo cômodo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speech Bubble + Corner Paint Bucket */}
        <div className="relative z-30 flex items-start justify-between gap-2 mt-2">
          <div className="w-10 shrink-0" />
          <motion.div
            key={petReaction}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3.5 py-1.5 rounded-2xl bg-white/95 text-purple-950 text-xs font-semibold shadow-lg relative max-w-xs text-center"
          >
            {petReaction}
          </motion.div>
          <PetPaintBucketButton
            paintMode={paintMode}
            selectedHex={paintHex}
            hasCustomColors={hasCustomColors}
            disabled={isSpectator || isPetDead}
            onTogglePaintMode={() => {
              setPaintMode((prev) => {
                const next = !prev;
                if (next) setSpongeMode(false);
                return next;
              });
            }}
            onSelectHex={setPaintHex}
            onFillAll={(hex) => {
              if (isSpectator) return;
              setPetColor(currentPetType, hex);
              setPetReaction(`Visual novo inteiro para ${displayName}! ♡`);
            }}
            onClearColors={() => {
              if (isSpectator) return;
              clearPetPartColors(currentPetType);
              setPetReaction(`Cores originais de ${displayName} restauradas! ♡`);
            }}
          />
        </div>

        {/* Palco 3D principal do mascote GLB */}
        <div ref={stageRef} className="relative z-20 flex items-center justify-center my-1 min-h-[245px]">
          <AnimatePresence>
            {floatingBubbles.map((bubble) => (
              <motion.button
                key={bubble.id}
                type="button"
                initial={{ scale: 0, opacity: 0.85 }}
                animate={{ scale: 1, y: -36, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  popBubble(bubble.id);
                }}
                className="absolute z-40 w-8 h-8 rounded-full bg-cyan-300/45 border border-cyan-100 cursor-pointer"
                style={{ left: bubble.x - 16, top: bubble.y - 16 }}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {flyingFood && (
              <motion.div
                key={flyingFood.key}
                initial={{ y: 90, scale: 1.3, opacity: 1 }}
                animate={{ y: -5, scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="absolute z-40 p-3 rounded-full bg-sky-500/80 text-white shadow-lg pointer-events-none"
              >
                <VectorGlyphIcon name={flyingFood.iconKey} className="w-7 h-7" />
              </motion.div>
            )}
          </AnimatePresence>

          {kitten.isPlayMode && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { rotate: [0, 360], x: [-24, 24, -24], y: [0, -24, 0] }
              }
              transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute z-30 top-6 left-8 p-2.5 rounded-full bg-purple-600/80 text-sky-200 pointer-events-none"
            >
              <VectorGlyphIcon name={activeToyIcon} className="w-6 h-6" />
            </motion.div>
          )}

          {currentRoom === 'quarto' && !isSpectator && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSleepKitten();
                triggerCue(kitten.isSleeping ? 'idle' : 'sleep');
              }}
              className={`absolute left-2 bottom-2 z-30 min-w-[52px] min-h-[52px] p-2 rounded-2xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-lg ${
                kitten.isSleeping
                  ? 'bg-slate-900/90 border-indigo-400/60 text-indigo-300'
                  : 'bg-amber-400/25 border-amber-300/60 text-amber-200'
              }`}
            >
              <Lamp className="w-5 h-5" />
              <span className="text-[10px] font-bold">
                {kitten.isSleeping
                  ? 'Acordar'
                  : cdSleep > 0
                  ? formatCooldownMs(cdSleep)
                  : 'Dormir'}
              </span>
            </button>
          )}

          {petViewMode === 'design' ? (
            <div className="w-full relative">
              {!isSpectator && currentPetType === 'cat' && (
                <>
                  <input ref={petGlbInputRef} type="file" accept=".glb,model/gltf-binary" onChange={handlePetGlbUpload} className="hidden" />
                  <button type="button" disabled={isUploadingPetGlb} onClick={() => petGlbInputRef.current?.click()} className="absolute top-2 right-2 z-40 px-3 py-2 rounded-xl bg-[#0b1730]/90 border border-amber-200/35 text-amber-100 text-[10px] font-bold shadow-lg disabled:opacity-50">
                    {isUploadingPetGlb ? 'Carregando GLB…' : 'Atualizar gatinho GLB'}
                  </button>
                </>
              )}
              <ModelViewerPetStage
                embedded
                src={resolvedGlbUrl}
                alt={displayName}
                colorHex={currentWholeColor}
                hasWholeColor={Boolean(currentWholeColor)}
                partColors={currentPartColors}
                paintMode={paintMode}
                isSpectator={isSpectator}
                isDead={isPetDead}
                isSleeping={Boolean(kitten.isSleeping)}
                isEating={Boolean(kitten.isEating)}
                isDrinking={Boolean(kitten.isDrinking)}
                isBathing={Boolean(kitten.isBathing)}
                isPlayMode={Boolean(kitten.isPlayMode)}
                hasSoapFoam={soapFoamActive}
                isShowering={isShowering}
                danceMove={danceMove}
                actionCue={actionCue}
                onPaintPart={handlePaintPart}
                onPetTap={() => handleBodyClick('head')}
                fallback={
                  <PetCanvas3D
                    petType={currentPetType}
                    kitten={kitten}
                    danceMove={danceMove}
                    hasSoapFoam={soapFoamActive}
                    isShowering={isShowering}
                    customModelUrl={resolvedGlbUrl}
                    paintMode={paintMode}
                    actionCue={actionCue}
                    onPetTouch={handleBodyClick}
                    onPaintPart={handlePaintPart}
                  />
                }
              />
            </div>
          ) : petViewMode === '3d' ? (
            <div className="w-full relative">
              <PetCanvas3D
                petType={currentPetType}
                kitten={kitten}
                danceMove={danceMove}
                hasSoapFoam={soapFoamActive}
                isShowering={isShowering}
                customModelUrl={resolvedGlbUrl}
                paintMode={paintMode}
                actionCue={actionCue}
                onPetTouch={handleBodyClick}
                onPaintPart={handlePaintPart}
              />
            </div>
          ) : (
            <PetCharacter
              kitten={kitten}
              petType={currentPetType}
              danceMove={danceMove}
              paintMode={paintMode}
              onPaintPart={handlePaintPart}
              onPetPart={handleBodyClick}
              onNoseClick={handleNoseClick}
              hasSoapFoam={soapFoamActive}
              isShowering={isShowering}
            />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              captureVirtualPhoto(
                stageRef.current,
                `Mascote: ${displayName}`,
                `${currentSpecies.name} · Nível ${kitten.level || 1}`
              );
            }}
            className="absolute bottom-2 right-2 z-30 min-h-[36px] px-3 rounded-full bg-black/70 border border-sky-400/40 text-sky-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
            title="Fotografar Mascote para Galeria"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Foto Virtual</span>
          </button>
        </div>

        {/* Menu radial de ações rápidas do pet */}
        <div className="relative z-20 flex justify-center py-1">
          <div className="relative h-44 w-64 max-w-full">
            <AnimatePresence>
              {isActionWheelOpen && (
                <>
                  {[
                    { move: 'dance' as const, emoji: '💃', label: 'Dançar', msg: displayName + ' dançando ao som do amor ♡', top: '2%', left: '50%' },
                    { move: 'spin' as const, emoji: '🌀', label: 'Pirueta', msg: 'Pirueta perfeita de ' + displayName + '!', top: '24%', left: '88%' },
                    { move: 'jump' as const, emoji: '🐾', label: 'Pular', msg: 'Um pulinho de felicidade!', top: '76%', left: '76%' },
                    { move: 'wave' as const, emoji: '🐕', label: currentPetType === 'dog' ? 'Dar a pata' : 'Acenar', msg: displayName + ' está mandando um carinho pra você ♡', top: '76%', left: '24%' },
                    { move: 'kiss' as const, emoji: '💋', label: 'Beijo', msg: 'Um beijinho só seu ♡', top: '24%', left: '12%' },
                    { move: 'special' as const, emoji: currentPetType === 'dog' ? '🐶' : '🔊', label: currentPetType === 'dog' ? 'Latir' : currentPetType === 'cat' ? 'Ronronar' : 'Fazer som', msg: displayName + ' respondeu ao seu chamado!', top: '98%', left: '50%' },
                  ].map((action) => (
                    <motion.button
                      key={action.move}
                      type="button"
                      initial={{ opacity: 0, scale: 0.35, x: '-50%', y: '-50%' }}
                      animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                      exit={{ opacity: 0, scale: 0.35, x: '-50%', y: '-50%' }}
                      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (action.move === 'special') {
                          if (currentPetType === 'dog') soundEngine.playBark();
                          else if (currentPetType === 'cat') soundEngine.playPurr();
                          else playSpeciesSound();
                          triggerCue('pet');
                          setPetReaction(action.msg);
                        } else {
                          triggerDanceMove(action.move, action.label, action.msg);
                        }
                        setIsActionWheelOpen(false);
                      }}
                      style={{ position: 'absolute', top: action.top, left: action.left }}
                      className={danceMove === action.move
                        ? "w-[68px] min-h-[62px] rounded-2xl border border-amber-200/70 bg-gradient-to-br from-blue-500/85 to-violet-600/90 text-white backdrop-blur-xl shadow-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                        : "w-[68px] min-h-[62px] rounded-2xl border border-white/20 bg-[#0b1730]/95 text-white hover:border-amber-200/60 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"}
                    >
                      <span className="text-xl leading-none">{action.emoji}</span>
                      <span className="text-[9px] font-bold leading-tight">{action.label}</span>
                      {cdDance > 0 && <span className="text-[8px] text-amber-200">{formatCooldownMs(cdDance)}</span>}
                    </motion.button>
                  ))}
                </>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              aria-expanded={isActionWheelOpen}
              aria-label={isActionWheelOpen ? 'Fechar ações do pet' : 'Abrir ações do pet'}
              onClick={() => setIsActionWheelOpen((open) => !open)}
              whileTap={{ scale: 0.92 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[70px] h-[70px] rounded-full bg-gradient-to-br from-sky-500 via-violet-600 to-[#b79658] border-2 border-amber-100/70 text-white shadow-[0_8px_28px_rgba(96,165,250,.35)] flex flex-col items-center justify-center gap-0.5"
            >
              <PawPrint className="w-6 h-6" />
              <span className="text-[9px] font-extrabold">{isActionWheelOpen ? 'Fechar' : 'Ações'}</span>
            </motion.button>
          </div>
        </div>
        {/* Room Action Tray */}
        <div className="relative z-20 pt-2">
          {currentRoom === 'sala' && (
            <div className="grid grid-cols-4 gap-2">
              <button
                disabled={isSpectator}
                onClick={() => handleBodyClick('head')}
                className="min-h-[58px] p-2 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-50"
              >
                <Heart className="w-5 h-5 text-sky-300" />
                <span className="text-[10px] font-bold text-white">
                  {cdPet > 0 ? formatCooldownMs(cdPet) : 'Carinho'}
                </span>
              </button>
              {[
                { name: 'Novelo de Lã', label: 'Novelo', iconKey: 'sparkles' },
                { name: 'Ponto Laser', label: 'Laser', iconKey: 'target' },
                { name: 'Bolinha', label: 'Bolinha', iconKey: 'game' },
              ].map((toy) => (
                <button
                  key={toy.name}
                  onClick={() => handlePlayToy(toy.name, toy.iconKey)}
                  disabled={isSpectator || cdPlay > 0}
                  className="min-h-[58px] p-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-50"
                >
                  <VectorGlyphIcon name={toy.iconKey} className="w-5 h-5 text-purple-200" />
                  <span className="text-[10px] font-bold text-white">
                    {cdPlay > 0 ? formatCooldownMs(cdPlay) : toy.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {currentRoom === 'cozinha' && (
            <div className="space-y-2">
              {!hasKitchenAndBowl && !isSpectator && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-[11px] text-amber-100">
                  <span>Compre a Cozinha e coloque o Pote de Ração na Casa dos Sonhos para alimentar!</span>
                  <button
                    type="button"
                    onClick={() => setExtendedView('casa')}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/30 hover:bg-amber-500/45 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Home className="w-3 h-3" />
                    <span>Casa</span>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2">
                {getFoodMenu().map((food) => (
                  <button
                    key={food.name}
                    onClick={() => handleFeed(food.name, food.iconKey, food.hunger, food.happy)}
                    disabled={isSpectator || cdFeed > 0}
                    className="min-h-[60px] p-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-50"
                  >
                    <VectorGlyphIcon name={food.iconKey} className="w-5 h-5 text-amber-300" />
                    <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                      {cdFeed > 0 ? formatCooldownMs(cdFeed) : food.name}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleDrinkWater}
                  disabled={isSpectator || cdWater > 0}
                  className="min-h-[60px] p-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/35 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-50"
                >
                  <Droplets className="w-5 h-5 text-cyan-300" />
                  <span className="text-[10px] font-bold text-white leading-tight">
                    {cdWater > 0 ? formatCooldownMs(cdWater) : 'Água'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {currentRoom === 'banheiro' && (
            <div className="space-y-2">
              {!hasBathroomUnlocked && !isSpectator && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 text-[11px] text-cyan-100">
                  <span>Construa o Banheiro na Casa dos Sonhos para liberar o chuveiro!</span>
                  <button
                    type="button"
                    onClick={() => setExtendedView('casa')}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/45 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Home className="w-3 h-3" />
                    <span>Casa</span>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  disabled={isSpectator}
                  onClick={() => {
                    const next = !spongeMode;
                    setSpongeMode(next);
                    if (next) {
                      setPaintMode(false);
                      setSoapFoamActive(true);
                      setPetReaction('Passe a esponja no pet para ensaboar!');
                    }
                  }}
                  className={`min-h-[56px] px-3 py-2 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50 ${
                    spongeMode
                      ? 'bg-cyan-500/35 border-cyan-300 text-white'
                      : 'bg-teal-500/20 border-teal-400/30 text-teal-100'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <span className="text-xs font-bold">{spongeMode ? 'Ensaboando' : 'Esponja'}</span>
                </button>

                <button
                  onClick={handleShower}
                  disabled={isSpectator || cdBath > 0}
                  className="min-h-[56px] px-3 py-2 rounded-2xl bg-sky-500/25 hover:bg-sky-500/35 border border-sky-400/40 text-white flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <ShowerHead className="w-5 h-5 text-sky-300" />
                  <span className="text-xs font-bold">
                    {cdBath > 0 ? formatCooldownMs(cdBath) : 'Chuveiro'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {currentRoom === 'quarto' && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/35 border border-indigo-400/25">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/25 flex items-center justify-center text-indigo-300">
                  {kitten.isSleeping ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
                </div>
                <div className="text-xs font-bold text-white">
                  {kitten.isSleeping ? `${displayName} dormindo (Zzz)` : `${displayName} acordado`}
                </div>
              </div>

              <button
                onClick={() => {
                  toggleSleepKitten();
                  triggerCue(kitten.isSleeping ? 'idle' : 'sleep');
                }}
                disabled={isSpectator || (!kitten.isSleeping && cdSleep > 0)}
                className={`min-h-[42px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50 ${
                  kitten.isSleeping
                    ? 'bg-amber-500 text-purple-950 hover:bg-amber-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {kitten.isSleeping ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>
                  {kitten.isSleeping
                    ? 'Acordar'
                    : cdSleep > 0
                    ? formatCooldownMs(cdSleep)
                    : 'Dormir'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 4-Room Dock */}
      <div className="grid grid-cols-4 gap-2 glass-panel p-1.5 rounded-2xl border border-sky-500/20">
        {ROOM_ORDER.map((room) => {
          const meta = ROOM_META[room];
          const isActive = currentRoom === room;
          const RoomIcon =
            room === 'sala' ? Sofa : room === 'cozinha' ? Utensils : room === 'banheiro' ? Bath : BedDouble;
          return (
            <button
              key={room}
              onClick={() => {
                setCurrentRoom(room);
                setSpongeMode(false);
                soundEngine.playHeartPop();
              }}
              className={`min-h-[46px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-200/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <RoomIcon className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {typeof document !== 'undefined' && createPortal(drawersPortal, document.body)}
    </motion.div>
  );
};
