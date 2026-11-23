import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Minus, PackageOpen } from 'lucide-react';
import { request } from '../api';
import { money } from '../utils';
import { useToast } from './Toast';
import StatusBadge from './StatusBadge';
import ProductModal from './ProductModal';
import ConfirmModal from './ConfirmModal';

const PAGE_SIZE = 8;

export default function Products() {
  const toast = useToast();
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });

  const [modal, setModal] = useState(null); // null | { product?: {...} }
  const [deleting, setDeleting] = useState(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadCategories = useCallback(() => {
    request('/products/categories').then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE, sort: sort.field, order: sort.order });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      const res = await request(`/products?${params}`);
      setData(res);
      if (res.page !== page) setPage(res.page);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status, sort, toast]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const toggleSort = (field) => {
    setSort((s) => (s.field === field ? { field, order: s.order === 'asc' ? 'desc' : 'asc' } : { field, order: 'asc' }));
    setPage(1);
  };

  const save = async (form) => {
    if (modal.product) {
      await request(`/products/${modal.product._id}`, { method: 'PUT', body: form });
      toast('Product updated');
    } else {
      await request('/products', { method: 'POST', body: form });
      toast('Product added');
    }
    setModal(null);
    load();
    loadCategories();
  };

  const adjust = async (p, delta) => {
    try {
      const updated = await request(`/products/${p._id}/stock`, { method: 'PATCH', body: { delta } });
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === p._id ? updated : x)) }));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async () => {
    try {
      await request(`/products/${deleting._id}`, { method: 'DELETE' });
      toast('Product deleted');
      setDeleting(null);
      load();
      loadCategories();
    } catch (err) {
      toast(err.message, 'error');
      setDeleting(null);
    }
  };

  const SortHeader = ({ field, children, className = '' }) => (
    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 hover:text-slate-800">
        {children}
        {sort.field === field && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>
    </th>
  );

  const from = data.total === 0 ? 0 : (data.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(data.page * PAGE_SIZE, data.total);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, SKU or supplier…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="input sm:w-44" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="input sm:w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <Plus size={16} /> Add product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortHeader field="name">Product</SortHeader>
                <SortHeader field="category">Category</SortHeader>
                <SortHeader field="price">Price</SortHeader>
                <SortHeader field="quantity">Stock</SortHeader>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${loading ? 'opacity-60' : ''}`}>
              {data.items.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sku}{p.supplier ? ` · ${p.supplier}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.category}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">{money(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center rounded-lg border border-slate-200">
                      <button className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" onClick={() => adjust(p, -1)} disabled={p.quantity === 0} aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-medium text-slate-900">{p.quantity}</span>
                      <button className="p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => adjust(p, 1)} aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge product={p} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600" onClick={() => setModal({ product: p })} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => setDeleting(p)} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && data.items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <PackageOpen size={36} />
            <p className="text-sm">No products found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            {from}–{to} of {data.total}
          </span>
          <div className="flex items-center gap-1">
            <button className="btn btn-secondary !px-2 !py-1.5" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)} aria-label="Previous page">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">
              Page {data.page} / {data.pages}
            </span>
            <button className="btn btn-secondary !px-2 !py-1.5" disabled={data.page >= data.pages} onClick={() => setPage(data.page + 1)} aria-label="Next page">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modal && <ProductModal product={modal.product} categories={categories} onSave={save} onClose={() => setModal(null)} />}
      {deleting && (
        <ConfirmModal
          title="Delete product?"
          message={`"${deleting.name}" will be permanently removed from your inventory.`}
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
