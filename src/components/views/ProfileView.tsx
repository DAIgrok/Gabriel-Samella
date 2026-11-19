import React from 'react';
import {
  Heart,
  Trophy,
  Image as ImageIcon,
  Mail,
  Lock,
  Sparkles,
  Calendar,
  Clock,
  Music,
  Trees,
  Hourglass,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { getCouplePhotoUrl, REAL_PHOTO_SLOTS } from '../../data/mediaAssets';
import { DiamondGemIcon } from '../icons/CustomIcons';

export const ProfileView: React.FC = () => {
  const {
    config,
    coins,
    letters,
    photos,
    achievements,
    setIsLoggedIn,
    setExtendedView,
    setSelectedPhoto,
    currentSong,
    treeState,
    loveTree,
    isSpectator,
  } = useApp();

  const activeTree = treeState || loveTree;
  const treeLevel = activeTree?.level ?? 1;
  const treeStageName = activeTree?.stageName || 'Semente do Amor';

  const readLettersCount = letters.filter((l) => l.read).length;
  const favPhotosCount = photos.filter((p) => p.isFavorite).length;
  const unlockedAchCount = achievements.filter((a) => a.unlocked).length;

  // Real days calculation
  const startMs = new Date(config.anniversaryDate || '2023-06-12T00:00:00').getTime();
  const nowMs = new Date().getTime();
  const daysTogether = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 pb-28 max-w-2xl mx-auto"
    >
      {/* 1. Romantic Profile Hero Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#160a2c]/95 via-[#0e051c]/95 to-[#070210]/95 border border-purple-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {isSpectator && (
          <div className="mb-2 px-3 py-1 rounded-full bg-purple-900/60 border border-pink-400/40 text-[11px] font-semibold text-pink-200">
            Modo Espectador — Gabriel (Visualização, Chat, Cartas, Fotos & Músicas)
          </div>
        )}

        {/* Real Couple Photo Avatar */}
        <div className="relative my-2">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 shadow-[0_0_30px_rgba(244,114,182,0.45)]">
            <img
              src={getCouplePhotoUrl(photos, 2, REAL_PHOTO_SLOTS.profileAvatar)}
              alt="Gabriel e Samella"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/1.jpg';
              }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-[#0e051c] flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* Couple Names */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 font-display flex items-center justify-center gap-2">
          <span>{config.myName || 'Gabriel'}</span>
          <span className="text-pink-400 text-xl font-romantic">♡</span>
          <span>{config.partnerName || 'Samella'}</span>
        </h2>

        {/* Relationship Subtitle */}
        <p className="text-xs sm:text-sm text-purple-200/80 mt-1 flex items-center gap-1.5 justify-center">
          <Calendar className="w-3.5 h-3.5 text-pink-400" />
          <span>Juntos e abençoados desde 12 de junho de 2023</span>
        </p>

        {/* Days & Diamonds Badges */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center mt-4">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-xs font-semibold text-purple-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>{daysTogether} dias de amor</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-semibold text-pink-200 flex items-center gap-1.5">
            <DiamondGemIcon className="w-4 h-4 text-pink-300" />
            <span>{coins} Diamantes</span>
          </div>
        </div>
      </div>

      {/* 2. Key Relationship Landmarks */}
      <div className="rounded-3xl p-5 bg-[#120524]/85 border border-purple-500/25 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          <span>Nosso Universo em Números & Datas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Aniversário de Namoro */}
          <div className="rounded-2xl p-3.5 bg-purple-950/40 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300 flex-shrink-0">
              <Calendar className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 block uppercase font-medium">Aniversário de Namoro</span>
              <span className="text-xs font-semibold text-white">12 de Junho de 2023</span>
            </div>
          </div>

          {/* Cápsula do Tempo */}
          <div className="rounded-2xl p-3.5 bg-purple-950/40 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 flex-shrink-0">
              <Hourglass className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 block uppercase font-medium">Cápsula do Tempo</span>
              <span className="text-xs font-semibold text-white">25 de Dezembro de 2028</span>
            </div>
          </div>

          {/* Música Atual */}
          <div className="rounded-2xl p-3.5 bg-purple-950/40 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 flex-shrink-0">
              <Music className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-purple-300/70 block uppercase font-medium">Música Favorita</span>
              <span className="text-xs font-semibold text-white truncate block">
                {currentSong ? `${currentSong.title} (${currentSong.artist})` : 'Nenhuma música adicionada ainda ♡'}
              </span>
            </div>
          </div>

          {/* Árvore do Amor */}
          <div className="rounded-2xl p-3.5 bg-purple-950/40 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 flex-shrink-0">
              <Trees className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 block uppercase font-medium">Nossa Árvore</span>
              <span className="text-xs font-semibold text-white">Nível {treeLevel} · {treeStageName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real Progress Stats Grid */}
      <div className="rounded-3xl p-5 bg-[#120524]/85 border border-purple-500/25 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Atividades Realizadas no App</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Cartas Lidas */}
          <div
            onClick={() => setExtendedView('cartas')}
            className="rounded-2xl p-3.5 bg-purple-950/30 border border-purple-500/20 flex flex-col justify-between cursor-pointer hover:border-pink-400/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-300">
                <Mail className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300/40" />
            </div>
            <div className="mt-2">
              <span className="text-[10px] text-purple-300/70 block">Cartas Lidas</span>
              <span className="text-sm font-bold text-white">
                {readLettersCount} / {letters.length}
              </span>
            </div>
          </div>

          {/* Fotos Favoritas */}
          <div
            onClick={() => setExtendedView('fotos')}
            className="rounded-2xl p-3.5 bg-purple-950/30 border border-purple-500/20 flex flex-col justify-between cursor-pointer hover:border-purple-400/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <ImageIcon className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300/40" />
            </div>
            <div className="mt-2">
              <span className="text-[10px] text-purple-300/70 block">Memórias Salvas</span>
              <span className="text-sm font-bold text-white">
                {favPhotosCount} / {photos.length}
              </span>
            </div>
          </div>

          {/* Conquistas */}
          <div
            onClick={() => setExtendedView('conquistas')}
            className="rounded-2xl p-3.5 bg-purple-950/30 border border-purple-500/20 flex flex-col justify-between cursor-pointer hover:border-amber-400/40 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Trophy className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300/40" />
            </div>
            <div className="mt-2">
              <span className="text-[10px] text-purple-300/70 block">Conquistas</span>
              <span className="text-sm font-bold text-white">
                {unlockedAchCount} / {achievements.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mini Photos Preview */}
      <div className="rounded-3xl p-5 bg-[#120524]/85 border border-purple-500/25 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Nossas Memórias Especiais</span>
          </h3>
          <button
            onClick={() => setExtendedView('fotos')}
            className="text-xs text-pink-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Álbum</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {REAL_PHOTO_SLOTS.homeMemories.map((fallbackSrc, idx) => {
            const photoItem = photos[idx];
            const src = getCouplePhotoUrl(photos, idx, fallbackSrc);
            return (
              <div
                key={idx}
                onClick={() => {
                  if (photoItem) setSelectedPhoto(photoItem);
                  setExtendedView('fotos');
                }}
                className="aspect-square rounded-2xl overflow-hidden border border-purple-500/30 bg-purple-950/40 cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={src}
                  alt={photoItem?.title || `Memória ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/assets/img/${idx + 1}.jpg`;
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Security Lock Control */}
      <div className="pt-1">
        <button
          onClick={() => setIsLoggedIn(false)}
          className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-[#1b0a33] hover:bg-[#28114c] border border-purple-500/30 text-purple-200 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Lock className="w-4 h-4 text-pink-400" />
          <span>Bloquear Aplicativo com Senha</span>
        </button>
      </div>
    </motion.div>
  );
};
