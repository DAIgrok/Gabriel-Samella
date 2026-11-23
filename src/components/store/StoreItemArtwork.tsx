import React from 'react';
import { StoreItem } from '../../types';

interface StoreItemArtworkProps {
  item: StoreItem;
  colorHex: string;
  compact?: boolean;
}

function clampHex(hex?: string, fallback = '#f472b6'): string {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return fallback;
  return hex;
}

export const StoreItemArtwork: React.FC<StoreItemArtworkProps> = ({
  item,
  colorHex,
  compact = false,
}) => {
  const c = clampHex(colorHex, item.defaultColor || '#f472b6');
  const t = (item.targetId || item.id || '').toLowerCase();
  const hCat = item.houseCategory;

  const renderIllustration = () => {
    // --- PETS ---
    if (item.category === 'pets') {
      const p = item.petTypeTarget || 'cat';
      if (p === 'shark' || p === 'dolphin' || p === 'whale') {
        return (
          <g>
            <ellipse cx="80" cy="84" rx="46" ry="8" fill="#0284c7" opacity="0.35" />
            <path
              d="M36 58c10-20 34-26 56-16 14 6 24 14 34 14-6 10-14 14-26 14-14 14-46 12-64-12Z"
              fill={c}
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="2"
            />
            <path d="M72 34l8-14 12 16Z" fill={c} />
            <circle cx="54" cy="54" r="4" fill="#0f172a" />
            <circle cx="52.8" cy="52.5" r="1.4" fill="#ffffff" />
            <path d="M44 63c6 4 14 4 20 0" stroke="#fff5fa" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      }
      if (p === 'snake') {
        return (
          <g>
            <path
              d="M38 78c18 0 18-32 38-32s18 32 38 32"
              stroke={c}
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="114" cy="70" r="13" fill={c} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
            <circle cx="118" cy="67" r="3" fill="#0f172a" />
            <circle cx="117" cy="66" r="1" fill="#ffffff" />
            <path d="M126 73l8-3m0 3-4 2" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      }
      if (p === 'bee') {
        return (
          <g>
            <ellipse cx="66" cy="34" rx="14" ry="18" fill="#e0f2fe" opacity="0.8" transform="rotate(-18 66 34)" />
            <ellipse cx="94" cy="34" rx="14" ry="18" fill="#e0f2fe" opacity="0.8" transform="rotate(18 94 34)" />
            <ellipse cx="80" cy="60" rx="28" ry="20" fill={c} />
            <rect x="66" y="42" width="7" height="36" rx="3" fill="#1e1b4b" />
            <rect x="82" y="41" width="7" height="38" rx="3" fill="#1e1b4b" />
            <circle cx="56" cy="56" r="3.5" fill="#0f172a" />
            <circle cx="55" cy="54.8" r="1.2" fill="#ffffff" />
          </g>
        );
      }
      // Mammal/fluffy chibi pet (cat, dog, bunny, fox, panda, bear, penguin, pig, mouse)
      const longEars = p === 'bunny';
      const roundEars = p === 'bear' || p === 'panda' || p === 'mouse' || p === 'pig';
      return (
        <g>
          <ellipse cx="80" cy="88" rx="32" ry="7" fill="#000000" opacity="0.28" />
          <ellipse cx="80" cy="72" rx="26" ry="18" fill={c} />
          <ellipse cx="80" cy="73" rx="15" ry="12" fill="#fff5fa" opacity="0.82" />
          {longEars ? (
            <>
              <ellipse cx="64" cy="24" rx="7" ry="18" fill={c} />
              <ellipse cx="96" cy="24" rx="7" ry="18" fill={c} />
              <ellipse cx="64" cy="25" rx="3.5" ry="12" fill="#f9a8d4" />
              <ellipse cx="96" cy="25" rx="3.5" ry="12" fill="#f9a8d4" />
            </>
          ) : roundEars ? (
            <>
              <circle cx="57" cy="30" r="10" fill={p === 'panda' ? '#1e1b4b' : c} />
              <circle cx="103" cy="30" r="10" fill={p === 'panda' ? '#1e1b4b' : c} />
              <circle cx="57" cy="30" r="5" fill="#f9a8d4" opacity="0.6" />
              <circle cx="103" cy="30" r="5" fill="#f9a8d4" opacity="0.6" />
            </>
          ) : (
            <>
              <path d="M53 40 58 18 73 34Z" fill={c} />
              <path d="M107 40 102 18 87 34Z" fill={c} />
              <path d="M57 37 60 24 69 34Z" fill="#f9a8d4" opacity="0.7" />
              <path d="M103 37 100 24 91 34Z" fill="#f9a8d4" opacity="0.7" />
            </>
          )}
          <circle cx="80" cy="48" r="24" fill={c} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
          {p === 'panda' && (
            <>
              <ellipse cx="70" cy="47" rx="6" ry="7" fill="#1e1b4b" />
              <ellipse cx="90" cy="47" rx="6" ry="7" fill="#1e1b4b" />
            </>
          )}
          <circle cx="70" cy="47" r="3.4" fill="#0f172a" />
          <circle cx="90" cy="47" r="3.4" fill="#0f172a" />
          <circle cx="69" cy="45.8" r="1.3" fill="#ffffff" />
          <circle cx="89" cy="45.8" r="1.3" fill="#ffffff" />
          <ellipse cx="80" cy="54" rx="5.5" ry="4" fill="#f472b6" />
          <path d="M75 59c2.5 2.5 7.5 2.5 10 0" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    // --- HOUSE PET BOWL ---
    if (t.includes('pet-bowl')) {
      return (
        <g>
          <rect x="28" y="64" width="104" height="22" rx="10" fill={c} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
          <ellipse cx="56" cy="64" rx="22" ry="9" fill="#311042" stroke="#fbcfe8" strokeWidth="2" />
          <circle cx="49" cy="62" r="4" fill="#d97706" />
          <circle cx="57" cy="60" r="4.2" fill="#b45309" />
          <circle cx="63" cy="63" r="3.8" fill="#f59e0b" />
          <circle cx="53" cy="66" r="3.6" fill="#92400e" />
          <ellipse cx="104" cy="64" rx="22" ry="9" fill="#0e7490" stroke="#bae6fd" strokeWidth="2" />
          <ellipse cx="104" cy="63" rx="16" ry="6" fill="#38bdf8" opacity="0.85" />
          <path d="M98 61c4-2 8-2 12 0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    // --- HOUSE WALLS / FLOORS ---
    if (item.slotType === 'house-wall' || hCat === 'paredes') {
      return (
        <g>
          <rect x="26" y="18" width="108" height="72" rx="10" fill={c} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
          <rect x="38" y="18" width="8" height="50" fill="#ffffff" opacity="0.16" />
          <rect x="60" y="18" width="8" height="50" fill="#ffffff" opacity="0.16" />
          <rect x="82" y="18" width="8" height="50" fill="#ffffff" opacity="0.16" />
          <rect x="104" y="18" width="8" height="50" fill="#ffffff" opacity="0.16" />
          <rect x="26" y="68" width="108" height="4" fill="#fde047" opacity="0.7" />
          <rect x="26" y="72" width="108" height="18" rx="4" fill="#1e0b36" opacity="0.45" />
        </g>
      );
    }
    if (item.slotType === 'house-floor' || hCat === 'pisos') {
      return (
        <g>
          <polygon points="34,78 80,28 126,78 80,94" fill={c} stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" />
          <line x1="57" y1="53" x2="103" y2="86" stroke="#1e0b36" strokeOpacity="0.35" strokeWidth="2" />
          <line x1="80" y1="28" x2="80" y2="94" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.5" />
          <line x1="52" y1="68" x2="108" y2="68" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
        </g>
      );
    }

    // --- HOUSE FURNITURE CATEGORIES ---
    if (hCat === 'sofas') {
      return (
        <g>
          <rect x="30" y="34" width="100" height="38" rx="12" fill={c} />
          <rect x="24" y="50" width="16" height="28" rx="7" fill={c} stroke="#ffffff" strokeOpacity="0.25" />
          <rect x="120" y="50" width="16" height="28" rx="7" fill={c} stroke="#ffffff" strokeOpacity="0.25" />
          <rect x="38" y="54" width="40" height="22" rx="7" fill="#ffffff" fillOpacity="0.18" />
          <rect x="82" y="54" width="40" height="22" rx="7" fill="#ffffff" fillOpacity="0.18" />
          <rect x="44" y="42" width="18" height="14" rx="5" fill="#fff5fa" transform="rotate(-8 53 49)" />
          <rect x="98" y="42" width="18" height="14" rx="5" fill="#fbcfe8" transform="rotate(8 107 49)" />
          <rect x="36" y="78" width="6" height="10" rx="2" fill="#fcd34d" />
          <rect x="118" y="78" width="6" height="10" rx="2" fill="#fcd34d" />
        </g>
      );
    }

    if (hCat === 'camas') {
      return (
        <g>
          <rect x="32" y="24" width="96" height="38" rx="12" fill={c} />
          <rect x="44" y="34" width="32" height="16" rx="6" fill="#fff5fa" />
          <rect x="84" y="34" width="32" height="16" rx="6" fill="#fff5fa" />
          <rect x="26" y="52" width="108" height="32" rx="10" fill={c} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
          <rect x="26" y="52" width="108" height="12" rx="6" fill="#ffffff" opacity="0.22" />
          <rect x="34" y="84" width="7" height="8" rx="2" fill="#fcd34d" />
          <rect x="119" y="84" width="7" height="8" rx="2" fill="#fcd34d" />
        </g>
      );
    }

    if (hCat === 'tvs' || hCat === 'pcs') {
      return (
        <g>
          <rect x="32" y="22" width="96" height="52" rx="8" fill="#0f172a" stroke={c} strokeWidth="3.5" />
          <rect x="38" y="28" width="84" height="40" rx="5" fill={c} opacity="0.35" />
          <circle cx="80" cy="48" r="11" fill="#f472b6" opacity="0.85" />
          <polygon points="77,43 87,48 77,53" fill="#ffffff" />
          <rect x="72" y="74" width="16" height="8" fill="#cbd5e1" />
          <rect x="54" y="82" width="52" height="6" rx="3" fill="#7c4a2d" />
        </g>
      );
    }

    if (hCat === 'banheiro') {
      return (
        <g>
          <path d="M30 48h100v16c0 14-12 22-26 22H56c-14 0-26-8-26-22V48Z" fill={c} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
          <ellipse cx="80" cy="48" rx="48" ry="10" fill="#7dd3fc" opacity="0.85" />
          <circle cx="52" cy="43" r="8" fill="#ffffff" opacity="0.9" />
          <circle cx="64" cy="40" r="10" fill="#ffffff" opacity="0.9" />
          <circle cx="76" cy="44" r="7" fill="#ffffff" opacity="0.85" />
          <circle cx="104" cy="42" r="7" fill="#fbbf24" />
          <rect x="44" y="85" width="7" height="7" rx="2" fill="#fcd34d" />
          <rect x="109" y="85" width="7" height="7" rx="2" fill="#fcd34d" />
        </g>
      );
    }

    if (hCat === 'cozinha') {
      return (
        <g>
          <rect x="40" y="20" width="80" height="68" rx="10" fill={c} stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
          <rect x="48" y="28" width="64" height="22" rx="6" fill="#ffffff" opacity="0.2" />
          <rect x="52" y="56" width="56" height="22" rx="5" fill="#0f172a" opacity="0.55" />
          <circle cx="80" cy="67" r="6" fill="#fb923c" opacity="0.9" />
        </g>
      );
    }

    if (hCat === 'mesas' || hCat === 'cadeiras') {
      return (
        <g>
          <ellipse cx="80" cy="46" rx="46" ry="14" fill={c} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
          <rect x="74" y="56" width="12" height="28" rx="4" fill="#fcd34d" />
          <ellipse cx="80" cy="86" rx="22" ry="5" fill="#fcd34d" />
          <circle cx="66" cy="41" r="7" fill="#fff5fa" />
          <rect x="88" y="34" width="10" height="13" rx="3" fill="#f472b6" />
        </g>
      );
    }

    if (hCat === 'iluminacao') {
      return (
        <g>
          <circle cx="80" cy="44" r="24" fill={c} opacity="0.28" />
          <path d="M58 46h44l-8-22H66l-8 22Z" fill={c} stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
          <rect x="77" y="46" width="6" height="36" fill="#fcd34d" />
          <ellipse cx="80" cy="84" rx="18" ry="5" fill="#fcd34d" />
        </g>
      );
    }

    if (hCat === 'plantas' || item.category === 'arvore') {
      return (
        <g>
          <polygon points="62,62 98,62 92,88 68,88" fill="#fff5fa" stroke={c} strokeWidth="2" />
          <circle cx="80" cy="38" r="20" fill={c} />
          <circle cx="63" cy="46" r="14" fill={c} opacity="0.9" />
          <circle cx="97" cy="46" r="14" fill={c} opacity="0.9" />
          <rect x="76" y="48" width="8" height="16" fill="#7c4a2d" />
          <circle cx="72" cy="34" r="3" fill="#fef08a" />
          <circle cx="89" cy="40" r="3" fill="#f472b6" />
        </g>
      );
    }

    if (hCat === 'varanda') {
      return (
        <g>
          <circle cx="80" cy="24" r="8" fill="#fef08a" opacity="0.85" />
          <rect x="34" y="42" width="92" height="40" rx="10" fill={c} fillOpacity="0.28" stroke={c} strokeWidth="2.5" />
          <rect x="44" y="58" width="72" height="16" rx="6" fill={c} />
          <line x1="56" y1="42" x2="56" y2="58" stroke="#fcd34d" strokeWidth="2.5" />
          <line x1="104" y1="42" x2="104" y2="58" stroke="#fcd34d" strokeWidth="2.5" />
        </g>
      );
    }

    if (hCat === 'decoracao') {
      if (t.includes('piano')) {
        return (
          <g>
            <rect x="34" y="28" width="92" height="44" rx="12" fill={c} />
            <rect x="40" y="54" width="80" height="14" rx="4" fill="#fff5fa" />
            <rect x="44" y="72" width="7" height="14" fill="#7c4a2d" />
            <rect x="109" y="72" width="7" height="14" fill="#7c4a2d" />
          </g>
        );
      }
      return (
        <g>
          <rect x="38" y="24" width="84" height="60" rx="12" fill={c} fillOpacity="0.28" stroke={c} strokeWidth="2.5" />
          <path d="M80 68s-18-11-18-23a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 12-18 23-18 23Z" fill={c} />
        </g>
      );
    }

    // --- ROUPAS & ACESSÓRIOS ---
    if (item.slotType === 'hat') {
      return (
        <g>
          <path d="M40 66 50 30 68 48 80 24 92 48 110 30 120 66Z" fill={c} stroke="#fef08a" strokeWidth="2" />
          <rect x="38" y="66" width="84" height="10" rx="5" fill={c} stroke="#ffffff" strokeOpacity="0.4" />
        </g>
      );
    }
    if (item.slotType === 'glasses') {
      return (
        <g>
          <circle cx="58" cy="54" r="18" fill={c} fillOpacity="0.65" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="102" cy="54" r="18" fill={c} fillOpacity="0.65" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M76 54c2-4 6-4 8 0" stroke="#ffffff" strokeWidth="3" fill="none" />
        </g>
      );
    }
    if (item.slotType === 'outfit' || item.slotType === 'collar' || item.slotType === 'accessory') {
      return (
        <g>
          <path
            d="M44 34 62 24h36l18 10 12 20-16 10-8-10v34H56V54l-8 10-16-10 12-20Z"
            fill={c}
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <path d="M80 62s-9-5-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 11-9 11Z" fill="#fff5fa" />
        </g>
      );
    }

    // --- AQUÁRIO ---
    if (item.category === 'aquario') {
      return (
        <g>
          <rect x="28" y="22" width="104" height="64" rx="14" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
          <path
            d="M58 54c12-14 28-14 40 0 8-8 15-10 20-7-3 7-3 13 0 20-5 3-12 1-20-7-12 14-28 14-40 0l-12 8V46l12 8Z"
            fill={c}
          />
          <circle cx="62" cy="36" r="3" fill="#bae6fd" opacity="0.8" />
          <circle cx="106" cy="34" r="4" fill="#bae6fd" opacity="0.6" />
        </g>
      );
    }

    // --- VALES DO AMOR ---
    if (item.category === 'vales' || Boolean(item.voucherCode)) {
      return (
        <g>
          <rect x="26" y="24" width="108" height="60" rx="14" fill="#4c1d95" stroke="#f472b6" strokeWidth="2.5" />
          <rect x="34" y="32" width="92" height="44" rx="9" fill="none" stroke="#fde047" strokeOpacity="0.45" strokeDasharray="4 4" strokeWidth="1.5" />
          <path d="M80 67s-14-9-14-18a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 9-14 18-14 18Z" fill="#f472b6" />
        </g>
      );
    }

    // --- MOLDURAS, TEMAS, SAZONAL, EFEITOS ---
    return (
      <g>
        <rect x="34" y="20" width="92" height="68" rx="14" fill="#2e1065" stroke={c} strokeWidth="3" />
        <circle cx="62" cy="44" r="10" fill={c} opacity="0.8" />
        <path d="M46 74 68 54 84 68 98 52 114 74Z" fill={c} opacity="0.65" />
        <circle cx="106" cy="34" r="4" fill="#fef08a" />
      </g>
    );
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-purple-400/25 bg-gradient-to-br from-[#230c3d] via-[#150629] to-[#0a0216] ${
        compact ? 'aspect-[4/3]' : 'aspect-[4/3]'
      }`}
    >
      <div
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-20 rounded-full blur-2xl opacity-35"
        style={{ backgroundColor: c }}
      />
      <svg
        viewBox="0 0 160 108"
        className="relative z-10 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`bg-${item.id}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor={c} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#080214" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="160" height="108" fill={`url(#bg-${item.id})`} />
        {renderIllustration()}
      </svg>
    </div>
  );
};
