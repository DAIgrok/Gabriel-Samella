import React from 'react';

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
    <path
      d="M10.2 20.3v-4.6a1.8 1.8 0 0 1 3.6 0v4.6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
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
    <path
      d="M12 4.5c0-1.3.9-2.2 2-2.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
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
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="m14.8 9.2-1.8 4.4-4.4 1.8 1.8-4.4 4.4-1.8Z"
      fill="currentColor"
      fillOpacity="0.85"
    />
  </svg>
);
