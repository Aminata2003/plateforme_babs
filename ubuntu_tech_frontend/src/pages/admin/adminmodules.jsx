import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { modulesApi } from "../../api/courses.js";

const emptyForm = { title: "", description: "", order: 1, is_published: false };

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function loadModules() {
    return modulesApi.list().then(({ data }) => setModules(data));
  }

  useEffect(() => {
    loadModules().finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await modulesApi.create(form);
      setForm(emptyForm);
      await loadModules();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Impossible de créer le module.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Ajouter un module</h1>
      <p className="mt-2 text-slate">
        Les leçons, vidéos, quiz et devoirs de chaque module se gèrent depuis
        l'administration Django (`/admin/`).
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl2 border border-navy/8 bg-white p-6">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <label className="block">
          <span className="text-sm font-medium text-slate-dark">Titre</span>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-dark">Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-dark">Ordre</span>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-2.5">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update("is_published", e.target.checked)}
              className="h-4 w-4 accent-signal"
            />
            <span className="text-sm text-slate-dark">Publier immédiatement</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Création…" : "Créer le module"}
        </button>
      </form>

      <h2 className="mt-12 text-lg font-bold">Modules existants</h2>
      <div className="mt-4 overflow-hidden rounded-xl2 border border-navy/8 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate">Chargement…</p>
        ) : modules.length === 0 ? (
          <p className="p-5 text-sm text-slate">Aucun module créé pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-b border-navy/5 last:border-0 hover:bg-paper">
                  <td className="px-5 py-3 font-mono text-xs text-slate">{m.order}</td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/modules/${m.id}`} className="font-medium text-navy hover:text-signal hover:underline">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-dark">{m.lessons_count} leçon(s)</td>
                  <td className="px-5 py-3 text-right">
                    <span className={m.is_published ? "text-success" : "text-slate"}>
                      {m.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
