import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trees,
  Droplets,
  Sparkles,
  Sun,
  Ribbon,
  Apple,
  Scissors,
  Plus,
  X,
  ChevronRight,
  Orbit,
} from 'lucide-react';
import {
  useApp,
  getCooldownRemaining,
  formatCooldownMs,
} from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
import { LoveTree2D } from '../tree/LoveTree2D';
import { LoveTreeDesign } from '../tree/LoveTreeDesign';
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
    message:
      'Prometo estar ao seu lado não apenas nos dias de festa, mas especialmente nos momentos em que você precisar de colo e silêncio.',
    color: '#f43f5e',
  },
  {
    id: 'r2',
    title: 'Fita dos Sonhos Compartilhados ✨',
    message:
      'Nenhum sonho seu é pequeno demais. Quero construir cada detalhe do nosso futuro segurando a sua mão com orgulho.',
    color: '#eab308',
  },
  {
    id: 'r3',
    title: 'Fita da Calmaria 🌸',
    message:
      'O mundo lá fora pode ser barulhento e caótico, mas dentro do nosso abraço sempre haverá refúgio e serenidade.',
    color: '#ec4899',
  },
  {
    id: 'r4',
    title: 'Fita da Eternidade 💍',
    message:
      'O que começou no dia 12/06/2023 é apenas o primeiro capítulo da mais linda história que Deus escreveu.',
    color: '#a855f7',
  },
];

export const LoveTreeView: React.FC = () => {
  const {
    coins,
    config,
    treeState,
    waterLoveTree,
    sunLoveTree,
    pruneLoveTree,
    addPromiseRibbon,
    harvestTreeFruit,
    plantLoveSeed,
    showToast,
    triggerHeartExplosion,
    storeItems,
  } = useApp();

  const currentLevel = treeState.level || 1;
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
  const [treeViewMode, setTreeViewMode] = useState<'design' | '3d' | '2d'>('design');
  const [, setTick] = useState(0);

  // Live 1s ticker for cooldown countdowns
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cdWater = getCooldownRemaining(treeState.cooldowns, 'tree_water');
  const cdSun = getCooldownRemaining(treeState.cooldowns, 'tree_sun');
  const cdPrune = getCooldownRemaining(treeState.cooldowns, 'tree_prune');
  const cdRibbon = getCooldownRemaining(treeState.cooldowns, 'tree_ribbon');
  const cdFruit = getCooldownRemaining(treeState.cooldowns, 'tree_fruit');

  const daysTogether = useMemo(() => {
    const start = new Date(config.anniversaryDate || '2023-06-12T00:00:00').getTime();
    return Math.max(1, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
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

  const getStageLabel = (lvl: number) => {
    if (lvl === 1) return 'Semente do Amor 🌱';
    if (lvl <= 3) return 'Muda em Crescimento 🌸';
    if (lvl <= 6) return 'Cerejeira Florida 🌳';
    if (lvl <= 9) return 'Árvore das Promessas 🎀';
    return 'Árvore da Eternidade 🌌';
  };

  const handleWater = () => {
    if (isWatering) return;
    if (waterLoveTree()) {
      setIsWatering(true);
      setTimeout(() => setIsWatering(false), 1600);
    }
  };

  const handleSun = () => {
    if (isSunbathing) return;
    if (sunLoveTree()) {
      setIsSunbathing(true);
      setTimeout(() => setIsSunbathing(false), 1800);
    }
  };

  const handlePrune = () => {
    if (isPruning) return;
    if (pruneLoveTree()) {
      setIsPruning(true);
      setTimeout(() => setIsPruning(false), 1600);
    }
  };

  const handleHarvestFruit = (index: number) => {
    const msg = harvestTreeFruit(index);
    if (!msg) return;
    setHarvestedFruits((prev) => [...prev, index]);
    setHarvestedFruitMsg(msg);
  };

  const handleSaveCustomRibbon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRibbonText.trim()) return;
    if (addPromiseRibbon(newRibbonText.trim())) {
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

  const modalsPortal = (
    <AnimatePresence>
      {isAddingRibbon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsAddingRibbon(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl glass-card-glow p-6 border border-pink-400/40 shadow-2xl relative text-center space-y-4 bg-[#120624]"
          >
            <button
              onClick={() => setIsAddingRibbon(false)}
              className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pink-500/30 border border-pink-400/40 flex items-center justify-center text-pink-300">
              <Ribbon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">Amarre uma Nova Promessa 🎀</h4>
            <form onSubmit={handleSaveCustomRibbon} className="space-y-3">
              <textarea
                value={newRibbonText}
                onChange={(e) => setNewRibbonText(e.target.value)}
                placeholder="Escreva uma promessa sincera para ficar gravada nos galhos..."
                rows={3}
                maxLength={200}
                className="w-full p-3 rounded-2xl bg-purple-950/60 border border-pink-500/40 text-white text-xs md:text-sm placeholder-purple-400/50 outline-none focus:border-pink-400"
              />
              <button
                type="submit"
                disabled={!newRibbonText.trim() || cdRibbon > 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                {cdRibbon > 0
                  ? `Aguarde ${formatCooldownMs(cdRibbon)}`
                  : 'Amarrar na Árvore (+3 💎)'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {selectedRibbon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedRibbon(null)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl glass-card-glow p-6 border border-pink-400/40 shadow-2xl relative text-center space-y-4 bg-[#120624]"
          >
            <button
              onClick={() => setSelectedRibbon(null)}
              className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: selectedRibbon.color }}
            >
              <Ribbon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">{selectedRibbon.title}</h4>
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs md:text-sm text-purple-100 leading-relaxed italic">
              “{selectedRibbon.message}”
            </div>
          </motion.div>
        </motion.div>
      )}

      {harvestedFruitMsg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setHarvestedFruitMsg(null)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl glass-card-glow p-6 border border-amber-400/40 shadow-2xl relative text-center space-y-4 bg-[#120624]"
          >
            <button
              onClick={() => setHarvestedFruitMsg(null)}
              className="absolute top-4 right-4 p-2 rounded-full glass-panel text-purple-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
              <Apple className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white font-display">Fruto do Amor Colhido 🍎</h4>
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-amber-500/30 text-sm text-amber-100 italic leading-relaxed">
              {harvestedFruitMsg}
            </div>
            <button
              onClick={() => setHarvestedFruitMsg(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
            >
              Guardar no Coração ♡
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (treeViewMode === 'design') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3 pb-32 sm:pb-24 max-w-xl mx-auto"
      >
        <div className="flex justify-end">
          <div className="flex items-center bg-black/50 border border-teal-400/30 rounded-full p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setTreeViewMode('design')}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500 to-pink-500 text-white shadow cursor-pointer"
            >
              Novo ♡
            </button>
            <button
              type="button"
              onClick={() => setTreeViewMode('3d')}
              className="px-2.5 py-1 rounded-full flex items-center gap-1 text-purple-200/75 hover:text-white transition cursor-pointer"
            >
              <Orbit className="w-3 h-3" />
              <span>3D</span>
            </button>
            <button
              type="button"
              onClick={() => setTreeViewMode('2d')}
              className="px-2.5 py-1 rounded-full text-purple-200/75 hover:text-white transition cursor-pointer"
            >
              2D
            </button>
          </div>
        </div>

        <LoveTreeDesign
          coins={coins}
          level={currentLevel}
          xp={currentXp}
          maxXp={maxXp}
          stageLabel={getStageLabel(currentLevel)}
          waterCount={treeState.waterCount || 0}
          sunCount={treeState.sunCount || 0}
          fruitsHarvested={treeState.fruitsHarvested || 0}
          ribbons={allRibbons}
          hasSakuraTheme={hasSakuraTheme}
          hasGoldenApples={hasGoldenApples}
          hasFairyLights={hasFairyLights}
          hasSwing={hasSwing}
          hasLanterns={hasLanterns}
          hasCrystals={hasCrystals}
          hasButterfly={hasButterfly}
          hasSongbird={hasSongbird}
          isWatering={isWatering}
          isSunbathing={isSunbathing}
          isPruning={isPruning}
          cdWater={cdWater}
          cdSun={cdSun}
          cdPrune={cdPrune}
          cdFruit={cdFruit}
          cdRibbon={cdRibbon}
          onWater={handleWater}
          onSun={handleSun}
          onPrune={handlePrune}
          onHarvestFruit={() => handleHarvestFruit(harvestedFruits.length % 5)}
          onPlantSeed={() => plantLoveSeed()}
          onTreeTap={() => {
            soundEngine.playSparkle();
            triggerHeartExplosion();
            showToast('A Árvore do Amor vibra com o carinho de vocês! 🌿💖', '✨');
          }}
          onSelectRibbon={(r) => {
            soundEngine.playEnvelopeOpen();
            setSelectedRibbon(r);
          }}
          onOpenAddRibbon={() => setIsAddingRibbon(true)}
        />

        {typeof document !== 'undefined' && createPortal(modalsPortal, document.body)}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 pb-32 sm:pb-24 max-w-xl mx-auto text-center"
    >
      {/* Minimalist Clean Stage Card */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-teal-400/25 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isSunbathing
              ? 'bg-gradient-to-b from-amber-500/15 via-pink-600/10 to-transparent'
              : isWatering
              ? 'bg-gradient-to-b from-cyan-600/15 via-teal-900/20 to-black/50'
              : isPruning
              ? 'bg-gradient-to-b from-emerald-600/15 via-teal-950/20 to-black/50'
              : 'bg-gradient-to-b from-purple-950/30 via-teal-950/15 to-black/50'
          }`}
        />

        {/* Essential Top Bar: Tree Stage + Clean 3D|2D Switch */}
        <div className="z-10 w-full flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 min-w-0 text-left">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Trees className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{getStageLabel(currentLevel)}</h2>
              <p className="text-[10px] text-purple-300/75 font-mono tabular-nums">
                Nv.{currentLevel}/10 · {daysTogether}d juntos
              </p>
            </div>
          </div>

          <div className="flex items-center bg-black/50 border border-teal-400/30 rounded-full p-0.5 text-[10px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => setTreeViewMode('design')}
              className="px-2.5 py-1 rounded-full text-purple-200/75 hover:text-white transition cursor-pointer"
            >
              Novo ♡
            </button>
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
              <span>3D</span>
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
        </div>

        {/* Clean Unobstructed Tree Stage */}
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

          {/* Fruit Harvest Floating Trigger */}
          {(currentLevel >= 3 || hasGoldenApples) && (
            <button
              type="button"
              onClick={() => handleHarvestFruit(harvestedFruits.length % 5)}
              disabled={cdFruit > 0}
              className="absolute top-3 right-3 z-20 px-3 min-h-[36px] rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 cursor-pointer border border-amber-300/40 disabled:opacity-65"
            >
              <Apple className="w-3.5 h-3.5 fill-amber-200" />
              <span>{cdFruit > 0 ? formatCooldownMs(cdFruit) : 'Colher Fruto'}</span>
            </button>
          )}
        </div>

        {/* Clean XP Bar */}
        <div className="w-full space-y-1.5 mt-2 z-10 px-1">
          <div className="h-2 w-full bg-purple-950 rounded-full overflow-hidden border border-teal-500/25">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-pink-400 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-purple-300/75 font-mono tabular-nums">
            <span>Crescimento {xpPercent}%</span>
            <span>{currentLevel >= 10 ? 'Plenitude ✨' : `${currentXp}/${maxXp} XP`}</span>
          </div>
        </div>

        {/* Care Actions with Cooldown Timers */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 w-full z-10">
          <button
            type="button"
            onClick={handleWater}
            disabled={isWatering || cdWater > 0}
            className="min-h-[56px] p-2.5 rounded-2xl bg-gradient-to-r from-teal-600/80 to-cyan-600/80 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-55 cursor-pointer"
          >
            <Droplets className={`w-4 h-4 text-cyan-100 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>{cdWater > 0 ? formatCooldownMs(cdWater) : 'Regar'}</span>
          </button>

          <button
            type="button"
            onClick={handleSun}
            disabled={isSunbathing || cdSun > 0}
            className="min-h-[56px] p-2.5 rounded-2xl bg-gradient-to-r from-amber-600/80 to-rose-600/80 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-55 cursor-pointer"
          >
            <Sun className="w-4 h-4 text-amber-100" />
            <span>{cdSun > 0 ? formatCooldownMs(cdSun) : 'Sol'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrune}
            disabled={isPruning || cdPrune > 0}
            className="min-h-[56px] p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600/80 to-teal-700/80 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-55 cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-emerald-100" />
            <span>{cdPrune > 0 ? formatCooldownMs(cdPrune) : 'Podar'}</span>
          </button>
        </div>
      </div>

      {/* Promise Ribbons */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-purple-500/25 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ribbon className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">Fitas de Promessas ({allRibbons.length})</h3>
          </div>
          <button
            onClick={() => setIsAddingRibbon(true)}
            className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/40 text-xs font-bold flex items-center gap-1 hover:bg-pink-500/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{cdRibbon > 0 ? formatCooldownMs(cdRibbon) : 'Nova Fita'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allRibbons.map((ribbon) => (
            <button
              key={ribbon.id}
              onClick={() => {
                soundEngine.playEnvelopeOpen();
                setSelectedRibbon(ribbon);
              }}
              className="p-3 rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-400/40 flex items-center justify-between text-left group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ribbon.color }}
                />
                <span className="text-xs font-semibold text-purple-100 group-hover:text-pink-300 truncate">
                  {ribbon.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(modalsPortal, document.body)}
    </motion.div>
  );
};
