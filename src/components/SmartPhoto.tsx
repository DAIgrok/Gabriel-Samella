import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MemoryPhoto } from '../types';

interface SmartPhotoProps {
  photo?: MemoryPhoto;
  photoIndex?: number;
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  aspect?: 'portrait' | 'landscape' | 'square' | 'auto';
  showOverlay?: boolean;
  priority?: boolean;
  onClick?: () => void;
  hideDetails?: boolean;
}

export const SmartPhoto: React.FC<SmartPhotoProps> = ({
  photo,
  photoIndex,
  src,
  alt = 'Memória Romântica',
  className = '',
  imgClassName = '',
  aspect = 'auto',
  showOverlay = false,
  onClick,
  hideDetails = false,
}) => {
  const index = photoIndex || photo?.index || 1;
  const title = photo?.title || `Memória #${index}`;
  const date = photo?.date || 'Nosso Momento';

  // Build candidate paths in order of preference
  const candidateUrls = React.useMemo(() => {
    const list: string[] = [];
    if (src) list.push(src);
    if (photo?.url && photo.url !== src) list.push(photo.url);
    if (photo?.localPath && !list.includes(photo.localPath)) list.push(photo.localPath);

    // Real photos crops
    if (index >= 1 && index <= 4) {
      list.push(`/assets/img/real/photo_${index}.jpg`);
    }

    // Try both /assets/photos/ and /assets/img/
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
      list.push(`/assets/photos/${index}.${ext}`);
      list.push(`/assets/img/${index}.${ext}`);
    }

    return Array.from(new Set(list));
  }, [src, photo?.url, photo?.localPath, index]);

  const [candidateIdx, setCandidateIdx] = useState<number>(0);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const currentSrc = candidateUrls[candidateIdx] || `/assets/photos/${index}.jpg`;

  useEffect(() => {
    setCandidateIdx(0);
    setHasFailedAll(false);
    setIsLoaded(false);
  }, [index, src, photo?.url]);

  const handleError = () => {
    if (candidateIdx + 1 < candidateUrls.length) {
      setCandidateIdx((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasFailedAll(false);
  };

  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    square: 'aspect-square',
    auto: 'h-full w-full',
  }[aspect];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl select-none group transition-all duration-300 ${aspectClasses} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {!hasFailedAll ? (
        <>
          <img
            src={currentSrc}
            alt={alt}
            onError={handleError}
            onLoad={handleLoad}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100 filter-none' : 'opacity-0 scale-95'
            } ${imgClassName}`}
          />

          {/* Shimmer loading placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/70 via-pink-950/40 to-indigo-950/70 animate-pulse flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-pink-300/60">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-[11px] font-mono">Carregando foto #{index}...</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Graceful, gorgeous romantic placeholder card when local file hasn't been added yet */
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 via-pink-950/60 to-slate-950/95 border border-pink-500/30 p-4 flex flex-col items-center justify-center text-center backdrop-blur-md group-hover:border-pink-400/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-400/30 flex items-center justify-center text-pink-300 mb-2 shadow-inner group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 fill-pink-400/30 text-pink-300 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-pink-100 line-clamp-1 font-display">{title}</span>
          <span className="text-[10px] text-pink-300/70 mt-0.5">{date}</span>
          {!hideDetails && (
            <span className="mt-2 text-[9px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300/80 border border-pink-500/20 font-mono">
              assets/photos/{index}.jpg
            </span>
          )}
        </div>
      )}

      {/* Optional Gradient Vignette Overlay on Hover or Active */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-3 pointer-events-none">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-bold line-clamp-1 text-pink-100">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-500/30 text-pink-200 border border-pink-400/30 font-mono">
              #{index}
            </span>
          </div>
          <span className="text-[11px] text-pink-200/80 line-clamp-1">{photo?.subtitle || date}</span>
        </div>
      )}
    </div>
  );
};
