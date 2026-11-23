import { MemoryPhoto } from '../types';

/**
 * Mapeamento dinâmico exclusivamente das fotos reais adicionadas pela galeria do casal.
 * Nenhuma imagem estática de placeholder ou gerada por IA é referenciada aqui.
 */
export const REAL_PHOTO_SLOTS = {
  heroCouple: '',
  loginPortrait: '',
  profileAvatar: '',
  drawerAvatar: '',
  homeMemories: [] as string[],
  homeCardTree: '',
  homeCardPet: '',
  homeCardChest: '',
  musicCovers: [] as string[],
};

/**
 * Retorna a URL real correspondente do álbum carregado pelo casal (ou vazio se nenhuma foto foi enviada ainda).
 */
export function getCouplePhotoUrl(photos: MemoryPhoto[], slotIndex: number, fallbackUrl = ''): string {
  if (!photos || photos.length === 0) return fallbackUrl;
  const candidate = photos[slotIndex % photos.length];
  if (candidate?.url) return candidate.url;
  return fallbackUrl;
}

