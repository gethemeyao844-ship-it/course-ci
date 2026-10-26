import { useState } from 'react';
import {
  ArrowLeft, Plus, Minus, Trash2, Check, X, ShoppingCart,
  GraduationCap, Briefcase, ShoppingBasket, Package, Edit2, Save, ListChecks,
} from 'lucide-react';
import { useApp } from '@/context';
import { demoSupplyLists, demoProducts, formatFCFA } from '@/data';
import type { SupplyList, SupplyListItem } from '@/types';

const LIST_ICONS: Record<string, typeof Package> = {
  GraduationCap, Briefcase, ShoppingBasket, Package,
};

export function SupplyListsPage() {
  const { setPage, cart, addToCart } = useApp();
  const [lists, setLists] = useState<SupplyList[]>(demoSupplyLists);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<SupplyList | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const selectedList = lists.find((l) => l.id === selectedListId);
  const total = editingList
    ? editingList.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)
    : selectedList
    ? selectedList.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)
    : 0;
  const availableCount = (editingList || selectedList)?.items.filter((i) => i.available !== false).length || 0;

  const addListToCart = (list: SupplyList) => {
    list.items.forEach((item) => {
      if (item.available !== false && item.price) {
        addToCart({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl || '',
          unit: item.unit,
        });
        setAddedItems((prev) => new Set(prev).add(item.productId));
      }
    });
  };

  const startEdit = (list: SupplyList) => {
    setEditingList({ ...list, items: [...list.items] });
  };

  const saveEdit = () => {
    if (!editingList) return;
    setLists((prev) => prev.map((l) => (l.id === editingList.id ? editingList : l)));
    setEditingList(null);
  };

  const updateItemQty = (idx: number, qty: number) => {
    if (!editingList) return;
    setEditingList({ ...editingList, items: editingList.items.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, qty) } : it)) });
  };

  const removeItem = (idx: number) => {
    if (!editingList) return;
    setEditingList({ ...editingList, items: editingList.items.filter((_, i) => i !== idx) });
  };

  const addProductToList = (productId: string) => {
    if (!editingList) return;
    const product = demoProducts.find((p) => p.id === productId);
    if (!product) return;
    if (editingList.items.some((i) => i.productId === productId)) return;
    setEditingList({
      ...editingList,
      items: [...editingList.items, {
        productId: product.id, name: product.name, quantity: 1,
        unit: product.unit, price: product.price, imageUrl: product.imageUrl, available: product.available,
      }],
    });
  };

  const createNewList = (name: string) => {
    const newList: SupplyList = {
      id: `sl${Date.now()}`,
      name,
      description: 'Liste personnalisée',
      icon: 'ListChecks',
      category: 'Personnalisée',
      editable: true,
      items: [],
    };
    setLists((prev) => [...prev, newList]);
    setSelectedListId(newList.id);
    setEditingList(newList);
    setShowCreateModal(false);
  };

  const currentList = editingList || selectedList;

  // ─── Detail / Edit view ───
  if (currentList) {
    const isEditing = !!editingList;
    const Icon = LIST_ICONS[currentList.icon] || Package;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-slide-up">
        <button
          onClick={() => { setEditingList(null); setSelectedListId(null); }}
          className="btn-ghost mb-4 flex items-center gap-1"
        >
          <ArrowLeft size={18} /> Retour aux listes
        </button>

        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center">
              <Icon size={24} className="text-navy-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-navy-900">{currentList.name}</h1>
              <p className="text-sm text-gray-400">{currentList.description}</p>
            </div>
            {isEditing ? (
              <button onClick={saveEdit} className="btn-primary text-sm py-2 px-3 flex items-center gap-1">
                <Save size={16} /> Enregistrer
              </button>
            ) : (
              currentList.editable && (
                <button onClick={() => startEdit(currentList)} className="btn-outline text-sm py-2 px-3 flex items-center gap-1">
                  <Edit2 size={16} /> Modifier
                </button>
              )
            )}
          </div>
          <div className="flex gap-4 text-sm text-gray-500 mt-3">
            <span>{currentList.items.length} articles</span>
            <span>{availableCount} disponibles</span>
            <span className="font-bold text-navy-900">Total: {formatFCFA(total)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="card overflow-hidden mb-4">
          {currentList.items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ListChecks size={40} className="mx-auto mb-3 opacity-30" />
              <p>Cette liste est vide. {isEditing && 'Ajoutez des produits ci-dessous.'}</p>
            </div>
          ) : (
            currentList.items.map((item, idx) => (
              <div key={item.productId} className={`p-4 flex items-center gap-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400">
                    {item.quantity} {item.unit || 'pièce'}{item.quantity > 1 ? 's' : ''}
                    {item.price && ` · ${formatFCFA(item.price * item.quantity)}`}
                  </p>
                  {item.available === false && <span className="text-xs text-error-500">Indisponible</span>}
                </div>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateItemQty(idx, item.quantity - 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Minus size={14} /></button>
                    <span className="font-bold text-navy-900 text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateItemQty(idx, item.quantity + 1)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Plus size={14} /></button>
                    <button onClick={() => removeItem(idx)} className="p-1.5 rounded hover:bg-error-50 text-gray-400 hover:text-error-500 ml-1"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add products (edit mode) */}
        {isEditing && (
          <div className="card p-4 mb-4">
            <h3 className="font-bold text-navy-900 text-sm mb-3">Ajouter un produit</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {demoProducts
                .filter((p) => p.available && !editingList!.items.some((i) => i.productId === p.id))
                .map((p) => (
                  <button key={p.id} onClick={() => addProductToList(p.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-navy-50 text-left">
                    <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="text-sm font-semibold text-navy-800 flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-gray-400">{formatFCFA(p.price)}</span>
                    <Plus size={16} className="text-orange-500" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        {!isEditing && currentList.items.length > 0 && (
          <button
            onClick={() => addListToCart(currentList)}
            disabled={availableCount === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart size={20} /> Ajouter au panier ({availableCount} article{availableCount > 1 ? 's' : ''})
          </button>
        )}

        {cart.length > 0 && (
          <button onClick={() => setPage('marketplace')} className="btn-ghost w-full mt-3 flex items-center justify-center gap-1">
            Voir le panier <ArrowLeft size={16} className="rotate-180" />
          </button>
        )}
      </div>
    );
  }

  // ─── List overview ───
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-slide-up">
      <button onClick={() => setPage('home')} className="btn-ghost mb-4 flex items-center gap-1">
        <ArrowLeft size={18} /> Accueil
      </button>
      <h1 className="text-2xl font-extrabold text-navy-900 mb-1">Listes de fournitures</h1>
      <p className="text-gray-500 mb-6">Des listes prêtes à l'emploi ou créez la vôtre</p>

      <button onClick={() => setShowCreateModal(true)} className="btn-primary mb-6 flex items-center gap-2">
        <Plus size={18} /> Créer ma liste
      </button>

      <div className="grid sm:grid-cols-2 gap-4">
        {lists.map((list) => {
          const Icon = LIST_ICONS[list.icon] || Package;
          const listTotal = list.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
          const listAvail = list.items.filter((i) => i.available !== false).length;
          return (
            <button
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className="card p-5 text-left hover:shadow-float transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-sm">{list.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{list.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{list.items.length} articles · {listAvail} disponibles</span>
                <span className="font-bold text-navy-900">{formatFCFA(listTotal)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Create list modal */}
      {showCreateModal && (
        <CreateListModal onClose={() => setShowCreateModal(false)} onCreate={createNewList} />
      )}
    </div>
  );
}

function CreateListModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy-900 text-lg">Nouvelle liste</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <label className="label-text">Nom de la liste</label>
        <input
          className="input-field"
          placeholder="Ex: Ma liste de courses"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button
          onClick={() => name.trim() && onCreate(name.trim())}
          disabled={!name.trim()}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={18} /> Créer la liste
        </button>
      </div>
    </div>
  );
}
