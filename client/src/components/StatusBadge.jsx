import { statusOf } from '../utils';

const STYLES = {
  in: { label: 'In stock', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  low: { label: 'Low stock', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  out: { label: 'Out of stock', cls: 'bg-rose-50 text-rose-700 ring-rose-600/20', dot: 'bg-rose-500' },
};

export default function StatusBadge({ product }) {
  const s = STYLES[statusOf(product)];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
