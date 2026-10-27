import { useState, useEffect } from 'react';
import { ArrowLeft, Receipt, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/data';
import type { Transaction, PaymentStatus } from '@/types';

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: typeof Clock }> = {
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

export function PaymentHistoryPage() {
  const { setPage } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, reference, payment_method_id, purpose, purpose_id, amount_fcfa, status, provider_reference, failure_reason, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const txs: Transaction[] = (data || []).map((t: Record<string, unknown>) => ({
        id: t.id as string,
        reference: t.reference as string,
        paymentMethodId: t.payment_method_id as string | null,
        purpose: t.purpose as Transaction['purpose'],
        purposeId: t.purpose_id as string | null,
        amountFcfa: t.amount_fcfa as number,
        status: t.status as PaymentStatus,
        providerReference: t.provider_reference as string | null,
        failureReason: t.failure_reason as string | null,
        createdAt: t.created_at as string,
        updatedAt: t.updated_at as string,
      }));
      setTransactions(txs);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setPage('home')} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-navy-700" />
        </button>
        <h1 className="text-xl font-extrabold text-navy-900">Historique des paiements</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Aucun paiement pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const status = statusConfig[tx.status];
            const StatusIcon = status.icon;
            return (
              <div key={tx.id} className="card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${status.color} flex items-center justify-center shrink-0`}>
                  <StatusIcon size={22} className={tx.status === 'processing' ? 'animate-spin' : ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-900">{tx.reference}</span>
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {purposeLabels[tx.purpose] || tx.purpose} ·{' '}
                    {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {tx.failureReason && (
                    <p className="text-xs text-error-500 mt-1">{tx.failureReason}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-navy-900">{formatFCFA(tx.amountFcfa)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
