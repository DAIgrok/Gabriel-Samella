import React, { useState } from 'react';
import { Header } from './Header';
import { MiniMusicPlayer } from './MiniMusicPlayer';
import { RelationshipCounter } from './RelationshipCounter';
import { DailyMessageCard } from './DailyMessageCard';
import { MemoriesHomeCard } from './MemoriesHomeCard';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  Mail,
  Gamepad2,
  ShoppingBag,
  Trees,
  TreePine,
  Cat,
  Package,
  Star,
  Calendar,
  Hourglass,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { PET_SPECIES_CATALOG } from '../data/initialData';

export const HomeView: React.FC = () => {
  const { setExtendedView, triggerEasterEgg, treeState, loveTree, kitten } = useApp();
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);

  const activeTree = treeState || loveTree;
  const treeLevel = activeTree?.level ?? 2;
  const treeProgress = activeTree?.maxXp
    ? Math.min(100, Math.round(((activeTree.xp || 45) / activeTree.maxXp) * 100))
    : 45;

  const calculateCapsuleRemaining = () => {
    const target = new Date('2028-12-25T00:00:00');
    const now = new Date();
    if (now >= target) return 'Pronta para abrir hoje! 🎁';

    let years = target.getFullYear() - now.getFullYear();
    let months = target.getMonth() - now.getMonth();
    let days = target.getDate() - now.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthDays;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

    return `Faltam ${parts.join(', ')}`;
  };

  return (
    <div className="w-full space-y-4 md:space-y-5 pb-32 sm:pb-28">
      {/* 1. Header with Script Title & Diamonds/Settings */}
      <Header />

      {/* 2. Romantic Hero Section matching reference screenshot */}
      <section className="relative rounded-3xl overflow-hidden p-6 md:p-8 min-h-[220px] md:min-h-[250px] bg-gradient-to-r from-[#0d041c] via-[#15072e]/90 to-transparent border border-purple-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        {/* Blended Couple Photo on the Right */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-2/3 pointer-events-none overflow-hidden opacity-90">
          <img
            src="/assets/img/real/hero_couple.jpg"
            alt="Gabriel e Samella"
            className="w-full h-full object-cover object-right md:object-center mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d041c] via-[#0d041c]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d041c] via-transparent to-transparent" />
        </div>

        {/* Top Right: Tilted Floating Handwritten Cursive matching screenshot */}
        <div className="absolute top-4 right-6 text-right select-none pointer-events-none hidden sm:block">
          <div className="font-romantic text-xl md:text-2xl text-pink-200/90 rotate-[-4deg] drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]">
            <div>Juntos</div>
            <div>sempre</div>
            <div className="flex items-center justify-end gap-1">
              <span>é melhor</span>
              <span className="text-pink-400 text-lg">♡</span>
            </div>
          </div>
          <span className="text-pink-300 text-xs block pr-3 pt-1">♡</span>
        </div>

        {/* Left Side Content: Romantic Welcome Message */}
        <div className="relative z-10 max-w-lg space-y-2.5">
          <div className="flex items-center gap-2">
            <h2 className="font-romantic text-3xl sm:text-4xl md:text-5xl text-pink-200 neon-title-glow tracking-wide flex items-center gap-2">
              Bem-vinda, meu amor
              <span className="text-pink-400 font-sans text-2xl drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
                ♡
              </span>
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-purple-200/85 font-normal leading-relaxed space-y-0.5">
            <p>Que bom ter você aqui...</p>
            <p>Cada dia com você é um presente</p>
            <p className="flex items-center gap-1.5">
              <span>e eu sou muito grato por tudo que construímos juntos.</span>
              <span className="text-pink-400">💜</span>
            </p>
          </div>
        </div>

        {/* Floating Sparkle Stars */}
        <div className="absolute left-1/3 top-8 text-pink-300/40 text-sm animate-pulse">✦</div>
        <div className="absolute left-1/2 bottom-6 text-purple-300/40 text-xs">✧</div>
      </section>

      {/* 3. Row 2: Music Player & Nosso tempo (2 Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniMusicPlayer />
        <RelationshipCounter />
      </section>

      {/* 4. Row 3: Mensagem do dia & Memórias (2 Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyMessageCard />
        <MemoriesHomeCard />
      </section>

      {/* 5. Row 4: 4 Action Cards (Cartas, Jogos, Loja, Árvore) matching screenshot */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Cartas */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('cartas')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-pink-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5 text-pink-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Cartas</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Declarações, segredos e mensagens especiais
          </p>
        </motion.div>

        {/* Jogos */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('jogos')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-purple-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5 text-purple-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Jogos</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Desafios, quizzes e muita diversão
          </p>
        </motion.div>

        {/* Loja */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('loja')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-pink-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-rose-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(244,114,182,0.35)] group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-rose-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Loja</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Itens, pets e decorações
          </p>
        </motion.div>

        {/* Árvore */}
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('arvore')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-teal-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(217,70,239,0.35)] group-hover:scale-105 transition-transform">
            <TreePine className="w-5 h-5 text-pink-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Árvore</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Cuide, evolua e desbloqueie conquistas
          </p>
        </motion.div>
      </section>

      {/* 6. Row 5: 3 Interactive Status Cards (Nossa Árvore, Meu Pet, Baú de Surpresas) matching screenshot */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Nossa Árvore */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-purple-500/30 bg-purple-950/60 shadow-md">
              <img
                src="/assets/img/real/tree_thumb.jpg"
                alt="Nossa Árvore"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                <Trees className="w-3.5 h-3.5 text-pink-400" />
                <span>Nossa Árvore</span>
              </div>
              <div className="text-[11px] text-purple-300/80">
                Nível {treeLevel}
              </div>
              {/* Progress bar */}
              <div className="space-y-0.5">
                <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    style={{ width: `${treeProgress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-purple-300/70 font-mono">
                  {treeProgress}%
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExtendedView('arvore')}
            className="w-full mt-3 py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Cuidar da árvore</span>
            <ArrowRight className="w-3 h-3 text-purple-300" />
          </button>
        </div>

        {/* Card 2: Meu Pet */}
        {(() => {
          const currentPetType = (kitten?.petType || 'cat');
          const currentPetSpecies = PET_SPECIES_CATALOG.find((s) => s.type === currentPetType) || PET_SPECIES_CATALOG[0];
          const petName = kitten?.name || currentPetSpecies.defaultName;

          return (
            <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg relative overflow-hidden flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between text-xs text-white font-semibold mb-2">
                <div className="flex items-center gap-1.5">
                  <Cat className="w-3.5 h-3.5 text-pink-400" />
                  <span>Mascote Ativo</span>
                </div>
                <span className="text-[10px] text-pink-300 font-medium px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30">
                  Nv. {kitten?.level || 1}
                </span>
              </div>

              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-purple-500/30 shadow-md bg-purple-950/60 my-1 relative flex items-center justify-center">
                <img
                  src="/assets/img/real/cat_thumb.jpg"
                  alt="Meu Pet"
                  className="w-full h-full object-cover opacity-60 absolute inset-0"
                />
                <span className="relative z-10 text-3xl filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {currentPetSpecies.emoji}
                </span>
              </div>

              <div className="space-y-0.5 my-1.5">
                <h4 className="text-xs font-bold text-white leading-tight">
                  {petName} ({currentPetSpecies.name})
                </h4>
                <p className="text-[11px] text-purple-200/80 capitalize">
                  Humor: {kitten?.mood || 'Feliz'} 🥰
                </p>
              </div>

              <button
                onClick={() => setExtendedView('gatinho')}
                className="w-full py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Cuidar de {petName}</span>
                <ArrowRight className="w-3 h-3 text-purple-300" />
              </button>
            </div>
          );
        })()}

        {/* Card 3: Baú de Surpresas */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg relative overflow-hidden flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs text-white font-semibold mb-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-pink-400" />
              <span>Baú de Surpresas</span>
            </div>
            <Heart className="w-3 h-3 text-pink-400/50" />
          </div>

          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-purple-500/30 shadow-md bg-purple-950/60 my-1">
            <img
              src="/assets/img/real/chest_thumb.jpg"
              alt="Baú de Surpresas"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-purple-200/80 my-2">
            Pode ter uma recompensa te esperando...
          </p>

          <button
            onClick={() => triggerEasterEgg('egg-chest')}
            className="w-full py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Abrir baú</span>
            <ArrowRight className="w-3 h-3 text-purple-300" />
          </button>
        </div>
      </section>

      {/* 7. Row 6: 3 Bottom Info Cards matching screenshot */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Próxima conquista */}
        <div className="rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-300 border border-purple-400/25 flex-shrink-0">
            <Star className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-purple-300/70 block uppercase font-medium">
              Próxima conquista
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              Ler 10 cartas
            </span>
            <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden mt-1.5">
              <div className="w-[30%] h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
            </div>
          </div>
          <span className="text-[10px] text-purple-300/60 font-mono flex-shrink-0">3/10</span>
        </div>

        {/* Card 2: Dia especial */}
        <div className="rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-300 border border-purple-400/25 flex-shrink-0">
            <Calendar className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-purple-300/70 block uppercase font-medium">
              Dia especial
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              Nosso aniversário
            </span>
            <span className="text-[11px] text-pink-300 font-medium">
              12 de junho ♡
            </span>
          </div>
        </div>

        {/* Card 3: Cápsula do tempo */}
        <div
          onClick={() => setIsCapsuleOpen(true)}
          className="rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 flex items-center gap-3 cursor-pointer hover:border-pink-400/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-300 border border-purple-400/25 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Hourglass className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-purple-300/70 block uppercase font-medium">
              Cápsula do tempo
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              25 de dezembro de 2028
            </span>
            <span className="text-[10px] text-purple-300/70 block">
              {calculateCapsuleRemaining()}
            </span>
          </div>
        </div>
      </section>

      {/* 8. Bottom Footer: Delicate Line & Romantic Signature matching screenshot */}
      <footer className="pt-6 pb-2 text-center select-none relative">
        <div className="relative flex items-center justify-center mb-2">
          <div className="w-full border-t border-purple-500/20 max-w-md mx-auto" />
          <div className="absolute px-3 bg-[#080214] text-pink-400 text-xs">
            ✧
          </div>
        </div>
        <p className="font-romantic text-xl text-pink-300/80 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
          Nosso Mundo ♡ ♡
        </p>
      </footer>

      {/* Time Capsule Modal */}
      {isCapsuleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsCapsuleOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-br from-[#1b0933] via-[#100424] to-[#080214] border border-purple-500/40 shadow-2xl space-y-4 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full mx-auto bg-purple-900/40 border border-purple-400/30 flex items-center justify-center text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.4)]">
              <Hourglass className="w-8 h-8 text-pink-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white font-display">
                Cápsula do Tempo Selada 🔒
              </h3>
              <p className="text-xs text-purple-300/80 font-mono">
                Data de Abertura: 25 de Dezembro de 2028
              </p>
              <p className="text-xs text-pink-300 font-semibold pt-1">
                {calculateCapsuleRemaining()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/25 text-xs text-purple-200/90 leading-relaxed text-left space-y-2">
              <p className="font-semibold text-pink-200 flex items-center gap-1.5">
                <span>💌 Carta Guardada para o Futuro:</span>
              </p>
              <p className="italic">
                "Esta cápsula guarda os nossos primeiros sonhos, promessas e o amor imenso que nasceu em 12 de junho de 2023. No Natal de 2028, vamos abrir juntos para celebrar tudo o que já conquistamos lado a lado."
              </p>
              <p className="text-right text-[11px] text-pink-300 font-romantic text-base">
                — Gabriel & Samella ♡
              </p>
            </div>

            <button
              onClick={() => setIsCapsuleOpen(false)}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Manter Selada com Amor ♡
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
