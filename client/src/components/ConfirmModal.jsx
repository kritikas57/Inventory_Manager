import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
