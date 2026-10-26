import {
  ShoppingBasket, ShoppingBag, UtensilsCrossed, Package,
  Star, ArrowRight, MapPin, TrendingUp, Bell, ChevronRight,
} from 'lucide-react';
import { useApp, type AppPage } from '@/context';
import { demoPartners, demoPromotions, statusLabels, orderTypeLabels, formatFCFA } from '@/data';
import { useState, useEffect } from 'react';

export function ClientHome() {
  const { user, setPage, orders, setSelectedOrderId } = useApp();
  const [bannerIndex, setBannerIndex] = useState(0);

  const banners = demoPromotions;

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const categories: { page: AppPage; label: string; desc: string; icon: typeof ShoppingBasket; color: string; bgColor: string }[] = [
    { page: 'errand', label: 'Faire une course', desc: 'Courses au marché', icon: ShoppingBasket, color: 'text-navy-700', bgColor: 'bg-navy-50' },
    { page: 'products', label: 'Acheter un produit', desc: 'Catalogue produits', icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { page: 'restaurants', label: 'Restaurants', desc: 'Repas & boulangeries', icon: UtensilsCrossed, color: 'text-success-600', bgColor: 'bg-success-50' },
    { page: 'parcel', label: 'Colis & services', desc: 'Envoyer un colis', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const partnerTypeIcons: Record<string, string> = {
    market: 'Marché', bakery: 'Boulangerie', restaurant: 'Restaurant', cars: 'Voitures', shop: 'Boutique', service: 'Services',
  };

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Bonjour, {user?.name?.split(' ')[0]} !
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Que souhaitez-vous commander aujourd'hui ?</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-soft">
          <MapPin size={18} className="text-orange-500" />
          <span className="text-sm font-semibold text-navy-800">{user?.commune}</span>
        </div>
      </div>

      {/* Promotional banner */}
      <div className="relative rounded-3xl overflow-hidden h-56 sm:h-64 shadow-card group">
        {banners.map((promo, i) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/50 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="p-6 sm:p-10 max-w-lg">
                <span className="badge bg-orange-500 text-white mb-3">{promo.discount}</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{promo.title}</h2>
                <p className="text-navy-100 text-sm mt-2 mb-4 hidden sm:block">{promo.description}</p>
                <button
                  onClick={() => setPage('products')}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-5 py-2.5 transition-colors"
                >
                  En profiter <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-4 left-6 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === bannerIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4">Nos services</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.page}
                onClick={() => setPage(cat.page)}
                className="card p-5 text-left hover:shadow-float transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className={cat.color} />
                </div>
                <h3 className="font-bold text-navy-900 text-sm">{cat.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-orange-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Découvrir <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Partners */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Nos partenaires</h2>
          <button className="text-sm text-orange-600 font-semibold hover:text-orange-700">Voir tout</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {demoPartners.map((partner) => (
            <button
              key={partner.id}
              onClick={() => setPage(partner.type === 'restaurant' || partner.type === 'bakery' ? 'restaurants' : 'products')}
              className="card overflow-hidden text-left hover:shadow-float transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="relative h-24 overflow-hidden">
                <img src={partner.imageUrl} alt={partner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-0.5">
                  <Star size={11} className="text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-navy-800">{partner.rating}</span>
                </div>
              </div>
              <div className="p-3">
                <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">{partnerTypeIcons[partner.type]}</span>
                <h3 className="font-bold text-sm text-navy-900 truncate">{partner.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                  <MapPin size={11} /> {partner.location}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Annonces & Promotions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Annonces & Promotions</h2>
          <span className="badge bg-orange-100 text-orange-700"><TrendingUp size={12} /> Offres du moment</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {demoPromotions.map((promo) => (
            <div key={promo.id} className="card overflow-hidden group hover:shadow-float transition-shadow">
              <div className="relative h-32 overflow-hidden">
                <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 badge bg-orange-500 text-white text-sm px-3 py-1">{promo.discount}</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy-900 text-sm">{promo.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy-900">Commandes récentes</h2>
          <button onClick={() => setPage('orders')} className="text-sm text-orange-600 font-semibold hover:text-orange-700">Voir tout</button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const status = statusLabels[order.status];
              return (
                <button
                  key={order.id}
                  onClick={() => { setSelectedOrderId(order.id); setPage('order-detail'); }}
                  className="card p-4 w-full text-left hover:shadow-float transition-shadow flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                    <Package size={22} className="text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-900 text-sm">{order.number}</span>
                      <span className="badge bg-navy-50 text-navy-600">{orderTypeLabels[order.type]}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-navy-900 text-sm">{formatFCFA(order.total)}</div>
                    <span className={`badge ${status.color} mt-1`}>{status.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="card p-4 bg-navy-50/50 border border-navy-100 flex items-start gap-3">
        <Bell size={20} className="text-navy-600 shrink-0 mt-0.5" />
        <p className="text-sm text-navy-700">
          <strong>Version démo :</strong> les commandes, produits et partenaires utilisent des données de démonstration.
          La connexion à la base de données, l'authentification réelle et les paiements seront activés dans les prochaines phases.
        </p>
      </div>
    </div>
  );
}
