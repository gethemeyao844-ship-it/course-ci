import { useState } from 'react';
import {
  LayoutDashboard, Package, Tags, Store, Bike, Megaphone, Wallet,
  MapPin, AlertCircle, Users, LogOut, Menu, X, Bell,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp, type AppPage } from '@/context';

const navItems: { page: AppPage; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'admin-home', label: 'Tableau de bord', icon: LayoutDashboard },
  { page: 'admin-products', label: 'Produits', icon: Package },
  { page: 'admin-categories', label: 'Catégories', icon: Tags },
  { page: 'admin-merchants', label: 'Commerçants', icon: Store },
  { page: 'admin-drivers', label: 'Livreurs', icon: Bike },
  { page: 'admin-promotions', label: 'Promotions', icon: Megaphone },
  { page: 'admin-zones', label: 'Zones & tarifs', icon: MapPin },
  { page: 'admin-claims', label: 'Réclamations', icon: AlertCircle },
  { page: 'admin-accounts', label: 'Comptes & rôles', icon: Users },
  { page: 'admin-shops', label: 'Boutiques', icon: Store },
  { page: 'admin-driver-apps', label: 'Candidatures livreurs', icon: Bike },
  { page: 'admin-payments', label: 'Paiements', icon: Wallet },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setPage, logout, page } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-navy-900 text-white z-50 transition-transform duration-300 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between">
          <Logo variant="light" size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70"><X size={22} /></button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-800">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white">A</div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">Administrateur</div>
              <div className="text-xs text-orange-400">Accès total</div>
            </div>
          </div>
        </div>
        <nav className="px-3 space-y-1 pb-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => { setPage(item.page); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  page === item.page ? 'bg-orange-500 text-white' : 'text-navy-100 hover:bg-navy-800'
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 absolute bottom-0 left-0 right-0 bg-navy-900">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-navy-100 hover:bg-error-600/20 transition-colors">
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={22} className="text-navy-700" />
            </button>
            <div className="lg:hidden"><Logo size="sm" showText={false} /></div>
            <h1 className="hidden lg:block text-lg font-bold text-navy-900">Administration CourseCI</h1>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl hover:bg-gray-50">
                <Bell size={22} className="text-navy-700" />
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 overflow-x-auto">
          <div className="flex gap-1 px-2 py-2 min-w-max">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = page === item.page;
              return (
                <button key={item.page} onClick={() => setPage(item.page)} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? 'text-orange-500' : 'text-gray-400'}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[9px] font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
