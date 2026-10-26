import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Check, Camera, MapPin, Clock, Phone } from 'lucide-react';
import { useApp } from '@/context';
import { COMMUNES, formatFCFA } from '@/data';
import { LocationPicker } from '@/components/LocationPicker';
import type { GeoCoords } from '@/hooks/useGeolocation';
import type { ErrandItem, Order } from '@/types';

export function ErrandPage() {
  const { setPage, user, placeOrder } = useApp();
  const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');
  const [items, setItems] = useState<ErrandItem[]>([{ name: '', quantity: '', budget: 0 }]);
  const [form, setForm] = useState({
    errandName: '',
    market: "Marché d'Adjamé",
    instructions: '',
    pickupAddress: '',
    deliveryAddress: '',
    phone: user?.phone || '',
    timeSlot: "Aujourd'hui, 14h-16h",
    commune: user?.commune || 'Cocody',
  });
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const updateItem = (i: number, key: keyof ErrandItem, value: string | number) => {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  };
  const addItem = () => setItems((p) => [...p, { name: '', quantity: '', budget: 0 }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const estimatedProductCost = items.reduce((s, it) => s + (it.budget || 0), 0);
  const serviceFee = 500;
  const deliveryFee = 1000;
  const total = estimatedProductCost + serviceFee + deliveryFee;

  const validItems = items.filter((it) => it.name.trim());
  const isValid = form.errandName.trim() && form.deliveryAddress.trim() && form.phone.trim() && validItems.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    setStep('summary');
  };

  const confirmOrder = () => {
    const order: Order = {
      id: `o${Date.now()}`,
      number: `CMD-2026-${String(Math.floor(Math.random() * 900) + 200)}`,
      type: 'errand',
      status: 'received',
      date: new Date().toISOString(),
      items: validItems.map((it) => ({ name: it.name, price: it.budget, quantity: 1, instructions: it.quantity })),
      productCost: estimatedProductCost,
      serviceFee,
      deliveryFee,
      total,
      deliveryAddress: form.deliveryAddress,
      pickupAddress: form.market,
      phone: form.phone,
      commune: form.commune,
      customerName: user?.name || 'Client',
      customerPhone: form.phone,
      instructions: form.instructions,
      timeSlot: form.timeSlot,
      deliveryLat: coords?.lat,
      deliveryLng: coords?.lng,
    };
    placeOrder(order);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-success-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Course envoyée !</h1>
        <p className="text-gray-500 mb-6">Votre demande de course a été enregistrée. Un livreur disponible la recevra bientôt.</p>
        <div className="card p-5 text-left mb-6">
          <div className="flex justify-between mb-3">
            <span className="text-gray-500 text-sm">Numéro de commande</span>
            <span className="font-bold text-navy-900">{form.errandName}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-500 text-sm">Marché</span>
            <span className="font-semibold text-navy-800">{form.market}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-500 text-sm">Articles</span>
            <span className="font-semibold text-navy-800">{validItems.length} produit{validItems.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-100">
            <span className="font-bold text-navy-900">Total estimé</span>
            <span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span>
          </div>
        </div>
        <button onClick={() => setPage('home')} className="btn-primary w-full">Retour à l'accueil</button>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 animate-slide-up">
        <button onClick={() => setStep('form')} className="btn-ghost mb-4 flex items-center gap-1">
          <ArrowLeft size={18} /> Modifier
        </button>
        <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Récapitulatif</h1>
        <p className="text-gray-500 mb-6">Vérifiez votre demande avant de confirmer</p>

        <div className="card p-5 mb-4">
          <h2 className="font-bold text-navy-900 mb-3">{form.errandName}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" /><div><span className="text-gray-500">Marché: </span><span className="font-semibold">{form.market}</span></div></div>
            <div className="flex gap-2"><MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" /><div><span className="text-gray-500">Livraison: </span><span className="font-semibold">{form.deliveryAddress}</span></div></div>
            <div className="flex gap-2"><Clock size={16} className="text-gray-400 shrink-0 mt-0.5" /><div><span className="text-gray-500">Créneau: </span><span className="font-semibold">{form.timeSlot}</span></div></div>
            <div className="flex gap-2"><Phone size={16} className="text-gray-400 shrink-0 mt-0.5" /><div><span className="text-gray-500">Téléphone: </span><span className="font-semibold">{form.phone}</span></div></div>
          </div>
          {form.instructions && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
              <span className="font-semibold">Instructions: </span>{form.instructions}
            </div>
          )}
        </div>

        <div className="card p-5 mb-4">
          <h3 className="font-bold text-navy-900 mb-3">Liste de courses ({validItems.length})</h3>
          <div className="space-y-2">
            {validItems.map((it, i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-semibold text-navy-800">{it.name}</span>
                  {it.quantity && <span className="text-gray-400"> · {it.quantity}</span>}
                </div>
                <span className="font-semibold text-navy-700">{formatFCFA(it.budget)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 mb-4">
          <h3 className="font-bold text-navy-900 mb-3">Coûts estimés</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Coût estimé des produits</span><span className="font-semibold">{formatFCFA(estimatedProductCost)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(serviceFee)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(deliveryFee)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total estimé</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span></div>
          </div>
          <div className="mt-3 p-3 bg-orange-50 rounded-xl text-xs text-orange-700">
            Les prix au marché peuvent varier. Le livreur vous contactera avant tout dépassement de budget.
          </div>
        </div>

        <button onClick={confirmOrder} className="btn-primary w-full flex items-center justify-center gap-2">
          <Check size={20} /> Confirmer la course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Faire une course</h1>
      <p className="text-gray-500 mb-6">Demandez à un livreur d'effectuer vos achats pour vous</p>

      <div className="space-y-5">
        {/* Course name */}
        <div className="card p-5">
          <label className="label-text">Nom de la course</label>
          <input
            className="input-field"
            placeholder="Ex: Courses au marché d'Adjamé"
            value={form.errandName}
            onChange={(e) => update('errandName', e.target.value)}
          />
        </div>

        {/* Market selection */}
        <div className="card p-5">
          <label className="label-text">Marché ou magasin souhaité</label>
          <select className="input-field" value={form.market} onChange={(e) => update('market', e.target.value)}>
            <option>Marché d'Adjamé</option>
            <option>Marché de Cocody</option>
            <option>Marché de Yopougon</option>
            <option>Marché de Treichville</option>
            <option>Marché de Koumassi</option>
            <option>Carrefour / Casino</option>
            <option>Autre boutique</option>
          </select>
        </div>

        {/* Items list */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="label-text mb-0">Liste des produits</label>
            <button onClick={addItem} className="text-sm text-orange-600 font-semibold flex items-center gap-1 hover:text-orange-700">
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    className="input-field"
                    placeholder="Nom du produit (ex: Tomates)"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="input-field"
                      placeholder="Quantité (ex: 2kg)"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Budget (FCFA)"
                      value={item.budget || ''}
                      onChange={(e) => updateItem(i, 'budget', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-error-500 mt-1">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-navy-700">
            <Camera size={16} /> Ajouter une photo (facultatif)
          </button>
        </div>

        {/* Instructions */}
        <div className="card p-5">
          <label className="label-text">Instructions particulières</label>
          <textarea
            className="input-field min-h-[80px] resize-none"
            placeholder="Ex: Choisir les tomates bien mûres, bien emballer le poisson..."
            value={form.instructions}
            onChange={(e) => update('instructions', e.target.value)}
          />
        </div>

        {/* Addresses */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="label-text">Adresse de récupération (si différente)</label>
            <input
              className="input-field"
              placeholder="Laisser vide si identique au marché"
              value={form.pickupAddress}
              onChange={(e) => update('pickupAddress', e.target.value)}
            />
          </div>
          <div>
            <LocationPicker
              address={form.deliveryAddress}
              onAddressChange={(v) => update('deliveryAddress', v)}
              coords={coords}
              onCoordsChange={setCoords}
              commune={form.commune}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Commune</label>
              <select className="input-field" value={form.commune} onChange={(e) => update('commune', e.target.value)}>
                {COMMUNES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Téléphone</label>
              <input
                className="input-field"
                placeholder="+225 07 ..."
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Time slot */}
        <div className="card p-5">
          <label className="label-text">Créneau de livraison souhaité</label>
          <select className="input-field" value={form.timeSlot} onChange={(e) => update('timeSlot', e.target.value)}>
            <option>Aujourd'hui, 14h-16h</option>
            <option>Aujourd'hui, 16h-18h</option>
            <option>Aujourd'hui, 18h-20h</option>
            <option>Demain, 8h-10h</option>
            <option>Demain, 10h-12h</option>
            <option>Demain, 14h-16h</option>
          </select>
        </div>

        {/* Summary bar */}
        <div className="card p-5 bg-navy-50/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Coût estimé des produits</span><span className="font-semibold">{formatFCFA(estimatedProductCost)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(serviceFee)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(deliveryFee)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total estimé</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span></div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!isValid} className="btn-primary w-full flex items-center justify-center gap-2">
          <ShoppingCart size={20} /> Voir le récapitulatif
        </button>
      </div>
    </div>
  );
}
