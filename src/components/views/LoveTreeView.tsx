import React, { useState } from 'react';
import {
  Trees,
  Droplets,
  Heart,
  Sparkles,
  Sun,
  Award,
  Flower2,
  Ribbon,
  Apple,
  Scissors,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';
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

const FRUIT_MESSAGES = [
  '“Você é o amor mais doce que a vida me deu.” 💖',
  '“Seu riso tem gosto de felicidade plena.” ✨',
  '“Amo a mulher forte e bondosa que você é.” 🌹',
  '“Hoje e sempre, meu coração bate no compasso do seu.” 🍎',
  '“Obrigado por ser minha melhor companhia de todos os dias.” 🍓',
];

export const LoveTreeView: React.FC = () => {
  const {
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
  const xpCurrent = Math.min(100, Math.round(((treeState.xp || 0) % 100)));

  const [isWatering, setIsWatering] = useState(false);
  const [isSunbathing, setIsSunbathing] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [selectedRibbon, setSelectedRibbon] = useState<PromiseRibbon | null>(null);
  const [harvestedFruitMsg, setHarvestedFruitMsg] = useState<string | null>(null);
  const [harvestedFruits, setHarvestedFruits] = useState<number[]>([]);
  const [isAddingRibbon, setIsAddingRibbon] = useState(false);
  const [newRibbonText, setNewRibbonText] = useState('');

  // Store unlocks
  const hasSakuraTheme = storeItems.find((i) => i.id === 'item-tree-sakura')?.purchased;
  const hasGoldenApples = storeItems.find((i) => i.id === 'item-tree-golden-apples')?.purchased;
  const hasFairyLights = storeItems.find((i) => i.id === 'item-tree-fairy-lights')?.purchased;

  // Tree evolution stage titles & descriptors
  const getStageInfo = (lvl: number) => {
    if (lvl === 1) {
      return {
        title: 'Brotinho de Luz Encantado 🌱',
        desc: 'Uma semente de amor acabou de germinar, alimentada pelos primeiros carinhos.',
        color: '#10b981',
      };
    } else if (lvl <= 3) {
      return {
        title: 'Muda de Sakura em Flor 🌸',
        desc: 'O tronco ganha força e os primeiros botões cor-de-rosa começam a se abrir.',
        color: '#ec4899',
      };
    } else if (lvl <= 5) {
      return {
        title: 'Cerejeira Frondosa dos Apaixonados 🌳',
        desc: 'Copa ampla com pétalas de sakura que dançam com o vento suave.',
        color: '#f43f5e',
      };
    } else if (lvl <= 7) {
      return {
        title: 'Árvore dos Frutos Sagrados do Amor 🍎✨',
        desc: 'Galhos carregados de frutos dourados que guardam doces segredos de amor.',
        color: '#eab308',
      };
    } else if (lvl <= 9) {
      return {
        title: 'Árvore Encantada com Fitas de Promessas 🎀🕯️',
        desc: 'Luzes de fadas iluminam as promessas eternas de Gabriel para Samella.',
        color: '#a855f7',
      };
    } else {
      return {
        title: 'Árvore Cósmica da Eternidade 🌌👑',
        desc: 'Atingiu a plenitude máxima! Uma aura celestial de estrelas envolve suas raízes e flores eternas.',
        color: '#38bdf8',
      };
    }
  };

  const stage = getStageInfo(currentLevel);

  const handleWater = () => {
    if (isWatering) return;
    setIsWatering(true);
    waterLoveTree();

    setTimeout(() => {
      setIsWatering(false);
    }, 1600);
  };

  const handleSun = () => {
    if (isSunbathing) return;
    setIsSunbathing(true);
    sunLoveTree();

    setTimeout(() => {
      setIsSunbathing(false);
    }, 1800);
  };

  const handlePrune = () => {
    if (isPruning) return;
    setIsPruning(true);
    pruneLoveTree();

    setTimeout(() => {
      setIsPruning(false);
    }, 1600);
  };

  const handleHarvestFruit = (index: number) => {
    if (harvestedFruits.includes(index)) {
      showToast('Este fruto já foi colhido hoje! Em breve nascerá outro docinho.', '🍎');
      return;
    }
    soundEngine.playFruitHarvest();
    triggerHeartExplosion(0.5, 0.45);
    setHarvestedFruits((prev) => [...prev, index]);
    harvestTreeFruit(index);
    const msg = FRUIT_MESSAGES[index % FRUIT_MESSAGES.length];
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
      title: `Promessa #${i + 1} de Amor 💌`,
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
          <span>Evolução da Árvore do Amor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossa Árvore em Evolução 🌱✨
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Cada rega, cuidado e banho de sol faz nossa árvore subir de nível, florescer e dar frutos sagrados.
        </p>
      </div>

      {/* Main Interactive Tree Card */}
      <div className="glass-card-glow rounded-3xl p-6 md:p-8 border border-teal-400/30 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Dynamic Sky Ambient Background */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
            isSunbathing
              ? 'bg-gradient-to-b from-amber-500/25 via-pink-600/15 to-transparent'
              : isWatering
              ? 'bg-gradient-to-b from-cyan-600/25 via-teal-900/35 to-black/50'
              : isPruning
              ? 'bg-gradient-to-b from-emerald-600/20 via-teal-950/30 to-black/50'
              : 'bg-gradient-to-b from-purple-950/40 via-teal-950/20 to-black/60'
          }`}
        />

        {/* Floating Stars & Fireflies */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_8px_#2dd4bf]"
              style={{
                left: `${(i * 19 + 7) % 95}%`,
                top: `${(i * 23 + 12) % 80}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                x: [-6, 6, -6],
                opacity: [0.2, 0.9, 0.2],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Stage Badge */}
        <div className="z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-teal-400/40 backdrop-blur-md mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold text-white tracking-wide">{stage.title}</span>
        </div>

        {/* 3D Real Fantasy Tree Experience */}
        <div className="relative w-full my-1">
          <FantasyTreeCanvas
            level={currentLevel}
            isWatering={isWatering}
            isSunbathing={isSunbathing}
            isPruning={isPruning}
            hasSakuraTheme={hasSakuraTheme}
            hasGoldenApples={hasGoldenApples}
            hasFairyLights={hasFairyLights}
            ribbons={DEFAULT_RIBBONS}
            onTreeInteract={() => {
              soundEngine.playSparkle();
              triggerHeartExplosion();
              showToast('A Árvore do Amor vibra com o carinho de vocês! 🌿💖', '✨');
            }}
          />

          {/* Quick Floating Harvest Button for Sacred Fruits */}
          {(currentLevel >= 3 || hasGoldenApples) && (
            <div className="absolute top-3 right-3 z-20">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleHarvestFruit(0)}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-[0_0_15px_#f59e0b] flex items-center gap-1.5 cursor-pointer border border-amber-300/40"
              >
                <Apple className="w-3.5 h-3.5 fill-amber-200" />
                <span>Colher Fruto (+1 💎)</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Level Progress Stats */}
        <div className="w-full max-w-sm space-y-2 mt-1">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span className="font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-300" />
              <span>Nível da Árvore</span>
            </span>
            <span className="font-bold text-teal-300 font-mono text-sm">
              Nível {currentLevel} / 10
            </span>
          </div>

          {/* XP Bar */}
          <div className="h-2.5 w-full bg-purple-950 rounded-full overflow-hidden border border-teal-500/30 relative">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-pink-400 to-rose-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#2dd4bf]"
              style={{ width: `${currentLevel === 10 ? 100 : Math.max(15, xpCurrent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-purple-300/80 pt-0.5">
            <span>Regas: <strong>{currentWater}x</strong> | Sol: <strong>{currentSun}x</strong></span>
            <span>{currentLevel === 10 ? '✨ Nível Máximo' : `XP: ${xpCurrent}%`}</span>
          </div>
        </div>

        {/* Action Buttons: Water, Sun, Prune */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleWater}
            disabled={isWatering}
            className="p-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Droplets className={`w-4 h-4 text-cyan-200 ${isWatering ? 'animate-spin' : 'animate-bounce'}`} />
            <span>Regar (+2 💎)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSun}
            disabled={isSunbathing}
            className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sun className="w-4 h-4 text-amber-200 animate-spin" />
            <span>Banho de Sol</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePrune}
            disabled={isPruning}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-emerald-200" />
            <span>Podar Folhas</span>
          </motion.button>
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
