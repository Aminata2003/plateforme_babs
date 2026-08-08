import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../api/auth.js";
import { Field } from "./Login.jsx";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.confirmPasswordReset({ uid, token, new_password: password });
      setDone(true);
      setTimeout(() => navigate("/connexion"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Ce lien n'est plus valide, redemande une réinitialisation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="eyebrow">Mot de passe</p>
      <h1 className="mt-3 text-3xl font-bold">Nouveau mot de passe</h1>

      {done ? (
        <p className="mt-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          Mot de passe mis à jour. Redirection vers la connexion…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <Field label="Nouveau mot de passe" type="password" required value={password} onChange={setPassword} />
          <p className="text-xs text-slate">8 caractères minimum.</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Mise à jour…" : "Valider le nouveau mot de passe"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate">
        <Link to="/connexion" className="font-semibold text-signal hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
