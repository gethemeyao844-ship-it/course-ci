import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, Clock, CheckCircle, XCircle, Loader2,
  Receipt, Search, CreditCard,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/data';

interface TransactionRow {
  id: string;
  reference: string;
  purpose: string;
  amount_fcfa: number;
  status: string;
  provider_reference: string | null;
  failure_reason: string | null;
  created_at: string;
  payment_method_id: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  succeeded: { label: 'Réussi', color: 'bg-success-100 text-success-700', icon: CheckCircle },
  failed: { label: 'Échoué', color: 'bg-error-100 text-error-700', icon: XCircle },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  refunded: { label: 'Remboursé', color: 'bg-purple-100 text-purple-700', icon: Receipt },
};

const purposeLabels: Record<string, string> = {
  order: 'Commande',
  subscription: 'Abonnement',
  delivery_fee: 'Frais de livraison',
  promotion: 'Service promotionnel',
};

export function AdminPayments() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, reference, purpose, amount_fcfa, status, provider_reference, failure_reason, created_at, payment_method_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions((data || []) as TransactionRow[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(msg);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.reference.toLowerCase().includes(search.toLowerCase()) ||
      (tx.provider_reference || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSucceeded = transactions
    .filter((t) => t.status === 'succeeded')
    .reduce((s, t) => s + t.amount_fcfa, 0);
  const totalPending = transactions
    .filter((t) => t.status === 'pending' || t.status === 'processing')
    .reduce((s, t) => s + t.amount_fcfa, 0);
  const totalFailed = transactions.filter((t) => t.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900">Paiements et abonnements</h1>
        <p className="text-gray-500 text-sm">Consultez toutes les transactions de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-success-600" />
            <span className="text-xs text-gray-400">Revenus confirmés</span>
          </div>
          <div className="text-lg font-extrabold text-success-600">{formatFCFA(totalSucceeded)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-orange-500" />
            <span className="text-xs text-gray-400">En attente</span>
          </div>
          <div className="text-lg font-extrabold text-orange-600">{formatFCFA(totalPending)}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={18} className="text-error-500" />
            <span className="text-xs text-gray-400">Échecs</span>
          </div>
          <div className="text-lg font-extrabold text-error-600">{totalFailed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="input-field pl-10"
            placeholder="Rechercher par référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-40"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="succeeded">Réussis</option>
          <option value="pending">En attente</option>
          <option value="processing">En cours</option>
          <option value="failed">Échoués</option>
          <option value="cancelled">Annulés</option>
          <option value="refunded">Remboursés</option>
        </select>
      </div>

      {error && (
        <div className="card p-4 mb-4 bg-error-50 border border-error-100">
          <p className="text-sm text-error-700">
            Impossible de charger les transactions: {error}. La base de données sera accessible une fois l'authentification configurée.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Aucune transaction à afficher.</p>
          <p className="text-xs text-gray-300 mt-1">Les paiements apparaîtront ici une fois le prestataire configuré.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((tx, i) => {
            const status = statusConfig[tx.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div key={tx.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className={`w-10 h-10 rounded-xl ${status.color} flex items-center justify-center shrink-0`}>
                  <StatusIcon size={18} className={tx.status === 'processing' ? 'animate-spin' : ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm truncate">{tx.reference}</h3>
                  <p className="text-xs text-gray-400">
                    {purposeLabels[tx.purpose] || tx.purpose} ·{' '}
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {tx.failure_reason && <p className="text-xs text-error-500 mt-0.5">{tx.failure_reason}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-navy-900 text-sm">{formatFCFA(tx.amount_fcfa)}</div>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment methods info */}
      <div className="card p-5 mt-6">
        <h2 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
          <CreditCard size={18} className="text-orange-500" /> Moyens de paiement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'Wave', enabled: false },
            { name: 'Orange Money', enabled: false },
            { name: 'MTN MoMo', enabled: false },
            { name: 'Moov Money', enabled: false },
            { name: 'Carte Visa', enabled: false },
            { name: 'Mastercard', enabled: false },
          ].map((method) => (
            <div key={method.name} className={`p-3 rounded-xl border-2 ${method.enabled ? 'border-success-200 bg-success-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-navy-900">{method.name}</span>
                <span className={`badge ${method.enabled ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                  {method.enabled ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Les moyens de paiement seront activés une fois le prestataire CinetPay configuré par l'administrateur.
        </p>
      </div>
    </div>
  );
}
