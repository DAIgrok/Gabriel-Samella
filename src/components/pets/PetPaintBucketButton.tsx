import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, PaintBucket, RotateCcw, X } from 'lucide-react';
import { PET_PAINT_SWATCHES } from '../../utils/petGlbAnimations';

interface PetPaintBucketButtonProps {
  paintMode: boolean;
  selectedHex: string;
  hasCustomColors: boolean;
  disabled?: boolean;
  onTogglePaintMode: () => void;
  onSelectHex: (hex: string) => void;
  onFillAll?: (hex: string) => void;
  onClearColors: () => void;
}

export const PetPaintBucketButton: React.FC<PetPaintBucketButtonProps> = ({
  paintMode,
  selectedHex,
  hasCustomColors,
  disabled = false,
  onTogglePaintMode,
  onSelectHex,
  onFillAll,
  onClearColors,
}) => {
  if (disabled) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="relative flex flex-col items-end gap-1.5 z-30"
    >
      <button
        type="button"
        onClick={onTogglePaintMode}
        aria-label={paintMode ? 'Fechar balde de tinta' : 'Abrir balde de tinta'}
        title={paintMode ? 'Fechar balde de tinta' : 'Pintar partes do pet separadamente'}
        className={`min-w-[40px] h-10 px-2.5 rounded-full border flex items-center gap-1.5 text-[11px] font-bold shadow-lg transition cursor-pointer active:scale-95 ${
          paintMode
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-200 text-white shadow-[0_0_18px_rgba(244,114,182,0.7)]'
            : 'bg-black/65 hover:bg-black/80 border-pink-400/40 text-pink-200'
        }`}
      >
        <PaintBucket className="w-4 h-4 shrink-0" />
        <span
          className="w-3.5 h-3.5 rounded-full border border-white/70 shrink-0"
          style={{ backgroundColor: selectedHex }}
        />
        <span className="hidden xs:inline sm:inline">
          {paintMode ? 'Pintando' : 'Pintar'}
        </span>
      </button>

      <AnimatePresence>
        {paintMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.16 }}
            className="w-56 sm:w-60 rounded-2xl bg-[#130624]/95 backdrop-blur-md border border-pink-400/45 p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.65)] space-y-2 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-pink-200 leading-tight">
                Toque em uma parte do pet
              </span>
              <button
                type="button"
                onClick={onTogglePaintMode}
                aria-label="Fechar paleta"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {PET_PAINT_SWATCHES.map((swatch) => {
                const isSelected = selectedHex.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => onSelectHex(swatch.hex)}
                    title={swatch.label}
                    aria-label={`Cor ${swatch.label}`}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition cursor-pointer active:scale-90 ${
                      isSelected
                        ? 'border-pink-400 scale-110 shadow-[0_0_10px_rgba(244,114,182,0.85)]'
                        : 'border-white/35 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 ${
                          swatch.hex === '#ffffff' || swatch.hex === '#fde047'
                            ? 'text-purple-950'
                            : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                );
              })}

              <label
                className="w-6 h-6 rounded-full border border-pink-300/60 overflow-hidden cursor-pointer flex items-center justify-center bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400"
                title="Escolher qualquer cor"
              >
                <input
                  type="color"
                  value={selectedHex}
                  onChange={(e) => onSelectHex(e.target.value)}
                  className="opacity-0 w-8 h-8 cursor-pointer"
                  aria-label="Escolher qualquer cor no seletor"
                />
              </label>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              {onFillAll && (
                <button
                  type="button"
                  onClick={() => onFillAll(selectedHex)}
                  className="flex-1 min-h-[28px] px-2 rounded-xl bg-pink-500/25 hover:bg-pink-500/35 border border-pink-400/35 text-[10px] font-bold text-pink-100 cursor-pointer transition"
                >
                  Pintar tudo
                </button>
              )}
              {hasCustomColors && (
                <button
                  type="button"
                  onClick={onClearColors}
                  className="min-h-[28px] px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[10px] font-bold text-purple-200 flex items-center gap-1 cursor-pointer transition"
                  title="Restaurar cores originais"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Original</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
