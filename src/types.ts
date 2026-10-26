export type UserRole = 'client' | 'driver' | 'merchant' | 'admin';

export type OrderStatus =
  | 'received'
  | 'awaiting_driver'
  | 'driver_assigned'
  | 'shopping'
  | 'en_route'
  | 'delivered'
  | 'cancelled'
  | 'needs_assistance';

export type OrderType = 'errand' | 'product' | 'restaurant' | 'parcel';

export type SaleType = 'retail' | 'wholesale' | 'both';

export type ProductCondition = 'neuf' | 'occasion';

export type ProductUnit =
  | 'pièce' | 'kg' | 'g' | 'litre' | 'sac' | 'carton'
  | 'caisse' | 'paquet' | 'lot' | 'bouteille' | 'pack'
  | 'plat' | 'plateau' | 'régime' | 'panier' | 'pair'
  | 'boîte' | 'set' | 'unité';

export interface QuantityTier {
  minQty: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  imageUrl: string;
  available: boolean;
  merchantId: string;
  merchantName?: string;
  promo?: number;
  unit?: string;
  saleType?: SaleType;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  stock?: number;
  quantityTiers?: QuantityTier[];
  promoValidUntil?: string;
  promoConditions?: string;
  deliveryZone?: string;
  condition?: ProductCondition;
  brand?: string;
  size?: string;
  color?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit?: string;
  instructions?: string;
  saleType?: SaleType;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  instructions?: string;
}

export interface Order {
  id: string;
  number: string;
  type: OrderType;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
  productCost: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  pickupAddress?: string;
  phone: string;
  commune: string;
  customerName: string;
  customerPhone: string;
  merchantName?: string;
  driverName?: string;
  instructions?: string;
  timeSlot?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveredAt?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'market' | 'bakery' | 'restaurant' | 'cars' | 'shop' | 'service';
  imageUrl: string;
  location: string;
  hours: string;
  rating: number;
  commune: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  active: boolean;
  productId?: string;
  originalPrice?: number;
  promoPrice?: number;
  validUntil?: string;
  conditions?: string;
  bulkDeal?: boolean;
  minQty?: number;
}

export interface ErrandItem {
  name: string;
  quantity: string;
  budget: number;
}

export interface ParcelForm {
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  description: string;
  weight?: string;
  instructions?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'promo' | 'system';
}

export interface SupplyListItem {
  productId: string;
  name: string;
  quantity: number;
  unit?: string;
  price?: number;
  imageUrl?: string;
  available?: boolean;
}

export interface SupplyList {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  editable: boolean;
  items: SupplyListItem[];
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}
