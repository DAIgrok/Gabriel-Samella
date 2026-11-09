import React, { useState } from 'react';
import { MessageCircle, Send, Heart, Sparkles, Smile, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { soundEngine } from '../../utils/audioSynth';

export const ChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, config, triggerHeartExplosion } = useApp();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundEngine.playHeartPop();
    sendChatMessage(inputText.trim(), 'partner');
    setInputText('');
    triggerHeartExplosion();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 pb-24 max-w-xl mx-auto flex flex-col h-[80vh]"
    >
      {/* Header */}
      <div className="text-center space-y-1 flex-shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs font-semibold text-purple-300 mb-1">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Nosso Cantinho de Recados</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white font-display">
          Recadinhos do Coração ♡
        </h2>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 glass-card-glow rounded-3xl p-4 md:p-5 border border-purple-400/20 shadow-2xl overflow-y-auto space-y-3.5 flex flex-col justify-end">
        <div className="space-y-3">
          {chatMessages.map((msg) => {
            const isMe = msg.sender === 'user'; // Gabriel
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-purple-300/70 mb-1 px-1">
                  <span>{isMe ? config.myName : config.partnerName}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-purple-900/70 border border-purple-400/30 text-purple-100 rounded-tl-none'
                      : 'bg-gradient-to-tr from-pink-600/80 to-purple-600/80 border border-pink-400/40 text-white rounded-tr-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Deixar um recadinho para ${config.myName}...`}
          className="flex-1 px-4 py-3 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-pink-400 backdrop-blur-md"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
};
