import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { Navigation } from './components/Navigation';
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
import { EasterEggModal } from './components/EasterEggModal';
import { HeartRain } from './components/HeartRain';
import { Sidebar } from './components/Sidebar';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isLoading, isLocked, extendedView, setExtendedView, toastMessage } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isLocked) {
    return <LoginScreen />;
  }

  return (
    <div className="relative min-h-screen text-slate-100 font-sans selection:bg-pink-500/30 selection:text-pink-200 bg-[#070210] flex overflow-x-hidden">
      {/* Heart Rain Overlay */}
      <HeartRain />

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-panel-interactive text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/30 shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </button>

            <span className="text-xs font-script text-pink-300">Nosso Mundo ♡</span>
          </div>
        )}

        {/* Dynamic View Router with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={extendedView}
            initial={{ opacity: 0, filter: 'blur(8px)', y: 5 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(8px)', y: -5 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {extendedView === 'inicio' && <HomeView />}
            {extendedView === 'cartas' && <LettersView />}
            {extendedView === 'fotos' && <PhotosView />}
            {extendedView === 'musica' && <MusicView />}
            {extendedView === 'frases' && <PhrasesView />}
            {extendedView === 'arvore' && <LoveTreeView />}
            {extendedView === 'conquistas' && <AchievementsView />}
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

      {/* Global Easter Egg Modal */}
      <EasterEggModal />

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1c0836]/95 border border-pink-400/50 text-white text-xs font-semibold shadow-[0_0_25px_rgba(244,114,182,0.5)] backdrop-blur-md flex items-center gap-2 max-w-[90vw]"
          >
            {toastMessage.icon ? (
              <span className="text-base">{toastMessage.icon}</span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            )}
            <span>{toastMessage.text}</span>
            {toastMessage.reward && toastMessage.reward > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40 text-[10px] font-mono">
                +{toastMessage.reward} 💎
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
