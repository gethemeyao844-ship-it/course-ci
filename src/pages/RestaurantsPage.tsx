import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Star, MapPin, Clock, Plus, Minus, ShoppingCart, Check, X, UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/context';
import { demoPartners, demoProducts, formatFCFA, COMMUNES } from '@/data';
import type { CartItem, Order, Product } from '@/types';

export function RestaurantsPage() {
  const { setPage, cart, addToCart, updateCartQty, placeOrder, user } = useApp();
  const [search, setSearch] = useState('');
  const [communeFilter, setCommuneFilter] = useState('Toutes');
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const partners = demoPartners.filter((p) => p.type === 'restaurant' || p.type === 'bakery');

  const filteredPartners = useMemo(() => {
    let list = partners;
    if (communeFilter !== 'Toutes') list = list.filter((p) => p.commune === communeFilter);
    if (search.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [partners, communeFilter, search]);

  const restaurantProducts = demoProducts.filter((p) => p.category === 'Restaurants' || p.category === 'Alimentation');

  const partnerProducts = (partnerId: string): Product[] => {
    const partner = partners.find((p) => p.id === partnerId);
    if (!partner) return [];
    if (partner.type === 'bakery') return restaurantProducts.filter((p) => p.name.includes('Pain') || p.name.includes('Croissant') || p.name.includes('Pâtisserie'));
    return restaurantProducts.filter((p) => p.category === 'Restaurants');
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const serviceFee = cart.length > 0 ? 500 : 0;
  const deliveryFee = cart.length > 0 ? 1000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handleAdd = (product: Product) => {
    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.promo ? Math.round(product.price * (1 - product.promo / 100)) : product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      unit: product.unit,
    };
    addToCart(item);
  };

  const getQty = (pid: string) => cart.find((c) => c.productId === pid)?.quantity || 0;

  const confirmOrder = () => {
    const order: Order = {
      id: `o${Date.now()}`,
      number: `CMD-2026-${String(Math.floor(Math.random() * 900) + 200)}`,
      type: 'restaurant',
      status: 'received',
      date: new Date().toISOString(),
      items: cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity })),
      productCost: subtotal,
      serviceFee,
      deliveryFee,
      total,
      deliveryAddress: user?.commune ? `${user.commune}, à confirmer` : 'À confirmer',
      pickupAddress: selectedPartner ? partners.find((p) => p.id === selectedPartner)?.name : '',
      phone: user?.phone || '',
      commune: user?.commune || 'Cocody',
      customerName: user?.name || 'Client',
      customerPhone: user?.phone || '',
      merchantName: selectedPartner ? partners.find((p) => p.id === selectedPartner)?.name : '',
    };
    placeOrder(order);
    setCheckoutOpen(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-success-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Commande passée !</h1>
        <p className="text-gray-500 mb-6">Votre commande de restaurant a été enregistrée. Le commerçant la préparera bientôt.</p>
        <button onClick={() => setPage('home')} className="btn-primary w-full">Retour à l'accueil</button>
      </div>
    );
  }

  // Partner detail view
  if (selectedPartner) {
    const partner = partners.find((p) => p.id === selectedPartner)!;
    const products = partnerProducts(selectedPartner);

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
        <button onClick={() => setSelectedPartner(null)} className="btn-ghost mb-4 flex items-center gap-1">
          <ArrowLeft size={18} /> Retour
        </button>

        {/* Partner header */}
        <div className="card overflow-hidden mb-6">
          <div className="relative h-40">
            <img src={partner.imageUrl} alt={partner.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-navy-900">{partner.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {partner.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {partner.hours}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-orange-50 rounded-xl px-3 py-1.5">
                <Star size={16} className="text-orange-500 fill-orange-500" />
                <span className="font-bold text-navy-800">{partner.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-navy-900 mb-4">Menu</h2>
        <div className="space-y-3">
          {products.map((product) => {
            const qty = getQty(product.id);
            const finalPrice = product.promo ? Math.round(product.price * (1 - product.promo / 100)) : product.price;
            return (
              <div key={product.id} className="card p-4 flex gap-4 items-center">
                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {product.promo && <span className="text-xs text-gray-400 line-through">{formatFCFA(product.price)}</span>}
                    <span className="font-bold text-orange-600">{formatFCFA(finalPrice)}</span>
                    {product.promo && <span className="badge bg-error-500 text-white">-{product.promo}%</span>}
                  </div>
                </div>
                {product.available ? (
                  qty === 0 ? (
                    <button onClick={() => handleAdd(product)} className="bg-navy-50 hover:bg-orange-50 hover:text-orange-600 text-navy-700 font-semibold rounded-xl p-2.5 transition-colors">
                      <Plus size={20} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-navy-50 rounded-xl p-1">
                      <button onClick={() => updateCartQty(product.id, qty - 1)} className="p-1.5 rounded hover:bg-white text-navy-700"><Minus size={16} /></button>
                      <span className="font-bold text-navy-900 text-sm w-6 text-center">{qty}</span>
                      <button onClick={() => updateCartQty(product.id, qty + 1)} className="p-1.5 rounded hover:bg-white text-navy-700"><Plus size={16} /></button>
                    </div>
                  )
                ) : (
                  <span className="badge bg-gray-100 text-gray-500">Indisponible</span>
                )}
              </div>
            );
          })}
        </div>

        {cartCount > 0 && (
          <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md z-20 animate-slide-up">
            <div className="card p-4 shadow-float flex items-center gap-4 bg-navy-900">
              <ShoppingCart size={24} className="text-white" />
              <div className="flex-1 text-white">
                <div className="text-xs text-navy-200">{cartCount} article{cartCount > 1 ? 's' : ''}</div>
                <div className="font-bold">{formatFCFA(total)}</div>
              </div>
              <button onClick={() => setCheckoutOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-5 py-2.5 transition-colors">
                Commander
              </button>
            </div>
          </div>
        )}

        {checkoutOpen && (
          <RestaurantCheckout
            onClose={() => setCheckoutOpen(false)}
            cart={cart}
            subtotal={subtotal}
            serviceFee={serviceFee}
            deliveryFee={deliveryFee}
            total={total}
            onConfirm={confirmOrder}
          />
        )}
      </div>
    );
  }

  // Partner list view
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Restaurants & Boulangeries</h1>
      <p className="text-gray-500 mb-6">Commandez vos repas et pains frais livrés chez vous</p>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="input-field pl-10" placeholder="Rechercher un restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field max-w-[140px]" value={communeFilter} onChange={(e) => setCommuneFilter(e.target.value)}>
          <option>Toutes</option>
          {COMMUNES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((partner) => (
          <button
            key={partner.id}
            onClick={() => setSelectedPartner(partner.id)}
            className="card overflow-hidden text-left hover:shadow-float transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="relative h-36 overflow-hidden">
              <img src={partner.imageUrl} alt={partner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-navy-800">
                <Star size={12} className="text-orange-500 fill-orange-500" /> {partner.rating}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UtensilsCrossed size={14} className="text-orange-500" />
                <span className="text-xs font-semibold text-orange-600 uppercase">{partner.type === 'bakery' ? 'Boulangerie' : 'Restaurant'}</span>
              </div>
              <h3 className="font-bold text-navy-900">{partner.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={12} /> {partner.location}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {partner.hours}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <UtensilsCrossed size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucun restaurant trouvé dans cette zone</p>
        </div>
      )}
    </div>
  );
}

function RestaurantCheckout({
  onClose, cart, subtotal, serviceFee, deliveryFee, total, onConfirm,
}: {
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="font-bold text-navy-900 text-lg">Finaliser la commande</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="card p-4 bg-gray-50">
            <h3 className="font-bold text-navy-900 text-sm mb-3">Articles ({cart.length})</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-semibold text-navy-800">{formatFCFA(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Sous-total</span><span className="font-semibold">{formatFCFA(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(serviceFee)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(deliveryFee)}</span></div>
              <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span></div>
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-xs text-orange-700">
            Paiement à la livraison. Mobile Money sera disponible une fois le prestataire configuré.
          </div>
          <button onClick={onConfirm} className="btn-primary w-full flex items-center justify-center gap-2">
            <Check size={20} /> Confirmer la commande
          </button>
        </div>
      </div>
    </div>
  );
}
