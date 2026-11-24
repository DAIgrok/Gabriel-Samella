import {
  DreamHouseState,
  HouseFloorTheme,
  HouseFurnitureCatalogItem,
  HouseFurnitureCategory,
  HouseWallTheme,
  StoreItem,
} from '../types';

export const HOUSE_CATEGORY_META: {
  id: HouseFurnitureCategory;
  label: string;
  icon: string;
}[] = [
  { id: 'sofas', label: 'Sofás & Puffs', icon: 'sofa' },
  { id: 'mesas', label: 'Mesas', icon: 'table' },
  { id: 'cadeiras', label: 'Cadeiras', icon: 'chair' },
  { id: 'tvs', label: 'TVs & Cinema', icon: 'tv' },
  { id: 'pcs', label: 'PCs & Setup', icon: 'pc' },
  { id: 'camas', label: 'Camas & Armários', icon: 'bed' },
  { id: 'cozinha', label: 'Cozinha', icon: 'coffee' },
  { id: 'banheiro', label: 'Banheiro & Spa', icon: 'bath' },
  { id: 'decoracao', label: 'Decoração', icon: 'sparkles' },
  { id: 'iluminacao', label: 'Iluminação', icon: 'lamp' },
  { id: 'plantas', label: 'Plantas', icon: 'tree' },
  { id: 'varanda', label: 'Varanda', icon: 'sun' },
  { id: 'paredes', label: 'Paredes', icon: 'palette' },
  { id: 'pisos', label: 'Pisos', icon: 'palette' },
];

export const HOUSE_FURNITURE_CATALOG: HouseFurnitureCatalogItem[] = [
  // --- SOFÁS ---
  {
    id: 'house-sofa',
    name: 'Sofá de Veludo 3 Lugares',
    room: 'sala',
    category: 'sofas',
    description: 'Sofá macio de 3 lugares com almofadas fofas e cor personalizável.',
    price: 22,
    accentHex: '#ec4899',
    modelVariant: 'sofa_3seat',
  },
  {
    id: 'house-sofa-lshape',
    name: 'Sofá em L Conforto Total',
    room: 'sala',
    category: 'sofas',
    description: 'Sofá de canto amplo estilo lounge para filmes abraçadinhos.',
    price: 34,
    accentHex: '#a855f7',
    modelVariant: 'sofa_lshape',
  },
  {
    id: 'house-loveseat',
    name: 'Sofá Namoradeira Romântico',
    room: 'sala',
    category: 'sofas',
    description: 'Dois lugares aconchegantes com encosto curvado elegante.',
    price: 20,
    accentHex: '#f472b6',
    modelVariant: 'sofa_loveseat',
  },
  {
    id: 'house-beanbag',
    name: 'Puff Nuvem Gigante',
    room: 'quarto',
    category: 'sofas',
    description: 'Puff super macio que se adapta ao corpo para ler ou jogar.',
    price: 12,
    accentHex: '#c084fc',
    modelVariant: 'puff_cloud',
  },
  {
    id: 'house-chaise',
    name: 'Chaise Longue Imperial',
    room: 'quarto',
    category: 'sofas',
    description: 'Divã confortável para relaxar perto da janela.',
    price: 24,
    accentHex: '#fb7185',
    modelVariant: 'sofa_chaise',
  },

  // --- MESAS ---
  {
    id: 'house-coffee-table',
    name: 'Mesa de Centro Vidro & Madeira',
    room: 'sala',
    category: 'mesas',
    description: 'Mesa baixa elegante para colocar cafés e revistinhas.',
    price: 14,
    accentHex: '#f5d0fe',
    modelVariant: 'table_coffee',
  },
  {
    id: 'house-dining-table',
    name: 'Mesa de Jantar 4 Lugares',
    room: 'cozinha',
    category: 'mesas',
    description: 'Mesa espaçosa para jantares românticos à luz de velas.',
    price: 28,
    accentHex: '#e2e8f0',
    modelVariant: 'table_dining',
  },
  {
    id: 'house-round-table',
    name: 'Mesa Redonda Bistrô',
    room: 'cozinha',
    category: 'mesas',
    description: 'Mesinha redonda charmosa para café da manhã a dois.',
    price: 16,
    accentHex: '#fde68a',
    modelVariant: 'table_round',
  },
  {
    id: 'house-desk-study',
    name: 'Escrivaninha Minimalista',
    room: 'quarto',
    category: 'mesas',
    description: 'Bancada moderna com gavetas para estudos e diário.',
    price: 18,
    accentHex: '#cbd5e1',
    modelVariant: 'table_desk',
  },
  {
    id: 'house-nightstand',
    name: 'Criado-Mudo Duplo com Gavetas',
    room: 'quarto',
    category: 'mesas',
    description: 'Mesinha lateral perfeita para abajur, celular e alianças.',
    price: 11,
    accentHex: '#c084fc',
    modelVariant: 'table_nightstand',
  },
  {
    id: 'house-tea-table',
    name: 'Mesa de Chá & Bolo',
    room: 'cozinha',
    category: 'mesas',
    description: 'Bolo confeitado e bule dourado para o lanche especial a dois.',
    price: 20,
    accentHex: '#fb7185',
    modelVariant: 'table_tea',
  },

  // --- CADEIRAS & POLTRONAS ---
  {
    id: 'house-armchair-velvet',
    name: 'Poltrona Concha Aconchegante',
    room: 'sala',
    category: 'cadeiras',
    description: 'Poltrona arredondada envolvente com pés dourados.',
    price: 16,
    accentHex: '#f472b6',
    modelVariant: 'chair_armchair',
  },
  {
    id: 'house-gamer-chair',
    name: 'Cadeira Gamer Ergonômica',
    room: 'quarto',
    category: 'cadeiras',
    description: 'Cadeira alta reclinável com almofadas e rodinhas 360°.',
    price: 22,
    accentHex: '#a855f7',
    modelVariant: 'chair_gamer',
  },
  {
    id: 'house-dining-chair',
    name: 'Conjunto 2 Cadeiras Estofadas',
    room: 'cozinha',
    category: 'cadeiras',
    description: 'Par de cadeiras confortáveis para a mesa de jantar.',
    price: 14,
    accentHex: '#e879f9',
    modelVariant: 'chair_dining',
  },
  {
    id: 'house-bar-stool',
    name: 'Banqueta Alta Gourmet',
    room: 'cozinha',
    category: 'cadeiras',
    description: 'Banqueta giratória elegante para encaixar na bancada.',
    price: 11,
    accentHex: '#f9a8d4',
    modelVariant: 'chair_stool',
  },
  {
    id: 'house-rocking-chair',
    name: 'Cadeira de Balanço Clássica',
    room: 'varanda',
    category: 'cadeiras',
    description: 'Cadeira acolhedora para balançar admirando o céu.',
    price: 18,
    accentHex: '#d97706',
    modelVariant: 'chair_rocking',
  },

  // --- TVS & CINEMA ---
  {
    id: 'house-tv-stand',
    name: 'Rack & Smart TV Cinema 65"',
    room: 'sala',
    category: 'tvs',
    description: 'Painel suspenso com Smart TV widescreen e soundbar.',
    price: 32,
    accentHex: '#f472b6',
    modelVariant: 'tv_cinema',
  },
  {
    id: 'house-tv-retro',
    name: 'TV Retrô Pastel com Console',
    room: 'quarto',
    category: 'tvs',
    description: 'Televisão vintage fofa para assistir animações e séries.',
    price: 20,
    accentHex: '#c084fc',
    modelVariant: 'tv_retro',
  },
  {
    id: 'house-projector',
    name: 'Projetor Telão Home Theater',
    room: 'sala',
    category: 'tvs',
    description: 'Tela retrátil gigante com projetor iluminado para noites de filme.',
    price: 38,
    accentHex: '#38bdf8',
    modelVariant: 'tv_projector',
  },

  // --- PCS & SETUP ---
  {
    id: 'house-pc-gamer',
    name: 'Setup PC Gamer RGB Completo',
    room: 'quarto',
    category: 'pcs',
    description: 'Mesa com monitor curvo, gabinete RGB transparente e teclado mecânico.',
    price: 36,
    accentHex: '#a855f7',
    modelVariant: 'pc_gamer',
  },
  {
    id: 'house-pc-dual',
    name: 'Estação Dual-Screen do Casal',
    room: 'sala',
    category: 'pcs',
    description: 'Dois monitores lado a lado para jogar ou assistir juntos.',
    price: 42,
    accentHex: '#ec4899',
    modelVariant: 'pc_dual',
  },
  {
    id: 'house-laptop-station',
    name: 'Cantinho Notebook Aconchegante',
    room: 'quarto',
    category: 'pcs',
    description: 'Notebook aberto com luminária articulada e caneca fofa.',
    price: 22,
    accentHex: '#f9a8d4',
    modelVariant: 'pc_laptop',
  },

  // --- CAMAS & ARMÁRIOS ---
  {
    id: 'house-cozy-bed',
    name: 'Cama Casal Aconchego',
    room: 'quarto',
    category: 'camas',
    description: 'Edredom fofinho e travesseiros confortáveis com cabeceira estofada.',
    price: 28,
    accentHex: '#a855f7',
    modelVariant: 'bed_cozy',
  },
  {
    id: 'house-canopy-bed',
    name: 'Cama Dossel Real com Véu',
    room: 'quarto',
    category: 'camas',
    description: 'Estrutura alta elegante com cortinas fluidas iluminadas.',
    price: 38,
    accentHex: '#f472b6',
    modelVariant: 'bed_canopy',
  },
  {
    id: 'house-heart-bed',
    name: 'Cama Romântica Cabeceira Coração',
    room: 'quarto',
    category: 'camas',
    description: 'Cabeceira esculpida em coração com almofadas de veludo.',
    price: 34,
    accentHex: '#fb7185',
    modelVariant: 'bed_heart',
  },
  {
    id: 'house-wardrobe',
    name: 'Guarda-Roupa Clássico 3 Portas',
    room: 'quarto',
    category: 'camas',
    description: 'Armário espaçoso com espelho vertical e puxadores dourados.',
    price: 28,
    accentHex: '#c084fc',
    modelVariant: 'wardrobe_classic',
  },
  {
    id: 'house-vanity',
    name: 'Penteadeira Camarim com Espelho',
    room: 'quarto',
    category: 'camas',
    description: 'Espelho iluminado por lâmpadas de camarim e frascos de perfume.',
    price: 24,
    accentHex: '#fbcfe8',
    modelVariant: 'vanity_mirror',
  },

  // --- COZINHA ---
  {
    id: 'house-kitchen-island',
    name: 'Bancada Gourmet de Mármore',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Ilha central elegante com tampo polido e utensílios.',
    price: 26,
    accentHex: '#e2e8f0',
    modelVariant: 'kitchen_island',
  },
  {
    id: 'house-fridge',
    name: 'Geladeira Retrô Pastel 2 Portas',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Geladeira charmosa estilo vintage com imãs de coração.',
    price: 24,
    accentHex: '#f9a8d4',
    modelVariant: 'kitchen_fridge',
  },
  {
    id: 'house-stove',
    name: 'Fogão & Forno Chef 5 Bocas',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Fogão moderno com panelinha cozinhando no fogo baixo.',
    price: 24,
    accentHex: '#94a3b8',
    modelVariant: 'kitchen_stove',
  },
  {
    id: 'house-sink-cabinet',
    name: 'Pia & Armário Planejado',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Gabinete completo com torneira metálica e pratos empilhados.',
    price: 22,
    accentHex: '#c084fc',
    modelVariant: 'kitchen_sink',
  },
  {
    id: 'house-coffee-bar',
    name: 'Cantinho do Café Express',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Cafeteira retrô com xícaras, pires e potinho doce.',
    price: 15,
    accentHex: '#f472b6',
    modelVariant: 'kitchen_coffee',
  },
  {
    id: 'house-pet-bowl',
    name: 'Pote de Ração & Água Duplo',
    room: 'cozinha',
    category: 'cozinha',
    description: 'Comedouro e bebedouro duplo indispensável para alimentar e hidratar seu pet.',
    price: 12,
    accentHex: '#f472b6',
    modelVariant: 'pet_bowl',
  },

  // --- BANHEIRO & SPA ---
  {
    id: 'house-bathtub',
    name: 'Banheira Vitoriana de Espuma',
    room: 'banheiro',
    category: 'banheiro',
    description: 'Banheira clássica cheia de espuma quentinha e patinho fofo.',
    price: 30,
    accentHex: '#f8fafc',
    modelVariant: 'bath_tub',
  },
  {
    id: 'house-jacuzzi',
    name: 'Hidromassagem Spa Privativa',
    room: 'varanda',
    category: 'banheiro',
    description: 'Ofurô aquecido iluminado por LED subaquático relaxante.',
    price: 40,
    accentHex: '#38bdf8',
    modelVariant: 'bath_jacuzzi',
  },
  {
    id: 'house-bathroom-vanity',
    name: 'Lavatório com Espelho Redondo',
    room: 'banheiro',
    category: 'banheiro',
    description: 'Bancada com cuba esculpida, toalhinhas dobradas e difusor.',
    price: 18,
    accentHex: '#e2e8f0',
    modelVariant: 'bath_vanity',
  },

  // --- DECORAÇÃO ---
  {
    id: 'house-rug',
    name: 'Tapete Circular Felpudo',
    room: 'sala',
    category: 'decoracao',
    description: 'Tapete redondo macio que traz aconchego imediato ao cômodo.',
    price: 12,
    accentHex: '#c084fc',
    modelVariant: 'decor_rug',
  },
  {
    id: 'house-rug-heart',
    name: 'Tapete Coração Aveludado',
    room: 'quarto',
    category: 'decoracao',
    description: 'Tapete em formato de coração para os pés ao acordar.',
    price: 14,
    accentHex: '#fb7185',
    modelVariant: 'decor_rug_heart',
  },
  {
    id: 'house-fireplace',
    name: 'Lareira Aconchegante de Pedra',
    room: 'sala',
    category: 'decoracao',
    description: 'Lareira com fogo animado e brilho âmbar que aquece a sala.',
    price: 32,
    accentHex: '#f97316',
    modelVariant: 'decor_fireplace',
  },
  {
    id: 'house-piano',
    name: 'Piano de Cauda Estrelado',
    room: 'sala',
    category: 'decoracao',
    description: 'Piano clássico elegante que toca acordes suaves ao toque.',
    price: 42,
    accentHex: '#a855f7',
    modelVariant: 'decor_piano',
  },
  {
    id: 'house-bookshelf',
    name: 'Estante Encantada do Casal',
    room: 'sala',
    category: 'decoracao',
    description: 'Estante alta com livros coloridos, velas e miniaturas.',
    price: 20,
    accentHex: '#b45309',
    modelVariant: 'decor_bookshelf',
  },
  {
    id: 'house-mini-aquarium',
    name: 'Aquário Decorativo de Sala',
    room: 'sala',
    category: 'decoracao',
    description: 'Móvel com aquário iluminado repleto de peixinhos coloridos.',
    price: 26,
    accentHex: '#22d3ee',
    modelVariant: 'decor_aquarium',
  },

  // --- ILUMINAÇÃO ---
  {
    id: 'house-lamp',
    name: 'Abajur de Piso Arco Dourado',
    room: 'sala',
    category: 'iluminacao',
    description: 'Luminária alta elegante que espalha luz quente pelo ambiente.',
    price: 15,
    accentHex: '#fbbf24',
    modelVariant: 'lamp_floor',
  },
  {
    id: 'house-heart-lamp',
    name: 'Luminária Neon Coração',
    room: 'quarto',
    category: 'iluminacao',
    description: 'Escultura luminosa que acende em neon suave ao toque.',
    price: 16,
    accentHex: '#fb7185',
    modelVariant: 'lamp_heart',
  },
  {
    id: 'house-moon-lamp',
    name: 'Luminária Lua Cheia 3D',
    room: 'quarto',
    category: 'iluminacao',
    description: 'Esfera lunar flutuante sobre suporte de madeira polida.',
    price: 18,
    accentHex: '#fde68a',
    modelVariant: 'lamp_moon',
  },

  // --- PLANTAS ---
  {
    id: 'house-plant',
    name: 'Vaso Costela-de-Adão',
    room: 'sala',
    category: 'plantas',
    description: 'Planta tropical estilizada em cachepô de cerâmica.',
    price: 12,
    accentHex: '#34d399',
    modelVariant: 'plant_monstera',
  },
  {
    id: 'house-bonsai-sakura',
    name: 'Mini Bonsai de Cerejeira',
    room: 'quarto',
    category: 'plantas',
    description: 'Árvore delicada em miniatura com flores rosadas.',
    price: 16,
    accentHex: '#f472b6',
    modelVariant: 'plant_sakura',
  },
  {
    id: 'house-cactus',
    name: 'Trio de Cactos & Suculentas',
    room: 'cozinha',
    category: 'plantas',
    description: 'Três vasinhos fofos fáceis de cuidar e cheios de charme.',
    price: 10,
    accentHex: '#4ade80',
    modelVariant: 'plant_cactus',
  },

  // --- VARANDA ---
  {
    id: 'house-balcony-bench',
    name: 'Banco Namoradeira da Varanda',
    room: 'varanda',
    category: 'varanda',
    description: 'Banco aconchegante para contemplar a vista juntos.',
    price: 18,
    accentHex: '#93c5fd',
    modelVariant: 'varanda_bench',
  },
  {
    id: 'house-balcony-swing',
    name: 'Balanço Florido Suspenso',
    room: 'varanda',
    category: 'varanda',
    description: 'Balanço de jardim suspenso com flores e almofadas fofas.',
    price: 28,
    accentHex: '#f43f5e',
    modelVariant: 'varanda_swing',
  },
  {
    id: 'house-telescope',
    name: 'Luneta Astrônomica das Estrelas',
    room: 'varanda',
    category: 'varanda',
    description: 'Telescópio elegante sobre tripé apontado para o céu.',
    price: 24,
    accentHex: '#fbbf24',
    modelVariant: 'varanda_telescope',
  },
  {
    id: 'house-bbq-grill',
    name: 'Churrasqueira Gourmet de Varanda',
    room: 'varanda',
    category: 'varanda',
    description: 'Grill moderno para tardes ensolaradas de churrasquinho a dois.',
    price: 26,
    accentHex: '#f97316',
    modelVariant: 'varanda_grill',
  },
];

export const HOUSE_WALL_THEMES: {
  id: HouseWallTheme;
  label: string;
  colorHex: string;
  price?: number;
  unlockedByDefault?: boolean;
}[] = [
  { id: 'lavender', label: 'Lavanda Noturna', colorHex: '#2e1065', unlockedByDefault: true },
  { id: 'midnight', label: 'Veludo Preto', colorHex: '#130924', price: 10, unlockedByDefault: false },
  { id: 'rosewood', label: 'Rosa Antigo', colorHex: '#4c0519', price: 12, unlockedByDefault: false },
  { id: 'starlight', label: 'Céu Estrelado', colorHex: '#1e1b4b', price: 16, unlockedByDefault: false },
  { id: 'christmas', label: 'Natal Encantado', colorHex: '#14532d', price: 14, unlockedByDefault: false },
  { id: 'halloween', label: 'Noite Mística', colorHex: '#2e1035', price: 14, unlockedByDefault: false },
];

export const HOUSE_FLOOR_THEMES: {
  id: HouseFloorTheme;
  label: string;
  colorHex: string;
  price?: number;
  unlockedByDefault?: boolean;
}[] = [
  { id: 'wood', label: 'Madeira Quente', colorHex: '#5c3419', unlockedByDefault: true },
  { id: 'marble', label: 'Mármore Lilás', colorHex: '#33224a', price: 12, unlockedByDefault: false },
  { id: 'velvet', label: 'Carpete Rosé', colorHex: '#4a1936', price: 12, unlockedByDefault: false },
  { id: 'checkered', label: 'Xadrez Clássico', colorHex: '#27173a', price: 14, unlockedByDefault: false },
];

export const HOUSE_ROOM_PRICES: Record<DreamHouseState['activeRoom'], number> = {
  sala: 0,
  quarto: 35,
  cozinha: 40,
  banheiro: 35,
  varanda: 30,
};

// Casa dos Sonhos começa do zero: Sala vazia gratuita e demais cômodos comprados separadamente
export const INITIAL_DREAM_HOUSE: DreamHouseState = {
  activeRoom: 'sala',
  unlockedRooms: ['sala'],
  wallTheme: 'lavender',
  floorTheme: 'wood',
  customWallHex: '#3b1c6d',
  customFloorHex: '#5c3419',
  footprintWidth: 6.4,
  footprintDepth: 5.4,
  wallHeight: 2.75,
  customColors: {},
  lightsOn: true,
  fireplaceLit: true,
  musicNoteGlow: true,
  unlockedFurnitureIds: [],
  placedFurniture: {
    sala: [],
    quarto: [],
    varanda: [],
    cozinha: [],
    banheiro: [],
  },
  furnitureTransforms: {},
  comfortLevel: 1,
};

function iconForHouseCategory(cat: HouseFurnitureCategory): string {
  switch (cat) {
    case 'sofas':
      return 'sofa';
    case 'mesas':
      return 'table';
    case 'cadeiras':
      return 'chair';
    case 'tvs':
      return 'tv';
    case 'pcs':
      return 'pc';
    case 'camas':
      return 'bed';
    case 'cozinha':
      return 'coffee';
    case 'banheiro':
      return 'bath';
    case 'iluminacao':
      return 'lamp';
    case 'plantas':
      return 'tree';
    case 'varanda':
      return 'sun';
    case 'paredes':
    case 'pisos':
      return 'palette';
    default:
      return 'sparkles';
  }
}

export const HOUSE_STORE_ITEMS: StoreItem[] = [
  ...HOUSE_FURNITURE_CATALOG.map((item): StoreItem => ({
    id: `item-${item.id}`,
    title: item.name,
    description: `${item.description} (Escolha a cor que desejar!)`,
    price: item.price ?? 18,
    icon: iconForHouseCategory(item.category),
    category: 'casa',
    houseCategory: item.category,
    supportsCustomColor: true,
    defaultColor: item.accentHex,
    purchased: false,
    slotType: 'house-furniture',
    targetId: item.id,
  })),
  ...HOUSE_WALL_THEMES.filter((w) => !w.unlockedByDefault).map((wall): StoreItem => ({
    id: `item-house-wall-${wall.id}`,
    title: `Parede ${wall.label}`,
    description: 'Acabamento de parede exclusivo para a Casa 3D (com seletor de cor livre!).',
    price: wall.price ?? 14,
    icon: 'palette',
    category: 'casa',
    houseCategory: 'paredes',
    supportsCustomColor: true,
    defaultColor: wall.colorHex,
    purchased: false,
    slotType: 'house-wall',
    targetId: wall.id,
  })),
  ...HOUSE_FLOOR_THEMES.filter((f) => !f.unlockedByDefault).map((floor): StoreItem => ({
    id: `item-house-floor-${floor.id}`,
    title: `Piso ${floor.label}`,
    description: 'Novo assoalho para os cômodos da Casa 3D (personalizável em qualquer cor!).',
    price: floor.price ?? 14,
    icon: 'palette',
    category: 'casa',
    houseCategory: 'pisos',
    supportsCustomColor: true,
    defaultColor: floor.colorHex,
    purchased: false,
    slotType: 'house-floor',
    targetId: floor.id,
  })),
];
