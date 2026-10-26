import { useState, useMemo } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Plus, Minus, ShoppingCart, Check, X, Star, MapPin } from 'lucide-react';
import { useApp } from '@/context';
import { demoProducts, productCategories, formatFCFA, COMMUNES } from '@/data';
import { LocationPicker } from '@/components/LocationPicker';
import type { GeoCoords } from '@/hooks/useGeolocation';
import type { Product, CartItem, Order } from '@/types';

export function ProductsPage() {
  const { setPage, cart, addToCart, updateCartQty, placeOrder, user } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('default');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutCoords, setCheckoutCoords] = useState<GeoCoords | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState('');

  const filtered = useMemo(() => {
    let list = demoProducts;
    if (activeCategory !== 'Tous') list = list.filter((p) => p.category === activeCategory);
    if (search.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'promo') list = [...list].sort((a, b) => (b.promo || 0) - (a.promo || 0));
    return list;
  }, [search, activeCategory, sort]);

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
      type: 'product',
      status: 'received',
      date: new Date().toISOString(),
      items: cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity, instructions: c.instructions })),
      productCost: subtotal,
      serviceFee,
      deliveryFee,
      total,
      deliveryAddress: checkoutAddress || (user?.commune ? `${user.commune}, à confirmer` : 'À confirmer'),
      phone: user?.phone || '',
      commune: user?.commune || 'Cocody',
      customerName: user?.name || 'Client',
      customerPhone: user?.phone || '',
      deliveryLat: checkoutCoords?.lat,
      deliveryLng: checkoutCoords?.lng,
    };
    placeOrder(order);
    setCheckoutOpen(false);
    setCheckoutCoords(null);
    setCheckoutAddress('');
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-success-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Commande passée !</h1>
        <p className="text-gray-500 mb-6">Votre commande a été enregistrée. Vous recevrez une notification dès qu'un livreur sera assigné.</p>
        <button onClick={() => setPage('home')} className="btn-primary w-full">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Acheter un produit</h1>
      <p className="text-gray-500 mb-6">Parcourez notre catalogue et commandez en quelques clics</p>

      {/* Search + filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            className="input-field pl-10"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="btn-outline flex items-center gap-2 px-4"
        >
          <SlidersHorizontal size={18} /> <span className="hidden sm:inline">Filtrer</span>
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('Tous')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeCategory === 'Tous' ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-300'
          }`}
        >
          Tous
        </button>
        {productCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === cat.name ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-gray-200 hover:border-navy-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy-900">Filtres</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-navy-700"><X size={18} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Trier par</label>
              <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="default">Par défaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="promo">Promotions</option>
              </select>
            </div>
            <div>
              <label className="label-text">Disponibilité</label>
              <select className="input-field" defaultValue="all">
                <option value="all">Tous les produits</option>
                <option value="available">Disponibles uniquement</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => {
          const qty = getQty(product.id);
          const finalPrice = product.promo ? Math.round(product.price * (1 - product.promo / 100)) : product.price;
          return (
            <div key={product.id} className={`card overflow-hidden group hover:shadow-float transition-all duration-300 ${!product.available ? 'opacity-60' : ''}`}>
              <div className="relative h-36 overflow-hidden bg-gray-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                {product.promo && (
                  <span className="absolute top-2 left-2 badge bg-error-500 text-white">-{product.promo}%</span>
                )}
                {!product.available && (
                  <div className="absolute inset-0 bg-navy-900/40 flex items-center justify-center">
                    <span className="badge bg-white text-navy-800">Indisponible</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <span className="text-[10px] font-semibold text-orange-600 uppercase">{product.category}</span>
                <h3 className="font-bold text-sm text-navy-900 mt-0.5 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{product.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-orange-500 fill-orange-500" />
                  <span className="text-xs text-gray-500">4.{Math.floor(Math.random() * 9) + 1}</span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    {product.promo && <span className="text-xs text-gray-400 line-through block">{formatFCFA(product.price)}</span>}
                    <span className="font-bold text-navy-900 text-sm">{formatFCFA(finalPrice)}</span>
                    {product.unit && <span className="text-xs text-gray-400"> / {product.unit}</span>}
                  </div>
                </div>
                {product.available && (
                  <div className="mt-2">
                    {qty === 0 ? (
                      <button
                        onClick={() => handleAdd(product)}
                        className="w-full bg-navy-50 hover:bg-orange-50 hover:text-orange-600 text-navy-700 font-semibold rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={16} /> Ajouter
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-navy-50 rounded-lg p-1">
                        <button onClick={() => updateCartQty(product.id, qty - 1)} className="p-1.5 rounded hover:bg-white text-navy-700">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-navy-900 text-sm">{qty}</span>
                        <button onClick={() => updateCartQty(product.id, qty + 1)} className="p-1.5 rounded hover:bg-white text-navy-700">
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucun produit trouvé</p>
        </div>
      )}

      {/* Sticky checkout bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md z-20 animate-slide-up">
          <div className="card p-4 shadow-float flex items-center gap-4 bg-navy-900">
            <div className="flex items-center gap-2 text-white">
              <div className="relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
              </div>
            </div>
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

      {/* Checkout modal */}
      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          subtotal={subtotal}
          serviceFee={serviceFee}
          deliveryFee={deliveryFee}
          total={total}
          onConfirm={confirmOrder}
          coords={checkoutCoords}
          onCoordsChange={setCheckoutCoords}
          address={checkoutAddress}
          onAddressChange={setCheckoutAddress}
        />
      )}
    </div>
  );
}

function CheckoutModal({
  onClose, cart, subtotal, serviceFee, deliveryFee, total, onConfirm,
  coords, onCoordsChange, address, onAddressChange,
}: {
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  onConfirm: () => void;
  coords: GeoCoords | null;
  onCoordsChange: (c: GeoCoords | null) => void;
  address: string;
  onAddressChange: (a: string) => void;
}) {
  const [commune, setCommune] = useState('Cocody');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('cash');
  const [step, setStep] = useState<'address' | 'confirm'>('address');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="font-bold text-navy-900 text-lg">Finaliser la commande</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'address' ? (
            <>
              <LocationPicker
                address={address}
                onAddressChange={onAddressChange}
                coords={coords}
                onCoordsChange={onCoordsChange}
                commune={commune}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Commune</label>
                  <select className="input-field" value={commune} onChange={(e) => setCommune(e.target.value)}>
                    {COMMUNES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Téléphone</label>
                  <input className="input-field" placeholder="+225 07 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label-text">Mode de paiement</label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${payment === 'cash' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="cash" checked={payment === 'cash'} onChange={(e) => setPayment(e.target.value)} className="accent-orange-500" />
                    <div>
                      <div className="font-semibold text-navy-900 text-sm">Paiement à la livraison</div>
                      <div className="text-xs text-gray-400">Payez en espèces à la réception</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors opacity-60 ${payment === 'momo' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="momo" disabled onChange={(e) => setPayment(e.target.value)} className="accent-orange-500" />
                    <div>
                      <div className="font-semibold text-navy-900 text-sm">Mobile Money</div>
                      <div className="text-xs text-gray-400">Bientôt disponible (Orange Money, MTN, Wave)</div>
                    </div>
                  </label>
                </div>
              </div>
              <button onClick={() => setStep('confirm')} disabled={!address.trim() || !phone.trim()} className="btn-primary w-full">
                Continuer
              </button>
            </>
          ) : (
            <>
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
              <div className="card p-4 bg-navy-50/50">
                <div className="flex items-start gap-2 text-sm text-navy-700">
                  <MapPin size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{address}</div>
                    <div className="text-gray-500">{commune} · {phone}</div>
                  </div>
                </div>
              </div>
              <button onClick={onConfirm} className="btn-primary w-full flex items-center justify-center gap-2">
                <Check size={20} /> Confirmer la commande
              </button>
              <button onClick={() => setStep('address')} className="btn-ghost w-full">Retour</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
