import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { HouseFurnitureTransform, HouseRoomId } from '../../types';
import { detectSoftwareWebGL, disposeObject3D } from '../../utils/threeCozyHelpers';

interface DreamHouseWorld3DProps {
  rooms: HouseRoomId[];
  roomTransforms?: Partial<Record<HouseRoomId, HouseFurnitureTransform>>;
  plotSize: number;
  isEditMode?: boolean;
  onOpenRoom: (room: HouseRoomId) => void;
  onMoveRoom: (room: HouseRoomId, transform: HouseFurnitureTransform) => void;
}

const ROOM_STYLE: Record<HouseRoomId, { label: string; wall: number; floor: number; accent: number }> = {
  sala: { label: 'Sala', wall: 0x9aabc8, floor: 0x92775b, accent: 0xd6b56d },
  quarto: { label: 'Quarto', wall: 0x8199c4, floor: 0x786b64, accent: 0xa78bfa },
  cozinha: { label: 'Cozinha', wall: 0xb8b6a5, floor: 0x777b7d, accent: 0x60a5fa },
  banheiro: { label: 'Banheiro', wall: 0x9fc6d1, floor: 0x718e9a, accent: 0x7dd3fc },
  varanda: { label: 'Varanda', wall: 0x9ab49b, floor: 0x78684d, accent: 0xd6b56d },
};

const DEFAULT_POSITIONS: [number, number][] = [
  [0, 0],
  [3.7, 0],
  [-3.7, 0],
  [0, 3.7],
  [0, -3.7],
];

function makeLabelTexture(text: string, accent: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(7,17,38,0.88)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 28);
    ctx.fill();
    ctx.strokeStyle = '#' + new THREE.Color(accent).getHexString();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const DreamHouseWorld3D: React.FC<DreamHouseWorld3DProps> = ({
  rooms,
  roomTransforms = {},
  plotSize,
  isEditMode = false,
  onOpenRoom,
  onMoveRoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ rooms, roomTransforms, plotSize, isEditMode, onOpenRoom, onMoveRoom });
  propsRef.current = { rooms, roomTransforms, plotSize, isEditMode, onOpenRoom, onMoveRoom };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const softwareGl = detectSoftwareWebGL();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1730);
    scene.fog = new THREE.Fog(0x0b1730, 24, 52);

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(10, 10, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: !softwareGl, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(softwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !softwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xdce9f2, 0x40543c, 1.45);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d2, 2.1);
    sun.position.set(8, 14, 7);
    sun.castShadow = !softwareGl;
    sun.shadow.mapSize.set(softwareGl ? 512 : 1024, softwareGl ? 512 : 1024);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9bb8d6, 0.65);
    fill.position.set(-8, 7, -9);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = true;
    controls.minDistance = 7;
    controls.maxDistance = Math.max(22, propsRef.current.plotSize * 1.55);
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.minPolarAngle = Math.PI / 7;
    controls.target.set(0, 0.3, 0);

    const world = new THREE.Group();
    scene.add(world);

    const groundSize = Math.max(16, propsRef.current.plotSize + 10);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(groundSize, groundSize),
      new THREE.MeshStandardMaterial({ color: 0x243d2d, roughness: 0.98 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.34;
    ground.receiveShadow = true;

    world.add(ground);

    // Living neighborhood: landscaped garden, trees, shrubs and nearby homes.
    const landscape = new THREE.Group();
    world.add(landscape);
    const bark = new THREE.MeshStandardMaterial({ color: 0x59402e, roughness: 0.96 });
    const barkLight = new THREE.MeshStandardMaterial({ color: 0x79563a, roughness: 0.94 });
    const leafMats = [0x315d3d, 0x3f7045, 0x527d48, 0x6d8b50].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92 })
    );
    const shrubMat = new THREE.MeshStandardMaterial({ color: 0x416b43, roughness: 0.95 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8b9294, roughness: 0.9 });
    const houseWalls = [0xd8d0c1, 0xc8d3d5, 0xe0d6c8, 0xb9c5bd].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.88 })
    );
    const roofMats = [0x394b63, 0x765342, 0x465b50, 0x5a526e].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.84 })
    );
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x9ac6d8, emissive: 0x28465b, emissiveIntensity: 0.22,
      roughness: 0.24, metalness: 0.08
    });
    const deterministic = (n: number) => {
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };

    // Curved footpath and garden border around the player's plot.
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x9b927e, roughness: 0.98 });
    const path = new THREE.Mesh(new THREE.RingGeometry(half + 0.65, half + 1.45, 4, 1), pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.y = -0.205;
    path.scale.set(1, 1, 1);
    landscape.add(path);

    // Trees use a tapered trunk, exposed roots and branching limbs, with layered foliage.
    const addTree = (x: number, z: number, scale: number, seed: number) => {
      const tree = new THREE.Group();
      tree.position.set(x, -0.2, z);
      tree.scale.setScalar(scale);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 2.05, 9), bark);
      trunk.position.y = 1.02;
      trunk.rotation.z = (deterministic(seed) - 0.5) * 0.18;
      trunk.castShadow = true;
      tree.add(trunk);
      for (let r = 0; r < 4; r++) {
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.12, 0.72, 7), barkLight);
        root.position.set(Math.cos(r * Math.PI / 2) * 0.22, 0.12, Math.sin(r * Math.PI / 2) * 0.22);
        root.rotation.z = Math.cos(r * Math.PI / 2) * 0.62;
        root.rotation.x = Math.sin(r * Math.PI / 2) * 0.62;
        tree.add(root);
      }
      for (let b = 0; b < 5; b++) {
        const angle = b * Math.PI * 2 / 5 + deterministic(seed + b) * 0.35;
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.09, 1.05, 7), bark);
        branch.position.set(Math.cos(angle) * 0.34, 1.82 + (b % 2) * 0.12, Math.sin(angle) * 0.34);
        branch.rotation.z = Math.cos(angle) * -0.62;
        branch.rotation.x = Math.sin(angle) * 0.62;
        tree.add(branch);
      }
      for (let l = 0; l < 13; l++) {
        const angle = l * 2.399 + seed;
        const crown = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.48 + deterministic(seed + l) * 0.22, 1),
          leafMats[l % leafMats.length]
        );
        crown.position.set(Math.cos(angle) * (0.38 + deterministic(l + seed) * 0.42), 2.05 + deterministic(l + seed * 2) * 0.95, Math.sin(angle) * (0.34 + deterministic(l + seed * 3) * 0.42));
        crown.scale.set(1.12, 0.72 + deterministic(l + 5) * 0.35, 0.92);
        crown.castShadow = true;
        tree.add(crown);
      }
      landscape.add(tree);
    };

    const addShrub = (x: number, z: number, size = 1) => {
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34 * size, 1), shrubMat);
      bush.position.set(x, 0.02, z);
      bush.scale.set(1.35, 0.72, 0.95);
      bush.castShadow = true;
      landscape.add(bush);
    };

    const edge = half + 2.1;
    for (let i = 0; i < 18; i++) {
      const side = i % 4;
      const t = (Math.floor(i / 4) - 1.7) * 2.35;
      const x = side === 0 ? t : side === 1 ? edge : side === 2 ? -t : -edge;
      const z = side === 0 ? -edge : side === 1 ? t : side === 2 ? edge : -t;
      addTree(x, z, 0.78 + deterministic(i + 30) * 0.35, i + 3);
      addShrub(x + (side % 2 ? 0.8 : -0.8), z + (side % 2 ? -0.8 : 0.8), 0.75 + deterministic(i) * 0.5);
    }

    // A small residential street scene beyond the garden, visible while orbiting 360°.
    const addNeighborHome = (x: number, z: number, rotation: number, index: number) => {
      const home = new THREE.Group();
      home.position.set(x, -0.2, z);
      home.rotation.y = rotation;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(3.15, 1.85, 2.75), houseWalls[index % houseWalls.length]);
      wall.position.y = 0.93;
      wall.castShadow = true;
      wall.receiveShadow = true;
      home.add(wall);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.35, 1.25, 4), roofMats[index % roofMats.length]);
      roof.position.y = 2.48;
      roof.rotation.y = Math.PI / 4;
      roof.scale.z = 0.86;
      roof.castShadow = true;
      home.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.15, 0.06), barkLight);
      door.position.set(0, 0.58, 1.405);
      home.add(door);
      for (const wx of [-0.92, 0.92]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.58, 0.07), windowMat);
        win.position.set(wx, 1.15, 1.405);
        home.add(win);
      }
      const porch = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.12, 0.72), stoneMat);
      porch.position.set(0, 0.12, 1.68);
      home.add(porch);
      landscape.add(home);
    };
    const neighborhoodRadius = half + 8.2;
    addNeighborHome(-neighborhoodRadius, -neighborhoodRadius * 0.55, Math.PI / 4, 0);
    addNeighborHome(neighborhoodRadius * 0.72, -neighborhoodRadius, -Math.PI / 5, 1);
    addNeighborHome(neighborhoodRadius, neighborhoodRadius * 0.48, Math.PI, 2);
    addNeighborHome(-neighborhoodRadius * 0.72, neighborhoodRadius, Math.PI * 0.7, 3);

    for (let i = 0; i < 22; i++) {
      const angle = i * Math.PI * 2 / 22;
      const radius = half + 1.65 + deterministic(i + 80) * 0.65;
      addShrub(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.55 + deterministic(i + 90) * 0.45);
    }

    const plot = new THREE.Mesh(
      new RoundedBoxGeometry(propsRef.current.plotSize, 0.22, propsRef.current.plotSize, 5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x3b5940, roughness: 0.94 })
    );
    plot.position.y = -0.13;
    plot.receiveShadow = true;
    world.add(plot);

    const grid = new THREE.GridHelper(propsRef.current.plotSize - 0.45, Math.round(propsRef.current.plotSize * 2), 0x8bb5d6, 0x69816a);
    grid.position.y = -0.005;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.19;
    });
    world.add(grid);

    const half = propsRef.current.plotSize / 2;
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x9b8257, roughness: 0.78 });
    [
      { x: 0, z: -half, sx: propsRef.current.plotSize, sz: 0.12 },
      { x: 0, z: half, sx: propsRef.current.plotSize, sz: 0.12 },
      { x: -half, z: 0, sx: 0.12, sz: propsRef.current.plotSize },
      { x: half, z: 0, sx: 0.12, sz: propsRef.current.plotSize },
    ].forEach((rail) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(rail.sx, 0.2, rail.sz), borderMaterial);
      mesh.position.set(rail.x, 0.02, rail.z);
      mesh.castShadow = true;
      world.add(mesh);
    });

    const roomGroups = new Map<HouseRoomId, THREE.Group>();
    const roomMeshes: THREE.Object3D[] = [];
    const roomList = propsRef.current.rooms;

    roomList.forEach((roomId, index) => {
      const style = ROOM_STYLE[roomId];
      const transform = propsRef.current.roomTransforms?.[roomId];
      const fallback = DEFAULT_POSITIONS[index] || [0, 0];
      const group = new THREE.Group();
      group.position.set(transform?.x ?? fallback[0], 0, transform?.z ?? fallback[1]);
      group.rotation.y = transform?.rotY ?? 0;
      group.userData.roomId = roomId;

      const floor = new THREE.Mesh(
        new RoundedBoxGeometry(3.35, 0.16, 3.35, 4, 0.07),
        new THREE.MeshStandardMaterial({ color: style.floor, roughness: 0.72 })
      );
      floor.position.y = 0.06;
      floor.receiveShadow = true;
      floor.userData.roomId = roomId;
      group.add(floor);

      const wallMaterial = new THREE.MeshStandardMaterial({ color: style.wall, roughness: 0.86 });
      const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x26354a, roughness: 0.58, metalness: 0.08 });
      const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb9d9e8, roughness: 0.16, metalness: 0.04, transparent: true, opacity: 0.48, transmission: 0.12 });

      const backWall = new THREE.Mesh(new RoundedBoxGeometry(3.35, 2.25, 0.14, 3, 0.045), wallMaterial);
      backWall.position.set(0, 1.2, -1.66);
      backWall.userData.roomId = roomId;
      group.add(backWall);

      const leftWall = new THREE.Mesh(new RoundedBoxGeometry(0.14, 2.25, 3.35, 3, 0.045), wallMaterial);
      leftWall.position.set(-1.66, 1.2, 0);
      leftWall.userData.roomId = roomId;
      group.add(leftWall);

      const rightWall = new THREE.Mesh(new RoundedBoxGeometry(0.14, 2.25, 3.35, 3, 0.045), wallMaterial);
      rightWall.position.set(1.66, 1.2, 0);
      rightWall.userData.roomId = roomId;
      group.add(rightWall);

      const frontLeft = new THREE.Mesh(new RoundedBoxGeometry(1.1, 2.25, 0.14, 3, 0.045), wallMaterial);
      frontLeft.position.set(-1.12, 1.2, 1.66);
      const frontRight = new THREE.Mesh(new RoundedBoxGeometry(1.1, 2.25, 0.14, 3, 0.045), wallMaterial);
      frontRight.position.set(1.12, 1.2, 1.66);
      const lintel = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.32, 0.14, 3, 0.045), wallMaterial);
      lintel.position.set(0, 2.16, 1.66);
      group.add(frontLeft, frontRight, lintel);

      const door = new THREE.Mesh(new RoundedBoxGeometry(0.92, 1.82, 0.07, 3, 0.035), trimMaterial);
      door.position.set(0, 1.0, 1.7);
      door.userData.roomId = roomId;
      group.add(door);
      const doorInset = new THREE.Mesh(new RoundedBoxGeometry(0.68, 1.55, 0.025, 3, 0.025), new THREE.MeshStandardMaterial({ color: 0x6b533b, roughness: 0.68 }));
      doorInset.position.set(0, 1.0, 1.75);
      doorInset.userData.roomId = roomId;
      group.add(doorInset);

      const window = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.78, 0.055, 3, 0.04), glassMaterial);
      window.position.set(0, 1.45, -1.57);
      window.userData.roomId = roomId;
      group.add(window);
      const windowFrame = new THREE.Mesh(new RoundedBoxGeometry(1.18, 0.9, 0.07, 3, 0.04), trimMaterial);
      windowFrame.position.set(0, 1.45, -1.6);
      windowFrame.userData.roomId = roomId;
      group.add(windowFrame);

      const beamMaterial = new THREE.MeshStandardMaterial({ color: 0x34435a, roughness: 0.6 });
      const beams = [
        { x: 0, z: -1.63, sx: 3.45, sz: 0.12 },
        { x: 0, z: 1.63, sx: 3.45, sz: 0.12 },
        { x: -1.63, z: 0, sx: 0.12, sz: 3.45 },
        { x: 1.63, z: 0, sx: 0.12, sz: 3.45 },
      ];
      beams.forEach((beam) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(beam.sx, 0.1, beam.sz), beamMaterial);
        mesh.position.set(beam.x, 2.38, beam.z);
        mesh.castShadow = true;
        mesh.userData.roomId = roomId;
        group.add(mesh);
      });

      const accentRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.035, 10, 32),
        new THREE.MeshStandardMaterial({ color: style.accent, emissive: style.accent, emissiveIntensity: 0.18, metalness: 0.4, roughness: 0.28 })
      );
      accentRing.rotation.x = -Math.PI / 2;
      accentRing.position.set(0, 0.18, 0);
      accentRing.userData.roomId = roomId;
      group.add(accentRing);

      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeLabelTexture(style.label, style.accent), transparent: true, depthWrite: false }));
      label.position.set(0, 3.05, 0);
      label.scale.set(2.8, 0.7, 1);
      label.userData.roomId = roomId;
      group.add(label);

      group.traverse((object) => {
        object.userData.roomId = roomId;
        if ((object as THREE.Mesh).isMesh) {
          (object as THREE.Mesh).castShadow = true;
          (object as THREE.Mesh).receiveShadow = true;
        }
      });
      world.add(group);
      roomGroups.set(roomId, group);
      roomMeshes.push(group);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    let draggingRoom: HouseRoomId | null = null;
    let dragOffset = new THREE.Vector3();
    let pointerDownAt = { x: 0, y: 0 };

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerDownAt = { x: event.clientX, y: event.clientY };
      if (!propsRef.current.isEditMode) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(roomMeshes, true).find((entry) => entry.object.userData.roomId);
      if (!hit) return;
      draggingRoom = hit.object.userData.roomId as HouseRoomId;
      controls.enabled = false;
      const group = roomGroups.get(draggingRoom);
      if (group && raycaster.ray.intersectPlane(dragPlane, hitPoint)) {
        dragOffset.copy(hitPoint).sub(group.position);
      }
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRoom || !propsRef.current.isEditMode) return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.ray.intersectPlane(dragPlane, hitPoint)) return;
      const group = roomGroups.get(draggingRoom);
      if (!group) return;
      const halfPlot = propsRef.current.plotSize / 2 - 1.9;
      group.position.x = THREE.MathUtils.clamp(hitPoint.x - dragOffset.x, -halfPlot, halfPlot);
      group.position.z = THREE.MathUtils.clamp(hitPoint.z - dragOffset.z, -halfPlot, halfPlot);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (draggingRoom) {
        const group = roomGroups.get(draggingRoom);
        if (group) {
          const previous = propsRef.current.roomTransforms?.[draggingRoom];
          propsRef.current.onMoveRoom(draggingRoom, {
            x: Number(group.position.x.toFixed(2)),
            z: Number(group.position.z.toFixed(2)),
            rotY: previous?.rotY || 0,
          });
        }
        draggingRoom = null;
        controls.enabled = true;
      } else if (Math.hypot(event.clientX - pointerDownAt.x, event.clientY - pointerDownAt.y) < 7) {
        setPointer(event);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(roomMeshes, true).find((entry) => entry.object.userData.roomId);
        if (hit?.object.userData.roomId) propsRef.current.onOpenRoom(hit.object.userData.roomId as HouseRoomId);
      }
    };

    const onDoubleClick = (event: MouseEvent) => {
      if (!propsRef.current.isEditMode) return;
      setPointer(event as PointerEvent);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(roomMeshes, true).find((entry) => entry.object.userData.roomId);
      const roomId = hit?.object.userData.roomId as HouseRoomId | undefined;
      if (!roomId) return;
      const group = roomGroups.get(roomId);
      if (!group) return;
      group.rotation.y += Math.PI / 2;
      propsRef.current.onMoveRoom(roomId, {
        x: Number(group.position.x.toFixed(2)),
        z: Number(group.position.z.toFixed(2)),
        rotY: Number(group.rotation.y.toFixed(2)),
      });
      event.preventDefault();
    };
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    const clock = new THREE.Clock();
    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      roomGroups.forEach((group, roomId) => {
        if (roomId === rooms[0]) {
          group.children.forEach((child) => {
            if (child.type === 'Sprite') child.position.y = 3.05 + Math.sin(time * 1.4) * 0.035;
          });
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth || 360;
      const nextHeight = container.clientHeight || 420;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      cancelAnimationFrame(animationFrame);
      controls.dispose();
      disposeObject3D(world);
      scene.clear();
      renderer.dispose();
      if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
    };
  }, [rooms.join(','), plotSize, JSON.stringify(roomTransforms), isEditMode]);

  return (
    <div className="relative w-full h-[26rem] sm:h-[34rem] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-[#071126]/85 border border-sky-200/15 text-[10px] text-slate-200 pointer-events-none">
        {isEditMode ? 'Arraste para posicionar · Toque duas vezes para girar · Gire a câmera em 360°' : 'Arraste para girar a casa em 360° · Toque em um cômodo para entrar'}
      </div>
    </div>
  );
};
