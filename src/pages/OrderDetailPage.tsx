import { ArrowLeft, MapPin, Phone, Clock, Package, User, Store, Navigation, MessageCircle, ChevronRight } from 'lucide-react';
import { useApp } from '@/context';
import { statusLabels, orderTypeLabels, formatFCFA } from '@/data';

export function OrderDetailPage() {
  const { setPage, orders, selectedOrderId } = useApp();
  const order = orders.find((o) => o.id === selectedOrderId);

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 mb-4">Commande introuvable</p>
        <button onClick={() => setPage('orders')} className="btn-primary">Retour aux commandes</button>
      </div>
    );
  }

  const status = statusLabels[order.status];
  const statusFlow = ['received', 'awaiting_driver', 'driver_assigned', 'shopping', 'en_route', 'delivered'];
  const currentStep = statusFlow.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('orders')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Mes commandes
      </button>

      {/* Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-navy-900">{order.number}</h1>
            <p className="text-sm text-gray-400">{new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <span className={`badge ${status.color} text-sm px-3 py-1`}>{status.label}</span>
        </div>
        <div className="flex gap-2">
          <span className="badge bg-navy-50 text-navy-600">{orderTypeLabels[order.type]}</span>
          {order.driverName && <span className="badge bg-orange-100 text-orange-700">Livreur: {order.driverName}</span>}
          {order.merchantName && <span className="badge bg-navy-50 text-navy-600">{order.merchantName}</span>}
        </div>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && order.status !== 'needs_assistance' && (
        <div className="card p-5 mb-4">
          <h2 className="font-bold text-navy-900 mb-4">Suivi de la livraison</h2>
          <div className="space-y-1">
            {statusFlow.map((s, i) => {
              const sLabel = statusLabels[s];
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      done ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-success-100' : ''}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < statusFlow.length - 1 && <div className={`w-0.5 h-6 ${i < currentStep ? 'bg-success-500' : 'bg-gray-100'}`} />}
                  </div>
                  <span className={`text-sm ${done ? 'font-semibold text-navy-900' : 'text-gray-400'}`}>{sLabel.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold text-navy-900 mb-3">Articles</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-semibold text-navy-800">{item.name}</span>
                <span className="text-gray-400"> x{item.quantity}</span>
                {item.instructions && <p className="text-xs text-gray-400 italic mt-0.5">{item.instructions}</p>}
              </div>
              <span className="font-semibold text-navy-700">{formatFCFA(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses */}
      <div className="card p-5 mb-4 space-y-3">
        {order.pickupAddress && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
              <Store size={20} className="text-navy-600" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Récupération</h3>
              <p className="text-sm font-semibold text-navy-900">{order.pickupAddress}</p>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Livraison</h3>
            <p className="text-sm font-semibold text-navy-900">{order.deliveryAddress}</p>
            <p className="text-xs text-gray-400">{order.commune}</p>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="card p-5 mb-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <User size={18} className="text-gray-400" />
          <span className="text-gray-500">Client:</span>
          <span className="font-semibold text-navy-800">{order.customerName}</span>
        </div>
        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-3 text-sm">
          <Phone size={18} className="text-gray-400" />
          <span className="text-gray-500">Téléphone:</span>
          <span className="font-semibold text-orange-600">{order.customerPhone}</span>
        </a>
        {order.timeSlot && (
          <div className="flex items-center gap-3 text-sm">
            <Clock size={18} className="text-gray-400" />
            <span className="text-gray-500">Créneau:</span>
            <span className="font-semibold text-navy-800">{order.timeSlot}</span>
          </div>
        )}
        {order.instructions && (
          <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
            <span className="font-semibold">Instructions: </span>{order.instructions}
          </div>
        )}
      </div>

      {/* Costs */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold text-navy-900 mb-3">Détail des montants</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Coût des produits</span><span className="font-semibold">{formatFCFA(order.productCost)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(order.serviceFee)}</span></div>
          <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(order.deliveryFee)}</span></div>
          <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(order.total)}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setPage('messages')} className="btn-outline flex items-center justify-center gap-2">
          <MessageCircle size={18} /> Contacter le support
        </button>
        {order.status === 'en_route' && order.driverName && (
          <button
            onClick={() => {
              const query = encodeURIComponent(order.deliveryAddress);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Navigation size={18} /> Suivre sur la carte
          </button>
        )}
      </div>
    </div>
  );
}
