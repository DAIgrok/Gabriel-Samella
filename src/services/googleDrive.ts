import { MemoryPhoto } from '../types';

export const TARGET_DRIVE_FOLDER_ID = '1XQo2opZhSpZBIA-PVdyYb_mzl6Yz3nXZ';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  createdTime?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
    time?: string;
  };
  description?: string;
}

/**
 * Format Google Drive image URL for high-quality display.
 */
export const getDriveImageUrl = (fileId: string, highRes = true): string => {
  if (highRes) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
};

/**
 * Alternative direct Googleusercontent thumbnail format
 */
export const getDirectDriveUrl = (fileId: string): string => {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};

/**
 * Compress any image Blob or File via offscreen Canvas to a compact JPEG data URL
 * so photos can safely sync in Firestore documents (< 1 MB) and persist offline across devices.
 */
export const compressImageToDataUrl = async (
  fileOrBlob: Blob,
  maxDimension: number = 1100,
  initialQuality: number = 0.78
): Promise<{ dataUrl: string; aspect: 'portrait' | 'landscape' | 'square' }> => {
  const objectUrl = URL.createObjectURL(fileOrBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Falha ao decodificar imagem'));
      el.src = objectUrl;
    });

    const natW = img.naturalWidth || img.width || 800;
    const natH = img.naturalHeight || img.height || 800;
    const ratio = natW / natH;
    let aspect: 'portrait' | 'landscape' | 'square' = 'square';
    if (ratio > 1.2) aspect = 'landscape';
    else if (ratio < 0.85) aspect = 'portrait';

    let targetW = natW;
    let targetH = natH;
    if (natW > maxDimension || natH > maxDimension) {
      if (natW >= natH) {
        targetW = maxDimension;
        targetH = Math.max(1, Math.round((natH / natW) * maxDimension));
      } else {
        targetH = maxDimension;
        targetW = Math.max(1, Math.round((natW / natH) * maxDimension));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Contexto 2D indisponível');
    }
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // Step down quality if needed so Firestore doc stays comfortably below 450KB
    let quality = initialQuality;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length > 420_000 && quality > 0.42) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    // If still oversized on huge aspect, scale down once more
    if (dataUrl.length > 520_000) {
      const smallerCanvas = document.createElement('canvas');
      smallerCanvas.width = Math.round(targetW * 0.72);
      smallerCanvas.height = Math.round(targetH * 0.72);
      const sCtx = smallerCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(img, 0, 0, smallerCanvas.width, smallerCanvas.height);
        dataUrl = smallerCanvas.toDataURL('image/jpeg', 0.68);
      }
    }

    return { dataUrl, aspect };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Download an image file from Google Drive using OAuth Bearer token and compress it
 * into a persistent JPEG data URL so Samella can view it on any device without signing in to Drive.
 */
export const downloadAndCompressDrivePhoto = async (
  fileId: string,
  accessToken: string,
  fallbackThumb?: string
): Promise<string> => {
  try {
    const mediaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (mediaRes.ok) {
      const blob = await mediaRes.blob();
      if (blob.size > 0 && blob.type.startsWith('image/')) {
        const { dataUrl } = await compressImageToDataUrl(blob, 1100, 0.76);
        return dataUrl;
      }
    }
  } catch {
    // Fall back to Drive URL if CORS or network blocks alt=media fetch
  }
  return fallbackThumb || getDriveImageUrl(fileId, true);
};

/**
 * Fetch photos from Google Drive folder using an OAuth access token.
 * Downloads & compresses images so they persist across devices in Firestore.
 */
export const fetchDriveFolderPhotos = async (
  folderId: string = TARGET_DRIVE_FOLDER_ID,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
): Promise<MemoryPhoto[]> => {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType contains 'image/'`);
  const fields = encodeURIComponent(
    'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime, imageMediaMetadata, description)'
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=100&orderBy=createdTime asc,name asc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.status || response.status < 200 || response.status >= 300) {
    const errText = await response.text();
    throw new Error(`Erro ao buscar fotos do Google Drive (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const files: DriveFileItem[] = data.files || [];

  const photos: MemoryPhoto[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const num = index + 1;
    const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : `Foto #${num}`;
    const dateFormatted = file.createdTime
      ? new Date(file.createdTime).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : `Memória #${num}`;

    let aspect: 'portrait' | 'landscape' | 'square' = 'square';
    if (file.imageMediaMetadata?.width && file.imageMediaMetadata?.height) {
      const ratio = file.imageMediaMetadata.width / file.imageMediaMetadata.height;
      if (ratio > 1.2) aspect = 'landscape';
      else if (ratio < 0.85) aspect = 'portrait';
    }

    const fallbackDriveUrl = getDriveImageUrl(file.id, true);
    const compressedDataUrl = await downloadAndCompressDrivePhoto(file.id, accessToken, fallbackDriveUrl);

    if (onProgress) {
      onProgress(index + 1, files.length);
    }

    const safeId = `drive-${file.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 54)}`;
    photos.push({
      id: safeId,
      index: num,
      title: cleanName.length > 28 ? `Nosso Momento #${num}` : cleanName,
      subtitle: file.description || `Momento especial número ${num} do nosso amor ♡`,
      date: dateFormatted,
      url: compressedDataUrl,
      driveUrl: fallbackDriveUrl,
      driveFileId: file.id,
      sourceType: 'drive',
      aspect,
      isFavorite: num <= 6,
      inHomeLoop: num <= 12,
      caption: `Foto sincronizada do Google Drive: ${file.name}`,
    });
  }

  return photos;
};
