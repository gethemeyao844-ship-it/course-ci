import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallBanner() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !canInstall) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] animate-slide-up max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-navy-800 text-white rounded-2xl shadow-card-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
          <Download size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Installer Course CI</p>
          <p className="text-xs text-navy-200">Accédez plus rapidement depuis votre écran d'accueil</p>
        </div>
        <button
          onClick={() => promptInstall()}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Installer
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-navy-300 hover:text-white flex-shrink-0"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
