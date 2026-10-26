import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context';

export function HelpPage() {
  const { setPage } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs = [
    { q: 'Comment passer une commande ?', a: 'Choisissez une catégorie (course, produit, restaurant ou colis), remplissez le formulaire et confirmez. Un livreur disponible recevra votre demande.' },
    { q: 'Quels sont les frais de livraison ?', a: 'Les frais varient selon la commune et le type de commande. Le montant exact est affiché avant la confirmation de chaque commande.' },
    { q: 'Comment suivre ma commande ?', a: 'Rendez-vous dans "Mes commandes" pour voir le statut en temps réel. Vous y trouverez les coordonnées du livreur une fois assigné.' },
    { q: 'Quels modes de paiement sont acceptés ?', a: 'Le paiement à la livraison est disponible. Mobile Money (Orange Money, MTN, Wave) sera bientôt intégré.' },
    { q: 'Comment devenir livreur ou commerçant ?', a: 'Créez un compte en choisissant le rôle "Livreur" ou "Commerçant". Un administrateur validera votre compte.' },
    { q: 'Que faire si ma commande a un problème ?', a: 'Contactez le support via la page Messages ou par téléphone. Notre équipe vous répondra dans les plus brefs délais.' },
  ];

  const filteredFaqs = faqs.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  const contacts = [
    { icon: Phone, label: 'Téléphone', value: '+225 27 22 49 00 00', color: 'bg-navy-50 text-navy-600' },
    { icon: Mail, label: 'E-mail', value: 'support@courseci.ci', color: 'bg-orange-50 text-orange-600' },
    { icon: MessageCircle, label: 'WhatsApp', value: '+225 07 00 00 00 00', color: 'bg-success-50 text-success-600' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('profile')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Profil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Aide & Support</h1>
      <p className="text-gray-500 mb-6">Trouvez des réponses ou contactez-nous</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input className="input-field pl-10" placeholder="Rechercher une question..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Contacts */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {contacts.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-4 text-center">
              <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={22} />
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase">{c.label}</h3>
              <p className="text-sm font-bold text-navy-900 mt-1 break-all">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <h2 className="font-bold text-navy-900 mb-3">Questions fréquentes</h2>
      <div className="space-y-2">
        {filteredFaqs.map((faq, i) => (
          <div key={i} className="card overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="font-semibold text-navy-900 text-sm flex items-center gap-2">
                <HelpCircle size={18} className="text-orange-500 shrink-0" />
                {faq.q}
              </span>
              <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4 pl-12 text-sm text-gray-600 animate-fade-in">{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="card p-8 text-center text-gray-400">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune question ne correspond à votre recherche</p>
        </div>
      )}

      <button onClick={() => setPage('messages')} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
        <MessageCircle size={18} /> Contacter le support
      </button>
    </div>
  );
}
