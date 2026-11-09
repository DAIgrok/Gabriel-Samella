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
 * Fetch photos from Google Drive folder using an OAuth access token
 */
export const fetchDriveFolderPhotos = async (
  folderId: string = TARGET_DRIVE_FOLDER_ID,
  accessToken: string
): Promise<MemoryPhoto[]> => {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType contains 'image/'`);
  const fields = encodeURIComponent('files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, createdTime, imageMediaMetadata, description)');
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

  return files.map((file, index) => {
    const num = index + 1;
    const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : `Foto #${num}`;
    const dateFormatted = file.createdTime
      ? new Date(file.createdTime).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : `Memória #${num}`;

    // Aspect ratio calculation from metadata if available
    let aspect: 'portrait' | 'landscape' | 'square' = 'square';
    if (file.imageMediaMetadata?.width && file.imageMediaMetadata?.height) {
      const ratio = file.imageMediaMetadata.width / file.imageMediaMetadata.height;
      if (ratio > 1.2) aspect = 'landscape';
      else if (ratio < 0.85) aspect = 'portrait';
    }

    return {
      id: `drive-${file.id}`,
      index: num,
      title: cleanName.length > 28 ? `Nosso Momento #${num}` : cleanName,
      subtitle: file.description || `Momento especial número ${num} do nosso amor ♡`,
      date: dateFormatted,
      url: getDriveImageUrl(file.id, true),
      aspect,
      isFavorite: num <= 6,
      caption: `Foto importada do Google Drive: ${file.name}`,
    };
  });
};
