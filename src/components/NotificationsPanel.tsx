import { Bell, X, Package, Tag, Info } from 'lucide-react';
import { useApp } from '@/context';

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markNotificationRead } = useApp();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-float transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={22} className="text-orange-500" />
            <h2 className="text-lg font-bold text-navy-900">Notifications</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-40" />
              <p>Aucune notification pour le moment</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = n.type === 'order' ? Package : n.type === 'promo' ? Tag : Info;
              return (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    n.read ? 'bg-white border-gray-100' : 'bg-orange-50/50 border-orange-100'
                  } hover:border-orange-200`}
                >
                  <div className="flex gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      n.type === 'order' ? 'bg-navy-100 text-navy-700' :
                      n.type === 'promo' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-navy-900">{n.title}</h3>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Les notifications sont liées à de vrais événements une fois le service configuré.
          </p>
        </div>
      </div>
    </>
  );
}
