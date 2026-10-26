import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useApp } from '@/context';
import { formatFCFA } from '@/data';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, updateCartQty, removeFromCart, setPage } = useApp();

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const serviceFee = cart.length > 0 ? 500 : 0;
  const deliveryFee = cart.length > 0 ? 1000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const goToCheckout = () => {
    onClose();
    setPage('products');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-float transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-500" />
            <h2 className="text-lg font-bold text-navy-900">Mon panier</h2>
            {cart.length > 0 && (
              <span className="badge bg-orange-100 text-orange-700">{cart.length} article{cart.length > 1 ? 's' : ''}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Votre panier est vide</p>
              <p className="text-sm mt-1">Ajoutez des produits pour commander</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-navy-900 truncate">{item.name}</h3>
                    {item.unit && <p className="text-xs text-gray-400">{item.unit}</p>}
                    <p className="text-sm font-bold text-orange-600 mt-1">{formatFCFA(item.price)}</p>
                    {item.instructions && <p className="text-xs text-gray-500 mt-1 italic">"{item.instructions}"</p>}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-error-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                        className="p-1 rounded hover:bg-gray-100 text-navy-700"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="p-1 rounded hover:bg-gray-100 text-navy-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de service</span>
                <span className="font-semibold">{formatFCFA(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span className="font-semibold">{formatFCFA(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-navy-900 pt-2 border-t border-gray-100">
                <span className="font-bold">Total estimé</span>
                <span className="font-bold text-lg text-orange-600">{formatFCFA(total)}</span>
              </div>
            </div>
            <button onClick={goToCheckout} className="btn-primary w-full flex items-center justify-center gap-2">
              Voir le panier et commander
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
