import { TrendingUp, Package, ShoppingBag, Clock, Store, Star, ArrowRight } from 'lucide-react';
import { useApp } from '@/context';
import { merchantOrders, merchantProducts, formatFCFA } from '@/data';

export function MerchantHome() {
  const { setPage, user } = useApp();

  const revenue = merchantOrders.reduce((s, o) => s + o.productCost, 0);
  const pendingOrders = merchantOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = merchantOrders.filter((o) => o.status === 'delivered');

  const stats = [
    { label: "Chiffre d'affaires", value: formatFCFA(revenue), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Commandes en attente', value: String(pendingOrders.length), icon: Clock, color: 'text-navy-700', bg: 'bg-navy-50' },
    { label: 'Commandes livrées', value: String(completedOrders.length), icon: ShoppingBag, color: 'text-success-600', bg: 'bg-success-50' },
    { label: 'Produits actifs', value: String(merchantProducts.filter((p) => p.available).length), icon: Package, color: 'text-navy-700', bg: 'bg-navy-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900">Bonjour, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm">Voici l'activité de votre boutique aujourd'hui</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div className="text-lg font-extrabold text-navy-900">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-navy-900">Commandes récentes</h2>
            <button onClick={() => setPage('merchant-orders')} className="text-sm text-orange-600 font-semibold flex items-center gap-1">
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {merchantOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm">{order.number}</h3>
                  <p className="text-xs text-gray-400">{order.customerName} · {order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                </div>
                <span className="font-bold text-navy-900 text-sm">{formatFCFA(order.productCost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-navy-900">Produits populaires</h2>
            <button onClick={() => setPage('merchant-products')} className="text-sm text-orange-600 font-semibold flex items-center gap-1">
              Gérer <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {merchantProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm truncate">{product.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star size={11} className="text-orange-500 fill-orange-500" /> 4.{Math.floor(Math.random() * 9) + 1}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-navy-900 text-sm">{formatFCFA(product.price)}</div>
                  <span className={`text-xs ${product.available ? 'text-success-600' : 'text-error-500'}`}>
                    {product.available ? 'Dispo' : 'Indispo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store info */}
      <div className="card p-5 bg-gradient-to-r from-navy-900 to-navy-700 text-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center">
          <Store size={28} className="text-orange-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Boulangerie Cocody</h2>
          <p className="text-sm text-navy-200">Cocody · Ouvert 5h - 20h</p>
        </div>
        <button onClick={() => setPage('merchant-profile')} className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2 text-sm font-semibold transition-colors">
          Modifier
        </button>
      </div>
    </div>
  );
}
