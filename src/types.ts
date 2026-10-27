export type UserRole = 'client' | 'driver' | 'merchant' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  commune: string;
  avatarUrl: string;
}

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

// ─── Payment types ──────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export type PaymentPurpose = 'order' | 'subscription' | 'delivery_fee' | 'promotion';

export interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  channel: string | null;
  logoUrl: string | null;
  displayOrder: number;
  isEnabled: boolean;
  supportsSubscription: boolean;
  supportsOrder: boolean;
}

export interface Transaction {
  id: string;
  reference: string;
  paymentMethodId: string | null;
  purpose: PaymentPurpose;
  purposeId: string | null;
  amountFcfa: number;
  status: PaymentStatus;
  providerReference: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  planType: 'daily' | 'monthly';
  priceFcfa: number;
  durationHours: number;
  includesDelivery: boolean;
  description: string | null;
  isActive: boolean;
}

export interface MerchantSubscription {
  id: string;
  shopId: string;
  planId: string;
  merchantId: string;
  paymentStatus: PaymentStatus;
  amountFcfa: number;
  activatedAt: string | null;
  expiresAt: string | null;
  paymentReference: string | null;
  createdAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  shopName: string;
  businessType: string;
  description: string | null;
  address: string;
  commune: string;
  logoUrl: string | null;
  coverUrl: string | null;
  galleryUrls: string[];
  openingHours: string | null;
  whatsappNumber: string | null;
  contactPhone: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export type DriverApplicationStatus =
  | 'draft' | 'submitted' | 'under_review' | 'info_requested' | 'accepted' | 'rejected';

export interface DriverApplication {
  id: string;
  applicantId: string;
  fullName: string;
  phone: string;
  email: string | null;
  commune: string;
  workZone: string | null;
  vehicleType: 'moto' | 'velo' | 'voiture' | 'autre';
  availabilityHours: string | null;
  experience: string | null;
  profilePhotoUrl: string | null;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  documentUrls: string[];
  licenseUrl: string | null;
  messageToAdmin: string | null;
  applicationStatus: DriverApplicationStatus;
  adminResponse: string | null;
  applicationNumber: string | null;
  isActivated: boolean;
  createdAt: string;
}
