import { Store, MapPin, Clock, Star, Phone, Mail, Camera, Edit2, Check, LogOut } from 'lucide-react';
import { useApp } from '@/context';
import { useState } from 'react';

export function MerchantProfile() {
  const { user, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: 'Boulangerie Cocody',
    location: 'Cocody Riviera 2',
    hours: '5h - 20h',
    phone: user?.phone || '',
    email: user?.email || '',
    description: 'Boulangerie artisanale proposant pains frais, croissants et pâtisseries variées.',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <div className="card overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-navy-900 to-navy-700 relative">
          <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-xl p-2 text-white"><Camera size={18} /></button>
        </div>
        <div className="p-5 -mt-12">
          <div className="flex items-end justify-between mb-4">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-card flex items-center justify-center ring-4 ring-white">
              <Store size={40} className="text-orange-500" />
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-outline text-sm flex items-center gap-1">
              {editing ? <><Check size={16} /> Enregistrer</> : <><Edit2 size={16} /> Modifier</>}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="label-text">Nom de la boutique</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea className="input-field min-h-[60px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Localisation</label>
                  <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Horaires</label>
                  <input className="input-field" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold text-navy-900">{form.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{form.description}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-orange-500" /> {form.location}</span>
                <span className="flex items-center gap-1"><Clock size={14} className="text-orange-500" /> {form.hours}</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-orange-500 fill-orange-500" /> 4.8</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-bold text-navy-900 text-sm mb-3">Contact</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-500">Téléphone:</span>
            <span className="font-semibold text-navy-800">{form.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-500">E-mail:</span>
            <span className="font-semibold text-navy-800">{form.email || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-3 text-center">
          <div className="text-lg font-extrabold text-navy-900">156</div>
          <div className="text-xs text-gray-400">Ventes</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-extrabold text-orange-600">4.8</div>
          <div className="text-xs text-gray-400">Note</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-extrabold text-success-600">98%</div>
          <div className="text-xs text-gray-400">Satisfaction</div>
        </div>
      </div>

      <button onClick={logout} className="card w-full p-4 flex items-center gap-3 hover:bg-error-50 transition-colors">
        <LogOut size={20} className="text-error-600" />
        <span className="font-bold text-error-600 text-sm">Déconnexion</span>
      </button>
    </div>
  );
}
