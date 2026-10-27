import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, CartItem, UserRole, Notification, Order } from '@/types';
import { demoNotifications, demoOrders, driverOrders, merchantOrders } from '@/data';
import { supabase } from '@/lib/supabase';

export type AppPage =
  | 'home' | 'errand' | 'products' | 'restaurants' | 'parcel'
  | 'orders' | 'order-detail' | 'profile' | 'messages'
  | 'addresses' | 'payments' | 'help' | 'settings' | 'wallet'
  | 'marketplace' | 'supply-lists' | 'promotions' | 'checkout' | 'payment-history' | 'shops'
  // driver
  | 'driver-home' | 'driver-mission' | 'driver-history' | 'driver-profile'
  | 'driver-application' | 'driver-wallet'
  // merchant
  | 'merchant-home' | 'merchant-products' | 'merchant-orders' | 'merchant-profile'
  | 'merchant-setup' | 'merchant-wallet'
  // admin
  | 'admin-home' | 'admin-products' | 'admin-categories' | 'admin-merchants'
  | 'admin-drivers' | 'admin-promotions' | 'admin-zones' | 'admin-claims'
  | 'admin-accounts' | 'admin-payments' | 'admin-shops' | 'admin-driver-apps';

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  page: AppPage;
  cart: CartItem[];
  notifications: Notification[];
  orders: Order[];
  selectedOrderId: string | null;
  selectedDriverOrderId: string | null;
  login: (role: UserRole, name?: string) => void;
  loginWithSession: (user: User, role: UserRole) => void;
  logout: () => void;
  setPage: (page: AppPage) => void;
  isAdminVerified: boolean;
  setAdminVerified: (v: boolean) => void;
  setSelectedOrderId: (id: string | null) => void;
  setSelectedDriverOrderId: (id: string | null) => void;
  addToCart: (item: CartItem) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  markNotificationRead: (id: string) => void;
  placeOrder: (order: Order) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const roleHomePages: Record<UserRole, AppPage> = {
  client: 'home',
  driver: 'driver-home',
  merchant: 'merchant-home',
  admin: 'admin-home',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<AppPage>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDriverOrderId, setSelectedDriverOrderId] = useState<string | null>(null);
  const [isAdminVerified, setAdminVerified] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const authUser = session.user;
        const meta = authUser.user_metadata || {};
        const role = (meta.role as UserRole) || 'client';
        const restoredUser: User = {
          id: authUser.id,
          name: meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Utilisateur',
          phone: meta.phone || authUser.phone || '',
          email: authUser.email || '',
          role,
          commune: meta.commune || 'Cocody',
          avatarUrl: meta.avatarUrl || 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
        };
        setUser(restoredUser);
        setPage(roleHomePages[role]);
        if (role === 'driver') setOrders(driverOrders);
        if (role === 'merchant') setOrders(merchantOrders);
      }
    };
    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setAdminVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (role: UserRole, name?: string) => {
    // Demo fallback login (no real auth) — used only for demo mode
    const demoUserObj: User = {
      id: 'demo-' + role,
      name: name || 'Awa Koné',
      phone: '+225 07 01 23 45 67',
      email: 'demo@example.ci',
      role,
      commune: 'Cocody',
      avatarUrl: role === 'driver'
        ? 'https://images.pexels.com/photos/37059837/pexels-photo-37059837.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
        : role === 'merchant'
        ? 'https://images.pexels.com/photos/32459865/pexels-photo-32459865.jpeg?auto=compress&cs=tinysrgb&h=120&w=120'
        : 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
    };
    setUser(demoUserObj);
    setPage(roleHomePages[role]);
    if (role === 'driver') setOrders(driverOrders);
    if (role === 'merchant') setOrders(merchantOrders);
  };

  const loginWithSession = (sessionUser: User, role: UserRole) => {
    setUser(sessionUser);
    setPage(roleHomePages[role]);
    if (role === 'driver') setOrders(driverOrders);
    if (role === 'merchant') setOrders(merchantOrders);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage('home');
    setCart([]);
    setAdminVerified(false);
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId ? { ...c, quantity: c.quantity + item.quantity } : c
        );
      }
      return [...prev, item];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity } : c)));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const placeOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    clearCart();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        page,
        cart,
        notifications,
        orders,
        selectedOrderId,
        selectedDriverOrderId,
        login,
        loginWithSession,
        logout,
        setPage,
        setSelectedOrderId,
        setSelectedDriverOrderId,
        isAdminVerified,
        setAdminVerified,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        markNotificationRead,
        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
