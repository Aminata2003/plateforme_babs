export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirmer", danger, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
      <div className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-lift">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        {message && <p className="mt-2 text-sm text-slate">{message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-slate-dark hover:bg-navy/10"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-navy hover:bg-signal"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
