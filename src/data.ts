import type { Product, Partner, Promotion, Order, Notification, User } from '@/types';

export const COMMUNES = [
  'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
  'Marcory', 'Plateau', 'Treichville', 'Yopougon', 'Port-Bouët',
  'Bingerville', 'Songon',
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

export const demoProducts: Product[] = [
  { id: 'p1', name: 'Ananas frais', description: 'Ananas mûr du marché local', price: 500, category: 'Fruits & Légumes', imageUrl: 'https://images.pexels.com/photos/37126231/pexels-photo-37126231.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', unit: 'pièce' },
  { id: 'p2', name: 'Bananes regime', description: 'Régime de bananes mûres', price: 1500, category: 'Fruits & Légumes', imageUrl: 'https://images.pexels.com/photos/28736731/pexels-photo-28736731.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm1', unit: 'régime', promo: 10 },
  { id: 'p3', name: 'Riz parfumé 5kg', description: 'Sac de riz parfumé de qualité supérieure', price: 4500, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', unit: 'sac' },
  { id: 'p4', name: 'Pain frais', description: 'Baguette fraîche du jour', price: 200, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/9120377/pexels-photo-9120377.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', unit: 'pièce' },
  { id: 'p5', name: 'Croissants (x6)', description: 'Croissants beurre frais', price: 1800, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/21847830/pexels-photo-21847830.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', unit: 'lot', promo: 15 },
  { id: 'p6', name: 'Poisson braisé', description: 'Poisson frais braisé avec sauce', price: 3500, category: 'Restaurants', imageUrl: 'https://images.pexels.com/photos/20067063/pexels-photo-20067063.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm4', unit: 'plat' },
  { id: 'p7', name: 'Plat traditionnel', description: 'Attieké poisson frit', price: 2500, category: 'Restaurants', imageUrl: 'https://images.pexels.com/photos/28736727/pexels-photo-28736727.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm4', unit: 'plat' },
  { id: 'p8', name: "Jus d'orange 1L", description: 'Jus naturel sans sucre ajouté', price: 1000, category: 'Boissons', imageUrl: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', unit: 'bouteille' },
  { id: 'p9', name: 'Savon de toilette', description: 'Lot de 4 savons', price: 800, category: 'Hygiène', imageUrl: 'https://images.pexels.com/photos/36470055/pexels-photo-36470055.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', unit: 'lot' },
  { id: 'p10', name: 'Panier de légumes', description: 'Assortiment de légumes frais du marché', price: 3000, category: 'Fruits & Légumes', imageUrl: 'https://images.pexels.com/photos/35485717/pexels-photo-35485717.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: false, merchantId: 'm1', unit: 'panier' },
  { id: 'p11', name: 'Eau minérale 6x1.5L', description: "Pack d'eau minérale naturelle", price: 1200, category: 'Boissons', imageUrl: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm2', unit: 'pack' },
  { id: 'p12', name: 'Pâtisseries assorties', description: 'Plateau de pâtisseries variées', price: 4000, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=400&w=400', available: true, merchantId: 'm3', unit: 'plateau', promo: 20 },
];

export const productCategories = [
  { name: 'Alimentation', icon: 'ShoppingBasket' },
  { name: 'Fruits & Légumes', icon: 'Apple' },
  { name: 'Boissons', icon: 'Coffee' },
  { name: 'Hygiène', icon: 'Sparkles' },
  { name: 'Maison', icon: 'Home' },
  { name: 'Restaurants', icon: 'UtensilsCrossed' },
];

export const demoPartners: Partner[] = [
  { id: 'pt1', name: "Marché d'Adjamé", type: 'market', imageUrl: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Adjamé', hours: '6h - 19h', rating: 4.5, commune: 'Adjamé' },
  { id: 'pt2', name: 'Boulangerie Cocody', type: 'bakery', imageUrl: 'https://images.pexels.com/photos/9120377/pexels-photo-9120377.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Cocody', hours: '5h - 20h', rating: 4.8, commune: 'Cocody' },
  { id: 'pt3', name: 'Restaurant Le Baoulé', type: 'restaurant', imageUrl: 'https://images.pexels.com/photos/28074289/pexels-photo-28074289.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Plateau', hours: '11h - 23h', rating: 4.7, commune: 'Plateau' },
  { id: 'pt4', name: 'AutoCIV Vente', type: 'cars', imageUrl: 'https://images.pexels.com/photos/29566906/pexels-photo-29566906.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Marcory', hours: '8h - 18h', rating: 4.3, commune: 'Marcory' },
  { id: 'pt5', name: 'Boutique Yopougon', type: 'shop', imageUrl: 'https://images.pexels.com/photos/35485717/pexels-photo-35485717.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Yopougon', hours: '7h - 21h', rating: 4.2, commune: 'Yopougon' },
  { id: 'pt6', name: 'Services Express', type: 'service', imageUrl: 'https://images.pexels.com/photos/13311393/pexels-photo-13311393.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', location: 'Treichville', hours: '24h/24', rating: 4.6, commune: 'Treichville' },
];

export const demoPromotions: Promotion[] = [
  { id: 'pr1', title: '-20% sur la livraison ce week-end', description: 'Profitez de frais de livraison réduits sur toutes vos commandes du samedi et dimanche.', discount: '-20%', imageUrl: 'https://images.pexels.com/photos/13311393/pexels-photo-13311393.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true },
  { id: 'pr2', title: 'Menu du jour à 2000 FCFA', description: 'Attieké poisson + jus naturel. Offre limitée au restaurant Le Baoulé.', discount: '2000 F', imageUrl: 'https://images.pexels.com/photos/28736727/pexels-photo-28736727.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true },
  { id: 'pr3', title: 'Pâtisseries -20%', description: 'Sur tous les plateaux de pâtisseries à la Boulangerie Cocody.', discount: '-20%', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=300&w=800', active: true },
];

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
  { id: 'mp1', name: 'Pain frais', description: 'Baguette fraîche du jour', price: 200, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/9120377/pexels-photo-9120377.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true, merchantId: 'm3', unit: 'pièce' },
  { id: 'mp2', name: 'Croissants (x6)', description: 'Croissants beurre frais', price: 1800, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/21847830/pexels-photo-21847830.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: true, merchantId: 'm3', unit: 'lot', promo: 15 },
  { id: 'mp3', name: 'Pâtisseries assorties', description: 'Plateau de pâtisseries variées', price: 4000, category: 'Alimentation', imageUrl: 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', available: false, merchantId: 'm3', unit: 'plateau', promo: 20 },
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
