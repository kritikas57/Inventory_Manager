import { useState } from 'react';
import { X } from 'lucide-react';

export default function ProductModal({ product, categories, onSave, onClose }) {
  const editing = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
    lowStockThreshold: product?.lowStockThreshold ?? 10,
    supplier: product?.supplier || '',
    description: product?.description || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) return setError('Name, SKU and category are required');
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    const threshold = Number(form.lowStockThreshold);
    if (form.price === '' || !(price >= 0)) return setError('Enter a valid price');
    if (form.quantity === '' || !Number.isInteger(quantity) || quantity < 0) return setError('Quantity must be a whole number, 0 or more');
    if (!Number.isInteger(threshold) || threshold < 0) return setError('Low stock threshold must be a whole number, 0 or more');

    setSaving(true);
    try {
      await onSave({ ...form, price, quantity, lowStockThreshold: threshold });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <form onSubmit={submit} className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit product' : 'Add product'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">{error}</div>}

          <div className="sm:col-span-2">
            <label className="label">Product name *</label>
            <input className="input" value={form.name} onChange={set('name')} maxLength={100} autoFocus />
          </div>
          <div>
            <label className="label">SKU *</label>
            <input className="input uppercase" value={form.sku} onChange={set('sku')} maxLength={40} placeholder="e.g. ELE-001" />
          </div>
          <div>
            <label className="label">Category *</label>
            <input className="input" list="category-list" value={form.category} onChange={set('category')} maxLength={50} />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label">Price *</label>
            <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} />
          </div>
          <div>
            <label className="label">Quantity *</label>
            <input className="input" type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} />
          </div>
          <div>
            <label className="label">Low stock threshold</label>
            <input className="input" type="number" min="0" step="1" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
          </div>
          <div>
            <label className="label">Supplier</label>
            <input className="input" value={form.supplier} onChange={set('supplier')} maxLength={100} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={set('description')} maxLength={500} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
