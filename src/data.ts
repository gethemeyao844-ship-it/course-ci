import type { Product, Partner, Promotion, Order, Notification, User, SupplyList, ProductCategory } from '@/types';

export const COMMUNES = [
  'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
  'Marcory', 'Plateau', 'Treichville', 'Yopougon', 'Port-Bouët',
  'Bingerville', 'Songon',
];

export const PRODUCT_UNITS = [
  'pièce', 'kg', 'g', 'litre', 'sac', 'carton',
  'caisse', 'paquet', 'lot', 'bouteille', 'pack',
  'plat', 'plateau', 'régime', 'panier', 'pair',
  'boîte', 'set', 'unité',
];

export const demoUser: User = {
  id: 'u1',
  name: 'Awa Koné',
  phone: '+225 07 01 23 45 67',
  email: 'awa.kone@example.ci',
  role: 'client',
  commune: 'Cocody',
  avatarUrl: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
};

// ─── Category tree (13 categories per user spec) ──────────────────────────────

export const productCategories: ProductCategory[] = [
  {
    id: 'cat-vetements',
    name: 'Vêtements',
    icon: 'Shirt',
    subcategories: ['Chemises', 'T-shirts', 'Pantalons & Jeans', 'Robes & Jupes', 'Vêtements enfants', 'Chaussures', 'Tenues traditionnelles'],
  },
  {
    id: 'cat-accessoires',
    name: 'Accessoires de mode',
    icon: 'Watch',
    subcategories: ['Ceintures', 'Montres', 'Bijoux', 'Lunettes', 'Sacs', 'Portefeuilles', 'Casquettes'],
  },
  {
    id: 'cat-fruits-legumes',
    name: 'Fruits et légumes',
    icon: 'Apple',
    subcategories: ['Fruits', 'Légumes', 'Manioc & Tubercules'],
  },
  {
    id: 'cat-electromenager',
    name: 'Électroménager',
    icon: 'Fan',
    subcategories: ['Ventilateurs', 'Réfrigérateurs & Congélateurs', 'Machines à laver', 'Fers à repasser'],
  },
  {
    id: 'cat-tv-electronique',
    name: 'Télévisions et électronique',
    icon: 'Tv',
    subcategories: ['Téléviseurs', 'Décodeurs', 'Radios', 'Enceintes & Audio'],
  },
  {
    id: 'cat-telephone-info',
    name: 'Téléphones et informatique',
    icon: 'Smartphone',
    subcategories: ['Smartphones', 'Ordinateurs', 'Chargeurs & Câbles', 'Écouteurs', 'Accessoires téléphone'],
  },
  {
    id: 'cat-velos-motos',
    name: 'Vélos et motos',
    icon: 'Bike',
    subcategories: ['Vélos', 'Motos & Scooters', 'Pièces & Accessoires'],
  },
  {
    id: 'cat-maison-meubles',
    name: 'Maison et meubles',
    icon: 'Home',
    subcategories: ['Lits & Matelas', 'Canapés', 'Tables & Chaises', 'Armoires', 'Rideaux', 'Ustensiles de cuisine'],
  },
  {
    id: 'cat-ecole-bureau',
    name: 'École et bureau',
    icon: 'GraduationCap',
    subcategories: ['Cahiers', 'Stylos & Crayons', 'Sacs scolaires', 'Calculatrices', 'Feuilles & Classeurs', 'Lots rentrée scolaire'],
  },
  {
    id: 'cat-beaute-hygiene',
    name: 'Beauté et hygiène',
    icon: 'Sparkles',
    subcategories: ['Parfums', 'Produits de beauté', 'Savons', 'Soins & Accessoires'],
  },
  {
    id: 'cat-alimentation',
    name: 'Alimentation et épicerie',
    icon: 'ShoppingBasket',
    subcategories: ['Riz & Céréales', 'Huile & Condiments', 'Sucre & Farine', 'Boissons', 'Poisson & Viande', 'Pain & Pâtisseries'],
  },
  {
    id: 'cat-bricolage-jardin',
    name: 'Bricolage, jardinage et agriculture',
    icon: 'Wrench',
    subcategories: ['Outils', 'Équipements', 'Jardinage', 'Agriculture'],
  },
  {
    id: 'cat-sport-loisirs',
    name: 'Sport et loisirs',
    icon: 'Trophy',
    subcategories: ['Ballons', 'Maillots', 'Équipements sportifs', 'Jeux'],
  },
];

// Flat list for backward compatibility
export const categoryNames = productCategories.map((c) => c.name);

// ─── Products (each image matches its name) ───────────────────────────────────

export const demoProducts: Product[] = [
  // ─── Fruits et légumes ───
  { id: 'p1', name: 'Ananas frais', description: 'Ananas mûr du marché local', price: 500, category: 'Fruits et légumes', subcategory: 'Fruits', imageUrl: 'https://images.pexels.com/photos/37126231/pexels-photo-37126231.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'pièce', saleType: 'both', wholesalePrice: 350, wholesaleMinQty: 10, stock: 80 },
  { id: 'p2', name: 'Bananes régime', description: 'Régime de bananes mûres', price: 1500, category: 'Fruits et légumes', subcategory: 'Fruits', imageUrl: 'https://images.pexels.com/photos/28736731/pexels-photo-28736731.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'régime', promo: 10, saleType: 'both', wholesalePrice: 1200, wholesaleMinQty: 5, stock: 25, promoValidUntil: '2026-11-15', promoConditions: 'Dans la limite des stocks disponibles' },
  { id: 'p13', name: 'Oranges douces (kg)', description: 'Oranges fraîches et juteuses', price: 600, category: 'Fruits et légumes', subcategory: 'Fruits', imageUrl: 'https://images.pexels.com/photos/32763320/pexels-photo-32763320.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'kg', saleType: 'both', wholesalePrice: 450, wholesaleMinQty: 20, stock: 150 },
  { id: 'p100', name: 'Mangues fraîches', description: 'Mangues mûres de saison', price: 700, category: 'Fruits et légumes', subcategory: 'Fruits', imageUrl: 'https://images.pexels.com/photos/7543169/pexels-photo-7543169.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'pièce', saleType: 'both', wholesalePrice: 500, wholesaleMinQty: 15, stock: 90 },
  { id: 'p101', name: 'Tomates fraîches (kg)', description: 'Tomates rouges du marché', price: 500, category: 'Fruits et légumes', subcategory: 'Légumes', imageUrl: 'https://images.pexels.com/photos/39815348/pexels-photo-39815348.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'kg', saleType: 'both', wholesalePrice: 350, wholesaleMinQty: 20, stock: 120 },
  { id: 'p10', name: 'Panier de légumes', description: 'Assortiment de légumes frais du marché', price: 3000, category: 'Fruits et légumes', subcategory: 'Légumes', imageUrl: 'https://images.pexels.com/photos/35485717/pexels-photo-35485717.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: false, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'panier', saleType: 'retail', stock: 0 },
  { id: 'p14', name: 'Manioc frais (kg)', description: 'Manioc fraîchement récolté', price: 300, category: 'Fruits et légumes', subcategory: 'Manioc & Tubercules', imageUrl: 'https://images.pexels.com/photos/35811583/pexels-photo-35811583.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'kg', saleType: 'both', wholesalePrice: 200, wholesaleMinQty: 25, stock: 200 },
  { id: 'p102', name: 'Ignames (kg)', description: 'Ignames fraîches de qualité', price: 400, category: 'Fruits et légumes', subcategory: 'Manioc & Tubercules', imageUrl: 'https://images.pexels.com/photos/12714976/pexels-photo-12714976.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'kg', saleType: 'both', wholesalePrice: 300, wholesaleMinQty: 20, stock: 100 },
  { id: 'p15', name: 'Oignons (sac 25kg)', description: "Sac d'oignons secs", price: 8000, category: 'Fruits et légumes', subcategory: 'Légumes', imageUrl: 'https://images.pexels.com/photos/37933289/pexels-photo-37933289.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'sac', saleType: 'wholesale', wholesalePrice: 6500, wholesaleMinQty: 5, stock: 40 },
  { id: 'p16', name: 'Piment frais (kg)', description: 'Piment frais pour cuisine', price: 800, category: 'Fruits et légumes', subcategory: 'Légumes', imageUrl: 'https://images.pexels.com/photos/39052350/pexels-photo-39052350.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', merchantName: "Marché d'Adjamé", unit: 'kg', saleType: 'both', wholesalePrice: 600, wholesaleMinQty: 10, stock: 60 },

  // ─── Alimentation et épicerie ───
  { id: 'p3', name: 'Riz parfumé 5kg', description: 'Sac de riz parfumé de qualité supérieure', price: 4500, category: 'Alimentation et épicerie', subcategory: 'Riz & Céréales', imageUrl: 'https://images.pexels.com/photos/8287252/pexels-photo-8287252.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'sac', saleType: 'both', wholesalePrice: 4000, wholesaleMinQty: 10, stock: 60, quantityTiers: [{ minQty: 10, pricePerUnit: 4000 }, { minQty: 50, pricePerUnit: 3700 }] },
  { id: 'p17', name: 'Huile végétale 1L', description: 'Huile de cuisine végétale', price: 1200, category: 'Alimentation et épicerie', subcategory: 'Huile & Condiments', imageUrl: 'https://images.pexels.com/photos/12284682/pexels-photo-12284682.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'litre', saleType: 'both', wholesalePrice: 1000, wholesaleMinQty: 12, stock: 80, quantityTiers: [{ minQty: 12, pricePerUnit: 1000 }, { minQty: 48, pricePerUnit: 950 }] },
  { id: 'p103', name: 'Sucre blanc 1kg', description: 'Sucre granulé de canne', price: 900, category: 'Alimentation et épicerie', subcategory: 'Sucre & Farine', imageUrl: 'https://images.pexels.com/photos/21582446/pexels-photo-21582446.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'paquet', saleType: 'both', wholesalePrice: 700, wholesaleMinQty: 20, stock: 100 },
  { id: 'p104', name: 'Farine de blé 1kg', description: 'Farine de blé pour pâtisserie', price: 700, category: 'Alimentation et épicerie', subcategory: 'Sucre & Farine', imageUrl: 'https://images.pexels.com/photos/38975612/pexels-photo-38975612.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'paquet', saleType: 'both', wholesalePrice: 550, wholesaleMinQty: 20, stock: 80 },
  { id: 'p8', name: "Jus d'orange 1L", description: 'Jus naturel sans sucre ajouté', price: 1000, category: 'Alimentation et épicerie', subcategory: 'Boissons', imageUrl: 'https://images.pexels.com/photos/5668181/pexels-photo-5668181.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'bouteille', saleType: 'both', wholesalePrice: 800, wholesaleMinQty: 12, stock: 48 },
  { id: 'p11', name: 'Eau minérale 6x1.5L', description: "Pack d'eau minérale naturelle", price: 1200, category: 'Alimentation et épicerie', subcategory: 'Boissons', imageUrl: 'https://images.pexels.com/photos/5497998/pexels-photo-5497998.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'pack', saleType: 'both', wholesalePrice: 1000, wholesaleMinQty: 10, stock: 100, quantityTiers: [{ minQty: 10, pricePerUnit: 1000 }, { minQty: 50, pricePerUnit: 900 }] },
  { id: 'p4', name: 'Pain frais', description: 'Baguette fraîche du jour', price: 200, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/3789032/pexels-photo-3789032.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'pièce', saleType: 'retail', stock: 100 },
  { id: 'p5', name: 'Croissants (x6)', description: 'Croissants beurre frais', price: 1800, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/21847830/pexels-photo-21847830.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'lot', promo: 15, saleType: 'both', wholesalePrice: 1500, wholesaleMinQty: 6, stock: 30, promoValidUntil: '2026-11-10' },
  { id: 'p12', name: 'Pâtisseries assorties', description: 'Plateau de pâtisseries variées', price: 4000, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'plateau', promo: 20, saleType: 'retail', stock: 12, promoValidUntil: '2026-11-05', promoConditions: 'Un plateau par client' },
  { id: 'p6', name: 'Poisson braisé', description: 'Poisson frais braisé avec sauce', price: 3500, category: 'Alimentation et épicerie', subcategory: 'Poisson & Viande', imageUrl: 'https://images.pexels.com/photos/20067063/pexels-photo-20067063.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm4', merchantName: 'Restaurant Le Baoulé', unit: 'plat', saleType: 'retail', stock: 15 },
  { id: 'p7', name: 'Plat traditionnel', description: 'Attieké poisson frit', price: 2500, category: 'Alimentation et épicerie', subcategory: 'Poisson & Viande', imageUrl: 'https://images.pexels.com/photos/28736727/pexels-photo-28736727.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm4', merchantName: 'Restaurant Le Baoulé', unit: 'plat', saleType: 'retail', stock: 20 },

  // ─── École et bureau ───
  { id: 'p20', name: 'Cahier 200 pages', description: 'Cahier ligné grand format', price: 500, category: 'École et bureau', subcategory: 'Cahiers', imageUrl: 'https://images.pexels.com/photos/11738391/pexels-photo-11738391.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'both', wholesalePrice: 350, wholesaleMinQty: 20, stock: 300, quantityTiers: [{ minQty: 20, pricePerUnit: 350 }, { minQty: 100, pricePerUnit: 300 }] },
  { id: 'p21', name: 'Stylo bille (lot de 10)', description: 'Lot de 10 stylos bille bleus', price: 1000, category: 'École et bureau', subcategory: 'Stylos & Crayons', imageUrl: 'https://images.pexels.com/photos/6969328/pexels-photo-6969328.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'lot', saleType: 'both', wholesalePrice: 700, wholesaleMinQty: 10, stock: 150 },
  { id: 'p22', name: 'Sac à dos scolaire', description: 'Sac à dos robuste avec compartiments', price: 5000, category: 'École et bureau', subcategory: 'Sacs scolaires', imageUrl: 'https://images.pexels.com/photos/37580640/pexels-photo-37580640.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 30, promo: 10, promoValidUntil: '2026-11-30', promoConditions: 'Rentrée scolaire' },
  { id: 'p23', name: 'Calculatrice scientifique', description: 'Calculatrice avec fonctions avancées', price: 8000, category: 'École et bureau', subcategory: 'Calculatrices', imageUrl: 'https://images.pexels.com/photos/11874074/pexels-photo-11874074.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 18 },
  { id: 'p24', name: 'Règle graduée 30cm', description: 'Règle transparente 30 cm', price: 200, category: 'École et bureau', subcategory: 'Feuilles & Classeurs', imageUrl: 'https://images.pexels.com/photos/5147906/pexels-photo-5147906.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'both', wholesalePrice: 120, wholesaleMinQty: 30, stock: 200 },
  { id: 'p25', name: 'Feuilles A4 (ramette 500)', description: 'Ramette de 500 feuilles A4 80g', price: 3000, category: 'École et bureau', subcategory: 'Feuilles & Classeurs', imageUrl: 'https://images.pexels.com/photos/8217368/pexels-photo-8217368.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'paquet', saleType: 'both', wholesalePrice: 2500, wholesaleMinQty: 10, stock: 120, quantityTiers: [{ minQty: 10, pricePerUnit: 2500 }, { minQty: 50, pricePerUnit: 2200 }] },
  { id: 'p26', name: 'Lot rentrée CE2', description: 'Cahiers, stylos, règle, ardoise — lot complet CE2', price: 15000, category: 'École et bureau', subcategory: 'Lots rentrée scolaire', imageUrl: 'https://images.pexels.com/photos/5554657/pexels-photo-5554657.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'lot', saleType: 'retail', stock: 25, promo: 12, promoValidUntil: '2026-12-01', promoConditions: 'Lot complet pour la rentrée' },

  // ─── Téléphones et informatique ───
  { id: 'p40', name: 'Smartphone 64GB', description: 'Téléphone Android double SIM, 64 Go', price: 75000, category: 'Téléphones et informatique', subcategory: 'Smartphones', imageUrl: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'both', wholesalePrice: 65000, wholesaleMinQty: 5, stock: 15, promo: 8, promoValidUntil: '2026-11-20', condition: 'neuf' },
  { id: 'p41', name: 'Coque de protection', description: 'Coque silicone anti-choc, plusieurs modèles', price: 1500, category: 'Téléphones et informatique', subcategory: 'Accessoires téléphone', imageUrl: 'https://images.pexels.com/photos/1670768/pexels-photo-1670768.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 80 },
  { id: 'p43', name: 'Ordinateur portable', description: 'Laptop 8GB RAM, 256GB SSD', price: 250000, category: 'Téléphones et informatique', subcategory: 'Ordinateurs', imageUrl: 'https://images.pexels.com/photos/20182039/pexels-photo-20182039.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 4, condition: 'neuf' },

  // ─── Télévisions et électronique ───
  { id: 'p42', name: 'Téléviseur LED 32"', description: 'TV LED HD, HDMI, USB', price: 120000, category: 'Télévisions et électronique', subcategory: 'Téléviseurs', imageUrl: 'https://images.pexels.com/photos/5202917/pexels-photo-5202917.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm5', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 6, condition: 'neuf' },

  // ─── Électroménager ───
  { id: 'p62', name: 'Réfrigérateur 150L', description: 'Réfrigérateur compresseur 150 litres', price: 150000, category: 'Électroménager', subcategory: 'Réfrigérateurs & Congélateurs', imageUrl: 'https://images.pexels.com/photos/6593607/pexels-photo-6593607.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 3, condition: 'neuf' },
  { id: 'p110', name: 'Ventilateur sur pied', description: 'Ventilateur oscillant 3 vitesses', price: 18000, category: 'Électroménager', subcategory: 'Ventilateurs', imageUrl: 'https://images.pexels.com/photos/13983948/pexels-photo-13983948.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 15000, wholesaleMinQty: 5, stock: 20, condition: 'neuf' },
  { id: 'p111', name: 'Machine à laver 7kg', description: 'Lave-linge automatique 7 kg', price: 175000, category: 'Électroménager', subcategory: 'Machines à laver', imageUrl: 'https://images.pexels.com/photos/4700400/pexels-photo-4700400.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 5, condition: 'neuf' },

  // ─── Vêtements ───
  { id: 'p50', name: 'T-shirt homme', description: 'T-shirt coton, tailles M-XL', price: 3500, category: 'Vêtements', subcategory: 'T-shirts', imageUrl: 'https://images.pexels.com/photos/4066288/pexels-photo-4066288.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 2500, wholesaleMinQty: 10, stock: 60, promo: 15, promoValidUntil: '2026-11-15', condition: 'neuf', size: 'M-XL' },
  { id: 'p51', name: 'Chaussures sport', description: 'Baskets running, tailles 39-44', price: 15000, category: 'Vêtements', subcategory: 'Chaussures', imageUrl: 'https://images.pexels.com/photos/9207813/pexels-photo-9207813.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pair', saleType: 'retail', stock: 24, condition: 'neuf', size: '39-44' },
  { id: 'p120', name: 'Chemise homme', description: 'Chemise habillée coton, plusieurs couleurs', price: 6000, category: 'Vêtements', subcategory: 'Chemises', imageUrl: 'https://images.pexels.com/photos/8468727/pexels-photo-8468727.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 4500, wholesaleMinQty: 10, stock: 40, condition: 'neuf', size: 'S-XL' },

  // ─── Accessoires de mode ───
  { id: 'p52', name: 'Sac à main cuir', description: 'Sac à main en cuir véritable', price: 18000, category: 'Accessoires de mode', subcategory: 'Sacs', imageUrl: 'https://images.pexels.com/photos/35270330/pexels-photo-35270330.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 10 },
  { id: 'p130', name: 'Montre homme', description: 'Montre bracelet classique analogique', price: 12000, category: 'Accessoires de mode', subcategory: 'Montres', imageUrl: 'https://images.pexels.com/photos/31642726/pexels-photo-31642726.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 15, condition: 'neuf' },
  { id: 'p131', name: 'Ceinture cuir', description: 'Ceinture en cuir véritable, plusieurs tailles', price: 4000, category: 'Accessoires de mode', subcategory: 'Ceintures', imageUrl: 'https://images.pexels.com/photos/34443362/pexels-photo-34443362.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 3000, wholesaleMinQty: 10, stock: 30 },

  // ─── Maison et meubles ───
  { id: 'p60', name: 'Chaise plastique', description: 'Chaise plastique robuste', price: 2500, category: 'Maison et meubles', subcategory: 'Tables & Chaises', imageUrl: 'https://images.pexels.com/photos/9463620/pexels-photo-9463620.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 1800, wholesaleMinQty: 10, stock: 50, quantityTiers: [{ minQty: 10, pricePerUnit: 1800 }, { minQty: 50, pricePerUnit: 1500 }] },
  { id: 'p61', name: 'Marmite en aluminium', description: 'Marmite de cuisine 5 litres', price: 6000, category: 'Maison et meubles', subcategory: 'Ustensiles de cuisine', imageUrl: 'https://images.pexels.com/photos/40276872/pexels-photo-40276872.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 15 },
  { id: 'p140', name: 'Matelas mousse 140x190', description: 'Matelas en mousse haute densité', price: 45000, category: 'Maison et meubles', subcategory: 'Lits & Matelas', imageUrl: 'https://images.pexels.com/photos/6489093/pexels-photo-6489093.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 8 },

  // ─── Beauté et hygiène ───
  { id: 'p9', name: 'Savon de toilette', description: 'Lot de 4 savons', price: 800, category: 'Beauté et hygiène', subcategory: 'Savons', imageUrl: 'https://images.pexels.com/photos/9475433/pexels-photo-9475433.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'lot', saleType: 'both', wholesalePrice: 650, wholesaleMinQty: 10, stock: 40 },
  { id: 'p70', name: 'Crème hydratante', description: 'Crème pour peau sèche 200ml', price: 2500, category: 'Beauté et hygiène', subcategory: 'Soins & Accessoires', imageUrl: 'https://images.pexels.com/photos/8533228/pexels-photo-8533228.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 40 },
  { id: 'p150', name: 'Parfum pour femme', description: 'Eau de parfum floral 50ml', price: 15000, category: 'Beauté et hygiène', subcategory: 'Parfums', imageUrl: 'https://images.pexels.com/photos/21008941/pexels-photo-21008941.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'pièce', saleType: 'retail', stock: 20 },
  { id: 'p71', name: 'Détergent 5kg', description: 'Poudre de lavage concentrée, seau 5kg', price: 4000, category: 'Beauté et hygiène', subcategory: 'Soins & Accessoires', imageUrl: 'https://images.pexels.com/photos/13768941/pexels-photo-13768941.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', merchantName: 'Boutique Yopougon', unit: 'sac', saleType: 'both', wholesalePrice: 3200, wholesaleMinQty: 10, stock: 35, quantityTiers: [{ minQty: 10, pricePerUnit: 3200 }, { minQty: 50, pricePerUnit: 2900 }] },

  // ─── Bricolage, jardinage et agriculture ───
  { id: 'p72', name: 'Set de bricolage 12 pièces', description: 'Tournevis, pinces, clés — coffret complet', price: 8000, category: 'Bricolage, jardinage et agriculture', subcategory: 'Outils', imageUrl: 'https://images.pexels.com/photos/8985610/pexels-photo-8985610.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'set', saleType: 'retail', stock: 12 },
  { id: 'p160', name: 'Pelle et houe', description: 'Outils de jardinage robustes pour agriculture', price: 5000, category: 'Bricolage, jardinage et agriculture', subcategory: 'Jardinage', imageUrl: 'https://images.pexels.com/photos/30790235/pexels-photo-30790235.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'set', saleType: 'retail', stock: 18 },

  // ─── Vélos et motos ───
  { id: 'p170', name: 'Vélo adulte', description: 'Vélo tout terrain 21 vitesses', price: 65000, category: 'Vélos et motos', subcategory: 'Vélos', imageUrl: 'https://images.pexels.com/photos/13587827/pexels-photo-13587827.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 6, condition: 'neuf' },
  { id: 'p171', name: 'Moto scooter', description: 'Scooter 125cc économique', price: 450000, category: 'Vélos et motos', subcategory: 'Motos & Scooters', imageUrl: 'https://images.pexels.com/photos/20571255/pexels-photo-20571255.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'retail', stock: 3, condition: 'occasion' },

  // ─── Sport et loisirs ───
  { id: 'p180', name: 'Ballon de football', description: 'Ballon de match taille 5', price: 5000, category: 'Sport et loisirs', subcategory: 'Ballons', imageUrl: 'https://images.pexels.com/photos/38105639/pexels-photo-38105639.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 3500, wholesaleMinQty: 10, stock: 30 },
  { id: 'p181', name: 'Maillot de sport', description: 'Maillot de football, plusieurs tailles', price: 4000, category: 'Sport et loisirs', subcategory: 'Maillots', imageUrl: 'https://images.pexels.com/photos/40016710/pexels-photo-40016710.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm6', merchantName: 'Boutique Marcory', unit: 'pièce', saleType: 'both', wholesalePrice: 3000, wholesaleMinQty: 10, stock: 25, size: 'S-XL' },
];

// ─── Partners ────────────────────────────────────────────────────────────────

export const demoPartners: Partner[] = [
  { id: 'pt1', name: "Marché d'Adjamé", type: 'market', imageUrl: 'https://images.pexels.com/photos/35485717/pexels-photo-35485717.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Adjamé', hours: '6h - 19h', rating: 4.5, commune: 'Adjamé' },
  { id: 'pt2', name: 'Boulangerie Cocody', type: 'bakery', imageUrl: 'https://images.pexels.com/photos/3789032/pexels-photo-3789032.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Cocody', hours: '5h - 20h', rating: 4.8, commune: 'Cocody' },
  { id: 'pt3', name: 'Restaurant Le Baoulé', type: 'restaurant', imageUrl: 'https://images.pexels.com/photos/28074289/pexels-photo-28074289.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Plateau', hours: '11h - 23h', rating: 4.7, commune: 'Plateau' },
  { id: 'pt4', name: 'AutoCIV Vente', type: 'cars', imageUrl: 'https://images.pexels.com/photos/20571255/pexels-photo-20571255.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Marcory', hours: '8h - 18h', rating: 4.3, commune: 'Marcory' },
  { id: 'pt5', name: 'Boutique Yopougon', type: 'shop', imageUrl: 'https://images.pexels.com/photos/5554657/pexels-photo-5554657.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Yopougon', hours: '7h - 21h', rating: 4.2, commune: 'Yopougon' },
  { id: 'pt6', name: 'Services Express', type: 'service', imageUrl: 'https://images.pexels.com/photos/8985610/pexels-photo-8985610.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Treichville', hours: '24h/24', rating: 4.6, commune: 'Treichville' },
];

// ─── Promotions (linked to real products) ────────────────────────────────────

export const demoPromotions: Promotion[] = [
  { id: 'pr1', title: 'Bananes régime -10%', description: 'Régimes de bananes mûres en promotion. Idéal pour les revendeurs.', discount: '-10%', imageUrl: 'https://images.pexels.com/photos/28736731/pexels-photo-28736731.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p2', originalPrice: 1500, promoPrice: 1350, validUntil: '2026-11-15', conditions: 'Dans la limite des stocks disponibles' },
  { id: 'pr2', title: 'Croissants (x6) -15%', description: 'Lots de 6 croissants beurre frais à prix réduit.', discount: '-15%', imageUrl: 'https://images.pexels.com/photos/21847830/pexels-photo-21847830.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p5', originalPrice: 1800, promoPrice: 1530, validUntil: '2026-11-10' },
  { id: 'pr3', title: 'Pâtisseries assorties -20%', description: 'Plateau de pâtisseries variées. Un plateau par client.', discount: '-20%', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p12', originalPrice: 4000, promoPrice: 3200, validUntil: '2026-11-05', conditions: 'Un plateau par client' },
  { id: 'pr4', title: 'T-shirt homme -15%', description: 'T-shirts coton, tailles M à XL.', discount: '-15%', imageUrl: 'https://images.pexels.com/photos/4066288/pexels-photo-4066288.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p50', originalPrice: 3500, promoPrice: 2975, validUntil: '2026-11-15' },
  { id: 'pr5', title: 'Lot rentrée CE2 -12%', description: 'Cahiers, stylos, règle, ardoise — lot complet pour la rentrée.', discount: '-12%', imageUrl: 'https://images.pexels.com/photos/5554657/pexels-photo-5554657.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p26', originalPrice: 15000, promoPrice: 13200, validUntil: '2026-12-01', conditions: 'Lot complet pour la rentrée' },
  { id: 'pr6', title: 'Riz parfumé 5kg — prix de gros', description: 'Dès 10 sacs : 4000 FCFA/sac. Dès 50 sacs : 3700 FCFA/sac.', discount: 'Prix de gros', imageUrl: 'https://images.pexels.com/photos/8287252/pexels-photo-8287252.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p3', bulkDeal: true, minQty: 10 },
  { id: 'pr7', title: 'Eau minérale 6x1.5L — prix de gros', description: 'Dès 10 packs : 1000 FCFA/pack. Dès 50 packs : 900 FCFA/pack.', discount: 'Prix de gros', imageUrl: 'https://images.pexels.com/photos/5497998/pexels-photo-5497998.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p11', bulkDeal: true, minQty: 10 },
  { id: 'pr8', title: 'Feuilles A4 — prix de gros', description: 'Dès 10 ramettes : 2500 FCFA. Dès 50 ramettes : 2200 FCFA.', discount: 'Prix de gros', imageUrl: 'https://images.pexels.com/photos/8217368/pexels-photo-8217368.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true, productId: 'p25', bulkDeal: true, minQty: 10 },
];

// ─── Supply Lists ────────────────────────────────────────────────────────────

export const demoSupplyLists: SupplyList[] = [
  {
    id: 'sl1',
    name: 'Rentrée scolaire CE2',
    description: 'Liste complète de fournitures pour un élève de CE2',
    icon: 'GraduationCap',
    category: 'École et bureau',
    editable: true,
    items: [
      { productId: 'p20', name: 'Cahier 200 pages', quantity: 4, unit: 'pièce', price: 500, imageUrl: 'https://images.pexels.com/photos/11738391/pexels-photo-11738391.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p21', name: 'Stylo bille (lot de 10)', quantity: 1, unit: 'lot', price: 1000, imageUrl: 'https://images.pexels.com/photos/6969328/pexels-photo-6969328.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p24', name: 'Règle graduée 30cm', quantity: 1, unit: 'pièce', price: 200, imageUrl: 'https://images.pexels.com/photos/5147906/pexels-photo-5147906.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p23', name: 'Calculatrice scientifique', quantity: 1, unit: 'pièce', price: 8000, imageUrl: 'https://images.pexels.com/photos/11874074/pexels-photo-11874074.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
    ],
  },
  {
    id: 'sl2',
    name: 'Fournitures de bureau',
    description: 'Pack de démarrage pour un petit bureau',
    icon: 'Briefcase',
    category: 'École et bureau',
    editable: true,
    items: [
      { productId: 'p25', name: 'Feuilles A4 (ramette 500)', quantity: 5, unit: 'paquet', price: 3000, imageUrl: 'https://images.pexels.com/photos/8217368/pexels-photo-8217368.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p21', name: 'Stylo bille (lot de 10)', quantity: 3, unit: 'lot', price: 1000, imageUrl: 'https://images.pexels.com/photos/6969328/pexels-photo-6969328.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
    ],
  },
  {
    id: 'sl3',
    name: 'Courses alimentaires semaine',
    description: 'Les essentiels pour une semaine de cuisine locale',
    icon: 'ShoppingBasket',
    category: 'Alimentation et épicerie',
    editable: true,
    items: [
      { productId: 'p3', name: 'Riz parfumé 5kg', quantity: 1, unit: 'sac', price: 4500, imageUrl: 'https://images.pexels.com/photos/8287252/pexels-photo-8287252.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p17', name: 'Huile végétale 1L', quantity: 2, unit: 'litre', price: 1200, imageUrl: 'https://images.pexels.com/photos/12284682/pexels-photo-12284682.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p13', name: 'Oranges douces (kg)', quantity: 2, unit: 'kg', price: 600, imageUrl: 'https://images.pexels.com/photos/32763320/pexels-photo-32763320.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p16', name: 'Piment frais (kg)', quantity: 1, unit: 'kg', price: 800, imageUrl: 'https://images.pexels.com/photos/39052350/pexels-photo-39052350.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p8', name: "Jus d'orange 1L", quantity: 2, unit: 'bouteille', price: 1000, imageUrl: 'https://images.pexels.com/photos/5668181/pexels-photo-5668181.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
    ],
  },
  {
    id: 'sl4',
    name: 'Lot commerce — revendeur',
    description: 'Lot de gros pour revendeurs de denrées alimentaires',
    icon: 'Package',
    category: 'Alimentation et épicerie',
    editable: true,
    items: [
      { productId: 'p3', name: 'Riz parfumé 5kg', quantity: 10, unit: 'sac', price: 4000, imageUrl: 'https://images.pexels.com/photos/8287252/pexels-photo-8287252.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p11', name: 'Eau minérale 6x1.5L', quantity: 10, unit: 'pack', price: 1000, imageUrl: 'https://images.pexels.com/photos/5497998/pexels-photo-5497998.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
      { productId: 'p17', name: 'Huile végétale 1L', quantity: 12, unit: 'litre', price: 1000, imageUrl: 'https://images.pexels.com/photos/12284682/pexels-photo-12284682.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true },
    ],
  },
];

// ─── Orders (unchanged from existing data) ───────────────────────────────────

export const demoOrders: Order[] = [
  {
    id: 'o1', number: 'CMD-2026-0142', type: 'restaurant', status: 'en_route', date: '2026-10-26T10:30:00',
    items: [{ name: 'Poisson braisé', price: 3500, quantity: 1 }, { name: 'Plat traditionnel', price: 2500, quantity: 2 }],
    productCost: 8500, serviceFee: 500, deliveryFee: 1000, total: 10000,
    deliveryAddress: 'Cocody Riviera 2, près de la pharmacie', pickupAddress: 'Restaurant Le Baoulé, Plateau',
    phone: '+225 07 01 23 45 67', commune: 'Cocody', customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67',
    merchantName: 'Restaurant Le Baoulé', driverName: 'Ibrahim Traoré', instructions: "Sonner à l'entrée principale",
  },
  {
    id: 'o2', number: 'CMD-2026-0138', type: 'errand', status: 'delivered', date: '2026-10-25T15:00:00',
    items: [{ name: 'Tomates (2kg)', price: 1000, quantity: 1 }, { name: 'Oignons (1kg)', price: 500, quantity: 1 }, { name: 'Piment', price: 200, quantity: 1 }],
    productCost: 1700, serviceFee: 500, deliveryFee: 800, total: 3000,
    deliveryAddress: 'Cocody Riviera 3', pickupAddress: "Marché d'Adjamé",
    phone: '+225 07 01 23 45 67', commune: 'Cocody', customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67',
    driverName: 'Mamadou Diarra', instructions: 'Bien emballer les légumes',
  },
  {
    id: 'o3', number: 'CMD-2026-0130', type: 'product', status: 'delivered', date: '2026-10-24T09:15:00',
    items: [{ name: 'Riz parfumé 5kg', price: 4500, quantity: 2 }, { name: 'Eau minérale 6x1.5L', price: 1200, quantity: 1 }],
    productCost: 10200, serviceFee: 500, deliveryFee: 1000, total: 11700,
    deliveryAddress: 'Cocody Riviera 2', phone: '+225 07 01 23 45 67', commune: 'Cocody',
    customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67', merchantName: 'Boutique Yopougon',
  },
  {
    id: 'o4', number: 'CMD-2026-0125', type: 'parcel', status: 'awaiting_driver', date: '2026-10-26T08:00:00',
    items: [{ name: 'Colis: documents', price: 0, quantity: 1 }],
    productCost: 0, serviceFee: 500, deliveryFee: 1500, total: 2000,
    deliveryAddress: 'Plateau, Avenue Chardy', pickupAddress: 'Cocody, Angré',
    phone: '+225 07 01 23 45 67', commune: 'Plateau', customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67',
    instructions: 'Colis urgent à remettre avant midi',
  },
];

export const demoNotifications: Notification[] = [
  { id: 'n1', title: 'Livreur en route', message: 'Ibrahim Traoré a démarré votre livraison CMD-2026-0142', time: 'Il y a 10 min', read: false, type: 'order' },
  { id: 'n2', title: 'Promo du week-end', message: '-20% sur vos livraisons samedi et dimanche', time: 'Il y a 2h', read: false, type: 'promo' },
  { id: 'n3', title: 'Commande livrée', message: 'Votre course CMD-2026-0138 a été livrée avec succès', time: 'Hier', read: true, type: 'order' },
];

export const driverOrders: Order[] = [
  {
    id: 'do1', number: 'CMD-2026-0143', type: 'errand', status: 'awaiting_driver', date: '2026-10-26T11:00:00',
    items: [{ name: 'Légumes variés (3kg)', price: 2500, quantity: 1 }],
    productCost: 2500, serviceFee: 500, deliveryFee: 1000, total: 4000,
    deliveryAddress: 'Koumassi, Zone 4', pickupAddress: "Marché d'Adjamé",
    phone: '+225 05 67 89 01 23', commune: 'Koumassi', customerName: 'Fatou Bamba', customerPhone: '+225 05 67 89 01 23',
    instructions: "Demander les prix avant d'acheter. Budget max 3000 FCFA",
    driverName: undefined,
  },
  {
    id: 'do2', number: 'CMD-2026-0144', type: 'restaurant', status: 'awaiting_driver', date: '2026-10-26T11:30:00',
    items: [{ name: 'Poisson braisé', price: 3500, quantity: 1 }],
    productCost: 3500, serviceFee: 500, deliveryFee: 1000, total: 5000,
    deliveryAddress: 'Marcory, Zone 4C', pickupAddress: 'Restaurant Le Baoulé, Plateau',
    phone: '+225 01 23 45 67 89', commune: 'Marcory', customerName: "Kouassi N'Guessan", customerPhone: '+225 01 23 45 67 89',
  },
  {
    id: 'do3', number: 'CMD-2026-0140', type: 'product', status: 'en_route', date: '2026-10-26T09:00:00',
    items: [{ name: 'Riz parfumé 5kg', price: 4500, quantity: 1 }],
    productCost: 4500, serviceFee: 500, deliveryFee: 800, total: 5800,
    deliveryAddress: 'Yopougon, Sicogi', pickupAddress: 'Boutique Yopougon',
    phone: '+225 07 89 01 23 45', commune: 'Yopougon', customerName: 'Adjoa Mensah', customerPhone: '+225 07 89 01 23 45',
    driverName: 'Ibrahim Traoré',
  },
];

export const driverHistory: Order[] = [
  {
    id: 'dh1', number: 'CMD-2026-0138', type: 'errand', status: 'delivered', date: '2026-10-25T15:00:00',
    items: [{ name: 'Légumes', price: 1700, quantity: 1 }],
    productCost: 1700, serviceFee: 500, deliveryFee: 800, total: 3000,
    deliveryAddress: 'Cocody Riviera 3', pickupAddress: "Marché d'Adjamé",
    phone: '+225 07 01 23 45 67', commune: 'Cocody', customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67',
    driverName: 'Ibrahim Traoré',
  },
  {
    id: 'dh2', number: 'CMD-2026-0128', type: 'parcel', status: 'delivered', date: '2026-10-24T14:00:00',
    items: [{ name: 'Colis: médicaments', price: 0, quantity: 1 }],
    productCost: 0, serviceFee: 500, deliveryFee: 1200, total: 1700,
    deliveryAddress: 'Treichville', pickupAddress: 'Plateau Pharmacie',
    phone: '+225 05 12 34 56 78', commune: 'Treichville', customerName: 'Sekou Camara', customerPhone: '+225 05 12 34 56 78',
    driverName: 'Ibrahim Traoré',
  },
];

export const merchantProducts: Product[] = [
  { id: 'mp1', name: 'Pain frais', description: 'Baguette fraîche du jour', price: 200, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/3789032/pexels-photo-3789032.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'pièce', saleType: 'retail', stock: 100 },
  { id: 'mp2', name: 'Croissants (x6)', description: 'Croissants beurre frais', price: 1800, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/21847830/pexels-photo-21847830.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'lot', promo: 15, saleType: 'both', wholesalePrice: 1500, wholesaleMinQty: 6, stock: 30, promoValidUntil: '2026-11-10' },
  { id: 'mp3', name: 'Pâtisseries assorties', description: 'Plateau de pâtisseries variées', price: 4000, category: 'Alimentation et épicerie', subcategory: 'Pain & Pâtisseries', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: false, merchantId: 'm3', merchantName: 'Boulangerie Cocody', unit: 'plateau', promo: 20, saleType: 'retail', stock: 0, promoValidUntil: '2026-11-05', promoConditions: 'Un plateau par client' },
];

export const merchantOrders: Order[] = [
  {
    id: 'mo1', number: 'CMD-2026-0142', type: 'restaurant', status: 'en_route', date: '2026-10-26T10:30:00',
    items: [{ name: 'Poisson braisé', price: 3500, quantity: 1 }, { name: 'Plat traditionnel', price: 2500, quantity: 2 }],
    productCost: 8500, serviceFee: 500, deliveryFee: 1000, total: 10000,
    deliveryAddress: 'Cocody Riviera 2', pickupAddress: 'Restaurant Le Baoulé, Plateau',
    phone: '+225 07 01 23 45 67', commune: 'Cocody', customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67',
    merchantName: 'Boulangerie Cocody', driverName: 'Ibrahim Traoré',
  },
  {
    id: 'mo2', number: 'CMD-2026-0136', type: 'product', status: 'delivered', date: '2026-10-25T08:00:00',
    items: [{ name: 'Croissants (x6)', price: 1800, quantity: 2 }],
    productCost: 3600, serviceFee: 500, deliveryFee: 800, total: 4900,
    deliveryAddress: 'Cocody Riviera 4', phone: '+225 07 01 23 45 67', commune: 'Cocody',
    customerName: 'Awa Koné', customerPhone: '+225 07 01 23 45 67', merchantName: 'Boulangerie Cocody',
  },
];

export const adminStats = {
  totalClients: 1248,
  totalOrders: 3420,
  pendingOrders: 18,
  inDeliveryOrders: 7,
  completedOrders: 3385,
  revenue: 4250000,
};

export const statusLabels: Record<string, { label: string; color: string }> = {
  received: { label: 'Commande reçue', color: 'bg-navy-100 text-navy-800' },
  awaiting_driver: { label: "En attente d'un livreur", color: 'bg-orange-100 text-orange-700' },
  driver_assigned: { label: 'Livreur assigné', color: 'bg-blue-100 text-blue-700' },
  shopping: { label: 'Achats en cours', color: 'bg-blue-100 text-blue-700' },
  en_route: { label: 'En route vers le client', color: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Livrée', color: 'bg-success-50 text-success-700' },
  cancelled: { label: 'Annulée', color: 'bg-error-50 text-error-600' },
  needs_assistance: { label: 'Assistance requise', color: 'bg-error-50 text-error-600' },
};

export const orderTypeLabels: Record<string, string> = {
  errand: 'Course',
  product: 'Produit',
  restaurant: 'Restaurant',
  parcel: 'Colis',
};

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function getPriceForQty(product: Product, qty: number, useWholesale: boolean): number {
  if (useWholesale && product.wholesalePrice && product.wholesaleMinQty && qty >= product.wholesaleMinQty) {
    if (product.quantityTiers) {
      const tier = [...product.quantityTiers].reverse().find((t) => qty >= t.minQty);
      if (tier) return tier.pricePerUnit;
    }
    return product.wholesalePrice;
  }
  const base = product.promo ? Math.round(product.price * (1 - product.promo / 100)) : product.price;
  return base;
}

export function isPromoValid(product: Product): boolean {
  if (!product.promo) return false;
  if (product.promoValidUntil) {
    const now = new Date();
    const until = new Date(product.promoValidUntil);
    return until >= now;
  }
  return true;
}
