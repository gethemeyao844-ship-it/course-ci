import { useState } from 'react';
import {
  ArrowLeft, Tag, TrendingDown, Clock, AlertCircle, Plus, Minus, ShoppingCart,
  Check, X, Layers, Store, Star,
} from 'lucide-react';
import { useApp } from '@/context';
import { demoPromotions, demoProducts, formatFCFA, getPriceForQty, isPromoValid, COMMUNES } from '@/data';
import { LocationPicker } from '@/components/LocationPicker';
import type { GeoCoords } from '@/hooks/useGeolocation';
import type { CartItem, Order } from '@/types';

export function PromotionsPage() {
  const { setPage, cart, addToCart, updateCartQty, placeOrder, user } = useApp();
  const [tab, setTab] = useState<'promo' | 'bulk'>('promo');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutCoords, setCheckoutCoords] = useState<GeoCoords | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState('');

  const promoDeals = demoPromotions.filter((p) => !p.bulkDeal && p.active);
  const bulkDeals = demoPromotions.filter((p) => p.bulkDeal && p.active);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const serviceFee = cart.length > 0 ? 500 : 0;
  const deliveryFee = cart.length > 0 ? 1000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handleAddPromo = (productId?: string) => {
    if (!productId) return;
    const product = demoProducts.find((p) => p.id === productId);
    if (!product) return;
    const price = getPriceForQty(product, 1, false);
    addToCart({ productId: product.id, name: product.name, price, quantity: 1, imageUrl: product.imageUrl, unit: product.unit });
  };

  const handleAddBulk = (productId?: string, minQty?: number) => {
    if (!productId) return;
    const product = demoProducts.find((p) => p.id === productId);
    if (!product) return;
    const qty = minQty || product.wholesaleMinQty || 1;
    const price = getPriceForQty(product, qty, true);
    addToCart({
      productId: product.id + '-w',
      name: product.name + ' (gros)',
      price, quantity: qty, imageUrl: product.imageUrl, unit: product.unit, saleType: 'wholesale',
    });
  };

  const getQty = (pid: string) => cart.find((c) => c.productId === pid)?.quantity || 0;

  const confirmOrder = () => {
    const order: Order = {
      id: `o${Date.now()}`,
      number: `CMD-2026-${String(Math.floor(Math.random() * 900) + 200)}`,
      type: 'product', status: 'received', date: new Date().toISOString(),
      items: cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity, instructions: c.instructions })),
      productCost: subtotal, serviceFee, deliveryFee, total,
      deliveryAddress: checkoutAddress || (user?.commune ? `${user.commune}, à confirmer` : 'À confirmer'),
      phone: user?.phone || '', commune: user?.commune || 'Cocody',
      customerName: user?.name || 'Client', customerPhone: user?.phone || '',
      deliveryLat: checkoutCoords?.lat, deliveryLng: checkoutCoords?.lng,
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
        <button onClick={() => setPage('home')} className="btn-primary w-full">Retour à l'accueil</button>
      </div>
    );
  }

  const activeDeals = tab === 'promo' ? promoDeals : bulkDeals;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Promotions & bonnes affaires</h1>
      <p className="text-gray-500 mb-6">Profitez des offres en cours et des prix de gros</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('promo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'promo' ? 'bg-orange-500 text-white' : 'bg-white text-navy-700 border border-gray-200'}`}
        >
          <Tag size={16} /> Promotions ({promoDeals.length})
        </button>
        <button
          onClick={() => setTab('bulk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'bulk' ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 border border-gray-200'}`}
        >
          <Layers size={16} /> Offres de gros ({bulkDeals.length})
        </button>
      </div>

      {/* Deals grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeDeals.map((promo) => {
          const product = promo.productId ? demoProducts.find((p) => p.id === promo.productId) : null;
          const qty = promo.productId ? getQty(promo.productId) : 0;
          const wholesaleQty = promo.productId ? getQty(promo.productId + '-w') : 0;
          const isBulk = !!promo.bulkDeal;

          return (
            <div key={promo.id} className="card overflow-hidden group hover:shadow-float transition-all duration-300">
              <div className="relative h-32 overflow-hidden">
                <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className={`absolute top-3 left-3 badge text-white text-sm px-3 py-1 ${isBulk ? 'bg-navy-700' : 'bg-error-500'}`}>
                  {isBulk ? <Layers size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                  {promo.discount}
                </span>
                {product && (
                  <span className={`absolute top-3 right-3 badge ${product.available ? 'bg-success-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {product.available ? 'Disponible' : 'Épuisé'}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-navy-900 text-sm">{promo.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>

                {/* Pricing */}
                {!isBulk && promo.originalPrice && promo.promoPrice && (
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xs text-gray-400 line-through">{formatFCFA(promo.originalPrice)}</span>
                    <span className="font-bold text-orange-600 text-lg">{formatFCFA(promo.promoPrice)}</span>
                  </div>
                )}
                {isBulk && product && (
                  <div className="mt-3 space-y-1">
                    {product.quantityTiers ? (
                      product.quantityTiers.map((tier, i) => (
                        <div key={i} className="flex justify-between text-xs bg-navy-50 rounded-lg px-2 py-1">
                          <span className="text-gray-500">Dès {tier.minQty} {product.unit || 'pces'}</span>
                          <span className="font-bold text-navy-800">{formatFCFA(tier.pricePerUnit)}</span>
                        </div>
                      ))
                    ) : product.wholesalePrice ? (
                      <div className="flex justify-between text-xs bg-navy-50 rounded-lg px-2 py-1">
                        <span className="text-gray-500">Dès {product.wholesaleMinQty} {product.unit || 'pces'}</span>
                        <span className="font-bold text-navy-800">{formatFCFA(product.wholesalePrice)}</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Validity & conditions */}
                <div className="mt-2 space-y-1">
                  {promo.validUntil && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> Jusqu'au {new Date(promo.validUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {promo.conditions && (
                    <p className="text-xs text-gray-400 flex items-start gap-1">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" /> {promo.conditions}
                    </p>
                  )}
                </div>

                {/* Product info */}
                {product && (
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Store size={10} /> {product.merchantName || 'Vendeur partenaire'}
                    </p>
                  </div>
                )}

                {/* Add to cart */}
                {product && product.available && (
                  <div className="mt-3">
                    {!isBulk ? (
                      qty === 0 ? (
                        <button onClick={() => handleAddPromo(promo.productId)} className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1">
                          <Plus size={16} /> Ajouter au panier
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1">
                          <button onClick={() => updateCartQty(product.id, qty - 1)} className="p-1.5 rounded hover:bg-white text-orange-700"><Minus size={16} /></button>
                          <span className="font-bold text-navy-900 text-sm">{qty}</span>
                          <button onClick={() => updateCartQty(product.id, qty + 1)} className="p-1.5 rounded hover:bg-white text-orange-700"><Plus size={16} /></button>
                        </div>
                      )
                    ) : (
                      wholesaleQty === 0 ? (
                        <button onClick={() => handleAddBulk(promo.productId, promo.minQty)} className="w-full bg-navy-700 hover:bg-navy-800 text-white font-semibold rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1">
                          <Layers size={14} /> Acheter en gros
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-navy-700 text-white rounded-lg p-1">
                          <button onClick={() => updateCartQty(product.id + '-w', wholesaleQty - 1)} className="p-1.5 rounded hover:bg-navy-600"><Minus size={14} /></button>
                          <span className="font-bold text-sm">Gros: {wholesaleQty}</span>
                          <button onClick={() => updateCartQty(product.id + '-w', wholesaleQty + 1)} className="p-1.5 rounded hover:bg-navy-600"><Plus size={14} /></button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeDeals.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Tag size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucune offre pour le moment</p>
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
        <PromoCheckoutModal
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

function PromoCheckoutModal({
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
              <LocationPicker address={address} onAddressChange={onAddressChange} coords={coords} onCoordsChange={onCoordsChange} commune={commune} />
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
