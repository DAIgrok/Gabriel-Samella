import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { Navigation } from './components/Navigation';
import { FloatingCoupleChat } from './components/FloatingCoupleChat';
import { HomeView } from './components/HomeView';
import { LettersView } from './components/views/LettersView';
import { PhotosView } from './components/views/PhotosView';
import { MusicView } from './components/views/MusicView';
import { PhrasesView } from './components/views/PhrasesView';
import { LoveTreeView } from './components/views/LoveTreeView';
import { AchievementsView } from './components/views/AchievementsView';
import { GamesView } from './components/views/GamesView';
import { KittenView } from './components/views/KittenView';
import { StoreView } from './components/views/StoreView';
import { ChatView } from './components/views/ChatView';
import { ProfileView } from './components/views/ProfileView';
import { GoalsView } from './components/views/GoalsView';
import { CalendarView } from './components/views/CalendarView';
import { EasterEggModal } from './components/EasterEggModal';
import { HeartRain } from './components/HeartRain';
import { AmbientParticlesCanvas } from './components/AmbientParticlesCanvas';
import { SeasonalDecorOverlay } from './components/SeasonalDecorOverlay';
import { Sidebar } from './components/Sidebar';
import { DreamHouseView } from './components/views/DreamHouseView';
import { AquariumView } from './components/views/AquariumView';
import { MissionsView } from './components/views/MissionsView';
import { AdminSettingsModal } from './components/views/AdminSettingsModal';
import { PhotoVisualizerModal } from './components/PhotoVisualizerModal';
import { PermissionsModal } from './components/PermissionsModal';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import { DiamondGemIcon, VectorGlyphIcon } from './components/icons/CustomIcons';

const MainAppContent: React.FC = () => {
  const {
    isLoading,
    isLocked,
    extendedView,
    setExtendedView,
    toastMessage,
    inAppChatToast,
    dismissInAppChatToast,
    isSettingsOpen,
    setIsSettingsOpen,
    selectedPhoto,
    setSelectedPhoto,
    photos,
  } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isLocked) {
    return <LoginScreen />;
  }

  return (
    <div className="nm-app-shell relative min-h-screen text-slate-100 font-sans selection:bg-pink-500/30 selection:text-pink-200 bg-[#070210] flex overflow-x-hidden">
      {/* Heart Rain Overlay */}
      <HeartRain />

      {/* Seasonal Physics Particle Canvas (Snow, Ember Mist, Petals, Confetti, Fireflies) */}
      <AmbientParticlesCanvas />

      {/* Interactive Seasonal Decor Overlay (Halloween Pumpkins, Valentine Rose, Anniversary Banner) */}
      <SeasonalDecorOverlay />

      {/* Dynamic Romantic Memory Slideshow Background */}
      <BackgroundSlideshow />

      {/* Persistent Left Sidebar on Desktop matching reference screenshot */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 min-w-0 min-h-screen px-3 sm:px-6 md:px-8 pt-3 md:pt-4 max-w-5xl mx-auto">
        {/* If inside a sub-module, render top back button bar */}
        {extendedView !== 'inicio' && (
          <div className="flex items-center justify-between py-2 mb-2">
            <button
              onClick={() => setExtendedView('inicio')}
              className="flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-2xl glass-panel-interactive text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>

            <span className="text-sm font-script text-pink-300">Nosso Mundo ♡</span>
          </div>
        )}

        {/* Dynamic View Router with smooth compositor transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={extendedView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {extendedView === 'inicio' && <HomeView />}
            {extendedView === 'cartas' && <LettersView />}
            {extendedView === 'fotos' && <PhotosView />}
            {extendedView === 'musica' && <MusicView />}
            {extendedView === 'frases' && <PhrasesView />}
            {extendedView === 'arvore' && <LoveTreeView />}
            {extendedView === 'casa' && <DreamHouseView />}
            {extendedView === 'aquario' && <AquariumView />}
            {extendedView === 'missoes' && <MissionsView />}
            {extendedView === 'conquistas' && <AchievementsView />}
            {extendedView === 'metas' && <GoalsView />}
            {extendedView === 'calendario' && <CalendarView />}
            {extendedView === 'jogos' && <GamesView />}
            {extendedView === 'gatinho' && <KittenView />}
            {extendedView === 'loja' && <StoreView />}
            {extendedView === 'conversas' && <ChatView />}
            {(extendedView === 'perfil' || extendedView === 'config') && (
              <ProfileView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Bottom Floating Navigation & Side Drawer */}
      <Navigation />

      {/* Floating Couple Chat (hidden when already in full ChatView) */}
      {extendedView !== 'conversas' && <FloatingCoupleChat />}

      {/* Global Easter Egg Modal */}
      <EasterEggModal />

      {/* Global Settings Modal (Creator PIN 2010 or Gabriel Spectator) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <AdminSettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}
      </AnimatePresence>

      {/* Global Device Permissions Modal */}
      <PermissionsModal />

      {/* Global Photo Visualizer Modal */}
      <PhotoVisualizerModal
        photo={selectedPhoto}
        photos={photos}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={(p) => setSelectedPhoto(p)}
      />

      {/* WhatsApp-style 3-second clickable Chat Notification Banner */}
      <AnimatePresence>
        {inAppChatToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -32, scale: 0.96 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm rounded-2xl bg-[#190830]/95 border border-pink-400/50 shadow-[0_12px_36px_rgba(236,72,153,0.45)] backdrop-blur-xl p-3 flex items-center gap-3 cursor-pointer"
            onClick={() => {
              dismissInAppChatToast();
              setExtendedView('conversas');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 border border-white/25">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-pink-200 truncate">
                  {inAppChatToast.senderName || (inAppChatToast.sender === 'me' ? 'Gabriel' : 'Samella')}
                </span>
                <span className="text-[10px] text-purple-300/70">agora</span>
              </div>
              <p className="text-xs text-white/90 truncate">
                {inAppChatToast.msgType === 'audio'
                  ? 'Mensagem de voz'
                  : inAppChatToast.msgType === 'image'
                  ? 'Enviou uma fotografia'
                  : inAppChatToast.text}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissInAppChatToast();
              }}
              className="p-1 text-purple-300/70 hover:text-white cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast Notification (Vector SVG icons, zero emojis) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1c0836]/95 border border-pink-400/50 text-white text-xs font-semibold shadow-[0_0_25px_rgba(244,114,182,0.5)] backdrop-blur-md flex items-center gap-2 max-w-[90vw]"
          >
            <VectorGlyphIcon name={toastMessage.icon || 'sparkles'} className="w-4 h-4 text-pink-300 flex-shrink-0" />
            <span>{toastMessage.text}</span>
            {toastMessage.reward && toastMessage.reward > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40 text-[10px] font-mono inline-flex items-center gap-1">
                +{toastMessage.reward}
                <DiamondGemIcon className="w-3 h-3 text-pink-300" />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
