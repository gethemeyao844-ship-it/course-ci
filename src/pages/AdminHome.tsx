import {
  Users, Package, Clock, Bike, TrendingUp, Store, AlertCircle,
  Check, MapPin, Tags, Megaphone, ArrowRight, Wallet,
} from 'lucide-react';
import { useApp, type AppPage } from '@/context';
import { adminStats, demoProducts, demoPartners, demoPromotions, COMMUNES, formatFCFA } from '@/data';

export function AdminHome() {
  const { setPage } = useApp();

  const stats = [
    { label: 'Clients', value: adminStats.totalClients.toLocaleString(), icon: Users, color: 'text-navy-700', bg: 'bg-navy-50', page: 'admin-accounts' as AppPage },
    { label: 'Commandes', value: adminStats.totalOrders.toLocaleString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', page: 'admin-products' as AppPage },
    { label: 'En attente', value: String(adminStats.pendingOrders), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', page: 'admin-claims' as AppPage },
    { label: 'En livraison', value: String(adminStats.inDeliveryOrders), icon: Bike, color: 'text-navy-700', bg: 'bg-navy-50', page: 'admin-drivers' as AppPage },
    { label: 'Terminées', value: adminStats.completedOrders.toLocaleString(), icon: Check, color: 'text-success-600', bg: 'bg-success-50', page: 'admin-products' as AppPage },
    { label: "Chiffre d'affaires", value: formatFCFA(adminStats.revenue), icon: TrendingUp, color: 'text-success-600', bg: 'bg-success-50', page: 'admin-zones' as AppPage },
  ];

  const manageItems: { page: AppPage; label: string; icon: typeof Package; desc: string; count: string }[] = [
    { page: 'admin-products', label: 'Produits', icon: Package, desc: 'Gérer le catalogue', count: `${demoProducts.length} produits` },
    { page: 'admin-categories', label: 'Catégories', icon: Tags, desc: 'Gérer les catégories', count: '6 catégories' },
    { page: 'admin-merchants', label: 'Commerçants', icon: Store, desc: 'Gérer les partenaires', count: `${demoPartners.length} partenaires` },
    { page: 'admin-drivers', label: 'Livreurs', icon: Bike, desc: 'Gérer les livreurs', count: '24 livreurs' },
    { page: 'admin-promotions', label: 'Promotions', icon: Megaphone, desc: 'Gérer les offres', count: `${demoPromotions.length} promos` },
    { page: 'admin-zones', label: 'Zones & tarifs', icon: MapPin, desc: 'Tarifs par commune', count: `${COMMUNES.length} communes` },
    { page: 'admin-claims', label: 'Réclamations', icon: AlertCircle, desc: 'Gérer les litiges', count: '3 en attente' },
    { page: 'admin-accounts', label: 'Comptes & rôles', icon: Users, desc: 'Gérer les utilisateurs', count: '1280 comptes' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble de la plateforme CourseCI</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => setPage(stat.page)}
              className="card p-4 text-left hover:shadow-float transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={stat.color} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-extrabold text-navy-900 truncate">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" /> Évolution du chiffre d'affaires
          </h2>
          <span className="badge bg-success-50 text-success-700">+12% ce mois</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'].map((month, i) => {
            const heights = [45, 52, 48, 60, 55, 68, 72, 65, 80, 95];
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-navy-900">{Math.round(heights[i] * 10000).toLocaleString()}</div>
                <div className="w-full bg-gradient-to-t from-navy-800 to-navy-600 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-400" style={{ height: `${heights[i]}%` }} />
                <span className="text-xs text-gray-400">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Management grid */}
      <h2 className="font-bold text-navy-900 mb-3">Gestion</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {manageItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className="card p-4 text-left hover:shadow-float transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center mb-2 group-hover:bg-orange-50 transition-colors">
                <Icon size={20} className="text-navy-600 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm">{item.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-orange-600">{item.count}</span>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent claims */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            <AlertCircle size={18} className="text-error-500" /> Réclamations récentes
          </h2>
          <button onClick={() => setPage('admin-claims')} className="text-sm text-orange-600 font-semibold">Voir tout</button>
        </div>
        <div className="space-y-2">
          {[
            { id: 'r1', subject: 'Livraison en retard', customer: 'Awa Koné', order: 'CMD-2026-0140', priority: 'Haute' },
            { id: 'r2', subject: 'Produit manquant', customer: 'Kouassi N\'Guessan', order: 'CMD-2026-0136', priority: 'Moyenne' },
            { id: 'r3', subject: 'Montant incorrect', customer: 'Fatou Bamba', order: 'CMD-2026-0128', priority: 'Basse' },
          ].map((claim) => (
            <div key={claim.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full ${claim.priority === 'Haute' ? 'bg-error-500' : claim.priority === 'Moyenne' ? 'bg-orange-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-900 text-sm">{claim.subject}</h3>
                <p className="text-xs text-gray-400">{claim.customer} · {claim.order}</p>
              </div>
              <span className={`badge ${claim.priority === 'Haute' ? 'bg-error-50 text-error-600' : claim.priority === 'Moyenne' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                {claim.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card p-4 mt-6 bg-navy-50/50 flex items-start gap-3">
        <Wallet size={20} className="text-navy-600 shrink-0 mt-0.5" />
        <p className="text-sm text-navy-700">
          <strong>Phase 1 (Démo):</strong> Les données sont de démonstration. La base de données Supabase,
          l'authentification réelle, les paiements et les notifications seront connectés dans les phases suivantes.
        </p>
      </div>
    </div>
  );
}
