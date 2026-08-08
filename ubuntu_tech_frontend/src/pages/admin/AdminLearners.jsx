import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/courses.js";

export default function AdminLearners() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.learners().then(({ data }) => setLearners(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Apprenants</h1>
      <p className="mt-2 text-slate">{learners.length} apprenant(s) inscrit(s) sur la plateforme.</p>

      <div className="mt-8 overflow-hidden rounded-xl2 border border-navy/8 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate">Chargement…</p>
        ) : learners.length === 0 ? (
          <p className="p-5 text-sm text-slate">Aucun apprenant pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/8 text-left text-xs text-slate">
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Inscription</th>
                <th className="px-5 py-3 font-medium">Progression</th>
                <th className="px-5 py-3 font-medium">Score quiz</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l.id} className="border-b border-navy/5 last:border-0 hover:bg-paper">
                  <td className="px-5 py-3">
                    <Link
                      to={`/admin/apprenants/${l.id}`}
                      className="font-medium text-navy hover:text-signal hover:underline"
                    >
                      {l.full_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-dark">{l.email}</td>
                  <td className="px-5 py-3">
                    <span className={l.has_active_enrollment ? "text-success" : "text-slate"}>
                      {l.has_active_enrollment ? "Active" : "Non payée"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{l.progress_pct}%</td>
                  <td className="px-5 py-3 font-mono text-xs">{l.quiz_avg_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
