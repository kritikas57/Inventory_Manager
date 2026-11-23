import { useEffect, useState } from 'react';
import { Package, Wallet, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { request } from '../api';
import { money, number } from '../utils';
import StatusBadge from './StatusBadge';

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
};

function StatCard({ label, value, hint, icon: Icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${TONES[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/products/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  if (!stats)
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );

  const maxValue = Math.max(...stats.byCategory.map((c) => c.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={number(stats.totalProducts)} hint={`${number(stats.totalUnits)} units on hand`} icon={Package} tone="indigo" />
        <StatCard label="Inventory value" value={money(stats.totalValue)} hint="Price × quantity" icon={Wallet} tone="emerald" />
        <StatCard label="Low stock" value={number(stats.lowStock)} hint="At or below threshold" icon={AlertTriangle} tone="amber" />
        <StatCard label="Out of stock" value={number(stats.outOfStock)} hint="Needs restocking" icon={XCircle} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Category breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Value by category</h2>
          <p className="text-sm text-slate-500">Share of total inventory value</p>
          <div className="mt-5 space-y-4">
            {stats.byCategory.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
            {stats.byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.category}</span>
                  <span className="text-slate-500">{money(c.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.value / maxValue) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {c.count} product{c.count === 1 ? '' : 's'} · {number(c.units)} units
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Needs attention */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Needs attention</h2>
              <p className="text-sm text-slate-500">Lowest stock first</p>
            </div>
            <button onClick={() => onNavigate('products')} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight size={16} />
            </button>
          </div>
          {stats.attention.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-slate-400">Everything is well stocked. 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.attention.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.sku} · {p.quantity} left (min {p.lowStockThreshold})
                    </p>
                  </div>
                  <StatusBadge product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
