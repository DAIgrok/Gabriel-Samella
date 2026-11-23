import JSZip from 'jszip';
import { compressImageToDataUrl } from '../services/googleDrive';

export interface ExtractedZipPhoto {
  fileName: string;
  dataUrl: string;
  aspect: 'portrait' | 'landscape' | 'square';
}

const IMAGE_EXTENSION_RE = /\.(png|jpe?g|webp|gif|bmp)$/i;

function mimeFromExtension(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.bmp')) return 'image/bmp';
  return 'image/jpeg';
}

/**
 * Garante que a imagem comprimida caiba com folga no limite de documento (<= 700 KB)
 */
export async function compressPhotoSafe(
  blob: Blob
): Promise<{ dataUrl: string; aspect: 'portrait' | 'landscape' | 'square' }> {
  let result = await compressImageToDataUrl(blob, 1100, 0.78);
  if (result.dataUrl.length > 680_000) {
    result = await compressImageToDataUrl(blob, 820, 0.65);
  }
  if (result.dataUrl.length > 680_000) {
    result = await compressImageToDataUrl(blob, 640, 0.54);
  }
  return result;
}

/**
 * Extrai todas as imagens válidas de um arquivo .zip no navegador e comprime cada uma
 */
export async function extractPhotosFromZipFile(
  zipFile: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedZipPhoto[]> {
  const zip = await JSZip.loadAsync(zipFile);
  const entries = Object.values(zip.files).filter((entry) => {
    if (entry.dir) return false;
    const cleanName = entry.name.split('/').pop() || '';
    if (!cleanName || cleanName.startsWith('.')) return false;
    if (entry.name.includes('__MACOSX/')) return false;
    return IMAGE_EXTENSION_RE.test(cleanName);
  });

  const results: ExtractedZipPhoto[] = [];
  const total = entries.length;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    try {
      const rawBuffer = await entry.async('arraybuffer');
      const blob = new Blob([rawBuffer], { type: mimeFromExtension(entry.name) });
      const { dataUrl, aspect } = await compressPhotoSafe(blob);
      results.push({
        fileName: entry.name.split('/').pop() || `foto-${i + 1}.jpg`,
        dataUrl,
        aspect,
      });
    } catch {
      // Pula arquivos corrompidos dentro do .zip sem interromper o lote
    }
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}
