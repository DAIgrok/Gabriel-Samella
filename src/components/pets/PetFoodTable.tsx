import React, { useMemo, useState } from 'react';
import { Search, ShoppingBag, Utensils, Droplets } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PET_FOOD_CATEGORIES,
  PET_KEYBOARD_FOODS_CATALOG,
  PetFoodCategory,
  PetKeyboardFood,
} from '../../data/petFoodsCatalog';
import { FoodItemArtwork } from '../store/FoodItemArtwork';
import { DiamondGemIcon } from '../icons/CustomIcons';
import { soundEngine } from '../../utils/audioSynth';

interface PetFoodTableProps {
  mode: 'store' | 'kitchen';
  onFeedFromKitchen?: (food: PetKeyboardFood) => void;
  compactHeader?: boolean;
}

export const PetFoodTable: React.FC<PetFoodTableProps> = ({
  mode,
  onFeedFromKitchen,
  compactHeader = false,
}) => {
  const { coins, kitten, buyPetFood, isSpectator, showToast } = useApp();
  const [selectedCat, setSelectedCat] = useState<PetFoodCategory | 'todas'>('todas');
  const [query, setQuery] = useState('');

  const inventory = kitten.foodInventory || {};

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PET_KEYBOARD_FOODS_CATALOG.filter((item) => {
      if (selectedCat !== 'todas' && item.category !== selectedCat) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [selectedCat, query]);

  const totalStock = (Object.values(inventory) as number[]).reduce(
    (sum, n) => sum + Math.max(0, Number(n) || 0),
    0
  );

  const handleBuy = (food: PetKeyboardFood, qty = 1) => {
    if (isSpectator) {
      showToast('Modo Espectador: apenas a Samella pode comprar comidinhas.');
      return;
    }
    buyPetFood(food.id, qty);
  };

  return (
    <div className="rounded-3xl glass-panel border border-pink-400/30 bg-purple-950/35 overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="p-3.5 sm:p-4 border-b border-purple-500/25 space-y-3 bg-gradient-to-r from-purple-950/80 via-[#210b3a] to-purple-950/80">
        {!compactHeader && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                <Utensils className="w-4 h-4 text-pink-400" />
                <span>Tabela de Comidas & Bebidas do Pet</span>
              </h3>
              <p className="text-[11px] text-purple-200/75">
                Todas as comidas e bebidas do teclado por preço baixinho ({totalStock} na despensa).
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-black/45 border border-pink-400/35 flex items-center gap-1.5 text-xs font-bold text-pink-100 tabular-nums">
              <DiamondGemIcon className="w-3.5 h-3.5 text-pink-300" />
              <span>{coins}</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-purple-300/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar maçã, pizza, morango, água, sorvete..."
            className="w-full min-h-[38px] pl-9 pr-3 rounded-xl bg-purple-950/80 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/50 focus:outline-none focus:border-pink-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PET_FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundEngine.playHeartPop();
                setSelectedCat(cat.id);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border cursor-pointer transition ${
                selectedCat === cat.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400/50'
                  : 'bg-purple-950/60 text-purple-200/80 border-purple-500/20 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Store-Style Table */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#17072b]/95 backdrop-blur-md border-b border-purple-500/30 text-[10px] uppercase tracking-wider text-purple-300/80 font-bold">
            <tr>
              <th className="py-2.5 pl-3 pr-2">Item</th>
              <th className="py-2.5 px-2">Efeito</th>
              <th className="py-2.5 px-2 text-center">Despensa</th>
              <th className="py-2.5 px-2 text-center">Preço</th>
              <th className="py-2.5 pl-2 pr-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15 text-xs">
            {filteredFoods.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-purple-200/70">
                  Nenhuma comida encontrada com "{query}".
                </td>
              </tr>
            ) : (
              filteredFoods.map((food) => {
                const stock = Math.max(0, inventory[food.id] || 0);
                return (
                  <tr
                    key={food.id}
                    className="hover:bg-purple-900/25 transition-colors"
                  >
                    <td className="py-2.5 pl-3 pr-2">
                      <div className="flex items-center gap-2.5 min-w-[130px]">
                        <FoodItemArtwork
                          kind={food.artKind}
                          accentHex={food.accentHex}
                          secondaryHex={food.secondaryHex}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white leading-tight truncate max-w-[140px] sm:max-w-none">
                            {food.name}
                          </div>
                          <div className="text-[10px] text-purple-300/70 capitalize">
                            {food.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 text-[10px] font-semibold">
                        {food.hungerBoost > 0 && (
                          <span className="text-amber-300">+{food.hungerBoost} Fome</span>
                        )}
                        {food.thirstBoost > 0 && (
                          <span className="text-cyan-300">+{food.thirstBoost} Sede</span>
                        )}
                        <span className="text-pink-300">+{food.happyBoost} Feliz</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tabular-nums border ${
                          stock > 0
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                            : 'bg-purple-950/60 border-purple-500/25 text-purple-300/60'
                        }`}
                      >
                        x{stock}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-pink-200 font-mono tabular-nums">
                        <DiamondGemIcon className="w-3.5 h-3.5 text-pink-300" />
                        <span>{food.price}</span>
                      </span>
                    </td>

                    <td className="py-2.5 pl-2 pr-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {mode === 'kitchen' && onFeedFromKitchen && stock > 0 && (
                          <button
                            type="button"
                            disabled={isSpectator}
                            onClick={() => onFeedFromKitchen(food)}
                            className={`px-2.5 min-h-[34px] rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-50 ${
                              food.isDrink
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            }`}
                          >
                            {food.isDrink ? (
                              <Droplets className="w-3 h-3" />
                            ) : (
                              <Utensils className="w-3 h-3" />
                            )}
                            <span>Dar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isSpectator || coins < food.price}
                          onClick={() => handleBuy(food, 1)}
                          className="px-2.5 min-h-[34px] rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition disabled:opacity-45"
                          title={`Comprar ${food.name} por ${food.price} Diamante(s)`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Comprar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
