import { useEffect, useState } from "react";
import { liveSessionsApi, modulesApi } from "../../api/courses.js";

const emptyForm = {
  type: "rencontre", title: "", description: "", module: "",
  scheduled_at: "", duration_minutes: 60, meeting_link: "", requires_registration: false,
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    return liveSessionsApi.list().then(({ data }) => setSessions(data));
  }

  useEffect(() => {
    Promise.all([load(), modulesApi.list().then(({ data }) => setModules(data))]).finally(() =>
      setLoading(false)
    );
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await liveSessionsApi.create({
        ...form,
        module: form.module || null,
        requires_registration: form.type === "bootcamp" ? true : form.requires_registration,
      });
      setForm(emptyForm);
      await load();
    } catch {
      setError("Impossible de créer la session. Vérifie les champs (notamment la date).");
    } finally {
      setSaving(false);
    }
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Rencontres &amp; bootcamps</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl2 border border-navy/8 bg-white p-6">
        <p className="text-sm font-semibold text-navy">Planifier une session</p>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            >
              <option value="rencontre">Rencontre hebdomadaire</option>
              <option value="bootcamp">Bootcamp mensuel</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Module concerné (optionnel)</span>
            <select
              value={form.module}
              onChange={(e) => update("module", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            >
              <option value="">—</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Titre</span>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Description</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Date et heure</span>
            <input
              type="datetime-local"
              required
              value={form.scheduled_at}
              onChange={(e) => update("scheduled_at", e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-dark">Durée (min)</span>
            <input
              type="number"
              min={5}
              value={form.duration_minutes}
              onChange={(e) => update("duration_minutes", Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-slate-dark">Lien de la visio (Zoom/Meet/Jitsi)</span>
          <input
            required
            value={form.meeting_link}
            onChange={(e) => update("meeting_link", e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </label>

        {form.type === "rencontre" && (
          <label className="flex items-center gap-2 text-xs text-slate-dark">
            <input
              type="checkbox"
              checked={form.requires_registration}
              onChange={(e) => update("requires_registration", e.target.checked)}
              className="h-3.5 w-3.5 accent-signal"
            />
            Inscription requise (sinon ouvert à tous les inscrits)
          </label>
        )}
        {form.type === "bootcamp" && (
          <p className="text-xs text-slate">L'inscription est automatiquement requise pour un bootcamp.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Création…" : "Planifier la session"}
        </button>
      </form>

      <h2 className="mt-12 text-lg font-bold">Sessions planifiées</h2>
      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-slate">Chargement…</p>}
        {!loading && sorted.length === 0 && <p className="text-sm text-slate">Aucune session pour le moment.</p>}
        {sorted.map((s) => (
          <SessionAdminCard key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}

function SessionAdminCard({ session }) {
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && participants.length === 0) {
      setLoading(true);
      liveSessionsApi.participants(session.id).then(({ data }) => setParticipants(data)).finally(() => setLoading(false));
    }
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <button onClick={toggle} className="flex w-full items-center justify-between text-left">
        <div>
          <span className={`font-mono text-[11px] uppercase ${session.type === "bootcamp" ? "text-gold" : "text-signal"}`}>
            {session.type === "bootcamp" ? "Bootcamp" : "Rencontre"}
          </span>
          <p className="mt-1 font-semibold text-navy">{session.title}</p>
          <p className="font-mono text-xs text-slate">
            {new Date(session.scheduled_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
            {" · "}{session.registrations_count} inscrit(s)
          </p>
        </div>
        <span className="text-slate">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 border-t border-navy/8 pt-4">
          {loading && <p className="text-sm text-slate">Chargement…</p>}
          {!loading && participants.length === 0 && (
            <p className="text-sm text-slate">Aucune inscription pour l'instant.</p>
          )}
          <ul className="space-y-1.5">
            {participants.map((p) => (
              <li key={p.id} className="text-sm text-slate-dark">
                Utilisateur #{p.user} — inscrit le{" "}
                {new Date(p.registered_at).toLocaleDateString("fr-FR")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
