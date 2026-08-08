import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth.js";
import { Field } from "./Login.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
    } finally {
      setLoading(false);
      setSent(true); // toujours affiché, même si l'email est inconnu (sécurité)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="eyebrow">Mot de passe</p>
      <h1 className="mt-3 text-3xl font-bold">Mot de passe oublié</h1>

      {sent ? (
        <p className="mt-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate">
            Indique ton email, on t'envoie un lien pour choisir un nouveau mot de passe.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Field label="Email" type="email" required value={email} onChange={setEmail} />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate">
        <Link to="/connexion" className="font-semibold text-signal hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
