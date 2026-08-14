import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/courses.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError("Impossible de charger les statistiques."));
  }, []);

  if (error) return <p className="mx-auto max-w-4xl px-6 py-20 text-red-600">{error}</p>;
  if (!stats) return <p className="mx-auto max-w-4xl px-6 py-20 font-mono text-sm text-slate">Chargement…</p>;

  const maxWeekCount = Math.max(1, ...stats.enrollments_evolution.map((e) => e.count));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Évolution des apprenants</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Apprenants" value={stats.total_apprenants} to="/admin/apprenants" />
        <StatCard label="Inscriptions actives" value={stats.active_enrollments} to="/admin/apprenants" />
        <StatCard label="Score moyen quiz" value={`${stats.quiz_avg_score}%`} />
        <StatCard label="Devoirs à corriger" value={stats.pending_submissions} accent to="/admin/devoirs" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Évolution des inscriptions */}
        <div className="rounded-xl2 border border-navy/8 bg-white p-6">
          <h2 className="font-bold">Inscriptions par semaine</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {stats.enrollments_evolution.length === 0 && (
              <p className="text-sm text-slate">Pas encore de données.</p>
            )}
            {stats.enrollments_evolution.map((e) => (
              <div key={e.week} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-signal"
                  style={{ height: `${(e.count / maxWeekCount) * 100}%`, minHeight: 4 }}
                />
                <span className="font-mono text-[10px] text-slate">
                  {new Date(e.week).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progression par module */}
        <div className="rounded-xl2 border border-navy/8 bg-white p-6">
          <h2 className="font-bold">Progression moyenne par module</h2>
          <div className="mt-5 space-y-4">
            {stats.modules_progress.map((m) => (
              <div key={m.module}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-dark">{m.module}</span>
                  <span className="font-mono text-xs text-signal">{m.avg_completion}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                  <div className="h-full rounded-full bg-signal" style={{ width: `${m.avg_completion}%` }} />
                </div>
              </div>
            ))}
            {stats.modules_progress.length === 0 && (
              <p className="text-sm text-slate">Aucun module publié pour le moment.</p>
            )}
          </div>
        </div>
      </div>

      {/* Prochaines sessions */}
      <div className="mt-8 rounded-xl2 border border-navy/8 bg-white p-6">
        <h2 className="font-bold">Prochaines sessions planifiées</h2>
        <div className="mt-4 space-y-2">
          {stats.upcoming_sessions.length === 0 && (
            <p className="text-sm text-slate">Aucune session à venir.</p>
          )}
          {stats.upcoming_sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-paper p-3 text-sm">
              <span className="font-medium text-navy">{s.title}</span>
              <span className="font-mono text-xs text-slate">
                {new Date(s.scheduled_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, to }) {
  const content = (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5 transition hover:shadow-card">
      <p className="font-mono text-xs text-slate">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? "text-gold" : "text-navy"}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
