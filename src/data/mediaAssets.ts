import { MemoryPhoto } from '../types';

/**
 * Mapeamento das fotos reais do casal em public/assets/img/1.jpg ... 38.jpg.
 * Nenhuma imagem gerada por IA é referenciada aqui.
 * Quando o usuário substituir os arquivos em public/assets/img/ antes de subir no GitHub
 * ou enviar fotos pela galeria do app, todas as áreas do site refletem as fotos reais.
 */
export const REAL_PHOTO_SLOTS = {
  heroCouple: '/assets/img/1.jpg',
  loginPortrait: '/assets/img/2.jpg',
  profileAvatar: '/assets/img/3.jpg',
  drawerAvatar: '/assets/img/4.jpg',
  homeMemories: ['/assets/img/5.jpg', '/assets/img/6.jpg', '/assets/img/7.jpg', '/assets/img/8.jpg'],
  homeCardTree: '/assets/img/9.jpg',
  homeCardPet: '/assets/img/10.jpg',
  homeCardChest: '/assets/img/11.jpg',
  musicCovers: [
    '/assets/img/12.jpg',
    '/assets/img/13.jpg',
    '/assets/img/14.jpg',
    '/assets/img/15.jpg',
    '/assets/img/16.jpg',
  ],
};

/**
 * Retorna a URL real correspondente do álbum carregado pelo usuário (ou fallback numerado local).
 */
export function getCouplePhotoUrl(photos: MemoryPhoto[], slotIndex: number, fallbackUrl: string): string {
  const candidate = photos[slotIndex];
  if (candidate?.url) return candidate.url;
  return fallbackUrl;
}
