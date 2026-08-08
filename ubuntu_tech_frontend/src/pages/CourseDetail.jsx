import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { modulesApi, devoirsApi, submissionsApi, quizzesApi, lessonsApi } from "../api/courses.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [devoirs, setDevoirs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      modulesApi.detail(id),
      devoirsApi.listByModule(id),
      submissionsApi.mine(),
    ])
      .then(([moduleRes, devoirsRes, submissionsRes]) => {
        if (cancelled) return;
        setModule(moduleRes.data);
        setDevoirs(devoirsRes.data);
        setSubmissions(submissionsRes.data);
        setActiveLessonId(moduleRes.data.lessons[0]?.id ?? null);
      })
      .catch(() => !cancelled && setError("Impossible de charger ce module."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="mx-auto max-w-4xl px-6 py-20 font-mono text-sm text-slate">Chargement…</p>;
  }
  if (error || !module) {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-red-600">{error || "Module introuvable."}</p>;
  }

  const isEnrolled = user?.has_active_enrollment;
  const activeLesson = module.lessons.find((l) => l.id === activeLessonId) || module.lessons[0];

  function markLessonCompleted(lessonId) {
    setModule((m) => ({
      ...m,
      lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, is_completed: true } : l)),
    }));
  }

  function recordSubmission(newSubmission) {
    setSubmissions((subs) => [newSubmission, ...subs.filter((s) => s.devoir !== newSubmission.devoir)]);
  }

  if (!isEnrolled) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="eyebrow">{module.title}</p>
        <h1 className="mt-3 text-2xl font-bold">Accès réservé aux inscrit·es</h1>
        <p className="mt-3 text-slate">
          Ce module fait partie du forfait complet. Règle ton inscription pour
          débloquer les leçons, quiz et devoirs.
        </p>
        <Link
          to="/cours"
          className="mt-8 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-signal"
        >
          Voir les modalités d'accès
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/cours" className="text-sm font-medium text-signal hover:underline">
        ← Tous les modules
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{module.title}</h1>
      <p className="mt-2 text-slate">{module.description}</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar leçons */}
        <aside className="rounded-xl2 border border-navy/8 bg-white p-3 lg:sticky lg:top-24 lg:h-fit">
          {module.lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                activeLesson?.id === lesson.id
                  ? "bg-signal/10 font-medium text-signal"
                  : "text-slate-dark hover:bg-paper"
              }`}
            >
              {lesson.is_completed ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
              ) : (
                <span className="h-4 w-4 flex-shrink-0 rounded-full border border-navy/20" />
              )}
              <span className="truncate">{lesson.title}</span>
            </button>
          ))}
        </aside>

        {/* Contenu de la leçon active */}
        <div>
          {activeLesson ? (
            <LessonPanel
              lesson={activeLesson}
              onCompleted={() => markLessonCompleted(activeLesson.id)}
            />
          ) : (
            <p className="text-slate">Aucune leçon dans ce module pour le moment.</p>
          )}

          {/* Devoirs du module */}
          {devoirs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold">Devoirs</h2>
              <div className="mt-5 space-y-4">
                {devoirs.map((devoir) => (
                  <DevoirCard
                    key={devoir.id}
                    devoir={devoir}
                    submission={submissions.find((s) => s.devoir === devoir.id)}
                    onSubmitted={recordSubmission}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonPanel({ lesson, onCompleted }) {
  const [marking, setMarking] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const embedUrl = toYoutubeEmbed(lesson.youtube_url);

  async function handleMarkCompleted() {
    setMarking(true);
    try {
      await lessonsApi.markCompleted(lesson.id);
      onCompleted();
    } finally {
      setMarking(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl2 bg-navy shadow-card" style={{ aspectRatio: "16 / 9" }}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">Vidéo indisponible</div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{lesson.title}</h2>
          <p className="mt-1 text-sm text-slate">{lesson.description}</p>
        </div>
        <button
          onClick={handleMarkCompleted}
          disabled={lesson.is_completed || marking}
          className="whitespace-nowrap rounded-full bg-paper px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy/10 disabled:opacity-60"
        >
          {lesson.is_completed ? "✓ Terminée" : marking ? "…" : "Marquer comme terminée"}
        </button>
      </div>

      {lesson.quiz && (
        <div className="mt-8 rounded-xl2 border border-navy/8 bg-white p-6">
          <h3 className="text-lg font-bold">Quiz · {lesson.quiz.title}</h3>
          <QuizForm quiz={lesson.quiz} onResult={setQuizResult} />
          {quizResult && (
            <p
              className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
                quizResult.passed ? "bg-success/10 text-success" : "bg-red-50 text-red-600"
              }`}
            >
              Score : {quizResult.score}% — {quizResult.passed ? "Réussi 🎉" : "Non validé, retente ta chance"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function QuizForm({ quiz, onResult }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await quizzesApi.submitAttempt(quiz.id, answers);
      onResult(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-6">
      {quiz.questions.map((q) => (
        <fieldset key={q.id}>
          <legend className="text-sm font-medium text-navy">{q.text}</legend>
          <div className="mt-2 space-y-2">
            {q.choices.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-slate-dark">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={c.id}
                  checked={answers[q.id] === String(c.id)}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: String(c.id) }))}
                  className="h-4 w-4 accent-signal"
                />
                {c.text}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-signal px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-dark disabled:opacity-60"
      >
        {submitting ? "Envoi…" : "Valider mes réponses"}
      </button>
    </form>
  );
}

function DevoirCard({ devoir, submission, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("devoir", devoir.id);
      formData.append("file", file);
      formData.append("comment", comment);
      const { data } = await submissionsApi.submit(formData);
      onSubmitted(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{devoir.title}</h3>
          <p className="mt-1 text-sm text-slate">{devoir.instructions}</p>
        </div>
        {submission && (
          <span className="whitespace-nowrap rounded-full bg-signal/10 px-3 py-1 font-mono text-xs text-signal">
            {submission.grade != null ? `Note : ${submission.grade}/${devoir.max_score}` : "En attente de correction"}
          </span>
        )}
      </div>

      {submission?.feedback && (
        <p className="mt-3 rounded-lg bg-paper p-3 text-sm text-slate-dark">
          <span className="font-medium text-navy">Commentaire du formateur : </span>
          {submission.feedback}
        </p>
      )}

      {!submission && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-slate-dark"
          />
          <input
            type="text"
            placeholder="Commentaire (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
          />
          <button
            type="submit"
            disabled={submitting}
            className="whitespace-nowrap rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition hover:bg-signal disabled:opacity-60"
          >
            {submitting ? "Envoi…" : "Rendre le devoir"}
          </button>
        </form>
      )}
    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function toYoutubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get("v");
    if (!videoId && u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}