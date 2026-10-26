import { Star, Package, TrendingUp, Calendar, Check } from 'lucide-react';
import { useApp } from '@/context';
import { driverHistory, orderTypeLabels, formatFCFA } from '@/data';

export function DriverHistory() {
  const { setPage } = useApp();

  const totalEarnings = driverHistory.reduce((s, o) => s + o.deliveryFee + o.serviceFee, 0);
  const totalDeliveries = driverHistory.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Historique des missions</h1>
      <p className="text-gray-500 mb-6">Vos livraisons passées et gains</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-navy-900">{totalDeliveries}</div>
          <div className="text-xs text-gray-400">Livraisons</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-orange-600">{formatFCFA(totalEarnings)}</div>
          <div className="text-xs text-gray-400">Gains</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold text-success-600 flex items-center justify-center gap-0.5">4.9 <Star size={14} className="fill-success-500" /></div>
          <div className="text-xs text-gray-400">Note moy.</div>
        </div>
      </div>

      {/* Weekly chart placeholder */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" /> Gains de la semaine</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
            const heights = [40, 60, 35, 80, 65, 95, 50];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${heights[i]}%` }} />
                <span className="text-xs text-gray-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="font-bold text-navy-900 mb-3">Missions livrées</h2>
      <div className="space-y-3">
        {driverHistory.map((order) => (
          <div key={order.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center shrink-0">
              <Check size={20} className="text-success-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm">{order.number}</h3>
              <p className="text-xs text-gray-400">
                {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {orderTypeLabels[order.type]} · {order.commune}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-orange-600 text-sm">{formatFCFA(order.deliveryFee + order.serviceFee)}</div>
              <span className="badge bg-success-50 text-success-700">Livré</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setPage('driver-home')} className="btn-ghost w-full mt-4">Retour à l'accueil</button>
    </div>
  );
}
