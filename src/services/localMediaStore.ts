import { useEffect, useState } from 'react';

const DB_NAME = 'nossomundo_media_v1';
const STORE_NAME = 'blobs';
const IDB_PREFIX = 'idb://';

const objectUrlCache = new Map<string, string>();
let dbPromise: Promise<IDBDatabase> | null = null;

function openMediaDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export function isIdbMediaUrl(url?: string): boolean {
  return Boolean(url && url.startsWith(IDB_PREFIX));
}

export async function saveMediaBlob(key: string, blob: Blob): Promise<string> {
  const fullKey = key.startsWith(IDB_PREFIX) ? key : `${IDB_PREFIX}${key}`;
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, fullKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const objUrl = URL.createObjectURL(blob);
    objectUrlCache.set(fullKey, objUrl);
    return fullKey;
  } catch {
    // Fallback to Data URL for small payloads if IDB is blocked
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Falha ao salvar mídia'));
      reader.readAsDataURL(blob);
    });
  }
}

export async function deleteMediaBlob(url?: string): Promise<void> {
  if (!url || !url.startsWith(IDB_PREFIX)) return;
  const cached = objectUrlCache.get(url);
  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(url);
  }
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(url);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore cleanup errors
  }
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUrl.slice(0, commaIdx);
    const body = dataUrl.slice(commaIdx + 1);
    const mimeMatch = /data:([^;]+)/.exec(header);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    if (header.includes(';base64')) {
      const bin = atob(body);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(body)], { type: mime });
  } catch {
    return null;
  }
}

export async function resolveMediaUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) {
    const cached = objectUrlCache.get(url);
    if (cached) return cached;
    const blob = dataUrlToBlob(url);
    if (blob) {
      const objUrl = URL.createObjectURL(blob);
      objectUrlCache.set(url, objUrl);
      return objUrl;
    }
    return url;
  }
  if (!url.startsWith(IDB_PREFIX)) return url;

  const cached = objectUrlCache.get(url);
  if (cached) return cached;

  try {
    const db = await openMediaDB();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(url);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!blob) return '';
    const objUrl = URL.createObjectURL(blob);
    objectUrlCache.set(url, objUrl);
    return objUrl;
  } catch {
    return '';
  }
}

export function useResolvedMediaUrl(url?: string): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      const cached = objectUrlCache.get(url);
      if (cached) return cached;
      const blob = dataUrlToBlob(url);
      if (blob) {
        const objUrl = URL.createObjectURL(blob);
        objectUrlCache.set(url, objUrl);
        return objUrl;
      }
      return url;
    }
    if (!url.startsWith(IDB_PREFIX)) return url;
    return objectUrlCache.get(url) || '';
  });

  useEffect(() => {
    let active = true;
    if (!url) {
      setResolved('');
      return;
    }
    if (!url.startsWith(IDB_PREFIX) && !url.startsWith('data:')) {
      setResolved(url);
      return;
    }
    const cached = objectUrlCache.get(url);
    if (cached) {
      setResolved(cached);
      return;
    }
    resolveMediaUrl(url).then((res) => {
      if (active) setResolved(res);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return resolved;
}
