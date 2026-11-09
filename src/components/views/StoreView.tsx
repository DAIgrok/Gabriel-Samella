import React, { useState } from 'react';
import {
  ShoppingBag,
  Gem,
  Check,
  Sparkles,
  Gift,
  Ticket,
  Heart,
  Crown,
  Layers,
  X,
  Copy,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { StoreItem } from '../../types';
import { soundEngine } from '../../utils/audioSynth';

export const StoreView: React.FC = () => {
  const { storeItems, buyStoreItem, redeemVoucher, coins, showToast, triggerEasterEgg, triggerHeartExplosion } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeModalItem, setActiveModalItem] = useState<StoreItem | null>(null);

  const categories = [
    { id: 'todos', label: 'Tudo', icon: '✨' },
    { id: 'vales', label: 'Vales do Amor', icon: '💌' },
    { id: 'pets', label: 'Adoção de Pets', icon: '🐾' },
    { id: 'roupas', label: 'Roupas & Acessórios', icon: '🎀' },
    { id: 'arvore', label: 'Árvore do Amor', icon: '🌳' },
    { id: 'molduras', label: 'Molduras de Fotos', icon: '🖼️' },
    { id: 'temas', label: 'Temas & Efeitos', icon: '🌌' },
  ];

  const filteredItems = storeItems.filter((item) => {
    if (selectedCategory === 'todos') return true;
    if (selectedCategory === 'vales') return item.category === 'vales' || item.category === 'presentes';
    if (selectedCategory === 'pets') return item.category === 'pets';
    if (selectedCategory === 'roupas') return item.category === 'roupas' || item.category === 'acessorios' || item.category === 'gatinho';
    if (selectedCategory === 'arvore') return item.category === 'arvore';
    if (selectedCategory === 'molduras') return item.category === 'molduras';
    if (selectedCategory === 'temas') return item.category === 'temas' || item.category === 'efeitos';
    return item.category === selectedCategory;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    soundEngine.playSparkle();
    showToast('Código do vale copiado! Envie no WhatsApp para o Gabriel ❤️', '📋');
  };

  const handleStoreIconClick = () => {
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.2);
    triggerEasterEgg('egg-store-gift');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-32 sm:pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div
          onClick={handleStoreIconClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-xs font-semibold text-rose-300 mb-1 cursor-pointer hover:scale-105 transition-transform"
          title="Toque para uma surpresa"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Boutique do Amor de Gabriel & Samella</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Presentes, Mimos & Vales Reais ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Troque seus diamantes 💎 por novos pets, roupinhas, enfeites para a árvore e vales exclusivos.
        </p>
      </div>

      {/* Balance Card */}
      <div className="glass-card-glow rounded-3xl p-5 border border-pink-400/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center text-2xl shadow-md">
            💎
          </div>
          <div>
            <span className="text-xs text-purple-300 block font-medium">Seu Tesouro de Amor</span>
            <h3 className="text-2xl font-bold text-pink-100 font-display">
              {coins} Diamantes
            </h3>
          </div>
        </div>

        <div className="text-xs text-purple-200/80 bg-purple-950/80 px-4 py-2 rounded-2xl border border-purple-500/30 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Economia equilibrada: jogue & complete memórias!</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundEngine.playHeartPop();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md border border-pink-400/40'
                : 'glass-panel text-purple-200/80 hover:text-white border border-purple-500/20'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isVoucher = item.category === 'vales' || item.voucherCode;

          return (
            <motion.div
              key={item.id}
              layout
              whileHover={{ y: -3 }}
              onClick={() => setActiveModalItem(item)}
              className={`glass-panel rounded-3xl p-5 border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                item.purchased
                  ? item.redeemed
                    ? 'border-indigo-500/30 bg-purple-950/30'
                    : 'border-emerald-500/40 bg-purple-950/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-purple-500/20 hover:border-pink-400/50 bg-purple-950/20'
              }`}
            >
              {/* Badge if redeemed voucher */}
              {item.redeemed && (
                <div className="absolute top-3 right-3 bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-indigo-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-indigo-400" />
                  <span>Resgatado</span>
                </div>
              )}

              {/* Badge if purchased & ready */}
              {item.purchased && !item.redeemed && (
                <div className="absolute top-3 right-3 bg-emerald-500/30 border border-emerald-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{isVoucher ? 'Disponível' : 'Adquirido'}</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900 to-pink-900 border border-purple-500/30 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 pr-16">
                    <h4 className="text-sm font-bold text-white leading-tight truncate font-display">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-purple-300/70 capitalize">
                      Categoria: {item.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-purple-200/80 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">💎</span>
                  <span className="text-sm font-bold text-pink-200 font-mono">
                    {item.price}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.purchased) {
                      buyStoreItem(item.id);
                    } else {
                      setActiveModalItem(item);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    item.purchased
                      ? item.redeemed
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-500/20'
                        : isVoucher
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-purple-600 text-white'
                      : coins >= item.price
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                      : 'bg-purple-950/60 text-purple-400/60 border border-purple-500/20 cursor-not-allowed'
                  }`}
                >
                  {item.purchased
                    ? item.redeemed
                      ? 'Ver Comprovante'
                      : isVoucher
                      ? 'Resgatar'
                      : 'Equipado'
                    : 'Adquirir'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Item Detail & Voucher Redemption Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveModalItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl glass-card-glow border border-pink-400/40 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-700 flex items-center justify-center text-2xl shadow-lg">
                    {activeModalItem.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {activeModalItem.title}
                    </h3>
                    <span className="text-xs text-purple-300/70 capitalize">
                      {activeModalItem.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalItem(null)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-purple-200/90 leading-relaxed">
                {activeModalItem.longDescription || activeModalItem.description}
              </p>

              {activeModalItem.category === 'pets' && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 text-xs text-pink-200 flex items-center gap-2.5">
                  <span className="text-2xl">{activeModalItem.icon}</span>
                  <div>
                    <span className="font-bold text-white block">Modelo 3D Interativo Completo</span>
                    <span className="text-[11px] text-purple-200/80">Ao adotar, o mascote fica ativo imediatamente com rotação 360°, sons e carinhos reais.</span>
                  </div>
                </div>
              )}

              {activeModalItem.category === 'arvore' && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/60 to-purple-950/60 border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2.5">
                  <span className="text-2xl">{activeModalItem.icon}</span>
                  <div>
                    <span className="font-bold text-white block">Efeito 3D para a Árvore do Amor</span>
                    <span className="text-[11px] text-teal-200/80">Aparece e brilha em tempo real no cenário 3D da Árvore.</span>
                  </div>
                </div>
              )}

              {/* If Voucher Code */}
              {activeModalItem.voucherCode && (
                <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-purple-300">
                    <span className="font-semibold">Código Exclusivo do Vale:</span>
                    <button
                      onClick={() => handleCopyCode(activeModalItem.voucherCode!)}
                      className="flex items-center gap-1 text-pink-300 hover:text-pink-200 font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>
                  <div className="font-mono text-center text-sm font-bold text-pink-200 bg-black/40 py-2 rounded-xl border border-purple-500/20 tracking-wider">
                    {activeModalItem.voucherCode}
                  </div>
                  {activeModalItem.redeemedAt && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1 justify-center">
                      <Clock className="w-3 h-3" />
                      <span>Resgatado em: {activeModalItem.redeemedAt}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl glass-panel text-xs font-semibold text-purple-200 hover:text-white"
                >
                  Fechar
                </button>

                {!activeModalItem.purchased ? (
                  <button
                    onClick={() => {
                      if (buyStoreItem(activeModalItem.id)) {
                        setActiveModalItem((prev) => (prev ? { ...prev, purchased: true } : null));
                      }
                    }}
                    disabled={coins < activeModalItem.price}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    Adquirir por 💎 {activeModalItem.price}
                  </button>
                ) : activeModalItem.voucherCode && !activeModalItem.redeemed ? (
                  <button
                    onClick={() => {
                      redeemVoucher(activeModalItem.id);
                      setActiveModalItem((prev) => (prev ? { ...prev, redeemed: true } : null));
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    {activeModalItem.actionLabel || 'Resgatar Vale Agora'}
                  </button>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
