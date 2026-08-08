import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || "/tableau-de-bord";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <p className="eyebrow">Bon retour</p>
      <h1 className="mt-3 text-3xl font-bold">Connexion</h1>
      <p className="mt-2 text-sm text-slate">
        Accède à ton espace Ubuntu Tech.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        />
        <Field
          label="Mot de passe"
          type="password"
          required
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
        />
        <p className="text-right">
          <Link to="/mot-de-passe-oublie" className="text-xs font-medium text-signal hover:underline">
            Mot de passe oublié ?
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-semibold text-signal hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-dark">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={isPassword && show ? "text" : type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 pr-11 text-sm text-navy outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate hover:text-navy"
            tabIndex={-1}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <EyeIcon open={show} className="h-4 w-4" />
          </button>
        )}
      </div>
    </label>
  );
}

function EyeIcon({ open, ...props }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 10.6a2.5 2.5 0 003.5 3.5M6.6 6.7C4.3 8.2 2.7 10.3 2 12c1.6 3.6 5.3 7 10 7 1.7 0 3.3-.4 4.7-1.1M9.9 4.2A10.6 10.6 0 0112 4c4.7 0 8.4 3.4 10 7-.5 1.2-1.3 2.5-2.3 3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M2 12c1.6-3.6 5.3-7 10-7s8.4 3.4 10 7c-1.6 3.6-5.3 7-10 7s-8.4-3.4-10-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
