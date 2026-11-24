import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { HouseFurnitureTransform, HouseRoomId } from '../../types';
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
      const previous = propsRef.current.roomTransforms?.[roomId];
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
