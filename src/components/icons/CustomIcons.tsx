import React from 'react';
import {
  Award,
  BedDouble,
  Camera,
  Coffee,
  Crown,
  Flame,
  Flower2,
  Gamepad2,
  Gift,
  Heart,
  Image as ImageIcon,
  LampFloor,
  Mail,
  MessageCircle,
  Monitor,
  Moon,
  Music,
  Palette,
  PawPrint,
  Shirt,
  ShoppingBag,
  Sofa,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Trees,
  Trophy,
  Tv,
  Utensils,
  Bath,
  Bell,
  Cake,
  Compass,
  Grid3X3,
  Plane,
  Target,
  Zap,
  Glasses,
  Armchair,
  BookOpen,
} from 'lucide-react';

interface IconProps {
  className?: string;
}

export const DiamondGemIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="nmDiamondGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <path
      d="M6.5 3.5h11L22 9.2 12 21 2 9.2 6.5 3.5Z"
      fill="url(#nmDiamondGrad)"
      fillOpacity="0.28"
      stroke="url(#nmDiamondGrad)"
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 9.2h19M8.5 3.5 7 9.2 12 21l5-11.8-1.5-5.7"
      stroke="currentColor"
      strokeOpacity="0.7"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WaxSealIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.5c1.4 0 2.1.9 3.3.9s2.2-.3 3.2.7.7 2 .7 3.2.9 1.9.9 3.3-.9 2.1-.9 3.3.3 2.2-.7 3.2-2 .7-3.2.7-1.9.9-3.3.9-2.1-.9-3.3-.9-2.2.3-3.2-.7-.7-2-.7-3.2-.9-1.9-.9-3.3.9-2.1.9-3.3-.3-2.2.7-3.2 2-.7 3.2-.7 1.9-.9 3.3-.9Z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 15.6s-3.6-2.2-3.6-4.7a2.05 2.05 0 0 1 3.6-1.3 2.05 2.05 0 0 1 3.6 1.3c0 2.5-3.6 4.7-3.6 4.7Z"
      fill="currentColor"
    />
  </svg>
);

export const DreamHouseCrestIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3.5 11.2 12 3.8l8.5 7.4"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 9.5v9.8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10.2 20.3v-4.6a1.8 1.8 0 0 1 3.6 0v4.6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="9.2" r="1.35" fill="currentColor" />
  </svg>
);

export const AquariumCoralIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="3.5"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M8.5 12.2c1.6-1.4 3.4-1.4 4.8 0 1.1-1 2.2-1.4 3.2-1-.4 1-.4 1.8 0 2.8-1 .4-2.1 0-3.2-1-1.4 1.4-3.2 1.4-4.8 0l-1.5 1.1v-3l1.5 1.1Z"
      fill="currentColor"
      fillOpacity="0.85"
    />
    <circle cx="9.2" cy="8.2" r="0.9" fill="currentColor" />
    <circle cx="15.5" cy="8" r="0.7" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

export const SnowflakeCrestIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5M5 10l2.8.2-.9-2.7M19 14l-2.8-.2.9 2.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PumpkinCrestIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 4.5c0-1.3.9-2.2 2-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M7.5 6.8C4.4 7.4 3 10.2 3 13.3 3 17.5 6 20 9.6 20h4.8c3.6 0 6.6-2.5 6.6-6.7 0-3.1-1.4-5.9-4.5-6.5-1.4-.3-2.9.2-4.5.2s-3.1-.5-4.5-.2Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.55"
    />
    <path d="M8.5 11.8l1.3 1.4-1.8.3.5-1.7Zm7 0-1.3 1.4 1.8.3-.5-1.7Z" fill="currentColor" />
    <path d="M8.8 16.1c1 .9 2 .9 3.2.4 1.2.5 2.2.5 3.2-.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const MissionCompassIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.6" />
    <path d="m14.8 9.2-1.8 4.4-4.4 1.8 1.8-4.4 4.4-1.8Z" fill="currentColor" fillOpacity="0.85" />
  </svg>
);

export const ChestVaultIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="12" width="24" height="14" rx="3" fill="#7e22ce" stroke="#f472b6" strokeWidth="1.8" />
    <path d="M4 14.5C4 9.2 8.2 6 16 6s12 3.2 12 8.5H4Z" fill="#a855f7" stroke="#fbcfe8" strokeWidth="1.6" />
    <rect x="13" y="13" width="6" height="6" rx="1.5" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.2" />
    <circle cx="16" cy="16" r="1.2" fill="#78350f" />
  </svg>
);

/**
 * Illustrated cozy SVG Santa character sitting on top of the Relationship Counter card during Christmas
 */
export const SantaCounterCharacter: React.FC<IconProps> = ({ className = 'w-24 h-20' }) => (
  <svg viewBox="0 0 120 100" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="santaCoat" x1="30" y1="40" x2="90" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="santaHat" x1="40" y1="6" x2="84" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    {/* Gift sack beside Santa */}
    <path d="M84 52c8 0 16 6 17 18 1 9-4 15-14 15s-15-5-14-14c1-11 5-19 11-19Z" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
    <path d="M84 50l-4-6h12l-4 6" fill="#b45309" stroke="#fbbf24" strokeWidth="1.2" />
    <path d="M80 51c3 2 9 2 11 0" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />

    {/* Sitting legs dangling over the card edge */}
    <rect x="40" y="75" width="12" height="16" rx="5" fill="#b91c1c" />
    <rect x="64" y="75" width="12" height="16" rx="5" fill="#b91c1c" />
    {/* Boots */}
    <rect x="37" y="86" width="16" height="9" rx="4.5" fill="#1e1b4b" />
    <rect x="63" y="86" width="16" height="9" rx="4.5" fill="#1e1b4b" />
    <rect x="39" y="84" width="13" height="3.5" rx="1.7" fill="#f8fafc" />
    <rect x="64" y="84" width="13" height="3.5" rx="1.7" fill="#f8fafc" />

    {/* Cozy plump torso */}
    <ellipse cx="58" cy="64" rx="22" ry="18" fill="url(#santaCoat)" />
    {/* White coat trim & belt */}
    <rect x="36" y="62" width="44" height="6" rx="3" fill="#1e1b4b" />
    <rect x="52" y="60.5" width="12" height="9" rx="2" fill="none" stroke="#fbbf24" strokeWidth="2.4" />
    <rect x="42" y="76" width="32" height="6" rx="3" fill="#ffffff" />

    {/* Waving arm & present hand */}
    <path d="M39 54c-8 1-13 8-10 14 2 4 8 3 11-2" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5" />
    <circle cx="29" cy="67" r="4.5" fill="#ffffff" />
    <path d="M77 54c8 2 12 8 9 13-2 4-7 3-10-1" fill="#dc2626" />
    <circle cx="86" cy="66" r="4.5" fill="#ffffff" />

    {/* Head */}
    <circle cx="58" cy="36" r="14.5" fill="#fde2c4" />
    {/* Rosy cheeks */}
    <circle cx="49" cy="39" r="2.8" fill="#fb7185" fillOpacity="0.45" />
    <circle cx="67" cy="39" r="2.8" fill="#fb7185" fillOpacity="0.45" />
    {/* Happy twinkling eyes */}
    <circle cx="52.5" cy="34.5" r="1.8" fill="#1e1b4b" />
    <circle cx="63.5" cy="34.5" r="1.8" fill="#1e1b4b" />
    <circle cx="53" cy="34" r="0.6" fill="#ffffff" />
    <circle cx="64" cy="34" r="0.6" fill="#ffffff" />

    {/* Fluffy beard & mustache */}
    <path d="M44 39c0 10 6 17 14 17s14-7 14-17c-4 3-9 4-14 4s-10-1-14-4Z" fill="#ffffff" />
    <path d="M48 39c3 3 7 3 10 0 3 3 7 3 10 0" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
    <circle cx="58" cy="37.5" r="2.5" fill="#f43f5e" />

    {/* Santa Hat */}
    <path d="M43 29c2-11 10-19 23-19 8 0 13 5 16 12-5-2-9-1-13 2-8-3-18-1-26 5Z" fill="url(#santaHat)" />
    <rect x="42" y="26" width="32" height="6.5" rx="3.2" fill="#ffffff" />
    <circle cx="84" cy="23" r="4.5" fill="#ffffff" />
  </svg>
);

export const EclipseSkyIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="6" fill="#0f0722" stroke="#f472b6" strokeWidth="1.4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Universal SVG glyph renderer replacing legacy emoji strings across Achievements, Store, Goals & Minigames
 */
export const VectorGlyphIcon: React.FC<{ name?: string; className?: string }> = ({
  name = 'sparkles',
  className = 'w-5 h-5',
}) => {
  const key = (name || '').toLowerCase();
  if (key.includes('diam') || key.includes('gem')) return <DiamondGemIcon className={className} />;
  if (key.includes('wax') || key.includes('letter') || key.includes('mail') || key.includes('carta')) return <Mail className={className} />;
  if (key.includes('cam') || key.includes('photo') || key.includes('foto') || key.includes('frame') || key.includes('moldura')) return <Camera className={className} />;
  if (key.includes('music') || key.includes('song') || key.includes('nota') || key.includes('piano')) return <Music className={className} />;
  if (key.includes('paw') || key.includes('pet') || key.includes('cat') || key.includes('dog')) return <PawPrint className={className} />;
  if (key.includes('tree') || key.includes('arvore') || key.includes('plant') || key.includes('sprout')) return <Trees className={className} />;
  if (key.includes('aqua') || key.includes('fish') || key.includes('peixe')) return <AquariumCoralIcon className={className} />;
  if (key.includes('sofa') || key.includes('house') || key.includes('casa')) return <Sofa className={className} />;
  if (key.includes('bed') || key.includes('cama')) return <BedDouble className={className} />;
  if (key.includes('tv')) return <Tv className={className} />;
  if (key.includes('pc') || key.includes('monitor')) return <Monitor className={className} />;
  if (key.includes('chair') || key.includes('cadeira')) return <Armchair className={className} />;
  if (key.includes('table') || key.includes('mesa')) return <Utensils className={className} />;
  if (key.includes('bath') || key.includes('banh')) return <Bath className={className} />;
  if (key.includes('lamp') || key.includes('luz') || key.includes('ilum')) return <LampFloor className={className} />;
  if (key.includes('book') || key.includes('estante')) return <BookOpen className={className} />;
  if (key.includes('chat') || key.includes('msg') || key.includes('voz')) return <MessageCircle className={className} />;
  if (key.includes('game') || key.includes('jogo')) return <Gamepad2 className={className} />;
  if (key.includes('trophy') || key.includes('trofeu') || key.includes('win')) return <Trophy className={className} />;
  if (key.includes('crown') || key.includes('coroa') || key.includes('vip')) return <Crown className={className} />;
  if (key.includes('shirt') || key.includes('roupa') || key.includes('outfit')) return <Shirt className={className} />;
  if (key.includes('glass') || key.includes('oculos')) return <Glasses className={className} />;
  if (key.includes('shop') || key.includes('loja') || key.includes('buy')) return <ShoppingBag className={className} />;
  if (key.includes('gift') || key.includes('vale') || key.includes('chest') || key.includes('bau')) return <Gift className={className} />;
  if (key.includes('flower') || key.includes('flor') || key.includes('rose')) return <Flower2 className={className} />;
  if (key.includes('sun')) return <Sun className={className} />;
  if (key.includes('moon')) return <Moon className={className} />;
  if (key.includes('fire') || key.includes('lareira')) return <Flame className={className} />;
  if (key.includes('coffee') || key.includes('cafe') || key.includes('cozinha')) return <Coffee className={className} />;
  if (key.includes('palette') || key.includes('cor') || key.includes('parede') || key.includes('piso')) return <Palette className={className} />;
  if (key.includes('snow') || key.includes('natal') || key.includes('santa')) return <SnowflakeCrestIcon className={className} />;
  if (key.includes('pumpkin') || key.includes('abobora') || key.includes('hallow')) return <PumpkinCrestIcon className={className} />;
  if (key.includes('eclipse')) return <EclipseSkyIcon className={className} />;
  if (key.includes('plane') || key.includes('viagem') || key.includes('travel')) return <Plane className={className} />;
  if (key.includes('bell') || key.includes('lembrete') || key.includes('alerta')) return <Bell className={className} />;
  if (key.includes('cake') || key.includes('bolo') || key.includes('aniv')) return <Cake className={className} />;
  if (key.includes('target') || key.includes('meta') || key.includes('alvo')) return <Target className={className} />;
  if (key.includes('zap') || key.includes('flash') || key.includes('energia')) return <Zap className={className} />;
  if (key.includes('grid') || key.includes('puzzle') || key.includes('tetris') || key.includes('sudoku')) return <Grid3X3 className={className} />;
  if (key.includes('utensil') || key.includes('jantar') || key.includes('comida')) return <Utensils className={className} />;
  if (key.includes('compass')) return <Compass className={className} />;
  if (key.includes('mission')) return <MissionCompassIcon className={className} />;
  if (key.includes('star')) return <Star className={className} />;
  if (key.includes('award') || key.includes('seal')) return <Award className={className} />;
  if (key.includes('seed')) return <Sprout className={className} />;
  if (key.includes('heart') || key.includes('love') || key.includes('amor')) return <Heart className={className} />;
  if (key.includes('image')) return <ImageIcon className={className} />;
  return <Sparkles className={className} />;
};
