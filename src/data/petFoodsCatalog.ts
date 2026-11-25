export type PetFoodCategory =
  | 'frutas'
  | 'legumes'
  | 'padaria'
  | 'refeicoes'
  | 'asiatica'
  | 'doces'
  | 'bebidas';

export type FoodArtKind =
  | 'apple'
  | 'pear'
  | 'citrus'
  | 'banana'
  | 'melon'
  | 'grape'
  | 'berry'
  | 'cherry'
  | 'mango'
  | 'pineapple'
  | 'coconut'
  | 'kiwi'
  | 'tomato'
  | 'olive'
  | 'avocado'
  | 'eggplant'
  | 'potato'
  | 'carrot'
  | 'corn'
  | 'pepper'
  | 'cucumber'
  | 'leafy'
  | 'broccoli'
  | 'garlic'
  | 'onion'
  | 'mushroom'
  | 'peanut'
  | 'bean'
  | 'bread'
  | 'croissant'
  | 'pretzel'
  | 'pancake'
  | 'waffle'
  | 'cheese'
  | 'meat'
  | 'chicken'
  | 'bacon'
  | 'burger'
  | 'fries'
  | 'pizza'
  | 'hotdog'
  | 'sandwich'
  | 'taco'
  | 'burrito'
  | 'egg'
  | 'pan'
  | 'pot'
  | 'bowl'
  | 'popcorn'
  | 'butter'
  | 'fish'
  | 'shrimp'
  | 'rice'
  | 'onigiri'
  | 'ramen'
  | 'spaghetti'
  | 'sushi'
  | 'dumpling'
  | 'fortune'
  | 'bento'
  | 'icecream'
  | 'donut'
  | 'cookie'
  | 'cake'
  | 'cupcake'
  | 'pie'
  | 'chocolate'
  | 'candy'
  | 'lollipop'
  | 'pudding'
  | 'honey'
  | 'milk'
  | 'coffee'
  | 'tea'
  | 'juice'
  | 'soda'
  | 'boba'
  | 'water'
  | 'ice';

export interface PetKeyboardFood {
  id: string;
  name: string;
  category: PetFoodCategory;
  price: number; // Preço baixo em Diamantes (1 a 4)
  hungerBoost: number;
  thirstBoost: number;
  happyBoost: number;
  isDrink?: boolean;
  artKind: FoodArtKind;
  accentHex: string;
  secondaryHex?: string;
}

export const PET_FOOD_CATEGORIES: { id: PetFoodCategory | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'frutas', label: 'Frutas' },
  { id: 'legumes', label: 'Legumes & Grãos' },
  { id: 'padaria', label: 'Padaria & Café' },
  { id: 'refeicoes', label: 'Refeições' },
  { id: 'asiatica', label: 'Asiática & Massas' },
  { id: 'doces', label: 'Doces' },
  { id: 'bebidas', label: 'Bebidas' },
];

export const PET_KEYBOARD_FOODS_CATALOG: PetKeyboardFood[] = [
  // --- FRUTAS ---
  { id: 'food-maca-vermelha', name: 'Maçã Vermelha', category: 'frutas', price: 1, hungerBoost: 18, thirstBoost: 6, happyBoost: 10, artKind: 'apple', accentHex: '#ef4444', secondaryHex: '#22c55e' },
  { id: 'food-maca-verde', name: 'Maçã Verde', category: 'frutas', price: 1, hungerBoost: 18, thirstBoost: 6, happyBoost: 10, artKind: 'apple', accentHex: '#84cc16', secondaryHex: '#15803d' },
  { id: 'food-pera', name: 'Pera', category: 'frutas', price: 1, hungerBoost: 18, thirstBoost: 7, happyBoost: 9, artKind: 'pear', accentHex: '#a3e635', secondaryHex: '#65a30d' },
  { id: 'food-tangerina', name: 'Laranja / Tangerina', category: 'frutas', price: 1, hungerBoost: 16, thirstBoost: 10, happyBoost: 10, artKind: 'citrus', accentHex: '#f97316', secondaryHex: '#22c55e' },
  { id: 'food-limao', name: 'Limão Siciliano', category: 'frutas', price: 1, hungerBoost: 14, thirstBoost: 10, happyBoost: 8, artKind: 'citrus', accentHex: '#facc15', secondaryHex: '#fef08a' },
  { id: 'food-lima', name: 'Limão Verde', category: 'frutas', price: 1, hungerBoost: 14, thirstBoost: 10, happyBoost: 8, artKind: 'citrus', accentHex: '#22c55e', secondaryHex: '#bbf7d0' },
  { id: 'food-banana', name: 'Banana', category: 'frutas', price: 1, hungerBoost: 22, thirstBoost: 2, happyBoost: 11, artKind: 'banana', accentHex: '#fde047', secondaryHex: '#a16207' },
  { id: 'food-melancia', name: 'Melancia', category: 'frutas', price: 2, hungerBoost: 20, thirstBoost: 18, happyBoost: 14, artKind: 'melon', accentHex: '#f43f5e', secondaryHex: '#16a34a' },
  { id: 'food-uva', name: 'Uva Roxa', category: 'frutas', price: 2, hungerBoost: 20, thirstBoost: 8, happyBoost: 13, artKind: 'grape', accentHex: '#9333ea', secondaryHex: '#22c55e' },
  { id: 'food-morango', name: 'Morango', category: 'frutas', price: 2, hungerBoost: 22, thirstBoost: 6, happyBoost: 18, artKind: 'berry', accentHex: '#e11d48', secondaryHex: '#22c55e' },
  { id: 'food-mirtilo', name: 'Mirtilo', category: 'frutas', price: 2, hungerBoost: 18, thirstBoost: 6, happyBoost: 14, artKind: 'grape', accentHex: '#3b82f6', secondaryHex: '#1e3a8a' },
  { id: 'food-melao', name: 'Melão', category: 'frutas', price: 2, hungerBoost: 20, thirstBoost: 14, happyBoost: 11, artKind: 'melon', accentHex: '#bef264', secondaryHex: '#4d7c0f' },
  { id: 'food-cereja', name: 'Cerejas', category: 'frutas', price: 2, hungerBoost: 18, thirstBoost: 5, happyBoost: 16, artKind: 'cherry', accentHex: '#dc2626', secondaryHex: '#16a34a' },
  { id: 'food-pessego', name: 'Pêssego', category: 'frutas', price: 2, hungerBoost: 20, thirstBoost: 8, happyBoost: 14, artKind: 'mango', accentHex: '#fb7185', secondaryHex: '#fdba74' },
  { id: 'food-manga', name: 'Manga', category: 'frutas', price: 2, hungerBoost: 24, thirstBoost: 8, happyBoost: 14, artKind: 'mango', accentHex: '#f59e0b', secondaryHex: '#ef4444' },
  { id: 'food-abacaxi', name: 'Abacaxi', category: 'frutas', price: 2, hungerBoost: 24, thirstBoost: 10, happyBoost: 14, artKind: 'pineapple', accentHex: '#eab308', secondaryHex: '#16a34a' },
  { id: 'food-coco', name: 'Coco', category: 'frutas', price: 2, hungerBoost: 18, thirstBoost: 22, happyBoost: 12, artKind: 'coconut', accentHex: '#78350f', secondaryHex: '#ffffff' },
  { id: 'food-kiwi', name: 'Kiwi', category: 'frutas', price: 2, hungerBoost: 18, thirstBoost: 8, happyBoost: 12, artKind: 'kiwi', accentHex: '#84cc16', secondaryHex: '#78350f' },

  // --- LEGUMES & GRÃOS ---
  { id: 'food-tomate', name: 'Tomate', category: 'legumes', price: 1, hungerBoost: 16, thirstBoost: 8, happyBoost: 8, artKind: 'tomato', accentHex: '#ef4444', secondaryHex: '#16a34a' },
  { id: 'food-azeitona', name: 'Azeitona', category: 'legumes', price: 1, hungerBoost: 14, thirstBoost: 2, happyBoost: 8, artKind: 'olive', accentHex: '#65a30d', secondaryHex: '#dc2626' },
  { id: 'food-abacate', name: 'Abacate', category: 'legumes', price: 2, hungerBoost: 24, thirstBoost: 4, happyBoost: 12, artKind: 'avocado', accentHex: '#4ade80', secondaryHex: '#78350f' },
  { id: 'food-berinjela', name: 'Berinjela', category: 'legumes', price: 1, hungerBoost: 18, thirstBoost: 4, happyBoost: 8, artKind: 'eggplant', accentHex: '#7e22ce', secondaryHex: '#16a34a' },
  { id: 'food-batata', name: 'Batata', category: 'legumes', price: 1, hungerBoost: 22, thirstBoost: 0, happyBoost: 9, artKind: 'potato', accentHex: '#d97706', secondaryHex: '#fde68a' },
  { id: 'food-cenoura', name: 'Cenoura', category: 'legumes', price: 1, hungerBoost: 20, thirstBoost: 4, happyBoost: 12, artKind: 'carrot', accentHex: '#f97316', secondaryHex: '#22c55e' },
  { id: 'food-milho', name: 'Milho', category: 'legumes', price: 1, hungerBoost: 22, thirstBoost: 3, happyBoost: 11, artKind: 'corn', accentHex: '#facc15', secondaryHex: '#22c55e' },
  { id: 'food-pimenta', name: 'Pimenta Malagueta', category: 'legumes', price: 1, hungerBoost: 14, thirstBoost: 0, happyBoost: 9, artKind: 'pepper', accentHex: '#dc2626', secondaryHex: '#16a34a' },
  { id: 'food-pimentao', name: 'Pimentão', category: 'legumes', price: 1, hungerBoost: 16, thirstBoost: 6, happyBoost: 8, artKind: 'tomato', accentHex: '#22c55e', secondaryHex: '#15803d' },
  { id: 'food-pepino', name: 'Pepino', category: 'legumes', price: 1, hungerBoost: 15, thirstBoost: 12, happyBoost: 9, artKind: 'cucumber', accentHex: '#16a34a', secondaryHex: '#bbf7d0' },
  { id: 'food-alface', name: 'Folhas / Alface', category: 'legumes', price: 1, hungerBoost: 16, thirstBoost: 8, happyBoost: 10, artKind: 'leafy', accentHex: '#4ade80', secondaryHex: '#15803d' },
  { id: 'food-brocolis', name: 'Brócolis', category: 'legumes', price: 1, hungerBoost: 20, thirstBoost: 4, happyBoost: 10, artKind: 'broccoli', accentHex: '#16a34a', secondaryHex: '#84cc16' },
  { id: 'food-alho', name: 'Alho', category: 'legumes', price: 1, hungerBoost: 12, thirstBoost: 0, happyBoost: 6, artKind: 'garlic', accentHex: '#f5f5f4', secondaryHex: '#d6d3d1' },
  { id: 'food-cebola', name: 'Cebola', category: 'legumes', price: 1, hungerBoost: 14, thirstBoost: 2, happyBoost: 7, artKind: 'onion', accentHex: '#c084fc', secondaryHex: '#fef3c7' },
  { id: 'food-cogumelo', name: 'Cogumelo', category: 'legumes', price: 2, hungerBoost: 20, thirstBoost: 3, happyBoost: 12, artKind: 'mushroom', accentHex: '#ef4444', secondaryHex: '#fef3c7' },
  { id: 'food-amendoim', name: 'Amendoim', category: 'legumes', price: 1, hungerBoost: 18, thirstBoost: 0, happyBoost: 10, artKind: 'peanut', accentHex: '#d97706', secondaryHex: '#fde68a' },
  { id: 'food-feijao', name: 'Feijão', category: 'legumes', price: 1, hungerBoost: 22, thirstBoost: 0, happyBoost: 9, artKind: 'bean', accentHex: '#92400e', secondaryHex: '#b45309' },
  { id: 'food-castanha', name: 'Castanha', category: 'legumes', price: 2, hungerBoost: 20, thirstBoost: 0, happyBoost: 11, artKind: 'peanut', accentHex: '#78350f', secondaryHex: '#f59e0b' },
  { id: 'food-gengibre', name: 'Gengibre', category: 'legumes', price: 1, hungerBoost: 14, thirstBoost: 2, happyBoost: 8, artKind: 'potato', accentHex: '#eab308', secondaryHex: '#ca8a04' },
  { id: 'food-ervilha', name: 'Vagem / Ervilha', category: 'legumes', price: 1, hungerBoost: 16, thirstBoost: 4, happyBoost: 9, artKind: 'cucumber', accentHex: '#22c55e', secondaryHex: '#86efac' },

  // --- PADARIA & CAFÉ DA MANHÃ ---
  { id: 'food-pao', name: 'Pão de Forma', category: 'padaria', price: 1, hungerBoost: 22, thirstBoost: 0, happyBoost: 10, artKind: 'bread', accentHex: '#f59e0b', secondaryHex: '#fef3c7' },
  { id: 'food-croissant', name: 'Croissant', category: 'padaria', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 15, artKind: 'croissant', accentHex: '#d97706', secondaryHex: '#fde68a' },
  { id: 'food-baguete', name: 'Baguete', category: 'padaria', price: 2, hungerBoost: 25, thirstBoost: 0, happyBoost: 12, artKind: 'bread', accentHex: '#b45309', secondaryHex: '#fde68a' },
  { id: 'food-pao-sirio', name: 'Pão Sírio', category: 'padaria', price: 1, hungerBoost: 22, thirstBoost: 0, happyBoost: 11, artKind: 'pancake', accentHex: '#eab308', secondaryHex: '#fef3c7' },
  { id: 'food-pretzel', name: 'Pretzel', category: 'padaria', price: 2, hungerBoost: 24, thirstBoost: 0, happyBoost: 14, artKind: 'pretzel', accentHex: '#92400e', secondaryHex: '#ffffff' },
  { id: 'food-bagel', name: 'Bagel', category: 'padaria', price: 2, hungerBoost: 24, thirstBoost: 0, happyBoost: 13, artKind: 'donut', accentHex: '#d97706', secondaryHex: '#fef3c7' },
  { id: 'food-panqueca', name: 'Panquecas', category: 'padaria', price: 3, hungerBoost: 32, thirstBoost: 0, happyBoost: 18, artKind: 'pancake', accentHex: '#f59e0b', secondaryHex: '#b45309' },
  { id: 'food-waffle', name: 'Waffle', category: 'padaria', price: 3, hungerBoost: 30, thirstBoost: 0, happyBoost: 18, artKind: 'waffle', accentHex: '#f59e0b', secondaryHex: '#fef08a' },
  { id: 'food-queijo', name: 'Queijo', category: 'padaria', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 15, artKind: 'cheese', accentHex: '#facc15', secondaryHex: '#f59e0b' },
  { id: 'food-manteiga', name: 'Manteiga', category: 'padaria', price: 1, hungerBoost: 16, thirstBoost: 0, happyBoost: 9, artKind: 'butter', accentHex: '#fef08a', secondaryHex: '#eab308' },
  { id: 'food-cereal', name: 'Tigela de Cereal', category: 'padaria', price: 2, hungerBoost: 28, thirstBoost: 6, happyBoost: 14, artKind: 'bowl', accentHex: '#f59e0b', secondaryHex: '#ffffff' },
  { id: 'food-ovo', name: 'Ovo', category: 'padaria', price: 1, hungerBoost: 20, thirstBoost: 0, happyBoost: 10, artKind: 'egg', accentHex: '#fef3c7', secondaryHex: '#f59e0b' },
  { id: 'food-ovo-frito', name: 'Ovo na Frigideira', category: 'padaria', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 14, artKind: 'pan', accentHex: '#334155', secondaryHex: '#facc15' },

  // --- REFEIÇÕES & FAST FOOD ---
  { id: 'food-sardinha', name: 'Sardinha', category: 'refeicoes', price: 2, hungerBoost: 36, thirstBoost: 0, happyBoost: 22, artKind: 'fish', accentHex: '#38bdf8', secondaryHex: '#e2e8f0' },
  { id: 'food-osso-carne', name: 'Carne com Osso', category: 'refeicoes', price: 2, hungerBoost: 34, thirstBoost: 0, happyBoost: 20, artKind: 'meat', accentHex: '#dc2626', secondaryHex: '#fef3c7' },
  { id: 'food-bife', name: 'Bife Suculento', category: 'refeicoes', price: 3, hungerBoost: 44, thirstBoost: 0, happyBoost: 24, artKind: 'meat', accentHex: '#b91c1c', secondaryHex: '#fca5a5' },
  { id: 'food-coxa-frango', name: 'Coxa de Frango', category: 'refeicoes', price: 2, hungerBoost: 34, thirstBoost: 0, happyBoost: 18, artKind: 'chicken', accentHex: '#d97706', secondaryHex: '#fef3c7' },
  { id: 'food-bacon', name: 'Bacon', category: 'refeicoes', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 16, artKind: 'bacon', accentHex: '#e11d48', secondaryHex: '#fecdd3' },
  { id: 'food-hamburguer', name: 'Hambúrguer', category: 'refeicoes', price: 3, hungerBoost: 42, thirstBoost: 0, happyBoost: 22, artKind: 'burger', accentHex: '#f59e0b', secondaryHex: '#ef4444' },
  { id: 'food-batata-frita', name: 'Batata Frita', category: 'refeicoes', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 18, artKind: 'fries', accentHex: '#facc15', secondaryHex: '#dc2626' },
  { id: 'food-pizza', name: 'Fatia de Pizza', category: 'refeicoes', price: 3, hungerBoost: 40, thirstBoost: 0, happyBoost: 24, artKind: 'pizza', accentHex: '#facc15', secondaryHex: '#dc2626' },
  { id: 'food-cachorro-quente', name: 'Cachorro-Quente', category: 'refeicoes', price: 2, hungerBoost: 32, thirstBoost: 0, happyBoost: 16, artKind: 'hotdog', accentHex: '#ea580c', secondaryHex: '#facc15' },
  { id: 'food-sanduiche', name: 'Sanduíche', category: 'refeicoes', price: 2, hungerBoost: 32, thirstBoost: 0, happyBoost: 15, artKind: 'sandwich', accentHex: '#fde68a', secondaryHex: '#22c55e' },
  { id: 'food-taco', name: 'Taco', category: 'refeicoes', price: 2, hungerBoost: 32, thirstBoost: 0, happyBoost: 17, artKind: 'taco', accentHex: '#facc15', secondaryHex: '#ef4444' },
  { id: 'food-burrito', name: 'Burrito', category: 'refeicoes', price: 3, hungerBoost: 38, thirstBoost: 0, happyBoost: 18, artKind: 'burrito', accentHex: '#fde68a', secondaryHex: '#16a34a' },
  { id: 'food-tamale', name: 'Tamale', category: 'refeicoes', price: 2, hungerBoost: 30, thirstBoost: 0, happyBoost: 14, artKind: 'burrito', accentHex: '#65a30d', secondaryHex: '#facc15' },
  { id: 'food-pao-recheado', name: 'Pão Recheado', category: 'refeicoes', price: 2, hungerBoost: 30, thirstBoost: 0, happyBoost: 15, artKind: 'croissant', accentHex: '#eab308', secondaryHex: '#22c55e' },
  { id: 'food-falafel', name: 'Falafel', category: 'refeicoes', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 14, artKind: 'peanut', accentHex: '#92400e', secondaryHex: '#84cc16' },
  { id: 'food-paella', name: 'Paella', category: 'refeicoes', price: 4, hungerBoost: 46, thirstBoost: 0, happyBoost: 24, artKind: 'pan', accentHex: '#f59e0b', secondaryHex: '#ef4444' },
  { id: 'food-ensopado', name: 'Ensopado Quentinho', category: 'refeicoes', price: 3, hungerBoost: 40, thirstBoost: 10, happyBoost: 20, artKind: 'pot', accentHex: '#ea580c', secondaryHex: '#fde047' },
  { id: 'food-fondue', name: 'Fondue', category: 'refeicoes', price: 4, hungerBoost: 36, thirstBoost: 0, happyBoost: 26, artKind: 'pot', accentHex: '#78350f', secondaryHex: '#facc15' },
  { id: 'food-salada', name: 'Salada Verde', category: 'refeicoes', price: 2, hungerBoost: 24, thirstBoost: 8, happyBoost: 14, artKind: 'bowl', accentHex: '#22c55e', secondaryHex: '#ef4444' },
  { id: 'food-pipoca', name: 'Pipoca', category: 'refeicoes', price: 1, hungerBoost: 20, thirstBoost: 0, happyBoost: 16, artKind: 'popcorn', accentHex: '#fef08a', secondaryHex: '#ef4444' },
  { id: 'food-enlatado', name: 'Ração Enlatada', category: 'refeicoes', price: 2, hungerBoost: 36, thirstBoost: 2, happyBoost: 18, artKind: 'fish', accentHex: '#f472b6', secondaryHex: '#e2e8f0' },

  // --- ASIÁTICA & MASSAS ---
  { id: 'food-bento', name: 'Bento Box', category: 'asiatica', price: 4, hungerBoost: 48, thirstBoost: 0, happyBoost: 25, artKind: 'bento', accentHex: '#ef4444', secondaryHex: '#ffffff' },
  { id: 'food-biscoito-arroz', name: 'Biscoito de Arroz', category: 'asiatica', price: 1, hungerBoost: 18, thirstBoost: 0, happyBoost: 11, artKind: 'cookie', accentHex: '#fef3c7', secondaryHex: '#1e293b' },
  { id: 'food-onigiri', name: 'Onigiri (Bolinho de Arroz)', category: 'asiatica', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 16, artKind: 'onigiri', accentHex: '#ffffff', secondaryHex: '#1e293b' },
  { id: 'food-arroz', name: 'Tigela de Arroz', category: 'asiatica', price: 2, hungerBoost: 30, thirstBoost: 0, happyBoost: 14, artKind: 'rice', accentHex: '#ffffff', secondaryHex: '#f472b6' },
  { id: 'food-curry', name: 'Arroz com Curry', category: 'asiatica', price: 3, hungerBoost: 42, thirstBoost: 0, happyBoost: 20, artKind: 'bowl', accentHex: '#d97706', secondaryHex: '#ffffff' },
  { id: 'food-lamen', name: 'Tigela de Lámen', category: 'asiatica', price: 3, hungerBoost: 44, thirstBoost: 10, happyBoost: 24, artKind: 'ramen', accentHex: '#fde047', secondaryHex: '#ef4444' },
  { id: 'food-espaguete', name: 'Espaguete', category: 'asiatica', price: 3, hungerBoost: 40, thirstBoost: 0, happyBoost: 20, artKind: 'spaghetti', accentHex: '#facc15', secondaryHex: '#dc2626' },
  { id: 'food-batata-doce', name: 'Batata-Doce Assada', category: 'asiatica', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 14, artKind: 'potato', accentHex: '#9333ea', secondaryHex: '#facc15' },
  { id: 'food-oden', name: 'Espetinho Oden', category: 'asiatica', price: 2, hungerBoost: 28, thirstBoost: 0, happyBoost: 14, artKind: 'dumpling', accentHex: '#d97706', secondaryHex: '#fef3c7' },
  { id: 'food-sushi', name: 'Sushi', category: 'asiatica', price: 3, hungerBoost: 36, thirstBoost: 0, happyBoost: 24, artKind: 'sushi', accentHex: '#fb7185', secondaryHex: '#ffffff' },
  { id: 'food-camarao', name: 'Camarão Empanado', category: 'asiatica', price: 3, hungerBoost: 36, thirstBoost: 0, happyBoost: 24, artKind: 'shrimp', accentHex: '#fb923c', secondaryHex: '#fef08a' },
  { id: 'food-kamaboko', name: 'Bolinho de Peixe', category: 'asiatica', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 16, artKind: 'fish', accentHex: '#f472b6', secondaryHex: '#ffffff' },
  { id: 'food-bolo-lua', name: 'Bolo da Lua', category: 'asiatica', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 18, artKind: 'pie', accentHex: '#d97706', secondaryHex: '#fde68a' },
  { id: 'food-dango', name: 'Dango Colorido', category: 'asiatica', price: 2, hungerBoost: 24, thirstBoost: 0, happyBoost: 20, artKind: 'dumpling', accentHex: '#f9a8d4', secondaryHex: '#86efac' },
  { id: 'food-guioza', name: 'Guioza', category: 'asiatica', price: 2, hungerBoost: 30, thirstBoost: 0, happyBoost: 17, artKind: 'croissant', accentHex: '#fef3c7', secondaryHex: '#d97706' },
  { id: 'food-biscoito-sorte', name: 'Biscoito da Sorte', category: 'asiatica', price: 1, hungerBoost: 16, thirstBoost: 0, happyBoost: 18, artKind: 'fortune', accentHex: '#f59e0b', secondaryHex: '#ffffff' },

  // --- DOCES & SOBREMESAS ---
  { id: 'food-raspadinha', name: 'Raspadinha Gelada', category: 'doces', price: 2, hungerBoost: 16, thirstBoost: 16, happyBoost: 18, artKind: 'icecream', accentHex: '#38bdf8', secondaryHex: '#f472b6' },
  { id: 'food-sorvete-casquinha', name: 'Sorvete de Casquinha', category: 'doces', price: 2, hungerBoost: 22, thirstBoost: 6, happyBoost: 22, artKind: 'icecream', accentHex: '#f9a8d4', secondaryHex: '#f59e0b' },
  { id: 'food-taca-sorvete', name: 'Taça de Sorvete', category: 'doces', price: 3, hungerBoost: 28, thirstBoost: 8, happyBoost: 24, artKind: 'icecream', accentHex: '#c084fc', secondaryHex: '#fde047' },
  { id: 'food-donut', name: 'Donut Rosquinha', category: 'doces', price: 2, hungerBoost: 24, thirstBoost: 0, happyBoost: 20, artKind: 'donut', accentHex: '#f472b6', secondaryHex: '#fde68a' },
  { id: 'food-cookie', name: 'Biscoito Cookie', category: 'doces', price: 1, hungerBoost: 20, thirstBoost: 0, happyBoost: 16, artKind: 'cookie', accentHex: '#d97706', secondaryHex: '#451a03' },
  { id: 'food-bolo-aniversario', name: 'Bolo de Aniversário', category: 'doces', price: 4, hungerBoost: 42, thirstBoost: 0, happyBoost: 30, artKind: 'cake', accentHex: '#fbcfe8', secondaryHex: '#ec4899' },
  { id: 'food-fatia-bolo', name: 'Fatia de Bolo', category: 'doces', price: 2, hungerBoost: 26, thirstBoost: 0, happyBoost: 20, artKind: 'cake', accentHex: '#f472b6', secondaryHex: '#fef3c7' },
  { id: 'food-cupcake', name: 'Cupcake', category: 'doces', price: 2, hungerBoost: 24, thirstBoost: 0, happyBoost: 22, artKind: 'cupcake', accentHex: '#f472b6', secondaryHex: '#c084fc' },
  { id: 'food-torta', name: 'Torta Doce', category: 'doces', price: 3, hungerBoost: 32, thirstBoost: 0, happyBoost: 20, artKind: 'pie', accentHex: '#d97706', secondaryHex: '#ef4444' },
  { id: 'food-chocolate', name: 'Barra de Chocolate', category: 'doces', price: 2, hungerBoost: 22, thirstBoost: 0, happyBoost: 22, artKind: 'chocolate', accentHex: '#78350f', secondaryHex: '#ec4899' },
  { id: 'food-bala', name: 'Bala Doce', category: 'doces', price: 1, hungerBoost: 14, thirstBoost: 0, happyBoost: 16, artKind: 'candy', accentHex: '#ec4899', secondaryHex: '#fde047' },
  { id: 'food-pirulito', name: 'Pirulito', category: 'doces', price: 1, hungerBoost: 14, thirstBoost: 0, happyBoost: 18, artKind: 'lollipop', accentHex: '#f43f5e', secondaryHex: '#ffffff' },
  { id: 'food-pudim', name: 'Pudim', category: 'doces', price: 2, hungerBoost: 26, thirstBoost: 2, happyBoost: 22, artKind: 'pudding', accentHex: '#fde047', secondaryHex: '#92400e' },
  { id: 'food-mel', name: 'Pote de Mel', category: 'doces', price: 2, hungerBoost: 26, thirstBoost: 4, happyBoost: 22, artKind: 'honey', accentHex: '#f59e0b', secondaryHex: '#fef08a' },

  // --- BEBIDAS ---
  { id: 'food-agua', name: 'Água Fresquinha', category: 'bebidas', price: 1, hungerBoost: 0, thirstBoost: 40, happyBoost: 10, isDrink: true, artKind: 'water', accentHex: '#38bdf8', secondaryHex: '#bae6fd' },
  { id: 'food-leite', name: 'Copo de Leite', category: 'bebidas', price: 1, hungerBoost: 10, thirstBoost: 36, happyBoost: 16, isDrink: true, artKind: 'milk', accentHex: '#ffffff', secondaryHex: '#e0f2fe' },
  { id: 'food-mamadeira', name: 'Mamadeira de Leite', category: 'bebidas', price: 2, hungerBoost: 14, thirstBoost: 38, happyBoost: 20, isDrink: true, artKind: 'milk', accentHex: '#f9a8d4', secondaryHex: '#ffffff' },
  { id: 'food-cafe', name: 'Café Quente', category: 'bebidas', price: 2, hungerBoost: 4, thirstBoost: 28, happyBoost: 14, isDrink: true, artKind: 'coffee', accentHex: '#78350f', secondaryHex: '#f5f5f4' },
  { id: 'food-bule-cha', name: 'Bule de Chá', category: 'bebidas', price: 2, hungerBoost: 2, thirstBoost: 34, happyBoost: 16, isDrink: true, artKind: 'tea', accentHex: '#a855f7', secondaryHex: '#fbcfe8' },
  { id: 'food-cha-verde', name: 'Chá Verde Quentinho', category: 'bebidas', price: 1, hungerBoost: 2, thirstBoost: 32, happyBoost: 14, isDrink: true, artKind: 'tea', accentHex: '#4ade80', secondaryHex: '#15803d' },
  { id: 'food-suco-caixinha', name: 'Suco de Caixinha', category: 'bebidas', price: 2, hungerBoost: 8, thirstBoost: 36, happyBoost: 16, isDrink: true, artKind: 'juice', accentHex: '#f97316', secondaryHex: '#fde047' },
  { id: 'food-refrigerante', name: 'Copo com Canudo', category: 'bebidas', price: 2, hungerBoost: 6, thirstBoost: 36, happyBoost: 18, isDrink: true, artKind: 'soda', accentHex: '#ec4899', secondaryHex: '#38bdf8' },
  { id: 'food-boba', name: 'Bubble Tea (Boba)', category: 'bebidas', price: 3, hungerBoost: 14, thirstBoost: 38, happyBoost: 24, isDrink: true, artKind: 'boba', accentHex: '#c084fc', secondaryHex: '#451a03' },
  { id: 'food-gelo', name: 'Cubo de Gelo', category: 'bebidas', price: 1, hungerBoost: 0, thirstBoost: 24, happyBoost: 8, isDrink: true, artKind: 'ice', accentHex: '#7dd3fc', secondaryHex: '#e0f2fe' },
];

export function findPetFoodById(id: string): PetKeyboardFood | undefined {
  return PET_KEYBOARD_FOODS_CATALOG.find((f) => f.id === id);
}
