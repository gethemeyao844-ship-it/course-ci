import {
  User, Package, MapPinned, CreditCard, HelpCircle, Settings,
  LogOut, ChevronRight, Bell, Star,
} from 'lucide-react';
import { useApp, type AppPage } from '@/context';

export function ProfilePage() {
  const { user, setPage, logout, orders } = useApp();

  const menuItems: { page: AppPage; label: string; icon: typeof User; desc: string }[] = [
    { page: 'orders', label: 'Mes commandes', icon: Package, desc: `${orders.length} commande${orders.length > 1 ? 's' : ''}` },
    { page: 'addresses', label: 'Mes adresses', icon: MapPinned, desc: 'Gérer vos adresses de livraison' },
    { page: 'payments', label: 'Moyens de paiement', icon: CreditCard, desc: 'Cash, Mobile Money' },
    { page: 'messages', label: 'Messages', icon: Bell, desc: 'Support et livreur' },
    { page: 'help', label: 'Aide et support', icon: HelpCircle, desc: 'FAQ et contact' },
    { page: 'settings', label: 'Paramètres', icon: Settings, desc: 'Préférences et langue' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      {/* Profile header */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
        <div className="flex items-center gap-4">
          <img src={user?.avatarUrl} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-orange-400/30" />
          <div className="flex-1">
            <h1 className="text-xl font-extrabold">{user?.name}</h1>
            <p className="text-navy-200 text-sm">{user?.phone}</p>
            {user?.email && <p className="text-navy-200 text-sm">{user.email}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="badge bg-orange-500 text-white">Client</span>
              <span className="badge bg-white/15 text-white">{user?.commune}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-400">{orders.length}</div>
            <div className="text-xs text-navy-200">Commandes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-400">{orders.filter((o) => o.status === 'delivered').length}</div>
            <div className="text-xs text-navy-200">Livrées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-orange-400 flex items-center justify-center gap-0.5">
              4.8 <Star size={14} className="fill-orange-400" />
            </div>
            <div className="text-xs text-navy-200">Note client</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="card overflow-hidden">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="card w-full mt-4 p-4 flex items-center gap-4 hover:bg-error-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-error-50 flex items-center justify-center shrink-0">
          <LogOut size={20} className="text-error-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-error-600 text-sm">Déconnexion</h3>
          <p className="text-xs text-gray-400">Quitter votre session</p>
        </div>
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">CourseCI v1.0 · Phase 1 (Démo)</p>
    </div>
  );
}
