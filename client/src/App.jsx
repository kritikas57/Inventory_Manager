import { useState } from 'react';
import { LayoutDashboard, Boxes, Menu, X, Package } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Products from './components/Products';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Boxes },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setPage(id);
    setOpen(false);
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-2 px-6 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <Package size={18} />
        </div>
        <span className="text-lg font-semibold tracking-tight">StockPilot</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              page === id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <p className="px-6 pb-5 text-xs text-slate-500">Inventory Manager v1.0</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-8">
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{NAV.find((n) => n.id === page).label}</h1>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-8">
          {page === 'dashboard' ? <Dashboard onNavigate={go} /> : <Products />}
        </main>
      </div>
    </div>
  );
}
