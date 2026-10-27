import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, Lock,
  Smartphone, CreditCard, Wallet, Receipt, X,
} from 'lucide-react';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/data';
import type { PaymentMethod, PaymentStatus } from '@/types';

const paymentMethodIcons: Record<string, typeof Smartphone> = {
  wave: Wallet,
  orange_money: Smartphone,
  mtn_momo: Smartphone,
  moov_money: Smartphone,
  visa: CreditCard,
  mastercard: CreditCard,
};

const paymentMethodColors: Record<string, string> = {
  wave: 'bg-blue-50 text-blue-600',
  orange_money: 'bg-orange-50 text-orange-600',
  mtn_momo: 'bg-yellow-50 text-yellow-600',
  moov_money: 'bg-blue-50 text-blue-600',
  visa: 'bg-navy-50 text-navy-600',
  mastercard: 'bg-red-50 text-red-600',
};

export function CheckoutPage() {
  const { cart, user, placeOrder, setPage, clearCart } = useApp();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'result'>('review');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const serviceFee = cart.length > 0 ? 500 : 0;
  const deliveryFee = cart.length > 0 ? 1000 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id, name, provider, channel, logo_url, display_order, is_enabled, supports_subscription, supports_order')
        .eq('is_enabled', true)
        .eq('supports_order', true)
        .order('display_order');

      if (error) throw error;

      const methods: PaymentMethod[] = (data || []).map((m: Record<string, unknown>) => ({
        id: m.id as string,
        name: m.name as string,
        provider: m.provider as string,
        channel: m.channel as string | null,
        logoUrl: m.logo_url as string | null,
        displayOrder: m.display_order as number,
        isEnabled: m.is_enabled as boolean,
        supportsSubscription: m.supports_subscription as boolean,
        supportsOrder: m.supports_order as boolean,
      }));
      setPaymentMethods(methods);
    } catch {
      // If DB isn't reachable, show empty state
      setPaymentMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handlePay = async () => {
    if (!selectedMethod || !user) return;
    setError('');
    setStep('processing');

    const transactionId = `CCI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setOrderReference(transactionId);

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount_fcfa: total,
          purpose: 'order',
          payment_method_id: selectedMethod,
          customer_name: user.name,
          customer_email: user.email || undefined,
          customer_phone: user.phone,
          return_url: window.location.href,
        }),
      });

      const data = await response.json();

      // Test mode — CinetPay not configured yet
      if (data.test_mode) {
        setTestMode(true);
        setPaymentStatus('pending');
        setPaymentMessage(
          'Les paiements en ligne ne sont pas encore activés. ' +
          'Le prestataire de paiement (CinetPay) doit être configuré par l\'administrateur. ' +
          'Aucun paiement réel n\'a été effectué.'
        );
        setStep('result');
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'initialisation du paiement');
        setStep('payment');
        return;
      }

      if (data.payment_url) {
        // Redirect to CinetPay payment page
        window.location.href = data.payment_url;
      } else {
        setError('URL de paiement manquante');
        setStep('payment');
      }
    } catch {
      setError('Erreur de connexion au serveur de paiement');
      setStep('payment');
    }
  };

  const handleConfirmOrder = () => {
    // In demo mode (test mode), still create the order with pending payment
    const order = {
      id: `o${Date.now()}`,
      number: orderReference || `CMD-2026-${Math.floor(Math.random() * 9999)}`,
      type: 'product' as const,
      status: 'received' as const,
      date: new Date().toISOString(),
      items: cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity, instructions: c.instructions })),
      productCost: subtotal,
      serviceFee,
      deliveryFee,
      total,
      deliveryAddress: user?.commune || 'Cocody',
      phone: user?.phone || '',
      commune: user?.commune || 'Cocody',
      customerName: user?.name || '',
      customerPhone: user?.phone || '',
    };
    placeOrder(order);
    clearCart();
    setPage('orders');
  };

  if (cart.length === 0 && step === 'review') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-navy-900 mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-6">Ajoutez des produits avant de passer commande.</p>
        <button onClick={() => setPage('marketplace')} className="btn-primary">
          Parcourir la marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setPage('marketplace')} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-navy-700" />
        </button>
        <h1 className="text-xl font-extrabold text-navy-900">Paiement de la commande</h1>
      </div>

      {/* Step: Review */}
      {step === 'review' && (
        <>
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-navy-900">Récapitulatif de la commande</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-navy-900 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400">Quantité: {item.quantity}{item.unit ? ` ${item.unit}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-navy-900">{formatFCFA(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total produits</span>
                <span className="font-semibold">{formatFCFA(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de service</span>
                <span className="font-semibold">{formatFCFA(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de livraison</span>
                <span className="font-semibold">{formatFCFA(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-navy-900 pt-2 border-t border-gray-100">
                <span className="font-bold">Total à payer</span>
                <span className="font-bold text-lg text-orange-600">{formatFCFA(total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('payment')}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Choisir le moyen de paiement
            <ArrowRight size={18} />
          </button>
        </>
      )}

      {/* Step: Payment method selection */}
      {step === 'payment' && (
        <>
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy-900">Choisissez votre moyen de paiement</h2>
              <span className="text-sm font-semibold text-orange-600">{formatFCFA(total)}</span>
            </div>

            {loadingMethods ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500 mb-2">
                  Aucun moyen de paiement n'est actuellement activé.
                </p>
                <p className="text-xs text-gray-400">
                  L'administrateur doit configurer le prestataire de paiement pour activer les paiements en ligne.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = paymentMethodIcons[method.id] || Smartphone;
                  const colorClass = paymentMethodColors[method.id] || 'bg-gray-50 text-gray-600';
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-sm text-navy-900">{method.name}</h3>
                        <p className="text-xs text-gray-400">Paiement sécurisé via {method.provider}</p>
                      </div>
                      {selectedMethod === method.id && (
                        <Check size={20} className="text-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              <Lock size={14} className="shrink-0" />
              <span>
                Vos informations de paiement sont traitées de manière sécurisée par notre prestataire.
                Nous ne demandons jamais votre code PIN Mobile Money.
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-error-50 border border-error-100 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-error-500 shrink-0" size={20} />
              <p className="text-sm text-error-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('review')} className="btn-ghost flex-1">
              Retour
            </button>
            <button
              onClick={handlePay}
              disabled={!selectedMethod}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Payer {formatFCFA(total)}
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="card p-8 text-center">
          <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={40} />
          <h2 className="text-lg font-bold text-navy-900 mb-2">Paiement en cours...</h2>
          <p className="text-sm text-gray-500">
            Nous initialisons votre paiement de manière sécurisée. Veuillez patienter.
          </p>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && (
        <div className="card p-8 text-center space-y-4">
          {testMode ? (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto">
                <AlertCircle className="text-yellow-500" size={32} />
              </div>
              <h2 className="text-lg font-bold text-navy-900">Paiement en mode test</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">{paymentMessage}</p>
              <div className="bg-yellow-50 rounded-xl p-4 text-left">
                <p className="text-xs text-yellow-700">
                  <strong>Référence:</strong> {orderReference}<br />
                  <strong>Montant:</strong> {formatFCFA(total)}<br />
                  <strong>Statut:</strong> En attente (mode test)
                </p>
              </div>
              <button onClick={handleConfirmOrder} className="btn-primary w-full">
                Confirmer la commande (démo)
              </button>
            </>
          ) : paymentStatus === 'succeeded' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                <Check className="text-success-600" size={32} />
              </div>
              <h2 className="text-lg font-bold text-navy-900">Paiement réussi</h2>
              <p className="text-sm text-gray-500">Votre commande a été confirmée.</p>
              <div className="bg-success-50 rounded-xl p-4 text-left">
                <p className="text-xs text-success-700">
                  <strong>Reçu N°:</strong> {orderReference}<br />
                  <strong>Montant payé:</strong> {formatFCFA(total)}
                </p>
              </div>
              <button onClick={handleConfirmOrder} className="btn-primary w-full">
                Voir ma commande
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mx-auto">
                <X className="text-error-500" size={32} />
              </div>
              <h2 className="text-lg font-bold text-navy-900">Paiement échoué</h2>
              <p className="text-sm text-gray-500">{paymentMessage || 'Le paiement n\'a pas pu aboutir.'}</p>
              <button onClick={() => setStep('payment')} className="btn-primary w-full">
                Réessayer
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
