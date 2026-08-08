import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Field } from "./Login.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/tableau-de-bord", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const message = data
        ? Object.values(data).flat().join(" ")
        : "Une erreur est survenue lors de l'inscription.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="eyebrow">Bienvenue</p>
      <h1 className="mt-3 text-3xl font-bold">Créer mon compte</h1>
      <p className="mt-2 text-sm text-slate">
        Quelques infos et tu es prêt·e à commencer.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" required value={form.first_name} onChange={(v) => update("first_name", v)} />
          <Field label="Nom" required value={form.last_name} onChange={(v) => update("last_name", v)} />
        </div>
        <Field label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} />
        <Field label="Téléphone" value={form.phone} onChange={(v) => update("phone", v)} />
        <Field
          label="Mot de passe"
          type="password"
          required
          value={form.password}
          onChange={(v) => update("password", v)}
        />
        <p className="text-xs text-slate">8 caractères minimum.</p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Déjà inscrit·e ?{" "}
        <Link to="/connexion" className="font-semibold text-signal hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}