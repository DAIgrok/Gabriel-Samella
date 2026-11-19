import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Droplets,
  Fish,
  ShoppingBag,
  Sparkles,
  Sun,
  Utensils,
  Waves,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AquariumCanvas3D } from '../3d/AquariumCanvas3D';
import {
  AQUARIUM_DECOR_CATALOG,
  AQUARIUM_SPECIES_CATALOG,
} from '../../data/initialData';
import { AquariumLightMode } from '../../types';
import { AquariumCoralIcon } from '../icons/CustomIcons';

const LIGHT_MODES: { id: AquariumLightMode; label: string; dot: string }[] = [
  { id: 'bioluminescent', label: 'Bioluminescente', dot: '#c084fc' },
  { id: 'sunlight', label: 'Luz do Sol', dot: '#fde047' },
  { id: 'moonlight', label: 'Luar Profundo', dot: '#818cf8' },
  { id: 'coral', label: 'Recife Rosé', dot: '#f472b6' },
];

export const AquariumView: React.FC = () => {
  const {
    aquarium,
    kitten,
    storeItems,
    feedAquarium,
    cleanAquarium,
    toggleAquariumBubbles,
    setAquariumLightMode,
    toggleAquariumFish,
    toggleAquariumDecor,
    captureVirtualPhoto,
    showToast,
    setExtendedView,
    isSpectator,
  } = useApp();

  const stageRef = useRef<HTMLDivElement>(null);
  const [feedPulseCount, setFeedPulseCount] = useState(0);
  const [dockTab, setDockTab] = useState<'especies' | 'decor'>('especies');

  const ownedPets = kitten.ownedPets || [];
  const waterClarity = aquarium.waterClarity ?? 92;
  const fishHunger = aquarium.fishHunger ?? 78;

  const handleFeed = () => {
    setFeedPulseCount((c) => c + 1);
    feedAquarium();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 pb-28 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-cyan-400/25 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-purple-600/35 border border-cyan-400/35 flex items-center justify-center shrink-0">
            <AquariumCoralIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              Aquário Mágico 3D
            </h2>
            <p className="text-xs text-cyan-200/75 truncate">
              Toque nos peixes para vê-los nadar rápido · Mascotes aquáticos entram aqui automaticamente
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExtendedView('loja')}
          className="min-h-[42px] px-3.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/35 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Loja Marinha</span>
        </button>
      </div>

      {/* 3D Tank Viewport */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-[#040c1f] shadow-2xl overflow-hidden">
        <div ref={stageRef} className="w-full">
          <AquariumCanvas3D
            lightMode={aquarium.lightMode}
            waterClarity={waterClarity}
            bubblesActive={aquarium.bubblesActive}
            activeFishIds={aquarium.activeFishIds}
            activeDecorIds={aquarium.activeDecorIds}
            feedPulseCount={feedPulseCount}
            onTapFish={(fishName) =>
              showToast(`${fishName} deu um mergulho feliz no aquário!`, 'sparkles')
            }
          />
        </div>

        <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-[#07122c]/90 border border-cyan-400/30 text-[11px] font-bold text-cyan-100 flex items-center gap-1.5 pointer-events-none">
          <Fish className="w-3.5 h-3.5 text-cyan-300" />
          <span className="tabular-nums">{aquarium.activeFishIds.length} nadando</span>
        </div>

        <button
          type="button"
          onClick={() =>
            captureVirtualPhoto(
              stageRef.current,
              'Aquário Mágico 3D',
              `Luz ${LIGHT_MODES.find((l) => l.id === aquarium.lightMode)?.label || 'Bioluminescente'}`
            )
          }
          className="absolute top-3 right-3 z-20 min-h-[38px] px-3 rounded-full bg-[#07122c]/90 border border-cyan-400/35 text-cyan-100 hover:text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
          title="Fotografar Aquário 3D"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-300" />
          <span>Foto Virtual</span>
        </button>
      </div>

      {/* Status + Interactive Care Controls */}
      <div className="glass-card-glow rounded-3xl p-4 border border-cyan-500/20 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-purple-950/50 border border-cyan-500/20 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-cyan-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Cristalinidade da Água
              </span>
              <span className="text-white tabular-nums">{waterClarity}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${waterClarity}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/50 border border-amber-500/20 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-200 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                Saciedade dos Peixes
              </span>
              <span className="text-white tabular-nums">{fishHunger}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${fishHunger}%` }}
              />
            </div>
          </div>
        </div>

        {isSpectator && (
          <div className="px-3 py-2 rounded-2xl bg-purple-950/70 border border-purple-400/30 text-[11px] text-purple-200 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-pink-300 shrink-0" />
            <span>Modo Espectador: você pode explorar o aquário 3D, mas apenas a Samella pode cuidar ou alterar o tanque.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={isSpectator}
            onClick={handleFeed}
            className="min-h-[48px] px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer disabled:opacity-45"
          >
            <Utensils className="w-4 h-4" />
            <span>Alimentar</span>
          </button>

          <button
            type="button"
            disabled={isSpectator}
            onClick={() => cleanAquarium()}
            className="min-h-[48px] px-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer disabled:opacity-45"
          >
            <Sparkles className="w-4 h-4" />
            <span>Limpar Vidro</span>
          </button>

          <button
            type="button"
            disabled={isSpectator}
            onClick={toggleAquariumBubbles}
            className={`min-h-[48px] px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer transition disabled:opacity-45 ${
              aquarium.bubblesActive
                ? 'bg-cyan-500/25 border-cyan-300/50 text-cyan-100'
                : 'bg-purple-950/60 border-purple-500/25 text-purple-300'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{aquarium.bubblesActive ? 'Bolhas On' : 'Bolhas Off'}</span>
          </button>
        </div>

        {/* Lighting Preset Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-purple-200/75 flex items-center gap-1 shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            Iluminação:
          </span>
          {LIGHT_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAquariumLightMode(m.id)}
              className={`min-h-[36px] px-3 rounded-full text-xs font-bold flex items-center gap-1.5 border shrink-0 cursor-pointer transition ${
                aquarium.lightMode === m.id
                  ? 'bg-pink-500/25 border-pink-400 text-white'
                  : 'bg-purple-950/60 border-purple-500/25 text-purple-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.dot }} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fish & Decor Selection */}
      <div className="glass-card-glow rounded-3xl p-4 border border-purple-500/25 space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDockTab('especies')}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold border cursor-pointer ${
              dockTab === 'especies'
                ? 'bg-cyan-500/25 border-cyan-400 text-white'
                : 'bg-purple-950/50 border-purple-500/25 text-purple-300'
            }`}
          >
            Espécies Marinhas ({aquarium.unlockedFishIds.length}/{AQUARIUM_SPECIES_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setDockTab('decor')}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold border cursor-pointer ${
              dockTab === 'decor'
                ? 'bg-pink-500/25 border-pink-400 text-white'
                : 'bg-purple-950/50 border-purple-500/25 text-purple-300'
            }`}
          >
            Miniaturas do Fundo ({aquarium.unlockedDecorIds.length}/{AQUARIUM_DECOR_CATALOG.length})
          </button>
        </div>

        {dockTab === 'especies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AQUARIUM_SPECIES_CATALOG.map((sp) => {
              const unlockedViaPet = sp.linkedPetType ? ownedPets.includes(sp.linkedPetType) : false;
              const unlockedViaStore = storeItems.some((s) => s.targetId === sp.id && s.purchased);
              const unlocked =
                Boolean(sp.unlockedByDefault) ||
                aquarium.unlockedFishIds.includes(sp.id) ||
                unlockedViaPet ||
                unlockedViaStore;
              const active = aquarium.activeFishIds.includes(sp.id);

              return (
                <div
                  key={sp.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-400/45'
                      : 'bg-purple-950/45 border-purple-500/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sp.colorHex }}
                      />
                      <p className="text-xs font-bold text-white truncate">{sp.name}</p>
                    </div>
                    <p className="text-[11px] text-purple-200/70 line-clamp-1 mt-0.5">
                      {sp.description}
                    </p>
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => toggleAquariumFish(sp.id)}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                        active
                          ? 'bg-purple-900/80 text-cyan-200 border border-cyan-400/35'
                          : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                      }`}
                    >
                      {active ? 'Descansar' : 'Nadar'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExtendedView(sp.linkedPetType ? 'gatinho' : 'loja')}
                      className="min-h-[36px] px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      {sp.linkedPetType ? 'Adotar Pet' : 'Loja'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {dockTab === 'decor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AQUARIUM_DECOR_CATALOG.map((dec) => {
              const unlocked =
                Boolean(dec.unlockedByDefault) ||
                aquarium.unlockedDecorIds.includes(dec.id) ||
                storeItems.some((s) => s.targetId === dec.id && s.purchased);
              const active = aquarium.activeDecorIds.includes(dec.id);

              return (
                <div
                  key={dec.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                    active
                      ? 'bg-pink-500/15 border-pink-400/45'
                      : 'bg-purple-950/45 border-purple-500/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: dec.accentHex }}
                      />
                      <p className="text-xs font-bold text-white truncate">{dec.name}</p>
                    </div>
                    <p className="text-[11px] text-purple-200/70 line-clamp-1 mt-0.5">
                      {dec.description}
                    </p>
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => toggleAquariumDecor(dec.id)}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
                        active
                          ? 'bg-purple-900/80 text-pink-200 border border-pink-400/35'
                          : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      }`}
                    >
                      {active ? 'Remover' : 'Colocar'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExtendedView('loja')}
                      className="min-h-[36px] px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Loja
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
