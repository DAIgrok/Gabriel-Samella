import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Camera,
  Clock,
  CloudFog,
  CloudLightning,
  CloudRain,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Moon,
  Orbit,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Trees,
  X,
} from 'lucide-react';
import {
  DIORAMA_ASSETS,
  DIORAMA_ASSET_LIST,
  DioramaAssetId,
  LimboWeatherMode,
} from '../../data/dioramaAssets';
import {
  detectSoftwareWebGL,
  disposeObject3D,
  loadCachedGlbInstance,
  setupCozyStudioRenderer,
} from '../../utils/threeCozyHelpers';

interface LimboDioramaCanvasProps {
  initialDioramaId?: DioramaAssetId;
  initialWeatherMode?: LimboWeatherMode;
  startFullscreen?: boolean;
  heightClass?: string;
  onCapturePhoto?: (containerEl: HTMLElement | null, title: string, subtitle: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

interface WeatherTarget {
  zenith: THREE.Color;
  mid: THREE.Color;
  horizon: THREE.Color;
  nadir: THREE.Color;
  fogDensity: number;
  sunElevation: number;
  sunAzimuth: number;
  sunOpacity: number;
  moonOpacity: number;
  starOpacity: number;
  cloudColor: THREE.Color;
  cloudOpacity: number;
  cloudSpeed: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  keyColor: THREE.Color;
  keyIntensity: number;
  rimColor: THREE.Color;
  rimIntensity: number;
  rainOpacity: number;
  rainSpeed: number;
  windSlant: number;
  exposure: number;
}

const WEATHER_OPTIONS: {
  id: LimboWeatherMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'auto', label: 'Tempo Real', icon: Clock },
  { id: 'day', label: 'Sol', icon: Sun },
  { id: 'sunset', label: 'Pôr do Sol', icon: Sunrise },
  { id: 'night', label: 'Lua', icon: Moon },
  { id: 'rain', label: 'Chuva', icon: CloudRain },
  { id: 'fog', label: 'Neblina', icon: CloudFog },
  { id: 'storm', label: 'Tempestade', icon: CloudLightning },
];

function computeAutoPhase(): {
  phase: 'dawn' | 'day' | 'sunset' | 'night';
  solarProgress: number;
  label: string;
} {
  const now = new Date();
  const hourDecimal = now.getHours() + now.getMinutes() / 60;
  if (hourDecimal >= 5.2 && hourDecimal < 7.2) {
    return {
      phase: 'dawn',
      solarProgress: (hourDecimal - 5.2) / 2.0,
      label: 'Amanhecer Real',
    };
  }
  if (hourDecimal >= 7.2 && hourDecimal < 16.8) {
    return {
      phase: 'day',
      solarProgress: (hourDecimal - 5.5) / 13.0,
      label: 'Dia Real',
    };
  }
  if (hourDecimal >= 16.8 && hourDecimal < 18.8) {
    return {
      phase: 'sunset',
      solarProgress: 0.85 + ((hourDecimal - 16.8) / 2.0) * 0.15,
      label: 'Pôr do Sol Real',
    };
  }
  return {
    phase: 'night',
    solarProgress: 0.5,
    label: 'Noite Real',
  };
}

function getWeatherPreset(mode: LimboWeatherMode): WeatherTarget {
  const auto = mode === 'auto' ? computeAutoPhase() : null;
  const effective = mode === 'auto' ? auto!.phase : mode;

  if (effective === 'dawn') {
    return {
      zenith: new THREE.Color('#3b2d7a'),
      mid: new THREE.Color('#c084fc'),
      horizon: new THREE.Color('#fda4af'),
      nadir: new THREE.Color('#e9d5ff'),
      fogDensity: 0.022,
      sunElevation: 0.24,
      sunAzimuth: 0.85,
      sunOpacity: 0.95,
      moonOpacity: 0.22,
      starOpacity: 0.22,
      cloudColor: new THREE.Color('#ffe4e6'),
      cloudOpacity: 0.82,
      cloudSpeed: 0.45,
      hemiSky: new THREE.Color('#e9d5ff'),
      hemiGround: new THREE.Color('#fbcfe8'),
      hemiIntensity: 1.05,
      keyColor: new THREE.Color('#ffd4b8'),
      keyIntensity: 2.0,
      rimColor: new THREE.Color('#f472b6'),
      rimIntensity: 1.0,
      rainOpacity: 0,
      rainSpeed: 0,
      windSlant: 0,
      exposure: 1.12,
    };
  }

  if (effective === 'day') {
    const t = auto ? THREE.MathUtils.clamp(auto.solarProgress, 0.15, 0.85) : 0.52;
    const sunElev = Math.sin(t * Math.PI) * 0.72 + 0.18;
    const sunAz = -1.1 + t * 2.2;
    return {
      zenith: new THREE.Color('#2563eb'),
      mid: new THREE.Color('#7dd3fc'),
      horizon: new THREE.Color('#e0f2fe'),
      nadir: new THREE.Color('#dbeafe'),
      fogDensity: 0.017,
      sunElevation: sunElev,
      sunAzimuth: sunAz,
      sunOpacity: 1.0,
      moonOpacity: 0,
      starOpacity: 0,
      cloudColor: new THREE.Color('#ffffff'),
      cloudOpacity: 0.92,
      cloudSpeed: 0.55,
      hemiSky: new THREE.Color('#bae6fd'),
      hemiGround: new THREE.Color('#f3e8ff'),
      hemiIntensity: 1.18,
      keyColor: new THREE.Color('#fffbeb'),
      keyIntensity: 2.45,
      rimColor: new THREE.Color('#e0f2fe'),
      rimIntensity: 0.85,
      rainOpacity: 0,
      rainSpeed: 0,
      windSlant: 0,
      exposure: 1.15,
    };
  }

  if (effective === 'sunset') {
    return {
      zenith: new THREE.Color('#2e1065'),
      mid: new THREE.Color('#9333ea'),
      horizon: new THREE.Color('#fb7185'),
      nadir: new THREE.Color('#831843'),
      fogDensity: 0.023,
      sunElevation: 0.17,
      sunAzimuth: -0.95,
      sunOpacity: 1.0,
      moonOpacity: 0.15,
      starOpacity: 0.32,
      cloudColor: new THREE.Color('#fda4af'),
      cloudOpacity: 0.86,
      cloudSpeed: 0.42,
      hemiSky: new THREE.Color('#f0abfc'),
      hemiGround: new THREE.Color('#fdba74'),
      hemiIntensity: 1.02,
      keyColor: new THREE.Color('#ff9e6d'),
      keyIntensity: 2.25,
      rimColor: new THREE.Color('#ec4899'),
      rimIntensity: 1.25,
      rainOpacity: 0,
      rainSpeed: 0,
      windSlant: 0,
      exposure: 1.12,
    };
  }

  if (effective === 'rain') {
    return {
      zenith: new THREE.Color('#1e293b'),
      mid: new THREE.Color('#334155'),
      horizon: new THREE.Color('#64748b'),
      nadir: new THREE.Color('#3b485c'),
      fogDensity: 0.036,
      sunElevation: 0.45,
      sunAzimuth: 0.5,
      sunOpacity: 0.08,
      moonOpacity: 0.14,
      starOpacity: 0,
      cloudColor: new THREE.Color('#94a3b8'),
      cloudOpacity: 0.96,
      cloudSpeed: 0.95,
      hemiSky: new THREE.Color('#94a3b8'),
      hemiGround: new THREE.Color('#334155'),
      hemiIntensity: 0.95,
      keyColor: new THREE.Color('#cbd5e1'),
      keyIntensity: 1.15,
      rimColor: new THREE.Color('#818cf8'),
      rimIntensity: 0.75,
      rainOpacity: 0.56,
      rainSpeed: 18,
      windSlant: 0.18,
      exposure: 1.02,
    };
  }

  if (effective === 'fog') {
    return {
      zenith: new THREE.Color('#3b2a66'),
      mid: new THREE.Color('#7e68a8'),
      horizon: new THREE.Color('#d8cce8'),
      nadir: new THREE.Color('#c4b5dc'),
      fogDensity: 0.056,
      sunElevation: 0.38,
      sunAzimuth: 0.45,
      sunOpacity: 0.35,
      moonOpacity: 0.25,
      starOpacity: 0.08,
      cloudColor: new THREE.Color('#ede9fe'),
      cloudOpacity: 0.92,
      cloudSpeed: 0.26,
      hemiSky: new THREE.Color('#e9d5ff'),
      hemiGround: new THREE.Color('#c4b5fd'),
      hemiIntensity: 1.15,
      keyColor: new THREE.Color('#f5d0fe'),
      keyIntensity: 1.35,
      rimColor: new THREE.Color('#f9a8d4'),
      rimIntensity: 0.9,
      rainOpacity: 0,
      rainSpeed: 0,
      windSlant: 0,
      exposure: 1.08,
    };
  }

  if (effective === 'storm') {
    return {
      zenith: new THREE.Color('#09071a'),
      mid: new THREE.Color('#1e1b4b'),
      horizon: new THREE.Color('#312e59'),
      nadir: new THREE.Color('#181633'),
      fogDensity: 0.044,
      sunElevation: 0.4,
      sunAzimuth: -0.6,
      sunOpacity: 0,
      moonOpacity: 0.08,
      starOpacity: 0,
      cloudColor: new THREE.Color('#475569'),
      cloudOpacity: 0.98,
      cloudSpeed: 1.65,
      hemiSky: new THREE.Color('#6366f1'),
      hemiGround: new THREE.Color('#1e1b4b'),
      hemiIntensity: 0.72,
      keyColor: new THREE.Color('#a5b4fc'),
      keyIntensity: 0.88,
      rimColor: new THREE.Color('#c084fc'),
      rimIntensity: 0.95,
      rainOpacity: 0.78,
      rainSpeed: 26,
      windSlant: 0.34,
      exposure: 0.98,
    };
  }

  return {
    zenith: new THREE.Color('#060314'),
    mid: new THREE.Color('#190d3d'),
    horizon: new THREE.Color('#3b1866'),
    nadir: new THREE.Color('#200d42'),
    fogDensity: 0.025,
    sunElevation: 0.46,
    sunAzimuth: 0.78,
    sunOpacity: 0,
    moonOpacity: 1.0,
    starOpacity: 0.92,
    cloudColor: new THREE.Color('#7c6fa8'),
    cloudOpacity: 0.48,
    cloudSpeed: 0.32,
    hemiSky: new THREE.Color('#818cf8'),
    hemiGround: new THREE.Color('#3b0764'),
    hemiIntensity: 0.76,
    keyColor: new THREE.Color('#dbeafe'),
    keyIntensity: 1.38,
    rimColor: new THREE.Color('#f472b6'),
    rimIntensity: 1.08,
    rainOpacity: 0,
    rainSpeed: 0,
    windSlant: 0,
    exposure: 1.06,
  };
}

function createSoftGlowSpriteTex(inner: string, mid: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, mid);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMoonSurfaceTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const bg = ctx.createRadialGradient(110, 96, 18, 128, 128, 130);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.6, '#e2e8f0');
    bg.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);

    const craters: [number, number, number, number][] = [
      [76, 82, 22, 0.14],
      [154, 110, 28, 0.12],
      [112, 165, 18, 0.15],
      [172, 66, 14, 0.1],
      [62, 148, 12, 0.11],
      [135, 58, 10, 0.09],
    ];
    craters.forEach(([x, y, r, alpha]) => {
      ctx.fillStyle = `rgba(100, 116, 139, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLimboShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    g.addColorStop(0, 'rgba(6, 2, 18, 0.56)');
    g.addColorStop(0.5, 'rgba(12, 5, 28, 0.26)');
    g.addColorStop(1, 'rgba(12, 5, 28, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(c);
}

function createStarPointTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(233,213,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(c);
}

export const LimboDioramaCanvas: React.FC<LimboDioramaCanvasProps> = ({
  initialDioramaId = 'forest_house',
  initialWeatherMode = 'auto',
  startFullscreen = false,
  heightClass = 'h-[370px] sm:h-[430px]',
  onCapturePhoto,
  onFullscreenChange,
}) => {
  const [dioramaId, setDioramaId] = useState<DioramaAssetId>(initialDioramaId);
  const [weatherMode, setWeatherMode] = useState<LimboWeatherMode>(initialWeatherMode);
  const [isFullscreen, setIsFullscreen] = useState(startFullscreen);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hudVisible, setHudVisible] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [autoLabel, setAutoLabel] = useState(() => computeAutoPhase().label);

  const stageHostRef = useRef<HTMLDivElement>(null);
  const weatherModeRef = useRef<LimboWeatherMode>(weatherMode);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const resetCameraFnRef = useRef<(() => void) | null>(null);

  weatherModeRef.current = weatherMode;
  autoRotateRef.current = autoRotate;

  const activeAsset = DIORAMA_ASSETS[dioramaId];

  useEffect(() => {
    setDioramaId(initialDioramaId);
  }, [initialDioramaId]);

  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    if (weatherMode !== 'auto') return;
    setAutoLabel(computeAutoPhase().label);
    const id = window.setInterval(() => setAutoLabel(computeAutoPhase().label), 30000);
    return () => window.clearInterval(id);
  }, [weatherMode]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setHudVisible(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    const container = stageHostRef.current;
    if (!container) return;

    let disposed = false;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 260);

    const scene = new THREE.Scene();
    const initialPreset = getWeatherPreset(weatherModeRef.current);
    scene.background = initialPreset.horizon.clone();
    const sceneFog = new THREE.FogExp2(initialPreset.horizon.getHex(), initialPreset.fogDensity);
    scene.fog = sceneFog;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.15, 220);
    const assetCfg = DIORAMA_ASSETS[dioramaId];
    camera.position.set(
      assetCfg.defaultCameraPos[0],
      assetCfg.defaultCameraPos[1],
      assetCfg.defaultCameraPos[2]
    );

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: isSoftwareGl ? 'low-power' : 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      setLoadError('Seu navegador não conseguiu iniciar a aceleração 3D.');
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const disposeStudioEnv = setupCozyStudioRenderer(renderer, scene, isSoftwareGl);
    renderer.toneMappingExposure = initialPreset.exposure;

    const onContextLost = (e: Event) => {
      e.preventDefault();
      if (!disposed) setContextLost(true);
    };
    const onContextRestored = () => {
      if (!disposed) setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(
      assetCfg.defaultTarget[0],
      assetCfg.defaultTarget[1],
      assetCfg.defaultTarget[2]
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.panSpeed = 0.7;
    controls.rotateSpeed = 0.78;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 2.0;
    controls.maxDistance = 17.5;
    controls.minPolarAngle = 0.14;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controls.update();

    resetCameraFnRef.current = () => {
      const cfg = DIORAMA_ASSETS[dioramaId];
      camera.position.set(
        cfg.defaultCameraPos[0],
        cfg.defaultCameraPos[1],
        cfg.defaultCameraPos[2]
      );
      controls.target.set(
        cfg.defaultTarget[0],
        cfg.defaultTarget[1],
        cfg.defaultTarget[2]
      );
      controls.update();
    };

    // 1. Seamless Limbo Shader Sky Dome
    const skyUniforms = {
      uZenithColor: { value: initialPreset.zenith.clone() },
      uMidColor: { value: initialPreset.mid.clone() },
      uHorizonColor: { value: initialPreset.horizon.clone() },
      uNadirColor: { value: initialPreset.nadir.clone() },
      uLightning: { value: 0 },
    };
    const skyDomeMat = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        uniform vec3 uZenithColor;
        uniform vec3 uMidColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uNadirColor;
        uniform float uLightning;
        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = dir.y;
          vec3 col;
          if (h >= 0.0) {
            float t1 = smoothstep(0.0, 0.26, h);
            float t2 = smoothstep(0.20, 0.90, h);
            col = mix(uHorizonColor, uMidColor, t1);
            col = mix(col, uZenithColor, t2);
          } else {
            float tDown = smoothstep(0.0, -0.52, h);
            col = mix(uHorizonColor, uNadirColor, tDown);
          }
          col += vec3(0.76, 0.84, 1.0) * uLightning * 0.55;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const skyDome = new THREE.Mesh(new THREE.SphereGeometry(95, 40, 28), skyDomeMat);
    scene.add(skyDome);

    // 2. Soft Ground Contact Shadow in Limbo
    const shadowTex = createLimboShadowTexture();
    const groundShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    });
    const groundShadow = new THREE.Mesh(new THREE.CircleGeometry(4.4, 48), groundShadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -0.025;
    scene.add(groundShadow);

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      initialPreset.hemiSky,
      initialPreset.hemiGround,
      initialPreset.hemiIntensity
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      initialPreset.keyColor,
      initialPreset.keyIntensity
    );
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 36;
      keyLight.shadow.camera.left = -6.2;
      keyLight.shadow.camera.right = 6.2;
      keyLight.shadow.camera.top = 6.2;
      keyLight.shadow.camera.bottom = -6.2;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.025;
      keyLight.shadow.radius = 3;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      initialPreset.rimColor,
      initialPreset.rimIntensity
    );
    rimLight.position.set(-7, 5.5, -8);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xd8b4fe, 0.45);
    fillLight.position.set(-5, 3, 6);
    scene.add(fillLight);

    // 4. Celestial Bodies: Real Sun + Corona & Real Moon + Halo + Stars
    const celestialGroup = new THREE.Group();
    scene.add(celestialGroup);

    const sunGroup = new THREE.Group();
    const sunDiscMat = new THREE.MeshBasicMaterial({
      color: 0xfff7cc,
      transparent: true,
      opacity: initialPreset.sunOpacity,
      fog: false,
    });
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.35, 24, 24), sunDiscMat);
    const sunHaloTex = createSoftGlowSpriteTex(
      'rgba(255, 248, 210, 0.95)',
      'rgba(253, 186, 116, 0.36)'
    );
    const sunHaloMat = new THREE.SpriteMaterial({
      map: sunHaloTex,
      transparent: true,
      opacity: initialPreset.sunOpacity * 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const sunHalo = new THREE.Sprite(sunHaloMat);
    sunHalo.scale.set(14, 14, 1);
    sunGroup.add(sunDisc, sunHalo);
    celestialGroup.add(sunGroup);

    const moonGroup = new THREE.Group();
    const moonSurfTex = createMoonSurfaceTexture();
    const moonDiscMat = new THREE.MeshBasicMaterial({
      map: moonSurfTex,
      color: 0xf8fafc,
      transparent: true,
      opacity: initialPreset.moonOpacity,
      fog: false,
    });
    const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(1.95, 24, 24), moonDiscMat);
    const moonHaloTex = createSoftGlowSpriteTex(
      'rgba(233, 213, 255, 0.72)',
      'rgba(167, 139, 250, 0.22)'
    );
    const moonHaloMat = new THREE.SpriteMaterial({
      map: moonHaloTex,
      transparent: true,
      opacity: initialPreset.moonOpacity * 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const moonHalo = new THREE.Sprite(moonHaloMat);
    moonHalo.scale.set(11.5, 11.5, 1);
    moonGroup.add(moonDisc, moonHalo);
    celestialGroup.add(moonGroup);

    const starCount = isSoftwareGl ? 140 : 320;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.12 + Math.random() * 0.88);
      const r = 64 + Math.random() * 14;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starTex = createStarPointTexture();
    const starMat = new THREE.PointsMaterial({
      size: 1.25,
      map: starTex,
      transparent: true,
      opacity: initialPreset.starOpacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      color: 0xf5f3ff,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 5. Multi-Layered Drifting 3D Clouds
    const cloudMat = new THREE.MeshStandardMaterial({
      color: initialPreset.cloudColor,
      roughness: 0.94,
      metalness: 0.0,
      transparent: true,
      opacity: initialPreset.cloudOpacity,
    });
    const puffGeo = new THREE.SphereGeometry(1, isSoftwareGl ? 8 : 12, isSoftwareGl ? 6 : 10);
    const cloudItems: { group: THREE.Group; speed: number; baseY: number; phase: number }[] = [];
    const cloudCount = isSoftwareGl ? 10 : 16;

    for (let i = 0; i < cloudCount; i++) {
      const cg = new THREE.Group();
      const puffs = 3 + (i % 3);
      for (let p = 0; p < puffs; p++) {
        const m = new THREE.Mesh(puffGeo, cloudMat);
        const sx = 1.3 + ((p * 37 + i) % 5) * 0.25;
        const sy = 0.65 + (p % 2) * 0.28;
        const sz = 1.0 + ((p * 19 + i) % 4) * 0.2;
        m.scale.set(sx, sy, sz);
        m.position.set(
          (p - (puffs - 1) / 2) * 1.35,
          (p % 2) * 0.25,
          (((p * 13) % 3) - 1) * 0.45
        );
        cg.add(m);
      }
      const angle = (i / cloudCount) * Math.PI * 2 + (i % 3) * 0.25;
      const dist = 16 + (i % 5) * 5.5;
      const baseY = 9.5 + (i % 4) * 2.1;
      cg.position.set(Math.cos(angle) * dist, baseY, Math.sin(angle) * dist);
      cg.rotation.y = Math.random() * Math.PI;
      cg.scale.setScalar(0.85 + (i % 4) * 0.28);
      scene.add(cg);
      cloudItems.push({
        group: cg,
        speed: 0.55 + (i % 5) * 0.18,
        baseY,
        phase: i * 0.9,
      });
    }

    // 6. Zero-GC Rain Streak System
    const rainCount = isSoftwareGl || prefersReducedMotion ? 200 : 480;
    const rainPositions = new Float32Array(rainCount * 6);
    const rainSeeds = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * 24;
      const ry = Math.random() * 18;
      const rz = (Math.random() - 0.5) * 24;
      rainSeeds[i * 3] = rx;
      rainSeeds[i * 3 + 1] = ry;
      rainSeeds[i * 3 + 2] = rz;
      rainPositions[i * 6] = rx;
      rainPositions[i * 6 + 1] = ry;
      rainPositions[i * 6 + 2] = rz;
      rainPositions[i * 6 + 3] = rx;
      rainPositions[i * 6 + 4] = ry - 0.48;
      rainPositions[i * 6 + 5] = rz;
    }
    const rainGeo = new THREE.BufferGeometry();
    const rainAttr = new THREE.BufferAttribute(rainPositions, 3);
    rainGeo.setAttribute('position', rainAttr);
    const rainMat = new THREE.LineBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: initialPreset.rainOpacity,
      depthWrite: false,
    });
    const rainLines = new THREE.LineSegments(rainGeo, rainMat);
    rainLines.visible = initialPreset.rainOpacity > 0.01;
    scene.add(rainLines);

    // 7. Load Local .GLB Diorama
    const dioramaHolder = new THREE.Group();
    scene.add(dioramaHolder);
    let currentDioramaObj: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    setIsLoadingModel(true);
    setLoadProgress(0);
    setLoadError(null);

    loadCachedGlbInstance(assetCfg.url, {
      targetHeight: assetCfg.targetSize,
      centerAtZeroXZ: true,
      preserveMaterials: true,
      onProgress: (pct) => {
        if (!disposed) setLoadProgress(pct);
      },
    })
      .then((loaded) => {
        if (disposed) return;
        currentDioramaObj = loaded.group;
        loaded.group.position.y += assetCfg.groundOffsetY;

        if (isSoftwareGl) {
          loaded.group.traverse((ch) => {
            if ((ch as THREE.Mesh).isMesh) {
              ch.castShadow = false;
              ch.receiveShadow = false;
            }
          });
        }

        dioramaHolder.add(loaded.group);

        if (loaded.animations && loaded.animations.length > 0 && !prefersReducedMotion) {
          mixer = new THREE.AnimationMixer(loaded.group);
          loaded.animations.forEach((clip) => {
            mixer?.clipAction(clip).play();
          });
        }

        setIsLoadingModel(false);
        setLoadProgress(100);
      })
      .catch(() => {
        if (!disposed) {
          setIsLoadingModel(false);
          setLoadError(
            'Não foi possível carregar o diorama 3D agora. Tente novamente em instantes.'
          );
        }
      });

    const ro = new ResizeObserver((entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const w = Math.max(Math.floor(entry.contentRect.width), 280);
        const h = Math.max(Math.floor(entry.contentRect.height), 240);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    ro.observe(container);

    const clock = new THREE.Clock();
    const curSunElev = { value: initialPreset.sunElevation };
    const curSunAz = { value: initialPreset.sunAzimuth };
    const curFogDens = { value: initialPreset.fogDensity };
    const curRainOp = { value: initialPreset.rainOpacity };
    const curRainSpeed = { value: initialPreset.rainSpeed };
    const curWind = { value: initialPreset.windSlant };
    let lightningFlash = 0;
    let nextLightningIn = 4.5;
    let rafId = 0;

    const animate = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const modeNow = weatherModeRef.current;
      const target = getWeatherPreset(modeNow);
      const lerpFactor = Math.min(1, dt * 2.2);

      skyUniforms.uZenithColor.value.lerp(target.zenith, lerpFactor);
      skyUniforms.uMidColor.value.lerp(target.mid, lerpFactor);
      skyUniforms.uHorizonColor.value.lerp(target.horizon, lerpFactor);
      skyUniforms.uNadirColor.value.lerp(target.nadir, lerpFactor);
      sceneFog.color.copy(skyUniforms.uHorizonColor.value);
      if (scene.background instanceof THREE.Color) {
        scene.background.copy(skyUniforms.uHorizonColor.value);
      }

      curFogDens.value = THREE.MathUtils.lerp(curFogDens.value, target.fogDensity, lerpFactor);
      sceneFog.density = curFogDens.value;

      if (modeNow === 'storm' && !prefersReducedMotion) {
        nextLightningIn -= dt;
        if (nextLightningIn <= 0) {
          lightningFlash = 1.0;
          nextLightningIn = 4.2 + Math.random() * 5.8;
        }
      }
      lightningFlash = Math.max(0, lightningFlash - dt * 3.8);
      skyUniforms.uLightning.value = lightningFlash;

      curSunElev.value = THREE.MathUtils.lerp(curSunElev.value, target.sunElevation, lerpFactor);
      curSunAz.value = THREE.MathUtils.lerp(curSunAz.value, target.sunAzimuth, lerpFactor);
      const celR = 54;
      const horizR = Math.cos(curSunElev.value * Math.PI * 0.45) * celR;
      const celY = Math.sin(curSunElev.value * Math.PI * 0.45) * celR;
      const celX = Math.sin(curSunAz.value) * horizR;
      const celZ = -Math.cos(curSunAz.value) * horizR;

      sunGroup.position.set(celX, celY, celZ);
      moonGroup.position.set(celX * 0.94, celY * 0.96, celZ * 0.94);

      keyLight.position.set(
        THREE.MathUtils.clamp(celX * 0.22, -12, 12),
        Math.max(4.5, celY * 0.25),
        THREE.MathUtils.clamp(celZ * 0.22, -12, 12)
      );

      sunDiscMat.opacity = THREE.MathUtils.lerp(sunDiscMat.opacity, target.sunOpacity, lerpFactor);
      sunHaloMat.opacity = sunDiscMat.opacity * 0.88;
      sunGroup.visible = sunDiscMat.opacity > 0.02;

      moonDiscMat.opacity = THREE.MathUtils.lerp(moonDiscMat.opacity, target.moonOpacity, lerpFactor);
      moonHaloMat.opacity = moonDiscMat.opacity * 0.82;
      moonGroup.visible = moonDiscMat.opacity > 0.02;

      const starTwinkle = prefersReducedMotion ? 1 : 0.85 + Math.sin(elapsed * 1.4) * 0.15;
      const targetStars = target.starOpacity * starTwinkle;
      starMat.opacity = THREE.MathUtils.lerp(starMat.opacity, targetStars, lerpFactor);
      starPoints.visible = starMat.opacity > 0.02;

      hemiLight.color.lerp(target.hemiSky, lerpFactor);
      hemiLight.groundColor.lerp(target.hemiGround, lerpFactor);
      hemiLight.intensity = THREE.MathUtils.lerp(
        hemiLight.intensity,
        target.hemiIntensity + lightningFlash * 1.1,
        lerpFactor
      );
      keyLight.color.lerp(target.keyColor, lerpFactor);
      keyLight.intensity = THREE.MathUtils.lerp(
        keyLight.intensity,
        target.keyIntensity + lightningFlash * 2.4,
        lerpFactor
      );
      rimLight.color.lerp(target.rimColor, lerpFactor);
      rimLight.intensity = THREE.MathUtils.lerp(rimLight.intensity, target.rimIntensity, lerpFactor);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        target.exposure,
        lerpFactor
      );

      cloudMat.color.lerp(target.cloudColor, lerpFactor);
      cloudMat.opacity = THREE.MathUtils.lerp(cloudMat.opacity, target.cloudOpacity, lerpFactor);
      const speedMult = prefersReducedMotion ? 0.25 : target.cloudSpeed;
      for (let i = 0; i < cloudItems.length; i++) {
        const c = cloudItems[i];
        c.group.position.x += c.speed * speedMult * dt;
        if (!prefersReducedMotion) {
          c.group.position.y = c.baseY + Math.sin(elapsed * 0.35 + c.phase) * 0.18;
        }
        if (c.group.position.x > 40) {
          c.group.position.x = -40;
        }
      }

      curRainOp.value = THREE.MathUtils.lerp(curRainOp.value, target.rainOpacity, lerpFactor);
      curRainSpeed.value = THREE.MathUtils.lerp(curRainSpeed.value, target.rainSpeed, lerpFactor);
      curWind.value = THREE.MathUtils.lerp(curWind.value, target.windSlant, lerpFactor);
      rainMat.opacity = curRainOp.value;
      rainLines.visible = curRainOp.value > 0.02;
      if (rainLines.visible) {
        const vy = curRainSpeed.value * dt;
        const vx = vy * curWind.value;
        for (let i = 0; i < rainCount; i++) {
          let rx = rainSeeds[i * 3] + vx;
          let ry = rainSeeds[i * 3 + 1] - vy;
          const rz = rainSeeds[i * 3 + 2];
          if (ry < -1.0) {
            ry = 16.5 + Math.random() * 2.5;
            rx = (Math.random() - 0.5) * 24;
          }
          if (rx > 12) rx -= 24;
          rainSeeds[i * 3] = rx;
          rainSeeds[i * 3 + 1] = ry;

          const base = i * 6;
          rainPositions[base] = rx;
          rainPositions[base + 1] = ry;
          rainPositions[base + 2] = rz;
          rainPositions[base + 3] = rx - curWind.value * 0.45;
          rainPositions[base + 4] = ry - 0.58;
          rainPositions[base + 5] = rz;
        }
        rainAttr.needsUpdate = true;
      }

      controls.autoRotate = autoRotateRef.current && !prefersReducedMotion;
      controls.autoRotateSpeed = 0.55;
      controls.update();

      mixer?.update(dt);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      if (currentDioramaObj) {
        dioramaHolder.remove(currentDioramaObj);
      }
      disposeObject3D(scene);
      skyDomeMat.dispose();
      shadowTex.dispose();
      groundShadowMat.dispose();
      sunHaloTex.dispose();
      sunDiscMat.dispose();
      sunHaloMat.dispose();
      moonSurfTex.dispose();
      moonDiscMat.dispose();
      moonHaloTex.dispose();
      moonHaloMat.dispose();
      starTex.dispose();
      starGeo.dispose();
      starMat.dispose();
      puffGeo.dispose();
      cloudMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      disposeStudioEnv();
      renderer.dispose();
      resetCameraFnRef.current = null;
    };
  }, [dioramaId, isFullscreen]);

  const activeWeatherLabel = useMemo(() => {
    if (weatherMode === 'auto') return autoLabel;
    return WEATHER_OPTIONS.find((w) => w.id === weatherMode)?.label || 'Clima';
  }, [weatherMode, autoLabel]);

  const stageMarkup = (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[80] bg-[#070212] flex flex-col select-none overflow-hidden'
          : `relative w-full ${heightClass} rounded-2xl border border-purple-500/30 bg-[#070212] overflow-hidden select-none`
      }
    >
      <div ref={stageHostRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

      {hudVisible && (
        <div
          className={`absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none ${
            isFullscreen ? 'p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))]' : 'p-2.5'
          }`}
        >
          <div className="flex items-center gap-1.5 bg-[#0c051c]/88 border border-purple-400/30 rounded-full p-1 pointer-events-auto shadow-lg">
            {DIORAMA_ASSET_LIST.map((item) => {
              const active = dioramaId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDioramaId(item.id)}
                  className={`min-h-[36px] px-3 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                      : 'text-purple-200/80 hover:text-white'
                  }`}
                >
                  {item.id === 'stylized_tree' ? (
                    <Trees className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="hidden xs:flex items-center gap-1.5 px-3 min-h-[36px] rounded-full bg-[#0c051c]/88 border border-purple-400/25 text-[11px] font-semibold text-purple-100">
              <span>{activeWeatherLabel}</span>
            </div>

            {onCapturePhoto && (
              <button
                type="button"
                onClick={() =>
                  onCapturePhoto(
                    stageHostRef.current,
                    activeAsset.title,
                    `Clima: ${activeWeatherLabel}`
                  )
                }
                className="min-w-[40px] min-h-[40px] px-3 rounded-full bg-[#0c051c]/88 border border-pink-400/35 text-pink-200 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                title="Fotografar cena 3D para o álbum"
              >
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden sm:inline">Foto</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsFullscreen((prev) => !prev);
                setHudVisible(true);
              }}
              className="min-w-[44px] min-h-[44px] px-3 rounded-full bg-[#0c051c]/90 border border-pink-400/40 text-white hover:bg-pink-600/80 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Abrir em Tela Cheia'}
              aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Abrir em Tela Cheia'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 sm:hidden" />
                  <X className="w-4 h-4 hidden sm:block" />
                  <span className="hidden sm:inline">Fechar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-pink-300" />
                  <span className="hidden sm:inline">Tela Cheia</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!hudVisible && (
        <button
          type="button"
          onClick={() => setHudVisible(true)}
          className="absolute bottom-4 right-4 z-20 min-h-[44px] px-3.5 rounded-full bg-[#0c051c]/85 border border-purple-400/35 text-purple-100 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
          aria-label="Mostrar controles"
        >
          <Eye className="w-4 h-4 text-pink-300" />
          <span>Controles</span>
        </button>
      )}

      {hudVisible && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 pointer-events-none ${
            isFullscreen ? 'p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]' : 'p-2.5'
          }`}
        >
          <div className="max-w-2xl mx-auto bg-[#0c051c]/88 border border-purple-400/30 rounded-2xl p-2 flex flex-col gap-2 pointer-events-auto shadow-2xl">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {WEATHER_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = weatherMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWeatherMode(opt.id)}
                    className={`min-h-[38px] px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                        : 'bg-purple-950/60 text-purple-200/80 hover:text-white border border-purple-500/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}

              <div className="h-5 w-px bg-purple-500/25 mx-0.5 shrink-0" />

              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`min-h-[38px] px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  autoRotate
                    ? 'bg-pink-500/25 border border-pink-400/45 text-pink-100'
                    : 'bg-purple-950/60 border border-purple-500/20 text-purple-300'
                }`}
                title="Alternar órbita automática"
              >
                <Orbit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Girar</span>
              </button>

              <button
                type="button"
                onClick={() => resetCameraFnRef.current?.()}
                className="min-w-[38px] min-h-[38px] px-2.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-200 hover:text-white text-[11px] font-bold flex items-center justify-center shrink-0 cursor-pointer"
                title="Centralizar câmera"
                aria-label="Centralizar câmera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setHudVisible(false)}
                className="min-w-[38px] min-h-[38px] px-2.5 rounded-xl bg-purple-950/60 border border-purple-500/20 text-purple-200 hover:text-white text-[11px] font-bold flex items-center justify-center shrink-0 cursor-pointer"
                title="Modo Cinema (ocultar controles)"
                aria-label="Ocultar controles"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadingModel && (
        <div className="absolute inset-0 z-30 bg-[#070212]/90 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <div className="w-full max-w-xs space-y-3 bg-[#120728] border border-pink-400/30 rounded-3xl p-5 shadow-2xl">
            <div className="w-11 h-11 mx-auto rounded-2xl bg-pink-500/20 border border-pink-400/35 flex items-center justify-center text-pink-300">
              <Orbit className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{activeAsset.title}</p>
              <p className="text-[11px] text-purple-200/75 mt-0.5">
                Carregando modelo 3D local ({loadProgress}%)
              </p>
            </div>
            <div className="h-2 w-full bg-purple-950 rounded-full overflow-hidden border border-purple-500/25">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-200"
                style={{ width: `${Math.max(4, loadProgress)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {(loadError || contextLost) && (
        <div className="absolute inset-0 z-30 bg-[#070212]/92 flex items-center justify-center p-6 text-center">
          <div className="max-w-xs space-y-2 bg-[#14072b] border border-rose-400/35 rounded-2xl p-5">
            <p className="text-sm font-bold text-rose-200">
              {contextLost ? 'Contexto 3D interrompido' : 'Erro ao abrir diorama 3D'}
            </p>
            <p className="text-xs text-purple-200/80">
              {contextLost
                ? 'O dispositivo pausou a memória gráfica temporariamente.'
                : loadError}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(stageMarkup, document.body);
  }

  return stageMarkup;
};

interface LimboDioramaFullscreenModalProps {
  isOpen: boolean;
  initialDioramaId?: DioramaAssetId;
  initialWeatherMode?: LimboWeatherMode;
  onClose: () => void;
  onCapturePhoto?: (containerEl: HTMLElement | null, title: string, subtitle: string) => void;
}

export const LimboDioramaFullscreenModal: React.FC<LimboDioramaFullscreenModalProps> = ({
  isOpen,
  initialDioramaId = 'forest_house',
  initialWeatherMode = 'auto',
  onClose,
  onCapturePhoto,
}) => {
  if (!isOpen) return null;
  return (
    <LimboDioramaCanvas
      startFullscreen
      initialDioramaId={initialDioramaId}
      initialWeatherMode={initialWeatherMode}
      onCapturePhoto={onCapturePhoto}
      onFullscreenChange={(fs) => {
        if (!fs) onClose();
      }}
    />
  );
};
