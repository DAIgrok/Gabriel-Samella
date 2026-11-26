import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const PORT = Number(process.env.PORT || 3000);
const CACHE_DIR = '/tmp/nossomundo-glb';
const PUBLIC_GLB_DIR = path.join(process.cwd(), 'public', 'glb');

const GLB_DRIVE_CATALOG: Record<string, { fileId: string; canonicalName: string }> = {
  'forest-sided_a_peaceful_place_to_live_diorama.glb': {
    fileId: '1AORBPPf_9wstvyRt1DOann55Zm3g2wzE',
    canonicalName: 'forest-sided_a_peaceful_place_to_live_diorama.glb',
  },
  'stylized_tree_diorama.glb': {
    fileId: '1kEG8ekOebAdEGm4ZwNlaS5_3XvmixZUh',
    canonicalName: 'stylized_tree_diorama.glb',
  },
  'stylized_tree_diorama (1).glb': {
    fileId: '1kEG8ekOebAdEGm4ZwNlaS5_3XvmixZUh',
    canonicalName: 'stylized_tree_diorama.glb',
  },
};

const inFlightDownloads = new Map<string, Promise<string>>();

function hasValidGlbMagic(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size < 1024) return false;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    return buf.toString('ascii') === 'glTF';
  } catch {
    return false;
  }
}

async function ensureLocalGlbFile(requestedFilename: string): Promise<string> {
  const entry = GLB_DRIVE_CATALOG[requestedFilename];
  if (!entry) {
    throw new Error('Unknown GLB asset');
  }

  // 1. Check public/glb/ first (if bundled externally)
  const publicCandidate = path.join(PUBLIC_GLB_DIR, entry.canonicalName);
  if (hasValidGlbMagic(publicCandidate)) {
    return publicCandidate;
  }

  // 2. Check local /tmp cache
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cacheTarget = path.join(CACHE_DIR, entry.canonicalName);
  if (hasValidGlbMagic(cacheTarget)) {
    return cacheTarget;
  }

  // 3. Deduplicated server-side download (no user Drive OAuth required)
  const existing = inFlightDownloads.get(entry.canonicalName);
  if (existing) return existing;

  const downloadPromise = (async () => {
    const tempPath = `${cacheTarget}.${Date.now()}.part`;
    try {
      const driveUrl = `https://drive.usercontent.google.com/download?id=${entry.fileId}&export=download&confirm=t`;
      const response = await fetch(driveUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status} while downloading GLB`);
      }

      const nodeStream = Readable.fromWeb(response.body as unknown as import('node:stream/web').ReadableStream);
      const writeStream = fs.createWriteStream(tempPath);
      await pipeline(nodeStream, writeStream);

      if (!hasValidGlbMagic(tempPath)) {
        fs.rmSync(tempPath, { force: true });
        throw new Error('Downloaded asset is not a valid binary glTF (.glb)');
      }

      fs.renameSync(tempPath, cacheTarget);
      return cacheTarget;
    } catch (err) {
      fs.rmSync(tempPath, { force: true });
      throw err;
    } finally {
      inFlightDownloads.delete(entry.canonicalName);
    }
  })();

  inFlightDownloads.set(entry.canonicalName, downloadPromise);
  return downloadPromise;
}

async function startServer() {
  const app = express();

  app.get('/glb/:filename', async (req, res) => {
    const rawName = decodeURIComponent(req.params.filename || '');
    if (!GLB_DRIVE_CATALOG[rawName]) {
      res.status(404).json({ error: 'GLB not found' });
      return;
    }

    try {
      const filePath = await ensureLocalGlbFile(rawName);
      res.setHeader('Content-Type', 'model/gltf-binary');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(filePath);
    } catch (err) {
      console.error('[glb-proxy]', err);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Failed to prepare GLB diorama' });
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    // Pre-warm both local GLB files in background without blocking startup
    void ensureLocalGlbFile('forest-sided_a_peaceful_place_to_live_diorama.glb').catch(() => {});
    void ensureLocalGlbFile('stylized_tree_diorama.glb').catch(() => {});
  });
}

void startServer();
