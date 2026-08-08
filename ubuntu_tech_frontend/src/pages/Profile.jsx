import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../api/auth.js";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("phone", form.phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      await authApi.updateMe(formData);
      await refreshUser();
      setSaved(true);
    } catch {
      setError("Impossible d'enregistrer les modifications. Vérifie les champs.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <p className="eyebrow">Mon compte</p>
      <h1 className="mt-3 text-3xl font-bold">Mon profil</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {saved && (
          <p className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            Profil mis à jour avec succès.
          </p>
        )}

        {/* Photo de profil */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-signal/10 font-mono text-xl font-semibold text-signal">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Photo de profil" className="h-full w-full object-cover" />
            ) : (
              <>
                {form.first_name?.[0]}
                {form.last_name?.[0]}
              </>
            )}
          </div>
          <label className="cursor-pointer rounded-full bg-paper px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/10">
            Changer la photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-dark">Prénom</span>
            <input
              required
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-dark">Nom</span>
            <input
              required
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-dark">Téléphone</span>
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-signal"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-dark">Email</span>
          <input
            disabled
            value={user?.email || ""}
            className="mt-1.5 w-full rounded-lg border border-navy/10 bg-paper px-4 py-2.5 text-sm text-slate outline-none"
          />
          <span className="mt-1 block text-xs text-slate">L'email ne peut pas être modifié.</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
