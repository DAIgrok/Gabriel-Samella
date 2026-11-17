import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Flame,
  Lightbulb,
  Palette,
  ShoppingBag,
  Sofa,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DreamHouseCanvas3D } from '../3d/DreamHouseCanvas3D';
import {
  HOUSE_FLOOR_THEMES,
  HOUSE_FURNITURE_CATALOG,
  HOUSE_WALL_THEMES,
} from '../../data/initialData';
import { HouseRoomId } from '../../types';
import { DreamHouseCrestIcon, DiamondGemIcon } from '../icons/CustomIcons';

const ROOMS: { id: HouseRoomId; label: string }[] = [
  { id: 'sala', label: 'Sala' },
  { id: 'quarto', label: 'Quarto' },
  { id: 'varanda', label: 'Varanda' },
  { id: 'cozinha', label: 'Cozinha' },
];

export const DreamHouseView: React.FC = () => {
  const {
    dreamHouse,
    treeState,
    activeSeasonalEvent,
    setHouseRoom,
    setHouseWallTheme,
    setHouseFloorTheme,
    toggleHouseLights,
    toggleHouseFireplace,
    toggleHouseFurniturePlacement,
    recordHouseVisit,
    interactHouseFurniture,
    captureVirtualPhoto,
    setExtendedView,
    storeItems,
  } = useApp();

  const stageRef = useRef<HTMLDivElement>(null);
  const [dockTab, setDockTab] = useState<'moveis' | 'paredes' | 'pisos'>('moveis');
  const [hudExpanded, setHudExpanded] = useState(true);

  useEffect(() => {
    recordHouseVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRoom = dreamHouse.activeRoom || 'sala';
  const placedInRoom = dreamHouse.placedFurniture?.[currentRoom] || [];
  const roomFurniture = HOUSE_FURNITURE_CATALOG.filter((f) => f.room === currentRoom);
  const roomLabel = ROOMS.find((r) => r.id === currentRoom)?.label || 'Sala';

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
            <DreamHouseCrestIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              Casa dos Sonhos 3D
            </h2>
            <p className="text-xs text-purple-200/75 truncate">
              Arraste para girar · Toque nos móveis para interagir · Conforto Nv.{dreamHouse.comfortLevel || 1}
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

      {/* 3D Viewport Stage (Unobstructed center) */}
      <div className="relative rounded-3xl border border-purple-500/30 bg-[#090314] shadow-2xl overflow-hidden">
        <div ref={stageRef} className="w-full">
          <DreamHouseCanvas3D
            activeRoom={currentRoom}
            wallTheme={dreamHouse.wallTheme}
            floorTheme={dreamHouse.floorTheme}
            lightsOn={dreamHouse.lightsOn}
            fireplaceLit={dreamHouse.fireplaceLit}
            placedFurnitureIds={placedInRoom}
            treeLevel={treeState.level || 1}
            activeSeasonalEvent={activeSeasonalEvent}
            onInteractFurniture={interactHouseFurniture}
          />
        </div>

        {/* Minimal Top-Left Room Spec Badge */}
        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-[#130627]/90 border border-pink-400/30 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-pink-300" />
          <span>{roomLabel}</span>
          {currentRoom === 'varanda' && (
            <span className="text-teal-300">· Árvore Nv.{treeState.level || 1}</span>
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
          className="absolute top-3 right-3 z-20 min-h-[38px] px-3 rounded-full bg-[#130627]/90 border border-pink-400/35 text-pink-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          title="Fotografar para a Galeria"
        >
          <Camera className="w-3.5 h-3.5 text-pink-400" />
          <span>Foto Virtual</span>
        </button>
      </div>

      {/* Unified Bottom Control Dock */}
      <div className="glass-card-glow rounded-3xl border border-purple-500/25 overflow-hidden">
        {/* Room Switcher + Atmosphere Quick Toggles */}
        <div className="p-3 sm:p-4 border-b border-purple-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ROOMS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setHouseRoom(r.id)}
                className={`min-h-[40px] px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  currentRoom === r.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                    : 'bg-purple-950/60 border border-purple-500/25 text-purple-200 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleHouseLights}
              className={`min-h-[40px] px-3 rounded-2xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
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
                onClick={toggleHouseFireplace}
                className={`min-h-[40px] px-3 rounded-2xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
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
            {/* Sub-tabs inside Dock */}
            <div className="flex items-center gap-2">
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
                    className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roomFurniture.map((item) => {
                  const unlocked =
                    dreamHouse.unlockedFurnitureIds.includes(item.id) ||
                    Boolean(item.unlockedByDefault) ||
                    storeItems.some((s) => s.targetId === item.id && s.purchased);
                  const placed = placedInRoom.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                        placed
                          ? 'bg-pink-500/15 border-pink-400/45'
                          : 'bg-purple-950/45 border-purple-500/20'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.accentHex }}
                          />
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        </div>
                        <p className="text-[11px] text-purple-200/70 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      {unlocked ? (
                        <button
                          type="button"
                          onClick={() => toggleHouseFurniturePlacement(item.id)}
                          className={`min-h-[36px] px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition ${
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
                          className="min-h-[36px] px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <span>{item.price || 35}</span>
                          <DiamondGemIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {dockTab === 'paredes' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {HOUSE_WALL_THEMES.map((w) => {
                  const unlocked =
                    Boolean(w.unlockedByDefault) ||
                    storeItems.some((s) => s.targetId === w.id && s.purchased);
                  const active = dreamHouse.wallTheme === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        if (unlocked) setHouseWallTheme(w.id);
                        else setExtendedView('loja');
                      }}
                      className={`min-h-[48px] p-3 rounded-2xl border flex items-center justify-between gap-2 text-left cursor-pointer transition ${
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
            )}

            {dockTab === 'pisos' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HOUSE_FLOOR_THEMES.map((fl) => {
                  const active = dreamHouse.floorTheme === fl.id;
                  return (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => setHouseFloorTheme(fl.id)}
                      className={`min-h-[48px] p-3 rounded-2xl border flex items-center gap-2 text-left cursor-pointer transition ${
                        active
                          ? 'bg-pink-500/20 border-pink-400 text-white'
                          : 'bg-purple-950/50 border-purple-500/25 text-purple-200'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: fl.colorHex }}
                      />
                      <span className="text-xs font-bold truncate">{fl.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
