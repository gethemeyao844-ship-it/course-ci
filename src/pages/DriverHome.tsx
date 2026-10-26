import { useState } from 'react';
import {
  Bike, Power, MapPin, Navigation, Check, X, Clock, Phone,
  Package, ShoppingBag, UtensilsCrossed, ChevronRight, Star,
} from 'lucide-react';
import { useApp } from '@/context';
import { driverOrders, statusLabels, orderTypeLabels, formatFCFA } from '@/data';
import type { Order } from '@/types';

export function DriverHome() {
  const { setPage, setSelectedDriverOrderId } = useApp();
  const [available, setAvailable] = useState(true);
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState(driverOrders.filter((o) => o.status === 'awaiting_driver'));
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const acceptOrder = (order: Order) => {
    if (acceptedIds.has(order.id)) return;
    setAcceptedIds((prev) => new Set(prev).add(order.id));
    setAssignedOrder({ ...order, status: 'driver_assigned', driverName: 'Ibrahim Traoré' });
    setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  const refuseOrder = (orderId: string) => {
    setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const startDelivery = () => {
    if (assignedOrder) setAssignedOrder({ ...assignedOrder, status: 'en_route' });
  };

  const confirmDelivery = () => {
    if (assignedOrder) {
      setAssignedOrder({ ...assignedOrder, status: 'delivered' });
      setTimeout(() => {
        setAssignedOrder(null);
      }, 2000);
    }
  };

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  // Assigned order detail view
  if (assignedOrder) {
    const status = statusLabels[assignedOrder.status];
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
        <div className="card p-5 mb-4 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold">{assignedOrder.number}</h1>
              <p className="text-navy-200 text-sm">{orderTypeLabels[assignedOrder.type]} · {assignedOrder.customerName}</p>
            </div>
            <span className="badge bg-orange-500 text-white text-sm px-3 py-1">{status.label}</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-400">{formatFCFA(assignedOrder.deliveryFee + assignedOrder.serviceFee)}</div>
          <p className="text-xs text-navy-200 mt-0.5">Vos gains pour cette mission</p>
        </div>

        <div className="card p-5 mb-4 space-y-4">
          {assignedOrder.pickupAddress && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Package size={20} className="text-navy-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">Récupération</h3>
                <p className="text-sm font-semibold text-navy-900">{assignedOrder.pickupAddress}</p>
                <button onClick={() => openMaps(assignedOrder.pickupAddress!)} className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                  <Navigation size={12} /> Ouvrir l'itinéraire
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Livraison</h3>
              <p className="text-sm font-semibold text-navy-900">{assignedOrder.deliveryAddress}</p>
              <p className="text-xs text-gray-400">{assignedOrder.commune}</p>
              <button onClick={() => openMaps(assignedOrder.deliveryAddress)} className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                <Navigation size={12} /> Ouvrir l'itinéraire
              </button>
            </div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <h3 className="font-bold text-navy-900 mb-3">Détails de la mission</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-semibold text-navy-800">{assignedOrder.customerName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><a href={`tel:${assignedOrder.customerPhone}`} className="font-semibold text-orange-600">{assignedOrder.customerPhone}</a></div>
            <div className="flex justify-between"><span className="text-gray-500">Articles</span><span className="font-semibold text-navy-800">{assignedOrder.items.length} article{assignedOrder.items.length > 1 ? 's' : ''}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total commande</span><span className="font-semibold text-navy-800">{formatFCFA(assignedOrder.total)}</span></div>
          </div>
          {assignedOrder.instructions && (
            <div className="mt-3 p-3 bg-orange-50 rounded-xl text-sm text-orange-700">
              <span className="font-semibold">Instructions: </span>{assignedOrder.instructions}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {assignedOrder.status === 'driver_assigned' && (
            <button onClick={startDelivery} className="btn-primary w-full flex items-center justify-center gap-2">
              <Bike size={20} /> Démarrer la livraison
            </button>
          )}
          {assignedOrder.status === 'en_route' && (
            <button onClick={confirmDelivery} className="btn-primary w-full flex items-center justify-center gap-2 bg-success-500 hover:bg-success-600">
              <Check size={20} /> Confirmer la livraison
            </button>
          )}
          {assignedOrder.status === 'delivered' && (
            <div className="card p-4 bg-success-50 text-center text-success-700 font-bold flex items-center justify-center gap-2">
              <Check size={20} /> Livraison confirmée !
            </div>
          )}
          <a href={`tel:${assignedOrder.customerPhone}`} className="btn-outline w-full flex items-center justify-center gap-2">
            <Phone size={18} /> Appeler le client
          </a>
        </div>
      </div>
    );
  }

  // Default: available orders list
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      {/* Status toggle */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${available ? 'bg-success-50' : 'bg-gray-100'}`}>
            <Power size={24} className={available ? 'text-success-600' : 'text-gray-400'} />
          </div>
          <div>
            <h2 className="font-bold text-navy-900 text-sm">Statut</h2>
            <p className={`text-xs font-semibold ${available ? 'text-success-600' : 'text-gray-400'}`}>
              {available ? 'Disponible' : 'Hors ligne'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAvailable(!available)}
          className={`w-12 h-6 rounded-full transition-colors relative ${available ? 'bg-success-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${available ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-navy-900">12</div>
          <div className="text-xs text-gray-400">Missions</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-orange-600">18 500</div>
          <div className="text-xs text-gray-400">FCFA / jour</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-success-600 flex items-center justify-center gap-0.5">4.9 <Star size={14} className="fill-success-500" /></div>
          <div className="text-xs text-gray-400">Note</div>
        </div>
      </div>

      <h2 className="font-bold text-navy-900 mb-3">Commandes disponibles</h2>

      {!available ? (
        <div className="card p-8 text-center text-gray-400">
          <Bike size={40} className="mx-auto mb-3 opacity-30" />
          <p>Vous êtes hors ligne. Activez votre disponibilité pour recevoir des missions.</p>
        </div>
      ) : availableOrders.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune commande disponible pour le moment</p>
          <p className="text-xs mt-1">De nouvelles missions apparaîtront bientôt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableOrders.map((order) => {
            const typeIcon = order.type === 'errand' ? ShoppingBag : order.type === 'restaurant' ? UtensilsCrossed : Package;
            const Icon = typeIcon;
            return (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                      <Icon size={20} className="text-navy-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-sm">{order.number}</h3>
                      <span className="text-xs text-gray-400">{orderTypeLabels[order.type]} · {order.commune}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{formatFCFA(order.deliveryFee + order.serviceFee)}</div>
                    <span className="text-xs text-gray-400">Vos gains</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex gap-2 text-gray-600"><MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" /> {order.pickupAddress || 'À récupérer'}</div>
                  <div className="flex gap-2 text-gray-600"><Navigation size={14} className="text-orange-500 shrink-0 mt-0.5" /> {order.deliveryAddress}</div>
                </div>
                {order.instructions && (
                  <div className="p-2 bg-orange-50 rounded-lg text-xs text-orange-700 mb-3">{order.instructions}</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => acceptOrder(order)} disabled={acceptedIds.has(order.id)} className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm">
                    <Check size={16} /> Accepter
                  </button>
                  <button onClick={() => refuseOrder(order.id)} className="btn-outline flex items-center justify-center gap-1 px-4 text-sm">
                    <X size={16} /> Refuser
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => setPage('driver-history')} className="btn-ghost w-full mt-4 flex items-center justify-center gap-1">
        Voir l'historique <ChevronRight size={16} />
      </button>
    </div>
  );
}
