import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { MemoryPhoto } from '../types';
import { resolveMediaUrl, isIdbMediaUrl } from '../services/localMediaStore';

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
  alt = 'Foto do Casal',
  className = '',
  imgClassName = '',
  aspect = 'auto',
  onClick,
}) => {
  const index = photoIndex || photo?.index || 1;

  // Apenas URLs reais adicionadas pelo casal (sem caminhos estáticos /assets/img/)
  const candidateUrls = React.useMemo(() => {
    const list: string[] = [];
    if (src && !src.startsWith('/assets/img/')) list.push(src);
    if (photo?.url && photo.url !== src && !photo.url.startsWith('/assets/img/')) {
      list.push(photo.url);
    }
    if (photo?.driveUrl && !list.includes(photo.driveUrl)) {
      list.push(photo.driveUrl);
    }
    return Array.from(new Set(list));
  }, [src, photo?.url, photo?.driveUrl]);

  const [candidateIdx, setCandidateIdx] = useState<number>(0);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  const rawCurrentSrc = candidateUrls[candidateIdx] || '';

  useEffect(() => {
    setCandidateIdx(0);
    setHasFailedAll(false);
    setIsLoaded(false);
  }, [index, src, photo?.url]);

  useEffect(() => {
    let active = true;
    if (!rawCurrentSrc) {
      setHasFailedAll(true);
      setResolvedSrc('');
      return;
    }

    if (!isIdbMediaUrl(rawCurrentSrc)) {
      setResolvedSrc(rawCurrentSrc);
      return;
    }

    setResolvedSrc('');
    resolveMediaUrl(rawCurrentSrc).then((res) => {
      if (!active) return;
      if (res) {
        setResolvedSrc(res);
      } else if (candidateIdx + 1 < candidateUrls.length) {
        setCandidateIdx((prev) => prev + 1);
      } else {
        setHasFailedAll(true);
      }
    });

    return () => {
      active = false;
    };
  }, [rawCurrentSrc, candidateIdx, candidateUrls.length]);

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
          {resolvedSrc && (
            <img
              src={resolvedSrc}
              alt={alt}
              onError={handleError}
              onLoad={handleLoad}
              referrerPolicy="no-referrer"
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                isLoaded ? 'opacity-100 filter-none' : 'opacity-0 scale-95'
              } ${imgClassName}`}
            />
          )}

          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/70 via-pink-950/40 to-indigo-950/70 animate-pulse flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-300/60 animate-spin" />
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 via-pink-950/55 to-slate-950/95 border border-pink-500/25 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-400/30 flex items-center justify-center shadow-inner">
            <Heart className="w-6 h-6 fill-pink-400/30 text-pink-300" />
          </div>
        </div>
      )}
    </div>
  );
};
