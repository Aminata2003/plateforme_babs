import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { modulesApi, paymentsApi } from "../api/courses.js";
import { useAuth } from "../context/AuthContext.jsx";

const PRICE_FCFA = 75000; // à remplacer par le tarif réel

export default function Courses() {
  const { user, refreshUser } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    modulesApi
      .list()
      .then(({ data }) => setModules(data))
      .catch(() => setError("Impossible de charger les modules pour le moment."))
      .finally(() => setLoading(false));
  }, []);

  async function handlePay() {
    setPaying(true);
    setError("");
    try {
      const { data } = await paymentsApi.initiate({
        itemName: "Formation Ubuntu Tech - Accès complet",
        amount: PRICE_FCFA,
      });
      window.location.href = data.redirect_url;
    } catch {
      setError("Le paiement n'a pas pu être initié. Réessaie dans un instant.");
      setPaying(false);
    }
  }

  const isEnrolled = user?.has_active_enrollment;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="eyebrow">Formation</p>
      <h1 className="mt-3 text-3xl font-bold md:text-4xl">Tous les modules</h1>
      <p className="mt-3 max-w-xl text-slate">
        Un seul accès débloque les 3 modules, les rencontres hebdomadaires et
        les bootcamps.
      </p>

      {!isEnrolled && (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-xl2 border border-gold/30 bg-gold/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-navy">Accès pas encore débloqué</p>
            <p className="mt-1 text-sm text-slate-dark">
              Règle le forfait unique pour accéder aux leçons, quiz et devoirs.
            </p>
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            className="whitespace-nowrap rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
          >
            {paying ? "Redirection…" : `Payer ${PRICE_FCFA.toLocaleString("fr-FR")} FCFA`}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="mt-10 font-mono text-sm text-slate">Chargement des modules…</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.id}
              to={`/cours/${m.id}`}
              className="group rounded-xl2 border border-navy/8 bg-white p-8 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="font-mono text-xs text-gold">
                Module {String(m.order).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-bold">{m.title}</h3>
              <p className="mt-2 text-sm text-slate">{m.description}</p>
              <p className="mt-5 text-sm font-medium text-signal">
                {m.lessons_count} leçon{m.lessons_count > 1 ? "s" : ""} →
              </p>
            </Link>
          ))}

          {modules.length === 0 && (
            <p className="text-sm text-slate">Aucun module publié pour le moment.</p>
          )}
        </div>
      )}
    </div>
  );
}