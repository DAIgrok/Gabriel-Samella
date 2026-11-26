export type DioramaAssetId = 'forest_house' | 'stylized_tree';

export type LimboWeatherMode =
  | 'auto'
  | 'day'
  | 'sunset'
  | 'night'
  | 'rain'
  | 'fog'
  | 'storm';

export interface DioramaAssetConfig {
  id: DioramaAssetId;
  title: string;
  shortLabel: string;
  subtitle: string;
  url: string;
  targetSize: number;
  defaultCameraPos: readonly [number, number, number];
  defaultTarget: readonly [number, number, number];
  groundOffsetY: number;
}

export const DIORAMA_ASSETS: Record<DioramaAssetId, DioramaAssetConfig> = {
  forest_house: {
    id: 'forest_house',
    title: 'Floresta & Casa Pacífica',
    shortLabel: 'Floresta & Casa',
    subtitle: 'Diorama 3D completo em limbo atmosférico',
    url: '/glb/forest-sided_a_peaceful_place_to_live_diorama.glb',
    targetSize: 6.4,
    defaultCameraPos: [5.8, 4.1, 6.2],
    defaultTarget: [0, 1.35, 0],
    groundOffsetY: 0,
  },
  stylized_tree: {
    id: 'stylized_tree',
    title: 'Árvore Estilizada',
    shortLabel: 'Árvore 3D',
    subtitle: 'Diorama 3D estilizado com céu vivo',
    url: '/glb/stylized_tree_diorama.glb',
    targetSize: 5.8,
    defaultCameraPos: [5.0, 3.6, 5.5],
    defaultTarget: [0, 1.65, 0],
    groundOffsetY: 0,
  },
};

export const DIORAMA_ASSET_LIST: DioramaAssetConfig[] = [
  DIORAMA_ASSETS.forest_house,
  DIORAMA_ASSETS.stylized_tree,
];
