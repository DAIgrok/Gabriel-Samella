export interface GlbAnimationInfo {
  name: string;
  channels: number;
  samplers: number;
}

export interface GlbAnalysisResult {
  isValid: boolean;
  format: 'glb' | 'gltf' | 'html' | 'invalid';
  fileSizeBytes: number;
  gltfVersion?: number;
  generator?: string;
  meshCount: number;
  meshNames: string[];
  materialCount: number;
  materialNames: string[];
  textureCount: number;
  usesSpecGlossExtension: boolean;
  animations: GlbAnimationInfo[];
  warnings: string[];
  error?: string;
}

const GLB_MAGIC = 0x46546c67; // "glTF" little-endian
const CHUNK_JSON = 0x4e4f534a; // "JSON" little-endian

const CLIP_LABEL_MAP: Record<string, string> = {
  idle: 'Parado',
  happy: 'Feliz',
  jump: 'Pular',
  eat: 'Comer',
  feeding: 'Alimentando',
  sit: 'Sentar',
  sitidle: 'Sentadinho',
  sitstandup: 'Levantar',
  stand: 'Em Pé',
  walk: 'Andar',
  walk_2: 'Passear',
  run: 'Correr',
  dig: 'Cavar / Brincar',
  dance: 'Dançar',
  spin: 'Girar',
  wave: 'Acenar',
  kiss: 'Beijo',
  sleep: 'Dormir',
  bath: 'Banho',
  pet: 'Carinho',
  meow: 'Miar',
};

export function translateGlbClipLabel(rawName: string): string {
  const clean = rawName.trim();
  if (!clean) return 'Animação';
  const key = clean.toLowerCase().replace(/\s+/g, '_');
  if (CLIP_LABEL_MAP[key]) return CLIP_LABEL_MAP[key];
  // Match prefix/partial keywords cleanly
  if (key.includes('walk')) return 'Andar';
  if (key.includes('run')) return 'Correr';
  if (key.includes('jump') || key.includes('leap')) return 'Pular';
  if (key.includes('eat') || key.includes('feed')) return 'Comer';
  if (key.includes('sitidle')) return 'Sentadinho';
  if (key.includes('sitstand')) return 'Levantar';
  if (key.includes('sit')) return 'Sentar';
  if (key.includes('happy') || key.includes('joy')) return 'Feliz';
  if (key.includes('dig') || key.includes('play')) return 'Brincar';
  if (key.includes('dance')) return 'Dançar';
  if (key.includes('sleep') || key.includes('rest')) return 'Dormir';
  if (key.includes('idle')) return 'Parado';
  return clean.replace(/[_-]+/g, ' ');
}

function parseGltfJsonObject(json: Record<string, unknown>, byteLength: number, format: 'glb' | 'gltf'): GlbAnalysisResult {
  const warnings: string[] = [];
  const asset = (json.asset && typeof json.asset === 'object' ? json.asset : {}) as Record<string, unknown>;
  const meshesRaw = Array.isArray(json.meshes) ? json.meshes : [];
  const materialsRaw = Array.isArray(json.materials) ? json.materials : [];
  const texturesRaw = Array.isArray(json.textures) ? json.textures : [];
  const imagesRaw = Array.isArray(json.images) ? json.images : [];
  const animationsRaw = Array.isArray(json.animations) ? json.animations : [];
  const extensionsUsed = Array.isArray(json.extensionsUsed) ? json.extensionsUsed.map(String) : [];

  const meshNames = meshesRaw.map((m, idx) =>
    m && typeof m === 'object' && typeof (m as { name?: unknown }).name === 'string' && (m as { name: string }).name.trim()
      ? (m as { name: string }).name.trim()
      : `Parte_${idx + 1}`
  );
  const materialNames = materialsRaw.map((m, idx) =>
    m && typeof m === 'object' && typeof (m as { name?: unknown }).name === 'string' && (m as { name: string }).name.trim()
      ? (m as { name: string }).name.trim()
      : `Material_${idx + 1}`
  );
  const animations: GlbAnimationInfo[] = animationsRaw.map((a, idx) => {
    const obj = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
    const rawName = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : `Anim_${idx + 1}`;
    const channels = Array.isArray(obj.channels) ? obj.channels.length : 0;
    const samplers = Array.isArray(obj.samplers) ? obj.samplers.length : 0;
    return { name: rawName, channels, samplers };
  });

  const usesSpecGlossExtension =
    extensionsUsed.includes('KHR_materials_pbrSpecularGlossiness') ||
    materialsRaw.some((m) => {
      if (!m || typeof m !== 'object') return false;
      const exts = (m as { extensions?: Record<string, unknown> }).extensions;
      return Boolean(exts && exts.KHR_materials_pbrSpecularGlossiness);
    });

  if (meshesRaw.length === 0) {
    warnings.push('Nenhuma malha 3D encontrada dentro do arquivo.');
  }
  if (animations.length === 0) {
    warnings.push('O arquivo não possui clipes de animação embutidos; o app aplicará movimentos 3D suaves automaticamente.');
  }
  if (usesSpecGlossExtension) {
    warnings.push('Usa KHR_materials_pbrSpecularGlossiness (suportado com iluminação neutra).');
  }

  return {
    isValid: meshesRaw.length > 0,
    format,
    fileSizeBytes: byteLength,
    gltfVersion: typeof asset.version === 'string' ? Number.parseFloat(asset.version) || 2 : 2,
    generator: typeof asset.generator === 'string' ? asset.generator : undefined,
    meshCount: meshesRaw.length,
    meshNames,
    materialCount: materialsRaw.length,
    materialNames,
    textureCount: Math.max(texturesRaw.length, imagesRaw.length),
    usesSpecGlossExtension,
    animations,
    warnings,
  };
}

export function analyzeGlbArrayBuffer(buffer: ArrayBuffer): GlbAnalysisResult {
  const byteLength = buffer.byteLength;
  if (byteLength < 12) {
    return {
      isValid: false,
      format: 'invalid',
      fileSizeBytes: byteLength,
      meshCount: 0,
      meshNames: [],
      materialCount: 0,
      materialNames: [],
      textureCount: 0,
      usesSpecGlossExtension: false,
      animations: [],
      warnings: [],
      error: 'Arquivo muito pequeno para ser um modelo .GLB válido.',
    };
  }

  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);

  if (magic === GLB_MAGIC) {
    const glbVersion = view.getUint32(4, true);
    const totalLength = view.getUint32(8, true);
    let offset = 12;
    let jsonObject: Record<string, unknown> | null = null;

    while (offset + 8 <= Math.min(byteLength, totalLength || byteLength)) {
      const chunkLen = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const chunkStart = offset + 8;
      const chunkEnd = chunkStart + chunkLen;
      if (chunkEnd > byteLength) break;

      if (chunkType === CHUNK_JSON) {
        const bytes = new Uint8Array(buffer, chunkStart, chunkLen);
        const text = new TextDecoder('utf-8').decode(bytes).replace(/\0+$/, '').trim();
        try {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            jsonObject = parsed as Record<string, unknown>;
          }
        } catch {
          return {
            isValid: false,
            format: 'invalid',
            fileSizeBytes: byteLength,
            gltfVersion: glbVersion,
            meshCount: 0,
            meshNames: [],
            materialCount: 0,
            materialNames: [],
            textureCount: 0,
            usesSpecGlossExtension: false,
            animations: [],
            warnings: [],
            error: 'Cabeçalho JSON interno do .GLB está corrompido.',
          };
        }
        break;
      }
      offset = chunkEnd;
    }

    if (!jsonObject) {
      return {
        isValid: false,
        format: 'invalid',
        fileSizeBytes: byteLength,
        gltfVersion: glbVersion,
        meshCount: 0,
        meshNames: [],
        materialCount: 0,
        materialNames: [],
        textureCount: 0,
        usesSpecGlossExtension: false,
        animations: [],
        warnings: [],
        error: 'Arquivo .GLB sem bloco JSON de estrutura 3D.',
      };
    }

    const res = parseGltfJsonObject(jsonObject, byteLength, 'glb');
    res.gltfVersion = glbVersion;
    return res;
  }

  // Fallback check: plain text (.gltf JSON or accidentally saved HTML page)
  const headText = new TextDecoder('utf-8')
    .decode(new Uint8Array(buffer, 0, Math.min(byteLength, 2048)))
    .trim();
  const lowerHead = headText.toLowerCase();
  if (lowerHead.startsWith('<!doctype') || lowerHead.startsWith('<html')) {
    return {
      isValid: false,
      format: 'html',
      fileSizeBytes: byteLength,
      meshCount: 0,
      meshNames: [],
      materialCount: 0,
      materialNames: [],
      textureCount: 0,
      usesSpecGlossExtension: false,
      animations: [],
      warnings: [],
      error: 'O link retornou uma página HTML em vez de um arquivo .glb binário.',
    };
  }

  if (headText.startsWith('{')) {
    try {
      const fullText = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
      const parsed = JSON.parse(fullText) as Record<string, unknown>;
      if (parsed && (parsed.asset || parsed.meshes)) {
        return parseGltfJsonObject(parsed, byteLength, 'gltf');
      }
    } catch {
      // Fall through to invalid
    }
  }

  return {
    isValid: false,
    format: 'invalid',
    fileSizeBytes: byteLength,
    meshCount: 0,
    meshNames: [],
    materialCount: 0,
    materialNames: [],
    textureCount: 0,
    usesSpecGlossExtension: false,
    animations: [],
    warnings: [],
    error: 'Formato não reconhecido como .GLB ou .GLTF válido.',
  };
}

export async function analyzeGlbFile(file: File): Promise<GlbAnalysisResult> {
  const buf = await file.arrayBuffer();
  return analyzeGlbArrayBuffer(buf);
}

export async function analyzeGlbUrl(
  rawUrl: string,
  resolveMediaFn?: (url: string) => Promise<string>
): Promise<GlbAnalysisResult> {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      format: 'invalid',
      fileSizeBytes: 0,
      meshCount: 0,
      meshNames: [],
      materialCount: 0,
      materialNames: [],
      textureCount: 0,
      usesSpecGlossExtension: false,
      animations: [],
      warnings: [],
      error: 'Nenhum link ou arquivo informado.',
    };
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes('skfb.ly/') || lower.includes('sketchfab.com/') || lower === 'https://supabase.co') {
    return {
      isValid: false,
      format: 'html',
      fileSizeBytes: 0,
      meshCount: 0,
      meshNames: [],
      materialCount: 0,
      materialNames: [],
      textureCount: 0,
      usesSpecGlossExtension: false,
      animations: [],
      warnings: [],
      error: 'Esse link aponta para uma página web (Sketchfab/site), não para o arquivo .glb direto. Envie o .glb baixado pelo botão acima.',
    };
  }

  try {
    const resolved = resolveMediaFn ? await resolveMediaFn(trimmed) : trimmed;
    const response = await fetch(resolved);
    if (!response.ok) {
      return {
        isValid: false,
        format: 'invalid',
        fileSizeBytes: 0,
        meshCount: 0,
        meshNames: [],
        materialCount: 0,
        materialNames: [],
        textureCount: 0,
        usesSpecGlossExtension: false,
        animations: [],
        warnings: [],
        error: `Não foi possível baixar o arquivo (HTTP ${response.status}).`,
      };
    }
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      return {
        isValid: false,
        format: 'html',
        fileSizeBytes: 0,
        meshCount: 0,
        meshNames: [],
        materialCount: 0,
        materialNames: [],
        textureCount: 0,
        usesSpecGlossExtension: false,
        animations: [],
        warnings: [],
        error: 'O servidor respondeu HTML em vez do binário .glb.',
      };
    }
    const buf = await response.arrayBuffer();
    return analyzeGlbArrayBuffer(buf);
  } catch (err) {
    return {
      isValid: false,
      format: 'invalid',
      fileSizeBytes: 0,
      meshCount: 0,
      meshNames: [],
      materialCount: 0,
      materialNames: [],
      textureCount: 0,
      usesSpecGlossExtension: false,
      animations: [],
      warnings: [],
      error: err instanceof Error ? err.message : 'Erro ao inspecionar URL do modelo 3D.',
    };
  }
}

export async function fileToSyncableGlbDataUrl(file: File, maxBytes = 2_400_000): Promise<string | null> {
  if (file.size > maxBytes) return null;
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...slice);
  }
  const mime = file.name.toLowerCase().endsWith('.gltf') ? 'model/gltf+json' : 'model/gltf-binary';
  return `data:${mime};base64,${btoa(binary)}`;
}
