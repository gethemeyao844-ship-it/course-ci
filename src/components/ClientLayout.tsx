import { useState } from 'react';
import {
  Home, MessageCircle, User, Bell, Menu, X,
  MapPin, ShoppingCart, ChevronDown, LogOut, Package, CreditCard,
  HelpCircle, Settings, MapPinned,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp, type AppPage } from '@/context';
import { COMMUNES } from '@/data';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { CartDrawer } from '@/components/CartDrawer';

const navItems: { page: AppPage; label: string; icon: typeof Home }[] = [
  { page: 'home', label: 'Accueil', icon: Home },
  { page: 'orders', label: 'Mes commandes', icon: Package },
  { page: 'messages', label: 'Messages', icon: MessageCircle },
  { page: 'profile', label: 'Profil', icon: User },
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, setPage, logout, page, cart, notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [communeMenu, setCommuneMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const sidebarLinks: { page: AppPage; label: string; icon: typeof Home }[] = [
    { page: 'home', label: 'Accueil', icon: Home },
    { page: 'orders', label: 'Mes commandes', icon: Package },
    { page: 'messages', label: 'Messages', icon: MessageCircle },
    { page: 'profile', label: 'Mon profil', icon: User },
    { page: 'addresses', label: 'Mes adresses', icon: MapPinned },
    { page: 'payments', label: 'Moyens de paiement', icon: CreditCard },
    { page: 'help', label: 'Aide et support', icon: HelpCircle },
    { page: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const isActive = (p: AppPage) => page === p || (p === 'orders' && page === 'order-detail');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-navy-900 text-white z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between">
          <Logo variant="light" size="md" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <X size={22} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.page}
                onClick={() => { setPage(link.page); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive(link.page)
                    ? 'bg-orange-500 text-white'
                    : 'text-navy-100 hover:bg-navy-800'
                }`}
              >
                <Icon size={20} />
                {link.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-navy-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-navy-100 hover:bg-error-600/20 hover:text-error-100 transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-navy-700 hover:bg-gray-100 p-2 rounded-lg">
                <Menu size={22} />
              </button>
              <div className="lg:hidden">
                <Logo size="sm" showText={false} />
              </div>
              {/* Commune selector */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setCommuneMenu((s) => !s)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <MapPin size={18} className="text-orange-500" />
                  <div className="text-left">
                    <div className="text-xs text-gray-400 font-medium">Livraison à</div>
                    <div className="text-sm font-bold text-navy-800">{user?.commune || 'Cocody'}</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {communeMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCommuneMenu(false)} />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-float border border-gray-100 z-20 py-2 max-h-72 overflow-y-auto">
                      {COMMUNES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCommuneMenu(false)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${c === user?.commune ? 'text-orange-600 font-bold' : 'text-navy-700'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart size={22} className="text-navy-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Bell size={22} className="text-navy-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => setPage('profile')}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img
                  src={user?.avatarUrl}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold text-navy-800">{user?.name}</div>
                  <div className="text-xs text-gray-400">Client</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
          <div className="grid grid-cols-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              return (
                <button
                  key={item.page}
                  onClick={() => setPage(item.page)}
                  className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${active ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <div className={`relative ${active ? '' : ''}`}>
                    {active && <div className="absolute -inset-2 bg-orange-50 rounded-full -z-10" />}
                    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
