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

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  commune?: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  merchantId: string;
  promo?: number;
  unit?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit?: string;
  instructions?: string;
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
