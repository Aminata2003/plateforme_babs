import { useEffect, useState } from "react";
import { submissionsApi } from "../../api/courses.js";

export default function AdminDevoirs() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyPending, setOnlyPending] = useState(true);

  function load() {
    setLoading(true);
    return submissionsApi.mine().then(({ data }) => setSubmissions(data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = onlyPending ? submissions.filter((s) => s.grade == null) : submissions;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="eyebrow">Espace propriétaire</p>
      <h1 className="mt-3 text-3xl font-bold">Devoirs</h1>
      <p className="mt-2 text-slate">
        {submissions.filter((s) => s.grade == null).length} devoir(s) en attente de correction.
      </p>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-dark">
        <input
          type="checkbox"
          checked={onlyPending}
          onChange={(e) => setOnlyPending(e.target.checked)}
          className="h-4 w-4 accent-signal"
        />
        N'afficher que les devoirs non corrigés
      </label>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate">Chargement…</p>}
        {!loading && visible.length === 0 && (
          <p className="text-sm text-slate">Rien à corriger pour le moment 🎉</p>
        )}
        {visible.map((s) => (
          <SubmissionCard key={s.id} submission={s} onGraded={load} />
        ))}
      </div>
    </div>
  );
}

function SubmissionCard({ submission, onGraded }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);

  async function handleGrade(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await submissionsApi.grade(submission.id, { grade: Number(grade), feedback });
      await onGraded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-navy">{submission.devoir_title}</p>
          <p className="text-xs text-slate">{submission.user_full_name}</p>
        </div>
        <a
          href={submission.file}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-signal hover:underline"
        >
          Voir le rendu →
        </a>
      </div>

      {submission.comment && (
        <p className="mt-2 text-xs text-slate-dark">« {submission.comment} »</p>
      )}

      <form onSubmit={handleGrade} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          max={submission.devoir_max_score}
          required
          placeholder={`/ ${submission.devoir_max_score}`}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-20 rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs outline-none focus:border-signal"
        />
        <input
          type="text"
          placeholder="Commentaire au sujet du travail…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1 rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs outline-none focus:border-signal"
        />
        <button
          type="submit"
          disabled={saving}
          className="whitespace-nowrap rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-signal disabled:opacity-60"
        >
          {saving ? "…" : submission.grade != null ? "Mettre à jour" : "Noter"}
        </button>
      </form>
    </div>
  );
}
