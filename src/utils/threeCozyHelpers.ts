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

export async function loadCachedGlbInstance(
  url: string,
  targetHeight = 1.45,
  centerAtZeroXZ = true
): Promise<LoadedGlbInstance> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Empty GLB URL');
  }

  let promise = gltfCache.get(cleanUrl);
  if (!promise) {
    const loader = getSharedGltfLoader();
    promise = resolveMediaUrl(cleanUrl).then(
      (resolvedUrl) =>
        new Promise<GLTF>((resolve, reject) => {
          loader.load(resolvedUrl, resolve, undefined, (err) => {
            gltfCache.delete(cleanUrl);
            reject(err);
          });
        })
    );
    gltfCache.set(cleanUrl, promise);
  }

  const gltf = await promise;
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
            m.flatShading = false;
            m.envMapIntensity = Math.max(m.envMapIntensity || 0.75, 0.75);
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
