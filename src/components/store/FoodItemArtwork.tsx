import React from 'react';
import { FoodArtKind } from '../../data/petFoodsCatalog';

interface Props {
  kind: FoodArtKind;
  accentHex: string;
  secondaryHex?: string;
  size?: 'sm' | 'md';
}

export const FoodItemArtwork: React.FC<Props> = ({
  kind,
  accentHex,
  secondaryHex = '#ffffff',
  size = 'md',
}) => {
  const boxClass = size === 'sm' ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl';

  const renderGlyph = () => {
    switch (kind) {
      case 'apple':
      case 'tomato':
        return (
          <>
            <path d="M24 14c-6 0-10 4.5-10 11 0 7 4.5 13 10 13s10-6 10-13c0-6.5-4-11-10-11z" fill={accentHex} />
            <path d="M24 14c2-4 6-5 8-3-1 3-4 4-8 3z" fill={secondaryHex} />
            <circle cx="20" cy="21" r="2.2" fill="#ffffff" fillOpacity="0.45" />
          </>
        );
      case 'pear':
        return (
          <>
            <path d="M24 12c-3 0-5 3-5 6 0 3-4 6-4 11 0 5 4 9 9 9s9-4 9-9c0-5-4-8-4-11 0-3-2-6-5-6z" fill={accentHex} />
            <path d="M24 12c2-3 5-4 7-2-1 2-4 3-7 2z" fill={secondaryHex} />
          </>
        );
      case 'citrus':
        return (
          <>
            <circle cx="24" cy="25" r="11" fill={accentHex} />
            <circle cx="24" cy="25" r="8" fill={secondaryHex} fillOpacity="0.4" />
            <path d="M24 17v16M16 25h16M18.5 19.5l11 11M29.5 19.5l-11 11" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.6" />
          </>
        );
      case 'banana':
        return (
          <>
            <path d="M13 29c5 7 18 6 23-8-3 8-12 11-23 8z" fill={accentHex} />
            <path d="M13 29c7 4 17 2 22-10 2 3-1 13-11 15-6 1-10-2-11-5z" fill={accentHex} stroke={secondaryHex} strokeWidth="1.2" />
          </>
        );
      case 'melon':
        return (
          <>
            <path d="M12 22a12 12 0 0 0 24 0Z" fill={secondaryHex} />
            <path d="M14.5 22a9.5 9.5 0 0 0 19 0Z" fill={accentHex} />
            <circle cx="21" cy="25" r="1.1" fill="#1e1b2e" />
            <circle cx="26" cy="26" r="1.1" fill="#1e1b2e" />
          </>
        );
      case 'grape':
        return (
          <>
            <circle cx="20" cy="21" r="4.2" fill={accentHex} />
            <circle cx="28" cy="21" r="4.2" fill={accentHex} />
            <circle cx="24" cy="26" r="4.2" fill={accentHex} />
            <circle cx="19" cy="29" r="3.8" fill={accentHex} />
            <circle cx="29" cy="29" r="3.8" fill={accentHex} />
            <circle cx="24" cy="34" r="3.6" fill={accentHex} />
            <path d="M24 16c1-4 4-5 6-3" stroke={secondaryHex} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'berry':
        return (
          <>
            <path d="M24 15c-6.5 0-9.5 4.5-8 11 1.5 6 5 11 8 11s6.5-5 8-11c1.5-6.5-1.5-11-8-11z" fill={accentHex} />
            <path d="M18 15l6 3 6-3-3-3-3 2-3-2z" fill={secondaryHex} />
            <circle cx="21" cy="24" r="1" fill="#fde047" />
            <circle cx="27" cy="24" r="1" fill="#fde047" />
            <circle cx="24" cy="29" r="1" fill="#fde047" />
          </>
        );
      case 'cherry':
        return (
          <>
            <path d="M18 28c1-7 4-12 7-15M30 28c-1-6-3-11-5-15" stroke={secondaryHex} strokeWidth="2" fill="none" />
            <circle cx="17.5" cy="30" r="5" fill={accentHex} />
            <circle cx="30" cy="30" r="5" fill={accentHex} />
          </>
        );
      case 'mango':
      case 'avocado':
      case 'eggplant':
        return (
          <>
            <ellipse cx="24" cy="25" rx="9" ry="12" transform="rotate(-15 24 25)" fill={accentHex} />
            <circle cx="24" cy="28" r="4.2" fill={secondaryHex} fillOpacity="0.8" />
          </>
        );
      case 'pineapple':
        return (
          <>
            <path d="M20 15l4-6 4 6-4 3z" fill={secondaryHex} />
            <ellipse cx="24" cy="27" rx="8.5" ry="10.5" fill={accentHex} />
            <path d="M18 22l12 10M30 22l-12 10" stroke="#92400e" strokeWidth="1.3" strokeOpacity="0.55" />
          </>
        );
      case 'coconut':
      case 'kiwi':
      case 'olive':
        return (
          <>
            <circle cx="24" cy="24" r="10.5" fill={accentHex} />
            <circle cx="24" cy="24" r="7" fill={secondaryHex} />
            <circle cx="24" cy="24" r="2.2" fill={accentHex} fillOpacity="0.45" />
          </>
        );
      case 'carrot':
      case 'pepper':
        return (
          <>
            <path d="M17 17c5-2 13 6 15 17-9-2-17-10-15-17z" fill={accentHex} />
            <path d="M16 16l-3-4M17 16l2-5" stroke={secondaryHex} strokeWidth="2.2" strokeLinecap="round" />
          </>
        );
      case 'corn':
        return (
          <>
            <ellipse cx="24" cy="24" rx="5.5" ry="11" transform="rotate(20 24 24)" fill={accentHex} />
            <path d="M16 29c3 6 11 7 14 2" stroke={secondaryHex} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'potato':
      case 'peanut':
      case 'bean':
        return (
          <>
            <ellipse cx="24" cy="25" rx="10" ry="7" transform="rotate(-12 24 25)" fill={accentHex} />
            <circle cx="20" cy="23" r="1.2" fill={secondaryHex} />
            <circle cx="27" cy="26" r="1.4" fill={secondaryHex} />
          </>
        );
      case 'cucumber':
      case 'leafy':
      case 'broccoli':
        return (
          <>
            <circle cx="20" cy="21" r="6" fill={accentHex} />
            <circle cx="28" cy="21" r="6" fill={accentHex} />
            <circle cx="24" cy="18" r="6" fill={secondaryHex} fillOpacity="0.8" />
            <rect x="21" y="25" width="6" height="10" rx="2.5" fill={secondaryHex} />
          </>
        );
      case 'garlic':
      case 'onion':
        return (
          <>
            <path d="M24 12c-3 5-9 8-9 15 0 5 4 9 9 9s9-4 9-9c0-7-6-10-9-15z" fill={accentHex} />
            <path d="M24 12v24" stroke={secondaryHex} strokeWidth="1.2" strokeOpacity="0.6" />
          </>
        );
      case 'mushroom':
        return (
          <>
            <path d="M13 24c0-7 5-11 11-11s11 4 11 11z" fill={accentHex} />
            <rect x="20" y="24" width="8" height="11" rx="3" fill={secondaryHex} />
            <circle cx="19" cy="19" r="2" fill="#ffffff" />
            <circle cx="27" cy="18" r="1.8" fill="#ffffff" />
          </>
        );
      case 'bread':
      case 'croissant':
      case 'pretzel':
        return (
          <>
            <path d="M13 22c0-6 5-10 11-10s11 4 11 10l-2 12H15z" fill={accentHex} />
            <rect x="17" y="21" width="14" height="11" rx="2" fill={secondaryHex} />
          </>
        );
      case 'pancake':
      case 'waffle':
        return (
          <>
            <ellipse cx="24" cy="30" rx="12" ry="4.5" fill={secondaryHex} />
            <ellipse cx="24" cy="26" rx="11.5" ry="4.5" fill={accentHex} />
            <ellipse cx="24" cy="22" rx="11" ry="4" fill={accentHex} />
            <rect x="21" y="18" width="6" height="3" rx="1" fill="#fef08a" />
          </>
        );
      case 'cheese':
      case 'butter':
        return (
          <>
            <path d="M12 22l18-7 6 12-24 6z" fill={accentHex} />
            <rect x="12" y="22" width="24" height="10" rx="2" fill={accentHex} />
            <circle cx="19" cy="27" r="2" fill={secondaryHex} />
            <circle cx="28" cy="26" r="1.6" fill={secondaryHex} />
          </>
        );
      case 'meat':
      case 'chicken':
      case 'bacon':
        return (
          <>
            <ellipse cx="23" cy="24" rx="10" ry="8" fill={accentHex} />
            <circle cx="33" cy="28" r="3" fill={secondaryHex} />
            <ellipse cx="22" cy="24" rx="4.5" ry="3.2" fill={secondaryHex} fillOpacity="0.65" />
          </>
        );
      case 'burger':
        return (
          <>
            <path d="M13 22c0-6 5-9 11-9s11 3 11 9z" fill={accentHex} />
            <rect x="12" y="23" width="24" height="4" rx="2" fill="#22c55e" />
            <rect x="12" y="26" width="24" height="4" rx="2" fill="#78350f" />
            <rect x="14" y="30" width="20" height="5" rx="2.5" fill={accentHex} />
          </>
        );
      case 'fries':
      case 'popcorn':
        return (
          <>
            <rect x="16" y="13" width="3" height="10" rx="1" fill={accentHex} />
            <rect x="20.5" y="11" width="3" height="12" rx="1" fill={accentHex} />
            <rect x="25" y="12" width="3" height="11" rx="1" fill={accentHex} />
            <rect x="29.5" y="14" width="3" height="9" rx="1" fill={accentHex} />
            <path d="M14 21h20l-2.5 14h-15z" fill={secondaryHex} />
          </>
        );
      case 'pizza':
        return (
          <>
            <path d="M24 12l12 22c-8 3-16 3-24 0z" fill={accentHex} />
            <path d="M13 33c7 2.5 15 2.5 22 0" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="24" cy="22" r="2.2" fill={secondaryHex} />
            <circle cx="20" cy="28" r="2" fill={secondaryHex} />
            <circle cx="28" cy="29" r="2" fill={secondaryHex} />
          </>
        );
      case 'hotdog':
      case 'sandwich':
      case 'taco':
      case 'burrito':
        return (
          <>
            <path d="M12 27a12 11 0 0 1 24 0z" fill={accentHex} />
            <path d="M14 27h20" stroke={secondaryHex} strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case 'egg':
      case 'pan':
        return (
          <>
            <circle cx="24" cy="24" r="10.5" fill={accentHex} />
            <circle cx="24" cy="24" r="5" fill={secondaryHex} />
          </>
        );
      case 'fish':
      case 'shrimp':
        return (
          <>
            <ellipse cx="22" cy="24" rx="10" ry="6.5" fill={accentHex} />
            <path d="M31 24l6-5v10z" fill={secondaryHex} />
            <circle cx="17" cy="23" r="1.4" fill="#1e1b2e" />
          </>
        );
      case 'sushi':
      case 'onigiri':
      case 'rice':
      case 'bento':
        return (
          <>
            <rect x="13" y="17" width="22" height="16" rx="5" fill={secondaryHex} />
            <ellipse cx="24" cy="21" rx="8" ry="4" fill={accentHex} />
            <rect x="20" y="25" width="8" height="8" rx="1.5" fill="#1e293b" />
          </>
        );
      case 'ramen':
      case 'spaghetti':
      case 'bowl':
      case 'pot':
        return (
          <>
            <path d="M12 23h24a12 11 0 0 1-24 0Z" fill={secondaryHex} />
            <ellipse cx="24" cy="22" rx="11" ry="4" fill={accentHex} />
            <line x1="28" y1="13" x2="36" y2="17" stroke="#f5f5f4" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="12" x2="35" y2="15" stroke="#f5f5f4" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'dumpling':
      case 'fortune':
        return (
          <>
            <circle cx="24" cy="17" r="4.2" fill={accentHex} />
            <circle cx="24" cy="24" r="4.2" fill="#ffffff" />
            <circle cx="24" cy="31" r="4.2" fill={secondaryHex} />
          </>
        );
      case 'icecream':
        return (
          <>
            <circle cx="24" cy="19" r="7.5" fill={accentHex} />
            <path d="M17 24h14l-7 13z" fill={secondaryHex} />
          </>
        );
      case 'donut':
        return (
          <>
            <circle cx="24" cy="24" r="10.5" fill={secondaryHex} />
            <circle cx="24" cy="23" r="10" fill={accentHex} />
            <circle cx="24" cy="24" r="3.6" fill="#1b092b" />
          </>
        );
      case 'cookie':
      case 'pie':
        return (
          <>
            <circle cx="24" cy="24" r="10.5" fill={accentHex} />
            <circle cx="20" cy="21" r="1.8" fill={secondaryHex} />
            <circle cx="27" cy="22" r="1.8" fill={secondaryHex} />
            <circle cx="23" cy="28" r="1.8" fill={secondaryHex} />
          </>
        );
      case 'cake':
      case 'cupcake':
      case 'pudding':
        return (
          <>
            <rect x="14" y="23" width="20" height="12" rx="3" fill={secondaryHex} />
            <path d="M13 23c0-5 5-8 11-8s11 3 11 8z" fill={accentHex} />
            <circle cx="24" cy="13" r="2.2" fill="#ef4444" />
          </>
        );
      case 'chocolate':
        return (
          <>
            <rect x="16" y="12" width="16" height="24" rx="3" fill={accentHex} />
            <path d="M16 24h16v12H16z" fill={secondaryHex} />
          </>
        );
      case 'candy':
      case 'lollipop':
        return (
          <>
            <circle cx="24" cy="20" r="8" fill={accentHex} />
            <circle cx="24" cy="20" r="4" fill={secondaryHex} />
            <rect x="23" y="28" width="2" height="10" rx="1" fill="#ffffff" />
          </>
        );
      case 'honey':
        return (
          <>
            <rect x="16" y="18" width="16" height="17" rx="5" fill={accentHex} />
            <rect x="18" y="14" width="12" height="4" rx="2" fill={secondaryHex} />
          </>
        );
      case 'water':
      case 'ice':
        return (
          <>
            <path d="M24 12c-5 7-8 11-8 15a8 8 0 0 0 16 0c0-4-3-8-8-15z" fill={accentHex} />
            <circle cx="21" cy="27" r="2" fill={secondaryHex} />
          </>
        );
      case 'milk':
      case 'coffee':
      case 'tea':
      case 'juice':
      case 'soda':
      case 'boba':
      default:
        return (
          <>
            <path d="M16 17h16l-2 18H18z" fill={accentHex} />
            <rect x="15" y="15" width="18" height="3" rx="1.5" fill={secondaryHex} />
            <line x1="26" y1="9" x2="24" y2="16" stroke="#f472b6" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="21" cy="31" r="1.5" fill={secondaryHex} />
            <circle cx="26" cy="30" r="1.5" fill={secondaryHex} />
          </>
        );
    }
  };

  return (
    <div
      className={`${boxClass} shrink-0 flex items-center justify-center border border-white/15 shadow-inner overflow-hidden`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${accentHex}38, #19092b 82%)`,
      }}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full p-1">
        {renderGlyph()}
      </svg>
    </div>
  );
};
