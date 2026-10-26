import { useState } from 'react';
import {
  Bike, Power, MapPin, Navigation, Check, X, Phone,
  Package, ShoppingBag, UtensilsCrossed, ChevronRight, Star,
  AlertCircle, Loader2,
} from 'lucide-react';
import { useApp } from '@/context';
import { driverOrders, statusLabels, orderTypeLabels, formatFCFA } from '@/data';
import { DriverMap } from '@/components/DriverMap';
import type { GeoCoords } from '@/hooks/useGeolocation';
import type { Order } from '@/types';

export function DriverHome() {
  const { setPage, user } = useApp();
  const [available, setAvailable] = useState(true);
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState(driverOrders.filter((o) => o.status === 'awaiting_driver'));
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);

  const acceptOrder = (order: Order) => {
    if (acceptedIds.has(order.id) || actionLoading) return;
    setActionLoading(true);
    setAcceptedIds((prev) => new Set(prev).add(order.id));
    setAssignedOrder({ ...order, status: 'driver_assigned', driverName: user?.name || 'Ibrahim Traoré' });
    setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id));
    setActionLoading(false);
  };

  const refuseOrder = (orderId: string) => {
    setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const startDelivery = () => {
    if (!assignedOrder || actionLoading) return;
    if (assignedOrder.status !== 'driver_assigned') return;
    setActionLoading(true);
    setAssignedOrder({ ...assignedOrder, status: 'en_route' });
    setActionLoading(false);
  };

  const requestConfirmDelivery = () => {
    if (!assignedOrder || assignedOrder.status !== 'en_route') return;
    setShowConfirmDelivery(true);
  };

  const confirmDelivery = () => {
    if (!assignedOrder || assignedOrder.status !== 'en_route' || actionLoading) return;
    setActionLoading(true);
    setAssignedOrder({
      ...assignedOrder,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
    });
    setShowConfirmDelivery(false);
    setActionLoading(false);
    setTimeout(() => {
      setAssignedOrder(null);
    }, 2500);
  };

  const cancelConfirmDelivery = () => {
    setShowConfirmDelivery(false);
  };

  const openMaps = (address: string) => {
    if (!address.trim()) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
  };

  const hasPhone = assignedOrder?.customerPhone && assignedOrder.customerPhone.trim();

  // Assigned order detail view
  if (assignedOrder) {
    const status = statusLabels[assignedOrder.status];
    const deliveryCoords: GeoCoords | null =
      typeof assignedOrder.deliveryLat === 'number' && typeof assignedOrder.deliveryLng === 'number' &&
      !Number.isNaN(assignedOrder.deliveryLat) && !Number.isNaN(assignedOrder.deliveryLng) &&
      assignedOrder.deliveryLat >= -90 && assignedOrder.deliveryLat <= 90 &&
      assignedOrder.deliveryLng >= -180 && assignedOrder.deliveryLng <= 180
        ? { lat: assignedOrder.deliveryLat, lng: assignedOrder.deliveryLng }
        : null;

    const hasAddress = assignedOrder.deliveryAddress && assignedOrder.deliveryAddress.trim();

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
        {/* Order header */}
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

        {/* Pickup address */}
        {assignedOrder.pickupAddress && (
          <div className="card p-5 mb-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Package size={20} className="text-navy-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">Récupération</h3>
                <p className="text-sm font-semibold text-navy-900">{assignedOrder.pickupAddress}</p>
                <button onClick={() => openMaps(assignedOrder.pickupAddress!)} className="text-xs text-orange-600 font-semibold mt-1 flex items-center gap-1">
                  <Navigation size={12} /> Ouvrir dans Google Maps
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive driver map with navigation */}
        <div className="mb-4">
          <DriverMap
            deliveryAddress={assignedOrder.deliveryAddress}
            deliveryCoords={deliveryCoords}
            commune={assignedOrder.commune}
          />
        </div>

        {/* Missing address warning */}
        {!hasAddress && !deliveryCoords && (
          <div className="card p-4 mb-4 bg-error-50 border border-error-200">
            <div className="flex items-start gap-2 text-sm text-error-600">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Adresse de livraison manquante</p>
                <p className="text-xs mt-1">Le client n'a fourni ni adresse ni coordonnées GPS. Contactez-le par téléphone pour obtenir l'adresse exacte.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mission details */}
        <div className="card p-5 mb-4">
          <h3 className="font-bold text-navy-900 mb-3">Détails de la mission</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="font-semibold text-navy-800">{assignedOrder.customerName}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone</span>
              {hasPhone ? (
                <a href={`tel:${assignedOrder.customerPhone}`} className="font-semibold text-orange-600">{assignedOrder.customerPhone}</a>
              ) : (
                <span className="text-gray-400 italic">Non renseigné</span>
              )}
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Articles</span><span className="font-semibold text-navy-800">{assignedOrder.items.length} article{assignedOrder.items.length > 1 ? 's' : ''}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total commande</span><span className="font-semibold text-navy-800">{formatFCFA(assignedOrder.total)}</span></div>
          </div>
          {assignedOrder.instructions && (
            <div className="mt-3 p-3 bg-orange-50 rounded-xl text-sm text-orange-700">
              <span className="font-semibold">Instructions: </span>{assignedOrder.instructions}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {assignedOrder.status === 'driver_assigned' && (
            <button
              onClick={startDelivery}
              disabled={actionLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {actionLoading ? <><Loader2 size={20} className="animate-spin" /> Traitement...</> : <><Bike size={20} /> Démarrer la livraison</>}
            </button>
          )}
          {assignedOrder.status === 'en_route' && (
            <button
              onClick={requestConfirmDelivery}
              disabled={actionLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-success-500 hover:bg-success-600 disabled:opacity-60"
            >
              <Check size={20} /> Confirmer la livraison
            </button>
          )}
          {assignedOrder.status === 'delivered' && (
            <div className="card p-4 bg-success-50 text-center text-success-700 font-bold flex items-center justify-center gap-2">
              <Check size={20} /> Livraison confirmée !
              {assignedOrder.deliveredAt && (
                <span className="text-xs font-normal text-success-600">
                  · {new Date(assignedOrder.deliveredAt).toLocaleString('fr-FR')}
                </span>
              )}
            </div>
          )}

          {/* Call client button - only if phone exists */}
          {hasPhone ? (
            <a href={`tel:${assignedOrder.customerPhone}`} className="btn-outline w-full flex items-center justify-center gap-2">
              <Phone size={18} /> Appeler le client
            </a>
          ) : (
            <div className="card p-3 text-center text-sm text-gray-400 bg-gray-50 flex items-center justify-center gap-2">
              <AlertCircle size={16} /> Numéro de téléphone non disponible
            </div>
          )}
        </div>

        {/* Explicit delivery confirmation dialog */}
        {showConfirmDelivery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={cancelConfirmDelivery} />
            <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
              <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-success-600" />
              </div>
              <h3 className="text-lg font-extrabold text-navy-900 text-center mb-1">Confirmer la livraison ?</h3>
              <p className="text-sm text-gray-500 text-center mb-5">
                Avez-vous bien remis la commande <strong>{assignedOrder.number}</strong> à <strong>{assignedOrder.customerName}</strong> ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={cancelConfirmDelivery} className="btn-outline flex-1">Annuler</button>
                <button
                  onClick={confirmDelivery}
                  disabled={actionLoading}
                  className="btn-primary flex-1 bg-success-500 hover:bg-success-600 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Confirmer</>}
                </button>
              </div>
            </div>
          </div>
        )}
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
                  <button
                    onClick={() => acceptOrder(order)}
                    disabled={acceptedIds.has(order.id) || actionLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm disabled:opacity-60"
                  >
                    {acceptedIds.has(order.id) ? <Check size={16} /> : <><Check size={16} /> Accepter</>}
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
