import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { resolveMediaUrl } from '../services/localMediaStore';

export function detectSoftwareWebGL(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/SwiftShader|llvmpipe|Software/i.test(navigator.userAgent)) return true;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
      return /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(r);
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Configures WebGLRenderer for Cozy Stylized 3D studio renders:
 * - ACESFilmicToneMapping with exposure 1.15
 * - PCFSoftShadowMap (unless software GL)
 * - SRGBColorSpace
 * - Soft RoomEnvironment IBL reflections
 */
export function setupCozyStudioRenderer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  isSoftwareGl: boolean
): () => void {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let pmremGenerator: THREE.PMREMGenerator | null = null;
  let envRT: THREE.WebGLRenderTarget | null = null;
  let envTex: THREE.Texture | null = null;

  if (!isSoftwareGl) {
    try {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      envRT = pmremGenerator.fromScene(roomEnv, 0.04);
      envTex = envRT.texture;
      scene.environment = envTex;
      roomEnv.dispose();
    } catch {
      // Safe fallback if PMREM isn't supported on device
    }
  }

  return () => {
    scene.environment = null;
    envRT?.dispose();
    pmremGenerator?.dispose();
  };
}

export interface CozyThreePointOptions {
  skyColor?: THREE.ColorRepresentation;
  groundColor?: THREE.ColorRepresentation;
  hemiIntensity?: number;
  keyColor?: THREE.ColorRepresentation;
  keyIntensity?: number;
  keyPosition?: [number, number, number];
  rimColor?: THREE.ColorRepresentation;
  rimIntensity?: number;
  rimPosition?: [number, number, number];
  fillColor?: THREE.ColorRepresentation;
  fillIntensity?: number;
  shadowMapSize?: number;
  shadowExtent?: number;
  isSoftwareGl?: boolean;
}

export interface CozyLightingRig {
  hemiLight: THREE.HemisphereLight;
  keyLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
}

/**
 * Sets up a vibrant pastel 3-point Cozy Stylized studio lighting rig:
 * 1) Sky-blue/lavender + warm ground bounce HemisphereLight
 * 2) Key DirectionalLight with soft PCF shadows
 * 3) Rim DirectionalLight behind subject to carve silhouette out of background
 * 4) Gentle front/side fill light for plush/vinyl readability
 */
export function addCozyThreePointLights(
  scene: THREE.Scene,
  options: CozyThreePointOptions = {}
): CozyLightingRig {
  const {
    skyColor = 0xcfe8ff,
    groundColor = 0xffdec7,
    hemiIntensity = 1.05,
    keyColor = 0xfff6e9,
    keyIntensity = 1.95,
    keyPosition = [4.5, 6.5, 5.0],
    rimColor = 0xf472b6,
    rimIntensity = 1.35,
    rimPosition = [-4.0, 4.2, -5.0],
    fillColor = 0xd8b4fe,
    fillIntensity = 0.65,
    shadowMapSize = 1024,
    shadowExtent = 4.5,
    isSoftwareGl = false,
  } = options;

  const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
  hemiLight.position.set(0, 8, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(keyColor, keyIntensity);
  keyLight.position.set(...keyPosition);
  keyLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    keyLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -shadowExtent;
    keyLight.shadow.camera.right = shadowExtent;
    keyLight.shadow.camera.top = shadowExtent;
    keyLight.shadow.camera.bottom = -shadowExtent;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.radius = 3.5;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(rimColor, rimIntensity);
  rimLight.position.set(...rimPosition);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(fillColor, fillIntensity);
  fillLight.position.set(-4.5, 2.5, 4.2);
  scene.add(fillLight);

  return { hemiLight, keyLight, rimLight, fillLight };
}

// --- GLTF / .GLB Cached Loader ---
const gltfCache = new Map<string, Promise<GLTF>>();
const gltfProgressListeners = new Map<string, Set<(percent: number) => void>>();
const gltfLoadedUrls = new Set<string>();
let sharedLoader: GLTFLoader | null = null;

function getSharedGltfLoader(): GLTFLoader {
  if (sharedLoader) return sharedLoader;
  const loader = new GLTFLoader();
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(draco);
  } catch {
    // Draco optional if standard GLB
  }
  sharedLoader = loader;
  return loader;
}

export interface LoadedGlbInstance {
  group: THREE.Group;
  animations: THREE.AnimationClip[];
}

export interface LoadGlbOptions {
  targetHeight?: number;
  centerAtZeroXZ?: boolean;
  preserveMaterials?: boolean;
  onProgress?: (percent: number) => void;
}

export async function loadCachedGlbInstance(
  url: string,
  targetHeightOrOptions: number | LoadGlbOptions = 1.45,
  centerAtZeroXZArg = true
): Promise<LoadedGlbInstance> {
  const opts: LoadGlbOptions =
    typeof targetHeightOrOptions === 'number'
      ? { targetHeight: targetHeightOrOptions, centerAtZeroXZ: centerAtZeroXZArg }
      : targetHeightOrOptions;

  const targetHeight = opts.targetHeight ?? 1.45;
  const centerAtZeroXZ = opts.centerAtZeroXZ ?? true;
  const preserveMaterials = opts.preserveMaterials ?? false;
  const onProgress = opts.onProgress;

  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Empty GLB URL');
  }

  if (onProgress) {
    if (gltfLoadedUrls.has(cleanUrl)) {
      onProgress(100);
    } else {
      let set = gltfProgressListeners.get(cleanUrl);
      if (!set) {
        set = new Set();
        gltfProgressListeners.set(cleanUrl, set);
      }
      set.add(onProgress);
    }
  }

  const notifyProgress = (pct: number) => {
    const listeners = gltfProgressListeners.get(cleanUrl);
    if (!listeners) return;
    listeners.forEach((cb) => cb(pct));
  };

  let promise = gltfCache.get(cleanUrl);
  if (!promise) {
    const loader = getSharedGltfLoader();
    promise = resolveMediaUrl(cleanUrl).then(
      (resolvedUrl) =>
        new Promise<GLTF>((resolve, reject) => {
          loader.load(
            resolvedUrl,
            (gltf) => {
              gltfLoadedUrls.add(cleanUrl);
              notifyProgress(100);
              gltfProgressListeners.delete(cleanUrl);
              resolve(gltf);
            },
            (xhr) => {
              if (xhr.lengthComputable && xhr.total > 0) {
                const pct = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
                notifyProgress(pct);
              } else if (xhr.loaded > 0) {
                const approxMb = xhr.loaded / (1024 * 1024);
                const pct = Math.min(95, Math.round((approxMb / (approxMb + 18)) * 95));
                notifyProgress(pct);
              }
            },
            (err) => {
              gltfCache.delete(cleanUrl);
              gltfLoadedUrls.delete(cleanUrl);
              gltfProgressListeners.delete(cleanUrl);
              reject(err);
            }
          );
        })
    );
    gltfCache.set(cleanUrl, promise);
  }

  try {
    const gltf = await promise;
    if (onProgress) {
      onProgress(100);
      gltfProgressListeners.get(cleanUrl)?.delete(onProgress);
    }

    const clone = SkeletonUtils.clone(gltf.scene) as THREE.Group;
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.y, size.x, size.z, 0.001);
    const scaleFactor = targetHeight / maxDim;

    const wrapper = new THREE.Group();
    clone.scale.multiplyScalar(scaleFactor);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              if (!preserveMaterials) {
                m.flatShading = false;
              }
              m.envMapIntensity = Math.max(m.envMapIntensity ?? 0.65, 0.65);
              m.needsUpdate = true;
            }
          });
        }
      }
    });

    wrapper.add(clone);
    wrapper.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    if (centerAtZeroXZ) {
      clone.position.x -= scaledCenter.x;
      clone.position.z -= scaledCenter.z;
    }
    clone.position.y -= scaledBox.min.y;

    return {
      group: wrapper,
      animations: gltf.animations || [],
    };
  } catch (err) {
    if (onProgress) {
      gltfProgressListeners.get(cleanUrl)?.delete(onProgress);
    }
    throw err;
  }
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (!mat) return;
        const std = mat as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.normalMap?.dispose();
        std.roughnessMap?.dispose();
        std.emissiveMap?.dispose();
        mat.dispose();
      });
    }
  });
}
