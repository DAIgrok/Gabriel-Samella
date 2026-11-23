import * as THREE from 'three';
import { PetType } from '../types';

export const PET_BASE_HEX: Record<PetType, string> = {
  cat: '#f8fafc',
  dog: '#fbbf24',
  bunny: '#fbcfe8',
  pig: '#f9a8d4',
  mouse: '#cbd5e1',
  snake: '#4ade80',
  shark: '#38bdf8',
  bee: '#facc15',
  fox: '#fb923c',
  panda: '#ffffff',
  koala: '#94a3b8',
  penguin: '#1e293b',
  lion: '#f59e0b',
  tiger: '#fb923c',
  bear: '#92400e',
  frog: '#22c55e',
  hamster: '#fcd34d',
  hedgehog: '#a16207',
  parrot: '#ef4444',
  turtle: '#16a34a',
  dolphin: '#38bdf8',
  whale: '#60a5fa',
};

export interface RoamingPetInstance {
  petType: PetType;
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  legs: THREE.Mesh[];
  tail?: THREE.Object3D;
  targetX: number;
  targetZ: number;
  pauseTimer: number;
  walkPhase: number;
  speed: number;
  eatingUntil: number;
}

/**
 * Cria um mascote 3D leve e articulado para passear livremente pela Casa dos Sonhos
 */
export function buildCompactRoamingPet(
  petType: PetType,
  customHex?: string
): RoamingPetInstance {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);

  const primaryHex = customHex || PET_BASE_HEX[petType] || '#f8fafc';
  const furMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryHex),
    roughness: 0.65,
    metalness: 0.05,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xfff5f8,
    roughness: 0.72,
  });
  const earInnerMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.6,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x11071f,
    roughness: 0.15,
    metalness: 0.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1f1433,
    roughness: 0.55,
  });

  // Tronco fofinho arredondado
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.14, 8, 14), furMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.16, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), bellyMat);
  belly.scale.set(0.88, 0.72, 1.05);
  belly.position.set(0, 0.13, 0.01);
  bodyGroup.add(belly);

  // 4 patinhas articuladas
  const legs: THREE.Mesh[] = [];
  const legPositions: [number, number][] = [
    [-0.065, 0.075],
    [0.065, 0.075],
    [-0.065, -0.075],
    [0.065, -0.075],
  ];
  const legGeo = new THREE.CapsuleGeometry(0.03, 0.06, 6, 8);
  legPositions.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, petType === 'panda' ? darkMat : furMat);
    leg.position.set(lx, 0.06, lz);
    leg.castShadow = true;
    bodyGroup.add(leg);
    legs.push(leg);
  });

  // Cabeça posicionada à frente (+Z)
  headGroup.position.set(0, 0.27, 0.12);
  bodyGroup.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 14), furMat);
  head.scale.set(1.04, 0.96, 1.0);
  head.castShadow = true;
  headGroup.add(head);

  // Focinho & narizinho
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), bellyMat);
  muzzle.scale.set(1.1, 0.85, 0.8);
  muzzle.position.set(0, -0.025, 0.095);
  headGroup.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), earInnerMat);
  nose.position.set(0, -0.012, 0.128);
  headGroup.add(nose);

  // Olhinhos brilhantes
  [-0.044, 0.044].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), eyeMat);
    eye.position.set(ex, 0.015, 0.098);
    headGroup.add(eye);
  });

  // Orelhas específicas por espécie
  if (petType === 'bunny') {
    const earGeo = new THREE.CapsuleGeometry(0.024, 0.11, 6, 8);
    [-0.052, 0.052].forEach((ex, idx) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(ex, 0.145, 0.01);
      ear.rotation.z = idx === 0 ? 0.12 : -0.12;
      ear.castShadow = true;
      headGroup.add(ear);
    });
  } else if (petType === 'dog' || petType === 'koala') {
    const earGeo = new THREE.SphereGeometry(0.042, 10, 10);
    [-0.095, 0.095].forEach((ex, idx) => {
      const ear = new THREE.Mesh(earGeo, petType === 'dog' ? darkMat : furMat);
      ear.scale.set(0.6, 1.15, 0.75);
      ear.position.set(ex, 0.035, 0.01);
      ear.rotation.z = idx === 0 ? 0.35 : -0.35;
      headGroup.add(ear);
    });
  } else if (petType === 'bear' || petType === 'panda' || petType === 'hamster' || petType === 'frog') {
    const earGeo = new THREE.SphereGeometry(0.034, 10, 10);
    [-0.075, 0.075].forEach((ex) => {
      const ear = new THREE.Mesh(earGeo, petType === 'panda' ? darkMat : furMat);
      ear.position.set(ex, 0.092, 0.01);
      headGroup.add(ear);
    });
  } else {
    // Orelhas pontudinhas padrão (gatinho, raposa, tigre, etc.)
    const earGeo = new THREE.ConeGeometry(0.04, 0.08, 10);
    [-0.068, 0.068].forEach((ex, idx) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(ex, 0.112, 0.015);
      ear.rotation.z = idx === 0 ? 0.25 : -0.25;
      ear.castShadow = true;
      headGroup.add(ear);

      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.046, 8), earInnerMat);
      inner.position.set(0, -0.005, 0.014);
      ear.add(inner);
    });
  }

  // Rabinho fofo
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.19, -0.14);
  const tailMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.13, 6, 8), furMat);
  tailMesh.rotation.x = -Math.PI / 3;
  tailMesh.position.set(0, 0.05, -0.05);
  tailPivot.add(tailMesh);
  bodyGroup.add(tailPivot);

  return {
    petType,
    root,
    bodyGroup,
    headGroup,
    legs,
    tail: tailPivot,
    targetX: (Math.random() - 0.5) * 3.4,
    targetZ: (Math.random() - 0.5) * 2.8,
    pauseTimer: 0.4 + Math.random() * 1.4,
    walkPhase: Math.random() * Math.PI * 2,
    speed: 0.65 + Math.random() * 0.25,
    eatingUntil: 0,
  };
}
