import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const TREE_MODEL_URL = '/glbbiel/stylized_tree_diorama_mobile.glb';

export const FantasyTreeCanvas: React.FC<{ level?: number }> = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let model: THREE.Object3D | null = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b12');

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    camera.position.set(5.2, 3.7, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xe9e5ff, 0x30243a, 2.1));
    const key = new THREE.DirectionalLight(0xfff1df, 3.0);
    key.position.set(5, 8, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb8a2ff, 1.5);
    rim.position.set(-5, 4, -5);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 0.2;
    controls.maxDistance = 80;
    controls.target.set(0, 1.4, 0);
    controls.update();

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    new GLTFLoader().load(
      TREE_MODEL_URL,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
          });
          return;
        }
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.001);
        const scale = 4.2 / maxDim;
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              if ('roughness' in mat && typeof mat.roughness === 'number') mat.roughness = Math.max(mat.roughness, 0.55);
              if ('metalness' in mat && typeof mat.metalness === 'number') mat.metalness = Math.min(mat.metalness, 0.15);
            });
          }
        });
        scene.add(model);
        const fitted = new THREE.Box3().setFromObject(model);
        const fittedSize = fitted.getSize(new THREE.Vector3());
        const fittedCenter = fitted.getCenter(new THREE.Vector3());
        controls.target.copy(fittedCenter);
        const radius = Math.max(fittedSize.x, fittedSize.y, fittedSize.z, 1);
        camera.position.set(fittedCenter.x + radius * 1.25, fittedCenter.y + radius * 0.72, fittedCenter.z + radius * 1.45);
        controls.minDistance = radius * 0.45;
        controls.maxDistance = radius * 5;
        controls.update();
        setStatus('ready');
      },
      undefined,
      (error) => {
        console.error('Falha ao carregar o GLB da árvore:', error);
        if (!disposed) setStatus('error');
      }
    );

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      if (model) {
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
          materials.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            m.dispose();
          });
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={hostRef} className="relative h-[100dvh] min-h-screen w-full overflow-hidden bg-[#070b12]">
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs text-white/65 backdrop-blur-md">
            {status === 'loading' ? 'Carregando modelo 3D…' : 'Não foi possível carregar o arquivo GLB.'}
          </span>
        </div>
      )}
    </div>
  );
};
