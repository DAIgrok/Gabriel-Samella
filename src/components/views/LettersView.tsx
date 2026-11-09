import React, { useState } from 'react';
import { Mail, Heart, Sparkles, Plus, Lock, CheckCircle2, Star, Calendar, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Letter } from '../../types';
import { soundEngine } from '../../utils/audioSynth';

export const LettersView: React.FC = () => {
  const { letters, markLetterRead, toggleFavoriteLetter, addCustomLetter, selectedLetter, setSelectedLetter, config } = useApp();
  const [filter, setFilter] = useState<'todas' | 'favoritas' | 'nao-lidas'>('todas');
  const [isWriting, setIsWriting] = useState(false);

  // New letter form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');

  const filteredLetters = letters.filter((l) => {
    if (filter === 'favoritas') return l.isFavorite;
    if (filter === 'nao-lidas') return !l.read;
    return true;
  });

  const handleOpenLetter = (letter: Letter) => {
    soundEngine.playEnvelopeOpen();
    markLetterRead(letter.id);
    setSelectedLetter(letter);
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addCustomLetter({
      title: newTitle.trim(),
      excerpt: newExcerpt.trim() || newContent.slice(0, 80) + '...',
      content: newContent.trim(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      rewardCoins: 15,
      tags: ['Especial', 'Nova Carta'],
    });

    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setIsWriting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-semibold text-pink-300 mb-1">
          <Mail className="w-3.5 h-3.5" />
          <span>Cartas de Amor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Palavras que guardo para você ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Cada envelope contém um pedacinho do meu coração e uma recompensa em diamantes.
        </p>
      </div>

      {/* Filter Tabs & Add Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'favoritas', label: 'Favoritas ⭐' },
            { id: 'nao-lidas', label: 'Não Lidas 💌' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-pink-500/40 text-pink-200 shadow-md border border-pink-400/30'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsWriting(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Carta</span>
        </button>
      </div>

      {/* Letters Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLetters.map((letter) => (
          <motion.div
            key={letter.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card-glow rounded-3xl p-5 border transition-all relative overflow-hidden group cursor-pointer ${
              letter.read
                ? 'border-purple-500/25'
                : 'border-pink-400/40 shadow-[0_0_20px_rgba(244,114,182,0.2)]'
            }`}
            onClick={() => handleOpenLetter(letter)}
          >
            {/* Envelope Seal Ribbon Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                    letter.read
                      ? 'bg-purple-900/50 text-purple-300'
                      : 'bg-pink-500/30 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.5)] border border-pink-400/40'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-300/70 block flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {letter.date}
                  </span>
                  {!letter.read && (
                    <span className="text-[10px] text-pink-300 font-semibold animate-pulse">
                      Envelope Selado (+{letter.rewardCoins} 💎)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteLetter(letter.id);
                }}
                className="p-1.5 text-purple-300 hover:text-pink-400 transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    letter.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-purple-400/60'
                  }`}
                />
              </button>
            </div>

            {/* Letter Title & Excerpt */}
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-pink-300 transition-colors">
              {letter.title}
            </h3>
            <p className="text-xs text-purple-200/80 line-clamp-2 leading-relaxed">
              {letter.excerpt}
            </p>

            {/* Tags & Status */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-500/15">
              <div className="flex items-center gap-1.5 flex-wrap">
                {letter.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-purple-950/70 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <span className="text-xs font-semibold text-pink-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Abrir carta →
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Letter Reading Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg max-h-[85vh] bg-[#120726] border border-pink-400/40 rounded-3xl p-6 md:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-y-auto flex flex-col"
            >
              {/* Seal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedLetter.title}</h3>
                    <p className="text-xs text-purple-300/70">{selectedLetter.date}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLetter(null)}
                  className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Letter Body - Elegant Stationery Presentation */}
              <div className="my-6 space-y-4 text-purple-100 text-sm md:text-base leading-relaxed whitespace-pre-line font-light">
                {selectedLetter.content}
              </div>

              {/* Hidden Secret Surprise if any */}
              {selectedLetter.hiddenSecret && (
                <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-pink-400/30 text-xs text-pink-200 flex items-center gap-2 my-2">
                  <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 animate-spin" />
                  <span>{selectedLetter.hiddenSecret}</span>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-300">
                <span>Com todo meu amor para {config.partnerName} ♡</span>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-2 rounded-xl bg-pink-500/30 hover:bg-pink-500/50 text-pink-200 font-semibold border border-pink-400/30"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Write New Letter Modal */}
      <AnimatePresence>
        {isWriting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriting(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-[#14082c] border border-purple-400/30 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-400" />
                  <span>Escrever Carta de Amor</span>
                </h3>
                <button
                  onClick={() => setIsWriting(false)}
                  className="w-7 h-7 rounded-full glass-panel flex items-center justify-center text-purple-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreateLetter} className="space-y-4">
                <div>
                  <label className="text-xs text-purple-300 block mb-1">Título da Carta</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Para abrir quando estiver com saudade..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 block mb-1">Pequeno Resumo / Frase de Capa</label>
                  <input
                    type="text"
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="Ex: Palavras sinceras para alegrar seu coração..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 block mb-1">Conteúdo da Carta</label>
                  <textarea
                    required
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Escreva seus sentimentos mais verdadeiros..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWriting(false)}
                    className="px-4 py-2 rounded-xl glass-panel text-purple-300 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md"
                  >
                    Guardar e Selar Envelope ♡
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
