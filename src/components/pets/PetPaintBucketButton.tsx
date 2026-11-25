import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaintBucket, Palette, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import {
  CAT_COAT_PRESETS,
  CatCoatPreset,
  DEFAULT_CAT_COAT,
  PET_PAINT_PARTS,
  PaintableCatPart,
  hexToHsl,
  hslToHex,
  mixHexColors,
} from '../../utils/petCoatPainter';

interface PetPaintBucketButtonProps {
  paintMode: boolean;
  selectedHex: string;
  activePart: PaintableCatPart;
  hasCustomColors: boolean;
  currentPartColors?: Record<string, string>;
  disabled?: boolean;
  onTogglePaintMode: () => void;
  onSelectHex: (hex: string) => void;
  onSelectPart: (part: PaintableCatPart) => void;
  onPaintActivePart: (part: PaintableCatPart, hex: string) => void;
  onApplyCoatPreset: (preset: CatCoatPreset) => void;
  onFillAll?: (hex: string) => void;
  onClearColors: () => void;
}

const MIX_BASE_SWATCHES = [
  '#de8e43', // Caramelo
  '#f5e6d3', // Creme
  '#ffffff', // Branco
  '#64748b', // Cinza Ardósia
  '#432d22', // Café Siamês
  '#1c1c24', // Preto Pantera
  '#10b981', // Verde Olho
  '#38bdf8', // Azul Olho
  '#f59e0b', // Âmbar Olho
  '#f472b6', // Rosa Nariz
];

export const PetPaintBucketButton: React.FC<PetPaintBucketButtonProps> = ({
  paintMode,
  selectedHex,
  activePart,
  hasCustomColors,
  currentPartColors = {},
  disabled = false,
  onTogglePaintMode,
  onSelectHex,
  onSelectPart,
  onPaintActivePart,
  onApplyCoatPreset,
  onFillAll,
  onClearColors,
}) => {
  const initialHsl = useMemo(() => hexToHsl(selectedHex), [selectedHex]);
  const [hue, setHue] = useState<number>(initialHsl.h);
  const [sat, setSat] = useState<number>(initialHsl.s);
  const [light, setLight] = useState<number>(initialHsl.l);

  const [mixColorA, setMixColorA] = useState<string>(selectedHex || '#de8e43');
  const [mixColorB, setMixColorB] = useState<string>('#fff5e9');
  const [mixRatio, setMixRatio] = useState<number>(35);
  const [activeSubTab, setActiveSubTab] = useState<'coats' | 'mixer'>('coats');

  useEffect(() => {
    const parsed = hexToHsl(selectedHex);
    setHue(parsed.h);
    setSat(parsed.s);
    setLight(parsed.l);
  }, [selectedHex]);

  if (disabled) return null;

  const activePartMeta =
    PET_PAINT_PARTS.find((p) => p.key === activePart) || PET_PAINT_PARTS[0];

  const partColorsMap: Record<string, string> = currentPartColors;

  const getPartCurrentHex = (part: PaintableCatPart): string => {
    if (partColorsMap[part]) return partColorsMap[part];
    if (part === 'body' && partColorsMap.head) return partColorsMap.head;
    return DEFAULT_CAT_COAT.parts[part];
  };

  const mixedPreviewHex = mixHexColors(mixColorA, mixColorB, mixRatio / 100);

  const commitHueSatLight = (nextH: number, nextS: number, nextL: number) => {
    setHue(nextH);
    setSat(nextS);
    setLight(nextL);
    const hex = hslToHex(nextH, nextS, nextL);
    onSelectHex(hex);
  };

  const applyHexToSelectedPart = (hex: string) => {
    onSelectHex(hex);
    onPaintActivePart(activePart, hex);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className="relative flex flex-col items-end gap-1.5 z-30"
    >
      {/* Minimalist GTA HUD Trigger */}
      <button
        type="button"
        onClick={onTogglePaintMode}
        aria-label={paintMode ? 'Fechar estúdio de pelagem' : 'Abrir estúdio de pelagem'}
        title="Pintar partes do mascote separadamente"
        className={`min-w-[40px] h-9 px-3 rounded-lg border flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-xl transition cursor-pointer active:scale-95 ${
          paintMode
            ? 'bg-zinc-900/95 border-white/60 text-white shadow-[0_8px_24px_rgba(0,0,0,0.65)]'
            : 'bg-[#090a0f]/82 hover:bg-[#090a0f]/95 border-white/20 text-zinc-100 shadow-lg'
        }`}
      >
        <PaintBucket className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
        <span
          className="w-3 h-3 rounded-sm border border-white/50 shrink-0"
          style={{ backgroundColor: getPartCurrentHex(activePart) }}
        />
        <span className="hidden xs:inline sm:inline text-[10px] tracking-[0.08em]">
          {paintMode ? 'Fechar' : 'Pelagem'}
        </span>
      </button>

      <AnimatePresence>
        {paintMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            className="w-[272px] sm:w-[300px] rounded-xl bg-[#090a0f]/94 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden text-left"
          >
            {/* Top HUD Header */}
            <div className="px-3 py-2 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-sm border border-white/40 shrink-0"
                  style={{ backgroundColor: selectedHex }}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white block leading-none">
                    Estúdio de Pelagem
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5 block">
                    {activePartMeta.label} · {selectedHex}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onTogglePaintMode}
                aria-label="Fechar painel de pintura"
                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Anatomical Parts Selector */}
            <div className="p-2 border-b border-white/10 bg-black/30">
              <div className="grid grid-cols-5 gap-1">
                {PET_PAINT_PARTS.map((part) => {
                  const isActive = activePart === part.key;
                  const partColor = getPartCurrentHex(part.key);
                  return (
                    <button
                      key={part.key}
                      type="button"
                      onClick={() => {
                        onSelectPart(part.key);
                        onSelectHex(partColor);
                      }}
                      className={`py-1.5 px-1 rounded-md border flex flex-col items-center gap-1 transition cursor-pointer ${
                        isActive
                          ? 'bg-white/15 border-white/60 text-white'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.07]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/50 shadow-inner"
                        style={{ backgroundColor: partColor }}
                      />
                      <span className="text-[9px] font-semibold tracking-wide leading-none">
                        {part.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Switcher: Pelagens Reais vs Misturador */}
            <div className="px-2.5 pt-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSubTab('coats')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSubTab === 'coats'
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Pelagens</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('mixer')}
                className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeSubTab === 'mixer'
                    ? 'bg-white text-zinc-950 border-white'
                    : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Misturar</span>
              </button>
            </div>

            {/* Body Content */}
            <div className="p-2.5 space-y-2.5">
              {activeSubTab === 'coats' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {CAT_COAT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onApplyCoatPreset(preset)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/30 flex items-center gap-2 text-left transition cursor-pointer active:scale-98"
                      >
                        <div className="w-6 h-6 rounded-md overflow-hidden border border-white/25 grid grid-cols-2 grid-rows-2 shrink-0">
                          <span style={{ backgroundColor: preset.parts.body }} />
                          <span style={{ backgroundColor: preset.parts.ears }} />
                          <span style={{ backgroundColor: preset.parts.paws }} />
                          <span style={{ backgroundColor: preset.parts.eyes }} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-zinc-100 block truncate leading-tight">
                            {preset.label}
                          </span>
                          <span className="text-[9px] text-zinc-400 block truncate leading-tight">
                            {preset.subtitle}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quick natural swatches for selected part */}
                  <div className="pt-1 border-t border-white/10">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Tom rápido para {activePartMeta.label}
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      {MIX_BASE_SWATCHES.slice(0, 8).map((hex) => {
                        const active = selectedHex.toLowerCase() === hex.toLowerCase();
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => applyHexToSelectedPart(hex)}
                            aria-label={`Aplicar cor ${hex} em ${activePartMeta.label}`}
                            className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                              active
                                ? 'border-white scale-110 ring-1 ring-white/60'
                                : 'border-white/25 hover:scale-105'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                      <label
                        title="Seletor livre de cor"
                        className="w-5 h-5 rounded-full border border-white/45 overflow-hidden cursor-pointer flex items-center justify-center bg-[conic-gradient(#ef4444,#eab308,#22c55e,#3b82f6,#ec4899,#ef4444)]"
                      >
                        <input
                          type="color"
                          value={selectedHex}
                          onChange={(e) => applyHexToSelectedPart(e.target.value)}
                          className="opacity-0 w-7 h-7 cursor-pointer"
                          aria-label="Escolher cor exata"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Continuous Spectrum + Luminance Sliders */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                      <span>Espectro ({activePartMeta.label})</span>
                      <span className="font-mono text-zinc-300">{selectedHex.toUpperCase()}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={359}
                      value={hue}
                      onChange={(e) => commitHueSatLight(Number(e.target.value), Math.max(25, sat), light)}
                      aria-label="Matiz da cor"
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer border border-white/15"
                      style={{
                        background:
                          'linear-gradient(to right, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)',
                      }}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-400 block mb-0.5">Saturação</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sat}
                          onChange={(e) => commitHueSatLight(hue, Number(e.target.value), light)}
                          aria-label="Saturação"
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/15 accent-white"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block mb-0.5">Luminosidade</span>
                        <input
                          type="range"
                          min={6}
                          max={96}
                          value={light}
                          onChange={(e) => commitHueSatLight(hue, sat, Number(e.target.value))}
                          aria-label="Luminosidade"
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/15 accent-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Two-Color Palette Mixer */}
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-zinc-300">
                      <span>Misturar 2 Cores</span>
                      <span className="font-mono text-zinc-400">{mixRatio}% B</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 border border-white/15 cursor-pointer">
                        <span
                          className="w-4 h-4 rounded-sm border border-white/40 shrink-0"
                          style={{ backgroundColor: mixColorA }}
                        />
                        <span className="text-[9px] font-mono text-zinc-300 truncate">Cor A</span>
                        <input
                          type="color"
                          value={mixColorA}
                          onChange={(e) => {
                            const nextA = e.target.value;
                            setMixColorA(nextA);
                            onSelectHex(mixHexColors(nextA, mixColorB, mixRatio / 100));
                          }}
                          className="sr-only"
                        />
                      </label>

                      <span className="text-[10px] font-bold text-zinc-500">+</span>

                      <label className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 border border-white/15 cursor-pointer">
                        <span
                          className="w-4 h-4 rounded-sm border border-white/40 shrink-0"
                          style={{ backgroundColor: mixColorB }}
                        />
                        <span className="text-[9px] font-mono text-zinc-300 truncate">Cor B</span>
                        <input
                          type="color"
                          value={mixColorB}
                          onChange={(e) => {
                            const nextB = e.target.value;
                            setMixColorB(nextB);
                            onSelectHex(mixHexColors(mixColorA, nextB, mixRatio / 100));
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mixRatio}
                      onChange={(e) => {
                        const r = Number(e.target.value);
                        setMixRatio(r);
                        onSelectHex(mixHexColors(mixColorA, mixColorB, r / 100));
                      }}
                      aria-label="Proporção da mistura"
                      className="w-full h-2 rounded-full appearance-none cursor-pointer border border-white/15"
                      style={{
                        background: `linear-gradient(to right, ${mixColorA}, ${mixColorB})`,
                      }}
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-md border border-white/45"
                          style={{ backgroundColor: mixedPreviewHex }}
                        />
                        <span className="text-[10px] font-mono text-zinc-200 uppercase">
                          {mixedPreviewHex}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyHexToSelectedPart(mixedPreviewHex)}
                        className="px-2.5 py-1 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wide cursor-pointer transition"
                      >
                        Aplicar Mistura
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => applyHexToSelectedPart(selectedHex)}
                  className="flex-1 min-h-[30px] px-2 rounded-md bg-white text-zinc-950 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition"
                >
                  Pintar {activePartMeta.label}
                </button>
                {onFillAll && (
                  <button
                    type="button"
                    onClick={() => onFillAll(selectedHex)}
                    className="min-h-[30px] px-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-semibold text-zinc-200 cursor-pointer transition"
                  >
                    Tudo
                  </button>
                )}
                {hasCustomColors && (
                  <button
                    type="button"
                    onClick={onClearColors}
                    className="min-h-[30px] px-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-semibold text-zinc-300 flex items-center gap-1 cursor-pointer transition"
                    title="Restaurar pelagem natural"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
