import { useState, useEffect } from 'react';
import {
  Store, Loader2, CheckCircle, XCircle, Clock, AlertCircle,
  Search, Eye, MapPin, Phone, Tag, Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatFCFA } from '@/data';

interface ShopRow {
  id: string;
  shop_name: string;
  business_type: string;
  description: string | null;
  address: string;
  commune: string;
  contact_phone: string;
  whatsapp_number: string | null;
  opening_hours: string | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

interface SubRow {
  id: string;
  shop_id: string;
  plan_id: string;
  payment_status: string;
  amount_fcfa: number;
  activated_at: string | null;
  expires_at: string | null;
}

interface ShopWithSub extends ShopRow {
  subscription?: SubRow | null;
}

const shopStateConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Active', color: 'bg-success-100 text-success-700' },
  suspended: { label: 'Suspendue', color: 'bg-error-100 text-error-700' },
  expired: { label: 'Expirée', color: 'bg-gray-100 text-gray-600' },
  awaiting_payment: { label: 'En attente de paiement', color: 'bg-orange-100 text-orange-700' },
};

function getShopState(shop: ShopRow, sub?: SubRow | null): string {
  if (!shop.is_approved) {
    if (sub && sub.payment_status === 'pending') return 'awaiting_payment';
    return 'pending';
  }
  if (!shop.is_active) return 'suspended';
  if (sub && sub.expires_at) {
    const expiry = new Date(sub.expires_at);
    if (expiry < new Date()) return 'expired';
  }
  return 'active';
}

export function AdminShops() {
  const [shops, setShops] = useState<ShopWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState<ShopWithSub | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: shopData, error: shopErr } = await supabase
        .from('shops')
        .select('id, shop_name, business_type, description, address, commune, contact_phone, whatsapp_number, opening_hours, is_approved, is_active, created_at')
        .order('created_at', { ascending: false });

      if (shopErr) throw shopErr;

      const shopsList = (shopData || []) as ShopRow[];

      // Fetch subscriptions for these shops
      const shopIds = shopsList.map((s) => s.id);
      let subsMap: Record<string, SubRow> = {};
      if (shopIds.length > 0) {
        const { data: subsData } = await supabase
          .from('merchant_subscriptions')
          .select('id, shop_id, plan_id, payment_status, amount_fcfa, activated_at, expires_at')
          .in('shop_id', shopIds)
          .order('created_at', { ascending: false });

        (subsData || []).forEach((sub: SubRow) => {
          if (!subsMap[sub.shop_id]) subsMap[sub.shop_id] = sub;
        });
      }

      const combined: ShopWithSub[] = shopsList.map((s) => ({
        ...s,
        subscription: subsMap[s.id] || null,
      }));
      setShops(combined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(msg);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const approveShop = async (shopId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_approved: true, is_active: true })
        .eq('id', shopId);
      if (error) throw error;
      await fetchShops();
      setSelectedShop(null);
    } catch {
      setError('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const suspendShop = async (shopId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('shops')
        .update({ is_active: false })
        .eq('id', shopId);
      if (error) throw error;
      await fetchShops();
      setSelectedShop(null);
    } catch {
      setError('Erreur lors de la suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = shops.filter((s) =>
    s.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    s.commune.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedShop) {
    const state = getShopState(selectedShop, selectedShop.subscription);
    const stateCfg = shopStateConfig[state] || shopStateConfig.pending;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
        <button onClick={() => setSelectedShop(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 mb-4">
          <Eye size={16} /> Retour à la liste
        </button>
        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center">
                <Store size={28} className="text-navy-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-900">{selectedShop.shop_name}</h2>
                <span className={`badge ${stateCfg.color}`}>{stateCfg.label}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Catégorie</span><span className="font-semibold">{selectedShop.business_type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Commune</span><span className="font-semibold">{selectedShop.commune}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Adresse</span><span className="font-semibold">{selectedShop.address}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-semibold">{selectedShop.contact_phone}</span></div>
            {selectedShop.whatsapp_number && <div className="flex justify-between"><span className="text-gray-500">WhatsApp</span><span className="font-semibold">{selectedShop.whatsapp_number}</span></div>}
            {selectedShop.opening_hours && <div className="flex justify-between"><span className="text-gray-500">Horaires</span><span className="font-semibold">{selectedShop.opening_hours}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Créée le</span><span className="font-semibold">{new Date(selectedShop.created_at).toLocaleDateString('fr-FR')}</span></div>
          </div>

          {selectedShop.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600">{selectedShop.description}</p>
            </div>
          )}

          {selectedShop.subscription && (
            <div className="bg-navy-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-bold text-navy-900">Abonnement</p>
              <div className="flex justify-between"><span className="text-gray-500">Statut paiement</span><span className="font-semibold capitalize">{selectedShop.subscription.payment_status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Montant</span><span className="font-semibold">{formatFCFA(selectedShop.subscription.amount_fcfa)}</span></div>
              {selectedShop.subscription.activated_at && <div className="flex justify-between"><span className="text-gray-500">Activé le</span><span className="font-semibold">{new Date(selectedShop.subscription.activated_at).toLocaleDateString('fr-FR')}</span></div>}
              {selectedShop.subscription.expires_at && <div className="flex justify-between"><span className="text-gray-500">Expire le</span><span className="font-semibold">{new Date(selectedShop.subscription.expires_at).toLocaleDateString('fr-FR')}</span></div>}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!selectedShop.is_approved && (
              <button
                onClick={() => approveShop(selectedShop.id)}
                disabled={actionLoading}
                className="btn-primary flex-1 bg-success-500 hover:bg-success-600 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle size={18} /> Approuver
              </button>
            )}
            {selectedShop.is_active && (
              <button
                onClick={() => suspendShop(selectedShop.id)}
                disabled={actionLoading}
                className="btn-outline flex-1 text-error-600 border-error-200 hover:bg-error-50 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <XCircle size={18} /> Suspendre
              </button>
            )}
            {!selectedShop.is_active && selectedShop.is_approved && (
              <button
                onClick={() => approveShop(selectedShop.id)}
                disabled={actionLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle size={18} /> Réactiver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-900">Gestion des boutiques</h1>
        <p className="text-gray-500 text-sm">Examinez et gérez les boutiques des commerçants</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="input-field pl-10"
          placeholder="Rechercher par nom ou commune..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="card p-4 mb-4 bg-error-50 border border-error-100">
          <p className="text-sm text-error-700">
            Impossible de charger les boutiques: {error}. Les données seront accessibles une fois l'authentification configurée.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Store size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Aucune boutique à afficher.</p>
          <p className="text-xs text-gray-300 mt-1">Les boutiques créées par les commerçants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((shop, i) => {
            const state = getShopState(shop, shop.subscription);
            const stateCfg = shopStateConfig[state] || shopStateConfig.pending;
            return (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                  <Store size={22} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm truncate">{shop.shop_name}</h3>
                  <p className="text-xs text-gray-400">{shop.business_type} · {shop.commune}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Calendar size={10} /> {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <span className={`badge ${stateCfg.color} shrink-0`}>{stateCfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
