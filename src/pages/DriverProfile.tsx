import { Bike, Star, Phone, Mail, MapPin, Wallet, LogOut, Edit2, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '@/context';
import { formatFCFA } from '@/data';

export function DriverProfile() {
  const { user, logout } = useApp();

  const stats = [
    { label: 'Missions totales', value: '147', icon: Bike },
    { label: 'Note moyenne', value: '4.9/5', icon: Star },
    { label: 'Gains du mois', value: formatFCFA(542000), icon: Wallet },
    { label: 'Taux de réussite', value: '98%', icon: TrendingUp },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <div className="card p-6 mb-6 bg-gradient-to-br from-navy-900 to-navy-700 text-white">
        <div className="flex items-center gap-4">
          <img src={user?.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-orange-400/30" />
          <div className="flex-1">
            <h1 className="text-xl font-extrabold">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-orange-500 text-white"><Bike size={10} /> Livreur</span>
              <span className="flex items-center gap-0.5 text-sm"><Star size={14} className="text-orange-400 fill-orange-400" /> 4.9</span>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><Edit2 size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-navy-200" /> {user?.phone}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-navy-200" /> {user?.email || 'Non renseigné'}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-navy-200" /> {user?.commune}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-navy-200" /> Inscrit en 2026
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={18} className="text-orange-500" />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <div className="text-lg font-extrabold text-navy-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-bold text-navy-900 text-sm mb-3">Informations du véhicule</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold text-navy-800">Moto</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Plaque</span><span className="font-semibold text-navy-800">AB-1234-CI</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Permis</span><span className="font-semibold text-navy-800">Validé</span></div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-bold text-navy-900 text-sm mb-3">Informations bancaires</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Mode de paiement</span><span className="font-semibold text-navy-800">Orange Money</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Numéro</span><span className="font-semibold text-navy-800">+225 07 01 23 45 67</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span className="font-semibold text-success-600">Hebdomadaire</span></div>
        </div>
      </div>

      <button onClick={logout} className="card w-full p-4 flex items-center gap-3 hover:bg-error-50 transition-colors">
        <LogOut size={20} className="text-error-600" />
        <span className="font-bold text-error-600 text-sm">Déconnexion</span>
      </button>
    </div>
  );
}
