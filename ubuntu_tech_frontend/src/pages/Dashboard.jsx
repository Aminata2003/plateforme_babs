import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  modulesApi, quizzesApi, liveSessionsApi, certificatesApi,
} from "../api/courses.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: moduleList } = await modulesApi.list();
      const detailed = await Promise.all(
        moduleList.map((m) => modulesApi.detail(m.id).then((r) => r.data))
      );
      if (cancelled) return;
      setModules(detailed);

      quizzesApi.myAttempts().then(({ data }) => !cancelled && setQuizAttempts(data));
      liveSessionsApi.list().then(({ data }) => !cancelled && setSessions(data));
      certificatesApi
        .mine()
        .then(({ data }) => !cancelled && setCertificate(data))
        .catch(() => {}); // 404 = pas encore de certificat, c'est normal
    }

    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const [certError, setCertError] = useState("");

  async function handleGenerateCertificate() {
    setCertLoading(true);
    setCertError("");
    try {
      const { data } = await certificatesApi.generate();
      setCertificate(data);
    } catch (err) {
      setCertError(err.response?.data?.detail || "Impossible de générer le certificat pour le moment.");
    } finally {
      setCertLoading(false);
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-4xl px-6 py-20 font-mono text-sm text-slate">Chargement de ton espace…</p>;
  }

  const moduleProgress = modules.map((m) => {
    const total = m.lessons.length;
    const done = m.lessons.filter((l) => l.is_completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const status =
      total === 0 ? "Pas encore de contenu" : done === 0 ? "Non commencé" : done === total ? "Terminé" : "En cours";
    return { ...m, pct, status };
  });

  const allCompleted = moduleProgress.length > 0 && moduleProgress.every((m) => m.status === "Terminé");
  const upcomingSessions = sessions
    .filter((s) => new Date(s.scheduled_at) > new Date())
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="eyebrow">Mon espace</p>
      <h1 className="mt-3 text-3xl font-bold">
        Bonjour {user?.first_name} 👋
      </h1>

      {!user?.has_active_enrollment && (
        <div className="mt-6 rounded-xl2 border border-gold/30 bg-gold/10 p-5 text-sm">
          Ton inscription n'est pas encore active.{" "}
          <Link to="/cours" className="font-semibold text-navy underline">
            Régler le forfait
          </Link>{" "}
          pour débloquer les modules.
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Progression des modules */}
        <section className="lg:col-span-2">
          <h2 className="text-lg font-bold">Mes modules</h2>
          <div className="mt-4 space-y-4">
            {moduleProgress.map((m) => (
              <Link
                key={m.id}
                to={`/cours/${m.id}`}
                className="block rounded-xl2 border border-navy/8 bg-white p-5 transition hover:shadow-card"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy">{m.title}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                  <div
                    className={`h-full rounded-full ${m.status === "Terminé" ? "bg-success" : "bg-signal"}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </Link>
            ))}
            {moduleProgress.length === 0 && (
              <p className="text-sm text-slate">Aucun module disponible pour le moment.</p>
            )}
          </div>

          {/* Historique des quiz */}
          <h2 className="mt-10 text-lg font-bold">Mes quiz</h2>
          <div className="mt-4 overflow-hidden rounded-xl2 border border-navy/8 bg-white">
            {quizAttempts.length === 0 ? (
              <p className="p-5 text-sm text-slate">Aucun quiz passé pour le moment.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {quizAttempts.slice(0, 6).map((a) => (
                    <tr key={a.id} className="border-b border-navy/5 last:border-0">
                      <td className="px-5 py-3 text-slate-dark">
                        {new Date(a.submitted_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{a.score}%</td>
                      <td className="px-5 py-3 text-right">
                        <span className={a.passed ? "text-success" : "text-red-500"}>
                          {a.passed ? "Réussi" : "Non validé"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Colonne latérale : sessions + certificat */}
        <aside className="space-y-6">
          <div className="rounded-xl2 border border-navy/8 bg-white p-5">
            <h2 className="font-bold">Prochaines rencontres</h2>
            <div className="mt-4 space-y-3">
              {upcomingSessions.length === 0 && (
                <p className="text-sm text-slate">Rien de prévu pour l'instant.</p>
              )}
              {upcomingSessions.map((s) => (
                <div key={s.id} className="rounded-lg bg-paper p-3 text-sm">
                  <p className="font-medium text-navy">{s.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate">
                    {new Date(s.scheduled_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {s.meeting_link && (
                    <a
                      href={s.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-signal hover:underline"
                    >
                      Rejoindre →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl2 border border-navy/8 bg-white p-5">
            <h2 className="font-bold">Certificat</h2>
            {certificate ? (
              <a
                href={certificate.pdf_file}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-full bg-gold px-5 py-2.5 text-center text-sm font-semibold text-navy hover:bg-gold-light"
              >
                Télécharger mon certificat
              </a>
            ) : allCompleted ? (
              <>
                <button
                  onClick={handleGenerateCertificate}
                  disabled={certLoading}
                  className="mt-4 w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
                >
                  {certLoading ? "Génération…" : "Générer mon certificat"}
                </button>
                {certError && <p className="mt-2 text-xs text-red-600">{certError}</p>}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate">
                Termine tous les modules pour débloquer ton certificat.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Terminé": "bg-success/10 text-success",
    "En cours": "bg-signal/10 text-signal",
    "Non commencé": "bg-slate/10 text-slate",
    "Pas encore de contenu": "bg-slate/10 text-slate",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${styles[status]}`}>
      {status}
    </span>
  );
}
