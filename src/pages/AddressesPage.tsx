import { ArrowLeft, MapPin, Plus, Home, Briefcase, Star, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '@/context';

export function AddressesPage() {
  const { setPage } = useApp();

  const addresses = [
    { id: 'a1', label: 'Domicile', address: 'Cocody Riviera 2, près de la pharmacie', commune: 'Cocody', default: true, icon: Home },
    { id: 'a2', label: 'Bureau', address: 'Plateau, Avenue Chardy, Immeuble Botreau 5e étage', commune: 'Plateau', default: false, icon: Briefcase },
    { id: 'a3', label: 'Marché habituel', address: "Marché d'Adjamé, entrée principale", commune: 'Adjamé', default: false, icon: MapPin },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('profile')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Profil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Mes adresses</h1>
      <p className="text-gray-500 mb-6">Gérez vos adresses de livraison enregistrées</p>

      <div className="space-y-3 mb-4">
        {addresses.map((addr) => {
          const Icon = addr.icon;
          return (
            <div key={addr.id} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-navy-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-navy-900 text-sm">{addr.label}</h3>
                  {addr.default && <span className="badge bg-orange-100 text-orange-700"><Star size={10} /> Par défaut</span>}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{addr.address}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.commune}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-error-500"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn-outline w-full flex items-center justify-center gap-2">
        <Plus size={18} /> Ajouter une adresse
      </button>
    </div>
  );
}
