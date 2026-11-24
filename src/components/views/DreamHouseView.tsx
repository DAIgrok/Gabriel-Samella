import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bath,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Droplets,
  Flame,
  Lightbulb,
  Lock,
  Move,
  Palette,
  PawPrint,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Sofa,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DEFAULT_FURNITURE_TRANSFORMS,
  DreamHouseCanvas3D,
  DreamHouseSkyMode,
} from '../3d/DreamHouseCanvas3D';
import {
  HOUSE_FLOOR_THEMES,
  HOUSE_FURNITURE_CATALOG,
  HOUSE_WALL_THEMES,
  resolveFurnitureGlbUrl,
  resolvePetGlbUrl,
} from '../../data/initialData';
import { HOUSE_CATEGORY_META, HOUSE_ROOM_PRICES } from '../../data/houseFurnitureCatalog';
import { HouseFurnitureCategory, HouseRoomId } from '../../types';
import {
  DiamondGemIcon,
  DreamHouseCrestIcon,
  EclipseSkyIcon,
  VectorGlyphIcon,
} from '../icons/CustomIcons';

const ROOMS: { id: HouseRoomId; label: string }[] = [
  { id: 'sala', label: 'Sala' },
  { id: 'quarto', label: 'Quarto' },
  { id: 'cozinha', label: 'Cozinha' },
  { id: 'banheiro', label: 'Banheiro' },
  { id: 'varanda', label: 'Varanda' },
];

function getRealtimeSkyLabel(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'Amanhecer';
  if (h >= 7 && h < 17) return 'Dia Ensolarado';
  if (h >= 17 && h < 19) return 'Pôr do Sol';
  return 'Noite Estrelada';
}

export const DreamHouseView: React.FC = () => {
  const {
    isSpectator,
    config,
    dreamHouse,
    kitten,
    aquarium,
    treeState,
    activeSeasonalEvent,
    setHouseRoom,
    unlockHouseRoom,
    setHouseWallTheme,
    setHouseFloorTheme,
    setHouseCustomWallHex,
    setHouseCustomFloorHex,
    setHouseFurnitureColor,
    toggleHouseLights,
    toggleHouseFireplace,
    toggleHouseFurniturePlacement,
    setHouseFurnitureTransform,
    resetHouseFurnitureTransform,
    recordHouseVisit,
    interactHouseFurniture,
    feedKitten,
    giveWaterKitten,
    batheKitten,
    captureVirtualPhoto,
    setExtendedView,
    storeItems,
  } = useApp();

  const stageRef = useRef<HTMLDivElement>(null);
  const [dockTab, setDockTab] = useState<'moveis' | 'paredes' | 'pisos'>('moveis');
  const [catFilter, setCatFilter] = useState<'all' | HouseFurnitureCategory>('all');
  const [skyMode, setSkyMode] = useState<DreamHouseSkyMode>('auto');
  const [viewMode, setViewMode] = useState<'interior' | 'exterior'>('interior');
  const [hudExpanded, setHudExpanded] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  useEffect(() => {
    recordHouseVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlockedRooms = dreamHouse.unlockedRooms || ['sala'];
  const currentRoom = unlockedRooms.includes(dreamHouse.activeRoom) ? dreamHouse.activeRoom : 'sala';
  const placedInRoom = dreamHouse.placedFurniture?.[currentRoom] || [];
  const totalPlacedAllRooms = Object.values(dreamHouse.placedFurniture || {}).flat().length;
  const roomFurniture = HOUSE_FURNITURE_CATALOG.filter((f) => f.room === currentRoom);
  const filteredRoomFurniture =
    catFilter === 'all' ? roomFurniture : roomFurniture.filter((f) => f.category === catFilter);

  const roomCategories = Array.from(new Set(roomFurniture.map((f) => f.category)));
  const roomLabel = ROOMS.find((r) => r.id === currentRoom)?.label || 'Sala';

  const petType = kitten.petType || 'cat';
  const isPetDead = Boolean(kitten.deadPets?.includes(petType));
  const petHunger = Math.round(kitten.hunger ?? 80);
  const petThirst = Math.round(kitten.thirst ?? 80);
  const petHygiene = Math.round(kitten.hygiene ?? 85);
  const hasKitchenAndBowl =
    unlockedRooms.includes('cozinha') &&
    Boolean(dreamHouse.placedFurniture?.cozinha?.includes('house-pet-bowl'));
  const hasBathroomUnlocked = unlockedRooms.includes('banheiro');
  const catGlbUrl = useMemo(() => resolvePetGlbUrl('cat', config), [config]);

  useEffect(() => {
    setSelectedFurnitureId(null);
    setCatFilter('all');
  }, [currentRoom]);

  useEffect(() => {
    if (isSpectator && isEditMode) setIsEditMode(false);
  }, [isSpectator, isEditMode]);

  const furnitureGlbUrls = useMemo(() => {
    const map: Record<string, string> = {};
    placedInRoom.forEach((fId) => {
      const resolved = resolveFurnitureGlbUrl(fId, config);
      if (resolved) map[fId] = resolved;
    });
    return map;
  }, [placedInRoom, config]);

  const selectedFurnitureInfo = selectedFurnitureId
    ? HOUSE_FURNITURE_CATALOG.find((f) => f.id === selectedFurnitureId)
    : null;

  const handleRotateSelected = (deltaRad: number) => {
    if (!selectedFurnitureId || isSpectator) return;
    const base =
      dreamHouse.furnitureTransforms?.[selectedFurnitureId] ||
      DEFAULT_FURNITURE_TRANSFORMS[selectedFurnitureId] || { x: 0, z: 0, rotY: 0 };
    setHouseFurnitureTransform(selectedFurnitureId, {
      ...base,
      rotY: Number((base.rotY + deltaRad).toFixed(4)),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 pb-28 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header Banner */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-pink-400/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/25 to-purple-600/35 border border-pink-400/35 flex items-center justify-center shrink-0">
            <DreamHouseCrestIcon className="w-6 h-6 text-pink-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              Casa
            </h2>
            <p className="text-xs text-purple-200/75 truncate">
              {isSpectator
                ? 'Modo Espectador: explore os cômodos em tempo real'
                : isEditMode
                ? 'Modo Decorar: arraste móveis na grade e personalize cores'
                : `Arraste para girar · Toque nos móveis para interagir · Conforto Nv.${dreamHouse.comfortLevel || 1}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExtendedView('loja')}
          className="min-h-[42px] px-3.5 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/35 text-pink-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Móveis na Loja</span>
        </button>
      </div>

      {isSpectator && (
        <div className="px-4 py-2.5 rounded-2xl bg-purple-950/60 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-amber-300" />
          <span>Modo Espectador ativo: apenas Samella pode mover, pintar ou comprar móveis.</span>
        </div>
      )}

      {/* 3D Viewport Stage with Real-Time Climatic Sky Backdrop */}
      <div className="relative rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden">
        <div ref={stageRef} className="w-full">
          <DreamHouseCanvas3D
            activeRoom={currentRoom}
            wallTheme={dreamHouse.wallTheme}
            floorTheme={dreamHouse.floorTheme}
            customWallHex={dreamHouse.customWallHex}
            customFloorHex={dreamHouse.customFloorHex}
            furnitureColors={dreamHouse.customColors}
            skyMode={skyMode}
            viewMode={viewMode}
            lightsOn={dreamHouse.lightsOn}
            fireplaceLit={dreamHouse.fireplaceLit}
            placedFurnitureIds={placedInRoom}
            treeLevel={treeState.level || 1}
            activeSeasonalEvent={activeSeasonalEvent}
            furnitureTransforms={dreamHouse.furnitureTransforms}
            isEditMode={isEditMode && !isSpectator}
            selectedFurnitureId={selectedFurnitureId}
            furnitureGlbUrls={furnitureGlbUrls}
            ownedPets={kitten.ownedPets}
            deadPets={kitten.deadPets}
            petColors={kitten.petColors}
            petGlbUrl={catGlbUrl}
            petHunger={petHunger}
            petThirst={petThirst}
            petLastFedTimestamp={kitten.lastFedAt}
            aquarium={aquarium}
            onTapAquarium={() => setExtendedView('aquario')}
            onInteractFurniture={interactHouseFurniture}
            onSelectFurniture={setSelectedFurnitureId}
            onMoveFurniture={setHouseFurnitureTransform}
          />
        </div>

        {/* View mode and sky controls */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode((current) => (current === 'interior' ? 'exterior' : 'interior'))}
            className="px-3 py-1.5 rounded-full bg-[#130627]/90 backdrop-blur-sm border border-pink-400/40 text-[11px] font-bold text-white shadow-lg cursor-pointer"
          >
            {viewMode === 'interior' ? 'Casa por fora · 360°' : 'Voltar ao cômodo'}
          </button>
          {viewMode === 'interior' && (
            <div className="px-3 py-1.5 rounded-full bg-[#130627]/85 backdrop-blur-sm border border-pink-400/30 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>{roomLabel}</span>
              {currentRoom === 'varanda' && (
                <span className="text-teal-300">· Árvore Nv.{treeState.level || 1}</span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setSkyMode((prev) => (prev === 'auto' ? 'eclipse' : 'auto'))}
            className={`px-2.5 py-1.5 rounded-full backdrop-blur-sm border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
              skyMode === 'eclipse'
                ? 'bg-pink-600/80 border-pink-300 text-white shadow'
                : 'bg-[#130627]/80 border-purple-400/35 text-purple-100 hover:text-white'
            }`}
            title="Alternar entre céu em tempo real e Eclipse Romântico"
          >
            {skyMode === 'eclipse' ? (
              <EclipseSkyIcon className="w-3.5 h-3.5" />
            ) : (
              <CloudSun className="w-3.5 h-3.5 text-sky-300" />
            )}
            <span>{skyMode === 'eclipse' ? 'Eclipse Solar' : getRealtimeSkyLabel()}</span>
          </button>

          {viewMode === 'interior' && currentRoom === 'sala' && (
            <button
              type="button"
              onClick={() => setExtendedView('aquario')}
              className="px-2.5 py-1.5 rounded-full bg-sky-500/25 hover:bg-sky-500/40 backdrop-blur-sm border border-sky-300/40 text-sky-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
              title="Abrir Aquário 3D completo"
            >
              <span>Aquário</span>
            </button>
          )}
        </div>

        {/* Snapshot Trigger Top-Right */}
        <button
          type="button"
          onClick={() =>
            captureVirtualPhoto(
              stageRef.current,
              `Casa dos Sonhos — ${roomLabel}`,
              `Estilo ${HOUSE_WALL_THEMES.find((w) => w.id === dreamHouse.wallTheme)?.label || 'Romântico'}`
            )
          }
          className="absolute top-3 right-3 z-20 min-h-[38px] px-3 rounded-full bg-[#130627]/85 backdrop-blur-sm border border-pink-400/35 text-pink-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          title="Fotografar para a Galeria"
        >
          <Camera className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden xs:inline">Foto Virtual</span>
        </button>
      </div>

      {/* Compact Pet Needs Bar inside Dream House */}
      <div className="glass-card-glow rounded-3xl px-3.5 py-2.5 border border-purple-500/25 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-pink-200">
            <PawPrint className="w-3.5 h-3.5 text-pink-400" />
            <span>Pets na Casa:</span>
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${petHunger < 35 ? 'bg-rose-500/20 border-rose-400/45 text-rose-200' : 'bg-purple-950/60 border-purple-500/25 text-purple-100'}`}>
            Fome {petHunger}%
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${petThirst < 35 ? 'bg-rose-500/20 border-rose-400/45 text-rose-200' : 'bg-purple-950/60 border-purple-500/25 text-sky-200'}`}>
            Sede {petThirst}%
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${petHygiene < 35 ? 'bg-amber-500/20 border-amber-400/45 text-amber-200' : 'bg-purple-950/60 border-purple-500/25 text-teal-200'}`}>
            Higiene {petHygiene}%
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {!isPetDead && !isSpectator && (
            <>
              <button
                type="button"
                onClick={feedKitten}
                disabled={!hasKitchenAndBowl}
                className="min-h-[34px] px-2.5 rounded-xl bg-pink-500/20 border border-pink-400/35 text-pink-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-45"
                title={hasKitchenAndBowl ? 'Encher tigela com ração' : 'Desbloqueie a Cozinha e coloque a Tigela Dupla'}
              >
                <Utensils className="w-3 h-3" />
                <span>Ração</span>
              </button>
              <button
                type="button"
                onClick={giveWaterKitten}
                disabled={!hasKitchenAndBowl}
                className="min-h-[34px] px-2.5 rounded-xl bg-sky-500/20 border border-sky-400/35 text-sky-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-45"
                title={hasKitchenAndBowl ? 'Encher tigela com água fresca' : 'Desbloqueie a Cozinha e coloque a Tigela Dupla'}
              >
                <Droplets className="w-3 h-3" />
                <span>Água</span>
              </button>
              <button
                type="button"
                onClick={batheKitten}
                disabled={!hasBathroomUnlocked}
                className="min-h-[34px] px-2.5 rounded-xl bg-teal-500/20 border border-teal-400/35 text-teal-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-45"
                title={hasBathroomUnlocked ? 'Dar banho no Banheiro' : 'Desbloqueie o Banheiro'}
              >
                <Bath className="w-3 h-3" />
                <span>Banho</span>
              </button>
            </>
          )}
          {(!hasKitchenAndBowl || !hasBathroomUnlocked) && (
            <button
              type="button"
              onClick={() => setExtendedView('loja')}
              className="min-h-[34px] px-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-bold cursor-pointer"
            >
              {!hasKitchenAndBowl ? 'Falta Cozinha/Tigela' : 'Falta Banheiro'}
            </button>
          )}
        </div>
      </div>

      {/* Empty House Welcome Banner */}
      {totalPlacedAllRooms === 0 && (
        <div className="glass-card-glow rounded-3xl p-4 border border-pink-400/35 bg-gradient-to-r from-purple-950/80 to-pink-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sofa className="w-4 h-4 text-pink-400" />
              Sua Casa dos Sonhos começou novinha e vazia!
            </h3>
            <p className="text-xs text-purple-200/80">
              Compre sofás, TVs, setup gamer, camas, móveis de cozinha, banheiro e decoração na Loja escolhendo a cor que quiser.
            </p>
          </div>
          {!isSpectator && (
            <button
              type="button"
              onClick={() => setExtendedView('loja')}
              className="min-h-[40px] px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ir para a Loja</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Decorate Bar */}
      <AnimatePresence>
        {isEditMode && !isSpectator && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="glass-card-glow rounded-3xl p-3 sm:p-3.5 border border-pink-400/40 bg-[#1a0b36]/95 flex flex-wrap items-center justify-between gap-2.5 shadow-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse shrink-0" />
              <p className="text-xs font-bold text-white truncate">
                {selectedFurnitureInfo
                  ? `${selectedFurnitureInfo.name} selecionado`
                  : 'Toque em um móvel no cenário para mover'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {selectedFurnitureId && selectedFurnitureInfo && (
                <label className="min-h-[44px] px-3 rounded-2xl bg-purple-950/80 border border-pink-400/40 text-pink-100 text-xs font-bold flex items-center gap-2 cursor-pointer">
                  <span>Cor</span>
                  <input
                    type="color"
                    value={
                      dreamHouse.customColors?.[selectedFurnitureId] ||
                      selectedFurnitureInfo.accentHex
                    }
                    onChange={(e) => setHouseFurnitureColor(selectedFurnitureId, e.target.value)}
                    className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer"
                    aria-label="Escolher cor do móvel"
                  />
                </label>
              )}
              <button
                type="button"
                disabled={!selectedFurnitureId}
                onClick={() => handleRotateSelected(-Math.PI / 4)}
                className="min-h-[44px] px-3 rounded-2xl bg-purple-950/80 border border-purple-400/35 text-purple-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-45°</span>
              </button>
              <button
                type="button"
                disabled={!selectedFurnitureId}
                onClick={() => handleRotateSelected(Math.PI / 4)}
                className="min-h-[44px] px-3 rounded-2xl bg-purple-950/80 border border-purple-400/35 text-purple-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+45°</span>
              </button>
              {selectedFurnitureId && (
                <button
                  type="button"
                  onClick={() => resetHouseFurnitureTransform(selectedFurnitureId)}
                  className="min-h-[44px] px-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:text-white text-xs font-bold cursor-pointer transition active:scale-95"
                >
                  Resetar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedFurnitureId(null);
                }}
                className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Concluir</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Bottom Control Dock */}
      <div className="glass-card-glow rounded-3xl border border-purple-500/25 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-purple-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ROOMS.map((r) => {
              const isUnlocked = unlockedRooms.includes(r.id);
              const price = HOUSE_ROOM_PRICES[r.id] ?? 30;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (isUnlocked) setHouseRoom(r.id);
                    else unlockHouseRoom(r.id);
                  }}
                  className={`min-h-[40px] px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    currentRoom === r.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                      : isUnlocked
                      ? 'bg-purple-950/60 border border-purple-500/25 text-purple-200 hover:text-white'
                      : 'bg-amber-500/15 border border-amber-400/35 text-amber-200 hover:bg-amber-500/25'
                  }`}
                  title={isUnlocked ? `Ir para ${r.label}` : `Desbloquear ${r.label} por ${price} diamantes`}
                >
                  {!isUnlocked && <Lock className="w-3 h-3 shrink-0" />}
                  <span>{r.label}</span>
                  {!isUnlocked && <span className="text-[10px] opacity-90">{price}◆</span>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={isSpectator}
              onClick={() => {
                setIsEditMode((prev) => {
                  if (prev) setSelectedFurnitureId(null);
                  return !prev;
                });
              }}
              className={`min-h-[40px] px-3 rounded-2xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition disabled:opacity-45 disabled:cursor-not-allowed ${
                isEditMode
                  ? 'bg-pink-500/30 border-pink-400 text-white shadow-md'
                  : 'bg-purple-950/60 border-purple-500/25 text-pink-200 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Modo Explorar' : 'Modo Decorar'}</span>
            </button>

            <button
              type="button"
              disabled={isSpectator}
              onClick={toggleHouseLights}
              className={`min-h-[40px] px-3 rounded-2xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition disabled:opacity-45 disabled:cursor-not-allowed ${
                dreamHouse.lightsOn
                  ? 'bg-amber-400/20 border-amber-300/45 text-amber-200'
                  : 'bg-purple-950/60 border-purple-500/25 text-purple-300'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{dreamHouse.lightsOn ? 'Luzes Acesas' : 'Penumbra'}</span>
            </button>

            {currentRoom === 'sala' && (
              <button
                type="button"
                disabled={isSpectator}
                onClick={toggleHouseFireplace}
                className={`min-h-[40px] px-3 rounded-2xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition disabled:opacity-45 disabled:cursor-not-allowed ${
                  dreamHouse.fireplaceLit
                    ? 'bg-orange-500/25 border-orange-400/50 text-orange-200'
                    : 'bg-purple-950/60 border-purple-500/25 text-purple-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Lareira</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setHudExpanded((v) => !v)}
              className="min-w-[40px] min-h-[40px] rounded-2xl bg-purple-950/60 border border-purple-500/25 text-purple-200 flex items-center justify-center cursor-pointer"
              aria-label={hudExpanded ? 'Recolher opções' : 'Expandir opções'}
            >
              {hudExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {hudExpanded && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'moveis' as const, label: 'Móveis do Cômodo', icon: Sofa },
                { id: 'paredes' as const, label: 'Paredes', icon: Palette },
                { id: 'pisos' as const, label: 'Pisos', icon: Palette },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDockTab(t.id)}
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shrink-0 cursor-pointer transition ${
                      dockTab === t.id
                        ? 'bg-pink-500/25 border-pink-400/50 text-white'
                        : 'bg-purple-950/50 border-purple-500/20 text-purple-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {dockTab === 'moveis' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setCatFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border shrink-0 cursor-pointer ${
                      catFilter === 'all'
                        ? 'bg-pink-500 text-white border-pink-300'
                        : 'bg-purple-950/60 text-purple-200/80 border-purple-500/25'
                    }`}
                  >
                    Todos ({roomFurniture.length})
                  </button>
                  {HOUSE_CATEGORY_META.filter((c) => roomCategories.includes(c.id)).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCatFilter(c.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border shrink-0 flex items-center gap-1 cursor-pointer ${
                        catFilter === c.id
                          ? 'bg-pink-500 text-white border-pink-300'
                          : 'bg-purple-950/60 text-purple-200/80 border-purple-500/25'
                      }`}
                    >
                      <VectorGlyphIcon name={c.icon} className="w-3 h-3" />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredRoomFurniture.map((item, idx) => {
                    const unlocked =
                      dreamHouse.unlockedFurnitureIds.includes(item.id) ||
                      Boolean(item.unlockedByDefault) ||
                      storeItems.some((s) => s.targetId === item.id && s.purchased);
                    const placed = placedInRoom.includes(item.id);
                    const activeHex = dreamHouse.customColors?.[item.id] || item.accentHex;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(0.24, idx * 0.025) }}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 smooth-card-hover ${
                          placed
                            ? 'bg-pink-500/15 border-pink-400/45 shadow-sm'
                            : 'bg-purple-950/45 border-purple-500/20'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 border border-white/25"
                              style={{ backgroundColor: activeHex }}
                            />
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          </div>
                          <p className="text-[11px] text-purple-200/70 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {unlocked && !isSpectator && (
                            <label
                              className="w-8 h-8 rounded-xl bg-purple-900/70 border border-pink-400/30 flex items-center justify-center cursor-pointer"
                              title="Mudar cor do móvel"
                            >
                              <input
                                type="color"
                                value={activeHex}
                                onChange={(e) => setHouseFurnitureColor(item.id, e.target.value)}
                                className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
                                aria-label={`Cor de ${item.name}`}
                              />
                            </label>
                          )}

                          {unlocked ? (
                            <button
                              type="button"
                              disabled={isSpectator}
                              onClick={() => toggleHouseFurniturePlacement(item.id)}
                              className={`min-h-[38px] px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition active:scale-95 disabled:opacity-45 ${
                                placed
                                  ? 'bg-purple-900/80 text-pink-200 border border-pink-400/35'
                                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                              }`}
                            >
                              {placed ? 'Guardar' : 'Colocar'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExtendedView('loja')}
                              className="min-h-[38px] px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer transition active:scale-95"
                            >
                              <span>{item.price || 18}</span>
                              <DiamondGemIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {dockTab === 'paredes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/55 border border-pink-400/30">
                  <div>
                    <p className="text-xs font-bold text-white">Cor Livre de Parede</p>
                    <p className="text-[11px] text-purple-200/75">
                      Escolha qualquer tonalidade para pintar as paredes deste cômodo
                    </p>
                  </div>
                  <input
                    type="color"
                    disabled={isSpectator}
                    value={dreamHouse.customWallHex || '#4c2887'}
                    onChange={(e) => setHouseCustomWallHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-white/25 bg-transparent cursor-pointer disabled:opacity-45"
                    aria-label="Escolher cor livre da parede"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {HOUSE_WALL_THEMES.map((w) => {
                    const unlocked =
                      Boolean(w.unlockedByDefault) ||
                      storeItems.some((s) => s.targetId === w.id && s.purchased);
                    const active = dreamHouse.wallTheme === w.id && !dreamHouse.customWallHex;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        disabled={unlocked && isSpectator}
                        onClick={() => {
                          if (unlocked) setHouseWallTheme(w.id);
                          else setExtendedView('loja');
                        }}
                        className={`min-h-[48px] p-3 rounded-2xl border flex items-center justify-between gap-2 text-left cursor-pointer transition disabled:opacity-50 ${
                          active
                            ? 'bg-pink-500/20 border-pink-400 text-white'
                            : 'bg-purple-950/50 border-purple-500/25 text-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: w.colorHex }}
                          />
                          <span className="text-xs font-bold truncate">{w.label}</span>
                        </div>
                        {!unlocked && <span className="text-[10px] text-amber-300 font-bold">Loja</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {dockTab === 'pisos' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/55 border border-pink-400/30">
                  <div>
                    <p className="text-xs font-bold text-white">Cor Livre de Piso</p>
                    <p className="text-[11px] text-purple-200/75">
                      Personalize o assoalho com qualquer cor que combine com seu estilo
                    </p>
                  </div>
                  <input
                    type="color"
                    disabled={isSpectator}
                    value={dreamHouse.customFloorHex || '#5c3419'}
                    onChange={(e) => setHouseCustomFloorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-white/25 bg-transparent cursor-pointer disabled:opacity-45"
                    aria-label="Escolher cor livre do piso"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {HOUSE_FLOOR_THEMES.map((fl) => {
                    const unlocked =
                      Boolean(fl.unlockedByDefault) ||
                      storeItems.some((s) => s.targetId === fl.id && s.purchased);
                    const active = dreamHouse.floorTheme === fl.id && !dreamHouse.customFloorHex;
                    return (
                      <button
                        key={fl.id}
                        type="button"
                        disabled={unlocked && isSpectator}
                        onClick={() => {
                          if (unlocked) setHouseFloorTheme(fl.id);
                          else setExtendedView('loja');
                        }}
                        className={`min-h-[48px] p-3 rounded-2xl border flex items-center justify-between gap-2 text-left cursor-pointer transition disabled:opacity-50 ${
                          active
                            ? 'bg-pink-500/20 border-pink-400 text-white'
                            : 'bg-purple-950/50 border-purple-500/25 text-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: fl.colorHex }}
                          />
                          <span className="text-xs font-bold truncate">{fl.label}</span>
                        </div>
                        {!unlocked && <span className="text-[10px] text-amber-300 font-bold">Loja</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
