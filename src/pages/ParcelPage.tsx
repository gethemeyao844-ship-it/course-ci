import { useState } from 'react';
import { ArrowLeft, Package, Check, MapPin, Phone, User, Camera, Weight, ArrowRight } from 'lucide-react';
import { useApp } from '@/context';
import { COMMUNES, formatFCFA } from '@/data';
import type { Order } from '@/types';

export function ParcelPage() {
  const { setPage, user, placeOrder } = useApp();
  const [step, setStep] = useState<'form' | 'summary' | 'success'>('form');
  const [form, setForm] = useState({
    senderName: user?.name || '',
    senderPhone: user?.phone || '',
    recipientName: '',
    recipientPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupCommune: 'Cocody',
    deliveryCommune: 'Plateau',
    description: '',
    weight: '',
    instructions: '',
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const serviceFee = 500;
  const deliveryFee = 1500;
  const total = serviceFee + deliveryFee;

  const isValid = form.senderName && form.senderPhone && form.recipientName && form.recipientPhone && form.pickupAddress && form.deliveryAddress && form.description;

  const confirmOrder = () => {
    const order: Order = {
      id: `o${Date.now()}`,
      number: `CMD-2026-${String(Math.floor(Math.random() * 900) + 200)}`,
      type: 'parcel',
      status: 'received',
      date: new Date().toISOString(),
      items: [{ name: `Colis: ${form.description}`, price: 0, quantity: 1 }],
      productCost: 0,
      serviceFee,
      deliveryFee,
      total,
      deliveryAddress: form.deliveryAddress,
      pickupAddress: form.pickupAddress,
      phone: form.senderPhone,
      commune: form.deliveryCommune,
      customerName: form.senderName,
      customerPhone: form.senderPhone,
      instructions: form.instructions,
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
        <h1 className="text-2xl font-extrabold text-navy-900 mb-2">Colis envoyé !</h1>
        <p className="text-gray-500 mb-6">Votre demande d'envoi de colis a été enregistrée. Un livreur la prendra en charge.</p>
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
        <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Récapitulatif du colis</h1>
        <p className="text-gray-500 mb-6">Vérifiez les informations avant de confirmer</p>

        <div className="card p-5 mb-4 space-y-4">
          <div>
            <h3 className="font-bold text-navy-900 text-sm mb-2">Expéditeur</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex gap-2"><User size={16} className="text-gray-400" /> {form.senderName}</div>
              <div className="flex gap-2"><Phone size={16} className="text-gray-400" /> {form.senderPhone}</div>
              <div className="flex gap-2"><MapPin size={16} className="text-gray-400" /> {form.pickupAddress} ({form.pickupCommune})</div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-navy-900 text-sm mb-2">Destinataire</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex gap-2"><User size={16} className="text-gray-400" /> {form.recipientName}</div>
              <div className="flex gap-2"><Phone size={16} className="text-gray-400" /> {form.recipientPhone}</div>
              <div className="flex gap-2"><MapPin size={16} className="text-gray-400" /> {form.deliveryAddress} ({form.deliveryCommune})</div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-navy-900 text-sm mb-2">Colis</h3>
            <p className="text-sm text-gray-600">{form.description}</p>
            {form.weight && <p className="text-sm text-gray-500 mt-1">Poids: {form.weight}</p>}
            {form.instructions && <p className="text-sm text-gray-500 mt-1 italic">"{form.instructions}"</p>}
          </div>
        </div>

        <div className="card p-5 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(serviceFee)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(deliveryFee)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span></div>
          </div>
        </div>

        <button onClick={confirmOrder} className="btn-primary w-full flex items-center justify-center gap-2">
          <Check size={20} /> Confirmer l'envoi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Colis & Services</h1>
      <p className="text-gray-500 mb-6">Envoyez un colis ou découvrez nos services locaux</p>

      <div className="space-y-5">
        {/* Sender */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center text-sm font-bold">1</span>
            Expéditeur
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Nom de l'expéditeur</label>
              <input className="input-field" placeholder="Votre nom" value={form.senderName} onChange={(e) => update('senderName', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Téléphone</label>
              <input className="input-field" placeholder="+225 07 ..." value={form.senderPhone} onChange={(e) => update('senderPhone', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Adresse de départ</label>
              <input className="input-field" placeholder="Ex: Cocody Riviera 2" value={form.pickupAddress} onChange={(e) => update('pickupAddress', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Commune de départ</label>
              <select className="input-field" value={form.pickupCommune} onChange={(e) => update('pickupCommune', e.target.value)}>
                {COMMUNES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center text-sm font-bold">2</span>
            Destinataire
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text">Nom du destinataire</label>
              <input className="input-field" placeholder="Nom du destinataire" value={form.recipientName} onChange={(e) => update('recipientName', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Téléphone</label>
              <input className="input-field" placeholder="+225 07 ..." value={form.recipientPhone} onChange={(e) => update('recipientPhone', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Adresse d'arrivée</label>
              <input className="input-field" placeholder="Ex: Plateau, Avenue Chardy" value={form.deliveryAddress} onChange={(e) => update('deliveryAddress', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Commune d'arrivée</label>
              <select className="input-field" value={form.deliveryCommune} onChange={(e) => update('deliveryCommune', e.target.value)}>
                {COMMUNES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Parcel details */}
        <div className="card p-5">
          <h2 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center text-sm font-bold">3</span>
            Détails du colis
          </h2>
          <div className="space-y-3">
            <div>
              <label className="label-text">Description du colis</label>
              <textarea className="input-field min-h-[70px] resize-none" placeholder="Ex: Documents importants, médicaments, cadeau..." value={form.description} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div>
              <label className="label-text">Dimensions ou poids estimé (facultatif)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="input-field pl-10" placeholder="Ex: 2kg, 30x20x15cm" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-text">Instructions de livraison (facultatif)</label>
              <textarea className="input-field min-h-[60px] resize-none" placeholder="Ex: Remettre en main propre, appeler avant d'arriver..." value={form.instructions} onChange={(e) => update('instructions', e.target.value)} />
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-navy-700">
              <Camera size={16} /> Ajouter une photo du colis (facultatif)
            </button>
          </div>
        </div>

        {/* Cost */}
        <div className="card p-5 bg-navy-50/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Frais de service</span><span className="font-semibold">{formatFCFA(serviceFee)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Frais de livraison</span><span className="font-semibold">{formatFCFA(deliveryFee)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-navy-900">Total</span><span className="font-bold text-orange-600 text-lg">{formatFCFA(total)}</span></div>
          </div>
        </div>

        <button onClick={() => isValid && setStep('summary')} disabled={!isValid} className="btn-primary w-full flex items-center justify-center gap-2">
          Voir le récapitulatif <ArrowRight size={18} />
        </button>
      </div>

      {/* Services catalog teaser */}
      <div className="mt-8">
        <h2 className="font-bold text-navy-900 mb-3">Services locaux</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: 'Nettoyage à domicile', desc: 'Service de ménage à domicile', icon: '🧹', available: false },
            { name: 'Pharmacie express', desc: 'Livraison de médicaments', icon: '💊', available: true },
            { name: 'Courses administratives', desc: 'Aide pour démarches', icon: '📋', available: false },
            { name: 'Transport de personnes', desc: 'Déplacement en moto-taxi', icon: '🛵', available: false },
          ].map((svc) => (
            <div key={svc.name} className={`card p-4 flex items-center gap-3 ${!svc.available ? 'opacity-60' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">{svc.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-navy-900 text-sm">{svc.name}</h3>
                <p className="text-xs text-gray-400">{svc.desc}</p>
              </div>
              {svc.available ? (
                <span className="badge bg-success-50 text-success-700">Disponible</span>
              ) : (
                <span className="badge bg-gray-100 text-gray-500">Bientôt</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Les services sont activés par l'administrateur lorsqu'ils sont disponibles.</p>
      </div>
    </div>
  );
}
