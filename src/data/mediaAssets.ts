import { MemoryPhoto } from '../types';

/**
 * Mapeamento exclusivamente das 4 fotos reais do casal em public/assets/img/1.jpg ... 4.jpg
 * (além das fotos reais adicionadas manualmente pela Galeria).
 * Nenhuma imagem gerada por IA ou foto genérica é referenciada aqui.
 */
export const REAL_PHOTO_SLOTS = {
  heroCouple: '/assets/img/1.jpg',
  loginPortrait: '/assets/img/2.jpg',
  profileAvatar: '/assets/img/3.jpg',
  drawerAvatar: '/assets/img/4.jpg',
  homeMemories: ['/assets/img/1.jpg', '/assets/img/2.jpg', '/assets/img/3.jpg', '/assets/img/4.jpg'],
  homeCardTree: '/assets/img/1.jpg',
  homeCardPet: '/assets/img/2.jpg',
  homeCardChest: '/assets/img/3.jpg',
  musicCovers: [
    '/assets/img/1.jpg',
    '/assets/img/2.jpg',
    '/assets/img/3.jpg',
    '/assets/img/4.jpg',
  ],
};

/**
 * Retorna a URL real correspondente do álbum carregado pelo usuário (ou fallback numerado local).
 */
export function getCouplePhotoUrl(photos: MemoryPhoto[], slotIndex: number, fallbackUrl: string): string {
  if (photos.length === 0) return fallbackUrl;
  const candidate = photos[slotIndex % photos.length];
  if (candidate?.url) return candidate.url;
  return fallbackUrl;
}
