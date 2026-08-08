import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  modulesApi, lessonsApi, quizzesApi, questionsApi, choicesApi, devoirsApi, submissionsApi,
} from "../../api/courses.js";

export default function AdminModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);

  function reload() {
    return Promise.all([modulesApi.detail(id), devoirsApi.listByModule(id)]).then(
      ([moduleRes, devoirsRes]) => {
        setModule(moduleRes.data);
        setDevoirs(devoirsRes.data);
      }
    );
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement le module « ${module.title} » et tout son contenu ?`)) return;
    await modulesApi.remove(id);
    navigate("/admin/modules");
  }

  if (loading) return <p className="px-8 py-12 font-mono text-sm text-slate">Chargement…</p>;
  if (!module) return <p className="px-8 py-12 text-red-600">Module introuvable.</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/admin/modules" className="text-sm font-medium text-signal hover:underline">
        ← Tous les modules
      </Link>
      <p className="eyebrow mt-4">Gestion du module</p>

      <ModuleHeader module={module} onChanged={reload} onDelete={handleDelete} />

      {/* Leçons */}
      <section className="mt-10">
        <h2 className="text-lg font-bold">Leçons</h2>
        <div className="mt-4 space-y-4">
          {module.lessons.map((lesson) => (
            <LessonBlock key={lesson.id} lesson={lesson} onChanged={reload} />
          ))}
          {module.lessons.length === 0 && (
            <p className="text-sm text-slate">Aucune leçon pour l'instant.</p>
          )}
        </div>
        <AddLessonForm moduleId={module.id} nextOrder={module.lessons.length + 1} onCreated={reload} />
      </section>

      {/* Devoirs */}
      <section className="mt-12">
        <h2 className="text-lg font-bold">Devoirs</h2>
        <div className="mt-4 space-y-3">
          {devoirs.map((d) => (
            <DevoirAdminBlock key={d.id} devoir={d} />
          ))}
          {devoirs.length === 0 && <p className="text-sm text-slate">Aucun devoir pour l'instant.</p>}
        </div>
        <AddDevoirForm moduleId={module.id} onCreated={reload} />
      </section>
    </div>
  );
}

/* ---------- En-tête du module : modifier / supprimer ---------- */

function ModuleHeader({ module, onChanged, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: module.title, description: module.description,
    order: module.order, is_published: module.is_published,
  });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await modulesApi.update(module.id, form);
      setEditing(false);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mt-4 space-y-3 rounded-xl2 border border-navy/8 bg-white p-6">
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-dark">
            Ordre
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value))}
              className="ml-2 w-16 rounded-lg border border-navy/15 px-2 py-1.5 text-sm outline-none focus:border-signal"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-dark">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update("is_published", e.target.checked)}
              className="h-3.5 w-3.5 accent-signal"
            />
            Publié
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full bg-paper px-5 py-2 text-sm font-semibold text-slate-dark hover:bg-navy/10"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <p className="mt-1 text-sm text-slate">{module.description}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/10"
        >
          Modifier
        </button>
        <button
          onClick={onDelete}
          className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

/* ---------- Leçon + son quiz ---------- */

function LessonBlock({ lesson, onChanged }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-semibold text-navy">{lesson.title}</p>
          <p className="text-xs text-slate">
            {lesson.is_published ? "Publiée" : "Brouillon"} · {lesson.quiz ? "Quiz configuré" : "Sans quiz"}
          </p>
        </div>
        <span className="text-slate">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 border-t border-navy/8 pt-4">
          {lesson.quiz ? (
            <QuizManager quiz={lesson.quiz} onChanged={onChanged} />
          ) : (
            <CreateQuizForm lessonId={lesson.id} onCreated={onChanged} />
          )}
        </div>
      )}
    </div>
  );
}

function CreateQuizForm({ lessonId, onCreated }) {
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(50);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await quizzesApi.create({ lesson: lessonId, title, passing_score: passingScore });
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="text-xs font-medium text-slate-dark">Titre du quiz</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-dark">Score minimum (%)</span>
        <input
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(e) => setPassingScore(Number(e.target.value))}
          className="mt-1 w-24 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Création…" : "Créer le quiz"}
      </button>
    </form>
  );
}

function QuizManager({ quiz, onChanged }) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy">{quiz.title}</p>
      <div className="mt-3 space-y-4">
        {quiz.questions.map((q, i) => (
          <QuestionBlock key={q.id} question={q} index={i + 1} onChanged={onChanged} />
        ))}
      </div>
      <AddQuestionForm quizId={quiz.id} nextOrder={quiz.questions.length + 1} onCreated={onChanged} />
    </div>
  );
}

function QuestionBlock({ question, index, onChanged }) {
  return (
    <div className="rounded-lg bg-paper p-3">
      <p className="text-sm font-medium text-navy">
        {index}. {question.text}
      </p>
      <ul className="mt-2 space-y-1">
        {question.choices.map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-xs text-slate-dark">
            <span className={c.is_correct ? "text-success" : "text-slate"}>
              {c.is_correct ? "✓" : "•"}
            </span>
            {c.text}
          </li>
        ))}
      </ul>
      <AddChoiceForm questionId={question.id} onCreated={onChanged} />
    </div>
  );
}

function AddQuestionForm({ quizId, nextOrder, onCreated }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await questionsApi.create({ quiz: quizId, text, order: nextOrder });
      setText("");
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        required
        placeholder="Nouvelle question…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <button
        type="submit"
        disabled={saving}
        className="whitespace-nowrap rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
      >
        Ajouter
      </button>
    </form>
  );
}

function AddChoiceForm({ questionId, onCreated }) {
  const [text, setText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await choicesApi.create({ question: questionId, text, is_correct: isCorrect });
      setText("");
      setIsCorrect(false);
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
      <input
        required
        placeholder="Choix de réponse…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-lg border border-navy/10 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-signal"
      />
      <label className="flex items-center gap-1 text-xs text-slate-dark">
        <input
          type="checkbox"
          checked={isCorrect}
          onChange={(e) => setIsCorrect(e.target.checked)}
          className="h-3.5 w-3.5 accent-success"
        />
        Correct
      </label>
      <button
        type="submit"
        disabled={saving}
        className="whitespace-nowrap rounded-full bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/20 disabled:opacity-60"
      >
        +
      </button>
    </form>
  );
}

/* ---------- Devoir + ses rendus (admin) ---------- */

function DevoirAdminBlock({ devoir }) {
  const [open, setOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  function loadSubmissions() {
    setLoading(true);
    submissionsApi
      .byDevoir(devoir.id)
      .then(({ data }) => setSubmissions(data))
      .finally(() => setLoading(false));
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) loadSubmissions();
  }

  return (
    <div className="rounded-xl2 border border-navy/8 bg-white p-5">
      <button onClick={toggle} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-semibold text-navy">{devoir.title}</p>
          <p className="text-xs text-slate">{devoir.instructions}</p>
        </div>
        <span className="text-slate">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-navy/8 pt-4">
          {loading && <p className="text-sm text-slate">Chargement…</p>}
          {!loading && submissions.length === 0 && (
            <p className="text-sm text-slate">Aucun rendu pour l'instant.</p>
          )}
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} maxScore={devoir.max_score} onGraded={loadSubmissions} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission, maxScore, onGraded }) {
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
    <div className="rounded-lg bg-paper p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">{submission.user_full_name}</p>
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
        <p className="mt-1.5 text-xs text-slate-dark">« {submission.comment} »</p>
      )}

      <form onSubmit={handleGrade} className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          max={maxScore}
          required
          placeholder={`/ ${maxScore}`}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-20 rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-signal"
        />
        <input
          type="text"
          placeholder="Commentaire au sujet du travail…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1 rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-signal"
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

/* ---------- Ajout de leçon ---------- */

function AddLessonForm({ moduleId, nextOrder, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", youtube_url: "", duration_minutes: 10,
    order: nextOrder, is_published: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await lessonsApi.create({ ...form, module: moduleId });
      setForm({
        title: "", description: "", youtube_url: "", duration_minutes: 10,
        order: nextOrder + 1, is_published: false,
      });
      await onCreated();
    } catch (err) {
      setError("Impossible de créer la leçon. Vérifie les champs.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 rounded-xl2 border border-dashed border-navy/20 p-5">
      <p className="text-sm font-semibold text-navy">Ajouter une leçon</p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <input
        required
        placeholder="Titre de la leçon"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <textarea
        placeholder="Description"
        rows={2}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <input
        required
        placeholder="Lien YouTube"
        value={form.youtube_url}
        onChange={(e) => update("youtube_url", e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-slate-dark">
          Durée (min)
          <input
            type="number"
            min={1}
            value={form.duration_minutes}
            onChange={(e) => update("duration_minutes", Number(e.target.value))}
            className="ml-2 w-20 rounded-lg border border-navy/15 px-2 py-1.5 text-sm outline-none focus:border-signal"
          />
        </label>
        <label className="text-xs text-slate-dark">
          Ordre
          <input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => update("order", Number(e.target.value))}
            className="ml-2 w-16 rounded-lg border border-navy/15 px-2 py-1.5 text-sm outline-none focus:border-signal"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-dark">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => update("is_published", e.target.checked)}
            className="h-3.5 w-3.5 accent-signal"
          />
          Publier
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Création…" : "Ajouter la leçon"}
      </button>
    </form>
  );
}

/* ---------- Ajout de devoir ---------- */

function AddDevoirForm({ moduleId, onCreated }) {
  const [form, setForm] = useState({ title: "", instructions: "", max_score: 10, deadline: "" });
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await devoirsApi.create({
        ...form,
        module: moduleId,
        deadline: form.deadline || null,
      });
      setForm({ title: "", instructions: "", max_score: 10, deadline: "" });
      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 rounded-xl2 border border-dashed border-navy/20 p-5">
      <p className="text-sm font-semibold text-navy">Ajouter un devoir</p>
      <input
        required
        placeholder="Titre du devoir"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <textarea
        required
        placeholder="Instructions"
        rows={2}
        value={form.instructions}
        onChange={(e) => update("instructions", e.target.value)}
        className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-signal"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-slate-dark">
          Note max
          <input
            type="number"
            min={1}
            value={form.max_score}
            onChange={(e) => update("max_score", Number(e.target.value))}
            className="ml-2 w-20 rounded-lg border border-navy/15 px-2 py-1.5 text-sm outline-none focus:border-signal"
          />
        </label>
        <label className="text-xs text-slate-dark">
          Échéance
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
            className="ml-2 rounded-lg border border-navy/15 px-2 py-1.5 text-sm outline-none focus:border-signal"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-signal disabled:opacity-60"
      >
        {saving ? "Création…" : "Ajouter le devoir"}
      </button>
    </form>
  );
}