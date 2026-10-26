import { ArrowLeft, Bell, Globe, Moon, Shield, Smartphone, Languages, ChevronRight } from 'lucide-react';
import { useApp } from '@/context';
import { useState } from 'react';

export function SettingsPage() {
  const { setPage } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Français');

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-orange-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('profile')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Profil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Paramètres</h1>
      <p className="text-gray-500 mb-6">Gérez vos préférences</p>

      {/* Notifications */}
      <div className="card overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <Bell size={18} className="text-orange-500" /> Notifications
          </h2>
        </div>
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <div>
            <h3 className="font-semibold text-navy-900 text-sm">Notifications générales</h3>
            <p className="text-xs text-gray-400">Recevoir des notifications</p>
          </div>
          <Toggle enabled={notifications} onClick={() => setNotifications(!notifications)} />
        </div>
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <div>
            <h3 className="font-semibold text-navy-900 text-sm">Mises à jour de commandes</h3>
            <p className="text-xs text-gray-400">Statut des commandes en temps réel</p>
          </div>
          <Toggle enabled={orderNotifs} onClick={() => setOrderNotifs(!orderNotifs)} />
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy-900 text-sm">Promotions et offres</h3>
            <p className="text-xs text-gray-400">Recevoir les meilleures offres</p>
          </div>
          <Toggle enabled={promoNotifs} onClick={() => setPromoNotifs(!promoNotifs)} />
        </div>
      </div>

      {/* App preferences */}
      <div className="card overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <Smartphone size={18} className="text-orange-500" /> Application
          </h2>
        </div>
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-3">
            <Languages size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">Langue</h3>
              <p className="text-xs text-gray-400">{language}</p>
            </div>
          </div>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-sm font-semibold text-navy-700 bg-transparent border-0 outline-none cursor-pointer">
            <option>Français</option>
            <option>English</option>
          </select>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-navy-900 text-sm">Mode sombre</h3>
              <p className="text-xs text-gray-400">Bientôt disponible</p>
            </div>
          </div>
          <Toggle enabled={darkMode} onClick={() => setDarkMode(!darkMode)} />
        </div>
      </div>

      {/* About */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-bold text-navy-900 text-sm flex items-center gap-2">
            <Shield size={18} className="text-orange-500" /> À propos
          </h2>
        </div>
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <span className="text-sm text-gray-600">Version de l'application</span>
          <span className="text-sm font-semibold text-navy-800">1.0.0 (Phase 1)</span>
        </div>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-600 flex items-center gap-2"><Globe size={18} className="text-gray-400" /> Conditions d'utilisation</span>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-600 flex items-center gap-2"><Shield size={18} className="text-gray-400" /> Politique de confidentialité</span>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>
    </div>
  );
}
