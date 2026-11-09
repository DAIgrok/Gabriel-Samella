import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PetType, KittenState } from '../../types';

interface PetCanvas3DProps {
  petType: PetType;
  kitten: KittenState;
  isInteracting?: boolean;
  onPetTouch?: (part: 'head' | 'belly' | 'paw') => void;
  hasCrown?: boolean;
  hasRibbon?: boolean;
  hasSunglasses?: boolean;
  hasBowtie?: boolean;
  hasAngelWings?: boolean;
}

export const PetCanvas3D: React.FC<PetCanvas3DProps> = ({
  petType,
  kitten,
  isInteracting = false,
  onPetTouch,
  hasCrown = false,
  hasRibbon = false,
  hasSunglasses = false,
  hasBowtie = false,
  hasAngelWings = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- 2. ORBIT CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 7.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0.65, 0);

    // --- 3. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -1;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 1.2);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 0.7);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    // --- 4. GROUND PLATFORM & CONTACT SHADOW ---
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Cute pedestal platform
    const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.25, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18092e,
      roughness: 0.6,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.125;
    pedestal.receiveShadow = true;
    groundGroup.add(pedestal);

    // Glowing rim around pedestal
    const rimGeo = new THREE.TorusGeometry(1.51, 0.02, 16, 64);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0;
    groundGroup.add(rimMesh);

    // Soft fake contact shadow under pet
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.005;
    groundGroup.add(shadowPlane);

    // --- 5. PET MODEL ROOT ---
    const petRoot = new THREE.Group();
    scene.add(petRoot);

    // Sub-part references for animations
    let headMesh: THREE.Object3D | null = null;
    let tailMesh: THREE.Object3D | null = null;
    let leftEar: THREE.Object3D | null = null;
    let rightEar: THREE.Object3D | null = null;
    let leftWing: THREE.Object3D | null = null;
    let rightWing: THREE.Object3D | null = null;
    let angelWingsRoot: THREE.Object3D | null = null;
    const paws: THREE.Object3D[] = [];
    const snakeSegments: THREE.Object3D[] = [];

    // Helper Materials
    const pinkNoseMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
    const blackEyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Function to add cute cartoon eyes
    const addEyes = (head: THREE.Object3D, eyeY: number, eyeZ: number, eyeXSpacing: number, eyeR = 0.075) => {
      const eyeGeo = new THREE.SphereGeometry(eyeR, 16, 16);
      const hlGeo = new THREE.SphereGeometry(eyeR * 0.35, 8, 8);

      [-eyeXSpacing, eyeXSpacing].forEach((ex) => {
        const eye = new THREE.Mesh(eyeGeo, blackEyeMat);
        eye.position.set(ex, eyeY, eyeZ);
        eye.scale.set(1, 1.15, 0.6);

        const hl = new THREE.Mesh(hlGeo, eyeHighlightMat);
        hl.position.set(ex > 0 ? 0.02 : -0.02, 0.03, eyeR * 0.45);
        eye.add(hl);

        head.add(eye);
      });
    };

    // --- 6. BUILD SPECIES-SPECIFIC 3D ANATOMIES ---
    const buildSpeciesModel = () => {
      // Clear previous children
      while (petRoot.children.length > 0) {
        petRoot.remove(petRoot.children[0]);
      }
      paws.length = 0;
      snakeSegments.length = 0;
      headMesh = null;
      tailMesh = null;
      leftEar = null;
      rightEar = null;
      leftWing = null;
      rightWing = null;

      if (petType === 'bunny') {
        // ==========================================
        // 🐰 COELHINHA (BUNNY)
        // ==========================================
        const furMat = new THREE.MeshStandardMaterial({ color: 0xfcf7f8, roughness: 0.65 });
        const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });

        // Rounded chubby body
        const bodyGeo = new THREE.SphereGeometry(0.42, 24, 24);
        bodyGeo.scale(0.9, 1.0, 1.1);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.set(0, 0.45, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        petRoot.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.85, 0.22);
        head.castShadow = true;
        petRoot.add(head);
        headMesh = head;

        addEyes(head, 0.06, 0.3, 0.16, 0.065);

        // Cute pink bunny nose
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 8), pinkNoseMat);
        nose.rotation.x = Math.PI;
        nose.position.set(0, -0.02, 0.35);
        head.add(nose);

        // Long iconic bunny ears (articulated for bouncing)
        const earGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.65, 12);
        earGeo.scale(0.8, 1.0, 0.3);
        const earInnerGeo = new THREE.CylinderGeometry(0.05, 0.02, 0.55, 12);
        earInnerGeo.scale(0.8, 1.0, 0.2);

        const lEar = new THREE.Mesh(earGeo, furMat);
        lEar.position.set(-0.16, 0.45, 0.02);
        lEar.rotation.set(-0.1, 0, -0.15);
        const lEarIn = new THREE.Mesh(earInnerGeo, innerEarMat);
        lEarIn.position.z = 0.02;
        lEar.add(lEarIn);
        head.add(lEar);
        leftEar = lEar;

        const rEar = new THREE.Mesh(earGeo, furMat);
        rEar.position.set(0.16, 0.45, 0.02);
        rEar.rotation.set(-0.1, 0, 0.15);
        const rEarIn = new THREE.Mesh(earInnerGeo, innerEarMat);
        rEarIn.position.z = 0.02;
        rEar.add(rEarIn);
        head.add(rEar);
        rightEar = rEar;

        // Fluffy pom-pom tail
        const tailGeo = new THREE.DodecahedronGeometry(0.14, 2);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 0.42, -0.5);
        petRoot.add(tail);
        tailMesh = tail;

        // Front paws & Big hopping hind feet
        const hindFootGeo = new THREE.CapsuleGeometry(0.1, 0.25, 8, 12);
        [-0.32, 0.32].forEach((hx) => {
          const hFoot = new THREE.Mesh(hindFootGeo, furMat);
          hFoot.rotation.x = Math.PI / 2;
          hFoot.position.set(hx, 0.12, 0.08);
          hFoot.castShadow = true;
          petRoot.add(hFoot);
          paws.push(hFoot);
        });

      } else if (petType === 'dog') {
        // ==========================================
        // 🐶 CACHORRINHO (DOG)
        // ==========================================
        const furMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
        const earMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });
        const muzzleMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });

        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.34, 0.45, 12, 16);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.rotation.x = Math.PI / 2;
        body.position.set(0, 0.48, 0);
        body.castShadow = true;
        petRoot.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.36, 24, 24);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.88, 0.32);
        head.castShadow = true;
        petRoot.add(head);
        headMesh = head;

        // Snout / Muzzle
        const muzzleGeo = new THREE.BoxGeometry(0.24, 0.2, 0.24);
        const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzle.position.set(0, -0.06, 0.28);
        head.add(muzzle);

        // Black dog nose
        const dogNose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), blackEyeMat);
        dogNose.position.set(0, 0.04, 0.12);
        muzzle.add(dogNose);

        addEyes(head, 0.1, 0.28, 0.16, 0.07);

        // Floppy bouncing ears
        const earGeo = new THREE.BoxGeometry(0.12, 0.38, 0.08);
        const lEar = new THREE.Mesh(earGeo, earMat);
        lEar.position.set(-0.35, 0.02, 0.05);
        lEar.rotation.set(0, 0, 0.4);
        head.add(lEar);
        leftEar = lEar;

        const rEar = new THREE.Mesh(earGeo, earMat);
        rEar.position.set(0.35, 0.02, 0.05);
        rEar.rotation.set(0, 0, -0.4);
        head.add(rEar);
        rightEar = rEar;

        // Energetic wagging tail
        const tailGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.45, 10);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(0, 0.6, -0.42);
        tail.rotation.set(0.7, 0, 0);
        petRoot.add(tail);
        tailMesh = tail;

        // 4 Paws
        const pawGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 8);
        [
          [-0.2, 0.16, 0.22],
          [0.2, 0.16, 0.22],
          [-0.2, 0.16, -0.22],
          [0.2, 0.16, -0.22],
        ].forEach(([px, py, pz]) => {
          const paw = new THREE.Mesh(pawGeo, furMat);
          paw.position.set(px, py, pz);
          paw.castShadow = true;
          petRoot.add(paw);
          paws.push(paw);
        });

      } else if (petType === 'pig') {
        // ==========================================
        // 🐷 PORQUINHO (PIG)
        // ==========================================
        const pigPinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
        const darkPinkMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.5 });

        // Chubby round body
        const bodyGeo = new THREE.SphereGeometry(0.48, 24, 24);
        bodyGeo.scale(1.0, 0.9, 1.15);
        const body = new THREE.Mesh(bodyGeo, pigPinkMat);
        body.position.set(0, 0.46, 0);
        body.castShadow = true;
        petRoot.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.38, 24, 24);
        const head = new THREE.Mesh(headGeo, pigPinkMat);
        head.position.set(0, 0.75, 0.38);
        head.castShadow = true;
        petRoot.add(head);
        headMesh = head;

        // Classic circular pig snout with dual nostrils
        const snoutGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
        const snout = new THREE.Mesh(snoutGeo, darkPinkMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.05, 0.35);
        head.add(snout);

        // Dual nostrils
        const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x831843 });
        [-0.05, 0.05].forEach((nx) => {
          const nostril = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), nostrilMat);
          nostril.position.set(nx, 0.05, 0);
          snout.add(nostril);
        });

        addEyes(head, 0.12, 0.3, 0.18, 0.06);

        // Folded floppy pig ears
        const pigEarGeo = new THREE.ConeGeometry(0.12, 0.22, 6);
        const lEar = new THREE.Mesh(pigEarGeo, darkPinkMat);
        lEar.position.set(-0.25, 0.3, 0.08);
        lEar.rotation.set(-0.4, 0, -0.6);
        head.add(lEar);
        leftEar = lEar;

        const rEar = new THREE.Mesh(pigEarGeo, darkPinkMat);
        rEar.position.set(0.25, 0.3, 0.08);
        rEar.rotation.set(-0.4, 0, 0.6);
        head.add(rEar);
        rightEar = rEar;

        // Spiral curly tail
        const tailCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.45, -0.55),
          new THREE.Vector3(0.08, 0.52, -0.62),
          new THREE.Vector3(-0.06, 0.58, -0.65),
          new THREE.Vector3(0.04, 0.62, -0.60),
        ]);
        const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.035, 6, false), darkPinkMat);
        petRoot.add(tail);
        tailMesh = tail;

        // 4 Cute stubby trotters
        const trotterGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.24, 8);
        [
          [-0.22, 0.12, 0.24],
          [0.22, 0.12, 0.24],
          [-0.22, 0.12, -0.24],
          [0.22, 0.12, -0.24],
        ].forEach(([tx, ty, tz]) => {
          const trotter = new THREE.Mesh(trotterGeo, darkPinkMat);
          trotter.position.set(tx, ty, tz);
          trotter.castShadow = true;
          petRoot.add(trotter);
          paws.push(trotter);
        });

      } else if (petType === 'mouse') {
        // ==========================================
        // 🐭 RATINHO (MOUSE)
        // ==========================================
        const mouseFurMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
        const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.4 });

        // Compact teardrop body
        const bodyGeo = new THREE.SphereGeometry(0.38, 20, 20);
        bodyGeo.scale(0.85, 0.8, 1.2);
        const body = new THREE.Mesh(bodyGeo, mouseFurMat);
        body.position.set(0, 0.36, 0);
        body.castShadow = true;
        petRoot.add(body);

        // Pointed head
        const headGeo = new THREE.ConeGeometry(0.28, 0.5, 16);
        headGeo.rotateX(Math.PI / 2);
        const head = new THREE.Mesh(headGeo, mouseFurMat);
        head.position.set(0, 0.52, 0.42);
        petRoot.add(head);
        headMesh = head;

        // Big rounded translucent ears
        const mouseEarGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24);
        mouseEarGeo.rotateX(Math.PI / 2);
        const lEar = new THREE.Mesh(mouseEarGeo, mouseFurMat);
        lEar.position.set(-0.24, 0.25, -0.05);
        lEar.rotation.y = 0.3;
        const lIn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 20), earInnerMat);
        lIn.rotation.x = Math.PI / 2;
        lEar.add(lIn);
        head.add(lEar);
        leftEar = lEar;

        const rEar = new THREE.Mesh(mouseEarGeo, mouseFurMat);
        rEar.position.set(0.24, 0.25, -0.05);
        rEar.rotation.y = -0.3;
        const rIn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.035, 20), earInnerMat);
        rIn.rotation.x = Math.PI / 2;
        rEar.add(rIn);
        head.add(rEar);
        rightEar = rEar;

        addEyes(head, 0.08, 0.1, 0.15, 0.05);

        // Pink nose tip
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), pinkNoseMat);
        nose.position.set(0, 0, 0.26);
        head.add(nose);

        // Long slender tail
        const tailCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.32, -0.45),
          new THREE.Vector3(0.12, 0.28, -0.75),
          new THREE.Vector3(-0.08, 0.35, -1.05),
          new THREE.Vector3(0.04, 0.42, -1.25),
        ]);
        const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.025, 6, false), pinkNoseMat);
        petRoot.add(tail);
        tailMesh = tail;

      } else if (petType === 'snake') {
        // ==========================================
        // 🐍 COBRINHA (SNAKE)
        // ==========================================
        const snakeMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.35,
          metalness: 0.15,
        });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.4 });

        // 12 Articulated segments forming an organic sinusoidal serpentine body
        const segmentCount = 12;
        for (let i = 0; i < segmentCount; i++) {
          const t = i / (segmentCount - 1);
          const rad = 0.18 * (1 - t * 0.55);
          const segGeo = new THREE.SphereGeometry(rad, 16, 16);
          const seg = new THREE.Mesh(segGeo, t > 0.8 ? bellyMat : snakeMat);
          seg.castShadow = true;
          petRoot.add(seg);
          snakeSegments.push(seg);
        }

        // Cobra / Snake Raised Head
        const headGeo = new THREE.SphereGeometry(0.24, 20, 16);
        headGeo.scale(1.2, 0.75, 1.4);
        const head = new THREE.Mesh(headGeo, snakeMat);
        head.position.set(0, 0.65, 0.35);
        petRoot.add(head);
        headMesh = head;

        // Expressive eyes
        const snakeEyeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });
        [-0.14, 0.14].forEach((ex) => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), snakeEyeMat);
          eye.position.set(ex, 0.08, 0.12);
          const slit = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 6), blackEyeMat);
          eye.add(slit);
          head.add(eye);
        });

        // Forked red tongue flicking out
        const tongueMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.18), tongueMat);
        tongue.position.set(0, -0.05, 0.36);
        head.add(tongue);
        tailMesh = tongue; // use tailMesh slot for tongue animation

      } else if (petType === 'shark') {
        // ==========================================
        // 🦈 TUBARÃOZINHO (SHARK)
        // ==========================================
        const sharkMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

        // Hydrodynamic Torpedo Body
        const bodyGeo = new THREE.ConeGeometry(0.42, 1.4, 24);
        bodyGeo.rotateX(-Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, sharkMat);
        body.position.set(0, 0.65, 0);
        body.castShadow = true;
        petRoot.add(body);

        // White belly patch
        const bellyGeo = new THREE.SphereGeometry(0.38, 16, 16);
        bellyGeo.scale(0.8, 0.4, 1.3);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 0.55, 0);
        petRoot.add(belly);

        // Iconic Dorsal Fin
        const finGeo = new THREE.ConeGeometry(0.15, 0.42, 4);
        finGeo.scale(0.3, 1.0, 1.0);
        const dorsalFin = new THREE.Mesh(finGeo, sharkMat);
        dorsalFin.position.set(0, 0.45, -0.05);
        dorsalFin.rotation.x = -0.4;
        body.add(dorsalFin);

        // Pectoral Fins
        const pFinGeo = new THREE.ConeGeometry(0.12, 0.45, 4);
        pFinGeo.scale(0.25, 1.0, 0.8);

        const lFin = new THREE.Mesh(pFinGeo, sharkMat);
        lFin.position.set(-0.38, -0.05, 0.15);
        lFin.rotation.set(0.3, 0, 1.2);
        body.add(lFin);
        leftWing = lFin;

        const rFin = new THREE.Mesh(pFinGeo, sharkMat);
        rFin.position.set(0.38, -0.05, 0.15);
        rFin.rotation.set(0.3, 0, -1.2);
        body.add(rFin);
        rightWing = rFin;

        // Caudal Heterocercal Tail
        const tailGeo = new THREE.BoxGeometry(0.06, 0.55, 0.28);
        const tail = new THREE.Mesh(tailGeo, sharkMat);
        tail.position.set(0, 0, -0.75);
        body.add(tail);
        tailMesh = tail;

        // Cute Shark Eyes
        addEyes(body, 0.15, 0.35, 0.28, 0.075);
        headMesh = body;

      } else if (petType === 'bee') {
        // ==========================================
        // 🐝 ABELHINHA (BEE)
        // ==========================================
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
        const blackStripeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          metalness: 0.8,
        });

        // Striped barrel body
        const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.45, 16, 20);
        bodyGeo.rotateX(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, yellowMat);
        body.position.set(0, 0.85, 0);
        body.castShadow = true;
        petRoot.add(body);
        headMesh = body;

        // Black stripes
        [-0.12, 0.12].forEach((sz) => {
          const stripeGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.1, 20);
          stripeGeo.rotateX(Math.PI / 2);
          const stripe = new THREE.Mesh(stripeGeo, blackStripeMat);
          stripe.position.set(0, 0, sz);
          body.add(stripe);
        });

        // Stinger
        const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 12), blackStripeMat);
        stinger.rotation.x = -Math.PI / 2;
        stinger.position.set(0, 0, -0.42);
        body.add(stinger);

        // Antennae
        const antMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        [-0.12, 0.12].forEach((ax) => {
          const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 6), antMat);
          ant.position.set(ax, 0.32, 0.26);
          ant.rotation.set(0.3, 0, ax > 0 ? 0.3 : -0.3);
          const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), yellowMat);
          tip.position.y = 0.12;
          ant.add(tip);
          body.add(ant);
        });

        addEyes(body, 0.12, 0.32, 0.18, 0.08);

        // Dual pairs of translucent glowing wings
        const wingGeo = new THREE.SphereGeometry(0.25, 12, 12);
        wingGeo.scale(1.2, 0.05, 0.7);

        const lW = new THREE.Mesh(wingGeo, wingMat);
        lW.position.set(-0.35, 0.32, 0.02);
        lW.rotation.z = 0.4;
        body.add(lW);
        leftWing = lW;

        const rW = new THREE.Mesh(wingGeo, wingMat);
        rW.position.set(0.35, 0.32, 0.02);
        rW.rotation.z = -0.4;
        body.add(rW);
        rightWing = rW;

      } else {
        // ==========================================
        // 🐱 GATINHO (CAT - DEFAULT)
        // ==========================================
        const furMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });
        const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.4 });
        const whiteChestMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

        // Sleek graceful body
        const bodyGeo = new THREE.CapsuleGeometry(0.32, 0.42, 12, 16);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.rotation.x = Math.PI / 2;
        body.position.set(0, 0.46, 0);
        body.castShadow = true;
        petRoot.add(body);

        // White chest patch
        const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), whiteChestMat);
        chest.position.set(0, 0.42, 0.22);
        chest.scale.set(0.9, 1.2, 0.4);
        petRoot.add(chest);

        // Head
        const headGeo = new THREE.SphereGeometry(0.35, 24, 24);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0, 0.85, 0.28);
        head.castShadow = true;
        petRoot.add(head);
        headMesh = head;

        addEyes(head, 0.08, 0.28, 0.15, 0.065);

        // Little triangular nose
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.05, 6), pinkNoseMat);
        nose.rotation.x = Math.PI;
        nose.position.set(0, -0.02, 0.35);
        head.add(nose);

        // Pointed cat ears
        const earGeo = new THREE.ConeGeometry(0.14, 0.26, 4);
        const earInner = new THREE.ConeGeometry(0.09, 0.18, 4);

        const lEar = new THREE.Mesh(earGeo, furMat);
        lEar.position.set(-0.2, 0.32, 0.05);
        lEar.rotation.set(-0.15, 0, -0.35);
        const lIn = new THREE.Mesh(earInner, earInnerMat);
        lIn.position.z = 0.02;
        lEar.add(lIn);
        head.add(lEar);
        leftEar = lEar;

        const rEar = new THREE.Mesh(earGeo, furMat);
        rEar.position.set(0.2, 0.32, 0.05);
        rEar.rotation.set(-0.15, 0, 0.35);
        const rIn = new THREE.Mesh(earInner, earInnerMat);
        rIn.position.z = 0.02;
        rEar.add(rIn);
        head.add(rEar);
        rightEar = rEar;

        // Long flexible swishing tail
        const tailCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.42, -0.38),
          new THREE.Vector3(0.08, 0.55, -0.62),
          new THREE.Vector3(-0.06, 0.72, -0.75),
          new THREE.Vector3(0.05, 0.95, -0.68),
        ]);
        const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 20, 0.045, 8, false), furMat);
        tail.castShadow = true;
        petRoot.add(tail);
        tailMesh = tail;

        // 4 Articulated paws
        const pawGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 8);
        [
          [-0.18, 0.14, 0.2],
          [0.18, 0.14, 0.2],
          [-0.18, 0.14, -0.2],
          [0.18, 0.14, -0.2],
        ].forEach(([px, py, pz]) => {
          const paw = new THREE.Mesh(pawGeo, whiteChestMat);
          paw.position.set(px, py, pz);
          paw.castShadow = true;
          petRoot.add(paw);
          paws.push(paw);
        });
      }

      // ==========================================
      // 🌟 3D ACCESSORIES ATTACHMENT
      // ==========================================
      const headTarget = headMesh || petRoot;

      // 1. Imperial Crown
      if (hasCrown) {
        const crownGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.16, 7);
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xd97706,
          emissiveIntensity: 0.3,
        });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(0, 0.45, 0.02);
        headTarget.add(crown);

        // Ruby in center of crown
        const rubyGeo = new THREE.OctahedronGeometry(0.045);
        const rubyMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.8,
        });
        const ruby = new THREE.Mesh(rubyGeo, rubyMat);
        ruby.position.set(0, 0.02, 0.18);
        crown.add(ruby);
      }

      // 2. Pink Satin Ribbon
      if (hasRibbon) {
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
        const ribGeo = new THREE.TorusGeometry(0.08, 0.03, 8, 16);
        const rib = new THREE.Mesh(ribGeo, ribbonMat);
        rib.position.set(0.18, 0.32, 0.12);
        rib.rotation.y = 0.5;
        headTarget.add(rib);
      }

      // 3. Cool Sunglasses
      if (hasSunglasses) {
        const shadesMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.9,
          roughness: 0.1,
        });
        const shadesGeo = new THREE.BoxGeometry(0.48, 0.14, 0.08);
        const shades = new THREE.Mesh(shadesGeo, shadesMat);
        shades.position.set(0, 0.08, 0.36);
        headTarget.add(shades);
      }

      // 4. Bowtie
      if (hasBowtie) {
        const bowtieMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.4 });
        const wing1 = new THREE.ConeGeometry(0.08, 0.14, 4);
        wing1.rotateZ(Math.PI / 2);
        const knot = new THREE.SphereGeometry(0.04, 8, 8);

        const btGroup = new THREE.Group();
        const kMesh = new THREE.Mesh(knot, bowtieMat);
        const wMesh1 = new THREE.Mesh(wing1, bowtieMat);
        wMesh1.position.x = -0.08;
        const wMesh2 = new THREE.Mesh(wing1, bowtieMat);
        wMesh2.rotation.z = -Math.PI / 2;
        wMesh2.position.x = 0.08;

        btGroup.add(kMesh);
        btGroup.add(wMesh1);
        btGroup.add(wMesh2);

        btGroup.position.set(0, 0.45, 0.35);
        petRoot.add(btGroup);
      }

      // 5. Angel Wings on Back
      if (hasAngelWings) {
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          emissive: 0xe0e7ff,
          emissiveIntensity: 0.4,
        });
        const wingGeo = new THREE.ConeGeometry(0.16, 0.6, 5);
        wingGeo.scale(0.3, 1.0, 1.0);

        const aWings = new THREE.Group();
        const lWing = new THREE.Mesh(wingGeo, wingMat);
        lWing.position.set(-0.35, 0, 0);
        lWing.rotation.set(0.2, 0, 0.8);
        aWings.add(lWing);

        const rWing = new THREE.Mesh(wingGeo, wingMat);
        rWing.position.set(0.35, 0, 0);
        rWing.rotation.set(0.2, 0, -0.8);
        aWings.add(rWing);

        aWings.position.set(0, 0.65, -0.2);
        petRoot.add(aWings);
        angelWingsRoot = aWings;
      }
    };

    buildSpeciesModel();

    // --- 7. POINTER / RAYCASTER INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(petRoot.children, true);
      if (intersects.length > 0 && onPetTouch) {
        // Determine touched area by intersection point Y
        const hitY = intersects[0].point.y;
        if (hitY > 0.7) {
          onPetTouch('head');
        } else if (hitY > 0.35) {
          onPetTouch('belly');
        } else {
          onPetTouch('paw');
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // --- 8. ANIMATION LOOP WITH AUTHENTIC PHYSICAL KINEMATICS ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // State variations
      const isSleeping = kitten.isSleeping;
      const isPlayMode = kitten.isPlayMode || isInteracting;

      if (petType === 'bunny') {
        // 🐰 Bunny Hopping Physics
        if (!isSleeping) {
          const hopFreq = isPlayMode ? 5.5 : 2.5;
          const hopCycle = (time * hopFreq) % (Math.PI * 2);
          const isMidAir = Math.sin(hopCycle) > 0;

          // Parabolic jump trajectory
          const hopY = Math.max(0, Math.sin(hopCycle)) * (isPlayMode ? 0.35 : 0.18);
          petRoot.position.y = hopY;

          // Squash & stretch on landing vs apex
          if (isMidAir) {
            petRoot.scale.set(0.92, 1.1, 0.95);
          } else {
            petRoot.scale.set(1.08, 0.92, 1.05);
          }

          // Ears wiggle independently
          if (leftEar) leftEar.rotation.z = -0.15 + Math.sin(time * 6) * 0.12;
          if (rightEar) rightEar.rotation.z = 0.15 + Math.cos(time * 6) * 0.12;
          if (tailMesh) tailMesh.rotation.y = Math.sin(time * 8) * 0.2;
        } else {
          // Sleeping: curled up breathing
          petRoot.position.y = 0;
          petRoot.scale.set(1.05, 0.88 + Math.sin(time * 1.5) * 0.03, 1.05);
          if (headMesh) headMesh.position.y = 0.78;
        }

      } else if (petType === 'snake') {
        // 🐍 Snake Undulating Sine Waves
        snakeSegments.forEach((seg, idx) => {
          const wave = Math.sin(time * 3.5 - idx * 0.55);
          seg.position.x = wave * (0.28 + idx * 0.02);
          seg.position.y = 0.1;
          seg.position.z = 0.4 - idx * 0.15;
        });
        if (headMesh) {
          headMesh.position.x = Math.sin(time * 3.5) * 0.22;
          headMesh.rotation.y = Math.cos(time * 3.5) * 0.3;
        }
        if (tailMesh) {
          // Tongue flicking
          tailMesh.scale.z = Math.sin(time * 12) > 0.4 ? 1.4 : 0.1;
        }

      } else if (petType === 'bee') {
        // 🐝 Bee High-Frequency Wing Flutter & Floating Hover
        const hoverY = 0.85 + Math.sin(time * 3) * 0.14;
        const hoverTilt = Math.sin(time * 2) * 0.1;
        petRoot.position.y = hoverY;
        petRoot.rotation.z = hoverTilt;

        // Wings flap at ~45Hz
        const wingFlap = Math.sin(time * 45) * 0.8;
        if (leftWing) leftWing.rotation.x = wingFlap;
        if (rightWing) rightWing.rotation.x = -wingFlap;

      } else if (petType === 'shark') {
        // 🦈 Shark Swimming Side-to-Side
        petRoot.position.y = 0.6 + Math.sin(time * 2) * 0.08;
        petRoot.rotation.y = Math.sin(time * 2.2) * 0.18;
        if (tailMesh) tailMesh.rotation.y = Math.sin(time * 4.5) * 0.45;
        if (leftWing) leftWing.rotation.z = 1.2 + Math.sin(time * 2.5) * 0.1;
        if (rightWing) rightWing.rotation.z = -1.2 - Math.sin(time * 2.5) * 0.1;

      } else if (petType === 'dog') {
        // 🐶 Dog Tail Wagging & Joyful Breathing
        const breath = Math.sin(time * 3) * 0.03;
        petRoot.position.y = isPlayMode ? Math.abs(Math.sin(time * 6)) * 0.15 : 0;
        if (tailMesh) tailMesh.rotation.z = Math.sin(time * (isPlayMode ? 14 : 7)) * 0.6;
        if (leftEar) leftEar.rotation.z = 0.4 + Math.sin(time * 4) * 0.08;
        if (rightEar) rightEar.rotation.z = -0.4 - Math.sin(time * 4) * 0.08;
        if (headMesh) headMesh.position.y = 0.88 + breath;

      } else if (petType === 'pig') {
        // 🐷 Pig Trot & Snout Wiggle
        const trotCycle = Math.sin(time * 4);
        petRoot.position.y = Math.abs(trotCycle) * 0.06;
        if (headMesh) headMesh.rotation.z = trotCycle * 0.06;
        if (tailMesh) tailMesh.rotation.y = Math.sin(time * 9) * 0.4;

      } else {
        // 🐱 Cat Natural Locomotion & Tail Swish
        const breath = Math.sin(time * 2) * 0.025;
        if (!isSleeping) {
          if (tailMesh) tailMesh.rotation.x = Math.sin(time * 2.5) * 0.25;
          if (tailMesh) tailMesh.rotation.y = Math.cos(time * 2.0) * 0.3;
          if (headMesh) {
            headMesh.position.y = 0.85 + breath;
            headMesh.rotation.z = Math.sin(time * 1.5) * 0.04;
          }
        } else {
          // Sleeping cat
          petRoot.scale.set(1.05, 0.9 + breath, 1.05);
        }
      }

      // Angel Wings gentle flutter
      if (angelWingsRoot) {
        angelWingsRoot.children.forEach((w, i) => {
          w.rotation.y = Math.sin(time * 3.5 + i * Math.PI) * 0.25;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- 9. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // --- 10. CLEANUP ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();

      pedestalGeo.dispose();
      pedestalMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      shadowGeo.dispose();
      shadowTex.dispose();
      shadowMat.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    petType,
    kitten.isSleeping,
    kitten.isPlayMode,
    isInteracting,
    hasCrown,
    hasRibbon,
    hasSunglasses,
    hasBowtie,
    hasAngelWings,
  ]);

  return (
    <div className="relative w-full h-72 sm:h-84 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 3D Controls Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-pink-200/90 pointer-events-none flex items-center gap-1.5 shadow-md">
        <span>Toque no mascote para carinho • Arraste em 360° 🐾</span>
      </div>
    </div>
  );
};
