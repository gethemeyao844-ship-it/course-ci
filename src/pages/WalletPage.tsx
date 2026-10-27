import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, Clock, ArrowDownCircle, ArrowUpCircle,
  Loader2, Plus, Download, Receipt, AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/data';

interface WalletData {
  id: string;
  balance_fcfa: number;
  pending_fcfa: number;
}

interface TransactionRow {
  id: string;
  reference: string;
  type: string;
  amount_fcfa: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface WithdrawalRow {
  id: string;
  amount_fcfa: number;
  status: string;
  created_at: string;
  admin_response: string | null;
}

const typeLabels: Record<string, { label: string; icon: typeof TrendingUp; color: string }> = {
  deposit: { label: 'Dépôt', icon: ArrowDownCircle, color: 'text-success-600' },
  payment: { label: 'Paiement', icon: ArrowUpCircle, color: 'text-error-600' },
  refund: { label: 'Remboursement', icon: ArrowDownCircle, color: 'text-success-600' },
  earning: { label: 'Gain', icon: TrendingUp, color: 'text-success-600' },
  withdrawal: { label: 'Retrait', icon: ArrowUpCircle, color: 'text-orange-600' },
  subscription: { label: 'Abonnement', icon: ArrowUpCircle, color: 'text-error-600' },
  adjustment: { label: 'Ajustement', icon: Receipt, color: 'text-navy-600' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Terminé', color: 'bg-success-100 text-success-700' },
  failed: { label: 'Échoué', color: 'bg-error-100 text-error-700' },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
  approved: { label: 'Approuvé', color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Refusé', color: 'bg-error-100 text-error-700' },
  paid: { label: 'Payé', color: 'bg-success-100 text-success-700' },
};

export function WalletPage() {
  const { user, setPage } = useApp();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Wave');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const role = user?.role || 'client';
  const roleLabel = role === 'driver' ? 'Livreur' : role === 'merchant' ? 'Commerçant' : 'Client';

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: walletData, error: walletErr } = await supabase
        .from('wallets')
        .select('id, balance_fcfa, pending_fcfa')
        .maybeSingle();

      if (walletErr) throw walletErr;

      if (walletData) {
        const w = walletData as WalletData;
        setWallet(w);

        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('id, reference, type, amount_fcfa, status, description, created_at')
          .eq('wallet_id', w.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setTransactions((txData || []) as TransactionRow[]);

        const { data: wdData } = await supabase
          .from('withdrawal_requests')
          .select('id, amount_fcfa, status, created_at, admin_response')
          .order('created_at', { ascending: false })
          .limit(10);
        setWithdrawals((wdData || []) as WithdrawalRow[]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = () => {
    setShowDeposit(false);
    setActionMessage('Le dépôt nécessite un prestataire de paiement configuré. Aucun paiement réel n\'a été effectué.');
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      setError('Montant invalide');
      return;
    }
    if (amount > (wallet?.balance_fcfa || 0)) {
      setError('Solde insuffisant');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const { error: withdrawErr } = await supabase
        .from('withdrawal_requests')
        .insert({
          wallet_id: wallet?.id,
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          amount_fcfa: amount,
          payment_method: withdrawMethod,
          payment_details: withdrawDetails,
        });
      if (withdrawErr) throw withdrawErr;
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
      setActionMessage('Demande de retrait enregistrée. Elle sera traitée par l\'administration.');
      await fetchWalletData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la demande';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-orange-500" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold text-navy-900">Mon portefeuille</h1>
        <p className="text-gray-500 text-sm">Gérez votre solde et vos opérations financières</p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-100 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-error-500 shrink-0" size={20} />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {actionMessage && (
        <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
          <p className="text-sm text-navy-700">{actionMessage}</p>
        </div>
      )}

      {/* Balance card */}
      <div className="card p-6 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={22} className="text-orange-400" />
            <span className="text-sm font-semibold text-navy-200">Solde disponible</span>
          </div>
          <span className="badge bg-white/10 text-white">{roleLabel}</span>
        </div>
        <div className="text-4xl font-extrabold text-orange-400">
          {formatFCFA(wallet?.balance_fcfa || 0)}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-navy-200">
          <Clock size={14} />
          En attente: {formatFCFA(wallet?.pending_fcfa || 0)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowDeposit(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Approvisionner
        </button>
        {role !== 'client' && (
          <button
            onClick={() => setShowWithdraw(true)}
            className="btn-outline flex items-center justify-center gap-2"
          >
            <Download size={18} /> Retirer
          </button>
        )}
      </div>

      {/* Transactions */}
      <div>
        <h2 className="font-bold text-navy-900 mb-3">Historique des opérations</h2>
        {transactions.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Receipt size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune opération pour le moment</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {transactions.map((tx, i) => {
              const cfg = typeLabels[tx.type] || typeLabels.adjustment;
              const Icon = cfg.icon;
              const isPositive = tx.amount_fcfa > 0;
              const status = statusLabels[tx.status] || statusLabels.completed;
              return (
                <div key={tx.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 text-sm">{cfg.label}</h3>
                    <p className="text-xs text-gray-400 truncate">
                      {tx.reference} · {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {tx.description && <p className="text-xs text-gray-400 mt-0.5">{tx.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${isPositive ? 'text-success-600' : 'text-error-600'}`}>
                      {isPositive ? '+' : ''}{formatFCFA(tx.amount_fcfa)}
                    </div>
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal requests (driver/merchant) */}
      {role !== 'client' && withdrawals.length > 0 && (
        <div>
          <h2 className="font-bold text-navy-900 mb-3">Demandes de retrait</h2>
          <div className="card overflow-hidden">
            {withdrawals.map((wd, i) => {
              const status = statusLabels[wd.status] || statusLabels.pending;
              return (
                <div key={wd.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Download size={18} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy-900 text-sm">{formatFCFA(wd.amount_fcfa)}</div>
                    <p className="text-xs text-gray-400">
                      {new Date(wd.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    {wd.admin_response && <p className="text-xs text-gray-500 mt-0.5">{wd.admin_response}</p>}
                  </div>
                  <span className={`badge ${status.color} shrink-0`}>{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deposit modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeposit(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-4">
              <Plus size={28} className="text-navy-600" />
            </div>
            <h3 className="text-lg font-extrabold text-navy-900 text-center mb-2">Approvisionner le portefeuille</h3>
            <div className="bg-yellow-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-700 text-center">
                Paiement réel non encore configuré. Les moyens de paiement (Wave, Orange Money, MTN MoMo, Visa, Mastercard) seront disponibles une fois le prestataire connecté.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeposit(false)} className="btn-outline flex-1">Fermer</button>
              <button onClick={handleDeposit} className="btn-primary flex-1">Compris</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowWithdraw(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up space-y-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
              <Download size={28} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-extrabold text-navy-900 text-center">Demande de retrait</h3>
            <div>
              <label className="label-text">Montant (FCFA)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ex: 5000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Solde disponible: {formatFCFA(wallet?.balance_fcfa || 0)}</p>
            </div>
            <div>
              <label className="label-text">Moyen de retrait</label>
              <select className="input-field" value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}>
                <option value="Wave">Wave</option>
                <option value="Orange Money">Orange Money</option>
                <option value="MTN MoMo">MTN MoMo</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Virement bancaire">Virement bancaire</option>
              </select>
            </div>
            <div>
              <label className="label-text">Numéro / compte</label>
              <input
                className="input-field"
                placeholder="+225 07 ..."
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdraw(false)} className="btn-outline flex-1">Annuler</button>
              <button
                onClick={handleWithdraw}
                disabled={actionLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
