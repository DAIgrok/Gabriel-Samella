import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Sparkles,
  Gift,
  X,
  Copy,
  Clock,
  Palette,
  Lock,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { HouseFurnitureCategory, StoreItem } from '../../types';
import { HOUSE_CATEGORY_META } from '../../data/houseFurnitureCatalog';
import { soundEngine } from '../../utils/audioSynth';
import { DiamondGemIcon, VectorGlyphIcon } from '../icons/CustomIcons';
import { StoreItemArtwork } from '../store/StoreItemArtwork';
import { PetFoodTable } from '../pets/PetFoodTable';

const COLOR_PRESETS = [
  '#f472b6',
  '#c084fc',
  '#fbbf24',
  '#38bdf8',
  '#34d399',
  '#f87171',
  '#ffffff',
  '#1e1b4b',
  '#f97316',
  '#fb7185',
];

export const StoreView: React.FC = () => {
  const {
    storeItems,
    buyStoreItem,
    redeemVoucher,
    coins,
    showToast,
    triggerEasterEgg,
    triggerHeartExplosion,
    renamePet,
    equipKittenItem,
    kitten,
    dreamHouse,
    setPetColor,
    setAccessoryColor,
    setHouseFurnitureColor,
    setHouseCustomWallHex,
    setHouseCustomFloorHex,
    setExtendedView,
    isSpectator,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedHouseCat, setSelectedHouseCat] = useState<HouseFurnitureCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<StoreItem | null>(null);
  const [petCustomName, setPetCustomName] = useState<string>('');
  const [selectedHexColor, setSelectedHexColor] = useState<string>('#f472b6');

  const categories = [
    { id: 'todos', label: 'Tudo', icon: 'sparkles' },
    { id: 'comidas', label: 'Comidas', icon: 'utensils' },
    { id: 'casa', label: 'Casa 3D', icon: 'sofa' },
    { id: 'pets', label: 'Pets 3D', icon: 'paw' },
    { id: 'roupas', label: 'Roupas & Looks', icon: 'shirt' },
    { id: 'vales', label: 'Vales do Amor', icon: 'gift' },
    { id: 'aquario', label: 'Aquário 3D', icon: 'aqua' },
    { id: 'arvore', label: 'Árvore do Amor', icon: 'tree' },
    { id: 'sazonal', label: 'Sazonal', icon: 'snow' },
    { id: 'molduras', label: 'Molduras', icon: 'camera' },
    { id: 'temas', label: 'Temas & Efeitos', icon: 'moon' },
  ];

  const getActiveItemColor = (item: StoreItem): string => {
    if (item.category === 'pets' && item.petTypeTarget) {
      return kitten.petColors?.[item.petTypeTarget] || item.defaultColor || '#f472b6';
    }
    if (
      ['hat', 'outfit', 'collar', 'glasses', 'accessory'].includes(item.slotType || '')
    ) {
      return kitten.accessoryColors?.[item.id] || item.defaultColor || '#f472b6';
    }
    if (item.slotType === 'house-wall') {
      return dreamHouse.customWallHex || item.defaultColor || '#6d28d9';
    }
    if (item.slotType === 'house-floor') {
      return dreamHouse.customFloorHex || item.defaultColor || '#a855f7';
    }
    if (item.targetId) {
      return dreamHouse.customColors?.[item.targetId] || item.defaultColor || '#c084fc';
    }
    return item.defaultColor || '#f472b6';
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return storeItems.filter((item) => {
      if (q) {
        const hay = `${item.title} ${item.description} ${item.category} ${item.houseCategory || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedCategory === 'todos') return true;
      if (selectedCategory === 'vales') return item.category === 'vales' || item.category === 'presentes';
      if (selectedCategory === 'casa') {
        if (item.category !== 'casa') return false;
        if (selectedHouseCat !== 'todas' && item.houseCategory !== selectedHouseCat) return false;
        return true;
      }
      if (selectedCategory === 'roupas') {
        return item.category === 'roupas' || item.category === 'acessorios' || item.category === 'gatinho';
      }
      if (selectedCategory === 'temas') {
        return item.category === 'temas' || item.category === 'efeitos';
      }
      return item.category === selectedCategory;
    });
  }, [storeItems, selectedCategory, selectedHouseCat, searchQuery]);

  const ownedCount = storeItems.filter((i) => i.purchased).length;

  const handleOpenItemModal = (item: StoreItem) => {
    setActiveModalItem(item);
    setSelectedHexColor(getActiveItemColor(item));
    if (item.category === 'pets') {
      setPetCustomName('');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    soundEngine.playSparkle();
    showToast('Código do vale copiado para compartilhar com o Gabriel!');
  };

  const handleStoreIconClick = () => {
    if (isSpectator) return;
    soundEngine.playSparkle();
    triggerHeartExplosion(0.5, 0.2);
    triggerEasterEgg('egg-store-gift');
  };

  const applyColorAfterPurchase = (item: StoreItem, hex: string) => {
    if (isSpectator) {
      showToast('Modo Espectador: alteração bloqueada para o Gabriel.');
      return;
    }
    if (item.category === 'pets' && item.petTypeTarget) {
      setPetColor(item.petTypeTarget, hex);
      return;
    }
    if (['hat', 'outfit', 'collar', 'glasses', 'accessory'].includes(item.slotType || '')) {
      setAccessoryColor(item.id, hex);
      return;
    }
    if (item.slotType === 'house-wall') {
      setHouseCustomWallHex(hex);
      return;
    }
    if (item.slotType === 'house-floor') {
      setHouseCustomFloorHex(hex);
      return;
    }
    if (item.targetId) {
      setHouseFurnitureColor(item.targetId, hex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 pb-32 sm:pb-24 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <button
          type="button"
          onClick={handleStoreIconClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-xs font-semibold text-rose-300 mb-1 cursor-pointer hover:scale-105 transition-transform"
          title="Toque para uma surpresa"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Boutique do Amor de Gabriel & Samella</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
          Loja de Móveis, Pets & Mimos ♡
        </h2>
        <p className="text-xs md:text-sm text-purple-200/70">
          Escolha qualquer cor na paleta livre antes ou depois de comprar seus itens 3D.
        </p>
      </div>

      {/* Spectator Guard Notice */}
      {isSpectator && (
        <div className="rounded-2xl p-3.5 bg-purple-950/70 border border-pink-400/35 text-xs text-pink-200 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-pink-300 shrink-0" />
          <span>
            Modo Espectador (Gabriel): você pode explorar toda a boutique, mas apenas a Samella pode comprar ou equipar itens.
          </span>
        </div>
      )}

      {/* Balance & Search Card */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 border border-pink-400/30 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center shadow-md shrink-0">
            <DiamondGemIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs text-purple-300 block font-medium">Tesouro Disponível</span>
            <h3 className="text-2xl font-bold text-pink-100 font-display tabular-nums">
              {coins} Diamantes
            </h3>
            <span className="text-[11px] text-purple-200/70 tabular-nums">
              {ownedCount}/{storeItems.length} itens desbloqueados
            </span>
          </div>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-purple-300/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar sofá, TV, PC, parede, pet..."
            className="w-full min-h-[42px] pl-10 pr-3 rounded-2xl bg-purple-950/80 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/50 focus:outline-none focus:border-pink-400"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              soundEngine.playHeartPop();
              setSelectedCategory(cat.id);
            }}
            className={`px-3.5 min-h-[40px] py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md border border-pink-400/40'
                : 'glass-panel text-purple-200/80 hover:text-white border border-purple-500/20'
            }`}
          >
            <VectorGlyphIcon name={cat.icon} className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Subcategories for Dream House 3D */}
      {selectedCategory === 'casa' && (
        <div className="p-3 rounded-2xl bg-purple-950/55 border border-purple-500/25 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 block px-1">
            Categorias da Casa 3D (Móveis, Paredes & Pisos)
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedHouseCat('todas')}
              className={`px-3 min-h-[36px] rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                selectedHouseCat === 'todas'
                  ? 'bg-pink-500/35 border border-pink-400 text-white'
                  : 'bg-purple-900/40 border border-purple-500/20 text-purple-200/80'
              }`}
            >
              Todos os Cômodos
            </button>
            {HOUSE_CATEGORY_META.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedHouseCat(sub.id)}
                className={`px-3 min-h-[36px] rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer flex items-center gap-1.5 transition ${
                  selectedHouseCat === sub.id
                    ? 'bg-pink-500/35 border border-pink-400 text-white'
                    : 'bg-purple-900/40 border border-purple-500/20 text-purple-200/80 hover:text-white'
                }`}
              >
                <VectorGlyphIcon name={sub.icon} className="w-3 h-3" />
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Store Grid or Pet Foods Table */}
      {selectedCategory === 'comidas' ? (
        <PetFoodTable mode="store" />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl p-8 glass-panel border border-purple-500/20 text-center space-y-2">
          <Sparkles className="w-6 h-6 text-pink-300 mx-auto" />
          <p className="text-sm font-bold text-white">Nenhum item encontrado</p>
          <p className="text-xs text-purple-200/70">
            Tente outro termo de busca ou mude o filtro de categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isVoucher = item.category === 'vales' || Boolean(item.voucherCode);
            const activeColor = getActiveItemColor(item);
            const isDeadPet =
              item.category === 'pets' &&
              Boolean(item.petTypeTarget) &&
              (kitten.deadPets || []).includes(item.petTypeTarget!);
            const effectivelyPurchased = item.purchased && !isDeadPet;
            const isWearable = ['hat', 'outfit', 'collar', 'glasses', 'accessory'].includes(
              item.slotType || ''
            );
            const isEquipped = [
              kitten.equippedHat,
              kitten.equippedOutfit,
              kitten.equippedCollar,
              kitten.equippedGlasses,
              kitten.equippedAccessory,
            ].includes(item.id);

            return (
              <motion.div
                key={item.id}
                layout
                whileHover={{ y: -2 }}
                onClick={() => handleOpenItemModal(item)}
                className={`glass-panel rounded-3xl p-4 border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                  effectivelyPurchased
                    ? item.redeemed
                      ? 'border-indigo-500/30 bg-purple-950/30'
                      : 'border-emerald-500/40 bg-purple-950/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                    : isDeadPet
                    ? 'border-rose-400/45 bg-rose-950/20'
                    : 'border-purple-500/25 hover:border-pink-400/50 bg-purple-950/25'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <StoreItemArtwork item={item} colorHex={activeColor} compact />
                    {item.redeemed && (
                      <div className="absolute top-2.5 right-2.5 z-20 bg-indigo-500/85 border border-indigo-300/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow">
                        <Check className="w-3 h-3" />
                        <span>Resgatado</span>
                      </div>
                    )}
                    {effectivelyPurchased && !item.redeemed && (
                      <div className="absolute top-2.5 right-2.5 z-20 bg-emerald-500/85 border border-emerald-300/50 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow">
                        <Check className="w-3 h-3" />
                        <span>{isVoucher ? 'Disponível' : 'Adquirido'}</span>
                      </div>
                    )}
                    {item.supportsCustomColor && (
                      <span
                        className="absolute bottom-2 right-2 z-20 px-2 py-0.5 rounded-full bg-black/65 border border-white/20 text-[10px] font-semibold text-pink-100 flex items-center gap-1.5"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/50"
                          style={{ backgroundColor: activeColor }}
                        />
                        <span>Cor livre</span>
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight truncate font-display">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-purple-300/75 capitalize block mt-0.5">
                      {item.houseCategory || item.category}
                    </span>
                    <p className="text-xs text-purple-200/80 line-clamp-2 leading-relaxed mt-1.5 mb-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <DiamondGemIcon className="w-4 h-4 text-pink-300" />
                    <span className="text-sm font-bold text-pink-200 font-mono tabular-nums">
                      {item.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSpectator && !effectivelyPurchased}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSpectator) {
                        handleOpenItemModal(item);
                        return;
                      }
                      if (!effectivelyPurchased) {
                        if (item.category === 'pets' || item.supportsCustomColor) {
                          handleOpenItemModal(item);
                        } else {
                          buyStoreItem(item.id);
                        }
                      } else if (isWearable && item.slotType) {
                        equipKittenItem(
                          item.id,
                          item.slotType as 'hat' | 'outfit' | 'collar' | 'glasses' | 'accessory'
                        );
                      } else {
                        handleOpenItemModal(item);
                      }
                    }}
                    className={`px-4 min-h-[38px] rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                      isSpectator
                        ? 'bg-purple-950/70 text-purple-300/75 border border-purple-500/25'
                        : effectivelyPurchased
                        ? item.redeemed
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-500/20'
                          : isVoucher
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : isEquipped
                          ? 'bg-pink-600 hover:bg-pink-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                        : coins >= item.price
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                        : 'bg-purple-950/60 text-purple-400/60 border border-purple-500/20'
                    }`}
                  >
                    {isSpectator
                      ? 'Visualizar'
                      : effectivelyPurchased
                      ? item.redeemed
                        ? 'Ver Comprovante'
                        : isVoucher
                        ? 'Resgatar'
                        : isWearable
                        ? isEquipped
                          ? 'Equipado'
                          : 'Equipar'
                        : 'Personalizar'
                      : isDeadPet
                      ? 'Re-adotar'
                      : item.supportsCustomColor
                      ? 'Escolher Cor & Comprar'
                      : 'Adquirir'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Item Detail, Color Picker & Voucher Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeModalItem && (
              <div
                className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setActiveModalItem(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl glass-card-glow border border-pink-400/40 p-5 sm:p-6 space-y-4 bg-[#120626]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-700 flex items-center justify-center text-white shadow-lg shrink-0 relative">
                        <VectorGlyphIcon name={activeModalItem.icon} className="w-6 h-6" />
                        {activeModalItem.supportsCustomColor && (
                          <span
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#120626]"
                            style={{ backgroundColor: selectedHexColor }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white font-display truncate">
                          {activeModalItem.title}
                        </h3>
                        <span className="text-xs text-purple-300/75 capitalize">
                          {activeModalItem.houseCategory || activeModalItem.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveModalItem(null)}
                      className="min-w-[38px] min-h-[38px] rounded-xl text-purple-300 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <StoreItemArtwork item={activeModalItem} colorHex={selectedHexColor} />

                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    {activeModalItem.longDescription || activeModalItem.description}
                  </p>

                  {/* Unlimited Hex Color Picker for pets, clothes, accessories & 3D furniture */}
                  {activeModalItem.supportsCustomColor && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/75 border border-pink-400/30 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-pink-200 flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-pink-400" />
                          <span>Qualquer Cor (Paleta Livre RGB)</span>
                        </span>
                        <span className="text-[11px] font-mono text-purple-200 uppercase">
                          {selectedHexColor}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <label
                          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl bg-black/45 border border-pink-400/40 text-xs font-semibold text-white ${
                            isSpectator ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-lg border border-white/40"
                            style={{ backgroundColor: selectedHexColor }}
                          />
                          <span>Escolher tom exato</span>
                          <input
                            type="color"
                            disabled={isSpectator}
                            value={selectedHexColor}
                            onChange={(e) => {
                              const hex = e.target.value;
                              setSelectedHexColor(hex);
                              if (activeModalItem.purchased && !isSpectator) {
                                applyColorAfterPurchase(activeModalItem, hex);
                              }
                            }}
                            className="sr-only"
                          />
                        </label>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              disabled={isSpectator}
                              onClick={() => {
                                setSelectedHexColor(preset);
                                if (activeModalItem.purchased && !isSpectator) {
                                  applyColorAfterPurchase(activeModalItem, preset);
                                }
                              }}
                              aria-label={`Selecionar cor ${preset}`}
                              className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                                selectedHexColor.toLowerCase() === preset.toLowerCase()
                                  ? 'border-white scale-110'
                                  : 'border-white/25 hover:scale-105'
                              }`}
                              style={{ backgroundColor: preset }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModalItem.category === 'pets' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 text-xs text-pink-200 flex items-center gap-2.5">
                        <VectorGlyphIcon name={activeModalItem.icon} className="w-6 h-6 shrink-0" />
                        <div>
                          <span className="font-bold text-white block">Mascote 3D 360° Interativo</span>
                          <span className="text-[11px] text-purple-200/80">
                            Danças, roupinhas coloridas, carinhos, alimentação, banho e sono.
                          </span>
                        </div>
                      </div>

                      {!activeModalItem.purchased && !isSpectator && (
                        <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/30 space-y-1.5 text-left">
                          <label className="text-xs font-semibold text-pink-200 block">
                            Como vai se chamar seu novo mascote? ♡
                          </label>
                          <input
                            type="text"
                            value={petCustomName}
                            onChange={(e) => setPetCustomName(e.target.value)}
                            placeholder="Digite o nome que você escolher..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-500/40 text-white text-xs focus:outline-none focus:border-pink-400 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeModalItem.category === 'arvore' && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/60 to-purple-950/60 border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2.5">
                      <VectorGlyphIcon name={activeModalItem.icon} className="w-6 h-6 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">Enfeite 360° para a Árvore do Amor</span>
                        <span className="text-[11px] text-teal-200/80">Brilha em tempo real na Árvore 3D.</span>
                      </div>
                    </div>
                  )}

                  {activeModalItem.voucherCode && (
                    <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs text-purple-300">
                        <span className="font-semibold">Código Exclusivo do Vale:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(activeModalItem.voucherCode!)}
                          className="flex items-center gap-1 text-pink-300 hover:text-pink-200 font-bold cursor-pointer"
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
                      type="button"
                      onClick={() => setActiveModalItem(null)}
                      className="flex-1 min-h-[44px] py-2.5 rounded-xl glass-panel text-xs font-semibold text-purple-200 hover:text-white cursor-pointer"
                    >
                      Fechar
                    </button>

                    {isSpectator ? (
                      <div className="flex-1 min-h-[44px] rounded-xl bg-purple-950/70 border border-purple-500/25 text-[11px] text-purple-300 flex items-center justify-center gap-1.5 px-3">
                        <Lock className="w-3.5 h-3.5 text-pink-300" />
                        <span>Somente Samella</span>
                      </div>
                    ) : !(
                        activeModalItem.purchased &&
                        !(
                          activeModalItem.category === 'pets' &&
                          activeModalItem.petTypeTarget &&
                          (kitten.deadPets || []).includes(activeModalItem.petTypeTarget)
                        )
                      ) ? (
                      <button
                        type="button"
                        onClick={() => {
                          const colorToApply = activeModalItem.supportsCustomColor
                            ? selectedHexColor
                            : undefined;
                          if (buyStoreItem(activeModalItem.id, colorToApply)) {
                            if (activeModalItem.category === 'pets' && petCustomName.trim()) {
                              renamePet(petCustomName.trim());
                            }
                            setActiveModalItem((prev) => (prev ? { ...prev, purchased: true } : null));
                          }
                        }}
                        disabled={coins < activeModalItem.price}
                        className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-1.5"
                      >
                        <span>Adquirir por</span>
                        <DiamondGemIcon className="w-3.5 h-3.5" />
                        <span>{activeModalItem.price}</span>
                      </button>
                    ) : activeModalItem.voucherCode && !activeModalItem.redeemed ? (
                      <button
                        type="button"
                        onClick={() => {
                          redeemVoucher(activeModalItem.id);
                          setActiveModalItem((prev) => (prev ? { ...prev, redeemed: true } : null));
                        }}
                        className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        {activeModalItem.actionLabel || 'Resgatar Vale Agora'}
                      </button>
                    ) : ['hat', 'outfit', 'collar', 'glasses', 'accessory'].includes(activeModalItem.slotType || '') ? (
                      <button
                        type="button"
                        onClick={() => {
                          equipKittenItem(
                            activeModalItem.id,
                            activeModalItem.slotType as 'hat' | 'outfit' | 'collar' | 'glasses' | 'accessory'
                          );
                        }}
                        className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        {[
                          kitten.equippedHat,
                          kitten.equippedOutfit,
                          kitten.equippedCollar,
                          kitten.equippedGlasses,
                          kitten.equippedAccessory,
                        ].includes(activeModalItem.id)
                          ? 'Tirar Look'
                          : 'Equipar no Mascote'}
                      </button>
                    ) : activeModalItem.category === 'casa' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalItem(null);
                          setExtendedView('casa');
                        }}
                        className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Decorar Casa 3D →
                      </button>
                    ) : activeModalItem.category === 'aquario' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalItem(null);
                          setExtendedView('aquario');
                        }}
                        className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Ver no Aquário 3D →
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
};
