import React, { useState, useRef } from 'react';
import {
  Heart,
  Utensils,
  Droplets,
  Moon,
  Sun,
  Sparkles,
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { PetCharacter } from '../pets/PetCharacter';
import { PetCanvas3D, PetDanceMove } from '../3d/PetCanvas3D';
import { PET_SPECIES_CATALOG } from '../../data/initialData';
import { PetType } from '../../types';

type PetRoom = 'sala' | 'cozinha' | 'banheiro' | 'quarto';

const ROOM_ORDER: PetRoom[] = ['sala', 'cozinha', 'banheiro', 'quarto'];

const ROOM_META: Record<PetRoom, { label: string; title: string; icon: string; subtitle: string }> = {
  sala: {
    label: 'Sala',
    title: 'Sala de Estar',
    icon: '🛋️',
    subtitle: 'Carinho, brincadeiras & abraços',
  },
  cozinha: {
    label: 'Cozinha',
    title: 'Cozinha do Amor',
    icon: '🍽️',
    subtitle: 'Comidinhas & água fresquinha',
  },
  banheiro: {
    label: 'Banheiro',
    title: 'Banho Relaxante',
    icon: '🛁',
    subtitle: 'Esponja de sabão & chuveiro',
  },
  quarto: {
    label: 'Quarto',
    title: 'Quarto Estrelado',
    icon: '🛏️',
    subtitle: 'Abajur & soneca reparadora',
  },
};

export const KittenView: React.FC = () => {
  const {
    kitten,
    petKitten,
    feedKitten,
    giveWaterKitten,
    batheKitten,
    toggleSleepKitten,
    playWithKitten,
    switchPet,
    renamePet,
    storeItems,
    equipKittenItem,
    triggerEasterEgg,
    triggerHeartExplosion,
    setActiveTab: setNavTab,
  } = useApp();

  const prefersReducedMotion = useReducedMotion();

  const [currentRoom, setCurrentRoom] = useState<PetRoom>('sala');
  const [drawerModal, setDrawerModal] = useState<'none' | 'armario' | 'mascotes'>('none');
  const [petViewMode, setPetViewMode] = useState<'3d' | '2d'>('3d');
  const [danceMove, setDanceMove] = useState<PetDanceMove>('idle');
  const danceTimerRef = useRef<number | null>(null);
  const [wardrobeSlotFilter, setWardrobeSlotFilter] = useState<
    'all' | 'hat' | 'glasses' | 'collar' | 'outfit' | 'accessory'
  >('all');

  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(kitten.name || '');

  const [petReaction, setPetReaction] = useState<string>('Oi! Que saudade de você ♡');
  const [flyingFood, setFlyingFood] = useState<{ emoji: string; key: number } | null>(null);
  const [activeToyEmoji, setActiveToyEmoji] = useState<string>('🧶');

  // Bathroom states
  const [spongeMode, setSpongeMode] = useState(false);
  const [soapFoamActive, setSoapFoamActive] = useState(false);
  const [isShowering, setIsShowering] = useState(false);
  const [floatingBubbles, setFloatingBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastScrubTimeRef = useRef<number>(0);

  // Switch pet farewell modal
  const [farewellPetTarget, setFarewellPetTarget] = useState<typeof PET_SPECIES_CATALOG[0] | null>(null);
  const [switchPetName, setSwitchPetName] = useState<string>('');

  const currentPetType: PetType = (kitten.petType as PetType) || 'cat';
  const currentSpecies =
    PET_SPECIES_CATALOG.find((s) => s.type === currentPetType) || PET_SPECIES_CATALOG[0];
  const ownedPets: PetType[] = kitten.ownedPets || ['cat'];
  const displayName = kitten.name?.trim() || currentSpecies.name;
  const needsNaming = !kitten.name || !kitten.name.trim();

  // Dynamic Wardrobe items from Store (all hats, glasses, collars/ties, outfits, accessories)
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

  const handleNoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSpeciesSound();
    triggerHeartExplosion();
    triggerEasterEgg('egg-kitten-nose');
    setPetReaction(`Bip! Você tocou no focinho de ${displayName}! ✨`);
  };

  const handleBodyClick = (part: 'head' | 'belly' | 'paw') => {
    if (kitten.isSleeping) {
      soundEngine.playSleepSnore();
      setPetReaction(`Zzz... ${displayName} está dormindo tranquilamente... 🌙`);
      return;
    }

    if (currentRoom === 'banheiro' && spongeMode) {
      return;
    }

    if (part === 'head') {
      playSpeciesSound();
      setPetReaction(`Amo receber cafuné na cabecinha! 🥰`);
      petKitten('head');
    } else if (part === 'belly') {
      soundEngine.playPurr();
      setPetReaction(`Hihihi! Cosquinha gostosa na barriguinha! 🐾`);
      petKitten('belly');
    } else {
      soundEngine.playToyBoing();
      setPetReaction(`Toca aqui! High-five de patinha com ${displayName}! ✋`);
      petKitten('paw');
    }
  };

  const handleFeed = (foodName: string, emoji: string, hungerBoost: number, happyBoost: number) => {
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto antes de comer! 🌙`);
      return;
    }
    setFlyingFood({ emoji, key: Date.now() });
    feedKitten(foodName, hungerBoost, happyBoost);
    setPetReaction(`Nham nham! Que delícia de ${foodName}! ${emoji}`);
    setTimeout(() => setFlyingFood(null), 950);
  };

  const handleDrinkWater = () => {
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto antes de beber água! 🌙`);
      return;
    }
    setFlyingFood({ emoji: '💧', key: Date.now() });
    giveWaterKitten();
    setPetReaction(`Glub glub... Água fresquinha! 💧`);
    setTimeout(() => setFlyingFood(null), 950);
  };

  const handlePlayToy = (toyName: string, emoji: string) => {
    if (kitten.isSleeping) {
      setPetReaction(`${displayName} está dormindo! Apague o sono no Quarto para brincar 🌙`);
      return;
    }
    setActiveToyEmoji(emoji);
    playWithKitten(toyName);
    setPetReaction(`Ebaaa! Amo brincar com ${toyName}! ${emoji}✨`);
  };

  const triggerDanceMove = (move: Exclude<PetDanceMove, 'idle'>, label: string, msg: string) => {
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} no Quarto para dançar! 🌙`);
      return;
    }
    if (danceTimerRef.current) {
      window.clearTimeout(danceTimerRef.current);
    }
    setDanceMove(move);
    playWithKitten(label);
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
    if (currentRoom !== 'banheiro' || !spongeMode) return;
    const now = Date.now();
    if (now - lastScrubTimeRef.current < 260) return;
    lastScrubTimeRef.current = now;

    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setFloatingBubbles((prev) => [...prev.slice(-14), { id: now + Math.random(), x, y }]);
    setSoapFoamActive(true);
    batheKitten(15);
    setPetReaction(`Esfregando com espuma cheirosinha! 🧽🫧`);
  };

  const handleShower = () => {
    if (kitten.isSleeping) {
      setPetReaction(`Acorde ${displayName} primeiro antes do chuveiro! 🌙`);
      return;
    }
    setSpongeMode(false);
    setIsShowering(true);
    setSoapFoamActive(false);
    setFloatingBubbles([]);
    batheKitten(100);
    setPetReaction(`Água morninha do chuveiro! Limpinho e cheiroso ✨🚿`);
    setTimeout(() => setIsShowering(false), 1800);
  };

  const popBubble = (id: number) => {
    soundEngine.playBathSplash();
    setFloatingBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (customNameInput.trim()) {
      renamePet(customNameInput.trim());
      setIsEditingName(false);
      setPetReaction(`Amei meu novo nome: ${customNameInput.trim()}! ♡`);
    }
  };

  const getNeedColor = (value: number) => {
    if (value >= 65) return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/15';
    if (value >= 35) return 'text-amber-300 border-amber-400/40 bg-amber-500/15';
    return 'text-rose-300 border-rose-500/60 bg-rose-500/25 animate-pulse';
  };

  const getNeedBarFill = (value: number) => {
    if (value >= 65) return 'from-emerald-400 to-teal-400';
    if (value >= 35) return 'from-amber-400 to-yellow-400';
    return 'from-rose-500 to-pink-500';
  };

  const getFoodMenu = () => {
    switch (currentPetType) {
      case 'dog':
        return [
          { name: 'Biscoito de Osso', emoji: '🦴', hunger: 30, happy: 18 },
          { name: 'Bife Suculento', emoji: '🥩', hunger: 45, happy: 24 },
          { name: 'Petisco Crocante', emoji: '🥓', hunger: 35, happy: 26 },
        ];
      case 'bunny':
      case 'hamster':
      case 'turtle':
        return [
          { name: 'Cenourinha Doce', emoji: '🥕', hunger: 35, happy: 22 },
          { name: 'Folhinhas Frescas', emoji: '🥬', hunger: 30, happy: 18 },
          { name: 'Morangos Doces', emoji: '🍓', hunger: 38, happy: 30 },
        ];
      case 'fox':
      case 'bear':
      case 'hedgehog':
        return [
          { name: 'Pote de Mel Puro', emoji: '🍯', hunger: 40, happy: 32 },
          { name: 'Frutinhas do Bosque', emoji: '🫐', hunger: 32, happy: 24 },
          { name: 'Maçã Vermelhinha', emoji: '🍎', hunger: 34, happy: 20 },
        ];
      case 'panda':
        return [
          { name: 'Bambu Doce', emoji: '🎋', hunger: 42, happy: 28 },
          { name: 'Melancia Gelada', emoji: '🍉', hunger: 30, happy: 26 },
          { name: 'Bolinho Macio', emoji: '🥟', hunger: 38, happy: 24 },
        ];
      case 'penguin':
      case 'shark':
      case 'dolphin':
      case 'whale':
        return [
          { name: 'Peixinho Fresco', emoji: '🐟', hunger: 38, happy: 26 },
          { name: 'Camarãozinho', emoji: '🦐', hunger: 42, happy: 30 },
          { name: 'Lula Macia', emoji: '🦑', hunger: 35, happy: 22 },
        ];
      case 'bee':
        return [
          { name: 'Néctar de Rosa', emoji: '🌸', hunger: 35, happy: 28 },
          { name: 'Gota de Mel', emoji: '🍯', hunger: 42, happy: 32 },
          { name: 'Morango Doce', emoji: '🍓', hunger: 30, happy: 22 },
        ];
      case 'cat':
      default:
        return [
          { name: 'Sardinha Assada', emoji: '🐟', hunger: 36, happy: 24 },
          { name: 'Bife Gourmet', emoji: '🥩', hunger: 44, happy: 28 },
          { name: 'Morango c/ Creme', emoji: '🍓', hunger: 30, happy: 32 },
        ];
    }
  };

  // Room-specific backdrop theme
  const getRoomBackdropClass = () => {
    if (currentRoom === 'quarto' && kitten.isSleeping) {
      return 'from-[#060314] via-[#0b0724] to-[#04010d] border-indigo-500/40 shadow-[0_0_50px_rgba(79,70,229,0.28)]';
    }
    switch (currentRoom) {
      case 'cozinha':
        return 'from-[#281238] via-[#1c0b2e] to-[#120620] border-amber-400/30';
      case 'banheiro':
        return 'from-[#10223b] via-[#121638] to-[#0d0720] border-cyan-400/30';
      case 'quarto':
        return 'from-[#1d0e3b] via-[#14082c] to-[#0a041a] border-indigo-400/35';
      case 'sala':
      default:
        return 'from-[#2a0e42] via-[#1a082b] to-[#10041c] border-pink-400/30';
    }
  };

  const hungerVal = kitten.hunger ?? 80;
  const thirstVal = kitten.thirst ?? 80;
  const hygieneVal = kitten.hygiene ?? 80;
  const energyVal = kitten.energy ?? 80;
  const funVal = kitten.fun ?? 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3.5 pb-32 sm:pb-24 max-w-xl mx-auto"
    >
      {/* Top Header: Pet Identity, Level & Quick Drawers */}
      <div className="glass-panel p-3 rounded-2xl border border-pink-500/25 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-md relative border border-pink-300/30 shrink-0">
              <span>{currentSpecies.emoji}</span>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-purple-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-purple-950 shadow">
                Nv.{kitten.level || 1}
              </span>
            </div>

            <div className="min-w-0">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="Nome do pet..."
                    maxLength={18}
                    autoFocus
                    className="bg-purple-950/90 text-white text-sm font-bold px-2.5 py-1.5 rounded-xl border border-pink-400/60 outline-none w-32"
                  />
                  <button
                    type="submit"
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition cursor-pointer"
                    title="Salvar Nome"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1">
                  <h2 className="text-base sm:text-lg font-bold text-white font-display truncate">
                    {displayName}
                  </h2>
                  <button
                    onClick={() => {
                      setCustomNameInput(kitten.name || '');
                      setIsEditingName(true);
                    }}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-pink-300/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Escolher ou alterar nome"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-20 bg-purple-950/70 h-1.5 rounded-full overflow-hidden border border-purple-500/30">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, ((kitten.xp || 0) / (kitten.maxXp || 100)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-purple-200/80 font-mono">
                  XP {kitten.xp || 0}/{kitten.maxXp || 100}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setDrawerModal('armario')}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl glass-panel-interactive border border-pink-500/30 text-pink-200 hover:text-white flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
              title="Armário & Roupas"
            >
              <Shirt className="w-4 h-4" />
              <span className="hidden sm:inline">Armário</span>
            </button>
            <button
              onClick={() => setDrawerModal('mascotes')}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl glass-panel-interactive border border-purple-500/30 text-purple-200 hover:text-white flex items-center justify-center gap-1 text-xs font-bold cursor-pointer"
              title="Meus Mascotes"
            >
              <span>🐾</span>
              <span className="hidden sm:inline">Pets</span>
            </button>
            <button
              onClick={() => {
                playSpeciesSound();
                setPetReaction(`${displayName} mandou um som carinhoso para você! 💖`);
              }}
              className="min-w-[44px] min-h-[44px] rounded-xl glass-panel-interactive border border-pink-500/30 text-pink-300 hover:text-white flex items-center justify-center cursor-pointer"
              title="Ouvir Som"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline prompt when Samella hasn't chosen a name yet */}
        {needsNaming && !isEditingName && (
          <form
            onSubmit={handleSaveName}
            className="flex items-center gap-2 p-2 rounded-xl bg-pink-500/15 border border-pink-400/40"
          >
            <input
              type="text"
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              placeholder={`Escolha um nome para ${currentSpecies.name.toLowerCase()} ♡`}
              maxLength={18}
              className="flex-1 bg-purple-950/70 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-pink-400/40 outline-none placeholder-pink-200/50"
            />
            <button
              type="submit"
              className="min-h-[36px] px-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow cursor-pointer"
            >
              Salvar
            </button>
          </form>
        )}
      </div>

      {/* Pou-Style Top 5 Tappable Need Gauges */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {[
          { label: 'Fome', value: hungerVal, icon: Utensils, targetRoom: 'cozinha' as PetRoom },
          { label: 'Sede', value: thirstVal, icon: Droplets, targetRoom: 'cozinha' as PetRoom },
          { label: 'Banho', value: hygieneVal, icon: Bath, targetRoom: 'banheiro' as PetRoom },
          { label: 'Sono', value: energyVal, icon: Moon, targetRoom: 'quarto' as PetRoom },
          { label: 'Feliz', value: funVal, icon: Heart, targetRoom: 'sala' as PetRoom },
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
              className={`min-h-[58px] p-1.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${getNeedColor(
                meter.value
              )} ${isRoomActive ? 'ring-2 ring-pink-400/70 scale-[1.02]' : 'opacity-90 hover:opacity-100'}`}
            >
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <Icon className="w-3 h-3" />
                <span>{meter.label}</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getNeedBarFill(meter.value)} transition-all duration-500`}
                  style={{ width: `${meter.value}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-white/90">{meter.value}%</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Pou / Talking Tom Room Stage */}
      <div
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            handleStageSoapInteract(e.clientX, e.clientY, e.currentTarget);
          }
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) {
            handleStageSoapInteract(touch.clientX, touch.clientY, e.currentTarget);
          }
        }}
        onClick={(e) => handleStageSoapInteract(e.clientX, e.clientY, e.currentTarget)}
        className={`relative rounded-3xl p-4 sm:p-5 border bg-gradient-to-b transition-all duration-500 overflow-hidden select-none min-h-[390px] flex flex-col justify-between ${getRoomBackdropClass()}`}
      >
        {/* Room Decor Layer (Window, Tiles, Lamp, Rug) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {currentRoom === 'sala' && (
            <>
              {/* Romantic starry window */}
              <div className="absolute top-6 right-7 w-20 h-24 rounded-t-full rounded-b-xl bg-gradient-to-b from-indigo-950 to-purple-900 border-2 border-purple-400/30 opacity-75 flex items-center justify-center">
                <span className="text-lg">🌙✨</span>
              </div>
              {/* Cozy floor rug */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-14 rounded-[100%] bg-gradient-to-r from-pink-500/20 via-purple-500/30 to-pink-500/20 border border-pink-400/25" />
            </>
          )}

          {currentRoom === 'cozinha' && (
            <>
              {/* Kitchen shelf */}
              <div className="absolute top-12 left-6 w-28 h-2 rounded-full bg-amber-500/40" />
              <div className="absolute top-6 left-9 text-lg opacity-80">🍯 🫖</div>
              {/* Kitchen wooden counter surface */}
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-b from-amber-950/60 to-[#140718] border-t-2 border-amber-400/25" />
            </>
          )}

          {currentRoom === 'banheiro' && (
            <>
              {/* Subtle bath tile grid */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(103,232,249,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(103,232,249,0.35) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
              {/* Bath mat */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-60 h-12 rounded-2xl bg-cyan-400/20 border border-cyan-300/30" />
            </>
          )}

          {currentRoom === 'quarto' && (
            <>
              {/* Starry window */}
              <div className="absolute top-6 left-7 w-20 h-24 rounded-2xl bg-gradient-to-b from-slate-950 to-indigo-950 border-2 border-indigo-400/30 opacity-85 flex items-center justify-center">
                <span className="text-lg">🌌⭐</span>
              </div>
              {/* Plush pet cushion bed */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-72 h-16 rounded-full bg-gradient-to-r from-indigo-600/35 via-purple-500/40 to-indigo-600/35 border-2 border-indigo-300/30 shadow-inner" />
            </>
          )}
        </div>

        {/* Top Room Switcher Bar + 3D 360° / 2D Toggle */}
        <div className="relative z-20 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRoomCycle(-1);
            }}
            className="min-w-[40px] min-h-[40px] rounded-2xl bg-black/40 border border-white/15 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer shrink-0"
            aria-label="Cômodo anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center px-3 py-1 rounded-2xl bg-black/45 border border-white/10 min-w-0">
            <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5 truncate">
              <span>{ROOM_META[currentRoom].icon}</span>
              <span>{ROOM_META[currentRoom].title}</span>
            </div>
            <div className="text-[10px] text-purple-200/75 truncate">{ROOM_META[currentRoom].subtitle}</div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-black/50 border border-pink-400/30 rounded-full p-0.5 text-[10px] font-bold"
            >
              <button
                type="button"
                onClick={() => setPetViewMode('3d')}
                className={`px-2 py-1 rounded-full flex items-center gap-1 transition cursor-pointer ${
                  petViewMode === '3d'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                <Orbit className="w-3 h-3" />
                <span>3D</span>
              </button>
              <button
                type="button"
                onClick={() => setPetViewMode('2d')}
                className={`px-2 py-1 rounded-full transition cursor-pointer ${
                  petViewMode === '2d'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                2D
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRoomCycle(1);
              }}
              className="min-w-[40px] min-h-[40px] rounded-2xl bg-black/40 border border-white/15 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
              aria-label="Próximo cômodo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative z-20 flex justify-center mt-2">
          <motion.div
            key={petReaction}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="px-4 py-2 rounded-2xl bg-white/95 text-purple-950 text-xs sm:text-sm font-semibold shadow-xl border border-pink-200 relative max-w-xs text-center"
          >
            {petReaction}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-b border-r border-pink-200" />
          </motion.div>
        </div>

        {/* Center Pet Character + Interactive Overlays */}
        <div className="relative z-20 flex items-center justify-center my-1 min-h-[230px]">
          {/* Interactive Soap Bubbles */}
          <AnimatePresence>
            {floatingBubbles.map((bubble) => (
              <motion.button
                key={bubble.id}
                type="button"
                initial={{ scale: 0, opacity: 0.85 }}
                animate={{ scale: 1, y: -38, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  popBubble(bubble.id);
                }}
                className="absolute z-40 w-8 h-8 rounded-full bg-cyan-300/45 border border-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.65)] cursor-pointer backdrop-blur-sm"
                style={{ left: bubble.x - 16, top: bubble.y - 16 }}
                aria-label="Estourar bolha de sabão"
              />
            ))}
          </AnimatePresence>

          {/* Flying Food to Mouth */}
          <AnimatePresence>
            {flyingFood && (
              <motion.div
                key={flyingFood.key}
                initial={prefersReducedMotion ? { opacity: 1 } : { y: 95, scale: 1.3, opacity: 1 }}
                animate={{ y: -5, scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeInOut' }}
                className="absolute z-40 text-4xl pointer-events-none"
              >
                {flyingFood.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Toy Animation */}
          {kitten.isPlayMode && (
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { rotate: [0, 360], x: [-28, 28, -28], y: [0, -28, 0] }
              }
              transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute z-30 top-6 left-8 text-4xl pointer-events-none"
            >
              {activeToyEmoji}
            </motion.div>
          )}

          {/* Quarto Bedside Lamp Button */}
          {currentRoom === 'quarto' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSleepKitten();
              }}
              className={`absolute right-1 sm:right-4 bottom-8 z-30 min-w-[54px] min-h-[54px] p-2.5 rounded-2xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-lg ${
                kitten.isSleeping
                  ? 'bg-slate-900/90 border-indigo-400/60 text-indigo-300'
                  : 'bg-amber-400/25 border-amber-300/60 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.45)]'
              }`}
              title={kitten.isSleeping ? 'Acender Abajur (Acordar)' : 'Apagar Abajur (Dormir)'}
            >
              <Lamp className="w-5 h-5" />
              <span className="text-[10px] font-bold">
                {kitten.isSleeping ? 'Acender' : 'Apagar'}
              </span>
            </button>
          )}

          {petViewMode === '3d' ? (
            <PetCanvas3D
              petType={currentPetType}
              kitten={kitten}
              danceMove={danceMove}
              hasSoapFoam={soapFoamActive}
              isShowering={isShowering}
              onPetTouch={handleBodyClick}
            />
          ) : (
            <PetCharacter
              kitten={kitten}
              petType={currentPetType}
              danceMove={danceMove}
              onPetPart={handleBodyClick}
              onNoseClick={handleNoseClick}
              hasSoapFoam={soapFoamActive}
              isShowering={isShowering}
            />
          )}
        </div>

        {/* Interactive Dance & Animations Bar (Always accessible!) */}
        <div className="relative z-20 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { move: 'dance' as const, emoji: '💃', label: 'Dançar', msg: `${displayName} está dançando feliz ao som do nosso amor! 💃✨` },
            { move: 'spin' as const, emoji: '🔄', label: 'Pirueta 360°', msg: `Olha que pirueta perfeita de ${displayName}! 🌟🔄` },
            { move: 'jump' as const, emoji: '🦘', label: 'Pulo Alegre', msg: `Pulo altíssimo de felicidade! 🎉🐾` },
            { move: 'wave' as const, emoji: '👋', label: 'Acenar', msg: `Oi meu amor! ${displayName} está acenando pra você! 👋💖` },
            { move: 'kiss' as const, emoji: '😘', label: 'Beijinho', msg: `Muuuack! Um beijo gigante pra Samella! 😘💕` },
          ].map((btn) => {
            const active = danceMove === btn.move;
            return (
              <button
                key={btn.move}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerDanceMove(btn.move, btn.label, btn.msg);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0 border transition cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                    : 'bg-black/45 border-white/15 text-pink-100 hover:bg-white/10'
                }`}
              >
                <span>{btn.emoji}</span>
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Room-Specific Interactive Tray */}
        <div className="relative z-20 pt-2">
          {currentRoom === 'sala' && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleBodyClick('head')}
                className="min-h-[60px] p-2 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/35 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🥰</span>
                <span className="text-[11px] font-bold text-white">Carinho</span>
              </button>
              <button
                onClick={() => handlePlayToy('Novelo de Lã', '🧶')}
                className="min-h-[60px] p-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/35 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🧶</span>
                <span className="text-[11px] font-bold text-white">Novelo</span>
              </button>
              <button
                onClick={() => handlePlayToy('Ponto Laser', '🔴')}
                className="min-h-[60px] p-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/35 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🔴</span>
                <span className="text-[11px] font-bold text-white">Laser</span>
              </button>
              <button
                onClick={() => handlePlayToy('Bolinha Saltitante', '🎾')}
                className="min-h-[60px] p-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/35 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
              >
                <span className="text-xl">🎾</span>
                <span className="text-[11px] font-bold text-white">Bolinha</span>
              </button>
            </div>
          )}

          {currentRoom === 'cozinha' && (
            <div className="grid grid-cols-4 gap-2">
              {getFoodMenu().map((food) => (
                <button
                  key={food.name}
                  onClick={() => handleFeed(food.name, food.emoji, food.hunger, food.happy)}
                  className="min-h-[64px] p-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition"
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                    {food.name}
                  </span>
                  <span className="text-[9px] text-amber-200/80">+{food.hunger}%</span>
                </button>
              ))}
              <button
                onClick={handleDrinkWater}
                className="min-h-[64px] p-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition"
              >
                <span className="text-2xl">🥛</span>
                <span className="text-[10px] font-bold text-white leading-tight">Água Fresca</span>
                <span className="text-[9px] text-cyan-200">+35% Sede</span>
              </button>
            </div>
          )}

          {currentRoom === 'banheiro' && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  const next = !spongeMode;
                  setSpongeMode(next);
                  if (next) {
                    setSoapFoamActive(true);
                    setPetReaction('Deslize ou toque no pet com a esponja para ensaboar! 🧽');
                  }
                }}
                className={`min-h-[60px] px-3 py-2 rounded-2xl border flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-95 ${
                  spongeMode
                    ? 'bg-cyan-500/35 border-cyan-300 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    : 'bg-teal-500/20 border-teal-400/35 text-teal-100 hover:bg-teal-500/30'
                }`}
              >
                <span className="text-2xl">🧽</span>
                <div className="text-left">
                  <div className="text-xs font-bold">
                    {spongeMode ? 'Ensaboando (Ativo)' : 'Esponja de Sabão'}
                  </div>
                  <div className="text-[10px] text-cyan-200/80">
                    {spongeMode ? 'Toque/deslize no pet' : 'Faz espuma mágica'}
                  </div>
                </div>
              </button>

              <button
                onClick={handleShower}
                className="min-h-[60px] px-3 py-2 rounded-2xl bg-sky-500/25 hover:bg-sky-500/35 border border-sky-400/45 text-white flex items-center justify-center gap-2.5 cursor-pointer transition active:scale-95"
              >
                <ShowerHead className="w-6 h-6 text-sky-300" />
                <div className="text-left">
                  <div className="text-xs font-bold">Ligar Chuveiro</div>
                  <div className="text-[10px] text-sky-200/80">Enxágua & 100% limpo</div>
                </div>
              </button>
            </div>
          )}

          {currentRoom === 'quarto' && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/35 border border-indigo-400/25">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/25 flex items-center justify-center text-indigo-300">
                  {kitten.isSleeping ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-300" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {kitten.isSleeping
                      ? `${displayName} está dormindo 💤`
                      : `${displayName} está acordado`}
                  </div>
                  <div className="text-[11px] text-indigo-200/75">
                    {kitten.isSleeping
                      ? 'Recarregando energia passivamente...'
                      : 'Apague o abajur para recarregar o sono'}
                  </div>
                </div>
              </div>

              <button
                onClick={toggleSleepKitten}
                className={`min-h-[44px] px-4 rounded-xl font-bold text-xs cursor-pointer transition ${
                  kitten.isSleeping
                    ? 'bg-amber-500 text-purple-950 hover:bg-amber-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {kitten.isSleeping ? 'Acordar ☀️' : 'Dormir 🌙'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 4-Room Navigation Dock (Pou / Talking Tom Style) */}
      <div className="grid grid-cols-4 gap-2 glass-panel p-1.5 rounded-2xl border border-pink-500/25">
        {ROOM_ORDER.map((room) => {
          const meta = ROOM_META[room];
          const isActive = currentRoom === room;
          return (
            <button
              key={room}
              onClick={() => {
                setCurrentRoom(room);
                setSpongeMode(false);
                soundEngine.playHeartPop();
              }}
              className={`min-h-[48px] rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-200/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Wardrobe (Armário) Drawer Modal */}
      <AnimatePresence>
        {drawerModal === 'armario' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 bg-gradient-to-b from-[#1e0c36] to-[#0a0317] border border-pink-400/35 shadow-2xl max-h-[82vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-pink-400" />
                    Armário de {displayName}
                  </h3>
                  <p className="text-[11px] text-purple-200/75">
                    Vista chapéus, óculos, gravatas, coleiras, roupas & asas juntos!
                  </p>
                </div>
                <button
                  onClick={() => setDrawerModal('none')}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white/10 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slot Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'all' as const, label: 'Tudo' },
                  { id: 'hat' as const, label: 'Chapéus 👑' },
                  { id: 'glasses' as const, label: 'Óculos 🕶️' },
                  { id: 'collar' as const, label: 'Gravatas & Coleiras 👔' },
                  { id: 'outfit' as const, label: 'Roupas 👗' },
                  { id: 'accessory' as const, label: 'Acessórios 🪽' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setWardrobeSlotFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 border transition cursor-pointer ${
                      wardrobeSlotFilter === f.id
                        ? 'bg-pink-500 text-white border-pink-300 shadow'
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
                  return (
                    <button
                      key={item.id}
                      disabled={!item.purchased}
                      onClick={() => item.purchased && equipKittenItem(item.id, slot)}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1 transition-all ${
                        !item.purchased
                          ? 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                          : equipped
                          ? 'bg-pink-500/25 border-pink-400 shadow-md cursor-pointer'
                          : 'glass-panel-interactive border-purple-500/30 cursor-pointer'
                      }`}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                      <span className="text-[10px] font-semibold text-pink-300">
                        {item.purchased
                          ? equipped
                            ? 'Equipado ✨ (Toque p/ tirar)'
                            : 'Equipar'
                          : `Bloqueado (${item.price} 💎)`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setDrawerModal('none');
                  setNavTab('loja');
                }}
                className="w-full min-h-[44px] py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Comprar Mais Roupas na Loja
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pets Switcher Drawer Modal */}
      <AnimatePresence>
        {drawerModal === 'mascotes' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 bg-gradient-to-b from-[#1e0c36] to-[#0a0317] border border-pink-400/35 shadow-2xl max-h-[82vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Seus Mascotes ({ownedPets.length}/{PET_SPECIES_CATALOG.length})
                  </h3>
                  <p className="text-[11px] text-purple-200/75">
                    Escolha com qual bichinho cuidar agora
                  </p>
                </div>
                <button
                  onClick={() => setDrawerModal('none')}
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-white/10 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PET_SPECIES_CATALOG.map((species) => {
                  const isOwned = ownedPets.includes(species.type);
                  const isActive = currentPetType === species.type;
                  const savedCustomName = kitten.customNames?.[species.type] || '';

                  return (
                    <div
                      key={species.type}
                      onClick={() => {
                        if (!isOwned || isActive) return;
                        setDrawerModal('none');
                        setFarewellPetTarget(species);
                        setSwitchPetName(savedCustomName);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400'
                          : isOwned
                          ? 'glass-panel-interactive border-purple-500/30 cursor-pointer'
                          : 'bg-purple-950/20 border-white/5 opacity-65'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-2xl p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                          {species.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">
                              {savedCustomName || species.name}
                            </span>
                            {isActive && (
                              <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-purple-200/70 truncate">
                            {species.name} • {species.personality}
                          </p>
                        </div>
                      </div>

                      {!isOwned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerModal('none');
                            setNavTab('loja');
                          }}
                          className="min-h-[38px] px-3 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Adotar na Loja
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delicate Farewell & Naming Dialog when Switching Pets */}
      <AnimatePresence>
        {farewellPetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-[#1b0a2f] via-[#120622] to-[#080214] border border-pink-400/40 shadow-2xl space-y-4 text-center"
            >
              <div className="flex justify-center -space-x-2 text-4xl pt-1">
                <span className="p-2 rounded-2xl bg-purple-950/80 border border-purple-500/30 shadow-md">
                  {currentSpecies.emoji}
                </span>
                <span className="p-2 rounded-2xl bg-pink-950/80 border border-pink-500/30 shadow-md">
                  {farewellPetTarget.emoji}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Trocar para {farewellPetTarget.name}?
                </h3>
                <p className="mt-2 p-3 rounded-2xl bg-purple-950/60 border border-pink-500/20 text-xs text-pink-100/90 leading-relaxed italic">
                  &ldquo;{displayName} deu um abraço fofinho e foi descansar enquanto você brinca com{' '}
                  {switchPetName.trim() || farewellPetTarget.name}! ♡&rdquo;
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-pink-300 block">
                  Escolha o nome deste mascote (opcional):
                </label>
                <input
                  type="text"
                  value={switchPetName}
                  onChange={(e) => setSwitchPetName(e.target.value)}
                  placeholder={`Digite um nome para ${farewellPetTarget.name.toLowerCase()}...`}
                  maxLength={18}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-pink-500/40 text-white text-xs font-semibold focus:outline-none focus:border-pink-400 placeholder-purple-400/50"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setFarewellPetTarget(null)}
                  className="flex-1 min-h-[44px] py-2 rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold hover:bg-purple-900/30 transition cursor-pointer"
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
                      setPetReaction(`Oi! Sou ${typed} e já te amo muito! ✨`);
                    } else {
                      setPetReaction(`Escolha um nome especial para mim lá em cima! ♡`);
                    }
                    soundEngine.playSparkle();
                    triggerHeartExplosion(0.5, 0.4);
                  }}
                  className="flex-1 min-h-[44px] py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  Trocar Agora ♡
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
