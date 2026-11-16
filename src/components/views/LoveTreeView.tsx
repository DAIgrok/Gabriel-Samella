import React, { useState, useMemo } from 'react';
import {
  Trees,
  Droplets,
  Sparkles,
  Sun,
  Award,
  Ribbon,
  Apple,
  Scissors,
  Plus,
  X,
  ChevronRight,
  Calendar,
  Orbit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { LoveTree2D } from '../tree/LoveTree2D';
import { FantasyTreeCanvas } from '../3d/FantasyTreeCanvas';

interface PromiseRibbon {
  id: string;
  title: string;
  message: string;
  color: string;
}

const DEFAULT_RIBBONS: PromiseRibbon[] = [
  {
    id: 'r1',
    title: 'Fita da Lealdade 🌹',
    message: 'Prometo estar ao seu lado não apenas nos dias de festa, mas especialmente nos momentos em que você precisar de colo e silêncio.',
    color: '#f43f5e',
  },
  {
    id: 'r2',
    title: 'Fita dos Sonhos Compartilhados ✨',
    message: 'Nenhum sonho seu é pequeno demais. Quero construir cada detalhe do nosso futuro segurando a sua mão com orgulho.',
    color: '#eab308',
  },
  {
    id: 'r3',
    title: 'Fita da Calmaria 🌸',
    message: 'O mundo lá fora pode ser barulhento e caótico, mas dentro do nosso abraço sempre haverá refúgio e serenidade.',
    color: '#ec4899',
  },
  {
    id: 'r4',
    title: 'Fita da Eternidade 💍',
    message: 'O que começou no dia 12/06/2023 é apenas o primeiro capítulo da mais linda história que Deus escreveu.',
    color: '#a855f7',
  },
];

export const LoveTreeView: React.FC = () => {
  const {
    config,
    treeState,
    waterLoveTree,
    sunLoveTree,
    pruneLoveTree,
    addPromiseRibbon,
    harvestTreeFruit,
    addCoins,
    showToast,
    triggerHeartExplosion,
    storeItems,
  } = useApp();

  const currentLevel = treeState.level || 1;
  const currentWater = treeState.waterCount || 0;
  const currentSun = treeState.sunCount || 0;
  const currentPrune = treeState.pruneCount || 0;
  const maxXp = treeState.maxXp || 100;
  const currentXp = treeState.xp || 0;
  const xpPercent = currentLevel >= 10 ? 100 : Math.min(100, Math.round((currentXp / maxXp) * 100));

  const [isWatering, setIsWatering] = useState(false);
  const [isSunbathing, setIsSunbathing] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [selectedRibbon, setSelectedRibbon] = useState<PromiseRibbon | null>(null);
  const [harvestedFruitMsg, setHarvestedFruitMsg] = useState<string | null>(null);
  const [harvestedFruits, setHarvestedFruits] = useState<number[]>([]);
  const [isAddingRibbon, setIsAddingRibbon] = useState(false);
  const [newRibbonText, setNewRibbonText] = useState('');
  const [treeViewMode, setTreeViewMode] = useState<'3d' | '2d'>('3d');

  // Real relationship days since anniversaryDate
  const daysTogether = useMemo(() => {
    const start = new Date(config.anniversaryDate || '2023-06-12T00:00:00').getTime();
    const now = Date.now();
    return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }, [config.anniversaryDate]);

  // Store unlocks
  const hasSakuraTheme = Boolean(storeItems.find((i) => i.id === 'item-tree-sakura')?.purchased);
  const hasGoldenApples = Boolean(storeItems.find((i) => i.id === 'item-tree-golden-apples')?.purchased);
  const hasFairyLights = Boolean(storeItems.find((i) => i.id === 'item-tree-fairy-lights')?.purchased);
  const hasSwing = Boolean(storeItems.find((i) => i.id === 'item-tree-swing')?.purchased);
  const hasLanterns = Boolean(storeItems.find((i) => i.id === 'item-tree-lanterns')?.purchased);
  const hasCrystals = Boolean(storeItems.find((i) => i.id === 'item-tree-crystals')?.purchased);
  const hasButterfly =
    Boolean(storeItems.find((i) => i.id === 'item-tree-magic-butterfly')?.purchased) ||
    (treeState.creaturesUnlocked || []).includes('Borboleta Lilás');
  const hasSongbird =
    Boolean(storeItems.find((i) => i.id === 'item-tree-songbird')?.purchased) ||
    (treeState.creaturesUnlocked || []).includes('Passarinho Cantor');

  const getStageInfo = (lvl: number) => {
    if (lvl === 1) {
      return {
        title: 'Semente do Amor 🌱',
        desc: 'Um brotinho recém-nascido. Regue, dê banho de sol e cuide dela para crescer forte e frondosa.',
      };
    } else if (lvl <= 3) {
      return {
        title: 'Muda em Crescimento 🌸',
        desc: 'O tronco está se firmando e os primeiros galhos e flores começam a aparecer.',
      };
    } else if (lvl <= 6) {
      return {
        title: 'Cerejeira Florida 🌳',
        desc: 'Copa ampla com flores de sakura e frutos doces nascendo nos galhos.',
      };
    } else if (lvl <= 9) {
      return {
        title: 'Árvore Encantada das Promessas 🎀',
        desc: 'Luzes suaves, fitas de promessas e criaturas mágicas visitam nossa árvore.',
      };
    } else {
      return {
        title: 'Árvore Cósmica da Eternidade 🌌👑',
        desc: 'Plenitude máxima alcançada com todo o cuidado e carinho de vocês!',
      };
    }
  };

  const stage = getStageInfo(currentLevel);

  const handleWater = () => {
    if (isWatering) return;
    setIsWatering(true);
    waterLoveTree();
    setTimeout(() => setIsWatering(false), 1600);
  };

  const handleSun = () => {
    if (isSunbathing) return;
    setIsSunbathing(true);
    sunLoveTree();
    setTimeout(() => setIsSunbathing(false), 1800);
  };

  const handlePrune = () => {
    if (isPruning) return;
    setIsPruning(true);
    pruneLoveTree();
    setTimeout(() => setIsPruning(false), 1600);
  };

  const handleHarvestFruit = (index: number) => {
    if (harvestedFruits.includes(index)) {
      showToast('Este fruto já foi colhido! Continue cuidando da árvore para nascer mais.', '🍎');
      return;
    }
    const msg = harvestTreeFruit(index);
    setHarvestedFruits((prev) => [...prev, index]);
    setHarvestedFruitMsg(msg);
    addCoins(1, 'Fruto do Amor Colhido 🍎');
  };

  const handleSaveCustomRibbon = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRibbonText.trim()) {
      addPromiseRibbon(newRibbonText.trim());
      setNewRibbonText('');
      setIsAddingRibbon(false);
    }
  };

  const allRibbons: PromiseRibbon[] = [
    ...DEFAULT_RIBBONS,
    ...(treeState.promiseRibbons || []).map((text, i) => ({
      id: `custom-r-${i}`,
      title: `Promessa #${i + 1} 💌`,
      message: text,
      color: '#ec4899',
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-2xl mx-auto text-center"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-semibold text-teal-300 mb-1">
          <Trees className="w-3.5 h-3.5" />
          <span>Árvore do Amor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossa Árvore em Evolução ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/75 max-w-md mx-auto">
          {stage.desc}
        </p>
      </div>

      {/* Main Interactive Botanical Tree Card */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-6 border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isSunbathing
              ? 'bg-gradient-to-b from-amber-500/20 via-pink-600/15 to-transparent'
              : isWatering
              ? 'bg-gradient-to-b from-cyan-600/20 via-teal-900/30 to-black/50'
              : isPruning
              ? 'bg-gradient-to-b from-emerald-600/20 via-teal-950/30 to-black/50'
              : 'bg-gradient-to-b from-purple-950/35 via-teal-950/15 to-black/55'
          }`}
        />

        {/* Stage & Relationship Days + 3D 360° / 2D Toggle */}
        <div className="z-10 w-full flex items-center justify-between gap-2 mb-2 px-1 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{stage.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-purple-950/80 border border-teal-400/30 rounded-full p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTreeViewMode('3d')}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer ${
                  treeViewMode === '3d'
                    ? 'bg-gradient-to-r from-teal-500 to-pink-500 text-white shadow'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                <Orbit className="w-3 h-3" />
                <span>3D 360°</span>
              </button>
              <button
                type="button"
                onClick={() => setTreeViewMode('2d')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  treeViewMode === '2d'
                    ? 'bg-gradient-to-r from-teal-500 to-pink-500 text-white shadow'
                    : 'text-purple-200/75 hover:text-white'
                }`}
              >
                2D
              </button>
            </div>

            <div className="flex items-center gap-1 text-xs text-pink-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span className="tabular-nums">{daysTogether}d</span>
            </div>
          </div>
        </div>

        {/* 3D 360° Clay Tree or 2.5D Botanical Tree */}
        <div className="relative w-full my-1">
          {treeViewMode === '3d' ? (
            <FantasyTreeCanvas
              level={currentLevel}
              isWatering={isWatering}
              isSunbathing={isSunbathing}
              isPruning={isPruning}
              hasSakuraTheme={hasSakuraTheme}
              hasGoldenApples={hasGoldenApples}
              hasFairyLights={hasFairyLights}
              hasSwing={hasSwing}
              hasLanterns={hasLanterns}
              hasCrystals={hasCrystals}
              hasButterfly={hasButterfly}
              hasSongbird={hasSongbird}
              ribbons={allRibbons}
              harvestedFruits={harvestedFruits}
              onHarvestFruit={handleHarvestFruit}
              onTreeInteract={() => {
                soundEngine.playSparkle();
                triggerHeartExplosion();
                showToast('A Árvore do Amor vibra com o carinho de vocês! 🌿💖', '✨');
              }}
            />
          ) : (
            <LoveTree2D
              level={currentLevel}
              isWatering={isWatering}
              isSunbathing={isSunbathing}
              isPruning={isPruning}
              hasSakuraTheme={hasSakuraTheme}
              hasGoldenApples={hasGoldenApples}
              hasFairyLights={hasFairyLights}
              hasSwing={hasSwing}
              hasLanterns={hasLanterns}
              hasCrystals={hasCrystals}
              ribbons={allRibbons}
              creatures={treeState.creaturesUnlocked || []}
              harvestedFruits={harvestedFruits}
              onHarvestFruit={handleHarvestFruit}
              onTreeTap={() => {
                soundEngine.playSparkle();
                triggerHeartExplosion();
                showToast('A Árvore do Amor vibra com o carinho de vocês! 🌿💖', '✨');
              }}
            />
          )}

          {/* Quick Harvest Button */}
          {(currentLevel >= 3 || hasGoldenApples) && (
            <div className="absolute top-3 right-3 z-20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHarvestFruit(harvestedFruits.length % 5)}
                className="px-3 min-h-[38px] rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center gap-1.5 cursor-pointer border border-amber-300/40"
              >
                <Apple className="w-3.5 h-3.5 fill-amber-200" />
                <span>Colher Fruto (+1 💎)</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Level Progress Stats */}
        <div className="w-full max-w-md space-y-2 mt-2 z-10">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span className="font-semibold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-300" />
              <span>Crescimento da Árvore</span>
            </span>
            <span className="font-bold text-teal-300 font-mono text-sm tabular-nums">
              Nível {currentLevel} / 10
            </span>
          </div>

          <div className="h-2.5 w-full bg-purple-950 rounded-full overflow-hidden border border-teal-500/30 relative">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-pink-400 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#2dd4bf]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-purple-300/80 pt-0.5 tabular-nums">
            <span>
              Regas: <strong>{currentWater}x</strong> · Sol: <strong>{currentSun}x</strong> · Podas: <strong>{currentPrune}x</strong>
            </span>
            <span>{currentLevel >= 10 ? '✨ Nível Máximo' : `${currentXp}/${maxXp} XP (${xpPercent}%)`}</span>
          </div>
        </div>

        {/* Action Buttons: Water, Sun, Prune */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 w-full max-w-md z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleWater}
            disabled={isWatering}
            className="min-h-[56px] p-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Droplets className={`w-4 h-4 text-cyan-100 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>Regar (+2 💎)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSun}
            disabled={isSunbathing}
            className="min-h-[56px] p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sun className="w-4 h-4 text-amber-100" />
            <span>Banho de Sol</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePrune}
            disabled={isPruning}
            className="min-h-[56px] p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-emerald-100" />
            <span>Podar Folhas</span>
          </motion.button>
        </div>

        {/* Evolution Milestones Strip */}
        <div className="w-full max-w-md mt-4 pt-3 border-t border-white/10 grid grid-cols-4 gap-2 text-[10px] z-10">
          {[
            { lvl: 2, label: 'Primeiro Broto' },
            { lvl: 5, label: 'Copa Florida' },
            { lvl: 8, label: 'Frutos Sagrados' },
            { lvl: 10, label: 'Eternidade' },
          ].map((m) => {
            const reached = currentLevel >= m.lvl;
            return (
              <div
                key={m.lvl}
                className={`p-2 rounded-xl border text-center ${
                  reached
                    ? 'bg-teal-500/20 border-teal-400/40 text-teal-200 font-semibold'
                    : 'bg-purple-950/30 border-white/10 text-purple-300/60'
                }`}
              >
                <div className="font-mono">Nv.{m.lvl}</div>
                <div className="truncate">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secret Promise Ribbons Section (Fitas de Promessas) */}
      <div className="glass-card-glow rounded-3xl p-5 border border-purple-500/25 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ribbon className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">Fitas de Promessas nos Galhos ({allRibbons.length})</h3>
          </div>
          <button
            onClick={() => setIsAddingRibbon(true)}
            className="px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/40 text-xs font-bold flex items-center gap-1 hover:bg-pink-500/30 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar Fita</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {allRibbons.map((ribbon) => (
            <motion.button
              key={ribbon.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                soundEngine.playEnvelopeOpen();
                setSelectedRibbon(ribbon);
              }}
              className="p-3 rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-400/40 flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shadow-md shrink-0"
                  style={{ backgroundColor: ribbon.color }}
                />
                <span className="text-xs font-semibold text-purple-100 group-hover:text-pink-300 line-clamp-1">
                  {ribbon.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add Ribbon Modal */}
      <AnimatePresence>
        {isAddingRibbon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsAddingRibbon(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl glass-card-glow p-6 border border-pink-400/40 shadow-2xl relative text-center space-y-4"
            >
              <button
                onClick={() => setIsAddingRibbon(false)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/30 border border-pink-400/40 flex items-center justify-center text-pink-300">
                <Ribbon className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-bold text-white font-display">
                Amarre uma Nova Promessa 🎀
              </h4>
              <p className="text-xs text-purple-200/80">
                Escreva uma promessa de coração para ficar gravada eternamente na copa da nossa árvore.
              </p>

              <form onSubmit={handleSaveCustomRibbon} className="space-y-3">
                <textarea
                  value={newRibbonText}
                  onChange={(e) => setNewRibbonText(e.target.value)}
                  placeholder="Ex: Prometo sempre te levar seu chocolate favorito quando você estiver cansada..."
                  rows={3}
                  maxLength={200}
                  className="w-full p-3 rounded-2xl bg-purple-950/60 border border-pink-500/40 text-white text-xs md:text-sm placeholder-purple-400/50 outline-none focus:border-pink-400"
                />
                <button
                  type="submit"
                  disabled={!newRibbonText.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  Amarrar na Árvore (+5 💎)
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ribbon Message Modal */}
      <AnimatePresence>
        {selectedRibbon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedRibbon(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl glass-card-glow p-6 border border-pink-400/40 shadow-2xl relative text-center space-y-4"
            >
              <button
                onClick={() => setSelectedRibbon(null)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: selectedRibbon.color }}
              >
                <Ribbon className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-bold text-white font-display">
                {selectedRibbon.title}
              </h4>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs md:text-sm text-purple-100 font-light leading-relaxed italic">
                “{selectedRibbon.message}”
              </div>

              <div className="text-[11px] text-pink-300 font-mono">
                Gravado com amor no coração de Gabriel para Samella ♡
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Harvested Fruit Note Modal */}
      <AnimatePresence>
        {harvestedFruitMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setHarvestedFruitMsg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl glass-card-glow p-6 border border-amber-400/40 shadow-2xl relative text-center space-y-4"
            >
              <button
                onClick={() => setHarvestedFruitMsg(null)}
                className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
                <Apple className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-bold text-white font-display">
                Fruto do Amor Colhido! 🍎
              </h4>

              <div className="p-4 rounded-2xl bg-purple-950/50 border border-amber-500/30 text-sm text-amber-100 italic leading-relaxed">
                {harvestedFruitMsg}
              </div>

              <p className="text-xs text-amber-300 font-semibold">
                +1 Diamante Raro adicionado ao seu saldo! 💎
              </p>

              <button
                onClick={() => setHarvestedFruitMsg(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-md hover:brightness-110"
              >
                Guardar no Coração ♡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
