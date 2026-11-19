import React from 'react';

interface GameVectorArtProps {
  token: string;
  className?: string;
}

/**
 * Rich multi-tone vector illustrations for all 25 minigames,
 * replacing raw Unicode emojis with crisp scalable game artwork.
 */
export const GameVectorArt: React.FC<GameVectorArtProps> = ({
  token,
  className = 'w-7 h-7',
}) => {
  const key = (token || 'sparkle').toLowerCase();

  if (key.includes('heart') || key === 'coracao' || key === 'love' || key === 'cupido') {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="gvaHeart" x1="4" y1="5" x2="28" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M16 27.2S4.5 20 4.5 11.4A6.2 6.2 0 0 1 16 8.2a6.2 6.2 0 0 1 11.5 3.2C27.5 20 16 27.2 16 27.2Z"
          fill="url(#gvaHeart)"
          stroke="#fbcfe8"
          strokeWidth="1.4"
        />
        <ellipse cx="11.2" cy="10.8" rx="2.2" ry="1.2" transform="rotate(-28 11.2 10.8)" fill="#ffffff" fillOpacity="0.55" />
      </svg>
    );
  }

  if (key.includes('diam') || key.includes('gem') || key.includes('crystal')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="gvaGem" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <path
          d="M9 5.5h14l5.5 6.8L16 27.5 3.5 12.3 9 5.5Z"
          fill="url(#gvaGem)"
          fillOpacity="0.88"
          stroke="#f8fafc"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="M4 12.3h24M11.5 5.5 9.8 12.3 16 27.5l6.2-15.2-1.7-6.8" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.1" />
      </svg>
    );
  }

  if (key.includes('rose') || key.includes('rosa') || key.includes('flower') || key.includes('flor') || key.includes('tulip') || key.includes('blossom') || key.includes('bouquet')) {
    const petalColor =
      key.includes('tulip') ? '#f472b6'
      : key.includes('blossom') ? '#f9a8d4'
      : key.includes('bouquet') ? '#e879f9'
      : '#f43f5e';
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M16 17v11" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 22c-3.8-.5-5.5-2.6-5.2-4.8 2.4-.2 4.6 1.3 5.2 4.8Z" fill="#10b981" />
        <path d="M16 24c3.8-.5 5.5-2.6 5.2-4.8-2.4-.2-4.6 1.3-5.2 4.8Z" fill="#34d399" />
        <circle cx="12" cy="11" r="4.8" fill={petalColor} fillOpacity="0.85" />
        <circle cx="20" cy="11" r="4.8" fill={petalColor} fillOpacity="0.85" />
        <circle cx="16" cy="8.5" r="5" fill={petalColor} />
        <circle cx="16" cy="12.5" r="4.8" fill={petalColor} stroke="#ffe4e6" strokeWidth="1" />
        <circle cx="16" cy="11.2" r="2" fill="#fde047" />
      </svg>
    );
  }

  if (key.includes('ring') || key.includes('alianca') || key.includes('anel')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="16" cy="18.5" r="8" stroke="#fbbf24" strokeWidth="3.2" />
        <circle cx="16" cy="18.5" r="8" stroke="#fef3c7" strokeWidth="1" strokeOpacity="0.65" />
        <path d="m12.5 8.5 3.5-4 3.5 4-3.5 3.8-3.5-3.8Z" fill="#67e8f9" stroke="#f8fafc" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (key.includes('crown') || key.includes('coroa')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path
          d="M5 23.5 3.8 10.5l6.5 5 5.7-7.5 5.7 7.5 6.5-5L27 23.5H5Z"
          fill="#fbbf24"
          stroke="#fef3c7"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <rect x="6" y="23.5" width="20" height="3" rx="1.5" fill="#f59e0b" />
        <circle cx="16" cy="17.5" r="2" fill="#ec4899" />
      </svg>
    );
  }

  if (key.includes('star') || key.includes('estrela') || key.includes('sparkle')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path
          d="m16 3.5 3.5 7.7 8.3 1-6.2 5.7 1.7 8.2L16 22l-7.3 4.1 1.7-8.2-6.2-5.7 8.3-1L16 3.5Z"
          fill="#fde047"
          stroke="#fef9c3"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="15.5" r="2.2" fill="#ffffff" fillOpacity="0.65" />
      </svg>
    );
  }

  if (key.includes('moon') || key.includes('lua')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path
          d="M21.5 23.8A9.8 9.8 0 0 1 11.4 6.2a9.8 9.8 0 1 0 13.7 14.5 9.6 9.6 0 0 1-3.6 3.1Z"
          fill="#c084fc"
          stroke="#f3e8ff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="22.5" cy="9.5" r="1.4" fill="#fde047" />
        <circle cx="25.5" cy="13.5" r="0.9" fill="#fbcfe8" />
      </svg>
    );
  }

  if (key.includes('sun') || key.includes('sol')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="16" cy="16" r="6.5" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.4" />
        <path
          d="M16 3.5v3M16 25.5v3M3.5 16h3M25.5 16h3M7.2 7.2l2.2 2.2M22.6 22.6l2.2 2.2M24.8 7.2l-2.2 2.2M9.4 22.6l-2.2 2.2"
          stroke="#fde047"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (key.includes('music') || key.includes('nota') || key.includes('song')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M12.5 23V8.5l12-2.5v14.5" stroke="#f472b6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 12.2 24.5 9.8" stroke="#c084fc" strokeWidth="2" />
        <circle cx="9.8" cy="23.5" r="3.4" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.2" />
        <circle cx="21.8" cy="21" r="3.4" fill="#a855f7" stroke="#f3e8ff" strokeWidth="1.2" />
      </svg>
    );
  }

  if (key.includes('letter') || key.includes('mail') || key.includes('carta')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect x="4" y="7" width="24" height="18" rx="3.5" fill="#7e22ce" stroke="#f472b6" strokeWidth="1.6" />
        <path d="m5 8.5 11 8.5 11-8.5" stroke="#fbcfe8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="17.5" r="2.6" fill="#f43f5e" />
      </svg>
    );
  }

  if (key.includes('balloon') || key.includes('balao')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M16 21v7.5c0 1-1.5 1.5-2 1" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="16" cy="12.5" rx="8.5" ry="9.5" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.4" />
        <path d="M14.5 21.8 16 20l1.5 1.8h-3Z" fill="#db2777" />
        <ellipse cx="12.5" cy="9" rx="2" ry="3.2" transform="rotate(-20 12.5 9)" fill="#ffffff" fillOpacity="0.45" />
      </svg>
    );
  }

  if (key.includes('bomb') || key.includes('bomba') || key.includes('thorn') || key.includes('espinho')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="15" cy="18" r="8.5" fill="#1e1b4b" stroke="#fb7185" strokeWidth="1.8" />
        <path d="M19.5 11.5 23 8m1.5-2.5 2 2m-3.5-2 1-2.5" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11.5 14.5l7 7M18.5 14.5l-7 7" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('seed') || key.includes('sprout') || key.includes('leaf') || key.includes('tree')) {
    const isSprout = key.includes('seed') || key.includes('sprout');
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M16 26.5V14" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 17c-5.5 0-8.5-3.2-8.2-7.5 4.4-.2 7.8 2.2 8.2 7.5Z" fill="#10b981" stroke="#a7f3d0" strokeWidth="1.2" />
        {!isSprout && (
          <path d="M16 14.5c5.5 0 8.5-3.2 8.2-7.5-4.4-.2-7.8 2.2-8.2 7.5Z" fill="#34d399" stroke="#d1fae5" strokeWidth="1.2" />
        )}
      </svg>
    );
  }

  if (key.includes('chalice') || key.includes('taca') || key.includes('cup')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M9.5 6h13l-1.2 8.2a5.3 5.3 0 0 1-10.6 0L9.5 6Z" fill="#a855f7" fillOpacity="0.45" stroke="#f472b6" strokeWidth="1.6" />
        <path d="M16 19.5v6.5M11.5 26h9" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('rock') || key.includes('pedra')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M7 22.5 5.5 14l6-6.5h9l6 6.5-2 8.5-8.5 3-9-3Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m11.5 7.5 2.5 6 7.5 1" stroke="#cbd5e1" strokeWidth="1.2" />
      </svg>
    );
  }

  if (key.includes('paper') || key.includes('papel') || key.includes('scroll')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect x="7" y="5" width="18" height="22" rx="3" fill="#fdf4ff" stroke="#e879f9" strokeWidth="1.6" />
        <path d="M11 11h10M11 16h10M11 21h6" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('scissors') || key.includes('tesoura')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="9.5" cy="22.5" r="3.5" stroke="#f472b6" strokeWidth="2" />
        <circle cx="22.5" cy="22.5" r="3.5" stroke="#c084fc" strokeWidth="2" />
        <path d="M11.8 19.8 22 6.5M20.2 19.8 10 6.5" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('coffee') || key.includes('cafe') || key.includes('sweet')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M7 13h13v7a6.5 6.5 0 0 1-13 0v-7Z" fill="#c084fc" fillOpacity="0.45" stroke="#fbcfe8" strokeWidth="1.6" />
        <path d="M20 14.5h2.5a2.5 2.5 0 0 1 0 5H20" stroke="#fbcfe8" strokeWidth="1.6" />
        <path d="M11 8c0-1.5 1.5-2 1.5-3.5M16 8c0-1.5 1.5-2 1.5-3.5" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('film') || key.includes('cinema') || key.includes('camera')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect x="4.5" y="7" width="23" height="18" rx="3" fill="#4c1d95" stroke="#f472b6" strokeWidth="1.6" />
        <path d="m13.5 12 7 4-7 4v-8Z" fill="#fbcfe8" />
      </svg>
    );
  }

  if (key.includes('plane') || key.includes('travel') || key.includes('viagem') || key.includes('compass')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="m27 5-10 22-3.5-8.5L5 15 27 5Z" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (key.includes('paw') || key.includes('pet') || key.includes('cat') || key.includes('dog') || key.includes('bear')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="9" cy="12" r="2.6" fill="#f9a8d4" />
        <circle cx="14" cy="8.5" r="2.6" fill="#f9a8d4" />
        <circle cx="20" cy="8.5" r="2.6" fill="#f9a8d4" />
        <circle cx="24" cy="12.5" r="2.5" fill="#f9a8d4" />
        <path d="M10.5 20.5c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5c0 2.5-2.2 4.5-5.5 4.5s-5.5-2-5.5-4.5Z" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.3" />
      </svg>
    );
  }

  if (key.includes('gift') || key.includes('presente')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect x="6" y="13" width="20" height="13.5" rx="2.5" fill="#9333ea" stroke="#f9a8d4" strokeWidth="1.5" />
        <rect x="4.5" y="9.5" width="23" height="4.5" rx="1.5" fill="#ec4899" stroke="#fbcfe8" strokeWidth="1.3" />
        <path d="M16 9.5v17M16 9.5c-2.5-3.5-6.5-3-5.5 0M16 9.5c2.5-3.5 6.5-3 5.5 0" stroke="#fde047" strokeWidth="1.6" />
      </svg>
    );
  }

  if (key.includes('candle') || key.includes('vela') || key.includes('flame')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M16 4c2.6 3 3.2 5.4 1.5 7.2a2.2 2.2 0 0 1-3 0C12.8 9.4 13.4 7 16 4Z" fill="#fbbf24" />
        <rect x="11.5" y="13" width="9" height="14" rx="2" fill="#f5d0fe" stroke="#e879f9" strokeWidth="1.4" />
      </svg>
    );
  }

  if (key.includes('clock') || key.includes('timer') || key.includes('time')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <circle cx="16" cy="17" r="9.5" fill="#312e81" stroke="#67e8f9" strokeWidth="1.8" />
        <path d="M13 4.5h6M16 17v-5M16 17l3.5 2.5" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key.includes('bot') || key.includes('cupid')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect x="6.5" y="9" width="19" height="15" rx="4.5" fill="#581c87" stroke="#f472b6" strokeWidth="1.6" />
        <circle cx="12" cy="16" r="2" fill="#67e8f9" />
        <circle cx="20" cy="16" r="2" fill="#67e8f9" />
        <path d="M16 5v4" stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16" cy="4.2" r="1.6" fill="#fde047" />
      </svg>
    );
  }

  if (key.includes('trophy') || key.includes('trofeu') || key.includes('award')) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M9.5 6h13v7a6.5 6.5 0 0 1-13 0V6Z" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.4" />
        <path d="M9.5 8H6a2.5 2.5 0 0 0 0 5h3.5M22.5 8H26a2.5 2.5 0 0 1 0 5h-3.5M16 19.5V25M11 26h10" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback crystal emblem
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4 19 12.5 27.5 15.5 19 18.5 16 27 13 18.5 4.5 15.5 13 12.5 16 4Z" fill="#f472b6" stroke="#fbcfe8" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
};
