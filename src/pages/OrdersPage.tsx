import { useState } from 'react';
import { ArrowLeft, Package, Search, ChevronRight, Filter } from 'lucide-react';
import { useApp } from '@/context';
import { statusLabels, orderTypeLabels, formatFCFA } from '@/data';

export function OrdersPage() {
  const { setPage, orders, setSelectedOrderId } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filters = [
    { value: 'all', label: 'Toutes' },
    { value: 'active', label: 'En cours' },
    { value: 'delivered', label: 'Livrées' },
    { value: 'cancelled', label: 'Annulées' },
  ];

  let filtered = orders;
  if (filter === 'active') filtered = filtered.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  if (filter === 'delivered') filtered = filtered.filter((o) => o.status === 'delivered');
  if (filter === 'cancelled') filtered = filtered.filter((o) => o.status === 'cancelled');
  if (search.trim()) filtered = filtered.filter((o) => o.number.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Mes commandes</h1>
      <p className="text-gray-500 mb-6">Suivez l'état de toutes vos commandes</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input className="input-field pl-10" placeholder="Rechercher par numéro..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
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

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-navy-900 text-sm">{order.number}</span>
                    <span className="badge bg-navy-50 text-navy-600">{orderTypeLabels[order.type]}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} article{order.items.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="font-bold text-navy-900">{formatFCFA(order.total)}</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
