import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Store, Image, Package, CreditCard,
  Eye, Loader2, AlertCircle, MapPin, Phone, FileText, Tag,
} from 'lucide-react';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { COMMUNES, formatFCFA, productCategories } from '@/data';
import type { SubscriptionPlan } from '@/types';

const steps = ['Profil', 'Photos', 'Produits', 'Abonnement', 'Prévisualisation', 'Publication'];

interface ShopForm {
  shopName: string;
  businessType: string;
  description: string;
  address: string;
  commune: string;
  whatsappNumber: string;
  contactPhone: string;
  openingHours: string;
}

export function MerchantSetupPage() {
  const { setPage, user } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  const [form, setForm] = useState<ShopForm>({
    shopName: '',
    businessType: productCategories[0]?.name || '',
    description: '',
    address: '',
    commune: user?.commune || 'Cocody',
    whatsappNumber: '',
    contactPhone: user?.phone || '',
    openingHours: '',
  });

  const [products, setProducts] = useState<{ name: string; price: number; stock: number; category: string; unit: string }[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, plan_type, price_fcfa, duration_hours, includes_delivery, description, is_active')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      const mapped: SubscriptionPlan[] = (data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        planType: p.plan_type as 'daily' | 'monthly',
        priceFcfa: p.price_fcfa as number,
        durationHours: p.duration_hours as number,
        includesDelivery: p.includes_delivery as boolean,
        description: p.description as string | null,
        isActive: p.is_active as boolean,
      }));
      setPlans(mapped);
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const update = (key: keyof ShopForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const validateStep = (): boolean => {
    setError('');
    switch (stepIndex) {
      case 0:
        if (!form.shopName.trim()) { setError('Le nom du commerce est requis'); return false; }
        if (!form.address.trim()) { setError('L\'adresse est requise'); return false; }
        if (!form.contactPhone.trim()) { setError('Le téléphone est requis'); return false; }
        return true;
      case 3:
        if (!selectedPlan) { setError('Choisissez un abonnement'); return false; }
        if (!acceptedTerms) { setError('Vous devez accepter les conditions'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handlePublish = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { data, error: insertErr } = await supabase
        .from('shops')
        .insert({
          shop_name: form.shopName,
          business_type: form.businessType,
          description: form.description || null,
          address: form.address,
          commune: form.commune,
          whatsapp_number: form.whatsappNumber || null,
          contact_phone: form.contactPhone,
          opening_hours: form.openingHours || null,
          is_approved: false,
          is_active: false,
        })
        .select('id')
        .single();

      if (insertErr) throw insertErr;

      if (data) {
        setShopId(data.id);
        // Create a pending subscription
        const plan = plans.find((p) => p.id === selectedPlan);
        if (plan) {
          await supabase.from('merchant_subscriptions').insert({
            shop_id: data.id,
            plan_id: plan.id,
            amount_fcfa: plan.priceFcfa,
            payment_status: 'pending',
          });
        }
      }

      setPublished(true);
    } catch {
      setError('Erreur lors de la création de la boutique. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto">
            <Store size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-lg font-bold text-navy-900">Boutique créée — en attente d'approbation</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Votre boutique a été enregistrée. Elle sera visible par les clients après:
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs">1</div>
              <span className="text-gray-600">Approbation par l'administration</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs">2</div>
              <span className="text-gray-600">Paiement de l'abonnement (après configuration du prestataire)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs">3</div>
              <span className="text-gray-600">Activation de la boutique</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Aucun paiement réel n'a été effectué. Le paiement sera requis une fois le prestataire configuré.
          </p>
          <button onClick={() => setPage('merchant-home')} className="btn-primary w-full">
            Retour à mon espace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setPage('merchant-home')} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-navy-700" />
        </button>
        <h1 className="text-xl font-extrabold text-navy-900">Créer ma boutique</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-navy-900' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i < stepIndex ? 'bg-success-500 text-white' :
                i === stepIndex ? 'bg-navy-800 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i < stepIndex ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-success-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error-50 border border-error-100 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-error-500 shrink-0" size={20} />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Step 0: Profil */}
      {stepIndex === 0 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Store size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Profil professionnel</h2>
          </div>
          <div>
            <label className="label-text">Nom du commerce *</label>
            <input className="input-field" placeholder="Ex: Boutique Yopougon" value={form.shopName} onChange={(e) => update('shopName', e.target.value)} />
          </div>
          <div>
            <label className="label-text">Catégorie</label>
            <select className="input-field" value={form.businessType} onChange={(e) => update('businessType', e.target.value)}>
              {productCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field min-h-20" placeholder="Décrivez votre commerce" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Commune *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select className="input-field pl-9" value={form.commune} onChange={(e) => update('commune', e.target.value)}>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-text">Adresse *</label>
              <input className="input-field" placeholder="Rue, quartier" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input-field pl-9" placeholder="+225 07 ..." value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-text">WhatsApp</label>
              <input className="input-field" placeholder="+225 05 ..." value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-text">Horaires d'ouverture</label>
            <input className="input-field" placeholder="Ex: 7h - 21h" value={form.openingHours} onChange={(e) => update('openingHours', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 1: Photos */}
      {stepIndex === 1 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Image size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Photos de la boutique</h2>
          </div>
          {['Logo', 'Photo de couverture', 'Photos de la boutique (jusqu\'à 5)'].map((label) => (
            <div key={label} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
              <Image size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <button className="btn-outline mt-3 text-sm" disabled>
                <Image size={14} /> Téléverser (bientôt disponible)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Products */}
      {stepIndex === 2 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Vos produits</h2>
          </div>
          <p className="text-sm text-gray-500">Ajoutez vos produits avec leurs prix, stocks et catégories.</p>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun produit ajouté pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Tag size={18} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-navy-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category} · {p.unit}</p>
                  </div>
                  <span className="font-bold text-sm">{formatFCFA(p.price)}</span>
                  <span className="text-xs text-gray-400">Stock: {p.stock}</span>
                </div>
              ))}
            </div>
          )}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-navy-900">Ajouter un produit</p>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-field text-sm" placeholder="Nom du produit" id="new-product-name" />
              <select className="input-field text-sm" id="new-product-category">
                {productCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className="input-field text-sm" type="number" placeholder="Prix FCFA" id="new-product-price" />
              <input className="input-field text-sm" type="number" placeholder="Stock" id="new-product-stock" />
              <input className="input-field text-sm" placeholder="Unité (pièce, kg...)" id="new-product-unit" />
            </div>
            <button
              className="btn-outline text-sm w-full"
              onClick={() => {
                const name = (document.getElementById('new-product-name') as HTMLInputElement)?.value;
                const category = (document.getElementById('new-product-category') as HTMLSelectElement)?.value;
                const price = Number((document.getElementById('new-product-price') as HTMLInputElement)?.value);
                const stock = Number((document.getElementById('new-product-stock') as HTMLInputElement)?.value);
                const unit = (document.getElementById('new-product-unit') as HTMLInputElement)?.value || 'pièce';
                if (name && price > 0) {
                  setProducts((p) => [...p, { name, price, stock: stock || 0, category, unit }]);
                  (document.getElementById('new-product-name') as HTMLInputElement).value = '';
                  (document.getElementById('new-product-price') as HTMLInputElement).value = '';
                  (document.getElementById('new-product-stock') as HTMLInputElement).value = '';
                }
              }}
            >
              + Ajouter ce produit
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Abonnement */}
      {stepIndex === 3 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Choisissez votre abonnement</h2>
          </div>
          {loadingPlans ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" size={24} />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun abonnement disponible. Contactez l'administration.</p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    selectedPlan === plan.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy-900">{plan.name}</h3>
                    {selectedPlan === plan.id && <Check size={20} className="text-orange-500" />}
                  </div>
                  <div className="text-2xl font-extrabold text-orange-600">{formatFCFA(plan.priceFcfa)}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    Durée: {plan.durationHours >= 720 ? '30 jours' : `${plan.durationHours}h`}
                  </p>
                  {plan.description && <p className="text-sm text-gray-500 mt-2">{plan.description}</p>}
                  <div className="mt-3 flex gap-2">
                    {plan.includesDelivery ? (
                      <span className="badge bg-success-100 text-success-700">Livraison Course CI incluse</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">Livraison non incluse</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedPlan && (
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 accent-orange-500"
              />
              <span className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation de Course CI. Mon paiement sera vérifié
                côté serveur. Ma boutique sera activée uniquement après confirmation du paiement
                et approbation de l'administration.
              </span>
            </label>
          )}
        </div>
      )}

      {/* Step 4: Prévisualisation */}
      {stepIndex === 4 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Prévisualisation de votre boutique</h2>
          </div>
          <div className="bg-gradient-to-br from-navy-900 to-navy-700 rounded-xl p-6 text-white">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-3">
              <Store size={28} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold">{form.shopName || 'Nom de la boutique'}</h3>
            <p className="text-sm text-navy-200">{form.businessType} · {form.commune}</p>
            {form.openingHours && <p className="text-xs text-navy-300 mt-1">{form.openingHours}</p>}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Adresse</span><span className="font-semibold">{form.address || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-semibold">{form.contactPhone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Produits</span><span className="font-semibold">{products.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Abonnement</span><span className="font-semibold">{plans.find((p) => p.id === selectedPlan)?.name || '—'}</span></div>
          </div>
          {form.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600">{form.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Publication */}
      {stepIndex === 5 && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} className="text-orange-500" />
            <h2 className="font-bold text-navy-900">Publication</h2>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Votre boutique sera en attente d'approbation après création.
              Le paiement de l'abonnement sera requis une fois le prestataire de paiement configuré.
              Aucun paiement réel ne sera effectué maintenant.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-success-600" /> Profil renseigné
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-success-600" /> {products.length} produit(s) ajouté(s)
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-success-600" /> Abonnement: {plans.find((p) => p.id === selectedPlan)?.name || '—'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-success-600" /> Conditions acceptées
            </div>
          </div>
          <button
            onClick={handlePublish}
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Publication...</> : <><Store size={18} /> Publier ma boutique</>}
          </button>
        </div>
      )}

      {stepIndex < 5 && (
        <div className="flex gap-3">
          <button onClick={handleBack} disabled={stepIndex === 0} className="btn-outline flex-1 disabled:opacity-50">
            Retour
          </button>
          <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Continuer <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
