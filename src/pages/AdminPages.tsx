import { useState } from 'react';
import {
  Package, Tags, Store, Bike, Megaphone, MapPin, AlertCircle,
  Users, Plus, Edit2, Trash2, Eye, EyeOff, Search, Check, X,
  TrendingUp, Star, Phone, Mail, Power, ArrowLeft,
} from 'lucide-react';
import {
  demoProducts, demoPartners, demoPromotions, productCategories,
  COMMUNES, formatFCFA, adminStats,
} from '@/data';

function PageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-navy-900">{title}</h1>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState(demoProducts);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAvailable = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
  };
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des produits" desc="Gérez le catalogue global des produits" />
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input className="input-field pl-10" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus size={18} /> <span className="hidden sm:inline">Ajouter</span></button>
      </div>
      <div className="card overflow-hidden">
        {filtered.map((product, i) => (
          <div key={product.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm truncate">{product.name}</h3>
              <p className="text-xs text-gray-400">{product.category} · {product.merchantId}</p>
              <span className="font-bold text-orange-600 text-sm">{formatFCFA(product.price)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleAvailable(product.id)} className={`p-2 rounded-lg ${product.available ? 'text-success-600 hover:bg-success-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                {product.available ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:bg-navy-50 hover:text-navy-700"><Edit2 size={18} /></button>
              <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg text-gray-400 hover:bg-error-50 hover:text-error-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCategories() {
  const [categories, setCategories] = useState(productCategories.map((c) => ({ ...c, count: Math.floor(Math.random() * 20) + 3 })));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des catégories" desc="Organisez les catégories de produits" />
      <button className="btn-primary mb-4 flex items-center gap-2"><Plus size={18} /> Ajouter une catégorie</button>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                <Tags size={20} className="text-navy-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-400">{cat.count} produits</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
              <button onClick={() => setCategories((prev) => prev.filter((c) => c.name !== cat.name))} className="p-2 text-gray-400 hover:text-error-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminMerchants() {
  const merchants = [
    { id: 'm1', name: 'Marché d\'Adjamé', type: 'Marché', commune: 'Adjamé', products: 8, revenue: 245000, status: 'Actif' },
    { id: 'm2', name: 'Boutique Yopougon', type: 'Boutique', commune: 'Yopougon', products: 15, revenue: 180000, status: 'Actif' },
    { id: 'm3', name: 'Boulangerie Cocody', type: 'Boulangerie', commune: 'Cocody', products: 6, revenue: 320000, status: 'Actif' },
    { id: 'm4', name: 'Restaurant Le Baoulé', type: 'Restaurant', commune: 'Plateau', products: 12, revenue: 450000, status: 'Actif' },
    { id: 'm5', name: 'AutoCIV Vente', type: 'Voitures', commune: 'Marcory', products: 4, revenue: 1200000, status: 'Suspendu' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des commerçants" desc="Gérez les partenaires commerçants" />
      <div className="card overflow-hidden">
        {merchants.map((m, i) => (
          <div key={m.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
              <Store size={20} className="text-navy-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm truncate">{m.name}</h3>
              <p className="text-xs text-gray-400">{m.type} · {m.commune} · {m.products} produits</p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-navy-900 text-sm">{formatFCFA(m.revenue)}</div>
              <span className={`badge ${m.status === 'Actif' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-600'}`}>{m.status}</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDrivers() {
  const drivers = [
    { id: 'd1', name: 'Ibrahim Traoré', commune: 'Cocody', missions: 147, earnings: 542000, rating: 4.9, status: 'En ligne' },
    { id: 'd2', name: 'Mamadou Diarra', commune: 'Adjamé', missions: 98, earnings: 385000, rating: 4.7, status: 'Hors ligne' },
    { id: 'd3', name: 'Sekou Camara', commune: 'Treichville', missions: 112, earnings: 420000, rating: 4.8, status: 'En ligne' },
    { id: 'd4', name: 'Adjoa Mensah', commune: 'Yopougon', missions: 76, earnings: 298000, rating: 4.6, status: 'Hors ligne' },
    { id: 'd5', name: 'Kouassi Bamba', commune: 'Koumassi', missions: 65, earnings: 245000, rating: 4.5, status: 'Suspendu' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des livreurs" desc="Gérez les livreurs de la plateforme" />
      <div className="card overflow-hidden">
        {drivers.map((d, i) => (
          <div key={d.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${d.status === 'En ligne' ? 'bg-success-500' : d.status === 'Suspendu' ? 'bg-error-500' : 'bg-gray-400'}`}>
              {d.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm truncate">{d.name}</h3>
              <p className="text-xs text-gray-400">{d.commune} · {d.missions} missions</p>
              <div className="flex items-center gap-1 text-xs">
                <Star size={11} className="text-orange-500 fill-orange-500" /> {d.rating}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-navy-900 text-sm">{formatFCFA(d.earnings)}</div>
              <span className={`badge ${d.status === 'En ligne' ? 'bg-success-50 text-success-700' : d.status === 'Suspendu' ? 'bg-error-50 text-error-600' : 'bg-gray-100 text-gray-500'}`}>
                {d.status === 'En ligne' && <Power size={10} />} {d.status}
              </span>
            </div>
            <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPromotions() {
  const [promos, setPromos] = useState(demoPromotions);

  const toggleActive = (id: string) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des promotions" desc="Créez et gérez les offres promotionnelles" />
      <button className="btn-primary mb-4 flex items-center gap-2"><Plus size={18} /> Créer une promotion</button>
      <div className="space-y-3">
        {promos.map((promo) => (
          <div key={promo.id} className="card overflow-hidden">
            <div className="flex">
              <img src={promo.imageUrl} alt="" className="w-24 h-24 object-cover shrink-0" />
              <div className="p-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-orange-500 text-white">{promo.discount}</span>
                  <span className={`badge ${promo.active ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 text-sm">{promo.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{promo.description}</p>
              </div>
              <div className="flex flex-col gap-1 p-2 shrink-0">
                <button onClick={() => toggleActive(promo.id)} className="p-2 text-gray-400 hover:text-navy-700"><Eye size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-error-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminZones() {
  const [zones, setZones] = useState(COMMUNES.map((c) => ({ name: c, fee: 800 + Math.floor(Math.random() * 700), active: true })));

  const toggleZone = (name: string) => {
    setZones((prev) => prev.map((z) => (z.name === name ? { ...z, active: !z.active } : z)));
  };
  const updateFee = (name: string, fee: number) => {
    setZones((prev) => prev.map((z) => (z.name === name ? { ...z, fee } : z)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Zones & tarifs de livraison" desc="Définissez les tarifs par commune" />
      <div className="card overflow-hidden">
        {zones.map((zone, i) => (
          <div key={zone.name} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <MapPin size={20} className="text-orange-500 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-navy-900 text-sm">{zone.name}</h3>
              <span className={`badge ${zone.active ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                {zone.active ? 'Desservie' : 'Non desservie'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input-field w-24 text-right text-sm py-2"
                value={zone.fee}
                onChange={(e) => updateFee(zone.name, parseInt(e.target.value) || 0)}
              />
              <span className="text-xs text-gray-400">FCFA</span>
              <button onClick={() => toggleZone(zone.name)} className={`p-2 rounded-lg ${zone.active ? 'text-success-600 hover:bg-success-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                {zone.active ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminClaims() {
  const [claims, setClaims] = useState([
    { id: 'r1', subject: 'Livraison en retard', customer: 'Awa Koné', order: 'CMD-2026-0140', priority: 'Haute', status: 'En attente' },
    { id: 'r2', subject: 'Produit manquant', customer: "Kouassi N'Guessan", order: 'CMD-2026-0136', priority: 'Moyenne', status: 'En cours' },
    { id: 'r3', subject: 'Montant incorrect', customer: 'Fatou Bamba', order: 'CMD-2026-0128', priority: 'Basse', status: 'En attente' },
  ]);

  const resolve = (id: string) => {
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Résolue' } : c)));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Gestion des réclamations" desc="Traitez les litiges et réclamations clients" />
      <div className="space-y-3">
        {claims.map((claim) => (
          <div key={claim.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-navy-900 text-sm">{claim.subject}</h3>
                <p className="text-xs text-gray-400">{claim.customer} · {claim.order}</p>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${claim.priority === 'Haute' ? 'bg-error-50 text-error-600' : claim.priority === 'Moyenne' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{claim.priority}</span>
                <span className={`badge ${claim.status === 'Résolue' ? 'bg-success-50 text-success-700' : 'bg-orange-100 text-orange-700'}`}>{claim.status}</span>
              </div>
            </div>
            {claim.status !== 'Résolue' && (
              <div className="flex gap-2">
                <button onClick={() => resolve(claim.id)} className="btn-primary text-sm py-2 px-3 flex items-center gap-1 bg-success-500 hover:bg-success-600">
                  <Check size={14} /> Marquer résolue
                </button>
                <button className="btn-outline text-sm py-2 px-3">Contacter le client</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAccounts() {
  const accounts = [
    { id: 'a1', name: 'Awa Koné', role: 'Client', email: 'awa.kone@example.ci', phone: '+225 07 01 23 45 67', status: 'Actif' },
    { id: 'a2', name: 'Ibrahim Traoré', role: 'Livreur', email: 'ibrahim.t@example.ci', phone: '+225 07 89 01 23 45', status: 'Actif' },
    { id: 'a3', name: 'Boulangerie Cocody', role: 'Commerçant', email: 'contact@boulcocody.ci', phone: '+225 27 22 48 00 00', status: 'Actif' },
    { id: 'a4', name: 'Fatou Bamba', role: 'Client', email: 'fatou.b@example.ci', phone: '+225 05 67 89 01 23', status: 'Actif' },
    { id: 'a5', name: 'AutoCIV Vente', role: 'Commerçant', email: 'info@autociv.ci', phone: '+225 27 21 30 00 00', status: 'Suspendu' },
    { id: 'a6', name: 'Admin Système', role: 'Admin', email: 'admin@courseci.ci', phone: '+225 27 20 00 00 00', status: 'Actif' },
  ];

  const roleColors: Record<string, string> = {
    Client: 'bg-navy-50 text-navy-600',
    Livreur: 'bg-orange-100 text-orange-700',
    Commerçant: 'bg-success-50 text-success-700',
    Admin: 'bg-error-50 text-error-600',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <PageHeader title="Comptes & rôles" desc="Gérez tous les comptes utilisateurs" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-navy-900">{adminStats.totalClients}</div>
          <div className="text-xs text-gray-400">Clients</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-orange-600">24</div>
          <div className="text-xs text-gray-400">Livreurs</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold text-success-600">50</div>
          <div className="text-xs text-gray-400">Commerçants</div>
        </div>
      </div>
      <div className="card overflow-hidden">
        {accounts.map((acc, i) => (
          <div key={acc.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center font-bold text-navy-700 shrink-0">
              {acc.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-navy-900 text-sm truncate">{acc.name}</h3>
              <p className="text-xs text-gray-400 truncate">{acc.email}</p>
            </div>
            <span className={`badge ${roleColors[acc.role]}`}>{acc.role}</span>
            <span className={`badge ${acc.status === 'Actif' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-600'}`}>{acc.status}</span>
            <button className="p-2 text-gray-400 hover:text-navy-700"><Edit2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
