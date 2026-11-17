import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  Heart,
  Sparkles,
  Plus,
  Star,
  Calendar,
  X,
  Feather,
  Lock,
  Trash2,
  ArrowRight,
  Archive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CouplePerson, Letter } from '../../types';
import { soundEngine } from '../../utils/audioSynth';
import { WaxSealIcon, DiamondGemIcon } from '../icons/CustomIcons';
import { LEGACY_ARCHIVE_LETTERS } from '../../data/initialData';

export const LettersView: React.FC = () => {
  const {
    letters,
    markLetterRead,
    toggleFavoriteLetter,
    sendTwoWayLetter,
    deleteLetter,
    selectedLetter,
    setSelectedLetter,
    config,
    legacyResetBackup,
  } = useApp();

  const [filter, setFilter] = useState<
    'todas' | 'para-samella' | 'para-gabriel' | 'favoritas' | 'nao-lidas' | 'privadas'
  >('todas');
  const [isWriting, setIsWriting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Two-way letter composer state
  const [sender, setSender] = useState<CouplePerson>('Gabriel');
  const recipient: CouplePerson = sender === 'Gabriel' ? 'Samella' : 'Gabriel';
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const filteredLetters = letters.filter((l) => {
    if (filter === 'para-samella') return (l.recipient || 'Samella') === 'Samella';
    if (filter === 'para-gabriel') return l.recipient === 'Gabriel';
    if (filter === 'favoritas') return l.isFavorite;
    if (filter === 'nao-lidas') return !l.read;
    if (filter === 'privadas') return Boolean(l.isPrivate);
    return true;
  });

  const archivedLetters =
    legacyResetBackup?.letters && legacyResetBackup.letters.length > 0
      ? legacyResetBackup.letters
      : LEGACY_ARCHIVE_LETTERS;

  const handleOpenLetter = (letter: Letter) => {
    soundEngine.playEnvelopeOpen();
    markLetterRead(letter.id);
    setSelectedLetter(letter);
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    sendTwoWayLetter({
      sender,
      recipient,
      title: newTitle.trim(),
      excerpt: newExcerpt.trim() || undefined,
      content: newContent.trim(),
      isPrivate,
      tags: isPrivate ? ['Privada', `De ${sender}`] : [`Para ${recipient}`, `De ${sender}`],
    });

    setNewTitle('');
    setNewExcerpt('');
    setNewContent('');
    setIsPrivate(false);
    setIsWriting(false);
  };

  const formatSentTimestamp = (letter: Letter) => {
    if (letter.sentAt) {
      const parsed = new Date(letter.sentAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    return letter.date;
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

        {/* Close & Delete Buttons */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => deleteLetter(selectedLetter.id)}
            aria-label="Apagar carta"
            title="Apagar carta"
            className="w-9 h-9 rounded-full bg-[#7b1124]/15 hover:bg-[#7b1124]/30 text-[#7b1124] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            aria-label="Fechar carta"
            className="w-9 h-9 rounded-full bg-[#3b1e0a]/15 hover:bg-[#3b1e0a]/25 text-[#3b1e0a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wax Seal & Antique Header */}
        <div className="relative z-10 text-center pb-5 border-b border-[#8b5e2b]/30 space-y-2.5">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#9e1b32] via-[#7b1124] to-[#4a0712] border-2 border-[#d4af37]/80 shadow-[0_6px_18px_rgba(123,17,36,0.45)] flex items-center justify-center text-[#f7dca1]">
            <WaxSealIcon className="w-7 h-7" />
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#6d4520] font-semibold">
            <span>De {selectedLetter.sender || selectedLetter.authorName || config.myName}</span>
            <ArrowRight className="w-3 h-3" />
            <span>Para {selectedLetter.recipient || config.partnerName}</span>
            {selectedLetter.isPrivate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#7b1124]/15 text-[#6e1225]">
                <Lock className="w-2.5 h-2.5" />
                Privada
              </span>
            )}
          </div>

          <p className="text-[11px] tracking-wide text-[#6d4520]/85 tabular-nums">
            {formatSentTimestamp(selectedLetter)}
          </p>

          <h3 className="text-xl sm:text-2xl font-bold font-antique text-[#2a1406] leading-snug px-4">
            {selectedLetter.title}
          </h3>
        </div>

        {/* Letter Parchment Body */}
        <div className="relative z-10 my-6 font-antique text-[17px] sm:text-[19px] leading-[1.85] text-[#2b180c] whitespace-pre-line font-medium">
          {selectedLetter.content}
        </div>

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
              {selectedLetter.sender || selectedLetter.authorName || config.myName} ♡
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            className="px-6 min-h-[44px] rounded-xl bg-[#6e1225] hover:bg-[#881830] text-[#f9e7c5] text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer"
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
        className="relative z-10 w-full max-w-lg bg-[#14082c] border border-pink-400/35 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Feather className="w-4 h-4 text-pink-400" />
            <span>Nova Carta Real do Casal</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsWriting(false)}
            aria-label="Fechar"
            className="min-w-[40px] min-h-[40px] rounded-full glass-panel flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateLetter} className="space-y-4">
          <div>
            <label className="text-xs text-purple-300 block mb-1.5">
              Quem está escrevendo agora?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Gabriel', 'Samella'] as CouplePerson[]).map((person) => {
                const target = person === 'Gabriel' ? 'Samella' : 'Gabriel';
                const active = sender === person;
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => setSender(person)}
                    className={`min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                      active
                        ? 'bg-pink-600/35 border-pink-400 text-white shadow'
                        : 'glass-panel border-purple-500/25 text-purple-300 hover:text-white'
                    }`}
                  >
                    <span>Sou {person}</span>
                    <span className="text-[10px] font-normal text-pink-200/80">
                      Enviar para {target}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">Título da Carta</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`Ex: Para ${recipient} ler hoje à noite...`}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">Resumo do Envelope (Opcional)</label>
            <input
              type="text"
              value={newExcerpt}
              onChange={(e) => setNewExcerpt(e.target.value)}
              placeholder="Uma prévia carinhosa na capa do envelope..."
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="text-xs text-purple-300 block mb-1">
              Carta Completa (sem limite de palavras)
            </label>
            <textarea
              required
              rows={7}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`Escreva do coração para ${recipient}...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-pink-400 resize-y min-h-[150px]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            className={`w-full min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
              isPrivate
                ? 'bg-rose-950/50 border-rose-400/50 text-rose-200'
                : 'bg-purple-950/50 border-purple-500/25 text-purple-200/80'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-300" />
              <span>Marcar como carta íntima / especial</span>
            </span>
            <span className="text-[11px] font-bold">{isPrivate ? 'Sim' : 'Não'}</span>
          </button>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="min-h-[44px] px-4 rounded-xl glass-panel text-purple-300 text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Enviar para {recipient} ♡
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  ) : null;

  const archiveModal = showArchiveModal ? (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={() => setShowArchiveModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-5 bg-[#120628] border border-purple-500/35 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-pink-300" />
              <span>Arquivo Anterior Guardado ({archivedLetters.length})</span>
            </h3>
            <p className="text-[11px] text-purple-300/75 mt-0.5">
              Backup preservado com segurança antes da limpeza para cartas reais.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowArchiveModal(false)}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/10 text-purple-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {archivedLetters.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-purple-950/55 border border-purple-500/25 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <span className="text-[10px] text-purple-300/70 shrink-0">{item.date}</span>
              </div>
              <p className="text-[11px] text-purple-200/80 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 pb-32 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-semibold text-pink-300 mb-1">
          <WaxSealIcon className="w-3.5 h-3.5" />
          <span>Correio de Amor · Gabriel ↔ Samella</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Nossas Cartas Reais ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/75 flex items-center justify-center gap-1.5 flex-wrap">
          <span>Escrevam um para o outro com sincronização em tempo real. Abrir uma carta nova rende +5</span>
          <DiamondGemIcon className="w-3.5 h-3.5 inline-block" />
        </p>
      </div>

      {/* Filter Tabs & Compose Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-purple-500/20 overflow-x-auto max-w-full">
          {(
            [
              { id: 'todas', label: `Todas (${letters.length})` },
              { id: 'para-samella', label: 'Para Samella' },
              { id: 'para-gabriel', label: 'Para Gabriel' },
              { id: 'nao-lidas', label: 'Não Lidas' },
              { id: 'favoritas', label: 'Favoritas' },
              { id: 'privadas', label: 'Privadas' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer tabular-nums ${
                filter === tab.id
                  ? 'bg-pink-500/40 text-pink-100 shadow-md border border-pink-400/30'
                  : 'text-purple-300/75 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="min-h-[42px] px-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Consultar backup das cartas anteriores"
          >
            <Archive className="w-3.5 h-3.5 text-pink-300" />
            <span>Arquivo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-1.5 px-4 min-h-[42px] py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Escrever Carta</span>
          </button>
        </div>
      </div>

      {/* Empty State or Envelopes Grid */}
      {filteredLetters.length === 0 ? (
        <div className="rounded-3xl p-8 bg-gradient-to-br from-[#17092e]/90 to-[#0a0217]/95 border border-purple-500/25 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/15 border border-pink-400/35 flex items-center justify-center mx-auto text-pink-300">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {letters.length === 0
              ? 'Caixa de Cartas Pronta para Vocês Dois'
              : 'Nenhuma carta neste filtro'}
          </h3>
          <p className="text-xs text-purple-200/75 max-w-md mx-auto leading-relaxed">
            {letters.length === 0
              ? 'Comecem escrevendo declarações reais de Gabriel para Samella ou de Samella para Gabriel. Tudo fica salvo na nuvem.'
              : 'Troque o filtro acima ou escreva uma nova carta especial agora.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => setIsWriting(true)}
              className="min-h-[44px] px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Feather className="w-4 h-4" />
              <span>Escrever Primeira Carta</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredLetters.map((letter) => (
            <motion.div
              key={letter.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleOpenLetter(letter)}
              className={`glass-card-glow rounded-3xl p-5 sm:p-6 min-h-[210px] flex flex-col justify-between border transition-all relative overflow-hidden group cursor-pointer ${
                letter.read
                  ? 'border-purple-500/30 hover:border-pink-400/40'
                  : 'border-amber-300/45 shadow-[0_0_24px_rgba(244,114,182,0.22)]'
              }`}
            >
              <div className="pointer-events-none absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-tr from-rose-700/15 to-amber-400/10 blur-xl" />

              <div>
                <div className="flex items-center justify-between mb-3.5 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
                        letter.read
                          ? 'bg-purple-900/50 border-purple-500/30 text-purple-200'
                          : 'bg-gradient-to-br from-[#8f182e] to-[#580c1b] border-amber-300/60 text-amber-200 shadow-lg'
                      }`}
                    >
                      <WaxSealIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-purple-200/85 font-semibold flex items-center gap-1 truncate">
                        <span>{letter.sender || letter.authorName || config.myName}</span>
                        <ArrowRight className="w-3 h-3 text-pink-400 shrink-0" />
                        <span>{letter.recipient || config.partnerName}</span>
                      </span>
                      <span className="text-[10px] text-purple-300/75 flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3 text-pink-300 shrink-0" />
                        <span className="truncate">{formatSentTimestamp(letter)}</span>
                      </span>
                      {!letter.read && (
                        <span className="text-[10px] text-amber-300 font-bold inline-flex items-center gap-1 mt-0.5">
                          <span>Nova carta (+{letter.rewardCoins}</span>
                          <DiamondGemIcon className="w-3 h-3" />
                          <span>)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteLetter(letter.id);
                      }}
                      className="min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center text-purple-300 hover:text-amber-300 transition-colors cursor-pointer"
                      aria-label="Favoritar carta"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          letter.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-purple-400/60'
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLetter(letter.id);
                      }}
                      className="min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center text-purple-300/50 hover:text-rose-300 transition-colors cursor-pointer"
                      aria-label="Remover carta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-antique tracking-wide group-hover:text-pink-200 transition-colors">
                  {letter.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200/80 line-clamp-3 leading-relaxed">
                  {letter.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-500/15">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {letter.isPrivate && (
                    <span className="text-[10px] bg-rose-950/70 text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-400/30 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Privada
                    </span>
                  )}
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
      )}

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

      {typeof document !== 'undefined' &&
        createPortal(archiveModal, document.body)}
    </motion.div>
  );
};
