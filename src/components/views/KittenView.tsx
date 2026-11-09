import React, { useState } from 'react';
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
  Gamepad2,
  Sparkle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { PetCharacter } from '../pets/PetCharacter';
import { PetCanvas3D } from '../3d/PetCanvas3D';
import { PET_SPECIES_CATALOG } from '../../data/initialData';
import { PetType } from '../../types';

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

  const [activeTab, setActiveTab] = useState<'cuidados' | 'comidinhas' | 'brinquedos' | 'armario' | 'mascotes'>('cuidados');
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>('3d');
  const [floatingBubbles, setFloatingBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [petReaction, setPetReaction] = useState<string>('Olá! Vamos brincar? ♡');
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(kitten.name);
  const [activeFoodEmoji, setActiveFoodEmoji] = useState('🐟');
  const [farewellPetTarget, setFarewellPetTarget] = useState<typeof PET_SPECIES_CATALOG[0] | null>(null);

  const currentPetType: PetType = (kitten.petType as PetType) || 'cat';
  const currentSpecies = PET_SPECIES_CATALOG.find((s) => s.type === currentPetType) || PET_SPECIES_CATALOG[0];
  const ownedPets: PetType[] = kitten.ownedPets || ['cat'];

  // Check which store items are purchased
  const hasCrown = storeItems.find((i) => i.id === 'item-cat-crown')?.purchased;
  const hasRibbon = storeItems.find((i) => i.id === 'item-cat-ribbon')?.purchased;
  const hasSunglasses = storeItems.find((i) => i.id === 'item-cat-sunglasses')?.purchased;
  const hasBowtie = storeItems.find((i) => i.id === 'item-cat-bowtie')?.purchased;
  const hasAngelWings = storeItems.find((i) => i.id === 'item-cat-angel-wings')?.purchased;

  const playSpeciesSound = () => {
    switch (currentPetType) {
      case 'dog':
        soundEngine.playBark();
        break;
      case 'bunny':
      case 'hamster':
        soundEngine.playSqueak();
        break;
      case 'fox':
        soundEngine.playFoxSound();
        break;
      case 'penguin':
        soundEngine.playChirp();
        break;
      case 'cat':
      default:
        soundEngine.playMeowHappy();
        break;
    }
  };

  const handleNoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSpeciesSound();
    triggerHeartExplosion();
    triggerEasterEgg('egg-kitten-nose');
    setPetReaction(`Bip! Você tocou no focinho de ${kitten.name}! ✨`);
  };

  const handleBodyClick = (part: 'head' | 'belly' | 'paw') => {
    if (kitten.isSleeping) {
      soundEngine.playSleepSnore();
      setPetReaction(`Zzz... ${kitten.name} está no décimo sono... 🌙`);
      return;
    }

    if (part === 'head') {
      playSpeciesSound();
      setPetReaction(`Amo quando você faz carinho na minha cabecinha! 🥰`);
      petKitten('head');
    } else if (part === 'belly') {
      soundEngine.playPurr();
      setPetReaction(`Hihihi! Isso faz cosquinha na minha barriguinha! 🐾`);
      petKitten('belly');
    } else {
      soundEngine.playToyBoing();
      setPetReaction(`Toca aqui! High-five de patinha com ${kitten.name}! ✋`);
      petKitten('paw');
    }
  };

  const handleFeed = (foodName: string, emoji: string, hungerBoost: number, happinessBoost: number) => {
    setActiveFoodEmoji(emoji);
    feedKitten(foodName);
    setPetReaction(`Nham nham! Que delícia de ${foodName}! ${emoji}`);
  };

  const handlePlayToy = (toyName: string, emoji: string) => {
    playWithKitten(toyName);
    setPetReaction(`Adorei brincar com o ${toyName}! ${emoji}✨`);
  };

  const addSoapBubble = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!kitten.isBathing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newBubble = { id: Date.now() + Math.random(), x, y };
    setFloatingBubbles((prev) => [...prev.slice(-15), newBubble]);
    soundEngine.playBathSplash();
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
    }
  };

  // Helper function to get color for vital bar
  const getVitalColor = (value: number) => {
    if (value >= 70) return 'from-emerald-400 to-teal-500';
    if (value >= 35) return 'from-amber-400 to-yellow-500';
    return 'from-rose-500 to-red-600';
  };

  // Get species food list
  const getFoodMenu = () => {
    switch (currentPetType) {
      case 'dog':
        return [
          { name: 'Biscoito de Osso Crocante', emoji: '🦴', hunger: 30, happy: 20 },
          { name: 'Bife Suculento Grelhado', emoji: '🥩', hunger: 45, happy: 25 },
          { name: 'Tigela de Água & Caldo', emoji: '🥣', hunger: 25, happy: 15 },
          { name: 'Petisco de Bacon & Amor', emoji: '🥓', hunger: 35, happy: 30 },
        ];
      case 'bunny':
        return [
          { name: 'Cenourinha Doce Orgânica', emoji: '🥕', hunger: 35, happy: 25 },
          { name: 'Folhas Frescas de Alface', emoji: '🥬', hunger: 30, happy: 20 },
          { name: 'Morangos Vermelhinhos', emoji: '🍓', hunger: 40, happy: 35 },
          { name: 'Fatia de Maçã Fina', emoji: '🍎', hunger: 30, happy: 25 },
        ];
      case 'fox':
        return [
          { name: 'Frutinhas Silvestres', emoji: '🫐', hunger: 35, happy: 30 },
          { name: 'Cogumelos Mágicos', emoji: '🍄', hunger: 30, happy: 20 },
          { name: 'Frango Dourado', emoji: '🍗', hunger: 45, happy: 25 },
          { name: 'Bagas Doces da Floresta', emoji: '🍒', hunger: 35, happy: 35 },
        ];
      case 'panda':
        return [
          { name: 'Bambu Doce Crocante', emoji: '🎋', hunger: 40, happy: 30 },
          { name: 'Broto de Bambu Macio', emoji: '🎍', hunger: 35, happy: 25 },
          { name: 'Fatia de Melancia Geladinha', emoji: '🍉', hunger: 30, happy: 35 },
          { name: 'Pãozinho Chinês Vaporizado', emoji: '🥟', hunger: 40, happy: 30 },
        ];
      case 'penguin':
        return [
          { name: 'Picolé de Peixe Fresco', emoji: '🐟', hunger: 35, happy: 30 },
          { name: 'Camarãozinho do Mar', emoji: '🦐', hunger: 40, happy: 35 },
          { name: 'Cubinhos de Gelo Crocantes', emoji: '🧊', hunger: 20, happy: 25 },
          { name: 'Lula Macia', emoji: '🦑', hunger: 45, happy: 25 },
        ];
      case 'bear':
        return [
          { name: 'Pote de Mel Puro Dourado', emoji: '🍯', hunger: 45, happy: 40 },
          { name: 'Salmão Selvagem', emoji: '🐟', hunger: 40, happy: 30 },
          { name: 'Amoras Silvestres', emoji: '🫐', hunger: 30, happy: 25 },
          { name: 'Cesta de Frutas Doces', emoji: '🍇', hunger: 35, happy: 30 },
        ];
      case 'cat':
      default:
        return [
          { name: 'Sardinha Fresquinha', emoji: '🐟', hunger: 35, happy: 25 },
          { name: 'Bife Gourmet Picadinho', emoji: '🥩', hunger: 45, happy: 30 },
          { name: 'Tigela de Leite Quentinho', emoji: '🥛', hunger: 25, happy: 20 },
          { name: 'Petisco de Morango com Chocolate', emoji: '🍓', hunger: 35, happy: 35 },
        ];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 pb-32 sm:pb-24 max-w-xl mx-auto"
    >
      {/* Top Header with Level, Species & Rename */}
      <div className="flex items-center justify-between glass-panel p-3.5 rounded-2xl border border-pink-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg relative border border-pink-400/30">
            <span>{currentSpecies.emoji}</span>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-purple-950 font-black text-[10px] px-1.5 py-0.5 rounded-full border border-purple-900 shadow">
              Nv.{kitten.level || 1}
            </span>
          </div>
          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="bg-purple-950/80 text-white text-sm font-bold px-2 py-1 rounded-lg border border-pink-400/50 outline-none w-32"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition"
                  title="Salvar Nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display leading-tight">{kitten.name}</h2>
                <button
                  onClick={() => {
                    setCustomNameInput(kitten.name);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-pink-300/80 hover:text-white transition"
                  title="Renomear Mascote"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-pink-300 font-medium">
              <span>{currentSpecies.name}</span>
              <span>•</span>
              <span className="text-purple-200/70">{currentSpecies.personality}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 bg-purple-950/60 h-2 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, ((kitten.xp || 0) / (kitten.maxXp || 100)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-200/80 font-mono">
                XP: {kitten.xp || 0}/{kitten.maxXp || 100}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Sound & Multi-pet tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mascotes')}
            className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
              activeTab === 'mascotes'
                ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow'
                : 'glass-panel-interactive border-purple-500/30 text-purple-200 hover:text-white'
            }`}
            title="Trocar ou Adotar Mascote"
          >
            <span>🐾</span>
            <span className="hidden sm:inline">Trocar</span>
          </button>
          <button
            onClick={() => {
              playSpeciesSound();
              setPetReaction(`${kitten.name} fez um som carinhoso para Gabriel & Samella! 💖`);
            }}
            className="p-2.5 rounded-xl glass-panel-interactive border border-pink-500/30 text-pink-300 hover:text-white"
            title="Ouvir Som"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        onClick={addSoapBubble}
        className={`relative glass-card-glow rounded-3xl p-5 md:p-6 border transition-colors duration-700 overflow-hidden flex flex-col items-center select-none ${
          kitten.isSleeping
            ? 'border-indigo-500/40 bg-slate-950/90 shadow-[0_0_50px_rgba(79,70,229,0.3)]'
            : 'border-pink-400/30 bg-gradient-to-b from-purple-950/40 via-pink-950/20 to-purple-950/60 shadow-2xl'
        }`}
      >
        {/* Top ambient bar: ambient name + 3D/2D toggle */}
        <div className="w-full flex items-center justify-between z-20 mb-2">
          {kitten.isSleeping ? (
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
              <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Quarto escuro (Dormindo...)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-pink-300/80 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Cantinho do Amor ♡</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: 3D Realista vs 2D Clássico */}
            <div className="flex items-center p-0.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-[11px] font-bold">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenderMode('3d');
                  soundEngine.playSparkle();
                }}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  renderMode === '3d'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Modo 3D Realista com 360°"
              >
                🎮 3D
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenderMode('2d');
                  soundEngine.playSparkle();
                }}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  renderMode === '2d'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Modo 2D Clássico"
              >
                🎨 2D
              </button>
            </div>

            {/* Night Light Switch Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSleepKitten();
              }}
              className={`p-2 rounded-xl border transition-all duration-300 flex items-center gap-1 text-xs font-semibold ${
                kitten.isSleeping
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-indigo-900/40 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/60'
              }`}
              title={kitten.isSleeping ? `Acordar ${kitten.name}` : 'Apagar as luzes / Colocar para dormir'}
            >
              {kitten.isSleeping ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{kitten.isSleeping ? 'Acordar' : 'Dormir'}</span>
            </button>
          </div>
        </div>

        {/* Speech Bubble / Dialogue */}
        <motion.div
          key={petReaction}
          initial={{ opacity: 0, scale: 0.8, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="my-2 px-4 py-2 rounded-2xl bg-white/95 text-purple-950 text-xs md:text-sm font-semibold shadow-xl border border-pink-200 relative max-w-xs text-center z-20"
        >
          {petReaction}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-b border-r border-pink-200" />
        </motion.div>

        {/* Dynamic Pet Stage: 3D Fantasy Mesh or 2D Vector Rig */}
        <div className="relative w-full flex items-center justify-center">
          {/* Bath soap bubbles floating */}
          <AnimatePresence>
            {floatingBubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 1, y: -40, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  popBubble(bubble.id);
                }}
                className="absolute z-40 w-7 h-7 rounded-full bg-cyan-300/40 border border-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.6)] cursor-pointer backdrop-blur-sm"
                style={{ left: bubble.x - 14, top: bubble.y - 14 }}
              />
            ))}
          </AnimatePresence>

          {/* Eating animation overlay */}
          {kitten.isEating && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-30 bottom-8 left-10 text-4xl animate-bounce pointer-events-none"
            >
              {activeFoodEmoji}
            </motion.div>
          )}

          {/* Drinking animation overlay */}
          {kitten.isDrinking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute z-30 bottom-8 right-10 text-3xl animate-pulse pointer-events-none"
            >
              🥛
            </motion.div>
          )}

          {/* Play toy animation */}
          {kitten.isPlayMode && (
            <motion.div
              animate={{ rotate: [0, 360], x: [-20, 20, -20], y: [0, -25, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute z-30 top-12 left-6 text-4xl pointer-events-none"
            >
              🧶
            </motion.div>
          )}

          {renderMode === '3d' ? (
            <div className="w-full">
              <PetCanvas3D
                petType={currentPetType}
                kitten={kitten}
                isInteracting={kitten.isEating || kitten.isDrinking || kitten.isPlayMode}
                onPetTouch={handleBodyClick}
                hasCrown={hasCrown}
                hasRibbon={hasRibbon}
                hasSunglasses={hasSunglasses}
                hasBowtie={hasBowtie}
                hasAngelWings={hasAngelWings}
              />
            </div>
          ) : (
            <motion.div
              animate={{ 
                rotateY: [-5, 5, -5],
                rotateX: [3, -3, 3],
                y: [-3, 3, -3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
            >
              <PetCharacter
                kitten={kitten}
                petType={currentPetType}
                onPetPart={handleBodyClick}
                onNoseClick={handleNoseClick}
                hasCrown={hasCrown}
                hasRibbon={hasRibbon}
                hasSunglasses={hasSunglasses}
                hasBowtie={hasBowtie}
                hasAngelWings={hasAngelWings}
              />
            </motion.div>
          )}
        </div>

        {/* 5 Talking Tom Vitals Bars */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-white/10">
          {/* 1. Fome */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 mb-1">
              <Utensils className="w-3.5 h-3.5" />
              <span>Fome</span>
            </div>
            <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getVitalColor(kitten.hunger || 80)} transition-all duration-500`}
                style={{ width: `${kitten.hunger || 80}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-200/90 font-mono mt-0.5">{kitten.hunger || 80}%</span>
          </div>

          {/* 2. Sede */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 mb-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>Sede</span>
            </div>
            <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getVitalColor(kitten.thirst || 80)} transition-all duration-500`}
                style={{ width: `${kitten.thirst || 80}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-200/90 font-mono mt-0.5">{kitten.thirst || 80}%</span>
          </div>

          {/* 3. Sono / Energia */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 mb-1">
              <Moon className="w-3.5 h-3.5" />
              <span>Sono</span>
            </div>
            <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getVitalColor(kitten.energy || 80)} transition-all duration-500`}
                style={{ width: `${kitten.energy || 80}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-200/90 font-mono mt-0.5">{kitten.energy || 80}%</span>
          </div>

          {/* 4. Banho / Higiene */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-300 mb-1">
              <Bath className="w-3.5 h-3.5" />
              <span>Higiene</span>
            </div>
            <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getVitalColor(kitten.hygiene || 80)} transition-all duration-500`}
                style={{ width: `${kitten.hygiene || 80}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-200/90 font-mono mt-0.5">{kitten.hygiene || 80}%</span>
          </div>

          {/* 5. Felicidade / Diversão */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center text-center col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-pink-300 mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Diversão</span>
            </div>
            <div className="w-full bg-purple-950/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getVitalColor(kitten.fun || 80)} transition-all duration-500`}
                style={{ width: `${kitten.fun || 80}%` }}
              />
            </div>
            <span className="text-[10px] text-purple-200/90 font-mono mt-0.5">{kitten.fun || 80}%</span>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center justify-between glass-panel p-1.5 rounded-2xl border border-pink-500/20 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('cuidados')}
          className={`flex-1 py-2 px-2 min-w-[70px] rounded-xl font-bold transition-all ${
            activeTab === 'cuidados'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-200/70 hover:text-white'
          }`}
        >
          Cuidados
        </button>
        <button
          onClick={() => setActiveTab('comidinhas')}
          className={`flex-1 py-2 px-2 min-w-[70px] rounded-xl font-bold transition-all ${
            activeTab === 'comidinhas'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-200/70 hover:text-white'
          }`}
        >
          Comidinhas
        </button>
        <button
          onClick={() => setActiveTab('brinquedos')}
          className={`flex-1 py-2 px-2 min-w-[70px] rounded-xl font-bold transition-all ${
            activeTab === 'brinquedos'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-200/70 hover:text-white'
          }`}
        >
          Brinquedos
        </button>
        <button
          onClick={() => setActiveTab('armario')}
          className={`flex-1 py-2 px-2 min-w-[70px] rounded-xl font-bold transition-all ${
            activeTab === 'armario'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-200/70 hover:text-white'
          }`}
        >
          Armário
        </button>
        <button
          onClick={() => setActiveTab('mascotes')}
          className={`flex-1 py-2 px-2 min-w-[70px] rounded-xl font-bold transition-all ${
            activeTab === 'mascotes'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-purple-200/70 hover:text-white'
          }`}
        >
          Mascotes
        </button>
      </div>

      {/* Tab Panels */}
      <div className="glass-panel p-4 rounded-3xl border border-pink-500/20 shadow-lg">
        {activeTab === 'cuidados' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBodyClick('head')}
              className="p-3 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/30 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/30 flex items-center justify-center text-pink-300">
                <Heart className="w-5 h-5 fill-pink-300" />
              </div>
              <span className="text-xs font-bold text-white">Carinho (+XP)</span>
              <span className="text-[10px] text-pink-200/70">Cafuné gostoso</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={giveWaterKitten}
              className="p-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Droplets className="w-5 h-5 fill-cyan-300" />
              </div>
              <span className="text-xs font-bold text-white">Dar Água</span>
              <span className="text-[10px] text-cyan-200/70">Mata a sede</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={batheKitten}
              className="p-3 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center text-teal-300">
                <Bath className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Dar Banho</span>
              <span className="text-[10px] text-teal-200/70">Bolhas de sabão</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={toggleSleepKitten}
              className="p-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">
                {kitten.isSleeping ? 'Acordar' : 'Dormir'}
              </span>
              <span className="text-[10px] text-indigo-200/70">Recarrega sono</span>
            </motion.button>
          </div>
        )}

        {activeTab === 'comidinhas' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getFoodMenu().map((food, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleFeed(food.name, food.emoji, food.hunger, food.happy)}
                className="p-3 rounded-2xl glass-panel-interactive border border-pink-500/30 flex flex-col items-center gap-1.5 text-center"
              >
                <span className="text-3xl">{food.emoji}</span>
                <span className="text-xs font-bold text-white leading-tight">{food.name}</span>
                <span className="text-[10px] text-pink-300">+{food.hunger}% Fome</span>
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'brinquedos' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlayToy('Novelo de Lã Rosa', '🧶')}
              className="p-3 rounded-2xl glass-panel-interactive border border-pink-500/30 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-3xl">🧶</span>
              <span className="text-xs font-bold text-white">Novelo de Lã</span>
              <span className="text-[10px] text-pink-300">+30% Diversão</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlayToy('Laser Vermelho', '🔴')}
              className="p-3 rounded-2xl glass-panel-interactive border border-pink-500/30 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-3xl">🔴</span>
              <span className="text-xs font-bold text-white">Ponto Laser</span>
              <span className="text-[10px] text-pink-300">+40% Diversão</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlayToy('Bolinha de Tênis Saltitante', '🎾')}
              className="p-3 rounded-2xl glass-panel-interactive border border-pink-500/30 flex flex-col items-center gap-2 text-center col-span-2 sm:col-span-1"
            >
              <span className="text-3xl">🎾</span>
              <span className="text-xs font-bold text-white">Bolinha Saltitante</span>
              <span className="text-[10px] text-pink-300">+35% Diversão</span>
            </motion.button>
          </div>
        )}

        {activeTab === 'armario' && (
          <div className="space-y-3">
            <div className="text-xs text-purple-200/80 mb-2">
              Desbloqueie acessórios na Loja com Diamantes 💎 para vestir seus mascotes:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Coroa */}
              <div
                onClick={() => hasCrown && equipKittenItem('item-cat-crown', 'hat')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  hasCrown
                    ? 'glass-panel-interactive border-amber-400/40 cursor-pointer'
                    : 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">👑</span>
                <span className="text-xs font-bold text-white">Coroa Real</span>
                <span className="text-[10px] text-amber-300 mt-1">
                  {hasCrown ? (kitten.equippedHat === 'item-cat-crown' ? 'Equipado ✨' : 'Usar') : 'Bloqueado na Loja'}
                </span>
              </div>

              {/* Lacinho */}
              <div
                onClick={() => hasRibbon && equipKittenItem('item-cat-ribbon', 'accessory')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  hasRibbon
                    ? 'glass-panel-interactive border-pink-400/40 cursor-pointer'
                    : 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">🎀</span>
                <span className="text-xs font-bold text-white">Laço Rosa</span>
                <span className="text-[10px] text-pink-300 mt-1">
                  {hasRibbon ? (kitten.equippedAccessory === 'item-cat-ribbon' ? 'Equipado ✨' : 'Usar') : 'Bloqueado na Loja'}
                </span>
              </div>

              {/* Óculos */}
              <div
                onClick={() => hasSunglasses && equipKittenItem('item-cat-sunglasses', 'hat')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  hasSunglasses
                    ? 'glass-panel-interactive border-purple-400/40 cursor-pointer'
                    : 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">🕶️</span>
                <span className="text-xs font-bold text-white">Óculos Aviador</span>
                <span className="text-[10px] text-purple-300 mt-1">
                  {hasSunglasses ? (kitten.equippedHat === 'item-cat-sunglasses' ? 'Equipado ✨' : 'Usar') : 'Bloqueado na Loja'}
                </span>
              </div>

              {/* Gravata */}
              <div
                onClick={() => hasBowtie && equipKittenItem('item-cat-bowtie', 'accessory')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  hasBowtie
                    ? 'glass-panel-interactive border-indigo-400/40 cursor-pointer'
                    : 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">👔</span>
                <span className="text-xs font-bold text-white">Gravatinha</span>
                <span className="text-[10px] text-indigo-300 mt-1">
                  {hasBowtie ? (kitten.equippedAccessory === 'item-cat-bowtie' ? 'Equipado ✨' : 'Usar') : 'Bloqueado na Loja'}
                </span>
              </div>

              {/* Asas de Anjo */}
              <div
                onClick={() => hasAngelWings && equipKittenItem('item-cat-angel-wings', 'outfit')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  hasAngelWings
                    ? 'glass-panel-interactive border-cyan-400/40 cursor-pointer'
                    : 'bg-purple-950/30 border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">🪽</span>
                <span className="text-xs font-bold text-white">Asinhas de Anjo</span>
                <span className="text-[10px] text-cyan-300 mt-1">
                  {hasAngelWings ? (kitten.equippedOutfit === 'item-cat-angel-wings' ? 'Equipado ✨' : 'Usar') : 'Bloqueado na Loja'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mascotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-200">Seus Mascotes Adotados ({ownedPets.length})</span>
              <button
                onClick={() => setNavTab('loja')}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Adotar Mais na Loja
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PET_SPECIES_CATALOG.map((species) => {
                const isOwned = ownedPets.includes(species.type);
                const isActive = currentPetType === species.type;

                return (
                    <div
                    key={species.type}
                    onClick={() => {
                      if (!isOwned || isActive) return;
                      setFarewellPetTarget(species);
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-400 shadow-lg'
                        : isOwned
                        ? 'glass-panel-interactive border-purple-500/30 cursor-pointer'
                        : 'bg-purple-950/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                        {species.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{species.name}</h4>
                          {isActive && (
                            <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-200/70 leading-tight line-clamp-1 mt-0.5">
                          {species.description}
                        </p>
                      </div>
                    </div>

                    {!isOwned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNavTab('loja');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold whitespace-nowrap hover:bg-amber-400/30 transition"
                      >
                        Loja 🛍️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delicate Farewell Dialog when switching pets */}
      <AnimatePresence>
        {farewellPetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-[#1b0a2f] via-[#120622] to-[#080214] border border-pink-400/40 shadow-[0_0_40px_rgba(244,114,182,0.25)] space-y-4 text-center"
            >
              <div className="flex justify-center -space-x-2 text-4xl pt-2">
                <span className="p-2 rounded-2xl bg-purple-950/80 border border-purple-500/30 shadow-md animate-bounce">
                  {currentSpecies.emoji}
                </span>
                <span className="p-2 rounded-2xl bg-pink-950/80 border border-pink-500/30 shadow-md animate-pulse">
                  {farewellPetTarget.emoji}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Trocar para {farewellPetTarget.name}?
                </h3>
                <div className="mt-2.5 p-3 rounded-2xl bg-purple-950/60 border border-pink-500/20 text-xs text-pink-100/90 leading-relaxed italic">
                  &ldquo;{kitten.name} dá um carinho delicado: &lsquo;Vou tirar uma sonequinha no jardim das flores... Cuide com muito amor de {farewellPetTarget.name}! Até logo, papais! ♡&rsquo;&rdquo;
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setFarewellPetTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-purple-500/30 text-purple-200 text-xs font-semibold hover:bg-purple-900/30 transition"
                >
                  Continuar com {kitten.name}
                </button>
                <button
                  onClick={() => {
                    const target = farewellPetTarget;
                    setFarewellPetTarget(null);
                    switchPet(target.type);
                    setPetReaction(`Olá, Gabriel & Samella! Que alegria estar com vocês! ✨`);
                    soundEngine.playSparkle();
                    triggerHeartExplosion(0.5, 0.4);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg hover:brightness-110 transition cursor-pointer"
                >
                  Confirmar Troca 🐾
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
