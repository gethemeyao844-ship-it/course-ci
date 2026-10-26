import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Package, X, Camera } from 'lucide-react';
import { useApp } from '@/context';
import { merchantProducts, formatFCFA, productCategories } from '@/data';
import type { Product } from '@/types';

export function MerchantProducts() {
  const { setPage } = useApp();
  const [products, setProducts] = useState<Product[]>(merchantProducts);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleAvailable = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addProduct = (product: Omit<Product, 'id' | 'merchantId'>) => {
    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      merchantId: 'm3',
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Mes produits</h1>
          <p className="text-gray-500 text-sm">Gérez votre catalogue</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input className="input-field pl-10" placeholder="Rechercher un produit..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun produit</p>
          </div>
        ) : (
          filtered.map((product, i) => (
            <div key={product.id} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <img src={product.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-sm">{product.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-orange-600 text-sm">{formatFCFA(product.price)}</span>
                  {product.promo && <span className="badge bg-error-500 text-white">-{product.promo}%</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleAvailable(product.id)} className={`p-2 rounded-lg ${product.available ? 'text-success-600 hover:bg-success-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {product.available ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-navy-50 hover:text-navy-700"><Edit2 size={18} /></button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg text-gray-400 hover:bg-error-50 hover:text-error-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onAdd={addProduct} />}
    </div>
  );
}

function AddProductModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<Product, 'id' | 'merchantId'>) => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: productCategories[0].name,
    unit: 'pièce',
    available: true,
  });

  const valid = form.name.trim() && form.price && parseInt(form.price) > 0;

  const handleAdd = () => {
    if (!valid) return;
    onAdd({
      name: form.name,
      description: form.description || 'Produit',
      price: parseInt(form.price),
      category: form.category,
      imageUrl: 'https://images.pexels.com/photos/9120377/pexels-photo-9120377.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
      available: form.available,
      unit: form.unit,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="font-bold text-navy-900 text-lg">Ajouter un produit</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Camera size={28} />
            </div>
            <button className="btn-outline text-sm">Ajouter une photo</button>
          </div>
          <div>
            <label className="label-text">Nom du produit</label>
            <input className="input-field" placeholder="Ex: Pain frais" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field min-h-[60px] resize-none" placeholder="Description du produit" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Prix (FCFA)</label>
              <input type="number" className="input-field" placeholder="500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Catégorie</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {productCategories.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Unité</label>
            <input className="input-field" placeholder="pièce, kg, lot..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <button onClick={handleAdd} disabled={!valid} className="btn-primary w-full">Ajouter le produit</button>
        </div>
      </div>
    </div>
  );
}
