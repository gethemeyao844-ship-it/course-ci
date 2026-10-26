import { ArrowLeft, CreditCard, Wallet, Smartphone, Banknote, Check, Info } from 'lucide-react';
import { useApp } from '@/context';

export function PaymentsPage() {
  const { setPage } = useApp();

  const methods = [
    { id: 'cash', label: 'Paiement à la livraison', desc: 'Payez en espèces à la réception', icon: Banknote, available: true, active: true },
    { id: 'orange', label: 'Orange Money', desc: 'Paiement via Orange Money', icon: Smartphone, available: false, color: 'bg-orange-500' },
    { id: 'mtn', label: 'MTN MoMo', desc: 'Paiement via MTN Mobile Money', icon: Smartphone, available: false, color: 'bg-yellow-400' },
    { id: 'wave', label: 'Wave', desc: 'Paiement via Wave', icon: Wallet, available: false, color: 'bg-blue-500' },
  ];

  const transactions = [
    { id: 't1', ref: 'TRX-001428', order: 'CMD-2026-0142', amount: 10000, status: 'En attente', date: '26 Oct 2026' },
    { id: 't2', ref: 'TRX-001395', order: 'CMD-2026-0138', amount: 3000, status: 'Payé', date: '25 Oct 2026' },
    { id: 't3', ref: 'TRX-001380', order: 'CMD-2026-0130', amount: 11700, status: 'Payé', date: '24 Oct 2026' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('profile')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Profil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Moyens de paiement</h1>
      <p className="text-gray-500 mb-6">Gérez vos options de paiement</p>

      {/* Methods */}
      <h2 className="font-bold text-navy-900 mb-3">Méthodes disponibles</h2>
      <div className="space-y-3 mb-6">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className={`card p-4 flex items-center gap-3 ${!m.available ? 'opacity-60' : ''}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${m.available ? 'bg-navy-50' : (m.color || 'bg-gray-100')}`}>
                <Icon size={22} className={m.available ? 'text-navy-600' : 'text-white'} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-navy-900 text-sm">{m.label}</h3>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </div>
              {m.active && <span className="badge bg-success-50 text-success-700"><Check size={10} /> Actif</span>}
              {!m.available && <span className="badge bg-gray-100 text-gray-500">Bientôt</span>}
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      <h2 className="font-bold text-navy-900 mb-3">Historique des transactions</h2>
      <div className="card overflow-hidden">
        {transactions.map((t, i) => (
          <div key={t.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm">{t.order}</h3>
              <p className="text-xs text-gray-400">{t.ref} · {t.date}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-navy-900 text-sm">{new Intl.NumberFormat('fr-FR').format(t.amount)} FCFA</div>
              <span className={`badge ${t.status === 'Payé' ? 'bg-success-50 text-success-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 mt-4 bg-navy-50/50 flex items-start gap-3">
        <Info size={18} className="text-navy-600 shrink-0 mt-0.5" />
        <p className="text-sm text-navy-700">
          Les paiements Mobile Money seront disponibles une fois le prestataire intégré.
          Aucun code secret n'est stocké dans l'application.
        </p>
      </div>
    </div>
  );
}
