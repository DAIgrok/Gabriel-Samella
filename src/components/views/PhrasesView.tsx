import React, { useState } from 'react';
import { BookHeart, Heart, Copy, Search, Sparkles, Check, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import { Phrase } from '../../types';

export const PhrasesView: React.FC = () => {
  const { phrases, toggleFavoritePhrase, showToast, triggerHeartExplosion } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'todas', label: 'Todas (50+)' },
    { id: 'romantica', label: 'Românticas 💖' },
    { id: 'carinho', label: 'Carinho & Dengo 🌸' },
    { id: 'bom-dia', label: 'Bom Dia ☀️' },
    { id: 'boa-noite', label: 'Boa Noite 🌙' },
    { id: 'companheirismo', label: 'Parceria 🤝' },
    { id: 'biblica', label: 'Bíblicas 📖' },
    { id: 'favoritas', label: 'Favoritas ⭐' },
  ];

  const filteredPhrases = phrases.filter((phrase) => {
    const matchesCategory =
      selectedCategory === 'todas'
        ? true
        : selectedCategory === 'favoritas'
        ? phrase.isFavorite
        : phrase.category === selectedCategory;

    const matchesSearch = phrase.text.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (phrase: Phrase) => {
    navigator.clipboard.writeText(phrase.text);
    setCopiedId(phrase.id);
    showToast('Frase copiada com sucesso! 💖');
    triggerHeartExplosion();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 pb-24 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-semibold text-pink-300 mb-1">
          <BookHeart className="w-3.5 h-3.5" />
          <span>Biblioteca de Frases</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Mais de 50 Frases de Amor ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Mensagens autênticas e sinceras para aquecer o coração em qualquer momento.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar uma palavra especial (ex: abraço, sorriso, Deus)..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-sm text-white focus:outline-none focus:border-pink-400 backdrop-blur-md"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-pink-500/40 text-pink-200 shadow-md border border-pink-400/30'
                : 'glass-panel text-purple-300/80 hover:text-white border border-purple-500/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Phrases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPhrases.map((phrase) => (
          <motion.div
            key={phrase.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-glow rounded-3xl p-5 border border-purple-400/20 shadow-md flex flex-col justify-between group hover:border-pink-400/40 transition-all"
          >
            <p className="text-sm text-purple-100 font-light leading-relaxed mb-3 italic">
              “{phrase.text}”
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-purple-500/15 text-xs text-purple-300/70">
              <span className="text-[10px] text-pink-300/80 font-mono">
                {phrase.reference || `#${phrase.category}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(phrase)}
                  className="p-1.5 rounded-lg glass-panel hover:text-pink-300 active:scale-95 transition-transform"
                  title="Copiar frase"
                >
                  {copiedId === phrase.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => toggleFavoritePhrase(phrase.id)}
                  className="p-1.5 rounded-lg glass-panel hover:text-pink-300 active:scale-95 transition-transform"
                  title="Favoritar frase"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      phrase.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-purple-400/60'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
