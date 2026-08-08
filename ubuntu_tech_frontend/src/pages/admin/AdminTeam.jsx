import { useEffect, useState } from "react";
import { usersApi } from "../../api/auth.js";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

const emptyForm = { first_name: "", last_name: "", email: "", phone: "", password: "", role: "formateur" };

export default function AdminTeam() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  function load() {
    return usersApi.list().then(({ data }) => setUsers(data.filter((u) => u.role !== "apprenant")));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await usersApi.create(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Impossible de créer ce compte.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await usersApi.remove(toDelete.id);
    setToDelete(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Équipe</h1>
      <p className="mt-2 text-slate">Ajoute des formateurs pour t'aider à corriger et gérer les contenus.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl2 border border-navy/8 bg-white p-6">
        <p className="text-sm font-semibold text-navy">Ajouter un membre</p>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Prénom"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
          <input
            required
            placeholder="Nom"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </div>
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <input
          placeholder="Téléphone"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <input
          required
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <select
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        >
          <option value="formateur">Formateur (peut corriger et gérer les contenus)</option>
          <option value="admin">Admin (accès complet, comme toi)</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Création…" : "Créer le compte"}
        </button>
      </form>

      <h2 className="mt-12 text-lg font-bold">Membres de l'équipe</h2>
      <div className="mt-4 overflow-hidden rounded-xl2 border border-navy/8 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate">Chargement…</p>
        ) : users.length === 0 ? (
          <p className="p-5 text-sm text-slate">Aucun autre membre pour l'instant.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-navy">{u.first_name} {u.last_name}</td>
                  <td className="px-5 py-3 text-slate-dark">{u.email}</td>
                  <td className="px-5 py-3 font-mono text-xs text-signal">{u.role}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setToDelete(u)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Retirer ce membre ?"
        message={toDelete ? `${toDelete.first_name} ${toDelete.last_name} n'aura plus accès à l'espace propriétaire.` : ""}
        confirmLabel="Retirer"
        danger
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
