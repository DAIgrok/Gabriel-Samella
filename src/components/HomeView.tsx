import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Header } from './Header';
import { MiniMusicPlayer } from './MiniMusicPlayer';
import { RelationshipCounter } from './RelationshipCounter';
import { DailyMessageCard } from './DailyMessageCard';
import { MemoriesHomeCard } from './MemoriesHomeCard';
import { HomePhotoLoopCard } from './HomePhotoLoopCard';
import { DailyWheelModal, formatWheelRemaining } from './DailyWheelModal';
import { SmartPhoto } from './SmartPhoto';
import { useApp } from '../context/AppContext';
import { motion, useReducedMotion } from 'motion/react';
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
  Gift,
  Target,
  Lock,
  Unlock,
  X,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { COOLDOWN_MS, INTEGRATED_MISSIONS_CATALOG, PET_SPECIES_CATALOG } from '../data/initialData';
import { VISUAL_ASSETS } from '../data/visualAssets';
import {
  AquariumCoralIcon,
  DreamHouseCrestIcon,
  MissionCompassIcon,
  VectorGlyphIcon,
} from './icons/CustomIcons';
import {
  formatCountdownDays,
  formatDateBR,
  getCalendarCategoryMeta,
  getCalendarColorStyle,
  getUpcomingCalendarEvents,
} from '../utils/calendarHelpers';

export const HomeView: React.FC = () => {
  const {
    setExtendedView,
    triggerEasterEgg,
    treeState,
    loveTree,
    kitten,
    photos,
    achievements,
    timeCapsules,
    coupleGoals,
    calendarEvents,
    dailyWheel,
    dreamHouse,
    aquarium,
    missionsState,
    activeSeasonalMeta,
    lastMysteryChestAt,
    openMysteryChest,
    isSpectator,
  } = useApp();
  const prefersReducedMotion = useReducedMotion();

  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const activeTree = treeState || loveTree;
  const treeLevel = activeTree?.level ?? 1;
  const treeProgress = activeTree?.maxXp
    ? Math.min(100, Math.round(((activeTree.xp ?? 0) / activeTree.maxXp) * 100))
    : 0;

  const nextAch = achievements.find((a) => !a.unlocked);
  const nextAchTitle = nextAch ? nextAch.title : 'Todas concluídas!';
  const nextAchCurrent = nextAch ? nextAch.progress : achievements.length;
  const nextAchMax = nextAch ? Math.max(1, nextAch.maxProgress) : Math.max(1, achievements.length);
  const nextAchPercent = Math.min(100, Math.round((nextAchCurrent / nextAchMax) * 100));

  const wheelRemMs = dailyWheel.lastSpinAt
    ? Math.max(0, dailyWheel.lastSpinAt + COOLDOWN_MS.wheel_spin - nowMs)
    : 0;
  const chestRemMs = lastMysteryChestAt
    ? Math.max(0, lastMysteryChestAt + COOLDOWN_MS.mystery_chest - nowMs)
    : 0;

  const completedGoals = coupleGoals.filter((g) => g.completed).length;
  const goalsPct =
    coupleGoals.length > 0 ? Math.round((completedGoals / coupleGoals.length) * 100) : 0;

  const upcomingCalendar = getUpcomingCalendarEvents(calendarEvents, new Date(nowMs));
  const nextCalendarItem = upcomingCalendar[0] || null;

  const formatCountdownTo = (unlockDate: string) => {
    const target = new Date(`${unlockDate}T00:00:00`);
    const now = new Date(nowMs);
    if (now >= target) return 'Desbloqueada hoje!';

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

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
    return parts.length > 0 ? `Faltam ${parts.join(', ')}` : 'Abre amanhã!';
  };

  const nextCapsule = timeCapsules[0];

  return (
    <div className="w-full space-y-4 md:space-y-5 pb-32 sm:pb-28">
      {/* 1. Header */}
      <Header />

      {/* 2. Romantic Hero Section */}
      <section className="nm-hero relative rounded-3xl overflow-hidden p-6 md:p-8 min-h-[210px] md:min-h-[240px] bg-gradient-to-r from-[#0d041c] via-[#15072e]/90 to-[#240a44]/80 border border-purple-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        {photos.length > 0 && (
          <div className="absolute top-0 right-0 bottom-0 w-full md:w-2/3 pointer-events-none overflow-hidden opacity-90">
            <SmartPhoto
              photo={photos[Math.floor(nowMs / 9000) % photos.length]}
              photoIndex={(Math.floor(nowMs / 9000) % photos.length) + 1}
              src={photos[Math.floor(nowMs / 9000) % photos.length]?.url}
              alt="Gabriel e Samella"
              className="w-full h-full rounded-none"
              imgClassName="w-full h-full object-cover object-right md:object-center mix-blend-screen scale-105"
              hideDetails
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d041c] via-[#0d041c]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d041c] via-transparent to-transparent" />
          </div>
        )}

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

        <div className="relative z-10 max-w-lg space-y-2.5">
          <span className="nm-hero-kicker inline-flex items-center gap-2 rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] font-semibold"> <Sparkles className="w-3 h-3" /> Nosso universo particular </span>
          <h2 className="nm-hero-title font-romantic text-3xl sm:text-4xl md:text-5xl text-pink-200 neon-title-glow tracking-wide flex items-center gap-2">
            Bem-vinda, meu amor
            <span className="text-pink-400 font-sans text-2xl drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]">
              ♡
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-purple-200/85 font-normal leading-relaxed">
            Que bom ter você aqui. Este cantinho é nosso.
          </p>
        </div>
      </section>

      {/* 3. Music Player & Relationship Timer */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniMusicPlayer />
        <RelationshipCounter />
      </section>

      {/* 4. Quadro de Memórias em Loop + Roleta Diária & Metas */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <HomePhotoLoopCard />
        </div>

        <div className="flex flex-col gap-3.5 justify-between">
          {/* Roleta Diária */}
          <button
            type="button"
            onClick={() => setIsWheelOpen(true)}
            className="flex-1 text-left rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#230b3f]/90 via-[#140628] to-[#0a0217] border border-pink-400/35 hover:border-pink-400/65 shadow-lg flex flex-col justify-between gap-3 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_16px_rgba(236,72,153,0.45)]">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-pink-200 tabular-nums">
                {wheelRemMs === 0 ? 'Pronta agora!' : formatWheelRemaining(wheelRemMs)}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Roleta Diária</h3>
              <p className="text-xs text-purple-200/75 mt-0.5">
                {wheelRemMs === 0
                  ? 'Toque para girar e ganhar diamantes surpresa!'
                  : `Último prêmio: ${dailyWheel.lastPrize || 'Coletado hoje'}`}
              </p>
            </div>
          </button>

          {/* Lista de Desejos & Sonhos do Casal */}
          <button
            type="button"
            onClick={() => setExtendedView('metas')}
            className="flex-1 text-left rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#190933]/90 to-[#0a0318] border border-purple-500/30 hover:border-pink-400/50 shadow-lg flex flex-col justify-between gap-3 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="w-11 h-11 rounded-2xl bg-purple-900/70 border border-purple-400/30 flex items-center justify-center text-pink-300">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-purple-200 tabular-nums">
                {completedGoals}/{coupleGoals.length} · {goalsPct}%
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Lista de Desejos</h3>
              <p className="text-xs text-purple-200/75">
                Nossos sonhos, planos e conquistas juntos ♡
              </p>
              <div className="w-full h-1.5 bg-purple-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${goalsPct}%` }}
                />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 4b. Novo Card: Calendário do Casal */}
      <section>
        <button
          type="button"
          onClick={() => setExtendedView('calendario')}
          className="w-full text-left rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-[#1c0938]/95 via-[#130527]/95 to-[#0c0219]/95 border border-purple-500/30 hover:border-pink-400/55 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all group"
        >
          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_18px_rgba(236,72,153,0.4)] shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h3 className="text-base font-bold text-white">Calendário do Casal</h3>
                <span className="text-xs text-pink-300/90 tabular-nums">
                  {upcomingCalendar.length} {upcomingCalendar.length === 1 ? 'data marcada' : 'datas marcadas'}
                </span>
              </div>

              {nextCalendarItem ? (
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-medium text-purple-100 truncate flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        getCalendarColorStyle(nextCalendarItem.event.color).dot
                      }`}
                    />
                    <span className="truncate inline-flex items-center gap-1.5">
                      <VectorGlyphIcon
                        name={getCalendarCategoryMeta(nextCalendarItem.event.category).emoji}
                        className="w-3.5 h-3.5 text-pink-300 shrink-0"
                      />
                      <span className="truncate">{nextCalendarItem.event.title}</span>
                    </span>
                  </p>
                  <p className="text-[11px] text-purple-200/75 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                    <span>{formatDateBR(nextCalendarItem.occurrenceDateKey)}</span>
                    {nextCalendarItem.event.time && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {nextCalendarItem.event.time}
                        </span>
                      </>
                    )}
                    {nextCalendarItem.event.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                          <MapPin className="w-3 h-3" />
                          {nextCalendarItem.event.location}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-purple-200/75">
                  Toque para marcar encontros, datas especiais e lembretes nossos ♡
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-purple-500/20">
            {nextCalendarItem && (
              <span className="text-xs font-bold text-pink-200 tabular-nums">
                {formatCountdownDays(nextCalendarItem.daysUntil)}
              </span>
            )}
            <span className="min-h-[40px] px-4 rounded-2xl bg-[#240d46] group-hover:bg-pink-600/30 border border-purple-400/35 text-xs font-semibold text-white inline-flex items-center gap-1.5 whitespace-nowrap transition">
              <span>Abrir Calendário</span>
              <ArrowRight className="w-3.5 h-3.5 text-pink-300" />
            </span>
          </div>
        </button>
      </section>

      {/* 5. Mensagem do dia & Memórias */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyMessageCard />
        <MemoriesHomeCard />
      </section>

      {/* 6. 4 Action Cards (Cartas, Jogos, Loja, Árvore) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('cartas')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-pink-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(236,72,153,0.35)]">
            <Mail className="w-5 h-5 text-pink-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Cartas</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Pergaminhos antigos, selos e declarações
          </p>
        </motion.div>

        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('jogos')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-purple-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
            <Gamepad2 className="w-5 h-5 text-purple-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">25 Jogos</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Mega Quiz, palavras, tabuleiro e ação
          </p>
        </motion.div>

        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('loja')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-pink-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-rose-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(244,114,182,0.35)]">
            <ShoppingBag className="w-5 h-5 text-rose-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Loja</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Roupas de pet, vales e acessórios
          </p>
        </motion.div>

        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setExtendedView('arvore')}
          className="rounded-3xl p-5 bg-gradient-to-b from-[#18082f]/90 to-[#0e041c]/95 border border-purple-500/25 shadow-lg flex flex-col items-center text-center cursor-pointer group hover:border-teal-400/40 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-fuchsia-600 flex items-center justify-center text-white mb-3 shadow-[0_0_15px_rgba(217,70,239,0.35)]">
            <TreePine className="w-5 h-5 text-pink-100" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-wide mb-1">Árvore</h4>
          <p className="text-[11px] text-purple-300/70 leading-snug">
            Cuide para crescer até o nível 10
          </p>
        </motion.div>
      </section>

      {/* 6b. Universo Virtual 3D & Missões Sazonais */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setExtendedView('casa')}
          className="text-left rounded-3xl overflow-hidden bg-gradient-to-br from-[#1d0a38]/95 to-[#0b0319]/95 border border-purple-500/30 hover:border-pink-400/55 shadow-lg group cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="relative h-28 w-full overflow-hidden">
            <img
              src={VISUAL_ASSETS.dreamHousePreview}
              alt="Casa dos Sonhos 3D"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120526] via-[#120526]/35 to-transparent" />
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-pink-400/40 text-[10px] font-bold text-pink-200 backdrop-blur-sm">
              <DreamHouseCrestIcon className="w-3.5 h-3.5 text-pink-300" />
              <span>Universo 3D</span>
            </span>
          </div>
          <div className="p-4 pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">Casa dos Sonhos</h4>
              <p className="text-[11px] text-purple-200/75 truncate">
                Cômodo ativo: {dreamHouse.activeRoom} · Nv.{dreamHouse.comfortLevel}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-pink-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setExtendedView('aquario')}
          className="text-left rounded-3xl overflow-hidden bg-gradient-to-br from-[#0e1538]/95 to-[#07081a]/95 border border-cyan-500/30 hover:border-cyan-300/55 shadow-lg group cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="relative h-28 w-full overflow-hidden">
            <img
              src={VISUAL_ASSETS.magicAquariumPreview}
              alt="Aquário Mágico 3D"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d24] via-[#0b0d24]/35 to-transparent" />
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-cyan-400/40 text-[10px] font-bold text-cyan-200 backdrop-blur-sm">
              <AquariumCoralIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>Aquário 3D</span>
            </span>
          </div>
          <div className="p-4 pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">Aquário Mágico</h4>
              <p className="text-[11px] text-cyan-200/75 truncate tabular-nums">
                {aquarium.activeFishIds.length} peixinhos · Água {aquarium.waterClarity}%
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setExtendedView('missoes')}
          className="text-left rounded-3xl p-4 bg-gradient-to-br from-[#230b3f]/95 via-[#140628]/95 to-[#0a0217]/95 border border-amber-400/30 hover:border-amber-300/55 shadow-lg group cursor-pointer transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-pink-500/30 border border-amber-300/40 flex items-center justify-center text-amber-200">
              <MissionCompassIcon className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-400/30 text-[10px] font-bold text-pink-200 tabular-nums">
              {missionsState.claimedIds.length}/{INTEGRATED_MISSIONS_CATALOG.length} concl.
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-300/90 block">
              {activeSeasonalMeta.label}
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">Missões & Eventos Sazonais</h4>
            <p className="text-[11px] text-purple-200/75 mt-0.5 line-clamp-2">
              {activeSeasonalMeta.subtitle}
            </p>
          </div>
        </button>
      </section>

      {/* 7. 3 Interactive Status Cards (Artes Dedicadas) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Nossa Árvore */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-purple-400/35 bg-purple-950/60 shadow-[0_0_20px_rgba(192,132,252,0.22)]">
              <img
                src={VISUAL_ASSETS.homeTreeCard}
                alt="Nossa Árvore do Amor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                <Trees className="w-3.5 h-3.5 text-pink-400" />
                <span>Nossa Árvore</span>
              </div>
              <div className="text-[11px] text-purple-300/80">Nível {treeLevel}</div>
              <div className="space-y-0.5">
                <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                    style={{ width: `${treeProgress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-purple-300/70 font-mono tabular-nums">
                  {treeProgress}%
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExtendedView('arvore')}
            className="w-full mt-3 min-h-[44px] py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Cuidar da árvore</span>
            <ArrowRight className="w-3 h-3 text-purple-300" />
          </button>
        </div>

        {/* Card 2: Mascote Ativo */}
        {(() => {
          const currentPetType = kitten?.petType || 'cat';
          const currentPetSpecies =
            PET_SPECIES_CATALOG.find((s) => s.type === currentPetType) || PET_SPECIES_CATALOG[0];
          const petName = kitten?.name?.trim() || currentPetSpecies.name;

          return (
            <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between text-xs text-white font-semibold mb-2">
                <div className="flex items-center gap-1.5">
                  <Cat className="w-3.5 h-3.5 text-pink-400" />
                  <span>Mascote Ativo</span>
                </div>
                <span className="text-[11px] text-pink-300 font-mono tabular-nums">Nv. {kitten?.level || 1}</span>
              </div>

              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-pink-400/35 shadow-[0_0_20px_rgba(244,114,182,0.22)] bg-purple-950/60 my-1">
                <img
                  src={VISUAL_ASSETS.homePetBanner}
                  alt={petName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-0.5 my-1.5">
                <h4 className="text-xs font-bold text-white leading-tight">
                  {kitten?.name?.trim() ? `${petName} (${currentPetSpecies.name})` : currentPetSpecies.name}
                </h4>
                <p className="text-[11px] text-purple-200/80 capitalize">
                  Humor: {kitten?.mood || 'feliz'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExtendedView('gatinho')}
                className="w-full min-h-[44px] py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Cuidar de {petName}</span>
                <ArrowRight className="w-3 h-3 text-purple-300" />
              </button>
            </div>
          );
        })()}

        {/* Card 3: Baú Misterioso 24h */}
        <div className="rounded-3xl p-4 bg-gradient-to-br from-[#160a2c]/90 to-[#070210]/95 border border-purple-500/25 shadow-lg flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between text-xs text-white font-semibold mb-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-pink-400" />
              <span>Baú Misterioso 24h</span>
            </div>
            <Heart className="w-3 h-3 text-pink-400/60" />
          </div>

          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-400/35 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-purple-950/60 my-1">
            <img
              src={VISUAL_ASSETS.homeChestCard}
              alt="Baú Misterioso"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-purple-200/80 my-2 tabular-nums">
            {isSpectator
              ? 'Disponível somente para a Samella abrir'
              : chestRemMs === 0
              ? 'Pronto para abrir e ganhar diamantes!'
              : `Próxima abertura em ${formatWheelRemaining(chestRemMs)}`}
          </p>

          <button
            type="button"
            disabled={isSpectator || chestRemMs > 0}
            onClick={() => openMysteryChest()}
            className="w-full min-h-[44px] py-2 rounded-full bg-[#200c3e]/80 hover:bg-[#321262] border border-purple-500/30 text-xs text-purple-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
          >
            <span>
              {isSpectator
                ? 'Modo Espectador'
                : chestRemMs === 0
                ? 'Abrir baú agora'
                : 'Aguardando 24h'}
            </span>
            <ArrowRight className="w-3 h-3 text-purple-300" />
          </button>
        </div>
      </section>

      {/* 8. Bottom Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div
          onClick={() => setExtendedView('conquistas')}
          className="rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 flex items-center gap-3 cursor-pointer hover:border-pink-400/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-300 border border-purple-400/25 flex-shrink-0">
            <Star className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-purple-300/70 block uppercase font-medium">
              Próxima conquista
            </span>
            <span className="text-xs font-semibold text-white truncate block">{nextAchTitle}</span>
            <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${nextAchPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-purple-300/60 font-mono tabular-nums flex-shrink-0">
            {nextAchCurrent}/{nextAchMax}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExtendedView('calendario')}
          className="text-left rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 hover:border-pink-400/40 flex items-center gap-3 cursor-pointer transition-colors"
        >
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
            <span className="text-[11px] text-pink-300 font-medium">12 de junho ♡</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsCapsuleOpen(true)}
          className="text-left rounded-2xl p-3.5 bg-[#120524]/80 border border-purple-500/20 flex items-center gap-3 cursor-pointer hover:border-pink-400/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-900/50 flex items-center justify-center text-pink-300 border border-purple-400/25 flex-shrink-0">
            <Hourglass className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-purple-300/70 block uppercase font-medium">
              Cápsulas do tempo ({timeCapsules.length})
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              {nextCapsule ? nextCapsule.title : 'Nenhuma cápsula'}
            </span>
            <span className="text-[10px] text-purple-300/75 block">
              {nextCapsule ? formatCountdownTo(nextCapsule.unlockDate) : 'Toque para abrir'}
            </span>
          </div>
        </button>
      </section>

      {/* Footer */}
      <footer className="pt-6 pb-2 text-center select-none relative">
        <div className="relative flex items-center justify-center mb-2">
          <div className="w-full border-t border-purple-500/20 max-w-md mx-auto" />
          <div className="absolute px-3 bg-[#080214] text-pink-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="font-romantic text-xl text-pink-300/80 drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
          Nosso Mundo ♡ ♡
        </p>
      </footer>

      {/* Multi-Message Time Capsule Portaled Modal */}
      {isCapsuleOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsCapsuleOpen(false)}
          >
            <div
              className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1b0933] via-[#100424] to-[#080214] border border-purple-500/40 shadow-2xl space-y-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsCapsuleOpen(false)}
                aria-label="Fechar cápsula"
                className="absolute top-4 right-4 min-w-[40px] min-h-[40px] rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-full mx-auto bg-purple-900/40 border border-purple-400/30 flex items-center justify-center text-pink-300">
                  <Hourglass className="w-7 h-7 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">
                  Cápsulas do Tempo
                </h3>
                <p className="text-xs text-purple-300/80">
                  Mensagens futuras protegidas pela data de abertura
                </p>
              </div>

              <div className="space-y-3">
                {timeCapsules.map((cap) => {
                  const unlocked = nowMs >= new Date(`${cap.unlockDate}T00:00:00`).getTime();
                  return (
                    <div
                      key={cap.id}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        unlocked
                          ? 'bg-emerald-950/30 border-emerald-400/40'
                          : 'bg-purple-950/50 border-purple-500/25'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {unlocked ? (
                              <Unlock className="w-4 h-4 text-emerald-300 shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-pink-300 shrink-0" />
                            )}
                            <span>{cap.title}</span>
                          </h4>
                          <p className="text-[11px] font-mono text-purple-300/75 mt-0.5">
                            Abre em {new Date(`${cap.unlockDate}T00:00:00`).toLocaleDateString('pt-BR')} ·{' '}
                            {formatCountdownTo(cap.unlockDate)}
                          </p>
                        </div>
                      </div>

                      {unlocked ? (
                        <div className="text-xs text-purple-100 leading-relaxed pt-1 space-y-1.5">
                          <p className="italic">"{cap.message}"</p>
                          <p className="text-right font-romantic text-base text-pink-300">
                            — {cap.author} ♡
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-purple-300/70 italic flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                          <span>Mensagem selada por {cap.author}. Só poderá ser lida na data marcada!</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsCapsuleOpen(false)}
                className="w-full min-h-[44px] rounded-full bg-gradient-to-r from-purple-700 to-pink-600 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Fechar Cápsulas
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Daily Wheel Modal */}
      {isWheelOpen && <DailyWheelModal onClose={() => setIsWheelOpen(false)} />}
    </div>
  );
};
