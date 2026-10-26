import { useState } from 'react';
import { Package, Clock, Check, X, MapPin, Phone, ChevronRight } from 'lucide-react';
import { useApp } from '@/context';
import { merchantOrders, statusLabels, orderTypeLabels, formatFCFA } from '@/data';

export function MerchantOrders() {
  const { setPage } = useApp();
  const [orders, setOrders] = useState(merchantOrders);
  const [filter, setFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'preparing', label: 'En préparation' },
    { value: 'delivered', label: 'Livrées' },
  ];

  let filtered = orders;
  if (filter === 'pending') filtered = filtered.filter((o) => o.status === 'received' || o.status === 'awaiting_driver');
  if (filter === 'preparing') filtered = filtered.filter((o) => o.status === 'driver_assigned' || o.status === 'shopping');
  if (filter === 'delivered') filtered = filtered.filter((o) => o.status === 'delivered' || o.status === 'en_route');

  const updateStatus = (id: string, status: typeof orders[0]['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Commandes reçues</h1>
      <p className="text-gray-500 mb-6">Gérez les commandes de vos clients</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f.value ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = statusLabels[order.status];
            return (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                      <Package size={20} className="text-navy-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{order.number}</h3>
                      <p className="text-xs text-gray-400">{order.customerName} · {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>

                <div className="space-y-1 text-sm mb-3 pl-12">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-600">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">{formatFCFA(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {order.deliveryAddress}</span>
                  <span className="flex items-center gap-1"><Phone size={12} /> {order.customerPhone}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="font-bold text-navy-900">{formatFCFA(order.productCost)}</span>
                  <div className="flex gap-2">
                    {(order.status === 'received' || order.status === 'awaiting_driver') && (
                      <button
                        onClick={() => updateStatus(order.id, 'shopping')}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1"
                      >
                        <Clock size={14} /> Accepter
                      </button>
                    )}
                    {order.status === 'shopping' && (
                      <button
                        onClick={() => updateStatus(order.id, 'en_route')}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1 bg-success-500 hover:bg-success-600"
                      >
                        <Check size={14} /> Prêt
                      </button>
                    )}
                    {order.status === 'en_route' && (
                      <span className="text-sm text-orange-600 font-semibold flex items-center gap-1">
                        <Clock size={14} /> En livraison
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-sm text-success-600 font-semibold flex items-center gap-1">
                        <Check size={14} /> Livré
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
