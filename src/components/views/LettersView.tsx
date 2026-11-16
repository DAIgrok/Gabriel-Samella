import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Heart, Sparkles, Plus, Star, Calendar, X, Feather } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Letter } from '../../types';
import { soundEngine } from '../../utils/audioSynth';

export const LettersView: React.FC = () => {
  const {
    letters,
    markLetterRead,
    toggleFavoriteLetter,
    addCustomLetter,
    selectedLetter,
    setSelectedLetter,
    config,
  } = useApp();

  const [filter, setFilter] = useState<'todas' | 'favoritas' | 'nao-lidas'>('todas');
  const [isWriting, setIsWriting] = useState(false);

  // New letter form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [authorName, setAuthorName] = useState(config.partnerName || 'Samella');

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
      excerpt: newExcerpt.trim() || `${newContent.trim().slice(0, 95)}...`,
      content: newContent.trim(),
      date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      rewardCoins: 5,
      tags: ['Especial', `De ${authorName}`],
      authorName,
    });

    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setIsWriting(false);
  };

  const readerModal = selectedLetter ? (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      onClick={() => setSelectedLetter(null)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[88vh] parchment-paper rounded-2xl sm:rounded-3xl p-6 sm:p-9 overflow-y-auto flex flex-col border-[3px] border-[#b7894a]/70 text-[#2b180c]"
      >
        {/* Ornamental double inner border */}
        <div className="pointer-events-none absolute inset-3 rounded-xl sm:rounded-2xl border border-[#8b5e2b]/35" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSelectedLetter(null)}
          aria-label="Fechar carta"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-[#3b1e0a]/15 hover:bg-[#3b1e0a]/25 text-[#3b1e0a] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wax Seal & Antique Header */}
        <div className="relative z-10 text-center pb-5 border-b border-[#8b5e2b]/30 space-y-2.5">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#9e1b32] via-[#7b1124] to-[#4a0712] border-2 border-[#d4af37]/80 shadow-[0_6px_18px_rgba(123,17,36,0.45)] flex items-center justify-center text-[#f7dca1]">
            <Heart className="w-6 h-6 fill-[#f7dca1]" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#6d4520] font-semibold">
            {selectedLetter.date}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold font-antique text-[#2a1406] leading-snug px-4">
            {selectedLetter.title}
          </h3>
        </div>

        {/* Letter Parchment Body */}
        <div className="relative z-10 my-6 font-antique text-[17px] sm:text-[19px] leading-[1.85] text-[#2b180c] whitespace-pre-line font-medium">
          {selectedLetter.content}
        </div>

        {/* Hidden Secret Surprise if any */}
        {selectedLetter.hiddenSecret && (
          <div className="relative z-10 p-3.5 rounded-xl bg-[#7b1124]/10 border border-[#7b1124]/30 text-xs sm:text-sm text-[#5e0f1e] flex items-center gap-2 my-3 font-antique">
            <Sparkles className="w-4 h-4 text-[#8b182e] flex-shrink-0" />
            <span>{selectedLetter.hiddenSecret}</span>
          </div>
        )}

        {/* Antique Handwritten Signature & Footer */}
        <div className="relative z-10 pt-5 mt-auto border-t border-[#8b5e2b]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="block text-[11px] uppercase tracking-widest text-[#6d4520]">
              Selado com todo amor por
            </span>
            <span className="font-romantic text-3xl text-[#6e1225] leading-none block mt-1">
              {selectedLetter.authorName || config.myName} ♡
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            className="px-6 min-h-[42px] rounded-xl bg-[#6e1225] hover:bg-[#881830] text-[#f9e7c5] text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer"
          >
            Guardar no Coração
          </button>
        </div>
      </motion.div>
    </div>
  ) : null;

  const writeModal = isWriting ? (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={() => setIsWriting(false)}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg bg-[#14082c] border border-pink-400/35 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Feather className="w-4 h-4 text-pink-400" />
            <span>Escrever Carta Antiga</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsWriting(false)}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateLetter} className="space-y-4">
          <div>
            <label className="text-xs text-purple-300 block mb-1.5">Quem está assinando?</label>
            <div className="grid grid-cols-2 gap-2">
              {[config.partnerName || 'Samella', config.myName || 'Gabriel'].map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => setAuthorName(person)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    authorName === person
                      ? 'bg-pink-600/35 border-pink-400 text-white shadow'
                      : 'glass-panel border-purple-500/25 text-purple-300 hover:text-white'
                  }`}
                >
                  {person} ♡
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">Título da Carta</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Para ler quando bater a saudade..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">Frase de Capa (Opcional)</label>
            <input
              type="text"
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              placeholder="Uma prévia carinhosa no envelope..."
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
              placeholder="Escreva tudo o que sente no coração..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="px-4 py-2 rounded-xl glass-panel text-purple-300 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Selar Pergaminho ♡
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-semibold text-pink-300 mb-1">
          <Mail className="w-3.5 h-3.5" />
          <span>Pergaminhos & Cartas de Amor</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Palavras que guardo para você ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Toque em um envelope selado para abrir o pergaminho e receber +5 💎
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
              onClick={() => setFilter(tab.id as 'todas' | 'favoritas' | 'nao-lidas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
          className="flex items-center gap-1.5 px-4 min-h-[40px] py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Escrever Carta</span>
        </button>
      </div>

      {/* Larger Antique Envelopes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredLetters.map((letter) => (
          <motion.div
            key={letter.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleOpenLetter(letter)}
            className={`glass-card-glow rounded-3xl p-6 min-h-[215px] flex flex-col justify-between border transition-all relative overflow-hidden group cursor-pointer ${
              letter.read
                ? 'border-purple-500/30 hover:border-pink-400/40'
                : 'border-amber-300/45 shadow-[0_0_24px_rgba(244,114,182,0.22)]'
            }`}
          >
            {/* Subtle wax seal watermark */}
            <div className="pointer-events-none absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-700/15 to-amber-400/10 blur-xl" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      letter.read
                        ? 'bg-purple-900/50 border-purple-500/30 text-purple-200'
                        : 'bg-gradient-to-br from-[#8f182e] to-[#580c1b] border-amber-300/60 text-amber-200 shadow-lg'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-300/80 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-pink-300" />
                      {letter.date}
                    </span>
                    {!letter.read ? (
                      <span className="text-[11px] text-amber-300 font-bold">
                        Selo Intacto (+{letter.rewardCoins} 💎)
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-300/60">
                        Assinado por {letter.authorName || config.myName}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteLetter(letter.id);
                  }}
                  className="p-2 text-purple-300 hover:text-amber-300 transition-colors cursor-pointer"
                  aria-label="Favoritar carta"
                >
                  <Star
                    className={`w-4 h-4 ${
                      letter.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-purple-400/60'
                    }`}
                  />
                </button>
              </div>

              {/* Letter Title & Excerpt */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-antique tracking-wide group-hover:text-pink-200 transition-colors">
                {letter.title}
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/80 line-clamp-3 leading-relaxed">
                {letter.excerpt}
              </p>
            </div>

            {/* Tags & Open prompt */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-500/15">
              <div className="flex items-center gap-1.5 flex-wrap">
                {letter.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-purple-950/70 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <span className="text-xs font-bold text-pink-300 group-hover:translate-x-1 transition-transform">
                Ler Pergaminho →
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>{readerModal}</AnimatePresence>,
          document.body
        )}

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>{writeModal}</AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
