import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CheckCheck,
  Heart,
  Maximize2,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audioSynth';

export const FloatingCoupleChat: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    config,
    isFloatingChatOpen,
    setIsFloatingChatOpen,
    unreadChatCount,
    extendedView,
    setExtendedView,
    triggerHeartExplosion,
    isSpectator,
    onlinePeers,
  } = useApp();

  const [senderRole, setSenderRole] = useState<'eu' | 'ela'>(isSpectator ? 'eu' : 'ela');
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const effectiveRole: 'eu' | 'ela' = isSpectator ? 'eu' : senderRole;
  const peerRoleKey: 'Gabriel' | 'Samella' = isSpectator ? 'Samella' : 'Gabriel';
  const isPeerOnline = Boolean(onlinePeers?.[peerRoleKey]);
  const mySenderMarker = isSpectator ? 'me' : 'partner';

  useEffect(() => {
    if (isFloatingChatOpen) {
      const id = window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 60);
      return () => window.clearTimeout(id);
    }
  }, [isFloatingChatOpen, chatMessages.length]);

  if (extendedView === 'conversas') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean || isSending) return;
    setIsSending(true);
    setDraft('');
    soundEngine.playHeartPop();
    triggerHeartExplosion();
    try {
      await sendChatMessage({ text: clean, senderRole: effectiveRole, msgType: 'text' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isFloatingChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="mb-3 w-[calc(100vw-2rem)] max-w-sm h-[450px] max-h-[68vh] rounded-3xl glass-card-glow border border-pink-400/35 bg-[#120624]/95 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-purple-500/20 flex items-center justify-between gap-2 bg-gradient-to-r from-purple-900/50 to-pink-900/35">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shrink-0 shadow">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">
                    Chat do Casal ♡
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-200/80">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPeerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span className="truncate">
                      {peerRoleKey}: {isPeerOnline ? 'Online agora' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsFloatingChatOpen(false);
                    setExtendedView('conversas');
                  }}
                  title="Abrir chat completo (áudio e fotos)"
                  aria-label="Expandir chat"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFloatingChatOpen(false)}
                  aria-label="Fechar chat"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sender Toggle (Hidden when Gabriel Spectator is logged in) */}
            {!isSpectator && (
              <div className="px-3 py-2 border-b border-purple-500/15 bg-[#0c041a]/70 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-purple-300/80">
                  Enviando como:
                </span>
                <div className="flex items-center gap-1 bg-purple-950/80 p-0.5 rounded-xl border border-purple-500/25">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playHeartPop();
                      setSenderRole('ela');
                    }}
                    className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      senderRole === 'ela'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow'
                        : 'text-purple-300/75 hover:text-white'
                    }`}
                  >
                    Ela ({config.partnerName})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playHeartPop();
                      setSenderRole('eu');
                    }}
                    className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      senderRole === 'eu'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'text-purple-300/75 hover:text-white'
                    }`}
                  >
                    Eu ({config.myName})
                  </button>
                </div>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {chatMessages.map((msg) => {
                const isFromMeOnScreen = msg.sender === mySenderMarker;
                const isEu = msg.sender === 'me';
                const label = msg.senderName || (isEu ? config.myName : config.partnerName);
                const isRead = msg.status === 'read' || Boolean(msg.readAt);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isFromMeOnScreen ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-purple-300/70 mb-0.5 px-1">
                      <span className={isEu ? 'text-purple-300 font-semibold' : 'text-pink-300 font-semibold'}>
                        {label}
                      </span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow ${
                        isFromMeOnScreen
                          ? 'bg-gradient-to-tr from-purple-700/90 to-pink-600/85 border border-pink-300/35 text-white rounded-tr-none'
                          : 'bg-[#1f0c3a]/90 border border-purple-400/30 text-white rounded-tl-none'
                      }`}
                    >
                      <p className="break-words">
                        {msg.msgType === 'audio'
                          ? `Mensagem de voz (${msg.audioDuration || 'áudio'})`
                          : msg.msgType === 'image'
                          ? 'Fotografia enviada'
                          : msg.text}
                      </p>
                      {isFromMeOnScreen && (
                        <div className="flex justify-end mt-0.5">
                          {isRead ? (
                            <CheckCheck className="w-3 h-3 text-cyan-300" />
                          ) : (
                            <Check className="w-3 h-3 text-white/60" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSubmit}
              className="p-2.5 border-t border-purple-500/20 bg-[#0d041d]/90 flex items-center gap-2"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Mensagem de ${effectiveRole === 'eu' ? config.myName : config.partnerName}...`}
                className="flex-1 min-h-[42px] px-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-xs text-white placeholder-purple-300/45 focus:outline-none focus:border-pink-400"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label="Enviar"
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          soundEngine.playHeartPop();
          setIsFloatingChatOpen(!isFloatingChatOpen);
        }}
        aria-label="Abrir Chat do Casal"
        className="relative min-w-[54px] min-h-[54px] px-4 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-500 text-white shadow-[0_8px_28px_rgba(236,72,153,0.55)] border border-white/30 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isFloatingChatOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            <span className="hidden md:inline text-xs font-bold pr-0.5">
              Chat do Casal
            </span>
          </>
        )}

        {unreadChatCount > 0 && !isFloatingChatOpen && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-[#130627] text-[10px] font-extrabold flex items-center justify-center shadow ring-2 ring-[#070210]">
            {unreadChatCount > 9 ? '9+' : unreadChatCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};
