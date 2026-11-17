import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Check, Edit2, Sparkles, Volume2 } from 'lucide-react';
import { PetType, StoreItem } from '../../types';
import { PET_SPECIES_CATALOG } from '../../data/initialData';
import { formatCooldownMs } from '../../context/AppContext';

export interface PetWorldDesignProps {
  coins: number;
  displayName: string;
  needsNaming: boolean;
  currentPetType: PetType;
  currentSpecies: (typeof PET_SPECIES_CATALOG)[number];
  ownedPets: PetType[];
  customNames?: Partial<Record<PetType, string>>;
  level: number;
  xp: number;
  maxXp: number;
  happiness: number;
  energy: number;
  hunger: number;
  thirst: number;
  hygiene: number;
  isSleeping: boolean;
  equippedHat?: string;
  equippedGlasses?: string;
  equippedCollar?: string;
  equippedOutfit?: string;
  equippedAccessory?: string;
  storeItems: StoreItem[];
  petReaction: string;
  cdPet: number;
  cdFeed: number;
  cdBath: number;
  cdSleep: number;
  cdPlay: number;
  onFeed: () => void;
  onPlay: () => void;
  onBath: () => void;
  onToggleSleep: () => void;
  onPetTap: () => void;
  onPlaySound: () => void;
  onRenamePet: (name: string) => void;
  onSwitchPet: (species: (typeof PET_SPECIES_CATALOG)[number]) => void;
  onBuyStoreItem: (itemId: string) => boolean;
  onEquipItem: (itemId: string, slot: 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses') => void;
  onOpenWardrobeModal: () => void;
}

const RARITY_BADGE_MAP: Record<string, { label: string; cls: string }> = {
  comum: { label: 'Comum', cls: 'bg-white/10 text-purple-200 border-white/15' },
  raro: { label: 'Raro', cls: 'bg-sky-500/20 text-sky-200 border-sky-400/35' },
  lendario: { label: 'Lendário', cls: 'bg-amber-500/25 text-amber-200 border-amber-400/40' },
  mitico: { label: 'Mítico', cls: 'bg-pink-500/25 text-pink-200 border-pink-400/45' },
};

export const PetWorldDesign: React.FC<PetWorldDesignProps> = ({
  coins,
  displayName,
  needsNaming,
  currentPetType,
  currentSpecies,
  ownedPets,
  customNames,
  level,
  xp,
  maxXp,
  happiness,
  energy,
  hunger,
  thirst,
  hygiene,
  isSleeping,
  equippedHat,
  equippedGlasses,
  equippedCollar,
  equippedOutfit,
  equippedAccessory,
  storeItems,
  petReaction,
  cdFeed,
  cdBath,
  cdSleep,
  cdPlay,
  onFeed,
  onPlay,
  onBath,
  onToggleSleep,
  onPetTap,
  onPlaySound,
  onRenamePet,
  onSwitchPet,
  onBuyStoreItem,
  onEquipItem,
  onOpenWardrobeModal,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<'pets' | 'outfits'>('pets');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [floatingLove, setFloatingLove] = useState<number[]>([]);

  const wearableSlots = new Set(['hat', 'glasses', 'collar', 'outfit', 'accessory']);
  const outfitItems = storeItems.filter((item) => item.slotType && wearableSlots.has(item.slotType));

  const petAdoptMap = new Map<PetType, StoreItem>();
  storeItems.forEach((item) => {
    if (item.category === 'pets' && item.petTypeTarget && item.petTypeTarget !== 'all') {
      petAdoptMap.set(item.petTypeTarget, item);
    }
  });

  // Only list owned pets + species with an active store adoption item (no dead buttons)
  const visibleSpecies = PET_SPECIES_CATALOG.filter(
    (s) => ownedPets.includes(s.type) || petAdoptMap.has(s.type)
  );

  const findIcon = (id?: string) => storeItems.find((i) => i.id === id)?.icon || '';
  const hatIcon = findIcon(equippedHat);
  const glassesIcon = findIcon(equippedGlasses);
  const collarIcon = findIcon(equippedCollar);
  const outfitIcon = findIcon(equippedOutfit);
  const accessoryIcon = findIcon(equippedAccessory);

  const isEquipped = (id: string) =>
    equippedHat === id ||
    equippedGlasses === id ||
    equippedCollar === id ||
    equippedOutfit === id ||
    equippedAccessory === id;

  const handleTapPet = () => {
    onPetTap();
    const id = Date.now() + Math.random();
    setFloatingLove((prev) => [...prev.slice(-4), id]);
    window.setTimeout(() => {
      setFloatingLove((prev) => prev.filter((item) => item !== id));
    }, 900);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onRenamePet(nameInput.trim());
    setIsEditingName(false);
  };

  const clampStat = (val: number) => Math.max(0, Math.min(100, Math.round(val)));
  const xpPercent = Math.min(100, Math.round(((xp || 0) / (maxXp || 100)) * 100));

  return (
    <div className="space-y-3.5 text-white">
      {/* Header matching ChatGPT PetWorld */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
            ♡ Nosso Cantinho Pet
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/25 border border-pink-400/35 text-pink-200 tabular-nums shrink-0">
            Nv.{level || 1}
          </span>
        </div>

        <div className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-full font-bold text-xs text-white flex items-center gap-1.5 tabular-nums shrink-0 shadow-sm">
          <span>💎</span>
          <span>{coins}</span>
        </div>
      </div>

      {/* Glowing Radial Stage */}
      <div
        className="relative rounded-[22px] p-5 sm:p-6 text-center border border-pink-400/30 shadow-[0_14px_40px_rgba(0,0,0,0.55)] overflow-hidden"
        style={{
          background: isSleeping
            ? 'radial-gradient(circle at top, #1b1742, #060410 72%)'
            : 'radial-gradient(circle at top, #3b1053, #0b0714 72%)',
        }}
      >
        {/* Top Row: Species Rarity & Quick Sound/Wardrobe */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              (RARITY_BADGE_MAP[currentSpecies.rarity] || RARITY_BADGE_MAP.comum).cls
            }`}
          >
            {(RARITY_BADGE_MAP[currentSpecies.rarity] || RARITY_BADGE_MAP.comum).label}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPlaySound}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-pink-200 cursor-pointer transition"
              title="Ouvir som do mascote"
              aria-label="Ouvir som do mascote"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenWardrobeModal}
              className="px-2.5 h-8 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center gap-1 text-[11px] font-semibold text-pink-100 cursor-pointer transition"
            >
              <Sparkles className="w-3 h-3 text-pink-300" />
              <span>Armário</span>
            </button>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="flex justify-center mb-2 relative z-10">
          <motion.div
            key={petReaction}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="px-3.5 py-1.5 rounded-2xl bg-white/95 text-purple-950 text-xs font-semibold shadow-lg max-w-xs"
          >
            {petReaction}
          </motion.div>
        </div>

        {/* Floating Animated Pet Hero + Equipped Badges */}
        <div className="relative py-3 flex flex-col items-center justify-center min-h-[145px]">
          <AnimatePresence>
            {floatingLove.map((id) => (
              <motion.span
                key={id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -48, scale: 1.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85 }}
                className="absolute top-6 text-2xl pointer-events-none select-none z-20"
              >
                💗
              </motion.span>
            ))}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={handleTapPet}
            animate={
              prefersReducedMotion
                ? undefined
                : isSleeping
                ? { y: [0, -3, 0], scale: [1, 0.98, 1] }
                : { y: [0, -8, 0] }
            }
            transition={{
              duration: isSleeping ? 3.4 : 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
            className="relative inline-flex items-center justify-center cursor-pointer focus:outline-none group"
            aria-label={`Fazer carinho em ${displayName}`}
          >
            {/* Ambient radial glow under pet */}
            <div className="absolute -inset-6 rounded-full bg-pink-500/20 blur-2xl pointer-events-none group-hover:bg-pink-400/30 transition" />

            {hatIcon && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[32px] drop-shadow-md pointer-events-none z-10">
                {hatIcon}
              </span>
            )}

            <span
              className={`text-[86px] sm:text-[94px] leading-none select-none relative z-[1] drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)] ${
                isSleeping ? 'opacity-80' : ''
              }`}
            >
              {currentSpecies.emoji}
            </span>

            {glassesIcon && (
              <span className="absolute top-[22%] -right-6 text-[24px] drop-shadow pointer-events-none z-10">
                {glassesIcon}
              </span>
            )}
            {accessoryIcon && (
              <span className="absolute top-[24%] -left-6 text-[24px] drop-shadow pointer-events-none z-10">
                {accessoryIcon}
              </span>
            )}
            {(collarIcon || outfitIcon) && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/55 border border-pink-400/35 text-sm flex items-center gap-1 z-10">
                {collarIcon && <span>{collarIcon}</span>}
                {outfitIcon && <span>{outfitIcon}</span>}
              </span>
            )}
            {isSleeping && (
              <span className="absolute -top-2 -right-4 text-xl animate-pulse pointer-events-none z-10">
                💤
              </span>
            )}
          </motion.button>
        </div>

        {/* Pet Name & XP Mini Bar */}
        <div className="mt-1 space-y-1.5">
          {isEditingName ? (
            <form onSubmit={handleSaveRename} className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={18}
                autoFocus
                placeholder="Nome do pet..."
                className="bg-black/50 border border-pink-400/50 rounded-xl px-3 py-1 text-sm font-bold text-white outline-none w-36 text-center"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center cursor-pointer"
                aria-label="Salvar nome"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {displayName}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setNameInput(displayName);
                  setIsEditingName(true);
                }}
                className="p-1 text-pink-300/75 hover:text-white cursor-pointer"
                aria-label="Renomear mascote"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {needsNaming && !isEditingName && (
            <p className="text-[11px] text-pink-300/90">
              Toque no lápis acima para dar um nome carinhoso ♡
            </p>
          )}

          {/* Compact XP Track */}
          <div className="max-w-[200px] mx-auto flex items-center gap-2 text-[10px] text-purple-200/75 tabular-nums">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span>{xp || 0}/{maxXp || 100} XP</span>
          </div>
        </div>

        {/* ChatGPT Styled Stat Bars */}
        <div className="mt-4 space-y-2 text-left">
          {[
            { label: 'Felicidade', value: clampStat(happiness) },
            { label: 'Energia', value: clampStat(energy) },
            { label: 'Fome', value: clampStat(hunger) },
          ].map((stat) => (
            <div key={stat.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2.5 text-xs">
              <span className="text-purple-100/85 font-medium">{stat.label}</span>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.value}%`,
                    background: 'linear-gradient(90deg, #ff5fa2, #ffb86b)',
                  }}
                />
              </div>
              <span className="text-right font-mono font-bold text-white/90 tabular-nums">
                {stat.value}%
              </span>
            </div>
          ))}

          {/* Secondary compact stats: Sede & Higiene */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-purple-200/80 tabular-nums">
            <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-between">
              <span>💧 Sede</span>
              <span className="font-bold text-white">{clampStat(thirst)}%</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-between">
              <span>🫧 Higiene</span>
              <span className="font-bold text-white">{clampStat(hygiene)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Action Grid matching ChatGPT PetWorld */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onFeed}
          disabled={cdFeed > 0}
          className="min-h-[48px] px-3 py-3 rounded-[14px] border border-white/15 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-55"
        >
          <span>🍖</span>
          <span>{cdFeed > 0 ? formatCooldownMs(cdFeed) : 'Alimentar'}</span>
        </button>

        <button
          type="button"
          onClick={onPlay}
          disabled={cdPlay > 0}
          className="min-h-[48px] px-3 py-3 rounded-[14px] border border-white/15 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-55"
        >
          <span>🎮</span>
          <span>{cdPlay > 0 ? formatCooldownMs(cdPlay) : 'Brincar'}</span>
        </button>

        <button
          type="button"
          onClick={onBath}
          disabled={cdBath > 0}
          className="min-h-[48px] px-3 py-3 rounded-[14px] border border-white/15 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-55"
        >
          <span>🛁</span>
          <span>{cdBath > 0 ? formatCooldownMs(cdBath) : 'Banho'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleSleep}
          disabled={!isSleeping && cdSleep > 0}
          className="min-h-[48px] px-3 py-3 rounded-[14px] border border-white/15 bg-white/[0.07] hover:bg-white/[0.12] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] disabled:opacity-55"
        >
          <span>{isSleeping ? '☀️' : '😴'}</span>
          <span>
            {isSleeping
              ? 'Acordar'
              : cdSleep > 0
              ? formatCooldownMs(cdSleep)
              : 'Dormir'}
          </span>
        </button>
      </div>

      {/* Tabs: Animais | Roupinhas */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('pets')}
          className={`flex-1 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition border ${
            tab === 'pets'
              ? 'bg-pink-500 text-white border-pink-400 shadow-[0_6px_18px_rgba(255,95,162,0.35)]'
              : 'bg-white/[0.07] text-purple-200/80 border-white/10 hover:text-white'
          }`}
        >
          🐾 Animais ({ownedPets.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('outfits')}
          className={`flex-1 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition border ${
            tab === 'outfits'
              ? 'bg-pink-500 text-white border-pink-400 shadow-[0_6px_18px_rgba(255,95,162,0.35)]'
              : 'bg-white/[0.07] text-purple-200/80 border-white/10 hover:text-white'
          }`}
        >
          👗 Roupinhas ({outfitItems.filter((i) => i.purchased).length})
        </button>
      </div>

      {/* Grid: Pets or Outfits */}
      {tab === 'pets' ? (
        <div className="grid grid-cols-2 gap-2.5">
          {visibleSpecies.map((species) => {
            const isOwned = ownedPets.includes(species.type);
            const isActive = currentPetType === species.type;
            const adoptItem = petAdoptMap.get(species.type);
            const savedCustomName = customNames?.[species.type]?.trim();
            const rarityInfo = RARITY_BADGE_MAP[species.rarity] || RARITY_BADGE_MAP.comum;

            return (
              <div
                key={species.type}
                className={`rounded-2xl p-3.5 text-center border transition flex flex-col items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-pink-500/15 border-pink-400/60 shadow-[0_0_20px_rgba(255,95,162,0.2)]'
                    : 'bg-white/[0.05] border-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[36px] leading-none">{species.emoji}</span>
                  <div className="font-bold text-xs sm:text-sm text-white">
                    {savedCustomName || species.name}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rarityInfo.cls}`}>
                    {rarityInfo.label}
                  </span>
                </div>

                {isOwned ? (
                  <button
                    type="button"
                    disabled={isActive}
                    onClick={() => !isActive && onSwitchPet(species)}
                    className={`w-full min-h-[38px] rounded-xl font-bold text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-pink-500/30 text-pink-100 border border-pink-400/40 cursor-default'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:brightness-110'
                    }`}
                  >
                    {isActive ? 'Ativo ♡' : 'Selecionar'}
                  </button>
                ) : adoptItem ? (
                  <button
                    type="button"
                    onClick={() => onBuyStoreItem(adoptItem.id)}
                    className="w-full min-h-[38px] rounded-xl font-bold text-xs bg-white/10 hover:bg-pink-500/30 border border-amber-400/35 text-amber-200 transition cursor-pointer tabular-nums"
                  >
                    {adoptItem.price} 💎 Adotar
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {outfitItems.map((item) => {
            const equipped = isEquipped(item.id);
            const slot =
              (item.slotType as 'hat' | 'accessory' | 'outfit' | 'collar' | 'glasses') ||
              'accessory';

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-3.5 text-center border transition flex flex-col items-center justify-between gap-2 ${
                  equipped
                    ? 'bg-pink-500/15 border-pink-400/60 shadow-[0_0_18px_rgba(255,95,162,0.2)]'
                    : 'bg-white/[0.05] border-white/10'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[32px] leading-none">{item.icon}</span>
                  <div className="font-bold text-xs text-white line-clamp-2 leading-tight">
                    {item.title}
                  </div>
                </div>

                {item.purchased ? (
                  <button
                    type="button"
                    onClick={() => onEquipItem(item.id, slot)}
                    className={`w-full min-h-[38px] rounded-xl font-bold text-xs transition cursor-pointer ${
                      equipped
                        ? 'bg-pink-500 text-white shadow'
                        : 'bg-white/10 hover:bg-white/20 text-pink-100 border border-white/15'
                    }`}
                  >
                    {equipped ? 'Equipado ✓' : 'Equipar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBuyStoreItem(item.id)}
                    className="w-full min-h-[38px] rounded-xl font-bold text-xs bg-white/10 hover:bg-pink-500/30 border border-amber-400/35 text-amber-200 transition cursor-pointer tabular-nums"
                  >
                    {item.price} 💎 Comprar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
